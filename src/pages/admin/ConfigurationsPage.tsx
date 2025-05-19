
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getConfiguration, saveConfiguration, Configuration } from "@/api/configurations";
import { toast } from "sonner";
import { Facebook, Instagram, Mail, MessageCircle } from "lucide-react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Form schema
const contactFormSchema = z.object({
  whatsapp_number: z.string().min(5, "Numéro WhatsApp requis"),
  email_address: z.string().email("Email invalide"),
  instagram_link: z.string().url("Lien Instagram invalide"),
  facebook_link: z.string().url("Lien Facebook invalide"),
  store_address: z.string().min(5, "Adresse requise"),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

const ConfigurationsPage = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("contact");
  
  // Form setup
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      whatsapp_number: "",
      email_address: "",
      instagram_link: "",
      facebook_link: "",
      store_address: "",
    },
  });

  // Query configuration values
  const { data: whatsappConfig, isLoading: loadingWhatsapp } = useQuery({
    queryKey: ['config', 'whatsapp_number'],
    queryFn: () => getConfiguration('whatsapp_number')
  });

  const { data: emailConfig, isLoading: loadingEmail } = useQuery({
    queryKey: ['config', 'email_address'],
    queryFn: () => getConfiguration('email_address')
  });

  const { data: instagramConfig, isLoading: loadingInstagram } = useQuery({
    queryKey: ['config', 'instagram_link'],
    queryFn: () => getConfiguration('instagram_link')
  });

  const { data: facebookConfig, isLoading: loadingFacebook } = useQuery({
    queryKey: ['config', 'facebook_link'],
    queryFn: () => getConfiguration('facebook_link')
  });

  const { data: addressConfig, isLoading: loadingAddress } = useQuery({
    queryKey: ['config', 'store_address'],
    queryFn: () => getConfiguration('store_address')
  });

  const isLoading = loadingWhatsapp || loadingEmail || loadingInstagram || loadingFacebook || loadingAddress;

  // Load existing values into form
  useEffect(() => {
    // Update individual form values only when they're loaded
    if (whatsappConfig?.configValue) {
      form.setValue('whatsapp_number', whatsappConfig.configValue, { shouldValidate: false, shouldDirty: false });
    }
    if (emailConfig?.configValue) {
      form.setValue('email_address', emailConfig.configValue, { shouldValidate: false, shouldDirty: false });
    }
    if (instagramConfig?.configValue) {
      form.setValue('instagram_link', instagramConfig.configValue, { shouldValidate: false, shouldDirty: false });
    }
    if (facebookConfig?.configValue) {
      form.setValue('facebook_link', facebookConfig.configValue, { shouldValidate: false, shouldDirty: false });
    }
    if (addressConfig?.configValue) {
      form.setValue('store_address', addressConfig.configValue, { shouldValidate: false, shouldDirty: false });
    }
  }, [form, whatsappConfig, emailConfig, instagramConfig, facebookConfig, addressConfig]);

  // Save configuration mutation
  const saveConfigMutation = useMutation({
    mutationFn: async (config: { key: string, value: string, description: string }) => {
      return saveConfiguration({
        configKey: config.key,
        configValue: config.value,
        description: config.description
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['config', variables.key] });
      toast.success(`Configuration ${variables.key} mise à jour`);
    },
    onError: (_, variables) => {
      toast.error(`Erreur lors de la mise à jour de ${variables.key}`);
    }
  });

  // Handle individual field submission
  const saveField = async (key: keyof ContactFormValues, description: string) => {
    const value = form.getValues(key);
    
    if (!value) {
      toast.error(`Le champ ${key} ne peut pas être vide`);
      return;
    }
    
    try {
      await saveConfigMutation.mutateAsync({
        key,
        value,
        description
      });
    } catch (error) {
      console.error(`Error saving ${key}:`, error);
    }
  };

  const onSubmit = async (values: ContactFormValues) => {
    try {
      // Determine which fields have been modified
      const dirtyFields = form.formState.dirtyFields;
      
      // Only save fields that have been modified
      if (dirtyFields.whatsapp_number) {
        await saveField('whatsapp_number', 'Numéro WhatsApp pour contacter la boutique');
      }
      
      if (dirtyFields.email_address) {
        await saveField('email_address', 'Adresse email de la boutique');
      }
      
      if (dirtyFields.instagram_link) {
        await saveField('instagram_link', 'Lien Instagram de la boutique');
      }
      
      if (dirtyFields.facebook_link) {
        await saveField('facebook_link', 'Lien Facebook de la boutique');
      }
      
      if (dirtyFields.store_address) {
        await saveField('store_address', 'Adresse physique de la boutique');
      }
      
      // Reset dirty state after saving
      form.reset(values);
      
    } catch (error) {
      console.error("Error saving configurations:", error);
    }
  };

  return (
    <AdminLayout title="Configurations">
      <div className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="contact">
              Coordonnées et Réseaux Sociaux
            </TabsTrigger>
            <TabsTrigger value="site">
              Paramètres du Site
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="contact" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Coordonnées de Contact</CardTitle>
                <CardDescription>
                  Configurez les informations de contact et les liens vers les réseaux sociaux qui seront affichés sur le site.
                  Vous pouvez modifier un champ et enregistrer sans impacter les autres.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <p className="text-sm text-muted-foreground">Chargement des configurations...</p>
                ) : (
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* WhatsApp */}
                        <FormField
                          control={form.control}
                          name="whatsapp_number"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Numéro WhatsApp</FormLabel>
                              <div className="flex items-center space-x-2">
                                <MessageCircle className="text-green-600 h-5 w-5" />
                                <FormControl>
                                  <Input placeholder="+237 6XXXXXXXX" {...field} />
                                </FormControl>
                              </div>
                              <div className="flex items-center justify-between mt-1">
                                <FormDescription>
                                  Format: +237 6XXXXXXXX
                                </FormDescription>
                                <Button 
                                  type="button" 
                                  onClick={() => saveField('whatsapp_number', 'Numéro WhatsApp pour contacter la boutique')}
                                  size="sm" 
                                  variant="outline"
                                  disabled={saveConfigMutation.isPending}
                                >
                                  Enregistrer
                                </Button>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        {/* Email */}
                        <FormField
                          control={form.control}
                          name="email_address"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Adresse Email</FormLabel>
                              <div className="flex items-center space-x-2">
                                <Mail className="text-blue-600 h-5 w-5" />
                                <FormControl>
                                  <Input placeholder="contact@example.com" {...field} />
                                </FormControl>
                              </div>
                              <div className="flex items-center justify-between mt-1">
                                <FormDescription>
                                  Email public de contact
                                </FormDescription>
                                <Button 
                                  type="button" 
                                  onClick={() => saveField('email_address', 'Adresse email de la boutique')}
                                  size="sm" 
                                  variant="outline"
                                  disabled={saveConfigMutation.isPending}
                                >
                                  Enregistrer
                                </Button>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <Separator className="my-4" />
                      <h3 className="text-lg font-medium mb-4">Réseaux Sociaux</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Instagram */}
                        <FormField
                          control={form.control}
                          name="instagram_link"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Instagram</FormLabel>
                              <div className="flex items-center space-x-2">
                                <Instagram className="text-pink-600 h-5 w-5" />
                                <FormControl>
                                  <Input placeholder="https://instagram.com/votre-compte" {...field} />
                                </FormControl>
                              </div>
                              <div className="flex items-center justify-between mt-1">
                                <FormDescription>
                                  Lien vers votre compte Instagram
                                </FormDescription>
                                <Button 
                                  type="button" 
                                  onClick={() => saveField('instagram_link', 'Lien Instagram de la boutique')}
                                  size="sm" 
                                  variant="outline"
                                  disabled={saveConfigMutation.isPending}
                                >
                                  Enregistrer
                                </Button>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        {/* Facebook */}
                        <FormField
                          control={form.control}
                          name="facebook_link"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Facebook</FormLabel>
                              <div className="flex items-center space-x-2">
                                <Facebook className="text-blue-600 h-5 w-5" />
                                <FormControl>
                                  <Input placeholder="https://facebook.com/votre-page" {...field} />
                                </FormControl>
                              </div>
                              <div className="flex items-center justify-between mt-1">
                                <FormDescription>
                                  Lien vers votre page Facebook
                                </FormDescription>
                                <Button 
                                  type="button" 
                                  onClick={() => saveField('facebook_link', 'Lien Facebook de la boutique')}
                                  size="sm" 
                                  variant="outline"
                                  disabled={saveConfigMutation.isPending}
                                >
                                  Enregistrer
                                </Button>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <Separator className="my-4" />
                      <h3 className="text-lg font-medium mb-4">Adresse</h3>
                      
                      {/* Store Address */}
                      <FormField
                        control={form.control}
                        name="store_address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Adresse du magasin</FormLabel>
                            <FormControl>
                              <Input placeholder="123 Rue du Commerce, Ville, Pays" {...field} />
                            </FormControl>
                            <div className="flex items-center justify-between mt-1">
                              <FormDescription>
                                Adresse physique complète de la boutique
                              </FormDescription>
                              <Button 
                                type="button" 
                                onClick={() => saveField('store_address', 'Adresse physique de la boutique')}
                                size="sm" 
                                variant="outline"
                                disabled={saveConfigMutation.isPending}
                              >
                                Enregistrer
                              </Button>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="submit" 
                        className="mt-6"
                        disabled={saveConfigMutation.isPending}
                      >
                        {saveConfigMutation.isPending ? "Enregistrement..." : "Enregistrer toutes les modifications"}
                      </Button>
                    </form>
                  </Form>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="site" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Paramètres du Site</CardTitle>
                <CardDescription>
                  Configurez les paramètres généraux du site web.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Cette section sera implémentée prochainement.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default ConfigurationsPage;
