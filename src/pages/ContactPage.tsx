
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import MainLayout from "@/components/layout/MainLayout";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { MessageCircle, Phone, Facebook, Instagram } from "lucide-react";
import { getConfiguration } from "@/api/configurations";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [storeAddress, setStoreAddress] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [facebookLink, setFacebookLink] = useState("");
  const [instagramLink, setInstagramLink] = useState("");

  const { data: whatsappConfig } = useQuery({
    queryKey: ['config', 'whatsapp_number'],
    queryFn: () => getConfiguration('whatsapp_number'),
  });

  const { data: addressConfig } = useQuery({
    queryKey: ['config', 'store_address'],
    queryFn: () => getConfiguration('store_address'),
  });

  const { data: emailConfig } = useQuery({
    queryKey: ['config', 'email_address'],
    queryFn: () => getConfiguration('email_address'),
  });

  const { data: facebookConfig } = useQuery({
    queryKey: ['config', 'facebook_link'],
    queryFn: () => getConfiguration('facebook_link'),
  });

  const { data: instagramConfig } = useQuery({
    queryKey: ['config', 'instagram_link'],
    queryFn: () => getConfiguration('instagram_link'),
  });

  // Set values when configuration is loaded
  useEffect(() => {
    if (whatsappConfig && whatsappConfig.configValue) {
      setWhatsappNumber(whatsappConfig.configValue);
    } else {
      setWhatsappNumber("+237 6XX XXX XXX");
    }
    
    if (addressConfig && addressConfig.configValue) {
      setStoreAddress(addressConfig.configValue);
    } else {
      setStoreAddress("Rue 1.234, Quartier X\nYaoundé, Cameroun");
    }
    
    if (emailConfig && emailConfig.configValue) {
      setEmailAddress(emailConfig.configValue);
    } else {
      setEmailAddress("contact@iphonecameroun.com");
    }
    
    if (facebookConfig && facebookConfig.configValue) {
      setFacebookLink(facebookConfig.configValue);
    } else {
      setFacebookLink("#");
    }
    
    if (instagramConfig && instagramConfig.configValue) {
      setInstagramLink(instagramConfig.configValue);
    } else {
      setInstagramLink("#");
    }
  }, [whatsappConfig, addressConfig, emailConfig, facebookConfig, instagramConfig]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    if (whatsappNumber) {
      // Format the message for WhatsApp
      const message = encodeURIComponent(
        `*Nouveau message de contact*\n\n` +
        `*Nom*: ${formData.name}\n` +
        `*Email*: ${formData.email}\n` +
        `*Téléphone*: ${formData.phone}\n\n` +
        `*Message*:\n${formData.message}`
      );
      
      // Open WhatsApp with the pre-filled message
      window.open(`https://wa.me/${whatsappNumber.replace(/\+/g, '')}?text=${message}`, '_blank');
      
      toast.success("Message envoyé via WhatsApp !");
      
      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        message: "",
      });
    } else {
      toast.error("Numéro WhatsApp non configuré");
    }
    
    setIsSubmitting(false);
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-12">
        <h1 className="section-title text-center mb-10">Contactez-Nous</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* Contact Form */}
          <div className="bg-white p-8 rounded-lg shadow-sm border">
            <h2 className="subsection-title mb-6">Envoyez-nous un message</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nom complet</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Votre nom"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="votre.email@exemple.com"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+237 6XX XXX XXX"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Comment pouvons-nous vous aider ?"
                  required
                  rows={5}
                />
              </div>
              
              <Button
                type="submit"
                className="w-full flex items-center justify-center space-x-2"
                disabled={isSubmitting}
              >
                <MessageCircle className="h-5 w-5" />
                <span>{isSubmitting ? "Envoi en cours..." : "Envoyer via WhatsApp"}</span>
              </Button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h2 className="subsection-title mb-6">Nos informations</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-lg text-apple-dark">Adresse</h3>
                  <p className="text-gray-600">
                    {storeAddress.split('\n').map((line, i) => (
                      <span key={i}>
                        {line}
                        {i < storeAddress.split('\n').length - 1 && <br />}
                      </span>
                    ))}
                  </p>
                </div>
                
                <div className="flex items-center space-x-3">
                  <h3 className="font-medium text-lg text-apple-dark">Email</h3>
                  <div className="ml-auto flex">
                    <a href={`mailto:${emailAddress}`} className="text-apple-blue hover:underline inline-flex items-center">
                      <MessageCircle className="h-4 w-4 mr-1" />
                      <span>Envoyer un email</span>
                    </a>
                  </div>
                </div>
                <p className="text-gray-600">{emailAddress}</p>
                
                <div className="flex items-center space-x-3">
                  <h3 className="font-medium text-lg text-apple-dark">Téléphone</h3>
                  <div className="ml-auto flex space-x-3">
                    <a href={`tel:${whatsappNumber}`} className="text-apple-blue hover:underline inline-flex items-center">
                      <Phone className="h-4 w-4 mr-1" />
                      <span>Appeler</span>
                    </a>
                    <a href={`https://wa.me/${whatsappNumber?.replace(/\+/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline inline-flex items-center">
                      <MessageCircle className="h-4 w-4 mr-1" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>
                <p className="text-gray-600">{whatsappNumber}</p>
                
                <div>
                  <h3 className="font-medium text-lg text-apple-dark">Heures d'ouverture</h3>
                  <p className="text-gray-600">
                    Lundi - Vendredi: 9h00 - 18h00<br />
                    Samedi: 10h00 - 16h00<br />
                    Dimanche: Fermé
                  </p>
                </div>
              </div>
            </div>
            
            {/* Map placeholder */}
            <div className="rounded-lg overflow-hidden border h-64 bg-gray-200">
              <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-500">
                Carte interactive
              </div>
            </div>
            
            {/* Social Media Links */}
            <div>
              <h3 className="font-medium text-lg text-apple-dark mb-3">Suivez-nous</h3>
              <div className="flex space-x-4">
                <a href={facebookLink} target="_blank" rel="noopener noreferrer" className="text-apple-blue hover:text-blue-700 flex items-center">
                  <Facebook className="h-4 w-4 mr-1" />
                  Facebook
                </a>
                <a href={instagramLink} target="_blank" rel="noopener noreferrer" className="text-apple-blue hover:text-blue-700 flex items-center">
                  <Instagram className="h-4 w-4 mr-1" />
                  Instagram
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ContactPage;
