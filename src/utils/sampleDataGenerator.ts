import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Role } from "@/types/auth";

// Generate random date within a range
const randomDate = (start: Date, end: Date) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Format date to ISO string
const formatDate = (date: Date) => {
  return date.toISOString();
};

// Generate random number within a range
const randomNumber = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Generate random element from array
const randomElement = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

// Generate sample system settings if they don't exist
export const generateSystemSettings = async () => {
  try {
    const { data: existingSettings } = await supabase
      .from('system_settings')
      .select('*');
      
    if (existingSettings && existingSettings.length > 0) {
      console.log('System settings already exist');
      return;
    }
    
    const settings = [
      {
        key: 'default_currency',
        value: JSON.stringify('XOF'),
        description: 'Default currency used in the system'
      },
      {
        key: 'default_country',
        value: JSON.stringify('Côte d\'Ivoire'),
        description: 'Default country for address fields'
      },
      {
        key: 'postal_code_required',
        value: JSON.stringify(false),
        description: 'Whether postal code is required in address fields'
      }
    ];
    
    const { error } = await supabase
      .from('system_settings')
      .insert(settings);
      
    if (error) throw error;
    console.log('Sample system settings created successfully');
  } catch (error) {
    console.error('Error generating system settings:', error);
    toast({
      variant: "destructive", 
      title: "Error",
      description: "Failed to generate system settings",
    });
  }
};

// Generate sample billing settings if they don't exist
export const generateBillingSettings = async () => {
  try {
    const { data: existingSettings } = await supabase
      .from('billing_settings')
      .select('*');
      
    if (existingSettings && existingSettings.length > 0) {
      console.log('Billing settings already exist');
      return;
    }
    
    const settings = {
      inspection_base_price: 5000,
      franchise_fee_type: 'fixed',
      franchise_fee_value: 1000,
      tax_rate: 18.0
    };
    
    const { error } = await supabase
      .from('billing_settings')
      .insert(settings);
      
    if (error) throw error;
    console.log('Sample billing settings created successfully');
  } catch (error) {
    console.error('Error generating billing settings:', error);
    toast({
      variant: "destructive",
      title: "Error",
      description: "Failed to generate billing settings",
    });
  }
};

// Generate sample franchises
export const generateFranchises = async () => {
  try {
    const { data: existingFranchises } = await supabase
      .from('franchises')
      .select('*');
      
    if (existingFranchises && existingFranchises.length >= 5) {
      console.log('Franchises already exist');
      return existingFranchises;
    }
    
    const franchises = [
      { name: 'Eagle Xpert Abidjan', location: 'Abidjan' },
      { name: 'Eagle Xpert Bouaké', location: 'Bouaké' },
      { name: 'Eagle Xpert Yamoussoukro', location: 'Yamoussoukro' },
      { name: 'Eagle Xpert Daloa', location: 'Daloa' },
      { name: 'Eagle Xpert San Pedro', location: 'San Pedro' }
    ];
    
    const { data, error } = await supabase
      .from('franchises')
      .upsert(franchises, { onConflict: 'name' })
      .select();
      
    if (error) throw error;
    console.log('Sample franchises created successfully');
    return data;
  } catch (error) {
    console.error('Error generating franchises:', error);
    toast({
      variant: "destructive",
      title: "Error",
      description: "Failed to generate franchises",
    });
    return [];
  }
};

