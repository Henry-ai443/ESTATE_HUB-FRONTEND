import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Property } from "@/data/mockData";
import PropertyCard from "@/components/PropertyCard";
import SearchBar from "@/components/SearchBar";
import { Button } from "@/components/ui/button";
import { ArrowRight, Home, TrendingUp, Shield, Loader2 } from "lucide-react";
import { propertiesAPI } from "@/services/api";
import { toast } from "sonner";

const HomePage = () => {
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProperties = async () => {
      try {
        const response = await propertiesAPI.getFeatured();
        setFeaturedProperties(response.properties || response || []);
      } catch (error) {
        console.error("Error fetching featured properties:", error);
        setFeaturedProperties([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProperties();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/5 via-background to-accent/5 py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 max-w-3xl mx-auto">
            <h1 className="mb-6 bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent">
              Find Your Dream Property
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Discover the perfect home from our extensive collection of premium properties
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-5xl mx-auto mb-16">
            <SearchBar onSearch={(params) => {
              // Navigate to properties page with search params
              const searchParams = new URLSearchParams();
              if (params.location) searchParams.set("location", params.location);
              if (params.type && params.type !== "all") searchParams.set("type", params.type);
              if (params.maxPrice && params.maxPrice !== "all") searchParams.set("maxPrice", params.maxPrice);
              window.location.href = `/properties?${searchParams.toString()}`;
            }} />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-card p-6 rounded-lg border text-center hover-lift">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-4">
                <Home className="h-6 w-6 text-primary" />
              </div>
              <div className="text-3xl font-bold text-primary mb-2">500+</div>
              <div className="text-sm text-muted-foreground">Properties Listed</div>
            </div>
            <div className="bg-card p-6 rounded-lg border text-center hover-lift">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-accent/10 rounded-lg mb-4">
                <TrendingUp className="h-6 w-6 text-accent" />
              </div>
              <div className="text-3xl font-bold text-accent mb-2">1000+</div>
              <div className="text-sm text-muted-foreground">Happy Clients</div>
            </div>
            <div className="bg-card p-6 rounded-lg border text-center hover-lift">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div className="text-3xl font-bold text-primary mb-2">15+</div>
              <div className="text-sm text-muted-foreground">Years Experience</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="mb-4">Featured Properties</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Handpicked properties offering exceptional value and quality
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : featuredProperties.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {featuredProperties.map((property) => (
                  <PropertyCard key={property._id || property.id} property={property} />
                ))}
              </div>

              <div className="text-center">
                <Button variant="hero" size="lg" asChild>
                  <Link to="/properties">
                    View All Properties
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No featured properties available</p>
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="mb-4">Why Choose EstateHub</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Your trusted partner in real estate
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                <Home className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Wide Selection</h3>
              <p className="text-muted-foreground">
                Browse through thousands of verified properties to find your perfect match
              </p>
            </div>

            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-accent/10 rounded-full mb-4">
                <Shield className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Trusted Platform</h3>
              <p className="text-muted-foreground">
                All listings are verified and our agents are certified professionals
              </p>
            </div>

            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Best Deals</h3>
              <p className="text-muted-foreground">
                Get competitive prices and exclusive deals on premium properties
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
