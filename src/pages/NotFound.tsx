
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="text-center max-w-md px-4">
        <h1 className="text-6xl font-bold text-eagle-primary mb-4">404</h1>
        <p className="text-xl text-gray-700 mb-6">Page non trouvée</p>
        <p className="text-gray-500 mb-8">
          La page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        <Button 
          onClick={() => navigate("/dashboard")}
          className="bg-eagle-primary hover:bg-eagle-primary/90"
        >
          Retour au tableau de bord
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
