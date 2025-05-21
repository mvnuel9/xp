
import React from 'react';
import { Search } from 'lucide-react';

const SearchInput: React.FC = () => {
  return (
    <div className="relative">
      <input
        type="text"
        placeholder="Rechercher..."
        className="pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent hidden md:block"
      />
      <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
    </div>
  );
};

export default SearchInput;