// Generate sample users
export const generateUsers = async (franchises: any[]) => {
  try {
    const { data: existingProfiles } = await supabase
      .from('profiles')
      .select('*');
      
    if (existingProfiles && existingProfiles.length >= 10) {
      console.log('Users already exist');
      return existingProfiles;
    }
    
    // Create admin if it doesn't exist
    const adminEmail = 'admin@eaglexpert.com';
    const { data: existingAdmin } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', adminEmail)
      .single();
      
    if (!existingAdmin) {
      const { data: adminUser, error: signUpError } = await supabase.auth.signUp({
        email: adminEmail,
        password: 'admin123456',
      });
      
      if (signUpError) {
        console.error('Error creating admin user:', signUpError);
      } else if (adminUser.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: adminUser.user.id,
            email: adminEmail,
            name: 'Admin',
            role: 'admin' as Role
          });
          
        if (profileError) console.error('Error creating admin profile:', profileError);
        else console.log('Admin user created successfully');
      }
    }
    
    // Create other users
    const userRoles = [
      { role: 'commercial' as Role, count: 2 },
      { role: 'franchise_manager' as Role, count: 5 },
      { role: 'supervisor' as Role, count: 3 },
      { role: 'inspector' as Role, count: 5 }
    ];
    
    const createdUsers = [];
    
    for (const roleConfig of userRoles) {
      for (let i = 1; i <= roleConfig.count; i++) {
        const email = `${roleConfig.role}${i}@eaglexpert.com`;
        
        const { data: existingUser } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', email)
          .single();
          
        if (!existingUser) {
          const { data: authUser, error: signUpError } = await supabase.auth.signUp({
            email,
            password: 'password123',
          });
          
          if (signUpError) {
            console.error(`Error creating ${roleConfig.role} user:`, signUpError);
          } else if (authUser.user) {
            const userName = `${roleConfig.role.charAt(0).toUpperCase() + roleConfig.role.slice(1)} ${i}`;
            
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .upsert({
                id: authUser.user.id,
                email,
                name: userName,
                role: roleConfig.role
              })
              .select()
              .single();
              
            if (profileError) {
              console.error(`Error creating ${roleConfig.role} profile:`, profileError);
            } else {
              console.log(`${roleConfig.role} user created successfully`);
              createdUsers.push(profile);
              
              // Assign franchise managers and inspectors to franchises
              if (roleConfig.role === 'franchise_manager' || roleConfig.role === 'inspector') {
                const franchiseIndex = (i - 1) % franchises.length;
                const { error: franchiseError } = await supabase
                  .from('user_franchises')
                  .insert({
                    user_id: profile.id,
                    franchise_id: franchises[franchiseIndex].id
                  });
                  
                if (franchiseError) console.error('Error assigning user to franchise:', franchiseError);
                else console.log(`User assigned to franchise ${franchises[franchiseIndex].name}`);
              }
              
              // Set supervisor availability
              if (roleConfig.role === 'supervisor') {
                const { error: availabilityError } = await supabase
                  .from('supervisor_availability')
                  .insert({
                    supervisor_id: profile.id,
                    available: true
                  });
                  
                if (availabilityError) console.error('Error setting supervisor availability:', availabilityError);
                else console.log(`Supervisor availability set for ${userName}`);
              }
            }
          }
        } else {
          createdUsers.push(existingUser);
        }
      }
    }
    
    return createdUsers;
  } catch (error) {
    console.error('Error generating users:', error);
    toast({
      variant: "destructive",
      title: "Error",
      description: "Failed to generate users",
    });
    return [];
  }
};

// Generate sample clients
export const generateClients = async (franchises: any[]) => {
  try {
    const { data: existingClients } = await supabase
      .from('clients')
      .select('*');
      
    if (existingClients && existingClients.length >= 20) {
      console.log('Clients already exist');
      return existingClients;
    }
    
    const clients = [];
    
    for (let i = 1; i <= 20; i++) {
      const franchiseIndex = (i - 1) % franchises.length;
      
      clients.push({
        name: `Client ${i}`,
        email: `client${i}@example.com`,
        phone: `+225 0${randomNumber(1, 9)}${randomNumber(10000000, 99999999)}`,
        address: `${randomNumber(1, 100)} Rue ${randomNumber(1, 50)}, ${franchises[franchiseIndex].location}`,
        franchise_id: franchises[franchiseIndex].id,
        tax_exempt: i % 5 === 0 // Every 5th client is tax exempt
      });
    }
    
    const { data, error } = await supabase
      .from('clients')
      .upsert(clients, { onConflict: 'name, email' })
      .select();
      
    if (error) throw error;
    
    // Set payment types for clients
    if (data) {
      for (let i = 0; i < data.length; i++) {
        const client = data[i];
        const paymentType = i % 2 === 0 ? 'deferred' : 'immediate';
        const { error: paymentError } = await supabase
          .from('client_payment_types')
          .upsert({
            client_id: client.id,
            payment_type: paymentType
          }, { onConflict: 'client_id' });
          
        if (paymentError) console.error('Error setting client payment type:', paymentError);
      }
    }
    
    console.log('Sample clients created successfully');
    return data;
  } catch (error) {
    console.error('Error generating clients:', error);
    toast({
      variant: "destructive",
      title: "Error",
      description: "Failed to generate clients",
    });
    return [];
  }
};

