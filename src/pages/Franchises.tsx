
import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Pencil, Trash } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

type Franchise = {
  id: string;
  name: string;
  location: string;
  created_at: string;
};

const FranchisesPage = () => {
  const [franchises, setFranchises] = useState<Franchise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFranchise, setSelectedFranchise] = useState<Franchise | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form state
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchFranchises();
  }, []);

  const fetchFranchises = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('franchises')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setFranchises(data || []);
    } catch (error) {
      console.error('Error fetching franchises:', error);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer la liste des franchises",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenForm = (franchise?: Franchise) => {
    if (franchise) {
      setSelectedFranchise(franchise);
      setName(franchise.name);
      setLocation(franchise.location);
    } else {
      setSelectedFranchise(null);
      setName('');
      setLocation('');
    }
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setSelectedFranchise(null);
    setName('');
    setLocation('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !location) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (selectedFranchise) {
        // Update existing franchise
        const { error } = await supabase
          .from('franchises')
          .update({ name, location })
          .eq('id', selectedFranchise.id);
          
        if (error) throw error;
        
        toast({
          title: "Succès",
          description: "La franchise a été mise à jour"
        });
      } else {
        // Create new franchise
        const { error } = await supabase
          .from('franchises')
          .insert([{ name, location }]);
          
        if (error) throw error;
        
        toast({
          title: "Succès",
          description: "La franchise a été créée"
        });
      }
      
      handleCloseForm();
      fetchFranchises();
    } catch (error) {
      console.error('Error submitting franchise:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'enregistrement",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette franchise ?")) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('franchises')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      toast({
        title: "Succès",
        description: "La franchise a été supprimée"
      });
      
      fetchFranchises();
    } catch (error) {
      console.error('Error deleting franchise:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer cette franchise",
        variant: "destructive"
      });
    }
  };

  const filteredFranchises = franchises.filter(franchise => 
    franchise.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    franchise.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Check if user has admin or commercial role
  const canManageFranchises = user?.role === 'admin' || user?.role === 'commercial';

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold">Gestion des Franchises</h1>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Input
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64"
            />
          </div>
          
          {canManageFranchises && (
            <Button onClick={() => handleOpenForm()} className="bg-eagle-primary hover:bg-eagle-primary/90">
              <Plus size={16} className="mr-2" />
              Nouvelle Franchise
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Emplacement</TableHead>
                <TableHead>Date de création</TableHead>
                {canManageFranchises && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFranchises.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={canManageFranchises ? 4 : 3} className="text-center py-8 text-gray-500">
                    Aucune franchise trouvée.
                  </TableCell>
                </TableRow>
              ) : (
                filteredFranchises.map((franchise) => (
                  <TableRow key={franchise.id}>
                    <TableCell className="font-medium">{franchise.name}</TableCell>
                    <TableCell>{franchise.location}</TableCell>
                    <TableCell>
                      {new Date(franchise.created_at).toLocaleDateString('fr-FR')}
                    </TableCell>
                    {canManageFranchises && (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleOpenForm(franchise)}
                          >
                            <Pencil size={14} />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleDelete(franchise.id)}
                            className="text-red-500 border-red-200 hover:bg-red-50"
                          >
                            <Trash size={14} />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedFranchise ? "Modifier la franchise" : "Nouvelle franchise"}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nom de la franchise *
              </label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nom de la franchise"
                required
              />
            </div>
            
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                Localisation *
              </label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ville, Pays"
                required
              />
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseForm}>
                Annuler
              </Button>
              <Button 
                type="submit"
                className="bg-eagle-primary hover:bg-eagle-primary/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <div className="h-4 w-4 border-t-2 border-white rounded-full animate-spin"></div>
                    {selectedFranchise ? "Mise à jour..." : "Création..."}
                  </span>
                ) : (
                  selectedFranchise ? "Mettre à jour" : "Créer"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FranchisesPage;
