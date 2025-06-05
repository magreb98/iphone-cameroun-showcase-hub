
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { login } from "@/api/auth";
import { useAuth } from "@/hooks/useAuth";
import { Eye, EyeOff, LogIn, AlertCircle } from "lucide-react";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();

  // Rediriger si déjà connecté
  useEffect(() => {
    if (!authLoading && user) {
      navigate("/admin/dashboard");
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError("");

    // Validation côté client
    if (!email.trim()) {
      setLoginError("L'email est requis");
      setIsLoading(false);
      return;
    }

    if (!password.trim()) {
      setLoginError("Le mot de passe est requis");
      setIsLoading(false);
      return;
    }

    try {
      const data = await login({ email: email.trim(), password });
      
      // Stocker le token dans les deux emplacements pour compatibilité
      localStorage.setItem("admin_token", data.token);
      localStorage.setItem("token", data.token);
      
      toast.success("Connexion réussie ! Redirection...");
      
      // Petite pause pour que l'utilisateur voie le message de succès
      setTimeout(() => {
        navigate("/admin/dashboard");
      }, 1000);
      
    } catch (error: any) {
      console.error("Erreur de connexion:", error);
      
      let errorMessage = "Une erreur est survenue";
      
      if (error.response?.status === 401) {
        errorMessage = "Email ou mot de passe incorrect";
      } else if (error.response?.status === 500) {
        errorMessage = "Erreur serveur. Veuillez réessayer plus tard.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setLoginError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Affichage de chargement si vérification d'auth en cours
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-apple-gray">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-apple-gray p-4">
      <Card className="max-w-md w-full shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <LogIn className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Administration</CardTitle>
          <CardDescription>
            Connectez-vous à votre compte administrateur pour gérer la plateforme
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {/* Affichage des erreurs */}
            {loginError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                <span className="text-sm text-red-700">{loginError}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="h-11"
                autoComplete="email"
                autoFocus
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="h-11 pr-10"
                  autoComplete="current-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            
            <div className="text-center">
              <Link 
                to="/forgot-password" 
                className="text-sm text-blue-600 hover:text-blue-500 hover:underline"
              >
                Mot de passe oublié ?
              </Link>
            </div>
          </CardContent>
          
          <CardFooter>
            <Button 
              type="submit" 
              className="w-full h-11" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Connexion en cours...
                </>
              ) : (
                "Se connecter"
              )}
            </Button>
          </CardFooter>
        </form>
        
        {/* Informations de test */}
        <div className="px-6 pb-6">
          <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600">
            <p className="font-medium mb-1">Comptes de test disponibles :</p>
            <p>• Admin: admin@test.com / password</p>
            <p>• SuperAdmin: superadmin@test.com / password</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;