// Generate sample vehicles
export const generateVehicles = async (clients: any[]) => {
  try {
    const { data: existingVehicles } = await supabase
      .from('vehicles')
      .select('*');
      
    if (existingVehicles && existingVehicles.length >= 30) {
      console.log('Vehicles already exist');
      return existingVehicles;
    }
    
    const brands = ['Toyota', 'Honda', 'Ford', 'Peugeot', 'Renault', 'Mercedes', 'BMW', 'Hyundai'];
    const models = {
      'Toyota': ['Corolla', 'Camry', 'RAV4', 'Hilux', 'Land Cruiser'],
      'Honda': ['Civic', 'Accord', 'CR-V', 'HR-V', 'Pilot'],
      'Ford': ['Focus', 'Fiesta', 'Ranger', 'Escape', 'Explorer'],
      'Peugeot': ['208', '308', '3008', '508', '5008'],
      'Renault': ['Clio', 'Megane', 'Duster', 'Kadjar', 'Captur'],
      'Mercedes': ['A-Class', 'C-Class', 'E-Class', 'GLC', 'GLE'],
      'BMW': ['3 Series', '5 Series', 'X3', 'X5', 'X7'],
      'Hyundai': ['i10', 'i20', 'Tucson', 'Santa Fe', 'Kona']
    };
    const fuelTypes = ['Essence', 'Diesel', 'Hybride', 'Électrique'];
    const transmissions = ['Manuelle', 'Automatique'];
    
    const vehicles = [];
    
    for (let i = 1; i <= 30; i++) {
      const clientIndex = (i - 1) % clients.length;
      const brand = randomElement(brands);
      const model = randomElement(models[brand as keyof typeof models]);
      const registrationDate = randomDate(new Date(2015, 0, 1), new Date());
      
      vehicles.push({
        brand,
        model,
        license_plate: `${randomElement(['A', 'B', 'C', 'D'])}${randomNumber(1000, 9999)}${randomElement(['CI', 'AB', 'YM', 'SP'])}`,
        chassis_number: `${randomElement(['WBA', 'WDD', 'JTM', 'VF1'])}${randomNumber(10000000, 99999999)}`,
        client_id: clients[clientIndex].id,
        fuel_type: randomElement(fuelTypes),
        transmission: randomElement(transmissions),
        odometer: randomNumber(1000, 150000),
        version: `${randomNumber(1, 3)}.${randomNumber(0, 9)}`,
        registration_date: registrationDate.toISOString().split('T')[0],
        purchase_price: randomNumber(2000000, 30000000)
      });
    }
    
    const { data, error } = await supabase
      .from('vehicles')
      .upsert(vehicles, { onConflict: 'license_plate' })
      .select();
      
    if (error) throw error;
    console.log('Sample vehicles created successfully');
    return data;
  } catch (error) {
    console.error('Error generating vehicles:', error);
    toast({
      variant: "destructive",
      title: "Error",
      description: "Failed to generate vehicles",
    });
    return [];
  }
};

