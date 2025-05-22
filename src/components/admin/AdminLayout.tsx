
import { ReactNode, useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, 
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Home, Box, Tag, LogOut, Settings, Building, Users, MapPin } from "lucide-react";

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
}

const AdminLayout = ({ children, title }: AdminLayoutProps) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>(false);

  // Vérification du token d'authentification
  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (token) {
      setIsAuthenticated(true);
      
      // Vérifier si l'utilisateur est un super admin
      try {
        const tokenData = JSON.parse(atob(token.split('.')[1]));
        setIsSuperAdmin(tokenData.isSuperAdmin || false);
      } catch (error) {
        console.error("Erreur lors du décodage du token:", error);
      }
    } else {
      if (window.location.pathname !== "/admin") {
        toast.error("Veuillez vous connecter pour accéder à cette page");
        navigate("/admin");
      }
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    setIsAuthenticated(false);
    toast.success("Déconnexion réussie");
    navigate("/admin");
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar className="border-r border-gray-200" collapsible="icon">
          <div className="p-4 border-b">
            <h2 className="font-semibold text-lg">iPhone Cameroun</h2>
            <p className="text-sm text-gray-500">Panel Admin</p>
          </div>
          
          <SidebarContent>
            <SidebarTrigger className="m-2 self-end" />
            
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link to="/admin/dashboard" className="flex items-center">
                        <Home className="mr-2 h-4 w-4" />
                        <span>Tableau de bord</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link to="/admin/products" className="flex items-center">
                        <Box className="mr-2 h-4 w-4" />
                        <span>Produits</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link to="/admin/categories" className="flex items-center">
                        <Tag className="mr-2 h-4 w-4" />
                        <span>Catégories</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link to="/admin/locations" className="flex items-center">
                        <MapPin className="mr-2 h-4 w-4" />
                        <span>Magasins</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  
                  {isSuperAdmin && (
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link to="/admin/users" className="flex items-center">
                          <Users className="mr-2 h-4 w-4" />
                          <span>Utilisateurs</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}
                  
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link to="/admin/configurations" className="flex items-center">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Configurations</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          
          <div className="mt-auto p-4 border-t">
            <Button 
              variant="outline" 
              className="w-full flex items-center justify-center"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Déconnexion</span>
            </Button>
          </div>
        </Sidebar>

        <div className="flex-1 overflow-auto">
          <header className="border-b bg-white p-4 sticky top-0 z-10">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold">{title}</h1>
              <div>
                <Link to="/" className="text-sm text-apple-blue hover:underline">
                  Voir le site
                </Link>
              </div>
            </div>
          </header>
          
          <main className="p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
