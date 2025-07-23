import React, { createContext, useContext, useState, useEffect } from 'react';
import { ViewType, Filters, BeltType } from '../types';
import { storageService } from '../services/storage.service';
import { syncFavorites, getFavorites } from '../services/favorites.service';
import { useAuth } from './AuthContext';

interface AppContextType {
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
  userBelt: BeltType;
  setUserBelt: (belt: BeltType) => void;
  selectedLocation: string;
  setSelectedLocation: (location: string) => void;
  favorites: Set<string>;
  toggleFavorite: (id: string) => void;
  filters: Filters;
  updateFilters: (filters: Partial<Filters>) => void;
  showSideMenu: boolean;
  setShowSideMenu: (show: boolean) => void;
}

const AppContext = createContext<AppContextType | null>(null);

interface AppContextProviderProps {
  children: any;
}

export const AppProvider = ({ children }: AppContextProviderProps) => {
  // MVP: Set default view to dashboard and default belt to blue
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [userBelt, setUserBelt] = useState<BeltType>('blue');
  const [selectedLocation, setSelectedLocation] = useState('Tampa');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showSideMenu, setShowSideMenu] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    radius: '',
    price: '',
    timeOfDay: '',
    giType: ''
  });

  // Get authentication context
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    // Load saved data (MVP: keep for future re-integration)
    const loadAppData = async () => {
      try {
        const savedBelt = await storageService.getItem<BeltType>('userBelt');
        const savedLocation = await storageService.getItem<string>('selectedLocation');

        if (savedBelt) setUserBelt(savedBelt);
        if (savedLocation) setSelectedLocation(savedLocation);

        // Load favorites based on authentication status
        if (isAuthenticated && user?.uid) {
          // Load from Firebase for authenticated users
          const firebaseFavorites = await getFavorites(user.uid);
          setFavorites(new Set(firebaseFavorites.map(String)));
        } else {
          // Load from local storage for unauthenticated users
          const savedFavorites = await storageService.getItem<string[]>('favorites');
          if (savedFavorites) setFavorites(new Set(savedFavorites));
        }
      } catch (error) {
        console.error('Failed to load app data:', error);
      }
    };

    loadAppData();
  }, [isAuthenticated, user?.uid]);

  useEffect(() => {
    // Save belt changes
    const saveBelt = async () => {
      await storageService.setItem('userBelt', userBelt);
    };
    saveBelt();
  }, [userBelt]);

  useEffect(() => {
    // Save location changes
    const saveLocation = async () => {
      await storageService.setItem('selectedLocation', selectedLocation);
    };
    saveLocation();
  }, [selectedLocation]);

  const toggleFavorite = async (id: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(id)) {
      newFavorites.delete(id);
    } else {
      newFavorites.add(id);
    }
    setFavorites(newFavorites);
    
    // Save to local storage for all users
    await storageService.setItem('favorites', Array.from(newFavorites));
    
    // Sync to Firebase for authenticated users
    if (isAuthenticated && user?.uid) {
      try {
        await syncFavorites(user.uid, Array.from(newFavorites).map(Number));
      } catch (error) {
        console.error('Failed to sync favorites to Firebase:', error);
      }
    }
  };

  const updateFilters = (newFilters: Partial<Filters>) => {
    setFilters({ ...filters, ...newFilters });
  };

  return (
    <AppContext.Provider value={{
      currentView,
      setCurrentView,
      userBelt,
      setUserBelt,
      selectedLocation,
      setSelectedLocation,
      favorites,
      toggleFavorite,
      filters,
      updateFilters,
      showSideMenu,
      setShowSideMenu
    } as AppContextType}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};