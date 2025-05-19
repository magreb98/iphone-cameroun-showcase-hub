
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getConfiguration } from "@/api/configurations";
import { Facebook, Instagram, Twitter, Phone } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const { data: whatsappConfig } = useQuery({
    queryKey: ['config', 'whatsapp_number'],
    queryFn: () => getConfiguration('whatsapp_number')
  });

  const { data: emailConfig } = useQuery({
    queryKey: ['config', 'email_address'],
    queryFn: () => getConfiguration('email_address')
  });

  const { data: instagramConfig } = useQuery({
    queryKey: ['config', 'instagram_link'],
    queryFn: () => getConfiguration('instagram_link')
  });

  const { data: facebookConfig } = useQuery({
    queryKey: ['config', 'facebook_link'],
    queryFn: () => getConfiguration('facebook_link')
  });
  
  const phoneNumber = whatsappConfig?.configValue || "+237 6XX XXX XXX";
  const email = emailConfig?.configValue || "contact@iphonecameroun.com";
  const instagramLink = instagramConfig?.configValue || "#";
  const facebookLink = facebookConfig?.configValue || "#";

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
            <p className="text-gray-300">Email: {email}</p>
            <p className="text-gray-300">Tél: {phoneNumber}</p>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Suivez-nous</h3>
            <div className="flex space-x-4">
              <a href={facebookLink} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors flex items-center">
                <Facebook className="h-4 w-4 mr-1" />
                Facebook
              </a>
              <a href={instagramLink} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors flex items-center">
                <Instagram className="h-4 w-4 mr-1" />
                Instagram
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
