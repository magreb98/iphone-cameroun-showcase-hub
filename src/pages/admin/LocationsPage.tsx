
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/AdminLayout";
import { getLocations, deleteLocation, Location, LocationFormData } from "@/api/locations";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash, Building } from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import LocationFormDialog from "@/components/admin/locations/LocationFormDialog";
import { useAuth } from "@/hooks/useAuth";

const LocationsPage = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<LocationFormData | null>(null);
  
  const queryClient = useQueryClient();
  const { isSuperAdmin } = useAuth();
  
  // Always fetch locations, regardless of user role
  const { data: locations = [], isLoading } = useQuery({
    queryKey: ['locations'],
    queryFn: getLocations
  });
  
  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteLocation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      toast.success("Magasin supprimé avec succès");
    },
    onError: (error) => {
      toast.error("Erreur lors de la suppression du magasin");
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
        whatsappNumber: location.whatsappNumber || null
      });
    } else {
      setEditingLocation(null);
    }
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce magasin?")) {
      deleteMutation.mutate(id);
    }
  };

  // If not superadmin, show access denied screen
  if (!isSuperAdmin) {
    return (
      <AdminLayout title="Accès refusé">
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <Building className="h-16 w-16 text-gray-400" />
          <h2 className="text-xl font-medium text-gray-700">Accès refusé</h2>
          <p className="text-gray-500">Seuls les super administrateurs peuvent gérer les magasins.</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Gestion des Magasins">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-xl font-semibold flex items-center">
          <Building className="mr-2 h-5 w-5" />
          Liste des magasins
        </h2>
        <Button onClick={() => handleOpenDialog()} className="flex items-center">
          <Plus className="mr-2 h-4 w-4" /> Ajouter un magasin
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
                    Aucun magasin trouvé
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
                          {location.whatsappNumber && <div>WhatsApp: {location.whatsappNumber}</div>}
                        </>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleOpenDialog(location)} 
                          className="flex items-center">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600 flex items-center" 
                          onClick={() => handleDelete(location.id)}>
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

      <LocationFormDialog 
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        editingLocation={editingLocation}
      />
    </AdminLayout>
  );
};

export default LocationsPage;
