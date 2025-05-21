
import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { MessageCircle } from "lucide-react";
import { getConfiguration, saveConfiguration } from "@/api/configurations";
import { toast } from "sonner";

interface WhatsappConfigProps {
  selectedLocation: number | null;
  locationName: string;
}

const WhatsappConfig = ({ selectedLocation, locationName }: WhatsappConfigProps) => {
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  
  // Get WhatsApp configuration by location
  const configKey = selectedLocation ? `whatsapp_number_${selectedLocation}` : 'whatsapp_number';
  
  const { data: whatsappConfig } = useQuery({
    queryKey: ['config', configKey],
    queryFn: () => getConfiguration(configKey),
    enabled: !!selectedLocation
  });

  // Set WhatsApp number when config is loaded
  useEffect(() => {
    if (whatsappConfig && whatsappConfig.configValue) {
      setWhatsappNumber(whatsappConfig.configValue);
    } else {
      setWhatsappNumber("");
    }
  }, [whatsappConfig]);

  // Save WhatsApp configuration mutation
  const saveWhatsappMutation = useMutation({
    mutationFn: (configValue: string) => saveConfiguration({
      configKey: configKey,
      configValue,
      description: `Numéro WhatsApp pour le magasin ${selectedLocation}`
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['config'] });
      toast.success("Numéro WhatsApp mis à jour avec succès");
    },
    onError: (error) => {
      toast.error("Erreur lors de la mise à jour du numéro WhatsApp");
      console.error(error);
    }
  });
  
  const handleWhatsappNumberSave = async () => {
    if (!selectedLocation) return;
    
    setLoading(true);
    try {
      // Remove any spaces and make sure it starts with +
      const formattedNumber = whatsappNumber.trim().replace(/\s+/g, '');
      const finalNumber = formattedNumber.startsWith('+') ? formattedNumber : `+${formattedNumber}`;
      
      await saveWhatsappMutation.mutateAsync(finalNumber);
      setWhatsappNumber(finalNumber);
    } catch (error) {
      console.error("Error saving WhatsApp number:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!selectedLocation) return null;
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center space-y-0 pb-2">
        <CardTitle className="text-lg font-medium">Configuration WhatsApp pour {locationName}</CardTitle>
        <MessageCircle className="h-5 w-5 text-green-600 ml-2" />
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Ce numéro sera utilisé pour recevoir des messages des clients via WhatsApp.
            Assurez-vous que le numéro est valide et a un compte WhatsApp actif.
          </p>
          
          <div className="flex items-end gap-3">
            <div className="flex-grow space-y-1">
              <Label htmlFor="whatsappNumber">Numéro WhatsApp</Label>
              <Input
                id="whatsappNumber"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="+237 6XX XXX XXX"
              />
            </div>
            <Button 
              onClick={handleWhatsappNumberSave}
              disabled={loading || !whatsappNumber}
            >
              {loading ? "Sauvegarde..." : "Sauvegarder"}
            </Button>
          </div>
          
          <p className="text-xs text-gray-500">
            Format: +237 6XXXXXXXX (avec l'indicatif du pays)
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default WhatsappConfig;
