
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUsers, deleteUser, RegisterData, User } from "@/api/auth";
import { toast } from "sonner";

export const useUsers = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<(RegisterData & { id?: number }) | null>(null);
  
  const queryClient = useQueryClient();
  
  const { data: users = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers
  });
  
  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success("Utilisateur supprimé avec succès");
    },
    onError: (error) => {
      toast.error("Erreur lors de la suppression de l'utilisateur");
      console.error(error);
    }
  });

  const handleOpenDialog = (user?: User) => {
    if (user) {
      setEditingUser({
        id: user.id,
        email: user.email,
        password: '', // Le mot de passe ne doit pas être pré-rempli
        isAdmin: user.isAdmin,
        isSuperAdmin: user.isSuperAdmin,
        locationId: user.locationId,
        name: user.name
      });
    } else {
      setEditingUser({
        email: '',
        password: '',
        isAdmin: true,
        isSuperAdmin: false,
        locationId: null,
        name: null
      });
    }
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur?")) {
      deleteMutation.mutate(id);
    }
  };

  return {
    users,
    isLoadingUsers,
    isDialogOpen,
    editingUser,
    setIsDialogOpen,
    handleOpenDialog,
    handleDelete
  };
};
