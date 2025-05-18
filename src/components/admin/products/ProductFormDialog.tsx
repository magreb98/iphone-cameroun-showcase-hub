
import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Image, Link, Upload, X } from "lucide-react";
import { createProduct, updateProduct, uploadProductImages, ProductFormData } from "@/api/products";
import { Product } from "@/components/products/ProductCard";

interface Category {
  id: number;
  name: string;
}

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingProduct: ProductFormData | null;
  categories: Category[];
}

const ProductFormDialog = ({ open, onOpenChange, editingProduct, categories }: ProductFormDialogProps) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    price: 0,
    categoryId: 0,
    inStock: true,
    quantity: 0,
    imageUrl: ""
  });
  const [imageTab, setImageTab] = useState<"url" | "upload">("url");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);

  useEffect(() => {
    if (editingProduct) {
      setFormData(editingProduct);
      setImageTab("url"); // Default to URL tab when editing
    } else {
      setFormData({
        name: "",
        price: 0,
        categoryId: 0,
        inStock: true,
        quantity: 0,
        imageUrl: ""
      });
    }
    setSelectedFiles([]);
    setPreviewImages([]);
  }, [editingProduct]);

  const createProductMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: async (product) => {
      // Upload images if any are selected
      if (selectedFiles.length > 0) {
        try {
          await uploadProductImages(product.id, selectedFiles);
          toast.success("Images téléchargées avec succès");
        } catch (error) {
          toast.error("Erreur lors du téléchargement des images");
          console.error(error);
        }
      }

      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success("Produit ajouté avec succès");
      handleCloseDialog();
    },
    onError: (error) => {
      toast.error("Erreur lors de l'ajout du produit");
      console.error(error);
    }
  });

  const updateProductMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: ProductFormData }) => {
      // First update the product
      const updatedProduct = await updateProduct(id, data);
      
      // Then upload any new images if selected
      if (selectedFiles.length > 0) {
        await uploadProductImages(id, selectedFiles);
      }
      
      return updatedProduct;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success("Produit mis à jour avec succès");
      handleCloseDialog();
    },
    onError: (error) => {
      toast.error("Erreur lors de la mise à jour du produit");
      console.error(error);
    }
  });

  const handleCloseDialog = () => {
    onOpenChange(false);
    setSelectedFiles([]);
    setPreviewImages([]);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    
    setFormData({
      ...formData,
      [name]: type === "number" ? Number(value) : value
    });
  };

  const handleSelectChange = (value: string, field: string) => {
    setFormData({
      ...formData,
      [field]: field === "categoryId" ? Number(value) : value
    });
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData({
      ...formData,
      inStock: checked
    });
  };

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
      if (!formData.imageUrl && previewImages.length === 0 && newPreviews.length > 0) {
        setFormData({
          ...formData,
          imageUrl: "Preview image will be uploaded"
        });
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // For upload tab, if we don't have a URL but have files, set a placeholder URL
    let finalFormData = {...formData};
    if (imageTab === "upload" && !formData.imageUrl && selectedFiles.length > 0) {
      finalFormData.imageUrl = "https://placehold.co/600x400?text=Main+Image";
    }
    
    if (editingProduct && editingProduct.id) {
      // Update existing product
      updateProductMutation.mutate({
        id: editingProduct.id,
        data: finalFormData
      });
    } else {
      // Add new product
      createProductMutation.mutate(finalFormData);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editingProduct ? "Modifier le produit" : "Ajouter un produit"}
          </DialogTitle>
          <DialogDescription>
            Remplissez les informations du produit ci-dessous.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nom
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">
                Prix (FCFA)
              </Label>
              <Input
                id="price"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
                className="col-span-3"
                required
                min="0"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Catégorie
              </Label>
              <Select
                value={formData.categoryId.toString()}
                onValueChange={(value) => handleSelectChange(value, "categoryId")}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionnez une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quantity" className="text-right">
                Quantité
              </Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                value={formData.quantity}
                onChange={handleChange}
                className="col-span-3"
                required
                min="0"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="inStock" className="text-right">
                En stock
              </Label>
              <div className="col-span-3 flex items-center space-x-2">
                <Switch
                  id="inStock"
                  checked={formData.inStock}
                  onCheckedChange={handleSwitchChange}
                />
                <Label htmlFor="inStock">
                  {formData.inStock ? "Disponible" : "Indisponible"}
                </Label>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">
                Image
              </Label>
              <div className="col-span-3">
                <Tabs value={imageTab} onValueChange={(value) => setImageTab(value as "url" | "upload")} className="w-full">
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
                      value={imageTab === "url" ? formData.imageUrl : ""}
                      onChange={handleChange}
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

                {imageTab === "url" && formData.imageUrl && (
                  <div className="mt-4">
                    <p className="text-sm text-muted-foreground mb-1">Aperçu:</p>
                    <img 
                      src={formData.imageUrl} 
                      alt="Aperçu" 
                      className="h-24 object-contain border rounded"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCloseDialog}>
              Annuler
            </Button>
            <Button type="submit" disabled={createProductMutation.isPending || updateProductMutation.isPending}>
              {createProductMutation.isPending || updateProductMutation.isPending ? "Traitement..." : (editingProduct ? "Mettre à jour" : "Ajouter")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductFormDialog;
