
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search, Eye, Car, FileText, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { InspectionStatus, InspectionData } from "@/types/invoices";

const Inspections = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [inspections, setInspections] = useState<InspectionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<InspectionStatus | "all">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const fetchInspections = async () => {
    setLoading(true);
    try {
      const query = supabase
        .from('inspections')
        .select(`
          *,
          inspector:inspector_id(id, name),
          supervisor:supervisor_id(id, name),
          franchise:franchise_id(name),
          vehicle:vehicle_id(
            id, brand, model, license_plate,
            client:client_id(name)
          )
        `);
      
      if (statusFilter !== "all") {
        query.eq('status', statusFilter);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Cast the data to ensure compatibility with InspectionData[]
      const typedData = data.map(item => ({
        ...item,
        status: item.status as InspectionStatus,
        inspector: item.inspector || { name: 'Non assigné', id: '' },
        supervisor: item.supervisor || { name: null, id: null },
        vehicle: item.vehicle || {
          id: '',
          brand: 'Inconnu',
          model: 'Inconnu',
          license_plate: null,
          client: null
        },
        client_name: item.vehicle?.client?.name || 'Client inconnu',
        franchise_name: item.franchise?.name || 'Non assigné'
      })) as unknown as InspectionData[];
      
      setInspections(typedData);
    } catch (error) {
      console.error('Error fetching inspections:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les inspections",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInspections();
  }, [statusFilter]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('fr-FR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'validated': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch(status) {
      case 'draft': return 'Brouillon';
      case 'submitted': return 'Soumise';
      case 'validated': return 'Validée';
      case 'rejected': return 'Rejetée';
      case 'completed': return 'Terminée';
      default: return status;
    }
  };

  // Filter inspections based on search term
  const filteredInspections = inspections.filter(inspection => 
    (inspection.vehicle?.brand || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (inspection.vehicle?.model || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (inspection.vehicle?.license_plate || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (inspection.vehicle?.client?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (inspection.inspector?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredInspections.length / itemsPerPage);
  const currentInspections = filteredInspections.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Cards data
  const totalInspections = inspections.length;
  const draftCount = inspections.filter(i => i.status === 'draft').length;
  const submittedCount = inspections.filter(i => i.status === 'submitted').length;
  const validatedCount = inspections.filter(i => i.status === 'validated').length;
  const completedCount = inspections.filter(i => i.status === 'completed').length;

  // Can view?
  const canViewInspection = (inspection: InspectionData) => {
    if (!user) return false;
    
    // Admins, commercials can view all
    if (['admin', 'commercial'].includes(user.role)) return true;
    
    // Franchise managers can view their franchise's inspections
    if (user.role === 'franchise_manager' && user.franchises.some(f => f.id === inspection.franchise_id)) return true;
    
    // Supervisors can view inspections they supervise
    if (user.role === 'supervisor' && inspection.supervisor_id === user.id) return true;
    
    // Inspectors can view their own inspections
    if (user.role === 'inspector' && inspection.inspector_id === user.id) return true;
    
    return false;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Gestion des Inspections</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="cursor-pointer" onClick={() => setStatusFilter("all")}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">{totalInspections}</CardTitle>
            <CardDescription>Total</CardDescription>
          </CardHeader>
        </Card>
        
        <Card className="cursor-pointer" onClick={() => setStatusFilter("draft" as InspectionStatus)}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">{draftCount}</CardTitle>
            <CardDescription>Brouillons</CardDescription>
          </CardHeader>
        </Card>
        
        <Card className="cursor-pointer" onClick={() => setStatusFilter("submitted" as InspectionStatus)}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">{submittedCount}</CardTitle>
            <CardDescription>Soumises</CardDescription>
          </CardHeader>
        </Card>
        
        <Card className="cursor-pointer" onClick={() => setStatusFilter("validated" as InspectionStatus)}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">{validatedCount}</CardTitle>
            <CardDescription>Validées</CardDescription>
          </CardHeader>
        </Card>
        
        <Card className="cursor-pointer" onClick={() => setStatusFilter("completed" as InspectionStatus)}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">{completedCount}</CardTitle>
            <CardDescription>Terminées</CardDescription>
          </CardHeader>
        </Card>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div className="flex items-center space-x-2">
          <Select 
            value={statusFilter} 
            onValueChange={(value) => setStatusFilter(value as InspectionStatus | "all")}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrer par statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="draft">Brouillons</SelectItem>
              <SelectItem value="submitted">Soumises</SelectItem>
              <SelectItem value="validated">Validées</SelectItem>
              <SelectItem value="rejected">Rejetées</SelectItem>
              <SelectItem value="completed">Terminées</SelectItem>
            </SelectContent>
          </Select>
          
          {user?.role === 'inspector' && (
            <Button asChild className="flex items-center gap-2">
              <Link to="/nouvelle-inspection">
                <Car className="h-4 w-4 mr-1" />
                Nouvelle Inspection
              </Link>
            </Button>
          )}
        </div>
        
        <div className="flex items-center border rounded-md px-3 py-2 w-full sm:w-auto">
          <Search className="h-4 w-4 text-gray-400 mr-2" />
          <Input
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableCaption>Liste des inspections</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Véhicule</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Inspecteur</TableHead>
                  <TableHead>Franchise</TableHead>
                  <TableHead>Date création</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentInspections.length > 0 ? (
                  currentInspections.map((inspection) => (
                    <TableRow key={inspection.id}>
                      <TableCell className="font-medium">
                        {inspection.id.slice(0, 8)}...
                      </TableCell>
                      <TableCell>
                        {inspection.vehicle ? (
                          <div>
                            <div>{inspection.vehicle.brand} {inspection.vehicle.model}</div>
                            <div className="text-xs text-muted-foreground">
                              {inspection.vehicle.license_plate || 'Sans plaque'}
                            </div>
                          </div>
                        ) : (
                          'Véhicule inconnu'
                        )}
                      </TableCell>
                      <TableCell>
                        {inspection.vehicle?.client?.name || 'Client inconnu'}
                      </TableCell>
                      <TableCell>
                        {inspection.inspector?.name || 'Non assigné'}
                      </TableCell>
                      <TableCell>
                        {inspection.franchise?.name || 'Non assigné'}
                      </TableCell>
                      <TableCell>
                        {formatDate(inspection.created_at)}
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(inspection.status)}`}>
                          {getStatusText(inspection.status)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button variant="ghost" size="icon" aria-disabled={!canViewInspection(inspection)} onClick={() => {}}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          
                          {inspection.report_url && (
                            <Button variant="ghost" size="icon">
                              <FileText className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      Aucune inspection trouvée
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage(prev => Math.max(1, prev - 1));
                    }} 
                    aria-disabled={currentPage === 1}
                  />
                </PaginationItem>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <PaginationItem key={page}>
                    <PaginationLink 
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(page);
                      }} 
                      isActive={currentPage === page}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                
                <PaginationItem>
                  <PaginationNext 
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage(prev => Math.min(totalPages, prev + 1));
                    }} 
                    aria-disabled={currentPage === totalPages}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}
    </div>
  );
};

export default Inspections;
