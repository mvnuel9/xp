
import React from 'react';
import { Link } from 'react-router-dom';
import { Location } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { X } from 'lucide-react';
import NavLinks from './NavLinks';
import SidebarFooter from './SidebarFooter';

interface SidebarProps {
  user: ReturnType<typeof useAuth>['user'];
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  location: Location;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  user, 
  sidebarOpen, 
  setSidebarOpen,
  location 
}) => {
  if (!sidebarOpen) {
    return null;
  }

  return (
    <aside 
      className={`bg-sidebar fixed top-0 h-full transition-all duration-300 z-10 ${
        sidebarOpen ? "w-64" : "w-0 -translate-x-full"
      } lg:relative lg:translate-x-0 ${
        sidebarOpen ? "lg:w-64" : "lg:w-20"
      }`}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-2xl text-white">
              {sidebarOpen ? "EAGLE XPERT" : "EX"}
            </span>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="p-1 rounded-md text-sidebar-foreground hover:bg-sidebar-accent lg:hidden"
          >
            <X size={24} />
          </button>
        </div>
        <div className="px-4 py-4 flex flex-col gap-1">
          <NavLinks 
            userRole={user?.role} 
            sidebarOpen={sidebarOpen} 
            location={location}
            setSidebarOpen={setSidebarOpen}
          />
        </div>
        <SidebarFooter sidebarOpen={sidebarOpen} />
      </div>
    </aside>
  );
};

export default Sidebar;
