
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/AdminLayout";
import { getProducts } from "@/api/products";
import { getCategories } from "@/api/categories";
import { ProductFormData } from "@/api/products";
import { Product } from "@/components/products/ProductCard";

// Import our newly created components
import ProductSearchBar from "@/components/admin/products/ProductSearchBar";
import ProductTable from "@/components/admin/products/ProductTable";
import ProductFormDialog from "@/components/admin/products/ProductFormDialog";
import PromotionDialog from "@/components/admin/products/PromotionDialog";

const AdminProductsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPromotionDialogOpen, setIsPromotionDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductFormData | null>(null);
  const [promotionProduct, setPromotionProduct] = useState<Product | null>(null);

  const { data: products = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ['products'],
    queryFn: getProducts
  });

  const { data: categories = [], isLoading: isLoadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories
  });

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenDialog = (product?: Product) => {
    if (product) {
      // Find the categoryId from the category name
      const categoryObj = categories.find(cat => cat.name === product.category);
      const categoryId = categoryObj ? categoryObj.id : 0;
      
      setEditingProduct({
        id: product.id,
        name: product.name,
        price: product.price,
        categoryId: categoryId,
        inStock: product.inStock,
        quantity: product.quantity || 0,
        imageUrl: product.imageUrl,
        isOnPromotion: product.isOnPromotion,
        promotionPrice: product.promotionPrice,
        promotionEndDate: product.promotionEndDate
      });
    } else {
      setEditingProduct(null);
    }
    setIsDialogOpen(true);
  };

  const handleOpenPromotionDialog = (product: Product) => {
    setPromotionProduct(product);
    setIsPromotionDialogOpen(true);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  if (isLoadingProducts || isLoadingCategories) {
    return (
      <AdminLayout title="Gestion des Produits">
        <div className="flex justify-center items-center h-64">
          <p>Chargement des données...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Gestion des Produits">
      <div className="space-y-6">
        <ProductSearchBar 
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          onAddProduct={() => handleOpenDialog()}
        />

        <ProductTable 
          products={filteredProducts}
          onEdit={handleOpenDialog}
          onPromotion={handleOpenPromotionDialog}
        />

        <ProductFormDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          editingProduct={editingProduct}
          categories={categories}
        />

        <PromotionDialog
          open={isPromotionDialogOpen}
          onOpenChange={setIsPromotionDialogOpen}
          product={promotionProduct}
        />
      </div>
    </AdminLayout>
  );
};

export default AdminProductsPage;
