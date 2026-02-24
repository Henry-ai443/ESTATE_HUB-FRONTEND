import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Property } from "@/data/mockData";
import { getCurrentUser } from "@/utils/localStorage";
import { propertiesAPI } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Building2, Loader2, CheckCircle, AlertCircle, Clock } from "lucide-react";

const DashboardPage = () => {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Property>>({
    title: "",
    description: "",
    price: 0,
    location: { address: "", city: "", state: "", zipCode: "", country: "US" },
    type: "house",
    bedrooms: 0,
    bathrooms: 0,
    area: 0,
    images: [],
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<any[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);

  useEffect(() => {
    // Check if user is an owner or admin
    if (!currentUser || (currentUser.role !== "owner" && currentUser.role !== "admin")) {
      navigate("/login");
      return;
    }

    // Load owner's properties
    const fetchProperties = async () => {
      try {
        const userId = currentUser._id || currentUser.id;
        const response = await propertiesAPI.getAll({ ownerId: userId });
        setProperties(response.properties || response || []);
      } catch (error) {
        console.error("Error loading properties:", error);
        setProperties([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [currentUser, navigate]);

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      price: 0,
      location: { address: "", city: "", state: "", zipCode: "", country: "US" },
      type: "house",
      bedrooms: 0,
      bathrooms: 0,
      area: 0,
      images: [],
    });
    setImageFiles([]);
    setExistingImages([]);
    setImagesToDelete([]);
    setEditingId(null);
    setShowForm(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + imageFiles.length > 10) {
      toast.error("Maximum 10 images allowed");
      return;
    }
    setImageFiles([...imageFiles, ...files]);
  };

  const removeImage = (index: number) => {
    const image = existingImages[index];
    if (image?.public_id) {
      setImagesToDelete([...imagesToDelete, image.public_id]);
    }
    setExistingImages(existingImages.filter((_, i) => i !== index));
  };

  const removeNewImage = (index: number) => {
    setImageFiles(imageFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (
      !formData.title ||
      !formData.description ||
      !(formData.location as any)?.city ||
      !formData.price ||
      !formData.area
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setSubmitting(true);

      const submitData = new FormData();
      submitData.append("title", formData.title);
      submitData.append("description", formData.description);
      submitData.append("price", String(formData.price));
      submitData.append("type", formData.type);
      submitData.append("bedrooms", String(formData.bedrooms || 0));
      submitData.append("bathrooms", String(formData.bathrooms || 0));
      submitData.append("area", String(formData.area));
      submitData.append("location", JSON.stringify(formData.location));

      // Add images to delete (if updating)
      if (imagesToDelete.length > 0) {
        submitData.append("imagesToDelete", JSON.stringify(imagesToDelete));
      }

      imageFiles.forEach((file) => {
        submitData.append("images", file);
      });

      if (editingId) {
        // Update existing property
        const response = await propertiesAPI.update(editingId, submitData);
        setProperties(
          properties.map((p) => (p._id === editingId || p.id === editingId ? response.property : p))
        );
        toast.success("Property updated successfully");
      } else {
        // Create new property
        const response = await propertiesAPI.create(submitData);
        setProperties([...properties, response.property]);
        toast.success("Property submitted for approval! You'll be notified when the admin reviews it.");
      }

      resetForm();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to submit property");
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (property: Property) => {
    setFormData({
      title: property.title,
      description: property.description,
      price: property.price,
      location: typeof property.location === "string" 
        ? { address: property.location, city: "", state: "", zipCode: "", country: "US" }
        : property.location,
      type: property.type,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      area: property.area,
      images: property.images || [],
    });
    setImageFiles([]);
    setExistingImages(property.images || []);
    setImagesToDelete([]);
    setEditingId(property._id || property.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this property?")) return;

    try {
      await propertiesAPI.delete(id);
      setProperties(properties.filter((p) => (p._id || p.id) !== id));
      toast.success("Property deleted successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete property");
      console.error(error);
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "rejected":
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-600" />;
      default:
        return null;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getLocationString = (location: any) => {
    if (typeof location === "string") return location;
    if (location?.city && location?.state) return `${location.city}, ${location.state}`;
    return "Location";
  };

  if (!currentUser || (currentUser.role !== "owner" && currentUser.role !== "admin")) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Properties</h1>
            <p className="text-muted-foreground">
              Manage your property listings ({properties.length} total)
            </p>
          </div>
          <Button
            variant="hero"
            size="lg"
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
          >
            <Plus className="mr-2 h-5 w-5" />
            Add Property
          </Button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-card rounded-lg p-6 border mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">
                {editingId ? "Edit Property" : "Submit New Property"}
              </h2>
              <Button variant="ghost" onClick={resetForm}>
                Cancel
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Title <span className="text-destructive">*</span>
                  </label>
                  <Input
                    placeholder="Modern Downtown Apartment"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    City <span className="text-destructive">*</span>
                  </label>
                  <Input
                    placeholder="San Francisco"
                    value={(formData.location as any)?.city || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        location: { ...(formData.location as any), city: e.target.value },
                      })
                    }
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Address
                  </label>
                  <Input
                    placeholder="123 Main Street"
                    value={(formData.location as any)?.address || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        location: { ...(formData.location as any), address: e.target.value },
                      })
                    }
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">State</label>
                  <Input
                    placeholder="CA"
                    value={(formData.location as any)?.state || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        location: { ...(formData.location as any), state: e.target.value },
                      })
                    }
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Price <span className="text-destructive">*</span>
                  </label>
                  <Input
                    type="number"
                    placeholder="850000"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: parseInt(e.target.value) || 0 })
                    }
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Type <span className="text-destructive">*</span>
                  </label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: any) =>
                      setFormData({ ...formData, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="house">House</SelectItem>
                      <SelectItem value="apartment">Apartment</SelectItem>
                      <SelectItem value="condo">Condo</SelectItem>
                      <SelectItem value="villa">Villa</SelectItem>
                      <SelectItem value="land">Land</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Bedrooms</label>
                  <Input
                    type="number"
                    placeholder="3"
                    value={formData.bedrooms}
                    onChange={(e) =>
                      setFormData({ ...formData, bedrooms: parseInt(e.target.value) || 0 })
                    }
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Bathrooms</label>
                  <Input
                    type="number"
                    placeholder="2"
                    value={formData.bathrooms}
                    onChange={(e) =>
                      setFormData({ ...formData, bathrooms: parseInt(e.target.value) || 0 })
                    }
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Area (sqft) <span className="text-destructive">*</span>
                  </label>
                  <Input
                    type="number"
                    placeholder="1850"
                    value={formData.area}
                    onChange={(e) =>
                      setFormData({ ...formData, area: parseInt(e.target.value) || 0 })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Description <span className="text-destructive">*</span>
                </label>
                <Textarea
                  placeholder="Stunning contemporary apartment with modern amenities..."
                  rows={4}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Upload Images <span className="text-muted-foreground text-xs">(Max 10, 5MB each) - Current: {existingImages.length + imageFiles.length}/10</span>
                  </label>
                  {existingImages.length + imageFiles.length < 10 && (
                    <Input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageChange}
                      className="cursor-pointer"
                    />
                  )}
                  {existingImages.length + imageFiles.length >= 10 && (
                    <div className="text-sm text-amber-600 mb-2">Maximum images reached (10/10)</div>
                  )}
                </div>

                {/* Existing Images */}
                {existingImages.length > 0 && (
                  <div>
                    <label className="text-sm font-medium mb-2 block text-muted-foreground">
                      Current Images ({existingImages.length})
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {existingImages.map((image, index) => (
                        <div key={`existing-${index}`} className="relative group">
                          <img
                            src={image.url}
                            alt={`Current ${index}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-destructive text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-destructive/90 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Remove from Cloudinary"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* New Image Previews */}
                {imageFiles.length > 0 && (
                  <div>
                    <label className="text-sm font-medium mb-2 block text-muted-foreground">
                      New Images ({imageFiles.length})
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {imageFiles.map((file, index) => (
                        <div key={`new-${index}`} className="relative group">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Preview ${index}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeNewImage(index)}
                            className="absolute -top-2 -right-2 bg-amber-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-amber-600 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Remove from upload"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <Button type="submit" variant="hero" size="lg" disabled={submitting}>
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingId ? "Update Property" : "Submit for Approval"}
                </Button>
                <Button type="button" variant="outline" size="lg" onClick={resetForm} disabled={submitting}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Properties List */}
        <div className="space-y-4">
          {loading ? (
            // Loading skeleton
            <>
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-card rounded-lg p-6 border">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Skeleton className="h-32 rounded-lg" />
                    <div className="md:col-span-2 space-y-2">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-4 w-2/3" />
                      <Skeleton className="h-6 w-1/3 mt-4" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  </div>
                </div>
              ))}
            </>
          ) : properties.length > 0 ? (
            properties.map((property) => {
              const status = property.status || "pending";
              const propertyId = property._id || property.id;
              
              return (
                <div key={propertyId} className="bg-card rounded-lg p-6 border hover:border-primary transition-colors">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                    {/* Image */}
                    <div className="md:col-span-1">
                      {property.images && property.images.length > 0 ? (
                        <img
                          src={typeof property.images[0] === 'string' ? property.images[0] : property.images[0].url}
                          alt={property.title}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-full h-32 bg-muted rounded-lg flex items-center justify-center">
                          <Building2 className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="md:col-span-2">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-xl font-semibold">{property.title}</h3>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(status)}
                          <span className={`px-2 py-1 rounded text-xs font-semibold capitalize ${
                            status === "approved" ? "bg-green-100 text-green-800" :
                            status === "rejected" ? "bg-red-100 text-red-800" :
                            "bg-yellow-100 text-yellow-800"
                          }`}>
                            {status}
                          </span>
                        </div>
                      </div>

                      <p className="text-muted-foreground text-sm mb-2">
                        {getLocationString(property.location)} • {property.type}
                      </p>

                      {property.type !== "land" && (
                        <p className="text-muted-foreground text-sm mb-2">
                          {property.bedrooms} bed • {property.bathrooms} bath • {property.area.toLocaleString()} sqft
                        </p>
                      )}

                      <p className="text-primary font-bold text-lg mb-2">
                        {formatPrice(property.price)}
                      </p>

                      {status === "rejected" && property.rejectionReason && (
                        <div className="bg-red-50 border border-red-200 rounded p-3 text-sm">
                          <p className="font-semibold text-red-900 mb-1">Rejection Reason:</p>
                          <p className="text-red-800">{property.rejectionReason}</p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="md:col-span-1 flex flex-col gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(property)}
                        className="w-full"
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(propertyId)}
                        className="w-full"
                      >
                        <Trash2 className="mr-2 h-4 w-4 text-destructive" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-muted rounded-full mb-6">
                <Building2 className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-semibold mb-2">No properties yet</h3>
              <p className="text-muted-foreground mb-6">
                Start by submitting your first property for review
              </p>
              <Button
                variant="hero"
                size="lg"
                onClick={() => {
                  resetForm();
                  setShowForm(true);
                }}
              >
                <Plus className="mr-2 h-5 w-5" />
                Add Your First Property
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
