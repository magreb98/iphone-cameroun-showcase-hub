
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
import { Image, Link } from "lucide-react";
import { createProduct, updateProduct, ProductFormData } from "@/api/products";
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
  const [localImage, setLocalImage] = useState<File | null>(null);

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
    setLocalImage(null);
  }, [editingProduct]);

  const createProductMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
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
    mutationFn: ({ id, data }: { id: number; data: ProductFormData }) => 
      updateProduct(id, data),
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
    setLocalImage(null);
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
      const file = files[0];
      setLocalImage(file);
      
      // Create a URL for the image preview
      const imageUrl = URL.createObjectURL(file);
      setFormData({
        ...formData,
        imageUrl: imageUrl
      });
    }
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let finalFormData = {...formData};
    
    // If we have a local image, convert it to base64
    if (imageTab === "upload" && localImage) {
      try {
        const base64Image = await convertFileToBase64(localImage);
        finalFormData.imageUrl = base64Image;
      } catch (error) {
        toast.error("Erreur lors de la conversion de l'image");
        console.error(error);
        return;
      }
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
                      <Image className="h-4 w-4 mr-2" />
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
                      onChange={handleImageUpload}
                    />
                  </TabsContent>
                </Tabs>

                {formData.imageUrl && (
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
