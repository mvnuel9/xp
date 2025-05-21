
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import SidebarComponent from './sidebar/Sidebar';
import HeaderComponent from './header/Header';

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Function to toggle sidebar
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <SidebarComponent 
        user={user}
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen}
        location={location}
      />

      {/* Main content */}
      <div className="flex-1">
        {/* Navbar */}
        <HeaderComponent 
          toggleSidebar={toggleSidebar} 
          location={location}
          user={user}
        />

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-0 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default DashboardLayout;