// Generate sample inspections
export const generateInspections = async (vehicles: any[], users: any[]) => {
  try {
    const { data: existingInspections } = await supabase
      .from('inspections')
      .select('*');
      
    if (existingInspections && existingInspections.length >= 15) {
      console.log('Inspections already exist');
      return existingInspections;
    }
    
    const inspectors = users.filter(user => user.role === 'inspector');
    const supervisors = users.filter(user => user.role === 'supervisor');
    const statuses = ['draft', 'submitted', 'awaiting_validation', 'validated', 'rejected', 'completed'];
    
    const inspections = [];
    
    for (let i = 1; i <= 15; i++) {
      const vehicleIndex = (i - 1) % vehicles.length;
      const inspectorIndex = (i - 1) % inspectors.length;
      const supervisorIndex = (i - 1) % supervisors.length;
      
      // Get franchise_id based on the vehicle's client
      const { data: client } = await supabase
        .from('clients')
        .select('franchise_id')
        .eq('id', vehicles[vehicleIndex].client_id)
        .single();
      
      const status = randomElement(statuses);
      const createdAt = randomDate(new Date(2023, 0, 1), new Date());
      const completedAt = status !== 'draft' ? randomDate(createdAt, new Date()) : null;
      
      inspections.push({
        vehicle_id: vehicles[vehicleIndex].id,
        inspector_id: inspectors[inspectorIndex].id,
        supervisor_id: status === 'awaiting_validation' || status === 'validated' || status === 'rejected' ? supervisors[supervisorIndex].id : null,
        franchise_id: client?.franchise_id,
        status,
        created_at: createdAt.toISOString(),
        completed_at: completedAt?.toISOString(),
        report_url: status === 'validated' || status === 'completed' ? 'https://example.com/report.pdf' : null
      });
    }
    
    const { data, error } = await supabase
      .from('inspections')
      .insert(inspections)
      .select();
      
    if (error) throw error;
    console.log('Sample inspections created successfully');
    
    // Create inspection details for each inspection
    for (const inspection of data || []) {
      await generateInspectionDetails(inspection.id);
    }
    
    // Create validations for awaiting_validation, validated, rejected inspections
    for (const inspection of data || []) {
      if (['awaiting_validation', 'validated', 'rejected'].includes(inspection.status)) {
        await generateValidation(inspection.id, inspection.supervisor_id, inspection.status === 'validated' ? 'approved' : inspection.status === 'rejected' ? 'rejected' : 'pending');
      }
    }
    
    return data;
  } catch (error) {
    console.error('Error generating inspections:', error);
    toast({
      variant: "destructive",
      title: "Error",
      description: "Failed to generate inspections",
    });
    return [];
  }
};

// Generate inspection details
const generateInspectionDetails = async (inspectionId: string) => {
  try {
    const sections = [
      {
        section: 'Extérieur',
        items: ['Carrosserie', 'Pare-brise', 'Vitres', 'Rétroviseurs', 'Feux avant', 'Feux arrière', 'Pneus']
      },
      {
        section: 'Intérieur',
        items: ['Tableau de bord', 'Sièges', 'Ceintures de sécurité', 'Climatisation', 'Système audio', 'Éclairage intérieur']
      },
      {
        section: 'Mécanique',
        items: ['Moteur', 'Transmission', 'Freins', 'Direction', 'Suspension', 'Batterie', 'Liquides']
      },
      {
        section: 'Documents',
        items: ['Carte grise', 'Assurance', 'Visite technique', 'Manuel utilisateur']
      },
      {
        section: 'Sécurité',
        items: ['Airbags', 'ABS', 'ESP', 'Triangle de signalisation', 'Extincteur', 'Trousse de premiers secours']
      }
    ];
    
    const details = [];
    
    for (const section of sections) {
      for (const item of section.items) {
        const status = randomElement(['ok', 'nok']);
        const comment = status === 'nok' ? `Problème détecté: ${item} défectueux` : null;
        
        details.push({
          inspection_id: inspectionId,
          section: section.section,
          item,
          status,
          comment,
          photo_url: status === 'nok' ? 'https://example.com/photo.jpg' : null
        });
      }
    }
    
    const { error } = await supabase
      .from('inspection_details')
      .insert(details);
      
    if (error) throw error;
    console.log(`Inspection details created for inspection ${inspectionId}`);
  } catch (error) {
    console.error('Error generating inspection details:', error);
  }
};

