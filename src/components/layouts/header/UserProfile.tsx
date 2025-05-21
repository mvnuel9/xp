
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface UserProfileProps {
  user: ReturnType<typeof useAuth>['user'];
}

const UserProfile: React.FC<UserProfileProps> = ({ user }) => {
  return (
    <div className="flex items-center space-x-3">
      <div className="hidden md:block text-right">
        <p className="text-sm font-medium">{user?.name}</p>
        <p className="text-xs text-gray-500 capitalize">{user?.role?.replace('_', ' ')}</p>
      </div>
      <div className="h-10 w-10 rounded-full bg-eagle-primary flex items-center justify-center text-white">
        {user?.name ? user.name.charAt(0) : 'U'}
      </div>
    </div>
  );
};

export default UserProfile;
