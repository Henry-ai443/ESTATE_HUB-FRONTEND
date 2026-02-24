import { Search } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

interface SearchBarProps {
  onSearch?: (params: { location: string; type: string; maxPrice: string }) => void;
}

const SearchBar = ({ onSearch }: SearchBarProps) => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const params = {
      location: formData.get("location") as string,
      type: formData.get("type") as string,
      maxPrice: formData.get("maxPrice") as string,
    };
    onSearch?.(params);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="bg-card rounded-lg shadow-lg p-6 border">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Location */}
          <div className="md:col-span-1">
            <Input
              name="location"
              placeholder="Location"
              className="h-12"
            />
          </div>

          {/* Property Type */}
          <div className="md:col-span-1">
            <Select name="type">
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Property Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="house">House</SelectItem>
                <SelectItem value="apartment">Apartment</SelectItem>
                <SelectItem value="condo">Condo</SelectItem>
                <SelectItem value="villa">Villa</SelectItem>
                <SelectItem value="land">Land</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Max Price */}
          <div className="md:col-span-1">
            <Select name="maxPrice">
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Max Price" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Price</SelectItem>
                <SelectItem value="500000">Up to $500k</SelectItem>
                <SelectItem value="750000">Up to $750k</SelectItem>
                <SelectItem value="1000000">Up to $1M</SelectItem>
                <SelectItem value="1500000">Up to $1.5M</SelectItem>
                <SelectItem value="2000000">Up to $2M</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Search Button */}
          <div className="md:col-span-1">
            <Button type="submit" variant="hero" className="w-full h-12" size="lg">
              <Search className="h-5 w-5 mr-2" />
              Search
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default SearchBar;
