
import { useAuth } from "@/contexts/AuthContext";
import { useUsers } from "@/hooks/useUsers";
import AddUserDialog from "@/components/users/AddUserDialog";
import EditUserDialog from "@/components/users/EditUserDialog";
import UserTable from "@/components/users/UserTable";
import SearchBar from "@/components/users/SearchBar";

const Users = () => {
  const { user } = useAuth();
  const {
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
  } = useUsers();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestion des Utilisateurs</h1>
        
        <AddUserDialog 
          open={openAddDialog}
          onOpenChange={setOpenAddDialog}
          onAddUser={handleAddUser}
        />
      </div>

      <SearchBar 
        value={searchTerm} 
        onChange={(e) => setSearchTerm(e.target.value)} 
      />

      <UserTable 
        users={users} 
        loading={loading} 
        searchTerm={searchTerm} 
        onEdit={(user) => {
          setSelectedUser(user);
          setOpenEditDialog(true);
        }}
        onDelete={handleDeleteUser}
      />

      <EditUserDialog
        open={openEditDialog}
        onOpenChange={setOpenEditDialog}
        selectedUser={selectedUser}
        onEditInputChange={handleEditInputChange}
        onEditRoleChange={handleEditRoleChange}
        onUpdateUser={handleUpdateUser}
      />
    </div>
  );
};

export default Users;
