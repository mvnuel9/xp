
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const NewInspection = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState("identification");

  // We'll just implement a basic structure for now
  // A complete implementation would handle form state and validation
  
  const handleNext = () => {
    // This is where we'd validate the current step and move to the next
    alert("Cette fonctionnalité sera implémentée dans une version future.");
  };

  const handleCancel = () => {
    if (confirm("Êtes-vous sûr de vouloir annuler cette inspection ? Les données saisies seront perdues.")) {
      navigate("/dashboard");
    }
  };

  return (
    <div className="animate-fade-in">
      <Card className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Nouvelle inspection</h1>
          <p className="text-gray-600">Remplissez le formulaire d'inspection en suivant les étapes</p>
        </div>

        <Tabs defaultValue="identification" value={activeStep} onValueChange={setActiveStep}>
          <div className="overflow-x-auto mb-6">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="identification" className="flex-shrink-0">1. Identification</TabsTrigger>
              <TabsTrigger value="admin" className="flex-shrink-0">2. Administratif</TabsTrigger>
              <TabsTrigger value="initial" className="flex-shrink-0">3. Vérifications</TabsTrigger>
              <TabsTrigger value="exterior" className="flex-shrink-0">4. Extérieur</TabsTrigger>
              <TabsTrigger value="interior" className="flex-shrink-0">5. Intérieur</TabsTrigger>
              <TabsTrigger value="mechanical" className="flex-shrink-0">6. Mécanique</TabsTrigger>
              <TabsTrigger value="road" className="flex-shrink-0">7. Essai routier</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="identification">
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">1. Identification du véhicule</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-1">
                    Marque *
                  </label>
                  <Input
                    id="brand"
                    placeholder="Ex: Toyota"
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
                    Modèle *
                  </label>
                  <Input
                    id="model"
                    placeholder="Ex: Corolla"
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label htmlFor="registration_date" className="block text-sm font-medium text-gray-700 mb-1">
                    Date de mise en circulation *
                  </label>
                  <Input
                    id="registration_date"
                    type="date"
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label htmlFor="odometer" className="block text-sm font-medium text-gray-700 mb-1">
                    Kilométrage (odomètre) *
                  </label>
                  <Input
                    id="odometer"
                    type="number"
                    placeholder="Ex: 45000"
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                    Prix d'achat (XOF) *
                  </label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="Ex: 5000000"
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label htmlFor="transmission" className="block text-sm font-medium text-gray-700 mb-1">
                    Type de boîte de vitesses *
                  </label>
                  <select
                    id="transmission"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">Sélectionner...</option>
                    <option value="manual">Manuelle</option>
                    <option value="automatic">Automatique</option>
                    <option value="semi-automatic">Semi-automatique</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="fuel" className="block text-sm font-medium text-gray-700 mb-1">
                    Type d'énergie *
                  </label>
                  <select
                    id="fuel"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">Sélectionner...</option>
                    <option value="petrol">Essence</option>
                    <option value="diesel">Diesel</option>
                    <option value="hybrid">Hybride</option>
                    <option value="electric">Électrique</option>
                    <option value="lpg">GPL</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="version" className="block text-sm font-medium text-gray-700 mb-1">
                    Version
                  </label>
                  <Input
                    id="version"
                    placeholder="Ex: Premium"
                    className="w-full"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="options" className="block text-sm font-medium text-gray-700 mb-1">
                  Équipements et options
                </label>
                <textarea
                  id="options"
                  rows={3}
                  placeholder="Listez les équipements et options importants du véhicule..."
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                ></textarea>
              </div>
              
              <div className="flex justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                >
                  Annuler
                </Button>
                
                <Button
                  onClick={() => setActiveStep("admin")}
                  className="bg-eagle-primary hover:bg-eagle-primary/90"
                >
                  Étape suivante
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="admin">
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">2. Checklist administrative</h2>
              <p className="text-gray-600 mb-6">
                Cette section sera implémentée avec une liste de contrôles administratifs dans une version future.
              </p>
              
              <div className="flex justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={() => setActiveStep("identification")}
                >
                  Étape précédente
                </Button>
                
                <Button
                  onClick={() => setActiveStep("initial")}
                  className="bg-eagle-primary hover:bg-eagle-primary/90"
                >
                  Étape suivante
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Placeholders for other tabs */}
          <TabsContent value="initial">
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">3. Identification & Vérifications Administratives</h2>
              <p className="text-gray-600">Cette section sera implémentée dans une version future.</p>
              
              <div className="flex justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={() => setActiveStep("admin")}
                >
                  Étape précédente
                </Button>
                
                <Button
                  onClick={() => setActiveStep("exterior")}
                  className="bg-eagle-primary hover:bg-eagle-primary/90"
                >
                  Étape suivante
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="exterior">
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">4. Inspection Extérieure</h2>
              <p className="text-gray-600">Cette section sera implémentée dans une version future.</p>
              
              <div className="flex justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={() => setActiveStep("initial")}
                >
                  Étape précédente
                </Button>
                
                <Button
                  onClick={() => setActiveStep("interior")}
                  className="bg-eagle-primary hover:bg-eagle-primary/90"
                >
                  Étape suivante
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="interior">
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">5. Inspection Intérieure</h2>
              <p className="text-gray-600">Cette section sera implémentée dans une version future.</p>
              
              <div className="flex justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={() => setActiveStep("exterior")}
                >
                  Étape précédente
                </Button>
                
                <Button
                  onClick={() => setActiveStep("mechanical")}
                  className="bg-eagle-primary hover:bg-eagle-primary/90"
                >
                  Étape suivante
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="mechanical">
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">6. Inspection Mécanique</h2>
              <p className="text-gray-600">Cette section sera implémentée dans une version future.</p>
              
              <div className="flex justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={() => setActiveStep("interior")}
                >
                  Étape précédente
                </Button>
                
                <Button
                  onClick={() => setActiveStep("road")}
                  className="bg-eagle-primary hover:bg-eagle-primary/90"
                >
                  Étape suivante
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="road">
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">7. Essai Routier</h2>
              <p className="text-gray-600">Cette section sera implémentée dans une version future.</p>
              
              <div className="flex justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={() => setActiveStep("mechanical")}
                >
                  Étape précédente
                </Button>
                
                <Button
                  onClick={handleNext}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Finaliser l'inspection
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default NewInspection;
