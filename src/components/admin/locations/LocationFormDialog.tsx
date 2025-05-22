
import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createLocation, updateLocation, Location, LocationFormData } from "@/api/locations";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface LocationFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingLocation: LocationFormData | null;
}

const LocationFormDialog = ({ 
  open, 
  onOpenChange, 
  editingLocation 
}: LocationFormDialogProps) => {
  const [formData, setFormData] = useState<LocationFormData>({
    name: '',
    address: '',
    description: '',
    imageUrl: '',
    phone: '',
    email: '',
    whatsappNumber: null
  });
  
  const queryClient = useQueryClient();
  
  // Reset form when the dialog is opened with a new location
  useEffect(() => {
    if (editingLocation) {
      setFormData(editingLocation);
    } else {
      setFormData({
        name: '',
        address: '',
        description: '',
        imageUrl: '',
        phone: '',
        email: '',
        whatsappNumber: null
      });
    }
  }, [editingLocation, open]);
  
  const createMutation = useMutation({
    mutationFn: (data: LocationFormData) => createLocation({
      ...data,
      whatsappNumber: data.whatsappNumber || null,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      toast.success("Magasin créé avec succès");
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error("Erreur lors de la création du magasin");
      console.error(error);
    }
  });
  
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: LocationFormData }) => 
      updateLocation(id, {
        ...data,
        whatsappNumber: data.whatsappNumber || null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      toast.success("Magasin mis à jour avec succès");
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error("Erreur lors de la mise à jour du magasin");
      console.error(error);
    }
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingLocation?.id) {
      updateMutation.mutate({ id: editingLocation.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{editingLocation?.id ? "Modifier le magasin" : "Ajouter un magasin"}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Nom</Label>
              <Input 
                id="name" 
                name="name"
                className="col-span-3" 
                value={formData.name || ''} 
                onChange={handleChange} 
                required 
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="address" className="text-right">Adresse</Label>
              <Input 
                id="address" 
                name="address"
                className="col-span-3" 
                value={formData.address || ''} 
                onChange={handleChange} 
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">Description</Label>
              <Textarea 
                id="description" 
                name="description"
                className="col-span-3" 
                value={formData.description || ''} 
                onChange={handleChange} 
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="imageUrl" className="text-right">URL Image</Label>
              <Input 
                id="imageUrl" 
                name="imageUrl"
                className="col-span-3" 
                value={formData.imageUrl || ''} 
                onChange={handleChange} 
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">Téléphone</Label>
              <Input 
                id="phone" 
                name="phone"
                className="col-span-3" 
                value={formData.phone || ''} 
                onChange={handleChange} 
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">Email</Label>
              <Input 
                id="email" 
                name="email"
                type="email"
                className="col-span-3" 
                value={formData.email || ''} 
                onChange={handleChange} 
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="whatsappNumber" className="text-right">WhatsApp</Label>
              <Input 
                id="whatsappNumber" 
                name="whatsappNumber"
                className="col-span-3" 
                value={formData.whatsappNumber || ''} 
                onChange={handleChange} 
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
  );
};

export default LocationFormDialog;
