
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Eye, Plus, Trash, Star, ImageIcon, Upload, Link } from "lucide-react";
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
  const [imageMode, setImageMode] = useState<"url" | "upload">("upload");

  const selectedProduct = products.find(p => p.id.toString() === selectedProductId);

  // Mutation pour ajouter des images
  const addImageMutation = useMutation({
    mutationFn: async () => {
      if (!selectedProduct) throw new Error("Aucun produit sélectionné");
      
      if (uploadFiles.length > 0) {
        return uploadProductImages(selectedProduct.id, uploadFiles);
      } else if (newImageUrl.trim()) {
        // Pour les URL, on pourrait implémenter une fonction spécifique
        throw new Error("L'ajout par URL n'est pas encore implémenté");
      }
      throw new Error("Aucune image sélectionnée");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success("Image(s) ajoutée(s) avec succès");
      setNewImageUrl("");
      setUploadFiles([]);
      setIsAddImageOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.message || "Erreur lors de l'ajout de l'image");
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
    if (imageMode === "upload" && uploadFiles.length === 0) {
      toast.error("Veuillez sélectionner au moins un fichier");
      return;
    }
    if (imageMode === "url" && !newImageUrl.trim()) {
      toast.error("Veuillez saisir une URL valide");
      return;
    }
    addImageMutation.mutate();
  };

  const handleDeleteImage = (imageId: number) => {
    if (!selectedProduct) return;
    if (confirm("Êtes-vous sûr de vouloir supprimer cette image ?")) {
      deleteImageMutation.mutate({ productId: selectedProduct.id, imageId });
    }
  };

  const handleSetMainImage = (imageId: number) => {
    if (!selectedProduct) return;
    setMainImageMutation.mutate({ productId: selectedProduct.id, imageId });
  };

  return (
    <div className="space-y-6">
      {/* Sélecteur de produit avec instructions */}
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">Comment utiliser cette fonctionnalité :</h3>
          <ol className="text-sm text-blue-800 space-y-1">
            <li>1. Sélectionnez un produit dans la liste ci-dessous</li>
            <li>2. Visualisez toutes ses images existantes</li>
            <li>3. Cliquez sur "Ajouter Image" pour en ajouter de nouvelles</li>
            <li>4. Utilisez les boutons sur chaque image pour la voir, la définir comme principale ou la supprimer</li>
          </ol>
        </div>

        <div className="space-y-2">
          <Label htmlFor="product-select" className="text-base font-medium">Sélectionner un produit</Label>
          <Select value={selectedProductId} onValueChange={setSelectedProductId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choisir un produit pour gérer ses images..." />
            </SelectTrigger>
            <SelectContent>
              {products.map((product) => (
                <SelectItem key={product.id} value={product.id.toString()}>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{product.name}</span>
                    <span className="text-sm text-gray-500">- {product.location}</span>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {product.images?.length || 0} image(s)
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Affichage des images du produit sélectionné */}
      {selectedProduct && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">
                Images de: {selectedProduct.name}
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                {selectedProduct.images?.length || 0} image(s) • Magasin: {selectedProduct.location}
              </p>
            </div>
            
            <Dialog open={isAddImageOpen} onOpenChange={setIsAddImageOpen}>
              <DialogTrigger asChild>
                <Button className="bg-green-500 hover:bg-green-600">
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter Image
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Ajouter une nouvelle image</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  {/* Mode sélection */}
                  <div className="flex space-x-2 bg-gray-100 p-1 rounded">
                    <Button
                      type="button"
                      variant={imageMode === "upload" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setImageMode("upload")}
                      className="flex-1"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </Button>
                    <Button
                      type="button"
                      variant={imageMode === "url" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setImageMode("url")}
                      className="flex-1"
                    >
                      <Link className="h-4 w-4 mr-2" />
                      URL
                    </Button>
                  </div>

                  {imageMode === "url" ? (
                    <div>
                      <Label htmlFor="image-url">URL de l'image</Label>
                      <Input
                        id="image-url"
                        value={newImageUrl}
                        onChange={(e) => setNewImageUrl(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                      />
                      {newImageUrl && (
                        <div className="mt-2">
                          <img 
                            src={newImageUrl} 
                            alt="Aperçu" 
                            className="w-full h-32 object-contain border rounded"
                            onError={() => toast.error("URL d'image invalide")}
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <Label htmlFor="image-upload">Télécharger des fichiers</Label>
                      <Input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileUpload}
                        className="cursor-pointer"
                      />
                      {uploadFiles.length > 0 && (
                        <div className="mt-2 text-sm text-green-600">
                          {uploadFiles.length} fichier(s) sélectionné(s)
                        </div>
                      )}
                    </div>
                  )}

                  <Button 
                    onClick={handleAddImage} 
                    disabled={addImageMutation.isPending || (imageMode === "upload" && uploadFiles.length === 0) || (imageMode === "url" && !newImageUrl.trim())}
                    className="w-full"
                  >
                    {addImageMutation.isPending ? "Ajout en cours..." : "Ajouter"}
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
                    className={`relative group border-2 rounded-lg overflow-hidden transition-all ${
                      image.isMain ? 'border-blue-500 shadow-lg' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img 
                      src={image.url} 
                      alt={`Image ${image.id}`} 
                      className="w-full h-40 object-cover"
                    />
                    
                    {/* Indicateur image principale */}
                    {image.isMain && (
                      <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded font-medium">
                        ✓ Principale
                      </div>
                    )}

                    {/* Boutons d'action */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-8 w-8 p-0"
                        onClick={() => setSelectedImageUrl(image.url)}
                        title="Voir l'image en grand"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      {!image.isMain && (
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-8 w-8 p-0 bg-yellow-500 hover:bg-yellow-600"
                          onClick={() => handleSetMainImage(image.id)}
                          title="Définir comme image principale"
                        >
                          <Star className="h-4 w-4" />
                        </Button>
                      )}
                      
                      <Button
                        size="sm"
                        variant="destructive"
                        className="h-8 w-8 p-0"
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
              <div className="text-center py-12 text-gray-500">
                <ImageIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">Aucune image disponible</h3>
                <p className="text-sm">Cliquez sur "Ajouter Image" pour commencer</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Dialog de visualisation d'image */}
      <Dialog open={!!selectedImageUrl} onOpenChange={() => setSelectedImageUrl("")}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Aperçu de l'image</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center">
            <img 
              src={selectedImageUrl} 
              alt="Aperçu en grand" 
              className="max-w-full max-h-[70vh] object-contain rounded"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductImageViewer;
