
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/AdminLayout";
import { getLocations, createLocation, updateLocation, deleteLocation, Location, LocationFormData } from "@/api/locations";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const LocationsPage = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<LocationFormData | null>(null);
  
  const queryClient = useQueryClient();
  
  const { data: locations = [], isLoading } = useQuery({
    queryKey: ['locations'],
    queryFn: getLocations
  });
  
  const createMutation = useMutation({
    mutationFn: (locationData: LocationFormData) => createLocation({
      ...locationData,
      whatsappNumber: locationData.whatsappNumber || null,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      toast.success("Emplacement créé avec succès");
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast.error("Erreur lors de la création de l'emplacement");
      console.error(error);
    }
  });
  
  const updateMutation = useMutation({
    mutationFn: ({ id, locationData }: { id: number, locationData: LocationFormData }) => 
      updateLocation(id, {
        ...locationData,
        whatsappNumber: locationData.whatsappNumber || null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      toast.success("Emplacement mis à jour avec succès");
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast.error("Erreur lors de la mise à jour de l'emplacement");
      console.error(error);
    }
  });
  
  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteLocation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      toast.success("Emplacement supprimé avec succès");
    },
    onError: (error) => {
      toast.error("Erreur lors de la suppression de l'emplacement");
      console.error(error);
    }
  });

  const handleOpenDialog = (location?: Location) => {
    if (location) {
      setEditingLocation({
        id: location.id,
        name: location.name,
        address: location.address || '',
        description: location.description || '',
        imageUrl: location.imageUrl || '',
        phone: location.phone || '',
        email: location.email || '',
        whatsappNumber: location.whatsappNumber
      });
    } else {
      setEditingLocation({
        name: '',
        address: '',
        description: '',
        imageUrl: '',
        phone: '',
        email: '',
        whatsappNumber: null
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLocation) return;
    
    if (editingLocation.id) {
      updateMutation.mutate({ id: editingLocation.id, locationData: editingLocation });
    } else {
      createMutation.mutate(editingLocation);
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet emplacement?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <AdminLayout title="Gestion des Emplacements">
      <div className="mb-6 flex justify-end">
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" /> Ajouter un emplacement
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-10">Chargement...</div>
      ) : (
        <div className="bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Adresse</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {locations.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                    Aucun emplacement trouvé
                  </td>
                </tr>
              ) : (
                locations.map((location) => (
                  <tr key={location.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {location.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {location.address || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {location.phone || location.email ? (
                        <>
                          {location.phone && <div>{location.phone}</div>}
                          {location.email && <div>{location.email}</div>}
                        </>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleOpenDialog(location)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600" onClick={() => handleDelete(location.id)}>
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
            <DialogTitle>{editingLocation?.id ? "Modifier l'emplacement" : "Ajouter un emplacement"}</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Nom</Label>
                <Input 
                  id="name" 
                  className="col-span-3" 
                  value={editingLocation?.name || ''} 
                  onChange={(e) => setEditingLocation({...editingLocation!, name: e.target.value})} 
                  required 
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="address" className="text-right">Adresse</Label>
                <Input 
                  id="address" 
                  className="col-span-3" 
                  value={editingLocation?.address || ''} 
                  onChange={(e) => setEditingLocation({...editingLocation!, address: e.target.value})} 
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">Description</Label>
                <Textarea 
                  id="description" 
                  className="col-span-3" 
                  value={editingLocation?.description || ''} 
                  onChange={(e) => setEditingLocation({...editingLocation!, description: e.target.value})} 
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="imageUrl" className="text-right">URL Image</Label>
                <Input 
                  id="imageUrl" 
                  className="col-span-3" 
                  value={editingLocation?.imageUrl || ''} 
                  onChange={(e) => setEditingLocation({...editingLocation!, imageUrl: e.target.value})} 
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">Téléphone</Label>
                <Input 
                  id="phone" 
                  className="col-span-3" 
                  value={editingLocation?.phone || ''} 
                  onChange={(e) => setEditingLocation({...editingLocation!, phone: e.target.value})} 
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">Email</Label>
                <Input 
                  id="email" 
                  className="col-span-3" 
                  type="email"
                  value={editingLocation?.email || ''} 
                  onChange={(e) => setEditingLocation({...editingLocation!, email: e.target.value})} 
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="whatsappNumber" className="text-right">WhatsApp</Label>
                <Input 
                  id="whatsappNumber" 
                  className="col-span-3" 
                  value={editingLocation?.whatsappNumber || ''} 
                  onChange={(e) => setEditingLocation({...editingLocation!, whatsappNumber: e.target.value || null})} 
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingLocation?.id ? "Mettre à jour" : "Ajouter"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default LocationsPage;
