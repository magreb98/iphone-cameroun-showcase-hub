
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Eye, Plus, Trash, Edit, Star } from "lucide-react";
import { Product } from "@/components/products/ProductCard";
import { uploadProductImages, deleteProductImage, setMainImage } from "@/api/products";

interface ProductImageViewerProps {
  products: Product[];
}

const ProductImageViewer = ({ products }: ProductImageViewerProps) => {
  const queryClient = useQueryClient();
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [isAddImageOpen, setIsAddImageOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState("");

  const selectedProduct = products.find(p => p.id.toString() === selectedProductId);

  // Mutation pour ajouter des images
  const addImageMutation = useMutation({
    mutationFn: async () => {
      if (!selectedProduct) return;
      
      if (uploadFiles.length > 0) {
        return uploadProductImages(selectedProduct.id, uploadFiles);
      } else if (newImageUrl.trim()) {
        // For URL-based images, we'd need to update the product
        throw new Error("URL upload not implemented in this component");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success("Image ajoutée avec succès");
      setNewImageUrl("");
      setUploadFiles([]);
      setIsAddImageOpen(false);
    },
    onError: () => {
      toast.error("Erreur lors de l'ajout de l'image");
    }
  });

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

  // Mutation pour définir comme image principale
  const setMainImageMutation = useMutation({
    mutationFn: ({ productId, imageId }: { productId: number, imageId: number }) => {
      return setMainImage(productId, imageId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success("Image principale définie avec succès");
    },
    onError: () => {
      toast.error("Erreur lors de la définition de l'image principale");
    }
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setUploadFiles(Array.from(files));
    }
  };

  const handleAddImage = () => {
    addImageMutation.mutate();
  };

  const handleDeleteImage = (imageId: number) => {
    if (!selectedProduct) return;
    deleteImageMutation.mutate({ productId: selectedProduct.id, imageId });
  };

  const handleSetMainImage = (imageId: number) => {
    if (!selectedProduct) return;
    setMainImageMutation.mutate({ productId: selectedProduct.id, imageId });
  };

  return (
    <div className="space-y-6">
      {/* Product Selector */}
      <div className="space-y-2">
        <Label htmlFor="product-select">Sélectionner un produit</Label>
        <Select value={selectedProductId} onValueChange={setSelectedProductId}>
          <SelectTrigger>
            <SelectValue placeholder="Choisir un produit..." />
          </SelectTrigger>
          <SelectContent>
            {products.map((product) => (
              <SelectItem key={product.id} value={product.id.toString()}>
                {product.name} - {product.location}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Product Images Display */}
      {selectedProduct && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">
              Images de: {selectedProduct.name}
            </CardTitle>
            <Dialog open={isAddImageOpen} onOpenChange={setIsAddImageOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-green-500 hover:bg-green-600">
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter Image
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Ajouter une nouvelle image</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="image-url">URL de l'image</Label>
                    <Input
                      id="image-url"
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  <div className="text-center text-sm text-gray-500">ou</div>
                  <div>
                    <Label htmlFor="image-upload">Télécharger des fichiers</Label>
                    <Input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileUpload}
                    />
                  </div>
                  <Button 
                    onClick={handleAddImage} 
                    disabled={!newImageUrl.trim() && uploadFiles.length === 0}
                    className="w-full"
                  >
                    Ajouter
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {selectedProduct.images && selectedProduct.images.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {selectedProduct.images.map((image) => (
                  <div 
                    key={image.id} 
                    className={`relative group border rounded-lg overflow-hidden ${
                      image.isMain ? 'border-blue-500 border-2' : 'border-gray-200'
                    }`}
                  >
                    <img 
                      src={image.url} 
                      alt={`Image ${image.id}`} 
                      className="w-full h-32 object-cover"
                    />
                    
                    {/* Image principale indicator */}
                    {image.isMain && (
                      <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                        Principale
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 bg-blue-500 text-white hover:bg-blue-600"
                        onClick={() => setSelectedImageUrl(image.url)}
                        title="Voir l'image"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      {!image.isMain && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 bg-yellow-500 text-white hover:bg-yellow-600"
                          onClick={() => handleSetMainImage(image.id)}
                          title="Définir comme principale"
                        >
                          <Star className="h-4 w-4" />
                        </Button>
                      )}
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 bg-red-500 text-white hover:bg-red-600"
                        onClick={() => handleDeleteImage(image.id)}
                        title="Supprimer l'image"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Image className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Aucune image disponible pour ce produit</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Image Viewer Dialog */}
      <Dialog open={!!selectedImageUrl} onOpenChange={() => setSelectedImageUrl("")}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Aperçu de l'image</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center">
            <img 
              src={selectedImageUrl} 
              alt="Aperçu" 
              className="max-w-full max-h-96 object-contain"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductImageViewer;
