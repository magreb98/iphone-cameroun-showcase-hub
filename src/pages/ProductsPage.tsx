
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import MainLayout from "@/components/layout/MainLayout";
import ProductCard, { Product } from "@/components/products/ProductCard";
import ProductFilter, { FilterOptions } from "@/components/products/ProductFilter";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { getProducts, PaginationData } from "@/api/products";
import { getCategories } from "@/api/categories";
import { 
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from "@/components/ui/pagination";

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(parseInt(searchParams.get("page") || "1"));
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  
  // Get the category ID from URL if present
  const categoryParam = searchParams.get("category");
  const categoryId = categoryParam ? parseInt(categoryParam) : undefined;

  // Fetch products with pagination and optional category filter
  const { data, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['products', page, categoryId],
    queryFn: () => getProducts(page, 12, categoryId)
  });
  
  const products = data?.products || [];
  const pagination: PaginationData = data?.pagination || {
    total: 0,
    page: 1,
    limit: 12,
    pages: 1,
    hasMore: false
  };
  
  const { data: categories = [], isLoading: isLoadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories
  });

  // List of categories and brands
  const categoryNames = categories.map(c => c.name);
  const brands = ["Apple"]; // Hardcoded for now, could come from API

  // Update page number when URL changes and filter products based on search
  useEffect(() => {
    // Update page number when URL changes
    const pageParam = searchParams.get("page");
    if (pageParam) {
      setPage(parseInt(pageParam));
    } else {
      setPage(1);
    }
  }, [searchParams]);
  
  // Separate useEffect for filtering products to avoid infinite loop
  useEffect(() => {
    // Filter products based on search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      setFilteredProducts(products.filter((product) =>
        product.name.toLowerCase().includes(query)
      ));
    } else {
      setFilteredProducts(products);
    }
  }, [searchQuery, products]);

  const filterProducts = (filters: FilterOptions) => {
    // Update URL with category
    if (filters.category) {
      const categoryObj = categories.find(c => c.name === filters.category);
      if (categoryObj) {
        searchParams.set("category", categoryObj.id.toString());
        searchParams.delete("page"); // Reset to page 1 when changing filters
        setSearchParams(searchParams);
      }
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
  };
  
  const handlePageChange = (newPage: number) => {
    searchParams.set("page", newPage.toString());
    setSearchParams(searchParams);
    setPage(newPage);
    window.scrollTo(0, 0);
  };

  if (isLoadingProducts || isLoadingCategories) {
    return (
      <MainLayout>
        <section className="py-12 bg-apple-gray">
          <div className="container mx-auto px-4">
            <div className="flex justify-center items-center h-64">
              <p>Chargement des produits...</p>
            </div>
          </div>
        </section>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <section className="py-12 bg-apple-gray">
        <div className="container mx-auto px-4">
          <h1 className="section-title mb-8 text-center">Nos Produits</h1>

          {/* Search Bar */}
          <div className="max-w-md mx-auto mb-8 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <Input
              type="text"
              placeholder="Rechercher un produit..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-10"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar with Filters */}
            <aside className="lg:col-span-1">
              <ProductFilter
                onFilterChange={filterProducts}
                categories={categoryNames}
                brands={brands}
              />
            </aside>

            {/* Products Grid */}
            <div className="lg:col-span-3">
              {filteredProducts.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-lg text-gray-500">
                    Aucun produit ne correspond à vos critères de recherche.
                  </p>
                </div>
              ) : (
                <>
                  <div className="product-grid">
                    {filteredProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                  
                  {/* Pagination */}
                  <div className="mt-8">
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
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default ProductsPage;
