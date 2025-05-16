
import { useState } from "react";
import { toast } from "sonner";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash } from "lucide-react";

interface Category {
  id: number;
  name: string;
  description: string;
  productCount: number;
}

// Données fictives pour la démonstration
const MOCK_CATEGORIES: Category[] = [
  {
    id: 1,
    name: "iPhone",
    description: "Les smartphones d'Apple",
    productCount: 2
  },
  {
    id: 2,
    name: "MacBook",
    description: "Les ordinateurs portables d'Apple",
    productCount: 2
  },
  {
    id: 3,
    name: "iPad",
    description: "Les tablettes d'Apple",
    productCount: 2
  },
  {
    id: 4,
    name: "Accessory",
    description: "Accessoires pour appareils Apple",
    productCount: 2
  }
];

interface CategoryFormData {
  id?: number;
  name: string;
  description: string;
}

const AdminCategoriesPage = () => {
  const [categories, setCategories] = useState<Category[]>(MOCK_CATEGORIES);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingCategory, setEditingCategory] = useState<CategoryFormData | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: "",
    description: ""
  });

  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenDialog = (category?: Category) => {
    if (category) {
      setEditingCategory({
        id: category.id,
        name: category.name,
        description: category.description
      });
      setFormData({
        id: category.id,
        name: category.name,
        description: category.description
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: "",
        description: ""
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingCategory(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingCategory) {
      // Update existing category
      const updatedCategories = categories.map(c => 
        c.id === formData.id ? { ...c, ...formData } : c
      );
      setCategories(updatedCategories);
      toast.success("Catégorie mise à jour avec succès");
    } else {
      // Add new category
      const newCategory = {
        ...formData,
        id: Math.max(0, ...categories.map(c => c.id)) + 1,
        productCount: 0
      };
      setCategories([...categories, newCategory]);
      toast.success("Catégorie ajoutée avec succès");
    }
    
    handleCloseDialog();
  };

  const handleDelete = (id: number) => {
    const category = categories.find(c => c.id === id);
    
    if (category && category.productCount > 0) {
      toast.error(`Impossible de supprimer la catégorie "${category.name}" car elle contient des produits.`);
      return;
    }
    
    const updatedCategories = categories.filter(c => c.id !== id);
    setCategories(updatedCategories);
    toast.success("Catégorie supprimée avec succès");
  };

  return (
    <AdminLayout title="Gestion des Catégories">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="max-w-sm">
            <Input
              placeholder="Rechercher une catégorie..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="h-4 w-4 mr-2" /> Ajouter une catégorie
          </Button>
        </div>

        <div className="rounded-md border">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="p-3 text-left font-medium">Nom</th>
                <th className="p-3 text-left font-medium">Description</th>
                <th className="p-3 text-left font-medium">Nbre de produits</th>
                <th className="p-3 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.map((category) => (
                <tr key={category.id} className="border-t border-gray-200 hover:bg-muted/50">
                  <td className="p-3 font-medium">{category.name}</td>
                  <td className="p-3">{category.description}</td>
                  <td className="p-3">{category.productCount}</td>
                  <td className="p-3">
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(category)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className={`text-red-500 hover:text-red-700 ${category.productCount > 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={() => handleDelete(category.id)}
                        disabled={category.productCount > 0}
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

      {/* Category Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Modifier la catégorie" : "Ajouter une catégorie"}
            </DialogTitle>
            <DialogDescription>
              Remplissez les informations de la catégorie ci-dessous.
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
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Input
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="col-span-3"
                  required
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Annuler
              </Button>
              <Button type="submit">
                {editingCategory ? "Mettre à jour" : "Ajouter"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminCategoriesPage;
