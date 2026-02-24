import { Property } from "@/data/mockData";
import { Heart, Bed, Bath, Maximize } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { getFavorites, toggleFavorite } from "@/utils/localStorage";
import { Button } from "./ui/button";

interface PropertyCardProps {
  property: Property;
}

const PropertyCard = ({ property }: PropertyCardProps) => {
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const favorites = getFavorites();
    const propertyId = property.id || property._id;
    setIsFavorite(favorites.includes(propertyId));
  }, [property.id, property._id]);

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const propertyId = property.id || property._id;
    const updatedFavorites = toggleFavorite(propertyId);
    setIsFavorite(updatedFavorites.includes(propertyId));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Extract image URL from either string or object format
  const getImageUrl = (image: string | { url: string }): string => {
    return typeof image === "string" ? image : image.url;
  };

  // Extract location string
  const getLocationString = (): string => {
    if (typeof property.location === "string") {
      return property.location;
    }
    return `${property.location?.city}, ${property.location?.state}` || "Location not specified";
  };

  const propertyId = property.id || property._id;

  return (
    <Link to={`/property/${propertyId}`}>
      <div className="bg-card rounded-lg overflow-hidden border hover-lift group">
        {/* Image */}
        <div className="relative h-56 overflow-hidden">
          <img
            src={getImageUrl(property.images[0])}
            alt={property.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          
          {/* Favorite Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-3 right-3 bg-background/80 backdrop-blur-sm hover:bg-background"
            onClick={handleToggleFavorite}
          >
            <Heart
              className={`h-5 w-5 transition-colors ${
                isFavorite ? "fill-red-500 text-red-500" : "text-muted-foreground"
              }`}
            />
          </Button>

          {/* Featured Badge */}
          {property.featured && (
            <div className="absolute top-3 left-3 bg-accent text-accent-foreground px-3 py-1 rounded-full text-xs font-semibold">
              Featured
            </div>
          )}

          {/* Property Type */}
          <div className="absolute bottom-3 left-3 bg-primary text-primary-foreground px-3 py-1 rounded-md text-xs font-medium capitalize">
            {property.type}
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Price */}
          <div className="text-2xl font-bold text-primary mb-2">
            {formatPrice(property.price)}
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold mb-2 line-clamp-1 group-hover:text-primary transition-colors">
            {property.title}
          </h3>

          {/* Location */}
          <p className="text-sm text-muted-foreground mb-4">{getLocationString()}</p>

          {/* Features */}
          {property.type !== "land" && (
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Bed className="h-4 w-4" />
                <span>{property.bedrooms} Beds</span>
              </div>
              <div className="flex items-center space-x-1">
                <Bath className="h-4 w-4" />
                <span>{property.bathrooms} Baths</span>
              </div>
              <div className="flex items-center space-x-1">
                <Maximize className="h-4 w-4" />
                <span>{property.area.toLocaleString()} sqft</span>
              </div>
            </div>
          )}
          {property.type === "land" && (
            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
              <Maximize className="h-4 w-4" />
              <span>{property.area.toLocaleString()} sqft</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default PropertyCard;
