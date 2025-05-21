import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/AdminLayout";
import { getUsers, createUser, updateUser, deleteUser, RegisterData, User } from "@/api/auth";
import { getLocations } from "@/api/locations";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const UsersPage = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<(RegisterData & { id?: number }) | null>(null);
  
  const queryClient = useQueryClient();
  
  const { data: users = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers
  });
  
  const { data: locations = [], isLoading: isLoadingLocations } = useQuery({
    queryKey: ['locations'],
    queryFn: getLocations
  });
  
  const createMutation = useMutation({
    mutationFn: (userData: RegisterData) => createUser(userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success("Utilisateur créé avec succès");
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast.error("Erreur lors de la création de l'utilisateur");
      console.error(error);
    }
  });
  
  const updateMutation = useMutation({
    mutationFn: ({ id, userData }: { id: number, userData: Partial<RegisterData> }) => 
      updateUser(id, userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success("Utilisateur mis à jour avec succès");
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast.error("Erreur lors de la mise à jour de l'utilisateur");
      console.error(error);
    }
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
        locationId: user.locationId
      });
    } else {
      setEditingUser({
        email: '',
        password: '',
        isAdmin: true,
        isSuperAdmin: false,
        locationId: null
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    
    const userData = { ...editingUser };
    
    // Si le mot de passe est vide et que c'est une mise à jour, supprimer le champ
    if (userData.id && !userData.password) {
      delete userData.password;
    }
    
    if (userData.id) {
      updateMutation.mutate({ id: userData.id, userData });
    } else {
      createMutation.mutate(userData);
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur?")) {
      deleteMutation.mutate(id);
    }
  };

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
        <div className="bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rôle</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Emplacement</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                    Aucun utilisateur trouvé
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.isSuperAdmin ? "Super Admin" : user.isAdmin ? "Admin" : "Utilisateur"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getLocationName(user.locationId)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleOpenDialog(user)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600" onClick={() => handleDelete(user.id)}>
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingUser?.id ? "Modifier l'utilisateur" : "Ajouter un utilisateur"}</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">Email</Label>
                <Input 
                  id="email" 
                  className="col-span-3"
                  type="email" 
                  value={editingUser?.email || ''} 
                  onChange={(e) => setEditingUser({...editingUser!, email: e.target.value})} 
                  required 
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="password" className="text-right">
                  {editingUser?.id ? "Nouveau mot de passe" : "Mot de passe"}
                </Label>
                <Input 
                  id="password" 
                  className="col-span-3"
                  type="password" 
                  value={editingUser?.password || ''} 
                  onChange={(e) => setEditingUser({...editingUser!, password: e.target.value})} 
                  required={!editingUser?.id} // Requis uniquement pour la création
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Rôle</Label>
                <div className="col-span-3 space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="isAdmin" 
                      checked={editingUser?.isAdmin || false}
                      onCheckedChange={(checked) => setEditingUser({...editingUser!, isAdmin: checked === true})}
                    />
                    <Label htmlFor="isAdmin">Administrateur</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="isSuperAdmin" 
                      checked={editingUser?.isSuperAdmin || false}
                      onCheckedChange={(checked) => setEditingUser({...editingUser!, isSuperAdmin: checked === true})}
                    />
                    <Label htmlFor="isSuperAdmin">Super Administrateur</Label>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="location" className="text-right">Emplacement</Label>
                <div className="col-span-3">
                  <Select 
                    value={editingUser?.locationId?.toString() || ""} 
                    onValueChange={(value) => setEditingUser({
                      ...editingUser!, 
                      locationId: value ? parseInt(value) : null
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un emplacement" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Aucun</SelectItem>
                      {locations.map((location) => (
                        <SelectItem key={location.id} value={location.id.toString()}>
                          {location.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingUser?.id ? "Mettre à jour" : "Ajouter"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default UsersPage;
