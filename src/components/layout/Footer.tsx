
import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-apple-dark text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-lg font-semibold mb-4">iPhone Cameroun</h3>
            <p className="text-gray-300 mb-4">
              Votre fournisseur de confiance pour tous les produits Apple au Cameroun.
              Nous offrons des produits authentiques avec service après-vente.
            </p>
          </div>

          {/* Products */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Produits</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/products?category=iPhone" className="text-gray-300 hover:text-white transition-colors">
                  iPhones
                </Link>
              </li>
              <li>
                <Link to="/products?category=MacBook" className="text-gray-300 hover:text-white transition-colors">
                  MacBooks
                </Link>
              </li>
              <li>
                <Link to="/products?category=iPad" className="text-gray-300 hover:text-white transition-colors">
                  iPads
                </Link>
              </li>
              <li>
                <Link to="/products?category=Accessory" className="text-gray-300 hover:text-white transition-colors">
                  Accessoires
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <p className="text-gray-300">Yaoundé, Cameroun</p>
            <p className="text-gray-300">Email: contact@iphonecameroun.com</p>
            <p className="text-gray-300">Tél: +237 6XX XXX XXX</p>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Suivez-nous</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                Facebook
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                Instagram
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                Twitter
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400">
          <p>
            &copy; {currentYear} iPhone Cameroun. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
