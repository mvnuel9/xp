
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { SupervisorValidation, ValidationItem, ValidationStatus } from "@/types/validation";
import { InspectionData, InspectionDetail } from "@/types/inspections";
import { CheckCircle2, Clock, XCircle, Search, ChevronRight, AlertCircle, Image, CheckCircle, XCircle as XCircleIcon } from "lucide-react";

const ValidationSuperviseur = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [validations, setValidations] = useState<SupervisorValidation[]>([]);
  const [filteredValidations, setFilteredValidations] = useState<SupervisorValidation[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Current validation details
  const [selectedValidation, setSelectedValidation] = useState<SupervisorValidation | null>(null);
  const [inspectionDetails, setInspectionDetails] = useState<InspectionDetail[]>([]);
  const [validationItems, setValidationItems] = useState<ValidationItem[]>([]);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [currentDetailId, setCurrentDetailId] = useState<string | null>(null);
  const [rejectionComment, setRejectionComment] = useState("");

  // Fetch validations
  useEffect(() => {
    const fetchValidations = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        // For supervisor role, fetch only their own validations
        // For admin, commercial, etc., fetch all validations
        let query = supabase
          .from('supervisor_validations')
          .select(`
            *,
            inspection:inspections (
              *,
              vehicle:vehicles (
                brand,
                model,
                license_plate,
                client:clients (
                  name
                )
              ),
              franchise:franchises (
                name
              )
            )
          `)
          .order('created_at', { ascending: false });

        if (user.role === 'supervisor') {
          query = query.eq('supervisor_id', user.id);
        }
          
        const { data, error } = await query;
          
        if (error) throw error;
        
        // Add franchise name and format data
        const enhancedData = data?.map(item => {
          return {
            ...item,
            franchise_name: item.inspection?.franchise?.name,
          } as SupervisorValidation;
        }) || [];
        
        setValidations(enhancedData);
        setFilteredValidations(enhancedData);
      } catch (error) {
        console.error('Error fetching validations:', error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger les validations",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchValidations();
  }, [user, toast]);

  // Filter validations based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredValidations(validations);
      return;
    }

    const lowerSearch = searchTerm.toLowerCase();
    const filtered = validations.filter(validation => {
      return (
        validation.inspection?.vehicle?.brand?.toLowerCase().includes(lowerSearch) ||
        validation.inspection?.vehicle?.model?.toLowerCase().includes(lowerSearch) ||
        validation.inspection?.vehicle?.license_plate?.toLowerCase().includes(lowerSearch) ||
        validation.franchise_name?.toLowerCase().includes(lowerSearch)
      );
    });

    setFilteredValidations(filtered);
  }, [searchTerm, validations]);

  const openDetailsDialog = async (validation: SupervisorValidation) => {
    setSelectedValidation(validation);
    setDetailsDialogOpen(true);
    
    try {
      // Fetch inspection details
      const { data: details, error: detailsError } = await supabase
        .from('inspection_details')
        .select('*')
        .eq('inspection_id', validation.inspection_id)
        .order('section', { ascending: true })
        .order('item', { ascending: true });
        
      if (detailsError) throw detailsError;
      
      setInspectionDetails(details || []);
      
      // Fetch or create validation items
      const { data: items, error: itemsError } = await supabase
        .from('validation_items')
        .select('*')
        .eq('validation_id', validation.id);
        
      if (itemsError) throw itemsError;
      
      if (items && items.length > 0) {
        setValidationItems(items as ValidationItem[]);
      } else {
        // Create validation items for each inspection detail
        const newItems = details?.map(detail => ({
          validation_id: validation.id,
          inspection_detail_id: detail.id,
          status: 'pending' as ValidationStatus,
          comment: null
        })) || [];
        
        if (newItems.length > 0) {
          const { data: createdItems, error: createError } = await supabase
            .from('validation_items')
            .insert(newItems)
            .select();
            
          if (createError) throw createError;
          
          setValidationItems(createdItems as ValidationItem[] || []);
        }
      }
    } catch (error) {
      console.error('Error fetching validation details:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les détails de la validation",
      });
    }
  };

  const updateItemStatus = async (itemId: string, status: ValidationStatus) => {
    try {
      if (status === 'rejected') {
        // Open comment dialog for rejection reason
        setCurrentDetailId(itemId);
        setRejectionComment("");
        setCommentDialogOpen(true);
        return;
      }
      
      const { error } = await supabase
        .from('validation_items')
        .update({ status, comment: null })
        .eq('id', itemId);
        
      if (error) throw error;
      
      // Update local state
      setValidationItems(prev => 
        prev.map(item => 
          item.id === itemId ? { ...item, status, comment: null } : item
        )
      );
      
      toast({
        title: "Élément mis à jour",
        description: status === 'approved' ? "L'élément a été validé" : "L'élément a été rejeté",
      });
    } catch (error) {
      console.error('Error updating item status:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de mettre à jour le statut",
      });
    }
  };

  const submitRejectionComment = async () => {
    if (!currentDetailId) return;
    
    try {
      const { error } = await supabase
        .from('validation_items')
        .update({
          status: 'rejected',
          comment: rejectionComment
        })
        .eq('id', currentDetailId);
        
      if (error) throw error;
      
      // Update local state
      setValidationItems(prev => 
        prev.map(item => 
          item.id === currentDetailId 
            ? { ...item, status: 'rejected', comment: rejectionComment } 
            : item
        )
      );
      
      toast({
        title: "Élément rejeté",
        description: "Le commentaire a été enregistré",
      });
      
      setCommentDialogOpen(false);
      setCurrentDetailId(null);
      setRejectionComment("");
    } catch (error) {
      console.error('Error submitting rejection comment:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'enregistrer le commentaire",
      });
    }
  };

  const approveAllItems = async () => {
    try {
      const { error } = await supabase
        .from('validation_items')
        .update({
          status: 'approved',
          comment: null
        })
        .eq('validation_id', selectedValidation?.id)
        .in('status', ['pending']);
        
      if (error) throw error;
      
      // Update local state
      setValidationItems(prev => 
        prev.map(item => 
          item.status === 'pending' 
            ? { ...item, status: 'approved', comment: null } 
            : item
        )
      );
      
      toast({
        title: "Tous les éléments approuvés",
        description: "Tous les éléments en attente ont été validés",
      });
    } catch (error) {
      console.error('Error approving all items:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de valider tous les éléments",
      });
    }
  };

  const completeValidation = async () => {
    if (!selectedValidation) return;
    
    try {
      // Check if any items are still pending
      const pendingItems = validationItems.filter(item => item.status === 'pending');
      if (pendingItems.length > 0) {
        toast({
          variant: "destructive",
          title: "Validation incomplète",
          description: "Tous les éléments doivent être validés ou rejetés avant de terminer la validation",
        });
        return;
      }
      
      // Check if there are any rejected items
      const rejectedItems = validationItems.filter(item => item.status === 'rejected');
      const newStatus = rejectedItems.length > 0 ? 'rejected' : 'approved';
      
      // Update validation status
      const { error: validationError } = await supabase
        .from('supervisor_validations')
        .update({
          status: newStatus,
          completed_at: new Date().toISOString()
        })
        .eq('id', selectedValidation.id);
        
      if (validationError) throw validationError;
      
      // Update inspection status
      const { error: inspectionError } = await supabase
        .from('inspections')
        .update({
          status: rejectedItems.length > 0 ? 'rejected' : 'validated'
        })
        .eq('id', selectedValidation.inspection_id);
        
      if (inspectionError) throw inspectionError;
      
      // Create notification for inspector
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          title: rejectedItems.length > 0 
            ? 'Inspection rejetée' 
            : 'Inspection validée',
          content: rejectedItems.length > 0 
            ? 'Votre inspection a été rejetée par un superviseur. Veuillez consulter les commentaires.' 
            : 'Votre inspection a été validée par un superviseur.',
          type: rejectedItems.length > 0 ? 'inspection_rejected' : 'inspection_validated',
          target_user_id: selectedValidation.inspection?.inspector_id,
          franchise_id: selectedValidation.inspection?.franchise_id
        });
        
      if (notificationError) throw notificationError;
      
      toast({
        title: rejectedItems.length > 0 ? "Inspection rejetée" : "Inspection validée",
        description: rejectedItems.length > 0 
          ? "L'inspection a été rejetée et renvoyée à l'inspecteur" 
          : "L'inspection a été validée avec succès",
      });
      
      // Update local state
      setValidations(prev => 
        prev.map(item => 
          item.id === selectedValidation.id 
            ? { ...item, status: newStatus as ValidationStatus, completed_at: new Date().toISOString() } 
            : item
        )
      );
      setFilteredValidations(prev => 
        prev.map(item => 
          item.id === selectedValidation.id 
            ? { ...item, status: newStatus as ValidationStatus, completed_at: new Date().toISOString() } 
            : item
        )
      );
      
      setDetailsDialogOpen(false);
    } catch (error) {
      console.error('Error completing validation:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de terminer la validation",
      });
    }
  };

  const getStatusBadge = (status: ValidationStatus) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">En attente</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Validé</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rejeté</Badge>;
      case 'requires_review':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">À revoir</Badge>;
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  // Group inspection details by section
  const groupedDetails = inspectionDetails.reduce((acc, detail) => {
    if (!acc[detail.section]) {
      acc[detail.section] = [];
    }
    acc[detail.section].push(detail);
    return acc;
  }, {} as Record<string, InspectionDetail[]>);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Validation Superviseur</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Inspections à valider</CardTitle>
          <CardDescription>
            Liste des inspections en attente de validation
          </CardDescription>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pending">
            <TabsList>
              <TabsTrigger value="pending">En attente</TabsTrigger>
              <TabsTrigger value="completed">Complétées</TabsTrigger>
            </TabsList>
            
            <TabsContent value="pending">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Véhicule</TableHead>
                    <TableHead>Franchise</TableHead>
                    <TableHead>Date création</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10">
                        Chargement...
                      </TableCell>
                    </TableRow>
                  ) : filteredValidations.filter(v => v.status === 'pending').length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10">
                        Aucune validation en attente
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredValidations
                      .filter(validation => validation.status === 'pending')
                      .map(validation => (
                        <TableRow key={validation.id}>
                          <TableCell>
                            {validation.inspection?.vehicle?.brand} {validation.inspection?.vehicle?.model} 
                            <div className="text-sm text-gray-500">
                              {validation.inspection?.vehicle?.license_plate || 'Sans plaque'}
                            </div>
                          </TableCell>
                          <TableCell>{validation.franchise_name}</TableCell>
                          <TableCell>
                            {format(new Date(validation.created_at), 'dd MMM yyyy', { locale: fr })}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge('pending')}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => openDetailsDialog(validation)}
                            >
                              Valider <ChevronRight className="ml-2 h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
            </TabsContent>
            
            <TabsContent value="completed">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Véhicule</TableHead>
                    <TableHead>Franchise</TableHead>
                    <TableHead>Date complétion</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10">
                        Chargement...
                      </TableCell>
                    </TableRow>
                  ) : filteredValidations.filter(v => v.status !== 'pending').length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10">
                        Aucune validation complétée
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredValidations
                      .filter(validation => validation.status !== 'pending')
                      .map(validation => (
                        <TableRow key={validation.id}>
                          <TableCell>
                            {validation.inspection?.vehicle?.brand} {validation.inspection?.vehicle?.model} 
                            <div className="text-sm text-gray-500">
                              {validation.inspection?.vehicle?.license_plate || 'Sans plaque'}
                            </div>
                          </TableCell>
                          <TableCell>{validation.franchise_name}</TableCell>
                          <TableCell>
                            {validation.completed_at 
                              ? format(new Date(validation.completed_at), 'dd MMM yyyy', { locale: fr })
                              : '-'}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(validation.status as ValidationStatus)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => openDetailsDialog(validation)}
                            >
                              Détails <ChevronRight className="ml-2 h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Validation de l'inspection
              {selectedValidation?.inspection?.vehicle && (
                <span className="ml-2 font-normal">
                  - {selectedValidation.inspection.vehicle.brand} {selectedValidation.inspection.vehicle.model}
                  {selectedValidation.inspection.vehicle.license_plate && (
                    <span className="ml-1">({selectedValidation.inspection.vehicle.license_plate})</span>
                  )}
                </span>
              )}
            </DialogTitle>
            <DialogDescription>
              Franchise: {selectedValidation?.franchise_name}
              {selectedValidation?.status !== 'pending' && (
                <span className="ml-4">
                  Statut: {getStatusBadge(selectedValidation?.status as ValidationStatus)}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Progress summary */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Progression de la validation</p>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">
                          {validationItems.filter(item => item.status === 'approved').length} validés
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <XCircleIcon className="h-4 w-4 text-red-500" />
                        <span className="text-sm">
                          {validationItems.filter(item => item.status === 'rejected').length} rejetés
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm">
                          {validationItems.filter(item => item.status === 'pending').length} en attente
                        </span>
                      </div>
                    </div>
                  </div>

                  {selectedValidation?.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={approveAllItems}>
                        Valider tous les éléments
                      </Button>
                      <Button onClick={completeValidation}>
                        Terminer la validation
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Inspection details by section */}
            {Object.keys(groupedDetails).map((section, index) => (
              <Card key={section}>
                <CardHeader>
                  <CardTitle className="text-lg">{section}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-1/2">Élément</TableHead>
                        <TableHead>Statut inspection</TableHead>
                        <TableHead>Statut validation</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {groupedDetails[section].map(detail => {
                        const validationItem = validationItems.find(item => 
                          item.inspection_detail_id === detail.id
                        );
                        
                        return (
                          <TableRow key={detail.id}>
                            <TableCell>
                              <div className="font-medium">{detail.item}</div>
                              {detail.comment && (
                                <div className="text-sm text-gray-500 mt-1">
                                  <span className="font-medium">Commentaire:</span> {detail.comment}
                                </div>
                              )}
                              {validationItem?.status === 'rejected' && validationItem?.comment && (
                                <div className="text-sm text-red-600 mt-1">
                                  <span className="font-medium">Motif rejet:</span> {validationItem.comment}
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge variant={detail.status === 'ok' ? "outline" : "secondary"}>
                                {detail.status === 'ok' ? 'OK' : 'NOK'}
                              </Badge>
                              {detail.photo_url && (
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="ml-2 h-7 px-2"
                                  onClick={() => {
                                    // Show photo dialog or open in new window
                                    window.open(detail.photo_url!, '_blank');
                                  }}
                                >
                                  <Image className="h-4 w-4 mr-1" /> Photo
                                </Button>
                              )}
                            </TableCell>
                            <TableCell>
                              {validationItem && getStatusBadge(validationItem.status)}
                            </TableCell>
                            <TableCell className="text-right">
                              {selectedValidation?.status === 'pending' && validationItem && (
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                                    disabled={validationItem.status === 'rejected'}
                                    onClick={() => updateItemStatus(validationItem.id, 'rejected')}
                                  >
                                    <XCircle className="h-4 w-4 mr-1" /> Rejeter
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                                    disabled={validationItem.status === 'approved'}
                                    onClick={() => updateItemStatus(validationItem.id, 'approved')}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" /> Valider
                                  </Button>
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ))}

            {selectedValidation?.status === 'pending' && (
              <div className="flex justify-end">
                <Button onClick={completeValidation}>
                  Terminer la validation
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Rejection Comment Dialog */}
      <Dialog open={commentDialogOpen} onOpenChange={setCommentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Motif du rejet</DialogTitle>
            <DialogDescription>
              Veuillez indiquer la raison du rejet de cet élément.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rejection-comment">Commentaire</Label>
              <Textarea
                id="rejection-comment"
                placeholder="Motif du rejet..."
                value={rejectionComment}
                onChange={(e) => setRejectionComment(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setCommentDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button 
              onClick={submitRejectionComment}
              disabled={!rejectionComment.trim()}
            >
              Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ValidationSuperviseur;
