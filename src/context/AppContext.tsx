import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ViewType, Filters, BeltType } from '../types';
import { storageService } from '../services/storage.service';

interface AppContextType {
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
  userBelt: BeltType;
  setUserBelt: (belt: BeltType) => void;
  selectedLocation: string;
  setSelectedLocation: (location: string) => void;
  favorites: Set<number>;
  toggleFavorite: (id: number) => void;
  filters: Filters;
  updateFilters: (filters: Partial<Filters>) => void;
  showSideMenu: boolean;
  setShowSideMenu: (show: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // MVP: Set default view to dashboard and default belt to blue
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [userBelt, setUserBelt] = useState<BeltType>('blue');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [showSideMenu, setShowSideMenu] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    radius: '',
    price: '',
    timeOfDay: '',
    giType: ''
  });

  useEffect(() => {
    // Load saved data (MVP: keep for future re-integration)
    const loadAppData = async () => {
      try {
        const savedBelt = await storageService.getItem<BeltType>('userBelt');
        const savedFavorites = await storageService.getItem<number[]>('favorites');
        const savedLocation = await storageService.getItem<string>('selectedLocation');

        if (savedBelt) setUserBelt(savedBelt);
        if (savedFavorites) setFavorites(new Set(savedFavorites));
        if (savedLocation) setSelectedLocation(savedLocation);
      } catch (error) {
        console.error('Failed to load app data:', error);
      }
    };

    loadAppData();
  }, []);

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

  const toggleFavorite = async (id: number) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(id)) {
      newFavorites.delete(id);
    } else {
      newFavorites.add(id);
    }
    setFavorites(newFavorites);
    await storageService.setItem('favorites', Array.from(newFavorites));
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
    }}>
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