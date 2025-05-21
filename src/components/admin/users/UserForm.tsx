
import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createUser, updateUser, RegisterData, User } from "@/api/auth";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface UserFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingUser: (RegisterData & { id?: number }) | null;
  locations: { id: number; name: string }[];
}

const UserForm = ({ isOpen, onOpenChange, editingUser, locations }: UserFormProps) => {
  const [userData, setUserData] = useState<(RegisterData & { id?: number }) | null>(editingUser);
  const queryClient = useQueryClient();

  useEffect(() => {
    setUserData(editingUser);
  }, [editingUser]);

  const createMutation = useMutation({
    mutationFn: (data: RegisterData) => createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success("Utilisateur créé avec succès");
      onOpenChange(false);
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
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error("Erreur lors de la mise à jour de l'utilisateur");
      console.error(error);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData) return;
    
    const submittedData = { ...userData };
    
    // If the password is empty and it's an update, remove the field
    if (submittedData.id && !submittedData.password) {
      delete submittedData.password;
    }
    
    if (submittedData.id) {
      updateMutation.mutate({ id: submittedData.id, userData: submittedData });
    } else {
      createMutation.mutate(submittedData);
    }
  };

  if (!userData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{userData?.id ? "Modifier l'utilisateur" : "Ajouter un utilisateur"}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">Email</Label>
              <Input 
                id="email" 
                className="col-span-3"
                type="email" 
                value={userData?.email || ''} 
                onChange={(e) => setUserData({...userData, email: e.target.value})} 
                required 
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                {userData?.id ? "Nouveau mot de passe" : "Mot de passe"}
              </Label>
              <Input 
                id="password" 
                className="col-span-3"
                type="password" 
                value={userData?.password || ''} 
                onChange={(e) => setUserData({...userData, password: e.target.value})} 
                required={!userData?.id} // Requis uniquement pour la création
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Nom</Label>
              <Input 
                id="name" 
                className="col-span-3"
                type="text" 
                value={userData?.name || ''} 
                onChange={(e) => setUserData({...userData, name: e.target.value})} 
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Rôle</Label>
              <div className="col-span-3 space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="isAdmin" 
                    checked={userData?.isAdmin || false}
                    onCheckedChange={(checked) => setUserData({...userData, isAdmin: checked === true})}
                  />
                  <Label htmlFor="isAdmin">Administrateur</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="isSuperAdmin" 
                    checked={userData?.isSuperAdmin || false}
                    onCheckedChange={(checked) => setUserData({...userData, isSuperAdmin: checked === true})}
                  />
                  <Label htmlFor="isSuperAdmin">Super Administrateur</Label>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="location" className="text-right">Emplacement</Label>
              <div className="col-span-3">
                <Select 
                  value={userData?.locationId?.toString() || ""} 
                  onValueChange={(value) => setUserData({
                    ...userData, 
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
              {userData?.id ? "Mettre à jour" : "Ajouter"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UserForm;
