
import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Shield } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
  requireSuperAdmin?: boolean;
}

const ProtectedRoute = ({ children, requireSuperAdmin = false }: ProtectedRouteProps) => {
  const { user, isLoading, error } = useAuth();
  const location = useLocation();

  // Affichage de chargement
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Vérification de l'authentification...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Erreur d'authentification
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Erreur d'authentification</h2>
            <p className="text-gray-600 text-center mb-4">
              Une erreur est survenue lors de la vérification de votre session.
            </p>
            <button 
              onClick={() => window.location.href = "/admin/login"}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Se reconnecter
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Utilisateur non connecté
  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // Vérifier les permissions admin
  if (!user.isAdmin && !user.isSuperAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Shield className="h-12 w-12 text-orange-500 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Accès refusé</h2>
            <p className="text-gray-600 text-center mb-4">
              Vous n'avez pas les permissions nécessaires pour accéder à cette page.
            </p>
            <button 
              onClick={() => window.location.href = "/"}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Retour à l'accueil
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Vérifier les permissions super admin si requis
  if (requireSuperAdmin && !user.isSuperAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Shield className="h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Super Admin requis</h2>
            <p className="text-gray-600 text-center mb-4">
              Cette fonctionnalité est réservée aux super administrateurs.
            </p>
            <button 
              onClick={() => window.location.href = "/admin/dashboard"}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Retour au tableau de bord
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Utilisateur autorisé, afficher le contenu
  return <>{children}</>;
};

export default ProtectedRoute;