// Generate validation for an inspection
const generateValidation = async (inspectionId: string, supervisorId: string, status: 'pending' | 'approved' | 'rejected') => {
  try {
    const { data, error } = await supabase
      .from('supervisor_validations')
      .insert({
        inspection_id: inspectionId,
        supervisor_id: supervisorId,
        status,
        completed_at: status !== 'pending' ? new Date().toISOString() : null
      })
      .select()
      .single();
      
    if (error) throw error;
    console.log(`Validation created for inspection ${inspectionId} with status ${status}`);
    
    // Get inspection details
    const { data: details, error: detailsError } = await supabase
      .from('inspection_details')
      .select('*')
      .eq('inspection_id', inspectionId);
      
    if (detailsError) throw detailsError;
    
    // Create validation items
    const validationItems = details?.map(detail => ({
      validation_id: data.id,
      inspection_detail_id: detail.id,
      status: status === 'rejected' && Math.random() < 0.2 ? 'rejected' : status === 'approved' ? 'approved' : 'pending',
      comment: status === 'rejected' && Math.random() < 0.2 ? 'Vérification insuffisante' : null
    })) || [];
    
    if (validationItems.length > 0) {
      const { error: itemsError } = await supabase
        .from('validation_items')
        .insert(validationItems);
        
      if (itemsError) throw itemsError;
      console.log(`Validation items created for validation ${data.id}`);
    }
  } catch (error) {
    console.error('Error generating validation:', error);
  }
};

