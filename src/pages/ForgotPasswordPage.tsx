
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { requestPasswordReset, verifyResetCode, resetPassword } from "@/api/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { Link } from "react-router-dom";

type Step = 'phone' | 'code' | 'newPassword' | 'success';

const ForgotPasswordPage = () => {
  const [step, setStep] = useState<Step>('phone');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const requestCodeMutation = useMutation({
    mutationFn: requestPasswordReset,
    onSuccess: (data) => {
      toast.success("Code de vérification envoyé sur WhatsApp");
      // For development purposes, show the code
      if (data.verificationCode) {
        toast.info(`Code de développement: ${data.verificationCode}`);
      }
      setStep('code');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erreur lors de l'envoi du code");
    }
  });

  const verifyCodeMutation = useMutation({
    mutationFn: verifyResetCode,
    onSuccess: () => {
      toast.success("Code vérifié avec succès");
      setStep('newPassword');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Code invalide ou expiré");
    }
  });

  const resetPasswordMutation = useMutation({
    mutationFn: resetPassword,
    onSuccess: () => {
      toast.success("Mot de passe réinitialisé avec succès");
      setStep('success');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erreur lors de la réinitialisation");
    }
  });

  const handleRequestCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!whatsappNumber.trim()) {
      toast.error("Veuillez entrer votre numéro WhatsApp");
      return;
    }
    requestCodeMutation.mutate({ whatsappNumber });
  };

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode.trim()) {
      toast.error("Veuillez entrer le code de vérification");
      return;
    }
    verifyCodeMutation.mutate({ whatsappNumber, code: verificationCode });
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }
    resetPasswordMutation.mutate({ whatsappNumber, code: verificationCode, newPassword });
  };

  const renderStep = () => {
    switch (step) {
      case 'phone':
        return (
          <form onSubmit={handleRequestCode} className="space-y-4">
            <div>
              <Label htmlFor="whatsapp">Numéro WhatsApp</Label>
              <Input
                id="whatsapp"
                type="tel"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="+237600000000"
                required
              />
              <p className="text-sm text-muted-foreground mt-1">
                Entrez le numéro WhatsApp associé à votre compte
              </p>
            </div>
            <Button type="submit" className="w-full" disabled={requestCodeMutation.isPending}>
              {requestCodeMutation.isPending ? "Envoi en cours..." : "Envoyer le code"}
            </Button>
          </form>
        );

      case 'code':
        return (
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <div>
              <Label htmlFor="code">Code de vérification</Label>
              <Input
                id="code"
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="123456"
                maxLength={6}
                required
              />
              <p className="text-sm text-muted-foreground mt-1">
                Entrez le code à 6 chiffres reçu sur WhatsApp
              </p>
            </div>
            <Button type="submit" className="w-full" disabled={verifyCodeMutation.isPending}>
              {verifyCodeMutation.isPending ? "Vérification..." : "Vérifier le code"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => setStep('phone')}
            >
              Retour
            </Button>
          </form>
        );

      case 'newPassword':
        return (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <Label htmlFor="newPassword">Nouveau mot de passe</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nouveau mot de passe"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirmer le mot de passe"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={resetPasswordMutation.isPending}>
              {resetPasswordMutation.isPending ? "Réinitialisation..." : "Réinitialiser le mot de passe"}
            </Button>
          </form>
        );

      case 'success':
        return (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-medium">Mot de passe réinitialisé !</h3>
            <p className="text-muted-foreground">
              Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
            </p>
            <Link to="/admin">
              <Button className="w-full">Se connecter</Button>
            </Link>
          </div>
        );

      default:
        return null;
    }
  };

  const getTitle = () => {
    switch (step) {
      case 'phone': return "Réinitialisation du mot de passe";
      case 'code': return "Vérification";
      case 'newPassword': return "Nouveau mot de passe";
      case 'success': return "Succès";
      default: return "Réinitialisation du mot de passe";
    }
  };

  const getDescription = () => {
    switch (step) {
      case 'phone': return "Entrez votre numéro WhatsApp pour recevoir un code de vérification";
      case 'code': return "Un code de vérification a été envoyé sur votre WhatsApp";
      case 'newPassword': return "Choisissez un nouveau mot de passe sécurisé";
      case 'success': return "";
      default: return "";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-apple-gray p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2">
            {step !== 'phone' && step !== 'success' && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  if (step === 'code') setStep('phone');
                  if (step === 'newPassword') setStep('code');
                }}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <CardTitle className="text-2xl">{getTitle()}</CardTitle>
          </div>
          {getDescription() && (
            <CardDescription>{getDescription()}</CardDescription>
          )}
        </CardHeader>
        
        <CardContent>
          {renderStep()}
          
          {step === 'phone' && (
            <div className="mt-4 text-center">
              <Link to="/admin" className="text-sm text-muted-foreground hover:underline">
                Retour à la connexion
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPasswordPage;
