// API service for frontend integration
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Utility to get token from localStorage
const getToken = () => localStorage.getItem("token");

// Utility to make API calls
const apiCall = async (endpoint, options = {}) => {
  const headers = { ...options.headers };

  // Only set Content-Type for JSON if body is not FormData
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP Error: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error(`API Error at ${endpoint}:`, error);
    throw error;
  }
};

// Auth APIs
export const authAPI = {
  register: (userData) =>
    apiCall("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    }),

  login: (credentials) =>
    apiCall("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),

  getCurrentUser: () =>
    apiCall("/auth/me", {
      method: "GET",
    }),
};

// Properties APIs
export const propertiesAPI = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiCall(`/properties${query ? `?${query}` : ""}`);
  },

  getFeatured: () =>
    apiCall("/properties/featured"),

  getById: (id) =>
    apiCall(`/properties/${id}`),

  create: (formData) =>
    apiCall("/properties", {
      method: "POST",
      body: formData,
    }),

  update: (id, formData) =>
    apiCall(`/properties/${id}`, {
      method: "PUT",
      body: formData,
    }),

  delete: (id) =>
    apiCall(`/properties/${id}`, {
      method: "DELETE",
    }),
};

// Admin APIs
export const adminAPI = {
  getPendingProperties: (page = 1, limit = 10) =>
    apiCall(`/admin/properties/pending?page=${page}&limit=${limit}`),

  getAllProperties: (status = "", page = 1, limit = 10) => {
    const query = status ? `?status=${status}&page=${page}&limit=${limit}` : `?page=${page}&limit=${limit}`;
    return apiCall(`/admin/properties/all${query}`);
  },

  approveProperty: (id) =>
    apiCall(`/admin/properties/${id}/approve`, {
      method: "PUT",
    }),

  rejectProperty: (id, reason) =>
    apiCall(`/admin/properties/${id}/reject`, {
      method: "PUT",
      body: JSON.stringify({ reason }),
    }),

  toggleFeatured: (id) =>
    apiCall(`/admin/properties/${id}/featured`, {
      method: "PUT",
    }),

  getUsers: (role = "", page = 1, limit = 10) => {
    const query = role ? `?role=${role}&page=${page}&limit=${limit}` : `?page=${page}&limit=${limit}`;
    return apiCall(`/admin/users${query}`);
  },

  changeUserRole: (id, role) =>
    apiCall(`/admin/users/${id}/role`, {
      method: "PUT",
      body: JSON.stringify({ role }),
    }),

  deactivateUser: (id) =>
    apiCall(`/admin/users/${id}/deactivate`, {
      method: "PUT",
    }),

  getLogs: (page = 1, limit = 20) =>
    apiCall(`/admin/logs?page=${page}&limit=${limit}`),

  getStats: () =>
    apiCall("/admin/stats"),
};

export default {
  authAPI,
  propertiesAPI,
  adminAPI,
};
