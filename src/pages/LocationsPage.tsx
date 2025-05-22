
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import MainLayout from "@/components/layout/MainLayout";
import { getLocations, Location } from "@/api/locations";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, MapPin, Phone, Mail, Settings, Clock, Share2, ExternalLink, Sun, Moon, LayoutGrid, LayoutList, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/hooks/useTheme";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const LocationsPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isSuperAdmin } = useAuth();
  const { theme, setTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [viewType, setViewType] = useState<"grid" | "list">("grid");
  const [isSheetOpen, setIsSheetOpen] = useState<boolean>(false);
  
  // Utilisez toujours useQuery de manière non conditionnelle
  const { data: locations = [], isLoading } = useQuery({
    queryKey: ["locations"],
    queryFn: getLocations
  });

  const filteredLocations = locations.filter(location => 
    location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (location.address && location.address.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const openWhatsApp = (whatsappNumber: string | null) => {
    if (!whatsappNumber) return;
    window.open(`https://wa.me/${whatsappNumber.replace(/\+/g, '')}`, '_blank');
  };
  
  const openLocationDetails = (location: Location) => {
    setSelectedLocation(location);
    setIsSheetOpen(true);
  };

  const shareLocation = (location: Location) => {
    if (navigator.share) {
      navigator.share({
        title: `iPhone Cameroun - ${location.name}`,
        text: `Découvrez le magasin iPhone Cameroun à ${location.name}${location.address ? ` - ${location.address}` : ''}`,
        url: window.location.href,
      })
      .catch((error) => console.error('Erreur de partage:', error));
    }
  };

  const openGoogleMaps = (address: string | null) => {
    if (!address) return;
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    window.open(mapsUrl, '_blank');
  };

  // Toggle theme handler
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-3 dark:text-white">Nos Magasins</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Retrouvez tous nos points de vente iPhone Cameroun à travers le pays.
            Venez nous rendre visite pour découvrir nos produits et bénéficier de nos conseils personnalisés.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Barre de recherche */}
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Rechercher un magasin par nom ou adresse..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Sun size={18} className="text-gray-500 dark:text-gray-400" />
                <Switch 
                  checked={theme === "dark"} 
                  onCheckedChange={toggleTheme} 
                />
                <Moon size={18} className="text-gray-500 dark:text-gray-400" />
              </div>
              
              {/* Sélecteur de vue */}
              <div className="flex gap-1 border rounded-md p-1 bg-gray-50 dark:bg-gray-700">
                <Button 
                  variant={viewType === "list" ? "default" : "ghost"} 
                  size="sm" 
                  onClick={() => setViewType("list")} 
                  className="flex items-center"
                >
                  <LayoutList size={18} />
                </Button>
                <Button 
                  variant={viewType === "grid" ? "default" : "ghost"} 
                  size="sm" 
                  onClick={() => setViewType("grid")} 
                  className="flex items-center"
                >
                  <LayoutGrid size={18} />
                </Button>
              </div>

              {/* Bouton pour la gestion des magasins (affiché seulement si l'utilisateur est admin) */}
              {isAuthenticated && (
                <Button 
                  onClick={() => navigate('/admin/locations')}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Settings size={16} />
                  <span>Gérer les magasins</span>
                </Button>
              )}
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center min-h-[300px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-apple-blue"></div>
          </div>
        ) : filteredLocations.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <Building size={48} className="mx-auto mb-4 text-gray-400 dark:text-gray-500" />
            <h2 className="text-xl font-medium dark:text-white">Aucun magasin ne correspond à votre recherche</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Essayez une recherche différente.</p>
          </div>
        ) : viewType === "grid" ? (
          // Vue en grille
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLocations.map((location) => (
              <Card key={location.id} className="overflow-hidden h-full flex flex-col hover:shadow-lg transition-shadow duration-300 dark:border-gray-700">
                {location.imageUrl ? (
                  <div className="h-40 overflow-hidden relative">
                    <img 
                      src={location.imageUrl} 
                      alt={location.name} 
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                    <Badge className="absolute top-2 right-2 bg-white/80 text-black dark:bg-black/60 dark:text-white hover:bg-white/70" variant="outline">
                      Disponible
                    </Badge>
                  </div>
                ) : (
                  <div className="h-40 bg-gray-100 dark:bg-gray-700 flex items-center justify-center relative">
                    <Building size={48} className="text-gray-400 dark:text-gray-500" />
                    <Badge className="absolute top-2 right-2 bg-white/80 text-black dark:bg-black/60 dark:text-white hover:bg-white/70" variant="outline">
                      Disponible
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl dark:text-white">{location.name}</CardTitle>
                    <Button variant="ghost" size="icon" onClick={() => shareLocation(location)} className="h-8 w-8">
                      <Share2 size={16} />
                    </Button>
                  </div>
                  {location.description && (
                    <CardDescription className="line-clamp-2 dark:text-gray-300">{location.description}</CardDescription>
                  )}
                </CardHeader>
                
                <CardContent className="flex-grow">
                  <div className="space-y-3">
                    {location.address && (
                      <Button 
                        variant="link" 
                        className="flex items-start w-full justify-start p-0 h-auto text-left hover:no-underline dark:text-gray-200"
                        onClick={() => openGoogleMaps(location.address)}
                      >
                        <MapPin className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">{location.address}</span>
                      </Button>
                    )}
                    
                    {location.phone && (
                      <div className="flex items-center">
                        <Phone className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2 flex-shrink-0" />
                        <a href={`tel:${location.phone}`} className="text-gray-700 dark:text-gray-300 hover:text-apple-blue">{location.phone}</a>
                      </div>
                    )}
                    
                    {location.email && (
                      <div className="flex items-center">
                        <Mail className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2 flex-shrink-0" />
                        <a href={`mailto:${location.email}`} className="text-gray-700 dark:text-gray-300 hover:text-apple-blue break-all">{location.email}</a>
                      </div>
                    )}
                  </div>
                </CardContent>
                
                <CardFooter className="border-t pt-3 flex gap-2 dark:border-gray-700">
                  {location.whatsappNumber && (
                    <Button 
                      onClick={() => openWhatsApp(location.whatsappNumber)}
                      variant="outline" 
                      className="flex-1 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/50 border-green-200 dark:border-green-800"
                    >
                      WhatsApp
                    </Button>
                  )}
                  <Button 
                    onClick={() => openLocationDetails(location)} 
                    variant="secondary"
                    className="flex-1"
                  >
                    Détails
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          // Vue en liste
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Magasin</TableHead>
                  <TableHead>Adresse</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLocations.map((location) => (
                  <TableRow key={location.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <TableCell>
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                          {location.imageUrl ? (
                            <img src={location.imageUrl} alt={location.name} className="h-10 w-10 rounded-full object-cover" />
                          ) : (
                            <Building className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{location.name}</div>
                          {location.description && (
                            <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{location.description}</div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {location.address ? (
                        <Button 
                          variant="link" 
                          className="text-left p-0 h-auto"
                          onClick={() => openGoogleMaps(location.address)}
                        >
                          <span className="text-sm text-gray-700 dark:text-gray-300 flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {location.address}
                          </span>
                        </Button>
                      ) : (
                        <span className="text-sm text-gray-500 dark:text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {(location.phone || location.email) ? (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {location.phone && (
                            <a href={`tel:${location.phone}`} className="block hover:text-apple-blue">
                              {location.phone}
                            </a>
                          )}
                          {location.email && (
                            <a href={`mailto:${location.email}`} className="block hover:text-apple-blue">
                              {location.email}
                            </a>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500 dark:text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        {location.whatsappNumber && (
                          <Button 
                            onClick={() => openWhatsApp(location.whatsappNumber)}
                            variant="outline" 
                            size="sm"
                            className="bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/50 border-green-200 dark:border-green-800"
                          >
                            WhatsApp
                          </Button>
                        )}
                        <Button 
                          onClick={() => openLocationDetails(location)} 
                          variant="outline"
                          size="sm"
                        >
                          Détails
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Sheet pour afficher les détails d'un magasin */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-md dark:border-gray-700 dark:bg-gray-800">
          {selectedLocation && (
            <>
              <SheetHeader>
                <SheetTitle className="dark:text-white">{selectedLocation.name}</SheetTitle>
                <SheetDescription className="dark:text-gray-300">
                  {selectedLocation.description || "Magasin iPhone Cameroun"}
                </SheetDescription>
              </SheetHeader>
              
              <div className="mt-6 space-y-6">
                {selectedLocation.imageUrl && (
                  <div className="rounded-lg overflow-hidden">
                    <img 
                      src={selectedLocation.imageUrl} 
                      alt={selectedLocation.name} 
                      className="w-full h-auto max-h-60 object-cover"
                    />
                  </div>
                )}
                
                <div className="space-y-4 dark:text-gray-200">
                  <div className="flex items-start">
                    <Clock className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-3 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">Heures d'ouverture</h4>
                      <p className="text-gray-600 dark:text-gray-300">
                        Lundi - Vendredi: 08:00 - 18:00<br />
                        Samedi: 09:00 - 17:00<br />
                        Dimanche: Fermé
                      </p>
                    </div>
                  </div>
                  
                  {selectedLocation.address && (
                    <div className="flex items-start">
                      <MapPin className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-3 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">Adresse</h4>
                        <p className="text-gray-600 dark:text-gray-300">{selectedLocation.address}</p>
                        <Button 
                          variant="link" 
                          className="p-0 h-auto flex items-center mt-1 text-apple-blue"
                          onClick={() => openGoogleMaps(selectedLocation.address)}
                        >
                          Voir sur Google Maps
                          <ExternalLink className="ml-1 h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {(selectedLocation.phone || selectedLocation.email || selectedLocation.whatsappNumber) && (
                    <div className="flex items-start">
                      <Phone className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-3 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">Contact</h4>
                        {selectedLocation.phone && (
                          <p className="text-gray-600 dark:text-gray-300">
                            <a href={`tel:${selectedLocation.phone}`} className="hover:text-apple-blue">
                              {selectedLocation.phone}
                            </a>
                          </p>
                        )}
                        {selectedLocation.email && (
                          <p className="text-gray-600 dark:text-gray-300">
                            <a href={`mailto:${selectedLocation.email}`} className="hover:text-apple-blue">
                              {selectedLocation.email}
                            </a>
                          </p>
                        )}
                        {selectedLocation.whatsappNumber && (
                          <Button 
                            onClick={() => openWhatsApp(selectedLocation.whatsappNumber)}
                            variant="outline" 
                            className="mt-2 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/50 border-green-200 dark:border-green-800"
                            size="sm"
                          >
                            Contacter sur WhatsApp
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t pt-4 mt-6 dark:border-gray-700">
                  <Button 
                    onClick={() => shareLocation(selectedLocation)} 
                    variant="outline"
                    className="w-full justify-center"
                  >
                    <Share2 className="mr-2 h-4 w-4" />
                    Partager ce magasin
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </MainLayout>
  );
};

export default LocationsPage;
