
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Car, Users, Building, FileText, ArrowUp, ArrowDown } from 'lucide-react';

const StatCard = ({ 
  title, 
  value, 
  icon, 
  change, 
  changeType 
}: { 
  title: string; 
  value: string; 
  icon: React.ReactNode; 
  change: string; 
  changeType: 'positive' | 'negative' | 'neutral' 
}) => {
  return (
    <div className="eagle-stat-card border-l-eagle-primary">
      <div className="flex-1">
        <p className="text-sm text-gray-500">{title}</p>
        <h3 className="text-2xl font-bold">{value}</h3>
        <div className={`flex items-center mt-1 text-xs ${
          changeType === 'positive' 
            ? 'text-green-600' 
            : changeType === 'negative' 
              ? 'text-red-600' 
              : 'text-gray-500'
        }`}>
          {changeType !== 'neutral' && (
            <>
              {changeType === 'positive' ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
              <span className="ml-1">{change}</span>
            </>
          )}
        </div>
      </div>
      <div className="bg-eagle-primary/10 p-3 rounded-md text-eagle-primary">
        {icon}
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { user } = useAuth();

  // Recent activity mock data
  const recentActivity = [
    { id: 1, action: "Inspection terminée", vehicle: "Toyota Corolla", user: "Jean Dupont", date: "Aujourd'hui, 14:30" },
    { id: 2, action: "Nouveau client ajouté", vehicle: "-", user: "Marie Koné", date: "Aujourd'hui, 11:15" },
    { id: 3, action: "Rapport validé", vehicle: "Peugeot 208", user: "Pierre Aka", date: "Hier, 16:45" },
    { id: 4, action: "Inspection en cours", vehicle: "Renault Clio", user: "Fatou Diop", date: "Hier, 10:20" }
  ];

  // Pending inspections mock data
  const pendingInspections = [
    { id: 1, vehicle: "Mercedes C200", client: "Entreprise ABC", date: "15 Mai 2023", status: "En attente" },
    { id: 2, vehicle: "BMW X5", client: "M. Coulibaly", date: "14 Mai 2023", status: "En cours" },
    { id: 3, vehicle: "Audi A4", client: "Mme Traoré", date: "14 Mai 2023", status: "En attente" }
  ];

  // Franchise data mock for Admin & Commercial roles
  const franchiseData = [
    { id: 1, name: "Franchise Abidjan", inspections: 45, revenue: "2.2M XOF", growth: "+12%" },
    { id: 2, name: "Franchise Yamoussoukro", inspections: 28, revenue: "1.4M XOF", growth: "+5%" },
    { id: 3, name: "Franchise San Pedro", inspections: 19, revenue: "950K XOF", growth: "-3%" }
  ];

  // Dashboard content based on user role
  const renderRoleDashboard = () => {
    switch (user?.role) {
      case 'admin':
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard 
                title="Total Inspections" 
                value="1,245" 
                icon={<Car size={24} />} 
                change="+12% ce mois" 
                changeType="positive" 
              />
              <StatCard 
                title="Utilisateurs" 
                value="64" 
                icon={<Users size={24} />} 
                change="+3 nouveaux" 
                changeType="positive" 
              />
              <StatCard 
                title="Franchises" 
                value="8" 
                icon={<Building size={24} />} 
                change="Stable" 
                changeType="neutral" 
              />
              <StatCard 
                title="Rapports" 
                value="1,180" 
                icon={<FileText size={24} />} 
                change="+10% ce mois" 
                changeType="positive" 
              />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <Card className="col-span-1 lg:col-span-2 p-6">
                <h2 className="text-lg font-bold mb-4">Performance des franchises</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3">Franchise</th>
                        <th className="text-right py-3">Inspections</th>
                        <th className="text-right py-3">Revenu</th>
                        <th className="text-right py-3">Croissance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {franchiseData.map(franchise => (
                        <tr key={franchise.id} className="border-b hover:bg-gray-50">
                          <td className="py-3">{franchise.name}</td>
                          <td className="text-right py-3">{franchise.inspections}</td>
                          <td className="text-right py-3">{franchise.revenue}</td>
                          <td className={`text-right py-3 ${
                            franchise.growth.startsWith('+') 
                              ? 'text-green-600' 
                              : franchise.growth.startsWith('-') 
                                ? 'text-red-600' 
                                : ''
                          }`}>{franchise.growth}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
              
              <Card className="p-6">
                <h2 className="text-lg font-bold mb-4">Activité récente</h2>
                <div className="space-y-3">
                  {recentActivity.map(activity => (
                    <div key={activity.id} className="border-b pb-3">
                      <div className="font-medium">{activity.action}</div>
                      {activity.vehicle !== "-" && (
                        <div className="text-sm text-gray-600">Véhicule: {activity.vehicle}</div>
                      )}
                      <div className="text-sm text-gray-600">Par: {activity.user}</div>
                      <div className="text-xs text-gray-500 mt-1">{activity.date}</div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </>
        );
        
      case 'commercial':
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard 
                title="Inspections Franchises" 
                value="348" 
                icon={<Car size={24} />} 
                change="+8% ce mois" 
                changeType="positive" 
              />
              <StatCard 
                title="Franchises Gérées" 
                value={user.franchises.length.toString()} 
                icon={<Building size={24} />} 
                change="Stable" 
                changeType="neutral" 
              />
              <StatCard 
                title="Rapports Signés" 
                value="286" 
                icon={<FileText size={24} />} 
                change="+5% ce mois" 
                changeType="positive" 
              />
              <StatCard 
                title="Clients" 
                value="125" 
                icon={<Users size={24} />} 
                change="+3 nouveaux" 
                changeType="positive" 
              />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <Card className="col-span-1 lg:col-span-2 p-6">
                <h2 className="text-lg font-bold mb-4">Performance des franchises</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3">Franchise</th>
                        <th className="text-right py-3">Inspections</th>
                        <th className="text-right py-3">Revenu</th>
                        <th className="text-right py-3">Croissance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {franchiseData.map(franchise => (
                        <tr key={franchise.id} className="border-b hover:bg-gray-50">
                          <td className="py-3">{franchise.name}</td>
                          <td className="text-right py-3">{franchise.inspections}</td>
                          <td className="text-right py-3">{franchise.revenue}</td>
                          <td className={`text-right py-3 ${
                            franchise.growth.startsWith('+') 
                              ? 'text-green-600' 
                              : franchise.growth.startsWith('-') 
                                ? 'text-red-600' 
                                : ''
                          }`}>{franchise.growth}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
              
              <Card className="p-6">
                <h2 className="text-lg font-bold mb-4">Activité récente</h2>
                <div className="space-y-3">
                  {recentActivity.map(activity => (
                    <div key={activity.id} className="border-b pb-3">
                      <div className="font-medium">{activity.action}</div>
                      {activity.vehicle !== "-" && (
                        <div className="text-sm text-gray-600">Véhicule: {activity.vehicle}</div>
                      )}
                      <div className="text-sm text-gray-600">Par: {activity.user}</div>
                      <div className="text-xs text-gray-500 mt-1">{activity.date}</div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </>
        );
        
      case 'franchise_manager':
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard 
                title="Total Inspections" 
                value="124" 
                icon={<Car size={24} />} 
                change="+8% ce mois" 
                changeType="positive" 
              />
              <StatCard 
                title="Membres Équipe" 
                value="12" 
                icon={<Users size={24} />} 
                change="+1 nouveau" 
                changeType="positive" 
              />
              <StatCard 
                title="Inspections en cours" 
                value="5" 
                icon={<Car size={24} />} 
                change="" 
                changeType="neutral" 
              />
              <StatCard 
                title="Clients" 
                value="42" 
                icon={<Users size={24} />} 
                change="+2 nouveaux" 
                changeType="positive" 
              />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="col-span-1 lg:col-span-2 p-6">
                <h2 className="text-lg font-bold mb-4">Inspections en attente</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3">Véhicule</th>
                        <th className="text-left py-3">Client</th>
                        <th className="text-left py-3">Date</th>
                        <th className="text-left py-3">Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingInspections.map(inspection => (
                        <tr key={inspection.id} className="border-b hover:bg-gray-50">
                          <td className="py-3">{inspection.vehicle}</td>
                          <td className="py-3">{inspection.client}</td>
                          <td className="py-3">{inspection.date}</td>
                          <td className="py-3">
                            <span className={`eagle-status-tag ${
                              inspection.status === "En cours" 
                              ? "bg-blue-100 text-blue-800" 
                              : "bg-yellow-100 text-yellow-800"
                            }`}>
                              {inspection.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
              
              <Card className="p-6">
                <h2 className="text-lg font-bold mb-4">Activité récente</h2>
                <div className="space-y-3">
                  {recentActivity.map(activity => (
                    <div key={activity.id} className="border-b pb-3">
                      <div className="font-medium">{activity.action}</div>
                      {activity.vehicle !== "-" && (
                        <div className="text-sm text-gray-600">Véhicule: {activity.vehicle}</div>
                      )}
                      <div className="text-sm text-gray-600">Par: {activity.user}</div>
                      <div className="text-xs text-gray-500 mt-1">{activity.date}</div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </>
        );
        
      case 'supervisor':
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <StatCard 
                title="Inspections à valider" 
                value="8" 
                icon={<Car size={24} />} 
                change="+3 aujourd'hui" 
                changeType="positive" 
              />
              <StatCard 
                title="Rapports validés" 
                value="124" 
                icon={<FileText size={24} />} 
                change="+5 cette semaine" 
                changeType="positive" 
              />
              <StatCard 
                title="Inspections en cours" 
                value="3" 
                icon={<Car size={24} />} 
                change="" 
                changeType="neutral" 
              />
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              <Card className="p-6">
                <h2 className="text-lg font-bold mb-4">Inspections en attente de validation</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3">Véhicule</th>
                        <th className="text-left py-3">Client</th>
                        <th className="text-left py-3">Date</th>
                        <th className="text-left py-3">Inspecteur</th>
                        <th className="text-left py-3">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingInspections.map(inspection => (
                        <tr key={inspection.id} className="border-b hover:bg-gray-50">
                          <td className="py-3">{inspection.vehicle}</td>
                          <td className="py-3">{inspection.client}</td>
                          <td className="py-3">{inspection.date}</td>
                          <td className="py-3">Jean Dupont</td>
                          <td className="py-3">
                            <button className="px-3 py-1 bg-eagle-primary text-white text-xs rounded-md">
                              Valider
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
              
              <Card className="p-6">
                <h2 className="text-lg font-bold mb-4">Activité récente</h2>
                <div className="space-y-3">
                  {recentActivity.map(activity => (
                    <div key={activity.id} className="border-b pb-3">
                      <div className="font-medium">{activity.action}</div>
                      {activity.vehicle !== "-" && (
                        <div className="text-sm text-gray-600">Véhicule: {activity.vehicle}</div>
                      )}
                      <div className="text-sm text-gray-600">Par: {activity.user}</div>
                      <div className="text-xs text-gray-500 mt-1">{activity.date}</div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </>
        );
        
      case 'inspector':
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <StatCard 
                title="Mes Inspections" 
                value="32" 
                icon={<Car size={24} />} 
                change="+2 cette semaine" 
                changeType="positive" 
              />
              <StatCard 
                title="En cours" 
                value="1" 
                icon={<Car size={24} />} 
                change="" 
                changeType="neutral" 
              />
              <StatCard 
                title="Planifiées" 
                value="3" 
                icon={<FileText size={24} />} 
                change="" 
                changeType="neutral" 
              />
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              <Card className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-bold">Mes inspections récentes</h2>
                  <a 
                    href="/nouvelle-inspection" 
                    className="bg-eagle-primary hover:bg-eagle-primary/90 text-white px-4 py-2 rounded-md text-sm"
                  >
                    Nouvelle inspection
                  </a>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3">Véhicule</th>
                        <th className="text-left py-3">Client</th>
                        <th className="text-left py-3">Date</th>
                        <th className="text-left py-3">Statut</th>
                        <th className="text-left py-3">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingInspections.map(inspection => (
                        <tr key={inspection.id} className="border-b hover:bg-gray-50">
                          <td className="py-3">{inspection.vehicle}</td>
                          <td className="py-3">{inspection.client}</td>
                          <td className="py-3">{inspection.date}</td>
                          <td className="py-3">
                            <span className={`eagle-status-tag ${
                              inspection.status === "En cours" 
                              ? "bg-blue-100 text-blue-800" 
                              : "bg-yellow-100 text-yellow-800"
                            }`}>
                              {inspection.status}
                            </span>
                          </td>
                          <td className="py-3">
                            <button className="px-3 py-1 bg-eagle-secondary text-eagle-dark text-xs rounded-md">
                              {inspection.status === "En cours" ? "Continuer" : "Commencer"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          </>
        );
        
      default:
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Bienvenue sur Eagle Xpert</h2>
            <p>Rôle utilisateur non reconnu.</p>
          </div>
        );
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Bienvenue, {user?.name}</h1>
        <p className="text-gray-600">
          {user?.franchises && user.franchises.length > 0 
            ? `Franchise: ${user.franchises.map(f => f.name).join(', ')}` 
            : 'Administration centrale Eagle Xpert'}
        </p>
      </div>
      
      {renderRoleDashboard()}
    </div>
  );
};

export default Dashboard;
