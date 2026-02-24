import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Property } from "@/data/mockData";
import PropertyCard from "@/components/PropertyCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal, Loader2 } from "lucide-react";
import { propertiesAPI } from "@/services/api";
import { toast } from "sonner";

const PropertiesPage = () => {
  const [searchParams] = useSearchParams();
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [maxPrice, setMaxPrice] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("-createdAt");
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        
        const params: Record<string, string | number> = {};

        const location = searchParams.get("location");
        if (location) {
          params.city = location;
          setSearchTerm(location);
        }

        const type = searchParams.get("type");
        if (type && type !== "all") {
          params.type = type;
          setSelectedType(type);
        }

        const price = searchParams.get("maxPrice");
        if (price && price !== "all") {
          params.maxPrice = parseInt(price);
          setMaxPrice(price);
        }

        params.sortBy = sortBy;

        const response = await propertiesAPI.getAll(params);
        setFilteredProperties(response.properties || response || []);
      } catch (error) {
        console.error("Error fetching properties:", error);
        setFilteredProperties([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [searchParams, sortBy]);

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2">Browse Properties</h1>
          <p className="text-muted-foreground">
            {filteredProperties.length} properties found
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden"
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>

          <div className={`bg-card p-6 rounded-lg border ${showFilters ? "block" : "hidden md:block"}`}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div>
                <label className="text-sm font-medium mb-2 block">Search Location</label>
                <Input
                  placeholder="Search by location or title"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Property Type */}
              <div>
                <label className="text-sm font-medium mb-2 block">Property Type</label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
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
              <div>
                <label className="text-sm font-medium mb-2 block">Max Price</label>
                <Select value={maxPrice} onValueChange={setMaxPrice}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any Price" />
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

              {/* Sort */}
              <div>
                <label className="text-sm font-medium mb-2 block">Sort By</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort By" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="-createdAt">Newest First</SelectItem>
                    <SelectItem value="price">Price: Low to High</SelectItem>
                    <SelectItem value="-price">Price: High to Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Property Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredProperties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProperties.map((property) => (
              <PropertyCard key={property._id || property.id} property={property} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">
              No properties found matching your criteria
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertiesPage;
