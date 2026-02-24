import { useEffect, useState } from "react";
import { Property, mockProperties } from "@/data/mockData";
import { getProperties, saveProperties, getFavorites } from "@/utils/localStorage";
import PropertyCard from "@/components/PropertyCard";
import { Heart } from "lucide-react";

const FavoritesPage = () => {
  const [favoriteProperties, setFavoriteProperties] = useState<Property[]>([]);

  useEffect(() => {
    // Load properties
    let properties = getProperties();
    if (properties.length === 0) {
      saveProperties(mockProperties);
      properties = mockProperties;
    }

    // Get favorites
    const favoriteIds = getFavorites();
    const favorites = properties.filter((p) => favoriteIds.includes(p.id));
    setFavoriteProperties(favorites);
  }, []);

  // Listen for changes to localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      const properties = getProperties();
      const favoriteIds = getFavorites();
      const favorites = properties.filter((p) => favoriteIds.includes(p.id));
      setFavoriteProperties(favorites);
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-primary/10 p-3 rounded-lg">
              <Heart className="h-6 w-6 text-primary fill-current" />
            </div>
            <h1>My Favorites</h1>
          </div>
          <p className="text-muted-foreground">
            {favoriteProperties.length} {favoriteProperties.length === 1 ? "property" : "properties"} saved
          </p>
        </div>

        {/* Properties Grid */}
        {favoriteProperties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {favoriteProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-muted rounded-full mb-6">
              <Heart className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-semibold mb-2">No favorites yet</h3>
            <p className="text-muted-foreground mb-6">
              Start exploring properties and save your favorites to view them here
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;
