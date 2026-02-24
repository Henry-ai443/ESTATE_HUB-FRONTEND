import { Property, User } from "@/data/mockData";

const PROPERTIES_KEY = "estate_properties";
const USER_KEY = "estate_current_user";
const FAVORITES_KEY = "estate_favorites";

// Properties
export const saveProperties = (properties: Property[]) => {
  localStorage.setItem(PROPERTIES_KEY, JSON.stringify(properties));
};

export const getProperties = (): Property[] => {
  const stored = localStorage.getItem(PROPERTIES_KEY);
  return stored ? JSON.parse(stored) : [];
};

// Current User
export const saveCurrentUser = (user: User) => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const getCurrentUser = (): User | null => {
  const stored = localStorage.getItem(USER_KEY);
  return stored ? JSON.parse(stored) : null;
};

export const clearCurrentUser = () => {
  localStorage.removeItem(USER_KEY);
};

// Favorites
export const saveFavorites = (favorites: string[]) => {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
};

export const getFavorites = (): string[] => {
  const stored = localStorage.getItem(FAVORITES_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const toggleFavorite = (propertyId: string): string[] => {
  const favorites = getFavorites();
  const index = favorites.indexOf(propertyId);
  
  if (index > -1) {
    favorites.splice(index, 1);
  } else {
    favorites.push(propertyId);
  }
  
  saveFavorites(favorites);
  return favorites;
};