// Generate sample invoices
export const generateInvoices = async (inspections: any[]) => {
  try {
    const { data: existingInvoices } = await supabase
      .from('invoices')
      .select('*');
      
    if (existingInvoices && existingInvoices.length >= 10) {
      console.log('Invoices already exist');
      return;
    }
    
    // Get billing settings
    const { data: billingSettings } = await supabase
      .from('billing_settings')
      .select('*')
      .single();
      
    if (!billingSettings) {
      console.error('Billing settings not found');
      return;
    }
    
    const completedInspections = inspections.filter(i => i.status === 'completed' || i.status === 'validated');
    
    for (const inspection of completedInspections) {
      // Get client and vehicle
      const { data: vehicle } = await supabase
        .from('vehicles')
        .select('client_id, license_plate')
        .eq('id', inspection.vehicle_id)
        .single();
        
      if (!vehicle) continue;
      
      // Get client tax status
      const { data: client } = await supabase
        .from('clients')
        .select('tax_exempt')
        .eq('id', vehicle.client_id)
        .single();
        
      if (!client) continue;
      
      // Create invoice
      const basePrice = billingSettings.inspection_base_price;
      const taxRate = client.tax_exempt ? 0 : billingSettings.tax_rate;
      const taxAmount = (basePrice * taxRate) / 100;
      const totalAmount = basePrice + taxAmount;
      const invoiceDate = new Date();
      
      const { error } = await supabase
        .from('invoices')
        .insert({
          client_id: vehicle.client_id,
          franchise_id: inspection.franchise_id,
          inspection_id: inspection.id,
          invoice_number: `INV-${randomNumber(10000, 99999)}`,
          amount: basePrice,
          tax_amount: taxAmount,
          total_amount: totalAmount,
          tax_rate: taxRate,
          status: 'pending',
          invoice_date: invoiceDate.toISOString().split('T')[0],
          due_date: new Date(invoiceDate.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        });
        
      if (error) {
        console.error('Error creating invoice:', error);
      } else {
        console.log(`Invoice created for inspection ${inspection.id}`);
      }
    }
    
    // Create franchise invoices
    const { data: franchises } = await supabase
      .from('franchises')
      .select('*');
      
    if (!franchises) return;
    
    for (const franchise of franchises) {
      const { data: franchiseInspections } = await supabase
        .from('inspections')
        .select('id')
        .eq('franchise_id', franchise.id)
        .in('status', ['completed', 'validated']);
        
      if (!franchiseInspections || franchiseInspections.length === 0) continue;
      
      const inspectionCount = franchiseInspections.length;
      const feeType = billingSettings.franchise_fee_type;
      const feeValue = billingSettings.franchise_fee_value;
      
      // Calculate amount based on fee type
      let amount;
      if (feeType === 'fixed') {
        amount = feeValue * inspectionCount;
      } else {
        // Percentage of base price
        amount = (billingSettings.inspection_base_price * feeValue / 100) * inspectionCount;
      }
      
      const taxAmount = (amount * billingSettings.tax_rate) / 100;
      const totalAmount = amount + taxAmount;
      const invoiceDate = new Date();
      
      const { error } = await supabase
        .from('franchise_invoices')
        .insert({
          franchise_id: franchise.id,
          invoice_number: `FINV-${randomNumber(10000, 99999)}`,
          amount,
          fee_type: feeType,
          fee_value: feeValue,
          tax_amount: taxAmount,
          total_amount: totalAmount,
          tax_rate: billingSettings.tax_rate,
          status: 'pending',
          invoice_date: invoiceDate.toISOString().split('T')[0],
          due_date: new Date(invoiceDate.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          period_start: new Date(invoiceDate.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          period_end: invoiceDate.toISOString().split('T')[0]
        });
        
      if (error) {
        console.error('Error creating franchise invoice:', error);
      } else {
        console.log(`Franchise invoice created for ${franchise.name}`);
      }
    }
  } catch (error) {
    console.error('Error generating invoices:', error);
    toast({
      variant: "destructive",
      title: "Error",
      description: "Failed to generate invoices",
    });
  }
};

// Generate sample credit notes
export const generateCreditNotes = async () => {
  try {
    // Execute SQL function to generate sample credit notes
    // @ts-ignore - Function exists in database but not in TypeScript types
    const { error } = await supabase.rpc('generate_sample_credit_notes');
    if (error) throw error;
    console.log('Generated sample credit notes successfully');
    return true;
  } catch (error) {
    console.error('Error generating sample credit notes:', error);
    throw error;
  }
};

// Function to update franchise block status
export const updateFranchiseBlockStatus = async () => {
  try {
    // Execute SQL function to update franchise block status
    // @ts-ignore - Function exists in database but not in TypeScript types
    const { error } = await supabase.rpc('update_franchise_blocked_status');
    if (error) throw error;
    console.log('Updated franchise block status successfully');
    return true;
  } catch (error) {
    console.error('Error updating franchise block status:', error);
    throw error;
  }
};

// Function to update invoice status
export const updateInvoiceStatus = async () => {
  try {
    // Execute SQL function to update invoice status
    // @ts-ignore - Function exists in database but not in TypeScript types
    const { error } = await supabase.rpc('update_invoice_status_for_testing');
    if (error) throw error;
    console.log('Updated invoice status successfully');
    return true;
  } catch (error) {
    console.error('Error updating invoice status:', error);
    throw error;
  }
};

// Generate all sample data
export const generateAllSampleData = async () => {
  try {
    await generateSystemSettings();
    await generateBillingSettings();
    const franchises = await generateFranchises();
    const users = await generateUsers(franchises);
    const clients = await generateClients(franchises);
    const vehicles = await generateVehicles(clients);
    const inspections = await generateInspections(vehicles, users);
    await generateInvoices(inspections);
    
    // After creating all the sample data, call the functions to create diverse scenarios
    try {
      // Give a small delay to ensure all data is committed
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update invoice status (mark some as paid, overdue)
      await updateInvoiceStatus();
      
      // Update franchise status (block some franchises)
      await updateFranchiseBlockStatus();
      
      // Generate credit notes and credit note requests
      await generateCreditNotes();
      
      console.log('Enhanced sample data scenarios created successfully');
    } catch (enhancedError) {
      console.error('Error creating enhanced data scenarios:', enhancedError);
      // Don't throw here as the basic data was already created
    }
    
    return {
      franchises,
      users,
      clients,
      vehicles,
      inspections
    };
  } catch (error) {
    console.error('Error generating sample data:', error);
    throw error;
  }
};
