
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Role } from "@/types/auth";

interface UserData {
  id: string;
  name: string;
  email: string;
  role: Role;
  created_at: string;
}

interface NewUserData {
  name: string; 
  email: string;
  password: string;
  role: Role;
}

export const useUsers = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Using direct SQL query to avoid RLS recursion issues
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setUsers(data as UserData[]);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de charger les utilisateurs",
        variant: "destructive",
      });
      // Set empty array to prevent UI errors
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = async (newUser: NewUserData) => {
    try {
      // 1. Create the user in Supabase Auth
      const { data, error } = await supabase.auth.admin.createUser({
        email: newUser.email,
        password: newUser.password,
        email_confirm: true,
        user_metadata: {
          name: newUser.name,
          role: newUser.role,
        },
      });

      if (error) throw error;

      // 2. Update the profile with the role (the trigger should create the profile)
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ role: newUser.role })
        .eq('id', data.user.id);

      if (updateError) throw updateError;

      toast({
        title: "Succès",
        description: "L'utilisateur a été créé avec succès",
      });

      setOpenAddDialog(false);
      fetchUsers();
    } catch (error: any) {
      console.error('Error adding user:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer l'utilisateur",
        variant: "destructive",
      });
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: selectedUser.name,
          role: selectedUser.role,
        })
        .eq('id', selectedUser.id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "L'utilisateur a été mis à jour avec succès",
      });

      setOpenEditDialog(false);
      fetchUsers();
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de mettre à jour l'utilisateur",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) return;

    try {
      // Delete the user from auth (this should cascade to profiles due to FK)
      const { error } = await supabase.auth.admin.deleteUser(userId);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "L'utilisateur a été supprimé avec succès",
      });

      fetchUsers();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer l'utilisateur",
        variant: "destructive",
      });
    }
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedUser) return;
    
    const { name, value } = e.target;
    setSelectedUser({ ...selectedUser, [name]: value });
  };

  const handleEditRoleChange = (value: string) => {
    if (!selectedUser) return;
    
    setSelectedUser({
      ...selectedUser,
      role: value as Role,
    });
  };

  return {
    users,
    loading,
    openAddDialog,
    setOpenAddDialog,
    openEditDialog,
    setOpenEditDialog,
    selectedUser,
    setSelectedUser,
    searchTerm,
    setSearchTerm,
    handleAddUser,
    handleUpdateUser,
    handleDeleteUser,
    handleEditInputChange,
    handleEditRoleChange
  };
};
