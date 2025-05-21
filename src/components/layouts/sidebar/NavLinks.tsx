
import React from 'react';
import { Link } from 'react-router-dom';
import { Location } from 'react-router-dom';
import { 
  BarChart, 
  Building, 
  Users, 
  FileCheck, 
  User, 
  FileText, 
  ReceiptText, 
  Car,
  Settings,
  CheckSquare
} from 'lucide-react';

interface NavLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick?: () => void;
}

const NavLink: React.FC<NavLinkProps> = ({ to, icon, label, isActive, onClick }) => {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
        isActive 
          ? 'bg-sidebar-accent text-sidebar-accent-foreground' 
          : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
      }`}
      onClick={onClick}
    >
      <div className="w-5 h-5">{icon}</div>
      <span>{label}</span>
    </Link>
  );
};

interface NavLinksProps {
  userRole?: string;
  sidebarOpen: boolean;
  location: Location;
  setSidebarOpen: (open: boolean) => void;
}

const NavLinks: React.FC<NavLinksProps> = ({ 
  userRole, 
  sidebarOpen, 
  location, 
  setSidebarOpen 
}) => {
  // Admin routes
  const adminRoutes = [
    { path: '/dashboard', icon: <BarChart size={20} />, label: 'Dashboard' },
    { path: '/franchises', icon: <Building size={20} />, label: 'Franchises' },
    { path: '/users', icon: <Users size={20} />, label: 'Utilisateurs' },
    { path: '/inspections', icon: <FileCheck size={20} />, label: 'Inspections' },
    { path: '/clients', icon: <User size={20} />, label: 'Clients' },
    { path: '/rapports', icon: <FileText size={20} />, label: 'Rapports' },
    { path: '/facturation', icon: <ReceiptText size={20} />, label: 'Facturation' },
    { path: '/parametres', icon: <Settings size={20} />, label: 'Paramètres' },
  ];

  // Commercial routes
  const commercialRoutes = [
    { path: '/dashboard', icon: <BarChart size={20} />, label: 'Dashboard' },
    { path: '/franchises', icon: <Building size={20} />, label: 'Franchises' },
    { path: '/inspections', icon: <FileCheck size={20} />, label: 'Inspections' },
    { path: '/clients', icon: <User size={20} />, label: 'Clients' },
    { path: '/rapports', icon: <FileText size={20} />, label: 'Rapports' },
    { path: '/facturation', icon: <ReceiptText size={20} />, label: 'Facturation' },
  ];

  // Franchise manager routes
  const managerRoutes = [
    { path: '/dashboard', icon: <BarChart size={20} />, label: 'Dashboard' },
    { path: '/users', icon: <Users size={20} />, label: 'Équipe' },
    { path: '/inspections', icon: <FileCheck size={20} />, label: 'Inspections' },
    { path: '/clients', icon: <User size={20} />, label: 'Clients' },
    { path: '/rapports', icon: <FileText size={20} />, label: 'Rapports' },
    { path: '/facturation', icon: <ReceiptText size={20} />, label: 'Facturation' },
  ];

  // Supervisor routes
  const supervisorRoutes = [
    { path: '/dashboard', icon: <BarChart size={20} />, label: 'Dashboard' },
    { path: '/inspections', icon: <FileCheck size={20} />, label: 'Inspections' },
    { path: '/validation-superviseur', icon: <CheckSquare size={20} />, label: 'Validation' },
    { path: '/rapports', icon: <FileText size={20} />, label: 'Rapports' },
  ];

  // Inspector routes
  const inspectorRoutes = [
    { path: '/dashboard', icon: <BarChart size={20} />, label: 'Dashboard' },
    { path: '/inspections', icon: <FileCheck size={20} />, label: 'Inspections' },
    { path: '/nouvelle-inspection', icon: <Car size={20} />, label: 'Nouvelle Inspection' },
  ];

  // Select routes based on user role
  let routes;
  switch (userRole) {
    case 'admin':
      routes = adminRoutes;
      break;
    case 'commercial':
      routes = commercialRoutes;
      break;
    case 'franchise_manager':
      routes = managerRoutes;
      break;
    case 'supervisor':
      routes = supervisorRoutes;
      break;
    case 'inspector':
      routes = inspectorRoutes;
      break;
    default:
      routes = [];
  }

  const handleLinkClick = () => {
    if (window.innerWidth < 1024) { // lg breakpoint is typically 1024px
      setSidebarOpen(false);
    }
  };

  return (
    <>
      {routes.map((route) => (
        <NavLink
          key={route.path}
          to={route.path}
          icon={route.icon}
          label={sidebarOpen ? route.label : ""}
          isActive={location.pathname === route.path}
          onClick={handleLinkClick}
        />
      ))}
    </>
  );
};

export default NavLinks;
