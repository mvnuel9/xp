
import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Loader2, Save } from "lucide-react";
import SampleDataGenerator from "@/components/SampleDataGenerator";
import { useSettings } from "@/hooks/useSettings";

const Parametres = () => {
  const { 
    loading, 
    systemSettings, 
    setSystemSettings, 
    billingSettings, 
    setBillingSettings,
    saveSystemSettings,
    saveBillingSettings
  } = useSettings();

  const [savingSystem, setSavingSystem] = useState(false);
  const [savingBilling, setSavingBilling] = useState(false);

  const handleSaveSystemSettings = async () => {
    setSavingSystem(true);
    await saveSystemSettings(systemSettings);
    setSavingSystem(false);
  };

  const handleSaveBillingSettings = async () => {
    setSavingBilling(true);
    await saveBillingSettings(billingSettings);
    setSavingBilling(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Paramètres</h1>
      </div>
      
      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">Généraux</TabsTrigger>
          <TabsTrigger value="billing">Facturation</TabsTrigger>
          <TabsTrigger value="inspection">Inspection</TabsTrigger>
          <TabsTrigger value="validation">Validation</TabsTrigger>
          <TabsTrigger value="data">Données</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres par défaut</CardTitle>
              <CardDescription>
                Configuration des paramètres généraux de l'application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currency">Devise</Label>
                  <Input 
                    id="currency" 
                    value={systemSettings.default_currency} 
                    onChange={(e) => setSystemSettings({...systemSettings, default_currency: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="country">Pays</Label>
                  <Input 
                    id="country" 
                    value={systemSettings.default_country} 
                    onChange={(e) => setSystemSettings({...systemSettings, default_country: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="postal-code"
                  checked={systemSettings.postal_code_required}
                  onCheckedChange={(checked) => setSystemSettings({...systemSettings, postal_code_required: checked})}
                />
                <Label htmlFor="postal-code">Code postal requis</Label>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveSystemSettings} disabled={savingSystem}>
                {savingSystem ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enregistrement...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Enregistrer
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="billing" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres de facturation</CardTitle>
              <CardDescription>
                Configuration des paramètres pour la facturation des franchises et clients
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="inspectionPrice">Prix de base de l'inspection</Label>
                  <Input
                    id="inspectionPrice"
                    type="number"
                    value={billingSettings.inspection_base_price}
                    onChange={(e) => setBillingSettings({...billingSettings, inspection_base_price: Number(e.target.value)})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="taxRate">Taux de TVA (%)</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    value={billingSettings.tax_rate}
                    onChange={(e) => setBillingSettings({...billingSettings, tax_rate: Number(e.target.value)})}
                  />
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <h3 className="text-lg font-medium">Redevance Franchise</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="feeType">Type de redevance</Label>
                  <Select
                    value={billingSettings.franchise_fee_type}
                    onValueChange={(value: 'fixed' | 'percentage') => 
                      setBillingSettings({...billingSettings, franchise_fee_type: value})
                    }
                  >
                    <SelectTrigger id="feeType">
                      <SelectValue placeholder="Sélectionner le type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">Montant fixe</SelectItem>
                      <SelectItem value="percentage">Pourcentage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="feeValue">
                    {billingSettings.franchise_fee_type === 'fixed' 
                      ? 'Montant de la redevance' 
                      : 'Pourcentage de la redevance (%)'}
                  </Label>
                  <Input
                    id="feeValue"
                    type="number"
                    value={billingSettings.franchise_fee_value}
                    onChange={(e) => setBillingSettings({...billingSettings, franchise_fee_value: Number(e.target.value)})}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveBillingSettings} disabled={savingBilling}>
                {savingBilling ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enregistrement...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Enregistrer
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="inspection" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres d'inspection</CardTitle>
              <CardDescription>
                Configuration des inspections et des processus associés
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Les paramètres d'inspection seront implémentés dans une future mise à jour.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="validation" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres de validation</CardTitle>
              <CardDescription>
                Configuration du processus de validation des inspections
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Les paramètres de validation seront implémentés dans une future mise à jour.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="space-y-4 pt-4">
          <SampleDataGenerator />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Parametres;
