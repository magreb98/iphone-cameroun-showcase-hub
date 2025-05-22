import React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import MainLayout from "@/components/layout/MainLayout";
import { getLocations, Location } from "@/api/locations";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, MapPin, Phone, Mail, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const LocationsPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isSuperAdmin } = useAuth();
  
  // Utilisez toujours useQuery de manière non conditionnelle
  const { data: locations = [], isLoading } = useQuery({
    queryKey: ["locations"],
    queryFn: getLocations
  });

  const openWhatsApp = (whatsappNumber: string | null) => {
    if (!whatsappNumber) return;
    window.open(`https://wa.me/${whatsappNumber.replace(/\+/g, '')}`, '_blank');
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Nos Magasins</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Retrouvez tous nos points de vente iPhone Cameroun à travers le pays.
            Venez nous rendre visite pour découvrir nos produits et bénéficier de nos conseils personnalisés.
          </p>
          
          {/* Bouton pour la gestion des magasins (affiché seulement si l'utilisateur est admin) */}
          {isAuthenticated && (
            <div className="mt-6">
              <Button 
                onClick={() => navigate('/admin/locations')}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Settings size={16} />
                <span>Gérer les magasins</span>
              </Button>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center min-h-[300px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-apple-blue"></div>
          </div>
        ) : locations.length === 0 ? (
          <div className="text-center py-16">
            <Building size={48} className="mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-medium">Aucun magasin disponible pour le moment</h2>
            <p className="text-gray-500 mt-2">Veuillez vérifier ultérieurement.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {locations.map((location) => (
              <LocationCard key={location.id} location={location} onContactWhatsApp={openWhatsApp} />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

interface LocationCardProps {
  location: Location;
  onContactWhatsApp: (whatsappNumber: string | null) => void;
}

const LocationCard = ({ location, onContactWhatsApp }: LocationCardProps) => {
  return (
    <Card className="overflow-hidden h-full flex flex-col">
      {location.imageUrl ? (
        <div className="h-48 overflow-hidden">
          <img 
            src={location.imageUrl} 
            alt={location.name} 
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>
      ) : (
        <div className="h-48 bg-gray-100 flex items-center justify-center">
          <Building size={64} className="text-gray-400" />
        </div>
      )}
      
      <CardHeader>
        <CardTitle className="text-xl">{location.name}</CardTitle>
        {location.description && (
          <CardDescription>{location.description}</CardDescription>
        )}
      </CardHeader>
      
      <CardContent className="flex-grow">
        <div className="space-y-3">
          {location.address && (
            <div className="flex items-start">
              <MapPin className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
              <span>{location.address}</span>
            </div>
          )}
          
          {location.phone && (
            <div className="flex items-center">
              <Phone className="h-5 w-5 text-gray-500 mr-2" />
              <span>{location.phone}</span>
            </div>
          )}
          
          {location.email && (
            <div className="flex items-center">
              <Mail className="h-5 w-5 text-gray-500 mr-2" />
              <span className="break-all">{location.email}</span>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="border-t pt-4">
        {location.whatsappNumber && (
          <Button 
            onClick={() => onContactWhatsApp(location.whatsappNumber)}
            variant="outline" 
            className="w-full bg-green-50 text-green-700 hover:bg-green-100 border-green-200"
          >
            Contacter sur WhatsApp
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default LocationsPage;
