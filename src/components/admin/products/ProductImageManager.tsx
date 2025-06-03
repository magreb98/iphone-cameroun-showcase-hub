import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link, Upload, X } from "lucide-react";
import { uploadProductImages, deleteProductImage, setMainImage } from "@/api/products";
import ImageEditor from "./ImageEditor";

export interface ProductImage {
  id: number;
  url: string;
  isMain: boolean;
}

interface ImageManagerProps {
  productId?: number;
  imageUrl: string;
  setImageUrl: (url: string) => void;
  existingImages: ProductImage[];
  setExistingImages: (images: ProductImage[] | ((prev: ProductImage[]) => ProductImage[])) => void;
}

const ProductImageManager = ({ 
  productId, 
  imageUrl, 
  setImageUrl, 
  existingImages, 
  setExistingImages 
}: ImageManagerProps) => {
  const queryClient = useQueryClient();
  const [imageTab, setImageTab] = useState<"url" | "upload">("url");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);

  // Mutation pour supprimer une image
  const deleteImageMutation = useMutation({
    mutationFn: ({ productId, imageId }: { productId: number, imageId: number }) => {
      return deleteProductImage(productId, imageId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success("Image supprimée avec succès");
    },
    onError: () => {
      toast.error("Erreur lors de la suppression de l'image");
    }
  });

  // Mutation pour définir une image comme principale
  const setMainImageMutation = useMutation({
    mutationFn: ({ productId, imageId }: { productId: number, imageId: number }) => {
      return setMainImage(productId, imageId);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success("Image principale définie avec succès");
      
      // Update existing images locally
      setExistingImages((prev: ProductImage[]): ProductImage[] => 
        prev.map(img => ({
          ...img,
          isMain: img.id === data.image.id
        }))
      );
    },
    onError: () => {
      toast.error("Erreur lors de la définition de l'image principale");
    }
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      // Convert FileList to Array
      const newFiles = Array.from(files);
      setSelectedFiles(prev => [...prev, ...newFiles]);
      
      // Create preview URLs for the images
      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setPreviewImages(prev => [...prev, ...newPreviews]);
      
      // If this is the first image and no URL is set, use the first preview for main image
      if (!imageUrl && previewImages.length === 0 && newPreviews.length > 0) {
        setImageUrl("Preview image will be uploaded");
      }
    }
  };

  const removeImage = (index: number) => {
    // Remove preview URL
    URL.revokeObjectURL(previewImages[index]);
    
    // Update state
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleDeleteExistingImage = (imageId: number) => {
    if (!productId) return;
    
    deleteImageMutation.mutate({ 
      productId, 
      imageId 
    });
    
    // Also remove from local state
    setExistingImages((prev: ProductImage[]): ProductImage[] => 
      prev.filter(img => img.id !== imageId)
    );
  };

  const handleSetMainImage = (imageId: number) => {
    if (!productId) return;
    
    setMainImageMutation.mutate({
      productId,
      imageId
    });
  };

  const handleUpdateImage = (imageId: number, newUrl: string) => {
    // Update local state immediately for better UX
    setExistingImages((prev: ProductImage[]): ProductImage[] => 
      prev.map(img => img.id === imageId ? { ...img, url: newUrl } : img)
    );
    
    // If it's the main image, update the main imageUrl too
    const updatedImage = existingImages.find(img => img.id === imageId);
    if (updatedImage?.isMain) {
      setImageUrl(newUrl);
    }
    
    toast.success("Image mise à jour");
  };

  const handleTabChange = (value: string) => {
    setImageTab(value as "url" | "upload");
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageUrl(e.target.value);
  };

  return (
    <div className="grid grid-cols-4 items-center gap-4">
      <Label className="text-right">
        Image
      </Label>
      <div className="col-span-3">
        <Tabs value={imageTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="url" className="flex items-center">
              <Link className="h-4 w-4 mr-2" />
              URL
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center">
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </TabsTrigger>
          </TabsList>
          <TabsContent value="url" className="mt-2">
            <Input
              id="imageUrl"
              name="imageUrl"
              placeholder="https://example.com/image.jpg"
              value={imageTab === "url" ? imageUrl : ""}
              onChange={handleUrlChange}
            />
          </TabsContent>
          <TabsContent value="upload" className="mt-2">
            <Input
              id="imageUpload"
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
            />
            
            {previewImages.length > 0 && (
              <div className="mt-3">
                <p className="text-sm text-muted-foreground mb-2">
                  {selectedFiles.length} image(s) sélectionnée(s)
                </p>
                <div className="flex flex-wrap gap-2">
                  {previewImages.map((preview, index) => (
                    <div key={index} className="relative w-16 h-16 border rounded overflow-hidden">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-0 right-0 bg-red-500 text-white p-0.5 rounded-bl"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {imageTab === "url" && imageUrl && (
          <div className="mt-4">
            <p className="text-sm text-muted-foreground mb-1">Aperçu:</p>
            <img 
              src={imageUrl} 
              alt="Aperçu" 
              className="h-24 object-contain border rounded"
            />
          </div>
        )}
      </div>

      {/* Gestion des images existantes avec édition individuelle */}
      {productId && existingImages.length > 0 && (
        <div className="grid grid-cols-4 items-start gap-4">
          <Label className="text-right pt-2">
            Images existantes
          </Label>
          <div className="col-span-3">
            <div className="flex flex-wrap gap-2">
              {existingImages.map((image) => (
                <ImageEditor
                  key={image.id}
                  image={image}
                  onUpdate={handleUpdateImage}
                  onDelete={handleDeleteExistingImage}
                  onSetMain={handleSetMainImage}
                  productId={productId}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductImageManager;
