
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./components/layouts/DashboardLayout";

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import NewInspection from "./pages/NewInspection";
import Franchises from "./pages/Franchises";
import Users from "./pages/Users";
import Inspections from "./pages/Inspections";
import Rapports from "./pages/Rapports";
import Facturation from "./pages/Facturation";
import Parametres from "./pages/Parametres";
import ValidationSuperviseur from "./pages/ValidationSuperviseur";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            
            {/* Protected routes with DashboardLayout */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Dashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/nouvelle-inspection" 
              element={
                <ProtectedRoute allowedRoles={['inspector']}>
                  <DashboardLayout>
                    <NewInspection />
                  </DashboardLayout>
                </ProtectedRoute>
              } 
            />
            
            {/* Page de gestion des franchises */}
            <Route 
              path="/franchises" 
              element={
                <ProtectedRoute allowedRoles={['admin', 'commercial']}>
                  <DashboardLayout>
                    <Franchises />
                  </DashboardLayout>
                </ProtectedRoute>
              } 
            />
            
            {/* Gestion des utilisateurs */}
            <Route 
              path="/users" 
              element={
                <ProtectedRoute allowedRoles={['admin', 'franchise_manager']}>
                  <DashboardLayout>
                    <Users />
                  </DashboardLayout>
                </ProtectedRoute>
              } 
            />
            
            {/* Gestion des inspections */}
            <Route 
              path="/inspections" 
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Inspections />
                  </DashboardLayout>
                </ProtectedRoute>
              } 
            />
            
            {/* Validation des inspections */}
            <Route 
              path="/validation-superviseur" 
              element={
                <ProtectedRoute allowedRoles={['admin', 'supervisor']}>
                  <DashboardLayout>
                    <ValidationSuperviseur />
                  </DashboardLayout>
                </ProtectedRoute>
              } 
            />
            
            {/* Gestion des clients */}
            <Route 
              path="/clients" 
              element={
                <ProtectedRoute allowedRoles={['admin', 'commercial', 'franchise_manager']}>
                  <DashboardLayout>
                    <div className="p-6">
                      <h1 className="text-2xl font-bold">Gestion des Clients</h1>
                      <p className="text-gray-600 mt-4">Cette fonctionnalité sera implémentée prochainement.</p>
                    </div>
                  </DashboardLayout>
                </ProtectedRoute>
              } 
            />
            
            {/* Gestion des rapports */}
            <Route 
              path="/rapports" 
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Rapports />
                  </DashboardLayout>
                </ProtectedRoute>
              } 
            />
            
            {/* Gestion de la facturation */}
            <Route 
              path="/facturation" 
              element={
                <ProtectedRoute allowedRoles={['admin', 'commercial', 'franchise_manager']}>
                  <DashboardLayout>
                    <Facturation />
                  </DashboardLayout>
                </ProtectedRoute>
              } 
            />
            
            {/* Paramètres */}
            <Route 
              path="/parametres" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DashboardLayout>
                    <Parametres />
                  </DashboardLayout>
                </ProtectedRoute>
              } 
            />
            
            {/* 404 route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
