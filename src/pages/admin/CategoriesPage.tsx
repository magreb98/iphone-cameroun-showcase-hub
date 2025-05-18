
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash, Image, Link } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getCategories, createCategory, updateCategory, deleteCategory, Category, CategoryFormData } from "@/api/categories";

const AdminCategoriesPage = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: "",
    description: "",
    imageUrl: ""
  });
  const [imageTab, setImageTab] = useState<"url" | "upload">("url");
  const [localImage, setLocalImage] = useState<File | null>(null);

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories
  });
  
  const createCategoryMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success("Catégorie ajoutée avec succès");
      handleCloseDialog();
    },
    onError: (error) => {
      toast.error("Erreur lors de l'ajout de la catégorie");
      console.error(error);
    }
  });
  
  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CategoryFormData }) => 
      updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success("Catégorie mise à jour avec succès");
      handleCloseDialog();
    },
    onError: (error) => {
      toast.error("Erreur lors de la mise à jour de la catégorie");
      console.error(error);
    }
  });
  
  const deleteCategoryMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success("Catégorie supprimée avec succès");
    },
    onError: (error) => {
      toast.error("Erreur lors de la suppression de la catégorie");
      console.error(error);
    }
  });

  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        description: category.description,
        imageUrl: category.imageUrl || ""
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: "",
        description: "",
        imageUrl: ""
      });
    }
    setLocalImage(null);
    setImageTab("url");
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingCategory(null);
    setLocalImage(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value
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
    
    if (editingCategory) {
      // Update existing category
      updateCategoryMutation.mutate({
        id: editingCategory.id,
        data: finalFormData
      });
    } else {
      // Add new category
      createCategoryMutation.mutate(finalFormData);
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette catégorie?")) {
      deleteCategoryMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout title="Gestion des Catégories">
        <div className="flex justify-center items-center h-64">
          <p>Chargement des données...</p>
        </div>
      </AdminLayout>
    );
  }

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
                <th className="p-3 text-left font-medium">Image</th>
                <th className="p-3 text-left font-medium">Nbre de produits</th>
                <th className="p-3 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.map((category) => (
                <tr key={category.id} className="border-t border-gray-200 hover:bg-muted/50">
                  <td className="p-3 font-medium">{category.name}</td>
                  <td className="p-3">{category.description}</td>
                  <td className="p-3">
                    {category.imageUrl ? (
                      <img 
                        src={category.imageUrl} 
                        alt={category.name} 
                        className="h-10 w-10 object-cover rounded"
                      />
                    ) : (
                      <span className="text-muted-foreground">Aucune image</span>
                    )}
                  </td>
                  <td className="p-3">{category.productCount || 0}</td>
                  <td className="p-3">
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(category)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className={`text-red-500 hover:text-red-700 ${(category.productCount || 0) > 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={() => handleDelete(category.id)}
                        disabled={(category.productCount || 0) > 0}
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
              <Button type="submit" disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}>
                {createCategoryMutation.isPending || updateCategoryMutation.isPending ? "Traitement..." : (editingCategory ? "Mettre à jour" : "Ajouter")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminCategoriesPage;
