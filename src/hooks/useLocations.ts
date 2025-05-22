
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { 
  getLocations, 
  getLocation, 
  createLocation, 
  updateLocation, 
  deleteLocation,
  Location,
  LocationFormData
} from "@/api/locations";
import { Phone } from "lucide-react";

export const useLocations = (initialSearchQuery: string = "") => {
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<LocationFormData | null>(null);
  
  const queryClient = useQueryClient();
  
  // Fetch all locations
  const { 
    data: locations = [], 
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['locations'],
    queryFn: getLocations
  });
  
  // Filter locations based on search query
  const filteredLocations = searchQuery 
    ? locations.filter(location => 
        location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (location.address && location.address.toLowerCase().includes(searchQuery.toLowerCase())))
    : locations;
  
  // Create location mutation
  const createMutation = useMutation({
    mutationFn: (data: Omit<Location, 'id'>) => createLocation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      toast.success("Magasin créé avec succès");
      setIsFormDialogOpen(false);
    },
    onError: (error) => {
      toast.error("Erreur lors de la création du magasin");
      console.error(error);
    }
  });
  
  // Update location mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: Partial<Omit<Location, 'id'>> }) => 
      updateLocation(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      toast.success("Magasin mis à jour avec succès");
      setIsFormDialogOpen(false);
    },
    onError: (error) => {
      toast.error("Erreur lors de la mise à jour du magasin");
      console.error(error);
    }
  });
  
  // Delete location mutation
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
  
  // Handle opening the location form dialog
  const handleOpenFormDialog = (location?: Location) => {
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
    setIsFormDialogOpen(true);
  };
  
  // Handle deleting a location with confirmation
  const handleDeleteLocation = (id: number) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce magasin?")) {
      deleteMutation.mutate(id);
    }
  };
  
  // Handle submitting the location form
  const handleSubmitLocation = (formData: LocationFormData) => {
    if (formData.id) {
      // Update existing location
      const { id, ...data } = formData;
      updateMutation.mutate({ id, data });
    } else {
      // Create new location
      createMutation.mutate(formData as Omit<Location, 'id'>);
    }
  };
  
  // Utility functions for location interactions
  const openLocationInMaps = (address: string | null) => {
    if (!address) return;
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    window.open(mapsUrl, '_blank');
  };
  
  const openWhatsApp = (whatsappNumber: string | null) => {
    if (!whatsappNumber) return;
    window.open(`https://wa.me/${whatsappNumber.replace(/\+/g, '')}`, '_blank');
  };
  
  const shareLocation = (location: Location) => {
    if (navigator.share) {
      navigator.share({
        title: `iPhone Cameroun - ${location.name}`,
        text: `Découvrez le magasin iPhone Cameroun à ${location.name}${location.address ? ` - ${location.address}` : ''}`,
        url: window.location.href,
      })
      .catch((error) => console.error('Erreur de partage:', error));
    }
  };
  
  return {
    locations,
    filteredLocations,
    searchQuery,
    setSearchQuery,
    isLoading,
    isError,
    error,
    refetch,
    isFormDialogOpen,
    setIsFormDialogOpen,
    editingLocation,
    setEditingLocation,
    handleOpenFormDialog,
    handleDeleteLocation,
    handleSubmitLocation,
    openLocationInMaps,
    openWhatsApp,
    shareLocation,
    createMutation,
    updateMutation,
    deleteMutation
  };
};

export default useLocations;
