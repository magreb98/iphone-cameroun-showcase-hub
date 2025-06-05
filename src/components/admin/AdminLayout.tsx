
import { ReactNode, useEffect, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, 
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Home, Box, Tag, LogOut, Settings, Building, Users, MapPin, BarChart3, Plus, Image } from "lucide-react";

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
}

const AdminLayout = ({ children, title }: AdminLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
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

  const isActiveRoute = (path: string) => {
    return location.pathname === path;
  };

  const menuItems = [
    {
      title: "Tableau de bord",
      url: "/admin/dashboard",
      icon: Home,
      description: "Vue d'ensemble et statistiques"
    },
    {
      title: "Produits",
      url: "/admin/products",
      icon: Box,
      description: "Gérer vos produits et images"
    },
    {
      title: "Catégories",
      url: "/admin/categories",
      icon: Tag,
      description: "Organiser vos catégories"
    },
    {
      title: "Magasins",
      url: "/admin/locations",
      icon: MapPin,
      description: "Gérer vos magasins"
    }
  ];

  const superAdminItems = [
    {
      title: "Utilisateurs",
      url: "/admin/users",
      icon: Users,
      description: "Gérer les utilisateurs"
    }
  ];

  const configItems = [
    {
      title: "Configurations",
      url: "/admin/configurations",
      icon: Settings,
      description: "Paramètres système"
    }
  ];

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar className="border-r border-gray-200 bg-white" collapsible="icon">
          <div className="p-4 border-b bg-gradient-to-r from-blue-500 to-purple-600">
            <h2 className="font-bold text-lg text-white">iPhone Cameroun</h2>
            <p className="text-sm text-blue-100">Panel Admin</p>
          </div>
          
          <SidebarContent>
            <SidebarTrigger className="m-2 self-end" />
            
            <SidebarGroup>
              <SidebarGroupLabel className="text-gray-700 font-semibold">Navigation Principale</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <Link 
                          to={item.url} 
                          className={`flex items-center p-3 rounded-lg transition-all hover:bg-blue-50 ${
                            isActiveRoute(item.url) 
                              ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-500 font-medium' 
                              : 'text-gray-700 hover:text-blue-600'
                          }`}
                        >
                          <item.icon className={`mr-3 h-5 w-5 ${isActiveRoute(item.url) ? 'text-blue-600' : ''}`} />
                          <div className="flex-1">
                            <span className="block font-medium">{item.title}</span>
                            <span className="text-xs text-gray-500">{item.description}</span>
                          </div>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {isSuperAdmin && (
              <SidebarGroup>
                <SidebarGroupLabel className="text-gray-700 font-semibold">Super Admin</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {superAdminItems.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild>
                          <Link 
                            to={item.url} 
                            className={`flex items-center p-3 rounded-lg transition-all hover:bg-orange-50 ${
                              isActiveRoute(item.url) 
                                ? 'bg-orange-100 text-orange-700 border-l-4 border-orange-500 font-medium' 
                                : 'text-gray-700 hover:text-orange-600'
                            }`}
                          >
                            <item.icon className={`mr-3 h-5 w-5 ${isActiveRoute(item.url) ? 'text-orange-600' : ''}`} />
                            <div className="flex-1">
                              <span className="block font-medium">{item.title}</span>
                              <span className="text-xs text-gray-500">{item.description}</span>
                            </div>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}
            
            <SidebarGroup>
              <SidebarGroupLabel className="text-gray-700 font-semibold">Configuration</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {configItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <Link 
                          to={item.url} 
                          className={`flex items-center p-3 rounded-lg transition-all hover:bg-gray-50 ${
                            isActiveRoute(item.url) 
                              ? 'bg-gray-100 text-gray-700 border-l-4 border-gray-500 font-medium' 
                              : 'text-gray-700 hover:text-gray-600'
                          }`}
                        >
                          <item.icon className={`mr-3 h-5 w-5 ${isActiveRoute(item.url) ? 'text-gray-600' : ''}`} />
                          <div className="flex-1">
                            <span className="block font-medium">{item.title}</span>
                            <span className="text-xs text-gray-500">{item.description}</span>
                          </div>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          
          <div className="mt-auto p-4 border-t bg-gray-50">
            <Button 
              variant="outline" 
              className="w-full flex items-center justify-center hover:bg-red-50 hover:text-red-600 hover:border-red-200"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Déconnexion</span>
            </Button>
          </div>
        </Sidebar>

        <div className="flex-1 overflow-auto">
          <header className="border-b bg-white p-4 sticky top-0 z-10 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h1 className="text-xl font-semibold text-gray-800">{title}</h1>
                <div className="hidden md:flex items-center space-x-2">
                  <div className="h-1 w-1 bg-gray-400 rounded-full"></div>
                  <span className="text-sm text-gray-500">
                    {isSuperAdmin ? 'Super Administrateur' : 'Administrateur'}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Link 
                  to="/" 
                  className="text-sm text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                >
                  Voir le site
                </Link>
                <div className="h-4 w-px bg-gray-300"></div>
                <Button
                  size="sm"
                  onClick={() => navigate('/admin/products')}
                  className="bg-green-500 hover:bg-green-600"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Nouveau
                </Button>
              </div>
            </div>
          </header>
          
          <main className="p-6 bg-gray-50 min-h-full">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
