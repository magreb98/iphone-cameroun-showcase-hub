
import MainLayout from "@/components/layout/MainLayout";

const AboutPage = () => {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-12">
        <h1 className="section-title text-center mb-10">À Propos de iPhone Cameroun</h1>

        {/* Main Content */}
        <div className="max-w-3xl mx-auto space-y-10">
          {/* Our Story */}
          <section className="space-y-4">
            <h2 className="subsection-title">Notre Histoire</h2>
            <p className="text-gray-600 leading-relaxed">
              Fondée en 2015, iPhone Cameroun est née de la passion pour les produits Apple et du désir
              d'offrir aux Camerounais un accès facile à des produits Apple authentiques et de qualité.
              Ce qui a commencé comme une petite boutique à Yaoundé s'est rapidement développé pour devenir
              l'un des principaux fournisseurs de produits Apple au Cameroun.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Notre mission est de rendre la technologie Apple accessible à tous les Camerounais,
              avec un service client exceptionnel et un support après-vente de qualité.
            </p>
          </section>

          {/* What We Offer */}
          <section className="space-y-4">
            <h2 className="subsection-title">Ce Que Nous Offrons</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="font-semibold text-lg mb-2 text-apple-dark">Produits Authentiques</h3>
                <p className="text-gray-600">
                  Tous nos produits sont 100% authentiques et proviennent de sources officielles,
                  garantissant leur qualité et performance optimale.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="font-semibold text-lg mb-2 text-apple-dark">Service Après-Vente</h3>
                <p className="text-gray-600">
                  Notre équipe technique est toujours disponible pour résoudre vos problèmes
                  et garantir une satisfaction à long terme avec vos produits.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="font-semibold text-lg mb-2 text-apple-dark">Livraison Nationale</h3>
                <p className="text-gray-600">
                  Nous livrons partout au Cameroun, assurant que vos produits arrivent
                  en parfait état et dans les délais promis.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="font-semibold text-lg mb-2 text-apple-dark">Conseil Personnalisé</h3>
                <p className="text-gray-600">
                  Notre équipe vous aide à choisir les produits qui correspondent le mieux
                  à vos besoins et à votre budget.
                </p>
              </div>
            </div>
          </section>

          {/* Our Team */}
          <section className="space-y-8">
            <h2 className="subsection-title">Notre Équipe</h2>
            <p className="text-gray-600 leading-relaxed">
              Notre équipe est composée de passionnés de technologie Apple, formés pour vous offrir
              le meilleur service possible. Chaque membre apporte son expertise et son enthousiasme
              pour vous aider à trouver les produits parfaits pour vos besoins.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {[
                {
                  name: "Thomas Kamga",
                  role: "Fondateur & Directeur",
                  image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300"
                },
                {
                  name: "Marie Ndom",
                  role: "Responsable des Ventes",
                  image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300"
                },
                {
                  name: "Paul Mbarga",
                  role: "Support Technique",
                  image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300"
                }
              ].map((member, index) => (
                <div key={index} className="text-center">
                  <div className="w-32 h-32 mx-auto rounded-full overflow-hidden mb-4">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="font-medium text-lg text-apple-dark">{member.name}</h3>
                  <p className="text-apple-accent">{member.role}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Vision & Mission */}
          <section className="space-y-4">
            <h2 className="subsection-title">Notre Vision & Mission</h2>
            <div className="bg-apple-blue text-white p-6 rounded-lg">
              <p className="italic font-medium text-lg mb-4">
                "Notre vision est de devenir le premier fournisseur de produits Apple au Cameroun,
                reconnu pour notre service exceptionnel et notre engagement envers la satisfaction client."
              </p>
              <p>
                Notre mission est de rendre la technologie Apple accessible à tous les Camerounais,
                tout en offrant un service client et un support technique de premier ordre.
                Nous nous engageons à éduquer nos clients sur les produits Apple et à les aider
                à tirer le meilleur parti de leur technologie.
              </p>
            </div>
          </section>
        </div>
      </div>
    </MainLayout>
  );
};

export default AboutPage;
