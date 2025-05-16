
import { Button } from "@/components/ui/button";
import { ArrowRight, Search } from "lucide-react";
import { Link } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";

const HomePage = () => {
  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative bg-black text-white">
        <div className="container mx-auto px-4 py-20 sm:py-32 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 space-y-6 text-center md:text-left">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight">
              Découvrez la gamme Apple au Cameroun
            </h1>
            <p className="text-lg sm:text-xl text-gray-300">
              Votre revendeur officiel de produits Apple au Cameroun. Qualité et authenticité garanties.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Button asChild className="btn-primary" size="lg">
                <Link to="/products">
                  Voir nos produits <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="bg-transparent border-white text-white hover:bg-white/10" size="lg">
                <Link to="/contact">
                  Contactez-nous
                </Link>
              </Button>
            </div>
          </div>
          <div className="md:w-1/2 mt-10 md:mt-0">
            <img 
              src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=800" 
              alt="iPhone et MacBook" 
              className="mx-auto rounded-lg"
              width={600}
              height={400}
            />
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="section-title text-center mb-12">Nos Catégories</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                name: "iPhones",
                image: "https://images.unsplash.com/photo-1575695342320-d2d2d2f9b73f?auto=format&fit=crop&w=500",
                link: "/products?category=iPhone"
              },
              {
                name: "MacBooks",
                image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=500",
                link: "/products?category=MacBook"
              },
              {
                name: "iPads",
                image: "https://images.unsplash.com/photo-1561154464-82e9adf32764?auto=format&fit=crop&w=500",
                link: "/products?category=iPad"
              },
              {
                name: "Accessoires",
                image: "https://images.unsplash.com/photo-1608156639585-b3a032e39d60?auto=format&fit=crop&w=500",
                link: "/products?category=Accessory"
              }
            ].map((category) => (
              <Link 
                to={category.link} 
                key={category.name}
                className="group"
              >
                <div className="relative overflow-hidden rounded-lg aspect-square bg-gray-100">
                  <img 
                    src={category.image} 
                    alt={category.name} 
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex items-end p-6">
                    <h3 className="text-white text-xl font-semibold">{category.name}</h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-apple-gray">
        <div className="container mx-auto px-4">
          <h2 className="section-title text-center mb-12">Pourquoi Nous Choisir ?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Produits Authentiques",
                description: "Tous nos produits sont 100% authentiques et proviennent directement des fournisseurs agréés Apple."
              },
              {
                title: "Service Après-Vente",
                description: "Nous offrons une garantie et un support technique pour tous les produits achetés chez nous."
              },
              {
                title: "Livraison Rapide",
                description: "Livraison rapide et sécurisée partout au Cameroun dans les plus brefs délais."
              }
            ].map((item, index) => (
              <div key={index} className="bg-white p-8 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-4 text-apple-dark">{item.title}</h3>
                <p className="text-apple-accent">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-apple-blue text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Prêt à découvrir nos produits ?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Explorez notre catalogue et trouvez l'appareil Apple parfait pour vos besoins.
          </p>
          <Button asChild size="lg" className="bg-white text-apple-blue hover:bg-gray-100">
            <Link to="/products">
              Voir tous les produits <Search className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </MainLayout>
  );
};

export default HomePage;
