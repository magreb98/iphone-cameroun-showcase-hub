
import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    
    // Simulation d'envoi de formulaire
    setTimeout(() => {
      toast.success("Votre message a été envoyé ! Nous vous contacterons bientôt.");
      setFormData({
        name: "",
        email: "",
        phone: "",
        message: "",
      });
      setIsSubmitting(false);
    }, 1500);
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
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Envoi en cours..." : "Envoyer le message"}
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
                    Rue 1.234, Quartier X<br />
                    Yaoundé, Cameroun
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium text-lg text-apple-dark">Email</h3>
                  <p className="text-gray-600">
                    contact@iphonecameroun.com<br />
                    support@iphonecameroun.com
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium text-lg text-apple-dark">Téléphone</h3>
                  <p className="text-gray-600">
                    +237 6XX XXX XXX<br />
                    +237 6XX XXX XXX
                  </p>
                </div>
                
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
                <a href="#" className="text-apple-blue hover:text-blue-700">
                  Facebook
                </a>
                <a href="#" className="text-apple-blue hover:text-blue-700">
                  Instagram
                </a>
                <a href="#" className="text-apple-blue hover:text-blue-700">
                  Twitter
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
