
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, Loader2 } from "lucide-react";
import { Role } from "@/types/auth";

interface UserData {
  id: string;
  name: string;
  email: string;
  role: Role;
  created_at: string;
}

interface UserTableProps {
  users: UserData[];
  loading: boolean;
  searchTerm: string;
  onEdit: (user: UserData) => void;
  onDelete: (userId: string) => void;
}

export const formatRole = (role: string): string => {
  switch(role) {
    case 'admin': return 'Administrateur';
    case 'commercial': return 'Commercial';
    case 'franchise_manager': return 'Gérant de franchise';
    case 'supervisor': return 'Superviseur';
    case 'inspector': return 'Inspecteur';
    default: return role;
  }
};

export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('fr-FR', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

const UserTable: React.FC<UserTableProps> = ({ 
  users, 
  loading, 
  searchTerm, 
  onEdit, 
  onDelete 
}) => {
  const { user } = useAuth();
  
  const filteredUsers = users.filter(userData => 
    userData.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    userData.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    userData.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="border rounded-md overflow-hidden">
      <Table>
        <TableCaption>Liste des utilisateurs</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Nom</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Rôle</TableHead>
            <TableHead>Date de création</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredUsers.length > 0 ? (
            filteredUsers.map((userData) => (
              <TableRow key={userData.id}>
                <TableCell className="font-medium">{userData.name}</TableCell>
                <TableCell>{userData.email}</TableCell>
                <TableCell>{formatRole(userData.role)}</TableCell>
                <TableCell>{formatDate(userData.created_at)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(userData)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(userData.id)}
                      disabled={user?.id === userData.id} // Can't delete yourself
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8">
                Aucun utilisateur trouvé
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default UserTable;
