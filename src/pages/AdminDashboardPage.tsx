import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "@/utils/localStorage";
import { adminAPI, propertiesAPI } from "@/services/api";
import { Property } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Loader2,
  CheckCircle,
  AlertCircle,
  Trash2,
  User,
  BarChart3,
  LogOut,
} from "lucide-react";

interface User {
  _id: string;
  id: string;
  name: string;
  email: string;
  role: "admin" | "owner" | "customer";
  isActive: boolean;
  createdAt: string;
}

interface AdminLog {
  _id: string;
  adminId: string;
  actionType: string;
  targetType: string;
  targetId: string;
  details: any;
  createdAt: string;
}

interface Stats {
  totalUsers: number;
  adminCount: number;
  ownerCount: number;
  customerCount: number;
  totalProperties: number;
  approvedProperties: number;
  pendingProperties: number;
  rejectedProperties: number;
}

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  // Tabs & states
  const [activeTab, setActiveTab] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Properties
  const [pendingProperties, setPendingProperties] = useState<Property[]>([]);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // Users
  const [users, setUsers] = useState<User[]>([]);
  const [changingRoleId, setChangingRoleId] = useState<string | null>(null);
  const [newRole, setNewRole] = useState<"admin" | "owner" | "customer">("customer");

  // Logs
  const [logs, setLogs] = useState<AdminLog[]>([]);

  // Stats
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    // Check if user is admin
    if (!currentUser || currentUser.role !== "admin") {
      navigate("/login");
      return;
    }

    // Load all data
    const loadData = async () => {
      try {
        // Load pending properties
        const propsResponse = await adminAPI.getPendingProperties(1, 50);
        setPendingProperties(propsResponse.properties || propsResponse || []);

        // Load users
        const usersResponse = await adminAPI.getUsers("", 1, 100);
        setUsers(usersResponse.users || usersResponse || []);

        // Load logs
        const logsResponse = await adminAPI.getLogs(1, 50);
        setLogs(logsResponse.logs || logsResponse || []);

        // Load stats
        const statsResponse = await adminAPI.getStats();
        setStats(statsResponse.stats || statsResponse);
      } catch (error) {
        console.error("Error loading admin data:", error);
        setPendingProperties([]);
        setUsers([]);
        setLogs([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentUser, navigate]);

  const handleApprove = async (propertyId: string) => {
    try {
      setSubmitting(true);
      await adminAPI.approveProperty(propertyId);
      setPendingProperties(
        pendingProperties.filter((p) => (p._id || p.id) !== propertyId)
      );
      toast.success("Property approved successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to approve");
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectingId || !rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    try {
      setSubmitting(true);
      await adminAPI.rejectProperty(rejectingId, rejectionReason);
      setPendingProperties(
        pendingProperties.filter((p) => (p._id || p.id) !== rejectingId)
      );
      setRejectingId(null);
      setRejectionReason("");
      toast.success("Property rejected");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to reject");
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleChangeRole = async (userId: string, role: string) => {
    try {
      setSubmitting(true);
      await adminAPI.changeUserRole(userId, role as any);
      setUsers(
        users.map((u) => (u._id === userId || u.id === userId ? { ...u, role: role as any } : u))
      );
      setChangingRoleId(null);
      toast.success("User role updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update role");
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivateUser = async (userId: string) => {
    if (!confirm("Deactivate this user? They won't be able to login.")) return;

    try {
      setSubmitting(true);
      await adminAPI.deactivateUser(userId);
      setUsers(
        users.map((u) =>
          u._id === userId || u.id === userId ? { ...u, isActive: false } : u
        )
      );
      toast.success("User deactivated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to deactivate");
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getLocationString = (location: any) => {
    if (typeof location === "string") return location;
    if (location?.city && location?.state) return `${location.city}, ${location.state}`;
    return "Location";
  };

  if (!currentUser || currentUser.role !== "admin") {
    return null;
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage properties, users, and view activity logs</p>
        </div>

        {/* Statistics */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-card rounded-lg p-6 border">
                <Skeleton className="h-6 w-1/2 mb-2" />
                <Skeleton className="h-8 w-1/3 mb-4" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </div>
        ) : stats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-card rounded-lg p-6 border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Total Users</p>
                  <p className="text-3xl font-bold">{stats.totalUsers}</p>
                </div>
                <User className="h-8 w-8 text-primary opacity-50" />
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                {stats.adminCount} admin • {stats.ownerCount} owner • {stats.customerCount} customer
              </p>
            </div>

            <div className="bg-card rounded-lg p-6 border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Total Properties</p>
                  <p className="text-3xl font-bold">{stats.totalProperties}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-primary opacity-50" />
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                {stats.approvedProperties} approved • {stats.pendingProperties} pending
              </p>
            </div>

            <div className="bg-card rounded-lg p-6 border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Approved</p>
                  <p className="text-3xl font-bold text-green-600">{stats.approvedProperties}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600 opacity-50" />
              </div>
            </div>

            <div className="bg-card rounded-lg p-6 border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Pending Review</p>
                  <p className="text-3xl font-bold text-yellow-600">{stats.pendingProperties}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-yellow-600 opacity-50" />
              </div>
            </div>
          </div>
        ) : null}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending">
              Pending Properties ({pendingProperties.length})
            </TabsTrigger>
            <TabsTrigger value="users">Users ({users.length})</TabsTrigger>
            <TabsTrigger value="logs">Activity Logs</TabsTrigger>
          </TabsList>

          {/* Pending Properties Tab */}
          <TabsContent value="pending" className="mt-6 space-y-4">
            {loading ? (
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
            ) : pendingProperties.length > 0 ? (
              pendingProperties.map((property) => (
                <div key={property._id || property.id} className="bg-card rounded-lg p-6 border">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                    {/* Image */}
                    <div className="md:col-span-1">
                      {property.images && property.images.length > 0 ? (
                        <img
                          src={
                            typeof property.images[0] === "string"
                              ? property.images[0]
                              : property.images[0].url
                          }
                          alt={property.title}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-full h-32 bg-muted rounded-lg flex items-center justify-center">
                          <AlertCircle className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="md:col-span-2">
                      <h3 className="text-xl font-semibold mb-2">{property.title}</h3>
                      <p className="text-muted-foreground text-sm mb-2">
                        {getLocationString(property.location)} • {property.type}
                      </p>
                      {property.type !== "land" && (
                        <p className="text-muted-foreground text-sm mb-2">
                          {property.bedrooms} bed • {property.bathrooms} bath • {property.area?.toLocaleString()} sqft
                        </p>
                      )}
                      <p className="text-primary font-bold text-lg">{formatPrice(property.price)}</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Submitted: {formatDate(property.createdAt || new Date().toISOString())}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="md:col-span-1 space-y-2">
                      {rejectingId === (property._id || property.id) ? (
                        <div className="space-y-2">
                          <Textarea
                            placeholder="Reason for rejection..."
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            rows={3}
                          />
                          <Button
                            size="sm"
                            className="w-full"
                            disabled={submitting}
                            onClick={handleReject}
                          >
                            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Confirm Reject
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            disabled={submitting}
                            onClick={() => {
                              setRejectingId(null);
                              setRejectionReason("");
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <>
                          <Button
                            variant="hero"
                            size="sm"
                            className="w-full"
                            disabled={submitting}
                            onClick={() => handleApprove(property._id || property.id)}
                          >
                            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            disabled={submitting}
                            onClick={() => setRejectingId(property._id || property.id)}
                          >
                            <AlertCircle className="mr-2 h-4 w-4" />
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold mb-2">All Caught Up!</h3>
                <p className="text-muted-foreground">No pending properties to review</p>
              </div>
            )}
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="mt-6">
            {loading ? (
              <div className="bg-card rounded-lg border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4">
                          <Skeleton className="h-4 w-20" />
                        </th>
                        <th className="text-left p-4">
                          <Skeleton className="h-4 w-24" />
                        </th>
                        <th className="text-left p-4">
                          <Skeleton className="h-4 w-16" />
                        </th>
                        <th className="text-left p-4">
                          <Skeleton className="h-4 w-20" />
                        </th>
                        <th className="text-left p-4">
                          <Skeleton className="h-4 w-24" />
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {[1, 2, 3, 4, 5].map((i) => (
                        <tr key={i} className="border-b">
                          <td className="p-4">
                            <Skeleton className="h-4 w-32" />
                          </td>
                          <td className="p-4">
                            <Skeleton className="h-4 w-40" />
                          </td>
                          <td className="p-4">
                            <Skeleton className="h-4 w-20" />
                          </td>
                          <td className="p-4">
                            <Skeleton className="h-4 w-24" />
                          </td>
                          <td className="p-4">
                            <Skeleton className="h-4 w-20" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="bg-card rounded-lg border overflow-hidden">
                <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Role</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user._id || user.id} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="px-6 py-4">{user.name}</td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">{user.email}</td>
                        <td className="px-6 py-4">
                          {changingRoleId === (user._id || user.id) ? (
                            <div className="flex gap-2">
                              <select
                                value={newRole}
                                onChange={(e) => setNewRole(e.target.value as any)}
                                className="text-sm border rounded px-2 py-1"
                              >
                                <option value="customer">Customer</option>
                                <option value="owner">Owner</option>
                                <option value="admin">Admin</option>
                              </select>
                              <Button
                                size="sm"
                                disabled={submitting}
                                onClick={() => handleChangeRole(user._id || user.id, newRole)}
                              >
                                Save
                              </Button>
                            </div>
                          ) : (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary capitalize">
                              {user.role}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                              user.isActive
                                ? "bg-green-50 text-green-700"
                                : "bg-red-50 text-red-700"
                            }`}
                          >
                            {user.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            {changingRoleId !== (user._id || user.id) && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setChangingRoleId(user._id || user.id);
                                    setNewRole(user.role);
                                  }}
                                  disabled={submitting}
                                >
                                  Change Role
                                </Button>
                                {user.isActive && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDeactivateUser(user._id || user.id)}
                                    disabled={submitting}
                                  >
                                    <LogOut className="h-4 w-4" />
                                  </Button>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            )}
          </TabsContent>

          {/* Logs Tab */}
          <TabsContent value="logs" className="mt-6">
            {loading ? (
              <div className="bg-card rounded-lg border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4">
                          <Skeleton className="h-4 w-24" />
                        </th>
                        <th className="text-left p-4">
                          <Skeleton className="h-4 w-20" />
                        </th>
                        <th className="text-left p-4">
                          <Skeleton className="h-4 w-24" />
                        </th>
                        <th className="text-left p-4">
                          <Skeleton className="h-4 w-32" />
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {[1, 2, 3, 4, 5].map((i) => (
                        <tr key={i} className="border-b">
                          <td className="p-4">
                            <Skeleton className="h-4 w-32" />
                          </td>
                          <td className="p-4">
                            <Skeleton className="h-4 w-20" />
                          </td>
                          <td className="p-4">
                            <Skeleton className="h-4 w-24" />
                          </td>
                          <td className="p-4">
                            <Skeleton className="h-4 w-40" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
            <div className="bg-card rounded-lg border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Action</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Type</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Target</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Date & Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.length > 0 ? (
                      logs.map((log) => (
                        <tr key={log._id} className="border-b hover:bg-muted/50 transition-colors">
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary">
                              {log.actionType?.replace(/_/g, " ")}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-muted-foreground capitalize">
                            {log.targetType}
                          </td>
                          <td className="px-6 py-4 text-sm font-mono text-muted-foreground">
                            {log.targetId?.substring(0, 8)}...
                          </td>
                          <td className="px-6 py-4 text-sm text-muted-foreground">
                            {formatDate(log.createdAt)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                          No activity logs yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
