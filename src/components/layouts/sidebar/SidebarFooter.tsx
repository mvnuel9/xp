
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface NavLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
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

interface SidebarFooterProps {
  sidebarOpen: boolean;
}

const SidebarFooter: React.FC<SidebarFooterProps> = ({ sidebarOpen }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="mt-auto px-4 py-4">
      <div className="border-t border-sidebar-border pt-4">
        <NavLink
          to="/parametres"
          icon={<Settings size={20} />}
          label={sidebarOpen ? "Paramètres" : ""}
          isActive={false}
        />
        <button
          className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors mt-2"
          onClick={handleLogout}
        >
          <div className="w-5 h-5">
            <LogOut size={20} />
          </div>
          {sidebarOpen && <span>Déconnexion</span>}
        </button>
      </div>
    </div>
  );
};

export default SidebarFooter;
