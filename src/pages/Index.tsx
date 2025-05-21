
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Définir un délai de 5 secondes avant la redirection
    const timer = setTimeout(() => {
      navigate('/login');
    }, 5000);

    // Créer un intervalle pour mettre à jour le compte à rebours
    const interval = setInterval(() => {
      setCountdown((prevCount) => prevCount - 1);
    }, 1000);

    // Nettoyer les timers lors du démontage du composant
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center animate-fade-in">
        <h1 className="text-4xl font-bold mb-4 text-eagle-primary">EAGLE XPERT INSPECTION</h1>
        <p className="text-xl text-gray-600 mb-6">Plateforme professionnelle d'inspection de véhicules</p>
        <div className="mt-8 text-gray-500">
          <p>Redirection dans {countdown} secondes...</p>
          <div className="mt-4 w-64 h-2 bg-gray-200 rounded-full mx-auto overflow-hidden">
            <div 
              className="h-full bg-eagle-primary transition-all duration-1000 ease-linear"
              style={{ width: `${(5 - countdown) * 20}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
