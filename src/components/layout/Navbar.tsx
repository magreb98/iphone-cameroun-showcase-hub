
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Menu, X, Building, User, Users, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { logout } from "@/api/auth";
import { toast } from "sonner";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated, isSuperAdmin } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Déconnexion réussie");
      window.location.href = "/";
    } catch (error) {
      toast.error("Erreur lors de la déconnexion");
    }
  };

  return (
    <header className="w-full fixed top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-xl font-semibold text-apple-dark">
              iPhone Cameroun
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-apple-blue transition-colors">
              Accueil
            </Link>
            <Link to="/products" className="text-gray-700 hover:text-apple-blue transition-colors">
              Produits
            </Link>
            <Link to="/locations" className="text-gray-700 hover:text-apple-blue transition-colors flex items-center gap-1">
              <Building size={18} />
              <span>Nos Magasins</span>
            </Link>
            <Link to="/about" className="text-gray-700 hover:text-apple-blue transition-colors">
              À propos
            </Link>
            <Link to="/contact" className="text-gray-700 hover:text-apple-blue transition-colors">
              Contact
            </Link>
            
            {/* Menu Admin pour Super Admin */}
            {isSuperAdmin && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="text-gray-700 hover:text-apple-blue">
                    <Settings className="mr-1 h-4 w-4" />
                    Admin
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-white z-50" align="end">
                  <DropdownMenuItem asChild>
                    <Link to="/admin/dashboard" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      Tableau de bord
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/admin/users" className="flex items-center">
                      <Users className="mr-2 h-4 w-4" />
                      Gestion des utilisateurs
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/admin/products" className="flex items-center">
                      Produits
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/admin/categories" className="flex items-center">
                      Catégories
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/admin/locations" className="flex items-center">
                      Magasins
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            
            {/* Menu utilisateur connecté */}
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="text-gray-700 hover:text-apple-blue">
                    <User className="mr-1 h-4 w-4" />
                    {user.name || user.email}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-white z-50" align="end">
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      Mon profil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="flex items-center text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Déconnexion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/admin" className="text-gray-700 hover:text-apple-blue transition-colors">
                Connexion
              </Link>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 focus:outline-none"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 animate-fade-in">
            <div className="flex flex-col space-y-4">
              <Link 
                to="/" 
                className="text-gray-700 hover:text-apple-blue transition-colors px-2 py-1"
                onClick={() => setIsMenuOpen(false)}
              >
                Accueil
              </Link>
              <Link 
                to="/products" 
                className="text-gray-700 hover:text-apple-blue transition-colors px-2 py-1"
                onClick={() => setIsMenuOpen(false)}
              >
                Produits
              </Link>
              <Link 
                to="/locations" 
                className="text-gray-700 hover:text-apple-blue transition-colors px-2 py-1 flex items-center gap-1"
                onClick={() => setIsMenuOpen(false)}
              >
                <Building size={18} />
                <span>Nos Magasins</span>
              </Link>
              <Link 
                to="/about" 
                className="text-gray-700 hover:text-apple-blue transition-colors px-2 py-1"
                onClick={() => setIsMenuOpen(false)}
              >
                À propos
              </Link>
              <Link 
                to="/contact" 
                className="text-gray-700 hover:text-apple-blue transition-colors px-2 py-1"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
              
              {/* Mobile menu items for authenticated users */}
              {isAuthenticated && user ? (
                <>
                  <Link 
                    to="/profile" 
                    className="text-gray-700 hover:text-apple-blue transition-colors px-2 py-1 flex items-center gap-1"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User size={18} />
                    <span>Mon profil</span>
                  </Link>
                  
                  {isSuperAdmin && (
                    <>
                      <Link 
                        to="/admin/dashboard" 
                        className="text-gray-700 hover:text-apple-blue transition-colors px-2 py-1"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Tableau de bord
                      </Link>
                      <Link 
                        to="/admin/users" 
                        className="text-gray-700 hover:text-apple-blue transition-colors px-2 py-1 flex items-center gap-1"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Users size={18} />
                        <span>Gestion des utilisateurs</span>
                      </Link>
                    </>
                  )}
                  
                  <button 
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="text-red-600 hover:text-red-800 transition-colors px-2 py-1 text-left flex items-center gap-1"
                  >
                    <LogOut size={18} />
                    <span>Déconnexion</span>
                  </button>
                </>
              ) : (
                <Link 
                  to="/admin" 
                  className="text-gray-700 hover:text-apple-blue transition-colors px-2 py-1"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Connexion
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
