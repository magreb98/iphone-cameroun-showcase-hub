import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link, Upload } from "lucide-react";
import { deleteProductImage, setMainImage } from "@/api/products";
import ImageUploadTab from "./ImageUploadTab";
import ImageUrlTab from "./ImageUrlTab";
import ExistingImagesGrid from "./ExistingImagesGrid";

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

  const handleFileSelect = (newFiles: File[]) => {
    setSelectedFiles(prev => [...prev, ...newFiles]);
    
    const newPreviews = newFiles.map(file => URL.createObjectURL(file));
    setPreviewImages(prev => [...prev, ...newPreviews]);
    
    if (!imageUrl && previewImages.length === 0 && newPreviews.length > 0) {
      setImageUrl("Preview image will be uploaded");
    }
  };

  const removePreviewImage = (index: number) => {
    URL.revokeObjectURL(previewImages[index]);
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleDeleteExistingImage = (imageId: number) => {
    if (!productId) return;
    
    deleteImageMutation.mutate({ productId, imageId });
    setExistingImages((prev: ProductImage[]): ProductImage[] => 
      prev.filter(img => img.id !== imageId)
    );
  };

  const handleSetMainImage = (imageId: number) => {
    if (!productId) return;
    setMainImageMutation.mutate({ productId, imageId });
  };

  const handleUpdateImage = (imageId: number, newUrl: string) => {
    setExistingImages((prev: ProductImage[]): ProductImage[] => 
      prev.map(img => img.id === imageId ? { ...img, url: newUrl } : img)
    );
    
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
    <div className="space-y-4">
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
            <TabsContent value="url">
              <ImageUrlTab
                imageUrl={imageTab === "url" ? imageUrl : ""}
                onUrlChange={handleUrlChange}
                showPreview={imageTab === "url"}
              />
            </TabsContent>
            <TabsContent value="upload">
              <ImageUploadTab
                onFileSelect={handleFileSelect}
                previewImages={previewImages}
                onRemoveImage={removePreviewImage}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <ExistingImagesGrid
        productId={productId}
        existingImages={existingImages}
        onUpdateImage={handleUpdateImage}
        onDeleteImage={handleDeleteExistingImage}
        onSetMainImage={handleSetMainImage}
      />
    </div>
  );
};

export default ProductImageManager;
