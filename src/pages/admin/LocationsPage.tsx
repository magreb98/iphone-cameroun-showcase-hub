
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/AdminLayout";
import { getLocations, deleteLocation, Location, LocationFormData } from "@/api/locations";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash, Building, Search, Map, FileImage, Share2, Phone, Sun, Moon, LayoutGrid, LayoutList } from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import LocationFormDialog from "@/components/admin/locations/LocationFormDialog";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from "@/hooks/useTheme";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";

const LocationsPage = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<LocationFormData | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  
  const queryClient = useQueryClient();
  const { isSuperAdmin } = useAuth();
  const { theme, setTheme } = useTheme();
  
  // Always fetch locations, regardless of user role
  const { data: locations = [], isLoading } = useQuery({
    queryKey: ['locations'],
    queryFn: getLocations
  });
  
  const filteredLocations = locations.filter(location => 
    location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (location.address && location.address.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteLocation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      toast.success("Magasin supprimé avec succès");
    },
    onError: (error) => {
      toast.error("Erreur lors de la suppression du magasin");
      console.error(error);
    }
  });

  const handleOpenDialog = (location?: Location) => {
    if (location) {
      setEditingLocation({
        id: location.id,
        name: location.name,
        address: location.address || '',
        description: location.description || '',
        imageUrl: location.imageUrl || '',
        phone: location.phone || '',
        email: location.email || '',
        whatsappNumber: location.whatsappNumber || null
      });
    } else {
      setEditingLocation(null);
    }
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce magasin?")) {
      deleteMutation.mutate(id);
    }
  };

  // Toggle theme handler
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  // If not superadmin, show access denied screen
  if (!isSuperAdmin) {
    return (
      <AdminLayout title="Accès refusé">
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <Building className="h-16 w-16 text-gray-400" />
          <h2 className="text-xl font-medium text-gray-700 dark:text-gray-300">Accès refusé</h2>
          <p className="text-gray-500 dark:text-gray-400">Seuls les super administrateurs peuvent gérer les magasins.</p>
        </div>
      </AdminLayout>
    );
  }

  const getStatusBadge = (location: Location) => {
    return (
      <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-300 hover:bg-green-100">
        Actif
      </Badge>
    );
  };

  return (
    <AdminLayout title="Gestion des Magasins">
      <div className="space-y-4">
        {/* En-tête et actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <div className="flex items-center">
            <Building className="mr-2 h-5 w-5 text-gray-600 dark:text-gray-300" />
            <h2 className="text-xl font-semibold dark:text-white">Liste des magasins</h2>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Sun size={18} className="text-gray-500 dark:text-gray-400" />
              <Switch 
                checked={theme === "dark"} 
                onCheckedChange={toggleTheme} 
              />
              <Moon size={18} className="text-gray-500 dark:text-gray-400" />
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Rechercher un magasin..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full md:w-64"
              />
            </div>
            
            <div className="flex gap-1 border rounded-md p-1 bg-gray-50 dark:bg-gray-700">
              <Button 
                variant={viewMode === "list" ? "default" : "ghost"} 
                size="sm" 
                onClick={() => setViewMode("list")} 
                className="flex items-center"
              >
                <LayoutList size={18} />
              </Button>
              <Button 
                variant={viewMode === "grid" ? "default" : "ghost"} 
                size="sm" 
                onClick={() => setViewMode("grid")} 
                className="flex items-center"
              >
                <LayoutGrid size={18} />
              </Button>
            </div>
            
            <Button onClick={() => handleOpenDialog()} className="flex items-center whitespace-nowrap">
              <Plus className="mr-2 h-4 w-4" /> Ajouter un magasin
            </Button>
          </div>
        </div>

        {/* Statistiques des magasins */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="dark:border-gray-700">
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total magasins</p>
                <p className="text-2xl font-bold dark:text-white">{locations.length}</p>
              </div>
              <Building className="h-8 w-8 text-gray-400 dark:text-gray-500" />
            </CardContent>
          </Card>
          
          <Card className="dark:border-gray-700">
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Avec WhatsApp</p>
                <p className="text-2xl font-bold dark:text-white">
                  {locations.filter(loc => loc.whatsappNumber).length}
                </p>
              </div>
              <Share2 className="h-8 w-8 text-green-500 dark:text-green-400" />
            </CardContent>
          </Card>
          
          <Card className="dark:border-gray-700">
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Avec adresse</p>
                <p className="text-2xl font-bold dark:text-white">
                  {locations.filter(loc => loc.address).length}
                </p>
              </div>
              <Map className="h-8 w-8 text-blue-500 dark:text-blue-400" />
            </CardContent>
          </Card>
          
          <Card className="dark:border-gray-700">
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Avec image</p>
                <p className="text-2xl font-bold dark:text-white">
                  {locations.filter(loc => loc.imageUrl).length}
                </p>
              </div>
              <FileImage className="h-8 w-8 text-orange-500 dark:text-orange-400" />
            </CardContent>
          </Card>
        </div>

        {isLoading ? (
          <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-apple-blue mx-auto"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-300">Chargement des magasins...</p>
          </div>
        ) : (
          <>
            {viewMode === "list" ? (
              /* Vue en liste */
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom</TableHead>
                      <TableHead>Adresse</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLocations.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-sm text-gray-500 dark:text-gray-400">
                          Aucun magasin trouvé
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredLocations.map((location) => (
                        <TableRow key={location.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <TableCell>
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                                {location.imageUrl ? (
                                  <img src={location.imageUrl} alt={location.name} className="h-10 w-10 rounded-full object-cover" />
                                ) : (
                                  <Building className="h-5 w-5 text-gray-400" />
                                )}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">{location.name}</div>
                                {location.description && (
                                  <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{location.description}</div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-gray-500 dark:text-gray-400">
                            {location.address || "-"}
                          </TableCell>
                          <TableCell className="text-sm text-gray-500 dark:text-gray-400">
                            {location.phone || location.email ? (
                              <>
                                {location.phone && <div>{location.phone}</div>}
                                {location.email && <div className="text-xs">{location.email}</div>}
                                {location.whatsappNumber && <div className="text-xs text-green-600 dark:text-green-400">WhatsApp: {location.whatsappNumber}</div>}
                              </>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(location)}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button 
                                variant="outline" 
                                size="icon"
                                onClick={() => handleOpenDialog(location)}
                                className="h-8 w-8"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="icon" 
                                className="text-red-600 dark:text-red-400 h-8 w-8 hover:bg-red-50 dark:hover:bg-red-950" 
                                onClick={() => handleDelete(location.id)}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            ) : (
              /* Vue en grille */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredLocations.length === 0 ? (
                  <div className="col-span-full text-center py-10 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                    <Building className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Aucun magasin trouvé</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Commencez par ajouter un nouveau magasin.
                    </p>
                    <div className="mt-6">
                      <Button onClick={() => handleOpenDialog()}>
                        <Plus className="mr-2 h-4 w-4" />
                        Ajouter un magasin
                      </Button>
                    </div>
                  </div>
                ) : (
                  filteredLocations.map((location) => (
                    <Card key={location.id} className="overflow-hidden dark:border-gray-700 hover:shadow-md transition-shadow">
                      <div className="h-28 bg-gradient-to-r from-gray-200 to-gray-100 dark:from-gray-700 dark:to-gray-800 relative">
                        {location.imageUrl ? (
                          <img 
                            src={location.imageUrl} 
                            alt={location.name} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <Building className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                          </div>
                        )}
                        <div className="absolute top-2 right-2">
                          {getStatusBadge(location)}
                        </div>
                      </div>
                      
                      <CardContent className="p-3">
                        <h3 className="text-lg font-semibold mb-1 dark:text-white">{location.name}</h3>
                        
                        {location.description && (
                          <p className="text-gray-500 dark:text-gray-400 text-sm mb-2 line-clamp-1">{location.description}</p>
                        )}
                        
                        <div className="space-y-1 mt-3 text-sm">
                          {location.address && (
                            <div className="flex items-start">
                              <Map className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                              <span className="text-gray-600 dark:text-gray-300 line-clamp-1">{location.address}</span>
                            </div>
                          )}
                          
                          {location.phone && (
                            <div className="flex items-center">
                              <Phone className="h-4 w-4 text-gray-400 mr-2" />
                              <span className="text-gray-600 dark:text-gray-300">{location.phone}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex justify-end gap-2 mt-3 pt-2 border-t dark:border-gray-700">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleOpenDialog(location)}
                            className="h-8 px-2"
                          >
                            <Pencil className="h-3.5 w-3.5 mr-1" /> Modifier
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 h-8 px-2" 
                            onClick={() => handleDelete(location.id)}
                          >
                            <Trash className="h-3.5 w-3.5 mr-1" /> Supprimer
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>

      <LocationFormDialog 
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        editingLocation={editingLocation}
      />
    </AdminLayout>
  );
};

export default LocationsPage;
