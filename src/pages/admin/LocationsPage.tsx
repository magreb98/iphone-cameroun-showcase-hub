
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/AdminLayout";
import { getLocations, deleteLocation, Location, LocationFormData } from "@/api/locations";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash, Building, Search, Map, FileImage, Share2, Phone, LayoutGrid, LayoutList } from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import LocationFormDialog from "@/components/admin/locations/LocationFormDialog";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const LocationsPage = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<LocationFormData | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  
  const queryClient = useQueryClient();
  const { isSuperAdmin } = useAuth();
  
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

  // If not superadmin, show access denied screen
  if (!isSuperAdmin) {
    return (
      <AdminLayout title="Accès refusé">
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <Building className="h-16 w-16 text-gray-400" />
          <h2 className="text-xl font-medium text-gray-700">Accès refusé</h2>
          <p className="text-gray-500">Seuls les super administrateurs peuvent gérer les magasins.</p>
        </div>
      </AdminLayout>
    );
  }

  const getStatusBadge = (location: Location) => {
    return (
      <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-100">
        Actif
      </Badge>
    );
  };

  return (
    <AdminLayout title="Gestion des Magasins">
      <div className="space-y-4">
        {/* En-tête et actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center">
            <Building className="mr-2 h-5 w-5 text-gray-600" />
            <h2 className="text-xl font-semibold">Liste des magasins</h2>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Rechercher un magasin..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full md:w-64"
              />
            </div>
            
            <div className="flex gap-1 border rounded-md p-1 bg-gray-50">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Card>
            <CardContent className="flex items-center justify-between p-3">
              <div>
                <p className="text-xs font-medium text-gray-500">Total magasins</p>
                <p className="text-xl font-bold">{locations.length}</p>
              </div>
              <Building className="h-6 w-6 text-gray-400" />
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center justify-between p-3">
              <div>
                <p className="text-xs font-medium text-gray-500">Avec WhatsApp</p>
                <p className="text-xl font-bold">
                  {locations.filter(loc => loc.whatsappNumber).length}
                </p>
              </div>
              <Share2 className="h-6 w-6 text-green-500" />
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center justify-between p-3">
              <div>
                <p className="text-xs font-medium text-gray-500">Avec adresse</p>
                <p className="text-xl font-bold">
                  {locations.filter(loc => loc.address).length}
                </p>
              </div>
              <Map className="h-6 w-6 text-blue-500" />
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center justify-between p-3">
              <div>
                <p className="text-xs font-medium text-gray-500">Avec image</p>
                <p className="text-xl font-bold">
                  {locations.filter(loc => loc.imageUrl).length}
                </p>
              </div>
              <FileImage className="h-6 w-6 text-orange-500" />
            </CardContent>
          </Card>
        </div>

        {isLoading ? (
          <div className="text-center py-10 bg-white rounded-lg shadow-sm">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-apple-blue mx-auto"></div>
            <p className="mt-2 text-gray-600">Chargement des magasins...</p>
          </div>
        ) : (
          <>
            {viewMode === "list" ? (
              /* Vue en liste */
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
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
                        <TableCell colSpan={5} className="text-center text-sm text-gray-500">
                          Aucun magasin trouvé
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredLocations.map((location) => (
                        <TableRow key={location.id} className="hover:bg-gray-50">
                          <TableCell>
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                                {location.imageUrl ? (
                                  <img src={location.imageUrl} alt={location.name} className="h-10 w-10 rounded-full object-cover" />
                                ) : (
                                  <Building className="h-5 w-5 text-gray-400" />
                                )}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{location.name}</div>
                                {location.description && (
                                  <div className="text-sm text-gray-500 line-clamp-1">{location.description}</div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-gray-500">
                            {location.address || "-"}
                          </TableCell>
                          <TableCell className="text-sm text-gray-500">
                            {location.phone || location.email ? (
                              <>
                                {location.phone && <div>{location.phone}</div>}
                                {location.email && <div className="text-xs">{location.email}</div>}
                                {location.whatsappNumber && <div className="text-xs text-green-600">WhatsApp: {location.whatsappNumber}</div>}
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
                                className="text-red-600 h-8 w-8 hover:bg-red-50" 
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
              /* Vue en grille - Avec des cartes plus compactes */
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {filteredLocations.length === 0 ? (
                  <div className="col-span-full text-center py-10 bg-white rounded-lg shadow-sm">
                    <Building className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun magasin trouvé</h3>
                    <p className="mt-1 text-sm text-gray-500">
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
                    <Card key={location.id} className="overflow-hidden hover:shadow-md transition-shadow">
                      <div className="h-24 bg-gradient-to-r from-gray-200 to-gray-100 relative">
                        {location.imageUrl ? (
                          <img 
                            src={location.imageUrl} 
                            alt={location.name} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <Building className="h-10 w-10 text-gray-400" />
                          </div>
                        )}
                        <div className="absolute top-2 right-2">
                          {getStatusBadge(location)}
                        </div>
                      </div>
                      
                      <CardContent className="p-3">
                        <h3 className="text-base font-semibold mb-1">{location.name}</h3>
                        
                        {location.description && (
                          <p className="text-gray-500 text-xs mb-2 line-clamp-1">{location.description}</p>
                        )}
                        
                        <div className="space-y-1 mt-2 text-xs">
                          {location.address && (
                            <div className="flex items-start">
                              <Map className="h-3 w-3 text-gray-400 mr-1 mt-0.5" />
                              <span className="text-gray-600 line-clamp-1">{location.address}</span>
                            </div>
                          )}
                          
                          {location.phone && (
                            <div className="flex items-center">
                              <Phone className="h-3 w-3 text-gray-400 mr-1" />
                              <span className="text-gray-600">{location.phone}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex justify-end gap-1 mt-3 pt-2 border-t">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleOpenDialog(location)}
                            className="h-7 px-2 text-xs"
                          >
                            <Pencil className="h-3 w-3 mr-1" /> Modifier
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-red-600 hover:bg-red-50 h-7 px-2 text-xs" 
                            onClick={() => handleDelete(location.id)}
                          >
                            <Trash className="h-3 w-3 mr-1" /> Supprimer
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
