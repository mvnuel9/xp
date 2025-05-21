import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Download, FileText, Search, CalendarIcon, Trash2 } from "lucide-react";
import { FranchiseInvoice, ClientInvoice, InvoiceStatus, FeeType, NewFranchiseInvoice, NewClientInvoice } from "@/types/invoices";

// Constants
const ITEMS_PER_PAGE = 10;

const Facturation = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("franchise");
  const [franchiseInvoices, setFranchiseInvoices] = useState<FranchiseInvoice[]>([]);
  const [clientInvoices, setClientInvoices] = useState<ClientInvoice[]>([]);
  const [franchises, setFranchises] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  
  // Dialogs state
  const [openNewFranchiseInvoice, setOpenNewFranchiseInvoice] = useState(false);
  const [openNewClientInvoice, setOpenNewClientInvoice] = useState(false);
  
  // New invoice forms
  const [newFranchiseInvoice, setNewFranchiseInvoice] = useState<NewFranchiseInvoice>({
    franchise_id: "",
    fee_type: "fixed",
    fee_value: 0,
    amount: 0,
    tax_rate: 18.0,
    invoice_date: new Date().toISOString().split("T")[0],
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    period_start: "",
    period_end: "",
  });
  
  const [newClientInvoice, setNewClientInvoice] = useState<NewClientInvoice>({
    client_id: "",
    franchise_id: "",
    inspection_id: "",
    amount: 0,
    tax_rate: 18.0,
    invoice_date: new Date().toISOString().split("T")[0],
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  });
  
  // Stats
  const [stats, setStats] = useState({
    totalFranchiseInvoices: 0,
    pendingFranchiseAmount: 0,
    paidFranchiseAmount: 0,
    totalClientInvoices: 0,
    pendingClientAmount: 0,
    paidClientAmount: 0,
  });

  // Fetch data
  useEffect(() => {
    fetchInvoices();
    fetchFranchises();
    fetchClients();
  }, []);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      // Fetch franchise invoices
      const { data: franchiseData, error: franchiseError } = await supabase
        .from('franchise_invoices')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (franchiseError) throw franchiseError;
      
      // Fetch client invoices
      const { data: clientData, error: clientError } = await supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (clientError) throw clientError;
      
      // Add franchise and client names
      const enhancedFranchiseInvoices = await enhanceFranchiseInvoices(franchiseData || []);
      const enhancedClientInvoices = await enhanceClientInvoices(clientData || []);
      
      // Type casting to ensure compatibility with the FranchiseInvoice and ClientInvoice types
      setFranchiseInvoices(enhancedFranchiseInvoices as FranchiseInvoice[]);
      setClientInvoices(enhancedClientInvoices as ClientInvoice[]);
      
      // Calculate stats
      calculateStats(enhancedFranchiseInvoices as FranchiseInvoice[], enhancedClientInvoices as ClientInvoice[]);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les factures",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const enhanceFranchiseInvoices = async (invoices: any[]): Promise<FranchiseInvoice[]> => {
    const franchiseIds = [...new Set(invoices.map(invoice => invoice.franchise_id))];
    const { data: franchisesData } = await supabase
      .from('franchises')
      .select('id, name')
      .in('id', franchiseIds);
    
    const franchiseMap = (franchisesData || []).reduce((acc, curr) => {
      acc[curr.id] = curr.name;
      return acc;
    }, {} as Record<string, string>);
    
    return invoices.map(invoice => ({
      ...invoice,
      franchise_name: franchiseMap[invoice.franchise_id] || 'Unknown',
      fee_type: invoice.fee_type as FeeType,
      status: invoice.status as InvoiceStatus
    }));
  };

  const enhanceClientInvoices = async (invoices: any[]): Promise<ClientInvoice[]> => {
    const clientIds = [...new Set(invoices.map(invoice => invoice.client_id))];
    const franchiseIds = [...new Set(invoices.map(invoice => invoice.franchise_id).filter(Boolean))];
    
    const { data: clientsData } = await supabase
      .from('clients')
      .select('id, name')
      .in('id', clientIds);
    
    const { data: franchisesData } = await supabase
      .from('franchises')
      .select('id, name')
      .in('id', franchiseIds);
    
    const clientMap = (clientsData || []).reduce((acc, curr) => {
      acc[curr.id] = curr.name;
      return acc;
    }, {} as Record<string, string>);
    
    const franchiseMap = (franchisesData || []).reduce((acc, curr) => {
      acc[curr.id] = curr.name;
      return acc;
    }, {} as Record<string, string>);
    
    return invoices.map(invoice => ({
      ...invoice,
      client_name: clientMap[invoice.client_id] || 'Unknown',
      franchise_name: invoice.franchise_id ? franchiseMap[invoice.franchise_id] || 'Unknown' : 'N/A',
      status: invoice.status as InvoiceStatus
    }));
  };

  const calculateStats = (franchiseInvoices: FranchiseInvoice[], clientInvoices: ClientInvoice[]) => {
    const pendingFranchise = franchiseInvoices.filter(inv => inv.status === 'pending' || inv.status === 'overdue');
    const paidFranchise = franchiseInvoices.filter(inv => inv.status === 'paid');
    const pendingClient = clientInvoices.filter(inv => inv.status === 'pending' || inv.status === 'overdue');
    const paidClient = clientInvoices.filter(inv => inv.status === 'paid');
    
    setStats({
      totalFranchiseInvoices: franchiseInvoices.length,
      pendingFranchiseAmount: pendingFranchise.reduce((sum, inv) => sum + inv.total_amount, 0),
      paidFranchiseAmount: paidFranchise.reduce((sum, inv) => sum + inv.total_amount, 0),
      totalClientInvoices: clientInvoices.length,
      pendingClientAmount: pendingClient.reduce((sum, inv) => sum + inv.total_amount, 0),
      paidClientAmount: paidClient.reduce((sum, inv) => sum + inv.total_amount, 0),
    });
  };

  const fetchFranchises = async () => {
    try {
      const { data, error } = await supabase
        .from('franchises')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      setFranchises(data || []);
    } catch (error) {
      console.error('Error fetching franchises:', error);
    }
  };

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      setClients(data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  // Create new invoices
  const handleCreateFranchiseInvoice = async () => {
    try {
      const taxAmount = (newFranchiseInvoice.amount * newFranchiseInvoice.tax_rate) / 100;
      const totalAmount = newFranchiseInvoice.amount + taxAmount;
      
      // Generate invoice number
      const invoiceNumber = `FI-${Date.now().toString().slice(-8)}`;
      
      const { error } = await supabase
        .from('franchise_invoices')
        .insert({
          franchise_id: newFranchiseInvoice.franchise_id,
          invoice_number: invoiceNumber,
          fee_type: newFranchiseInvoice.fee_type,
          fee_value: newFranchiseInvoice.fee_value,
          amount: newFranchiseInvoice.amount,
          tax_amount: taxAmount,
          total_amount: totalAmount,
          tax_rate: newFranchiseInvoice.tax_rate,
          invoice_date: newFranchiseInvoice.invoice_date,
          due_date: newFranchiseInvoice.due_date,
          period_start: newFranchiseInvoice.period_start || null,
          period_end: newFranchiseInvoice.period_end || null,
          status: 'pending'
        });
      
      if (error) throw error;
      
      toast({
        title: "Succès",
        description: "La facture franchise a été créée avec succès",
      });
      
      setOpenNewFranchiseInvoice(false);
      fetchInvoices();
    } catch (error: any) {
      console.error('Error creating franchise invoice:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer la facture",
        variant: "destructive",
      });
    }
  };

  const handleCreateClientInvoice = async () => {
    try {
      const taxAmount = (newClientInvoice.amount * newClientInvoice.tax_rate) / 100;
      const totalAmount = newClientInvoice.amount + taxAmount;
      
      // Generate invoice number
      const invoiceNumber = `CI-${Date.now().toString().slice(-8)}`;
      
      const { error } = await supabase
        .from('invoices')
        .insert({
          client_id: newClientInvoice.client_id,
          franchise_id: newClientInvoice.franchise_id,
          inspection_id: newClientInvoice.inspection_id || null,
          invoice_number: invoiceNumber,
          amount: newClientInvoice.amount,
          tax_amount: taxAmount,
          total_amount: totalAmount,
          tax_rate: newClientInvoice.tax_rate,
          invoice_date: newClientInvoice.invoice_date,
          due_date: newClientInvoice.due_date,
          status: 'pending'
        });
      
      if (error) throw error;
      
      toast({
        title: "Succès",
        description: "La facture client a été créée avec succès",
      });
      
      setOpenNewClientInvoice(false);
      fetchInvoices();
    } catch (error: any) {
      console.error('Error creating client invoice:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer la facture",
        variant: "destructive",
      });
    }
  };

  // Handle deletion
  const handleDeleteFranchiseInvoice = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette facture ?")) return;
    
    try {
      const { error } = await supabase
        .from('franchise_invoices')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Succès",
        description: "La facture a été supprimée avec succès",
      });
      
      fetchInvoices();
    } catch (error: any) {
      console.error('Error deleting franchise invoice:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer la facture",
        variant: "destructive",
      });
    }
  };

  const handleDeleteClientInvoice = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette facture ?")) return;
    
    try {
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Succès",
        description: "La facture a été supprimée avec succès",
      });
      
      fetchInvoices();
    } catch (error: any) {
      console.error('Error deleting client invoice:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer la facture",
        variant: "destructive",
      });
    }
  };

  // Update invoice status
  const updateFranchiseInvoiceStatus = async (id: string, status: string) => {
    try {
      const updates: any = { status };
      if (status === 'paid') {
        updates.paid_at = new Date().toISOString();
      }
      
      const { error } = await supabase
        .from('franchise_invoices')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Succès",
        description: "Le statut de la facture a été mis à jour",
      });
      
      fetchInvoices();
    } catch (error: any) {
      console.error('Error updating franchise invoice status:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de mettre à jour le statut",
        variant: "destructive",
      });
    }
  };

  const updateClientInvoiceStatus = async (id: string, status: string) => {
    try {
      const updates: any = { status };
      if (status === 'paid') {
        updates.paid_at = new Date().toISOString();
      }
      
      const { error } = await supabase
        .from('invoices')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Succès",
        description: "Le statut de la facture a été mis à jour",
      });
      
      fetchInvoices();
    } catch (error: any) {
      console.error('Error updating client invoice status:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de mettre à jour le statut",
        variant: "destructive",
      });
    }
  };

  // Form handlers
  const handleFranchiseInvoiceChange = (field: keyof NewFranchiseInvoice, value: any) => {
    setNewFranchiseInvoice(prev => {
      const updated = { ...prev, [field]: value };
      
      // If fee type changes, reset fee value
      if (field === 'fee_type') {
        updated.fee_value = 0;
        updated.amount = 0;
      }
      
      // Calculate amount based on fee type and value
      if (field === 'fee_value' && updated.fee_type) {
        // In a real app, we would calculate based on franchise data
        // Here we're just setting amount equal to fee_value for simplicity
        updated.amount = Number(value);
      }
      
      return updated;
    });
  };

  const handleClientInvoiceChange = (field: keyof NewClientInvoice, value: any) => {
    setNewClientInvoice(prev => ({ ...prev, [field]: value }));
  };

  // Filter invoices based on search term
  const filteredFranchiseInvoices = franchiseInvoices.filter(invoice => 
    invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (invoice.franchise_name && invoice.franchise_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredClientInvoices = clientInvoices.filter(invoice => 
    invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (invoice.client_name && invoice.client_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (invoice.franchise_name && invoice.franchise_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  // Pagination
  const currentInvoices = activeTab === "franchise" 
    ? filteredFranchiseInvoices.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
    : filteredClientInvoices.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  
  const totalPages = Math.ceil(
    (activeTab === "franchise" ? filteredFranchiseInvoices.length : filteredClientInvoices.length) / ITEMS_PER_PAGE
  );
  
  // Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('fr-FR').format(date);
  };
  
  // Get status color
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
  };
  
  // Export to CSV
  const exportToCSV = () => {
    const invoices = activeTab === "franchise" ? franchiseInvoices : clientInvoices;
    
    let csvContent = "";
    
    // Headers
    if (activeTab === "franchise") {
      csvContent = "Invoice Number,Franchise,Fee Type,Amount,Tax Amount,Total,Status,Invoice Date,Due Date\n";
    } else {
      csvContent = "Invoice Number,Client,Franchise,Amount,Tax Amount,Total,Status,Invoice Date,Due Date\n";
    }
    
    // Add rows
    invoices.forEach(invoice => {
      if (activeTab === "franchise") {
        const franchiseInv = invoice as FranchiseInvoice;
        csvContent += `${franchiseInv.invoice_number},${franchiseInv.franchise_name || ''},${franchiseInv.fee_type},${franchiseInv.amount},${franchiseInv.tax_amount},${franchiseInv.total_amount},${franchiseInv.status},${formatDate(franchiseInv.invoice_date)},${franchiseInv.due_date ? formatDate(franchiseInv.due_date) : ''}\n`;
      } else {
        const clientInv = invoice as ClientInvoice;
        csvContent += `${clientInv.invoice_number},${clientInv.client_name || ''},${clientInv.franchise_name || ''},${clientInv.amount},${clientInv.tax_amount},${clientInv.total_amount},${clientInv.status},${formatDate(clientInv.invoice_date)},${clientInv.due_date ? formatDate(clientInv.due_date) : ''}\n`;
      }
    });
    
    // Create download link
    const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${activeTab === "franchise" ? 'franchise' : 'client'}_invoices_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Facturation</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total des factures
            </CardTitle>
            <CardDescription className="text-2xl font-bold">
              {stats.totalFranchiseInvoices + stats.totalClientInvoices}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              {stats.totalFranchiseInvoices} factures franchise, {stats.totalClientInvoices} factures client
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Montant en attente
            </CardTitle>
            <CardDescription className="text-2xl font-bold text-yellow-600">
              {formatCurrency(stats.pendingFranchiseAmount + stats.pendingClientAmount)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              {formatCurrency(stats.pendingFranchiseAmount)} franchise, {formatCurrency(stats.pendingClientAmount)} client
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Montant payé
            </CardTitle>
            <CardDescription className="text-2xl font-bold text-green-600">
              {formatCurrency(stats.paidFranchiseAmount + stats.paidClientAmount)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              {formatCurrency(stats.paidFranchiseAmount)} franchise, {formatCurrency(stats.paidClientAmount)} client
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="franchise" onValueChange={value => {
        setActiveTab(value);
        setCurrentPage(1);
      }}>
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="franchise">Factures Franchise</TabsTrigger>
            <TabsTrigger value="client">Factures Client</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center space-x-2">
            <div className="flex items-center border rounded-md px-3 py-2">
              <Search className="h-4 w-4 text-gray-400 mr-2" />
              <Input
                className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Button variant="outline" onClick={exportToCSV}>
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
            
            {activeTab === "franchise" ? (
              <Dialog open={openNewFranchiseInvoice} onOpenChange={setOpenNewFranchiseInvoice}>
                <DialogTrigger asChild>
                  <Button>Nouvelle facture franchise</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Créer une facture franchise</DialogTitle>
                    <DialogDescription>
                      Complétez les informations pour créer une nouvelle facture pour une franchise
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="franchise" className="text-right">
                        Franchise
                      </Label>
                      <Select 
                        value={newFranchiseInvoice.franchise_id}
                        onValueChange={value => handleFranchiseInvoiceChange('franchise_id', value)}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Sélectionner une franchise" />
                        </SelectTrigger>
                        <SelectContent>
                          {franchises.map(franchise => (
                            <SelectItem key={franchise.id} value={franchise.id}>
                              {franchise.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="fee_type" className="text-right">
                        Type de frais
                      </Label>
                      <Select 
                        value={newFranchiseInvoice.fee_type}
                        onValueChange={value => handleFranchiseInvoiceChange('fee_type', value)}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Type de frais" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fixed">Montant fixe</SelectItem>
                          <SelectItem value="percentage">Pourcentage</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="fee_value" className="text-right">
                        {newFranchiseInvoice.fee_type === 'fixed' ? 'Montant' : 'Pourcentage'}
                      </Label>
                      <Input
                        id="fee_value"
                        type="number"
                        value={newFranchiseInvoice.fee_value}
                        onChange={e => handleFranchiseInvoiceChange('fee_value', Number(e.target.value))}
                        className="col-span-3"
                      />
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="amount" className="text-right">
                        Montant HT
                      </Label>
                      <Input
                        id="amount"
                        type="number"
                        value={newFranchiseInvoice.amount}
                        onChange={e => handleFranchiseInvoiceChange('amount', Number(e.target.value))}
                        className="col-span-3"
                      />
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="tax_rate" className="text-right">
                        Taux TVA (%)
                      </Label>
                      <Input
                        id="tax_rate"
                        type="number"
                        value={newFranchiseInvoice.tax_rate}
                        onChange={e => handleFranchiseInvoiceChange('tax_rate', Number(e.target.value))}
                        className="col-span-3"
                      />
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="invoice_date" className="text-right">
                        Date facture
                      </Label>
                      <div className="relative col-span-3">
                        <Input
                          id="invoice_date"
                          type="date"
                          value={newFranchiseInvoice.invoice_date}
                          onChange={e => handleFranchiseInvoiceChange('invoice_date', e.target.value)}
                        />
                        <CalendarIcon className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="due_date" className="text-right">
                        Date échéance
                      </Label>
                      <div className="relative col-span-3">
                        <Input
                          id="due_date"
                          type="date"
                          value={newFranchiseInvoice.due_date}
                          onChange={e => handleFranchiseInvoiceChange('due_date', e.target.value)}
                        />
                        <CalendarIcon className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="period_start" className="text-right">
                        Période début
                      </Label>
                      <div className="relative col-span-3">
                        <Input
                          id="period_start"
                          type="date"
                          value={newFranchiseInvoice.period_start || ''}
                          onChange={e => handleFranchiseInvoiceChange('period_start', e.target.value)}
                        />
                        <CalendarIcon className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="period_end" className="text-right">
                        Période fin
                      </Label>
                      <div className="relative col-span-3">
                        <Input
                          id="period_end"
                          type="date"
                          value={newFranchiseInvoice.period_end || ''}
                          onChange={e => handleFranchiseInvoiceChange('period_end', e.target.value)}
                        />
                        <CalendarIcon className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button 
                      onClick={handleCreateFranchiseInvoice} 
                      disabled={!newFranchiseInvoice.franchise_id || newFranchiseInvoice.amount <= 0}
                    >
                      Créer la facture
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            ) : (
              <Dialog open={openNewClientInvoice} onOpenChange={setOpenNewClientInvoice}>
                <DialogTrigger asChild>
                  <Button>Nouvelle facture client</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Créer une facture client</DialogTitle>
                    <DialogDescription>
                      Complétez les informations pour créer une nouvelle facture pour un client
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="client" className="text-right">
                        Client
                      </Label>
                      <Select 
                        value={newClientInvoice.client_id}
                        onValueChange={value => handleClientInvoiceChange('client_id', value)}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Sélectionner un client" />
                        </SelectTrigger>
                        <SelectContent>
                          {clients.map(client => (
                            <SelectItem key={client.id} value={client.id}>
                              {client.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="franchise" className="text-right">
                        Franchise
                      </Label>
                      <Select 
                        value={newClientInvoice.franchise_id}
                        onValueChange={value => handleClientInvoiceChange('franchise_id', value)}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Sélectionner une franchise" />
                        </SelectTrigger>
                        <SelectContent>
                          {franchises.map(franchise => (
                            <SelectItem key={franchise.id} value={franchise.id}>
                              {franchise.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="amount" className="text-right">
                        Montant HT
                      </Label>
                      <Input
                        id="amount"
                        type="number"
                        value={newClientInvoice.amount}
                        onChange={e => handleClientInvoiceChange('amount', Number(e.target.value))}
                        className="col-span-3"
                      />
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="tax_rate" className="text-right">
                        Taux TVA (%)
                      </Label>
                      <Input
                        id="tax_rate"
                        type="number"
                        value={newClientInvoice.tax_rate}
                        onChange={e => handleClientInvoiceChange('tax_rate', Number(e.target.value))}
                        className="col-span-3"
                      />
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="invoice_date" className="text-right">
                        Date facture
                      </Label>
                      <div className="relative col-span-3">
                        <Input
                          id="invoice_date"
                          type="date"
                          value={newClientInvoice.invoice_date}
                          onChange={e => handleClientInvoiceChange('invoice_date', e.target.value)}
                        />
                        <CalendarIcon className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="due_date" className="text-right">
                        Date échéance
                      </Label>
                      <div className="relative col-span-3">
                        <Input
                          id="due_date"
                          type="date"
                          value={newClientInvoice.due_date}
                          onChange={e => handleClientInvoiceChange('due_date', e.target.value)}
                        />
                        <CalendarIcon className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button 
                      onClick={handleCreateClientInvoice} 
                      disabled={!newClientInvoice.client_id || !newClientInvoice.franchise_id || newClientInvoice.amount <= 0}
                    >
                      Créer la facture
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
        
        <TabsContent value="franchise">
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableCaption>Liste des factures franchise</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Facture #</TableHead>
                  <TableHead>Franchise</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Échéance</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentInvoices.length > 0 ? (
                  currentInvoices.map((invoice) => {
                    const franchiseInv = invoice as FranchiseInvoice;
                    return (
                      <TableRow key={franchiseInv.id}>
                        <TableCell className="font-medium">
                          {franchiseInv.invoice_number}
                        </TableCell>
                        <TableCell>{franchiseInv.franchise_name}</TableCell>
                        <TableCell>
                          {franchiseInv.fee_type === 'fixed' ? 'Fixe' : 'Pourcentage'}
                        </TableCell>
                        <TableCell>{formatCurrency(franchiseInv.total_amount)}</TableCell>
                        <TableCell>{formatDate(franchiseInv.invoice_date)}</TableCell>
                        <TableCell>{franchiseInv.due_date ? formatDate(franchiseInv.due_date) : '-'}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs uppercase ${getStatusColor(franchiseInv.status)}`}>
                            {franchiseInv.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Select 
                              value={franchiseInv.status}
                              onValueChange={value => updateFranchiseInvoiceStatus(franchiseInv.id, value)}
                              disabled={franchiseInv.status === 'cancelled'}
                            >
                              <SelectTrigger className="h-8 w-24">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">En attente</SelectItem>
                                <SelectItem value="paid">Payée</SelectItem>
                                <SelectItem value="overdue">En retard</SelectItem>
                                <SelectItem value="cancelled">Annulée</SelectItem>
                              </SelectContent>
                            </Select>
                            
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteFranchiseInvoice(franchiseInv.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            
                            <Button variant="ghost" size="icon">
                              <FileText className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      {loading ? "Chargement..." : "Aucune facture trouvée"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        
        <TabsContent value="client">
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableCaption>Liste des factures clients</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Facture #</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Franchise</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Échéance</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentInvoices.length > 0 ? (
                  currentInvoices.map((invoice) => {
                    const clientInv = invoice as ClientInvoice;
                    return (
                      <TableRow key={clientInv.id}>
                        <TableCell className="font-medium">
                          {clientInv.invoice_number}
                        </TableCell>
                        <TableCell>{clientInv.client_name}</TableCell>
                        <TableCell>{clientInv.franchise_name}</TableCell>
                        <TableCell>{formatCurrency(clientInv.total_amount)}</TableCell>
                        <TableCell>{formatDate(clientInv.invoice_date)}</TableCell>
                        <TableCell>{clientInv.due_date ? formatDate(clientInv.due_date) : '-'}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs uppercase ${getStatusColor(clientInv.status)}`}>
                            {clientInv.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Select 
                              value={clientInv.status}
                              onValueChange={value => updateClientInvoiceStatus(clientInv.id, value)}
                              disabled={clientInv.status === 'cancelled'}
                            >
                              <SelectTrigger className="h-8 w-24">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">En attente</SelectItem>
                                <SelectItem value="paid">Payée</SelectItem>
                                <SelectItem value="overdue">En retard</SelectItem>
                                <SelectItem value="cancelled">Annulée</SelectItem>
                              </SelectContent>
                            </Select>
                            
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteClientInvoice(clientInv.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            
                            <Button variant="ghost" size="icon">
                              <FileText className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      {loading ? "Chargement..." : "Aucune facture trouvée"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
      
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
    </div>
  );
};

export default Facturation;
