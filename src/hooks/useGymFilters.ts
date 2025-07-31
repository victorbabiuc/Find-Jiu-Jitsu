import { useState, useCallback, useMemo } from 'react';
import { OpenMat } from '../types';
import { logger } from '../utils';

interface FilterState {
  gi: boolean;
  nogi: boolean;
  price: string | null;
  dateSelection?: string;
  dates?: Date[];
}

interface SessionCounts {
  giCount: number;
  nogiCount: number;
  freeCount: number;
  totalCount: number;
}

interface UseGymFiltersProps {
  allGyms: OpenMat[];
  onFiltersChange?: (filteredGyms: OpenMat[]) => void;
}

export const useGymFilters = ({ allGyms, onFiltersChange }: UseGymFiltersProps) => {
  // Filter state
  const [activeFilters, setActiveFilters] = useState<FilterState>({
    gi: false,
    nogi: false,
    price: null,
  });

  // Calculate session counts for all gyms
  const sessionCounts = useMemo((): SessionCounts => {
    let giCount = 0;
    let nogiCount = 0;
    let freeCount = 0;
    let totalCount = 0;

    allGyms.forEach(gym => {
      gym.openMats.forEach(session => {
        totalCount++;
        
        if (session.type.toLowerCase().includes('gi')) {
          giCount++;
        } else if (session.type.toLowerCase().includes('nogi')) {
          nogiCount++;
        }
        
        if (gym.matFee === 0) {
          freeCount++;
        }
      });
    });

    return { giCount, nogiCount, freeCount, totalCount };
  }, [allGyms]);

  // Apply filters to gyms
  const applyFilters = useCallback((gyms: OpenMat[], filters: FilterState): OpenMat[] => {
    logger.filter('Applying filters:', filters);
    
    return gyms.filter(gym => {
      // Check if gym has any sessions that match the filters
      const hasMatchingSessions = gym.openMats.some(session => {
        // Gi/No-Gi filter
        if (filters.gi && !filters.nogi) {
          if (!session.type.toLowerCase().includes('gi')) {
            return false;
          }
        } else if (filters.nogi && !filters.gi) {
          if (!session.type.toLowerCase().includes('nogi')) {
            return false;
          }
        }
        
        // Price filter
        if (filters.price === 'free') {
          if (gym.matFee !== 0) {
            return false;
          }
        }
        
        return true;
      });
      
      return hasMatchingSessions;
    });
  }, []);

  // Get filtered gyms based on current filters
  const filteredGyms = useMemo(() => {
    const filtered = applyFilters(allGyms, activeFilters);
    logger.filter('Filtered gyms count:', { total: allGyms.length, filtered: filtered.length });
    
    // Notify parent if callback provided
    if (onFiltersChange) {
      onFiltersChange(filtered);
    }
    
    return filtered;
  }, [allGyms, activeFilters, applyFilters, onFiltersChange]);

  // Toggle Gi/No-Gi filter
  const toggleFilter = useCallback((filterType: 'gi' | 'nogi') => {
    setActiveFilters(prev => {
      const newFilters = { ...prev };
      
      if (filterType === 'gi') {
        newFilters.gi = !prev.gi;
        // If both are selected, deselect the other
        if (newFilters.gi && prev.nogi) {
          newFilters.nogi = false;
        }
      } else if (filterType === 'nogi') {
        newFilters.nogi = !prev.nogi;
        // If both are selected, deselect the other
        if (newFilters.nogi && prev.gi) {
          newFilters.gi = false;
        }
      }
      
      logger.filter(`Toggled ${filterType} filter:`, { newValue: newFilters[filterType] });
      return newFilters;
    });
  }, []);

  // Handle free filter
  const handleFreeFilter = useCallback(() => {
    setActiveFilters(prev => {
      const newFilters = { ...prev };
      
      if (prev.price === 'free') {
        newFilters.price = null; // Clear free filter
        logger.filter('Cleared free filter');
      } else {
        newFilters.price = 'free'; // Set free filter
        logger.filter('Set free filter');
      }
      
      return newFilters;
    });
  }, []);

  // Handle filter tap (general filter handler)
  const handleFilterTap = useCallback((filterName: string) => {
    switch (filterName.toLowerCase()) {
      case 'gi':
        toggleFilter('gi');
        break;
      case 'nogi':
        toggleFilter('nogi');
        break;
      case 'free':
        handleFreeFilter();
        break;
      default:
        logger.warn('Unknown filter type:', filterName);
    }
  }, [toggleFilter, handleFreeFilter]);

  // Reset all filters
  const resetFilters = useCallback(() => {
    setActiveFilters({
      gi: false,
      nogi: false,
      price: null,
    });
    logger.filter('Reset all filters');
  }, []);

  // Set specific filter state
  const setFilter = useCallback((filterKey: keyof FilterState, value: any) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterKey]: value,
    }));
    logger.filter(`Set filter ${filterKey}:`, { value });
  }, []);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return activeFilters.gi || activeFilters.nogi || activeFilters.price !== null;
  }, [activeFilters]);

  // Get filter summary
  const getFilterSummary = useCallback(() => {
    const activeFilterNames = [];
    if (activeFilters.gi) activeFilterNames.push('Gi');
    if (activeFilters.nogi) activeFilterNames.push('No-Gi');
    if (activeFilters.price === 'free') activeFilterNames.push('Free');
    
    return {
      hasActiveFilters,
      activeFilterNames,
      activeFilters,
      sessionCounts,
      filteredCount: filteredGyms.length,
      totalCount: allGyms.length,
    };
  }, [activeFilters, hasActiveFilters, sessionCounts, filteredGyms.length, allGyms.length]);

  return {
    // State
    activeFilters,
    sessionCounts,
    filteredGyms,
    hasActiveFilters,
    
    // Actions
    toggleFilter,
    handleFreeFilter,
    handleFilterTap,
    resetFilters,
    setFilter,
    applyFilters,
    
    // Utilities
    getFilterSummary,
  };
}; 