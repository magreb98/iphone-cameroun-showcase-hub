
import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createLocation, updateLocation, LocationFormData } from "@/api/locations";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Building, MapPin, Phone, Mail, Share2, Image } from "lucide-react";
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
      <DialogContent className="sm:max-w-[500px] dark:bg-gray-800 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 dark:text-white">
            <Building className="h-5 w-5" />
            {editingLocation?.id ? "Modifier le magasin" : "Ajouter un magasin"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-5 py-4">
          <div className="grid grid-cols-1 gap-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2 dark:text-gray-300">
                <Building className="h-4 w-4" /> Nom du magasin
              </Label>
              <Input 
                id="name" 
                name="name"
                placeholder="Entrez le nom du magasin"
                value={formData.name || ''} 
                onChange={handleChange} 
                required 
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address" className="flex items-center gap-2 dark:text-gray-300">
                <MapPin className="h-4 w-4" /> Adresse
              </Label>
              <Input 
                id="address" 
                name="address"
                placeholder="Adresse complète du magasin"
                value={formData.address || ''} 
                onChange={handleChange} 
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description" className="flex items-center gap-2 dark:text-gray-300">
                Description
              </Label>
              <Textarea 
                id="description" 
                name="description"
                placeholder="Décrivez brièvement le magasin"
                value={formData.description || ''} 
                onChange={handleChange}
                className="resize-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="imageUrl" className="flex items-center gap-2 dark:text-gray-300">
                <Image className="h-4 w-4" /> URL de l'image
              </Label>
              <Input 
                id="imageUrl" 
                name="imageUrl"
                placeholder="URL de l'image du magasin"
                value={formData.imageUrl || ''} 
                onChange={handleChange}
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              {formData.imageUrl && (
                <div className="mt-2 h-20 w-full overflow-hidden rounded-md bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  <img 
                    src={formData.imageUrl} 
                    alt="Aperçu" 
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "https://placehold.co/200x100?text=Image+non+disponible";
                    }}
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2 dark:text-gray-300">
                  <Phone className="h-4 w-4" /> Téléphone
                </Label>
                <Input 
                  id="phone" 
                  name="phone"
                  placeholder="Numéro de téléphone"
                  value={formData.phone || ''} 
                  onChange={handleChange}
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="whatsappNumber" className="flex items-center gap-2 dark:text-gray-300">
                  <Share2 className="h-4 w-4" /> WhatsApp
                </Label>
                <Input 
                  id="whatsappNumber" 
                  name="whatsappNumber"
                  placeholder="Numéro WhatsApp"
                  value={formData.whatsappNumber || ''} 
                  onChange={handleChange}
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2 dark:text-gray-300">
                <Mail className="h-4 w-4" /> Email
              </Label>
              <Input 
                id="email" 
                name="email"
                type="email"
                placeholder="Adresse email du magasin"
                value={formData.email || ''} 
                onChange={handleChange}
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>
          
          <DialogFooter className="pt-3 border-t dark:border-gray-700">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)} 
              type="button"
              className="dark:text-gray-300"
            >
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={createMutation.isPending || updateMutation.isPending}
              className="ml-2"
            >
              {editingLocation?.id ? "Mettre à jour" : "Ajouter"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LocationFormDialog;
