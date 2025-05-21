
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Eye, EyeOff } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const from = location.state?.from?.pathname || "/dashboard";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Appel de la fonction login sans vérification directe du résultat
      await login(email, password);
      
      // Si nous arrivons ici, c'est que la connexion a réussi
      navigate(from, { replace: true });
      
      toast({
        title: "Connexion réussie",
        description: "Bienvenue sur Eagle Xpert Inspection",
      });
    } catch (error) {
      console.error("Login error:", error);
      let errorMessage = "Email ou mot de passe incorrect";
      
      if (error instanceof Error) {
        if (error.message.includes("Invalid login credentials")) {
          errorMessage = "Email ou mot de passe incorrect";
        } else if (error.message.includes("Email not confirmed")) {
          errorMessage = "Veuillez confirmer votre email avant de vous connecter";
        } else {
          errorMessage = `Erreur: ${error.message}`;
        }
      }
      
      toast({
        title: "Échec de la connexion",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Available test accounts for demo
  const testAccounts = [
    { role: "Administrateur", email: "admin@eaglexpert.com" },
    { role: "Commercial", email: "commercial@eaglexpert.com" },
    { role: "Manager", email: "manager@eaglexpert.com" },
    { role: "Superviseur", email: "supervisor@eaglexpert.com" },
    { role: "Inspecteur", email: "inspector@eaglexpert.com" }
  ];

  const fillTestAccount = (email: string) => {
    setEmail(email);
    setPassword("password");
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="animate-fade-in w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-eagle-primary mb-2">EAGLE XPERT</h1>
          <p className="text-gray-600">Plateforme d'inspection de véhicules</p>
        </div>
        
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-6 text-center">Connexion</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                className="w-full"
                autoComplete="email"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pr-10"
                />
                <button 
                  type="button" 
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  onClick={togglePasswordVisibility}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            
            <Button
              type="submit"
              className="w-full bg-eagle-primary hover:bg-eagle-primary/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <div className="h-4 w-4 border-t-2 border-white rounded-full animate-spin"></div>
                  Connexion...
                </span>
              ) : (
                "Se connecter"
              )}
            </Button>
          </form>
          
          <div className="mt-6">
            <p className="text-sm text-gray-600 mb-2">Comptes de démonstration:</p>
            <div className="grid grid-cols-1 gap-2">
              {testAccounts.map((account) => (
                <button
                  key={account.email}
                  onClick={() => fillTestAccount(account.email)}
                  className="text-sm text-left px-3 py-1.5 border border-gray-200 rounded-md hover:bg-gray-50 flex justify-between items-center"
                >
                  <span className="font-medium">{account.role}</span>
                  <span className="text-gray-500 text-xs">{account.email}</span>
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">Mot de passe: "password" pour tous les comptes</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
