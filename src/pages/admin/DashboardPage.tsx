
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingBag, Package, Tag, MessageCircle, Store, BarChart, Plus, Edit, Trash, Image, Users, Settings, MapPin } from "lucide-react";
import { getProducts } from "@/api/products";
import { getCategories } from "@/api/categories";
import { getLocations } from "@/api/locations";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import StatsOverview from "@/components/admin/dashboard/StatsOverview";
import StoreComparison from "@/components/admin/dashboard/StoreComparison";
import WhatsappConfig from "@/components/admin/dashboard/WhatsappConfig";
import RecentProducts from "@/components/admin/dashboard/RecentProducts";
import ProductImageViewer from "@/components/admin/products/ProductImageViewer";

const DashboardPage = () => {
  const [selectedLocation, setSelectedLocation] = useState<number | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
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

  // Quick action handlers
  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'add-product':
        navigate('/admin/products');
        break;
      case 'manage-categories':
        navigate('/admin/categories');
        break;
      case 'manage-locations':
        navigate('/admin/locations');
        break;
      case 'manage-users':
        navigate('/admin/users');
        break;
      case 'configurations':
        navigate('/admin/configurations');
        break;
      default:
        break;
    }
  };

  return (
    <AdminLayout title={`Tableau de Bord ${isSuperAdmin ? `- ${locationName}` : ''}`}>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-2">
            Bienvenue sur votre tableau de bord, {user?.name || 'Admin'}!
          </h1>
          <p className="text-blue-100">
            Gérez facilement vos produits, catégories et configurations depuis ce centre de contrôle.
          </p>
        </div>

        {/* Quick Actions Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <BarChart className="mr-2 h-5 w-5" />
              Actions Rapides
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <Button 
                onClick={() => handleQuickAction('add-product')}
                className="h-20 flex flex-col items-center justify-center space-y-2 bg-green-500 hover:bg-green-600"
              >
                <Plus className="h-6 w-6" />
                <span className="text-sm">Ajouter Produit</span>
              </Button>
              
              <Button 
                onClick={() => handleQuickAction('manage-categories')}
                className="h-20 flex flex-col items-center justify-center space-y-2 bg-blue-500 hover:bg-blue-600"
                variant="secondary"
              >
                <Tag className="h-6 w-6" />
                <span className="text-sm">Catégories</span>
              </Button>
              
              <Button 
                onClick={() => handleQuickAction('manage-locations')}
                className="h-20 flex flex-col items-center justify-center space-y-2 bg-purple-500 hover:bg-purple-600"
                variant="secondary"
              >
                <MapPin className="h-6 w-6" />
                <span className="text-sm">Magasins</span>
              </Button>
              
              {isSuperAdmin && (
                <Button 
                  onClick={() => handleQuickAction('manage-users')}
                  className="h-20 flex flex-col items-center justify-center space-y-2 bg-orange-500 hover:bg-orange-600"
                  variant="secondary"
                >
                  <Users className="h-6 w-6" />
                  <span className="text-sm">Utilisateurs</span>
                </Button>
              )}
              
              <Button 
                onClick={() => handleQuickAction('configurations')}
                className="h-20 flex flex-col items-center justify-center space-y-2 bg-gray-500 hover:bg-gray-600"
                variant="secondary"
              >
                <Settings className="h-6 w-6" />
                <span className="text-sm">Configurations</span>
              </Button>
            </div>
          </CardContent>
        </Card>

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

        {/* Key Features Highlight */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Image className="mr-2 h-5 w-5" />
              Fonctionnalités Clés
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-center mb-3">
                  <Edit className="h-5 w-5 mr-2 text-blue-500" />
                  <h3 className="font-semibold">Édition d'Images</h3>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Modifiez, supprimez et gérez les images de vos produits individuellement.
                </p>
                <Button 
                  size="sm" 
                  onClick={() => navigate('/admin/products')}
                  className="w-full"
                >
                  Gérer les Images
                </Button>
              </div>

              <div className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-center mb-3">
                  <Package className="h-5 w-5 mr-2 text-green-500" />
                  <h3 className="font-semibold">Gestion Stock</h3>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Suivez et mettez à jour les stocks de vos produits en temps réel.
                </p>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => navigate('/admin/products')}
                  className="w-full"
                >
                  Voir Stock
                </Button>
              </div>

              <div className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-center mb-3">
                  <MessageCircle className="h-5 w-5 mr-2 text-purple-500" />
                  <h3 className="font-semibold">WhatsApp</h3>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Configurez l'intégration WhatsApp pour vos magasins.
                </p>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => navigate('/admin/configurations')}
                  className="w-full"
                >
                  Configurer
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Product Image Management Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Image className="mr-2 h-5 w-5" />
              Gestion des Images Produits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ProductImageViewer products={products} />
          </CardContent>
        </Card>
        
        {isSuperAdmin && (
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
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
