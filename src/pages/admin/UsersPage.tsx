
import { useQuery } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { getLocations } from "@/api/locations";
import UserForm from "@/components/admin/users/UserForm";
import UserTable from "@/components/admin/users/UserTable";
import { useUsers } from "@/hooks/useUsers";

const UsersPage = () => {
  const {
    users,
    isLoadingUsers,
    isDialogOpen,
    editingUser,
    setIsDialogOpen,
    handleOpenDialog,
    handleDelete
  } = useUsers();
  
  const { data: locations = [], isLoading: isLoadingLocations } = useQuery({
    queryKey: ['locations'],
    queryFn: getLocations
  });

  const getLocationName = (locationId: number | null) => {
    if (!locationId) return "Aucun";
    const location = locations.find(loc => loc.id === locationId);
    return location ? location.name : "Inconnu";
  };

  return (
    <AdminLayout title="Gestion des Utilisateurs">
      <div className="mb-6 flex justify-end">
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" /> Ajouter un utilisateur
        </Button>
      </div>

      {isLoadingUsers || isLoadingLocations ? (
        <div className="text-center py-10">Chargement...</div>
      ) : (
        <UserTable 
          users={users} 
          onEdit={handleOpenDialog} 
          onDelete={handleDelete} 
          getLocationName={getLocationName} 
        />
      )}

      <UserForm 
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        editingUser={editingUser}
        locations={locations}
      />
    </AdminLayout>
  );
};

export default UsersPage;
