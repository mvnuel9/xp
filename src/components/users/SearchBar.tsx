
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ value, onChange }) => {
  return (
    <div className="flex items-center border rounded-md px-3 py-2 max-w-md">
      <Search className="h-5 w-5 text-gray-400 mr-2" />
      <Input
        className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
        placeholder="Rechercher un utilisateur..."
        value={value}
        onChange={onChange}
      />
    </div>
  );
};

export default SearchBar;
