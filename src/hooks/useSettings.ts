
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { BillingSettings, SystemSettings } from "@/types/settings";

export const useSettings = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    default_currency: "XOF",
    default_country: "Côte d'Ivoire",
    postal_code_required: false 
  });
  const [billingSettings, setBillingSettings] = useState<BillingSettings>({
    id: "",
    inspection_base_price: 5000,
    franchise_fee_type: "fixed",
    franchise_fee_value: 1000,
    tax_rate: 18.0,
    created_at: "",
    updated_at: ""
  });

  const fetchSettings = async () => {
    setLoading(true);
    try {
      // Fetch system settings
      const { data: systemData, error: systemError } = await supabase
        .from('system_settings')
        .select('*');
        
      if (systemError) throw systemError;
      
      if (systemData && systemData.length > 0) {
        const settingsObj = systemData.reduce((acc: Record<string, any>, item: any) => {
          acc[item.key] = JSON.parse(item.value);
          return acc;
        }, {});
        
        setSystemSettings({
          default_currency: settingsObj.default_currency || "XOF",
          default_country: settingsObj.default_country || "Côte d'Ivoire",
          postal_code_required: settingsObj.postal_code_required || false
        });
      }

      // Fetch billing settings
      const { data: billingData, error: billingError } = await supabase
        .from('billing_settings')
        .select('*')
        .limit(1);
        
      if (billingError) throw billingError;
      
      if (billingData && billingData.length > 0) {
        setBillingSettings(billingData[0] as unknown as BillingSettings);
      }
    } catch (error: any) {
      console.error('Error loading settings:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Impossible de charger les paramètres",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSystemSettings = async (settings: SystemSettings) => {
    try {
      const updates = [
        {
          key: 'default_currency',
          value: JSON.stringify(settings.default_currency)
        },
        {
          key: 'default_country',
          value: JSON.stringify(settings.default_country)
        },
        {
          key: 'postal_code_required',
          value: JSON.stringify(settings.postal_code_required)
        }
      ];

      // Update each setting
      for (const update of updates) {
        const { error } = await supabase
          .from('system_settings')
          .update({ value: update.value })
          .eq('key', update.key);
          
        if (error) throw error;
      }

      toast({
        title: "Paramètres système mis à jour",
        description: "Les paramètres ont été enregistrés avec succès",
      });
      
      return true;
    } catch (error: any) {
      console.error('Error saving system settings:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Impossible d'enregistrer les paramètres système",
      });
      return false;
    }
  };

  const saveBillingSettings = async (settings: BillingSettings) => {
    try {
      const { error } = await supabase
        .from('billing_settings')
        .update({
          inspection_base_price: settings.inspection_base_price,
          franchise_fee_type: settings.franchise_fee_type,
          franchise_fee_value: settings.franchise_fee_value,
          tax_rate: settings.tax_rate
        })
        .eq('id', settings.id);
        
      if (error) throw error;

      toast({
        title: "Paramètres de facturation mis à jour",
        description: "Les paramètres ont été enregistrés avec succès",
      });
      
      return true;
    } catch (error: any) {
      console.error('Error saving billing settings:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Impossible d'enregistrer les paramètres de facturation",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    loading,
    systemSettings,
    setSystemSettings,
    billingSettings, 
    setBillingSettings,
    saveSystemSettings,
    saveBillingSettings,
    fetchSettings
  };
};
