
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  UserPlus,
  Edit2,
  Trash2,
  Search,
  Loader2,
  Car,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface Client {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  tax_exempt: boolean | null;
  created_at: string;
  franchise_id: string | null;
  vehicleCount?: number;
}

const Clients = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [newClient, setNewClient] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    tax_exempt: false,
    franchise_id: user?.franchises && user.franchises.length > 0 ? user.franchises[0].id : null,
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "newClient" | "selectedClient"
  ) => {
    const { name, value } = e.target;
    
    if (field === "newClient") {
      setNewClient({ ...newClient, [name]: value });
    } else if (selectedClient) {
      setSelectedClient({ ...selectedClient, [name]: value });
    }
  };

  const handleCheckboxChange = (
    checked: boolean, 
    field: "newClient" | "selectedClient"
  ) => {
    if (field === "newClient") {
      setNewClient({ ...newClient, tax_exempt: checked });
    } else if (selectedClient) {
      setSelectedClient({ ...selectedClient, tax_exempt: checked });
    }
  };

  const fetchClients = async () => {
    setLoading(true);
    try {
      let query = supabase.from('clients').select('*').order('created_at', { ascending: false });
      
      // If user isn't admin or commercial, filter by franchise_id
      if (user?.role !== 'admin' && user?.role !== 'commercial' && user?.franchises && user?.franchises.length > 0) {
        const franchiseIds = user.franchises.map(f => f.id);
        query = query.in('franchise_id', franchiseIds);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Get vehicle count for each client
      const clientsWithVehicleCount = await Promise.all((data as Client[]).map(async (client) => {
        const { count, error: countError } = await supabase
          .from('vehicles')
          .select('id', { count: 'exact', head: true })
          .eq('client_id', client.id);
          
        return {
          ...client,
          vehicleCount: countError ? 0 : count || 0
        };
      }));
      
      setClients(clientsWithVehicleCount);
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les clients",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [user]);

  const handleAddClient = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .insert({
          name: newClient.name,
          email: newClient.email || null,
          phone: newClient.phone || null,
          address: newClient.address || null,
          tax_exempt: newClient.tax_exempt,
          franchise_id: newClient.franchise_id,
        })
        .select();

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Le client a été ajouté avec succès",
      });

      setOpenAddDialog(false);
      setNewClient({
        name: "",
        email: "",
        phone: "",
        address: "",
        tax_exempt: false,
        franchise_id: user?.franchises && user.franchises.length > 0 ? user.franchises[0].id : null,
      });
      
      fetchClients();
    } catch (error: any) {
      console.error('Error adding client:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer le client",
        variant: "destructive",
      });
    }
  };

  const handleUpdateClient = async () => {
    if (!selectedClient) return;

    try {
      const { error } = await supabase
        .from('clients')
        .update({
          name: selectedClient.name,
          email: selectedClient.email,
          phone: selectedClient.phone,
          address: selectedClient.address,
          tax_exempt: selectedClient.tax_exempt,
        })
        .eq('id', selectedClient.id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Le client a été mis à jour avec succès",
      });

      setOpenEditDialog(false);
      fetchClients();
    } catch (error: any) {
      console.error('Error updating client:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de mettre à jour le client",
        variant: "destructive",
      });
    }
  };

  const handleDeleteClient = async (clientId: string, vehicleCount: number = 0) => {
    if (vehicleCount > 0) {
      toast({
        title: "Impossible de supprimer",
        description: `Ce client possède ${vehicleCount} véhicule(s). Veuillez d'abord les supprimer.`,
        variant: "destructive",
      });
      return;
    }
    
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce client ?")) return;

    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', clientId);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Le client a été supprimé avec succès",
      });

      fetchClients();
    } catch (error: any) {
      console.error('Error deleting client:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer le client",
        variant: "destructive",
      });
    }
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (client.phone && client.phone.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (client.address && client.address.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestion des Clients</h1>

        <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <UserPlus size={18} />
              Ajouter un client
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Ajouter un nouveau client</DialogTitle>
              <DialogDescription>
                Complétez les informations pour créer un nouveau client
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Nom *
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={newClient.name}
                  onChange={(e) => handleInputChange(e, "newClient")}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={newClient.email}
                  onChange={(e) => handleInputChange(e, "newClient")}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">
                  Téléphone
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  value={newClient.phone}
                  onChange={(e) => handleInputChange(e, "newClient")}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="address" className="text-right">
                  Adresse
                </Label>
                <Input
                  id="address"
                  name="address"
                  value={newClient.address}
                  onChange={(e) => handleInputChange(e, "newClient")}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="tax_exempt" className="text-right">
                  Exonéré de taxe
                </Label>
                <div className="col-span-3 flex items-center">
                  <Checkbox 
                    id="tax_exempt" 
                    checked={newClient.tax_exempt || false}
                    onCheckedChange={(checked) => 
                      handleCheckboxChange(checked === true, "newClient")
                    }
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="submit"
                onClick={handleAddClient}
                disabled={!newClient.name}
              >
                Ajouter
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center border rounded-md px-3 py-2 max-w-md">
        <Search className="h-5 w-5 text-gray-400 mr-2" />
        <Input
          className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          placeholder="Rechercher un client..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableCaption>Liste des clients</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Téléphone</TableHead>
                <TableHead>Adresse</TableHead>
                <TableHead>Véhicules</TableHead>
                <TableHead>Date de création</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.length > 0 ? (
                filteredClients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">{client.name}</TableCell>
                    <TableCell>{client.email || "-"}</TableCell>
                    <TableCell>{client.phone || "-"}</TableCell>
                    <TableCell>{client.address || "-"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Car size={14} />
                        {client.vehicleCount || 0}
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(client.created_at)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedClient(client);
                            setOpenEditDialog(true);
                          }}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClient(client.id, client.vehicleCount)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Aucun client trouvé
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Modifier le client</DialogTitle>
            <DialogDescription>
              Modifiez les informations du client
            </DialogDescription>
          </DialogHeader>
          {selectedClient && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">
                  Nom *
                </Label>
                <Input
                  id="edit-name"
                  name="name"
                  value={selectedClient.name}
                  onChange={(e) => handleInputChange(e, "selectedClient")}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-email" className="text-right">
                  Email
                </Label>
                <Input
                  id="edit-email"
                  name="email"
                  type="email"
                  value={selectedClient.email || ""}
                  onChange={(e) => handleInputChange(e, "selectedClient")}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-phone" className="text-right">
                  Téléphone
                </Label>
                <Input
                  id="edit-phone"
                  name="phone"
                  value={selectedClient.phone || ""}
                  onChange={(e) => handleInputChange(e, "selectedClient")}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-address" className="text-right">
                  Adresse
                </Label>
                <Input
                  id="edit-address"
                  name="address"
                  value={selectedClient.address || ""}
                  onChange={(e) => handleInputChange(e, "selectedClient")}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-tax_exempt" className="text-right">
                  Exonéré de taxe
                </Label>
                <div className="col-span-3 flex items-center">
                  <Checkbox
                    id="edit-tax_exempt"
                    checked={selectedClient.tax_exempt || false}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange(checked === true, "selectedClient")
                    }
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              type="submit"
              onClick={handleUpdateClient}
              disabled={!selectedClient?.name}
            >
              Mettre à jour
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Clients;
