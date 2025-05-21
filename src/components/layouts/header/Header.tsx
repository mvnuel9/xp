
import React from 'react';
import { Location } from 'react-router-dom';
import { Menu, Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import PageTitle from './PageTitle';
import SearchInput from './SearchInput';
import UserProfile from './UserProfile';

interface HeaderProps {
  toggleSidebar: () => void;
  location: Location;
  user: ReturnType<typeof useAuth>['user'];
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar, location, user }) => {
  return (
    <header className="bg-white border-b border-gray-200 py-4 px-6 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <button 
          onClick={toggleSidebar}
          className="p-2 rounded-md hover:bg-gray-100"
        >
          <Menu size={20} />
        </button>
        <PageTitle location={location} />
      </div>
      <div className="flex items-center space-x-4">
        <SearchInput />
        <UserProfile user={user} />
      </div>
    </header>
  );
};

export default Header;
