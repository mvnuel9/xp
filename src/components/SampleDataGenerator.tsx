
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { generateAllSampleData, updateFranchiseBlockStatus, updateInvoiceStatus, generateCreditNotes } from '@/utils/sampleDataGenerator';
import { Loader2, Database, ReceiptText, Building, AlertTriangle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const SampleDataGenerator = () => {
  const [loading, setLoading] = useState(false);
  const [generatingCreditNotes, setGeneratingCreditNotes] = useState(false);
  const [updatingBlockStatus, setUpdatingBlockStatus] = useState(false);
  const [updatingInvoiceStatus, setUpdatingInvoiceStatus] = useState(false);
  const { toast } = useToast();

  const handleGenerateData = async () => {
    setLoading(true);
    try {
      await generateAllSampleData();
      toast({
        title: "Données d'exemple générées",
        description: "Les données d'exemple ont été créées avec succès.",
      });
    } catch (error) {
      console.error('Error generating sample data:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de générer les données d'exemple.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCreditNotes = async () => {
    setGeneratingCreditNotes(true);
    try {
      await generateCreditNotes();
      toast({
        title: "Avoirs générés",
        description: "Les avoirs d'exemple ont été créés avec succès.",
      });
    } catch (error) {
      console.error('Error generating credit notes:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de générer les avoirs d'exemple.",
      });
    } finally {
      setGeneratingCreditNotes(false);
    }
  };

  const handleUpdateFranchiseBlockStatus = async () => {
    setUpdatingBlockStatus(true);
    try {
      await updateFranchiseBlockStatus();
      toast({
        title: "Statut des franchises mis à jour",
        description: "Le statut de blocage des franchises a été mis à jour avec succès.",
      });
    } catch (error) {
      console.error('Error updating franchise block status:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de mettre à jour le statut de blocage des franchises.",
      });
    } finally {
      setUpdatingBlockStatus(false);
    }
  };

  const handleUpdateInvoiceStatus = async () => {
    setUpdatingInvoiceStatus(true);
    try {
      await updateInvoiceStatus();
      toast({
        title: "Statut des factures mis à jour",
        description: "Le statut des factures a été mis à jour avec succès.",
      });
    } catch (error) {
      console.error('Error updating invoice status:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de mettre à jour le statut des factures.",
      });
    } finally {
      setUpdatingInvoiceStatus(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Génération de données d'exemple</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="data-generation" className="w-full">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="data-generation">Génération de données</TabsTrigger>
            <TabsTrigger value="data-actions">Actions supplémentaires</TabsTrigger>
          </TabsList>
          <TabsContent value="data-generation">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground mb-4">
                Générer des données d'exemple pour tester l'application, y compris des franchises,
                des utilisateurs avec différents rôles, des clients, des véhicules, des inspections et des factures.
              </p>
              <Button 
                onClick={handleGenerateData} 
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Génération en cours...
                  </>
                ) : (
                  <>
                    <Database className="mr-2 h-4 w-4" />
                    Générer des données d'exemple
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
          <TabsContent value="data-actions" className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-medium">Actions sur les données existantes</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Effectuer des actions supplémentaires sur les données existantes pour diversifier les scénarios de test.
              </p>
              
              <Button 
                onClick={handleGenerateCreditNotes} 
                disabled={generatingCreditNotes}
                className="w-full mb-2"
                variant="outline"
              >
                {generatingCreditNotes ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Génération en cours...
                  </>
                ) : (
                  <>
                    <ReceiptText className="mr-2 h-4 w-4" />
                    Générer des avoirs et demandes d'avoirs
                  </>
                )}
              </Button>
              
              <Button 
                onClick={handleUpdateFranchiseBlockStatus} 
                disabled={updatingBlockStatus}
                className="w-full mb-2"
                variant="outline"
              >
                {updatingBlockStatus ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Mise à jour en cours...
                  </>
                ) : (
                  <>
                    <Building className="mr-2 h-4 w-4" />
                    Mettre à jour les statuts des franchises
                  </>
                )}
              </Button>
              
              <Button 
                onClick={handleUpdateInvoiceStatus} 
                disabled={updatingInvoiceStatus}
                className="w-full"
                variant="outline"
              >
                {updatingInvoiceStatus ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Mise à jour en cours...
                  </>
                ) : (
                  <>
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Marquer des factures comme échues/payées
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default SampleDataGenerator;
