
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingBag, Package, Tag } from "lucide-react";
import { Product } from "@/components/products/ProductCard";

interface StatsOverviewProps {
  products: Product[];
  categories: any[];
}

const StatsOverview = ({ products, categories }: StatsOverviewProps) => {
  // Calculate statistics
  const totalProducts = products.length;
  const productsInStock = products.filter(p => p.inStock).length;
  const totalCategories = categories.length;
  const averagePrice = products.length ? 
    Math.round(products.reduce((sum, p) => sum + p.price, 0) / totalProducts) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Produits
          </CardTitle>
          <ShoppingBag className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalProducts}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {productsInStock} en stock
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Produits en Stock
          </CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {productsInStock} / {totalProducts}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {totalProducts > 0 ? ((productsInStock / totalProducts) * 100).toFixed(0) : 0}% disponibles
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Catégories
          </CardTitle>
          <Tag className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalCategories}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Catégories actives
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Prix Moyen
          </CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {averagePrice.toLocaleString()} FCFA
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Tous produits confondus
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsOverview;
