
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/AdminLayout";
import { getProducts } from "@/api/products";
import { getCategories } from "@/api/categories";
import { getLocations } from "@/api/locations";
import { ProductFormData } from "@/api/products";
import { Product } from "@/components/products/ProductCard";
import { 
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from "@/components/ui/pagination";

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
  const [page, setPage] = useState(1);
  const limit = 10; // Nombre de produits par page dans l'admin

  const { data, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['products', page],
    queryFn: () => getProducts(page, limit)
  });
  
  const products = data?.products || [];
  const pagination = data?.pagination || {
    total: 0,
    page: 1,
    limit,
    pages: 1,
    hasMore: false
  };

  const { data: categories = [], isLoading: isLoadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories
  });

  const { data: locations = [], isLoading: isLoadingLocations } = useQuery({
    queryKey: ['locations'],
    queryFn: getLocations
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
        locationId: product.locationId || 1, // Use the product's locationId or default
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
  
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  if (isLoadingProducts || isLoadingCategories || isLoadingLocations) {
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
        
        {/* Pagination */}
        <div className="mt-4">
          <Pagination>
            <PaginationContent>
              {page > 1 && (
                <PaginationItem>
                  <PaginationPrevious onClick={() => handlePageChange(page - 1)} />
                </PaginationItem>
              )}
              
              {/* First page */}
              {page > 2 && (
                <PaginationItem>
                  <PaginationLink onClick={() => handlePageChange(1)}>
                    1
                  </PaginationLink>
                </PaginationItem>
              )}
              
              {/* Ellipsis for many pages */}
              {page > 3 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}
              
              {/* Previous page */}
              {page > 1 && (
                <PaginationItem>
                  <PaginationLink onClick={() => handlePageChange(page - 1)}>
                    {page - 1}
                  </PaginationLink>
                </PaginationItem>
              )}
              
              {/* Current page */}
              <PaginationItem>
                <PaginationLink isActive>{page}</PaginationLink>
              </PaginationItem>
              
              {/* Next page */}
              {page < pagination.pages && (
                <PaginationItem>
                  <PaginationLink onClick={() => handlePageChange(page + 1)}>
                    {page + 1}
                  </PaginationLink>
                </PaginationItem>
              )}
              
              {/* Ellipsis for many pages */}
              {page < pagination.pages - 2 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}
              
              {/* Last page */}
              {page < pagination.pages - 1 && (
                <PaginationItem>
                  <PaginationLink onClick={() => handlePageChange(pagination.pages)}>
                    {pagination.pages}
                  </PaginationLink>
                </PaginationItem>
              )}
              
              {page < pagination.pages && (
                <PaginationItem>
                  <PaginationNext onClick={() => handlePageChange(page + 1)} />
                </PaginationItem>
              )}
            </PaginationContent>
          </Pagination>
        </div>

        <ProductFormDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          editingProduct={editingProduct}
          categories={categories}
          locations={locations}
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
