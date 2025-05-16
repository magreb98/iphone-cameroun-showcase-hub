
import { useState } from "react";
import { toast } from "sonner";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Product } from "@/components/products/ProductCard";
import { Plus, Pencil, Trash } from "lucide-react";

// Données fictives pour la démonstration
const MOCK_PRODUCTS: Product[] = [
  {
    id: 1,
    name: "iPhone 13 Pro Max",
    imageUrl: "https://images.unsplash.com/photo-1632661674596-df8be070a5c5?auto=format&fit=crop&w=500",
    price: 850000,
    category: "iPhone",
    inStock: true,
    quantity: 10
  },
  {
    id: 2,
    name: "MacBook Pro 14",
    imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=500",
    price: 1200000,
    category: "MacBook",
    inStock: true,
    quantity: 5
  },
  {
    id: 3,
    name: "iPad Pro 12.9",
    imageUrl: "https://images.unsplash.com/photo-1561154464-82e9adf32764?auto=format&fit=crop&w=500",
    price: 700000,
    category: "iPad",
    inStock: false,
    quantity: 0
  },
  {
    id: 4,
    name: "AirPods Pro",
    imageUrl: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=500",
    price: 120000,
    category: "Accessory",
    inStock: true,
    quantity: 15
  }
];

const categories = ["iPhone", "MacBook", "iPad", "Accessory"];

interface ProductFormData {
  id?: number;
  name: string;
  price: number;
  category: string;
  inStock: boolean;
  quantity: number;
  imageUrl: string;
}

const AdminProductsPage = () => {
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingProduct, setEditingProduct] = useState<ProductFormData | null>(null);
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    price: 0,
    category: "",
    inStock: true,
    quantity: 0,
    imageUrl: ""
  });

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setEditingProduct({
        id: product.id,
        name: product.name,
        price: product.price,
        category: product.category,
        inStock: product.inStock,
        quantity: product.quantity || 0,
        imageUrl: product.imageUrl
      });
      setFormData({
        id: product.id,
        name: product.name,
        price: product.price,
        category: product.category,
        inStock: product.inStock,
        quantity: product.quantity || 0,
        imageUrl: product.imageUrl
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: "",
        price: 0,
        category: "",
        inStock: true,
        quantity: 0,
        imageUrl: ""
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingProduct(null);
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
      [field]: value
    });
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData({
      ...formData,
      inStock: checked
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingProduct) {
      // Update existing product
      const updatedProducts = products.map(p => 
        p.id === formData.id ? {
          id: formData.id, // Ensure id is not optional for Product type
          name: formData.name,
          price: formData.price,
          category: formData.category,
          inStock: formData.inStock,
          quantity: formData.quantity,
          imageUrl: formData.imageUrl
        } as Product : p
      );
      setProducts(updatedProducts);
      toast.success("Produit mis à jour avec succès");
    } else {
      // Add new product
      const newProduct: Product = {
        id: Math.max(0, ...products.map(p => p.id)) + 1, // Ensure id is not optional
        name: formData.name,
        price: formData.price,
        category: formData.category,
        inStock: formData.inStock,
        quantity: formData.quantity,
        imageUrl: formData.imageUrl
      };
      setProducts([...products, newProduct]);
      toast.success("Produit ajouté avec succès");
    }
    
    handleCloseDialog();
  };

  const handleDelete = (id: number) => {
    const updatedProducts = products.filter(p => p.id !== id);
    setProducts(updatedProducts);
    toast.success("Produit supprimé avec succès");
  };

  return (
    <AdminLayout title="Gestion des Produits">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="max-w-sm">
            <Input
              placeholder="Rechercher un produit..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="h-4 w-4 mr-2" /> Ajouter un produit
          </Button>
        </div>

        <div className="rounded-md border">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="p-3 text-left font-medium">Produit</th>
                <th className="p-3 text-left font-medium">Catégorie</th>
                <th className="p-3 text-left font-medium">Prix (FCFA)</th>
                <th className="p-3 text-left font-medium">Stock</th>
                <th className="p-3 text-left font-medium">Statut</th>
                <th className="p-3 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id} className="border-t border-gray-200 hover:bg-muted/50">
                  <td className="p-3">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded bg-gray-100 overflow-hidden">
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <span className="font-medium">{product.name}</span>
                    </div>
                  </td>
                  <td className="p-3">{product.category}</td>
                  <td className="p-3">{product.price.toLocaleString()}</td>
                  <td className="p-3">{product.quantity}</td>
                  <td className="p-3">
                    {product.inStock ? (
                      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800">
                        En stock
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-red-100 text-red-800">
                        Rupture
                      </span>
                    )}
                  </td>
                  <td className="p-3">
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(product)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-500 hover:text-red-700"
                        onClick={() => handleDelete(product.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
                  value={formData.category}
                  onValueChange={(value) => handleSelectChange(value, "category")}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Sélectionnez une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
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
                <Label htmlFor="imageUrl" className="text-right">
                  URL de l'image
                </Label>
                <Input
                  id="imageUrl"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  className="col-span-3"
                  required
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Annuler
              </Button>
              <Button type="submit">
                {editingProduct ? "Mettre à jour" : "Ajouter"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminProductsPage;
