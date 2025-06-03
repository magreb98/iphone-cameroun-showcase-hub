
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, ShoppingBag, Building } from "lucide-react";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
            <Link to="/admin" className="text-gray-700 hover:text-apple-blue hover:bg-white transition-colors bg-apple-blue text-white rounded px-4 py-2">
              Login
            </Link>
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
              <Link 
                to="/admin" 
                className="text-gray-700 hover:text-apple-blue transition-colors px-2 py-1"
                onClick={() => setIsMenuOpen(false)}
              >
                Admin
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
