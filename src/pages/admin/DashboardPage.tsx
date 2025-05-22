
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingBag, Package, Tag, MessageCircle, Store, BarChart } from "lucide-react";
import { getProducts } from "@/api/products";
import { getCategories } from "@/api/categories";
import { getLocations } from "@/api/locations";
import { getConfiguration, saveConfiguration } from "@/api/configurations";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StatsOverview from "@/components/admin/dashboard/StatsOverview";
import StoreComparison from "@/components/admin/dashboard/StoreComparison";
import WhatsappConfig from "@/components/admin/dashboard/WhatsappConfig";
import RecentProducts from "@/components/admin/dashboard/RecentProducts";

const DashboardPage = () => {
  const [selectedLocation, setSelectedLocation] = useState<number | null>(null);
  const { user } = useAuth();
  const isSuperAdmin = user?.isSuperAdmin;

  // Fetch locations for superadmin
  const { data: locations = [] } = useQuery({
    queryKey: ['locations'],
    queryFn: getLocations,
    enabled: isSuperAdmin === true
  });

  // Init selectedLocation to user's location if not superadmin
  useEffect(() => {
    if (!isSuperAdmin && user?.locationId) {
      setSelectedLocation(user.locationId);
    }
  }, [user, isSuperAdmin]);

  // Query for products based on selected location or user's location
  const { data: productsData } = useQuery({
    queryKey: ['products', 1, selectedLocation],
    queryFn: () => getProducts(1, 1000, undefined, selectedLocation || undefined)
  });
  
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories
  });
  
  // Get all products for all locations (superadmin comparison view)
  const { data: allProductsData } = useQuery({
    queryKey: ['products', 'all-locations'],
    queryFn: () => getProducts(1, 1000),
    enabled: isSuperAdmin === true
  });

  const handleLocationChange = (value: string) => {
    setSelectedLocation(value === "all" ? null : parseInt(value));
  };

  // Trouver le nom du magasin actuel
  const currentLocation = locations.find(loc => loc.id === selectedLocation);
  const locationName = currentLocation ? currentLocation.name : "Tous les magasins";

  // Extract the products array from the response
  const products = productsData?.products || [];
  const allProducts = allProductsData?.products || [];

  return (
    <AdminLayout title={`Tableau de Bord ${isSuperAdmin ? `- ${locationName}` : ''}`}>
      <div className="space-y-8">
        {/* Location selector for superadmin */}
        {isSuperAdmin && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Store className="mr-2 h-5 w-5" />
                Sélectionner un magasin
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={selectedLocation?.toString() || "all"}
                onValueChange={handleLocationChange}
              >
                <SelectTrigger className="w-full md:w-[300px]">
                  <SelectValue placeholder="Sélectionner un magasin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les magasins</SelectItem>
                  {locations.map((loc) => (
                    <SelectItem key={loc.id} value={loc.id.toString()}>
                      {loc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        )}
        
        {isSuperAdmin && (
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Vue Générale</TabsTrigger>
              <TabsTrigger value="comparison">Comparaison des Magasins</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              <StatsOverview products={products} categories={categories} />
              
              {selectedLocation && (
                <WhatsappConfig selectedLocation={selectedLocation} locationName={locationName} />
              )}
              
              <RecentProducts 
                products={products} 
                isSuperAdmin={isSuperAdmin} 
                selectedLocation={selectedLocation} 
                locationName={locationName} 
              />
            </TabsContent>
            
            <TabsContent value="comparison" className="space-y-6">
              <StoreComparison 
                products={allProducts} 
                locations={locations} 
              />
            </TabsContent>
          </Tabs>
        )}
        
        {/* Regular admin view */}
        {!isSuperAdmin && (
          <div className="space-y-6">
            <StatsOverview products={products} categories={categories} />
            
            <WhatsappConfig selectedLocation={selectedLocation} locationName={locationName} />
            
            <RecentProducts 
              products={products} 
              isSuperAdmin={isSuperAdmin} 
              selectedLocation={selectedLocation} 
              locationName={locationName} 
            />
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default DashboardPage;
