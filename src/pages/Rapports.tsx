
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Download, Search, Loader2, Calendar } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface ReportSummary {
  totalInspections: number;
  completedInspections: number;
  pendingInspections: number;
  validatedInspections: number;
  rejectedInspections: number;
  averageCompletionTime: string;
}

interface FranchisePerformance {
  id: string;
  name: string;
  inspections: number;
  completionRate: number;
}

interface InspectionStatusData {
  name: string;
  value: number;
  color: string;
}

const Rapports = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [period, setPeriod] = useState("month");
  const [reportSummary, setReportSummary] = useState<ReportSummary>({
    totalInspections: 0,
    completedInspections: 0,
    pendingInspections: 0,
    validatedInspections: 0,
    rejectedInspections: 0,
    averageCompletionTime: "0 jours",
  });
  const [franchisePerformance, setFranchisePerformance] = useState<FranchisePerformance[]>([]);
  const [franchises, setFranchises] = useState<{ id: string; name: string }[]>([]);
  const [selectedFranchise, setSelectedFranchise] = useState<string>("all");

  // Status data for pie chart
  const [inspectionStatusData, setInspectionStatusData] = useState<InspectionStatusData[]>([]);

  const fetchFranchises = async () => {
    try {
      const { data, error } = await supabase
        .from('franchises')
        .select('id, name');

      if (error) throw error;
      
      setFranchises(data);
    } catch (error) {
      console.error('Error fetching franchises:', error);
    }
  };

  const fetchReportData = async () => {
    setLoading(true);
    try {
      // Get date range based on period
      let startDate = new Date();
      if (period === "week") {
        startDate.setDate(startDate.getDate() - 7);
      } else if (period === "month") {
        startDate.setMonth(startDate.getMonth() - 1);
      } else if (period === "year") {
        startDate.setFullYear(startDate.getFullYear() - 1);
      }

      // Build query
      let query = supabase
        .from('inspections')
        .select(`
          *,
          franchise:franchise_id(name)
        `)
        .gte('created_at', startDate.toISOString());

      // Add franchise filter if specified
      if (selectedFranchise !== "all") {
        query = query.eq('franchise_id', selectedFranchise);
      }

      const { data: inspections, error } = await query;

      if (error) throw error;

      if (!inspections) {
        setReportSummary({
          totalInspections: 0,
          completedInspections: 0,
          pendingInspections: 0,
          validatedInspections: 0,
          rejectedInspections: 0,
          averageCompletionTime: "0 jours",
        });
        setInspectionStatusData([]);
        return;
      }

      // Calculate summary statistics
      const total = inspections.length;
      const completed = inspections.filter(i => i.status === 'completed').length;
      const pending = inspections.filter(i => i.status === 'draft' || i.status === 'submitted').length;
      const validated = inspections.filter(i => i.status === 'validated').length;
      const rejected = inspections.filter(i => i.status === 'rejected').length;

      // Calculate average completion time for completed inspections
      let averageTimeMs = 0;
      const completedWithTime = inspections.filter(i => i.status === 'completed' && i.completed_at);
      if (completedWithTime.length > 0) {
        const totalTime = completedWithTime.reduce((sum, inspection) => {
          const created = new Date(inspection.created_at).getTime();
          const completed = new Date(inspection.completed_at).getTime();
          return sum + (completed - created);
        }, 0);
        averageTimeMs = totalTime / completedWithTime.length;
      }
      const averageDays = Math.round(averageTimeMs / (1000 * 60 * 60 * 24));

      setReportSummary({
        totalInspections: total,
        completedInspections: completed,
        pendingInspections: pending,
        validatedInspections: validated,
        rejectedInspections: rejected,
        averageCompletionTime: `${averageDays} jour${averageDays !== 1 ? 's' : ''}`,
      });

      // Create pie chart data
      setInspectionStatusData([
        { name: 'Complété', value: completed, color: '#3b82f6' },
        { name: 'Validé', value: validated, color: '#10b981' },
        { name: 'En attente', value: pending, color: '#f59e0b' },
        { name: 'Rejeté', value: rejected, color: '#ef4444' },
      ].filter(item => item.value > 0));

      // Get franchise performance data
      const franchiseData = new Map();

      inspections.forEach(inspection => {
        if (!inspection.franchise_id) return;
        
        const franchiseId = inspection.franchise_id;
        const franchiseName = inspection.franchise?.name || 'Unknown';
        
        if (!franchiseData.has(franchiseId)) {
          franchiseData.set(franchiseId, {
            id: franchiseId,
            name: franchiseName,
            total: 0,
            completed: 0
          });
        }
        
        const data = franchiseData.get(franchiseId);
        data.total += 1;
        
        if (inspection.status === 'completed') {
          data.completed += 1;
        }
      });
      
      const franchisePerformanceData = Array.from(franchiseData.values()).map(f => ({
        id: f.id,
        name: f.name,
        inspections: f.total,
        completionRate: f.total > 0 ? Math.round((f.completed / f.total) * 100) : 0
      }));

      setFranchisePerformance(franchisePerformanceData);

    } catch (error) {
      console.error('Error fetching report data:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données des rapports",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFranchises();
  }, []);

  useEffect(() => {
    fetchReportData();
  }, [period, selectedFranchise]);

  const exportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Métrique,Valeur\n";
    csvContent += `Inspections totales,${reportSummary.totalInspections}\n`;
    csvContent += `Inspections complétées,${reportSummary.completedInspections}\n`;
    csvContent += `Inspections en attente,${reportSummary.pendingInspections}\n`;
    csvContent += `Inspections validées,${reportSummary.validatedInspections}\n`;
    csvContent += `Inspections rejetées,${reportSummary.rejectedInspections}\n`;
    csvContent += `Temps moyen de complétion,${reportSummary.averageCompletionTime}\n\n`;
    
    csvContent += "Franchise,Inspections,Taux de complétion\n";
    franchisePerformance.forEach(f => {
      csvContent += `${f.name},${f.inspections},${f.completionRate}%\n`;
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `rapport_inspections_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Rapports</h1>
        
        <Button className="flex items-center gap-2" onClick={exportCSV}>
          <Download size={18} />
          Exporter les données
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-1/3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-full">
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                <SelectValue placeholder="Période" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Cette semaine</SelectItem>
              <SelectItem value="month">Ce mois</SelectItem>
              <SelectItem value="year">Cette année</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="w-full md:w-1/3">
          <Select value={selectedFranchise} onValueChange={setSelectedFranchise}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Franchise" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les franchises</SelectItem>
              {franchises.map(franchise => (
                <SelectItem key={franchise.id} value={franchise.id}>
                  {franchise.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">Inspections totales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{reportSummary.totalInspections}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">Inspections complétées</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-500">{reportSummary.completedInspections}</div>
                <div className="text-sm text-muted-foreground">
                  {reportSummary.totalInspections > 0 
                    ? Math.round((reportSummary.completedInspections / reportSummary.totalInspections) * 100) 
                    : 0}% du total
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">Temps moyen de complétion</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{reportSummary.averageCompletionTime}</div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="summary" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="summary">Résumé</TabsTrigger>
              <TabsTrigger value="franchise">Performance par franchise</TabsTrigger>
            </TabsList>
            <TabsContent value="summary" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Distribution des statuts d'inspection</CardTitle>
                </CardHeader>
                <CardContent className="pl-0">
                  <div className="h-80 w-full">
                    {inspectionStatusData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={inspectionStatusData}
                            cx="50%"
                            cy="50%"
                            labelLine={true}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                            label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {inspectionStatusData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [`${value} inspections`, 'Quantité']} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        <p className="text-muted-foreground">Aucune donnée disponible</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="franchise" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Performance par franchise</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80 w-full">
                    {franchisePerformance.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          width={500}
                          height={300}
                          data={franchisePerformance}
                          margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                          <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                          <Tooltip />
                          <Legend />
                          <Bar yAxisId="left" dataKey="inspections" name="Inspections" fill="#8884d8" />
                          <Bar yAxisId="right" dataKey="completionRate" name="Taux de complétion (%)" fill="#82ca9d" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        <p className="text-muted-foreground">Aucune donnée disponible</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
};

export default Rapports;
