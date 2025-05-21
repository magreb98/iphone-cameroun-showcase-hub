
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getUserProducts, getProducts } from "@/api/products";
import { getCategories } from "@/api/categories";
import { getLocations } from "@/api/locations";
import { ProductFormData } from "@/api/products";
import { Product } from "@/components/products/ProductCard";
import { useAuth } from "@/hooks/useAuth"; // Nouveau: hook d'authentification

// Import our components
import ProductSearchBar from "@/components/admin/products/ProductSearchBar";
import ProductTable from "@/components/admin/products/ProductTable";
import ProductFormDialog from "@/components/admin/products/ProductFormDialog";
import PromotionDialog from "@/components/admin/products/PromotionDialog";
import DataPagination from "@/components/admin/common/DataPagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const ProductManager = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPromotionDialogOpen, setIsPromotionDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductFormData | null>(null);
  const [promotionProduct, setPromotionProduct] = useState<Product | null>(null);
  const [page, setPage] = useState(1);
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);
  const limit = 10; // Number of products per page in admin
  
  // Récupérer les informations d'authentification de l'utilisateur
  const { user } = useAuth();
  const isSuperAdmin = user?.isSuperAdmin;

  // Si c'est un superAdmin, il peut filtrer par magasin
  const fetchProductsQuery = isSuperAdmin 
    ? ['products', page, selectedLocationId]
    : ['userProducts', page];

  const fetchProductsFn = isSuperAdmin 
    ? () => getProducts(page, limit, undefined, selectedLocationId || undefined)
    : () => getUserProducts(page, limit);

  const { data, isLoading: isLoadingProducts } = useQuery({
    queryKey: fetchProductsQuery,
    queryFn: fetchProductsFn
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
  
  const handleLocationChange = (locationId: string) => {
    setSelectedLocationId(locationId ? parseInt(locationId) : null);
    setPage(1); // Reset to first page when changing location
  };

  if (isLoadingProducts || isLoadingCategories || isLoadingLocations) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Chargement des données...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <ProductSearchBar 
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          onAddProduct={() => handleOpenDialog()}
        />
        
        {/* Filtre par magasin pour le superadmin */}
        {isSuperAdmin && (
          <div className="w-full md:w-64">
            <Label htmlFor="location-select" className="mb-1 block">Filtrer par magasin</Label>
            <Select
              value={selectedLocationId?.toString() || ""}
              onValueChange={handleLocationChange}
            >
              <SelectTrigger id="location-select">
                <SelectValue placeholder="Tous les magasins" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tous les magasins</SelectItem>
                {locations.map((location) => (
                  <SelectItem key={location.id} value={location.id.toString()}>
                    {location.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <ProductTable 
        products={filteredProducts}
        onEdit={handleOpenDialog}
        onPromotion={handleOpenPromotionDialog}
      />
      
      {/* Pagination */}
      <div className="mt-4">
        <DataPagination 
          currentPage={page}
          totalPages={pagination.pages}
          onPageChange={handlePageChange}
        />
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
  );
};

export default ProductManager;
