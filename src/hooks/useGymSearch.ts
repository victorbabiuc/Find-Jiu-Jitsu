import { useState, useCallback, useRef, useEffect } from 'react';
import { OpenMat } from '../types';
import { SearchService } from '../services';
import { logger } from '../utils';

interface UseGymSearchProps {
  allGyms: OpenMat[];
  onSearchResultsChange?: (results: OpenMat[]) => void;
}

export const useGymSearch = ({ allGyms, onSearchResultsChange }: UseGymSearchProps) => {
  // Search state
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<OpenMat[]>([]);
  const [isSearchComplete, setIsSearchComplete] = useState(false);
  
  // Smart search state
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Debounce ref
  const debounceTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Load recent searches on mount
  useEffect(() => {
    loadRecentSearches();
  }, []);

  // Load recent searches from storage
  const loadRecentSearches = useCallback(async () => {
    try {
      const recent = await SearchService.getRecentSearches();
      setRecentSearches(recent);
    } catch (error) {
      logger.error('Error loading recent searches:', error);
    }
  }, []);

  // Perform search with debouncing
  const performSearch = useCallback(async (query: string) => {
    logger.search('performSearch called with:', { query });
    
    if (!query.trim()) {
      logger.warn('Empty query, clearing results');
      setSearchResults([]);
      setIsSearchComplete(false);
      return;
    }
    
    logger.start('Starting search, setting isSearching to true');
    setIsSearching(true);
    setIsSearchComplete(false);
    
    try {
      // Use smart search service
      const results = SearchService.searchGyms(query, allGyms);
      
      logger.success('Setting search results:', { count: results.length });
      setSearchResults(results);
      setIsSearchComplete(true);
      
      // Save to recent searches
      await SearchService.saveRecentSearch(query);
      
      // Update recent searches state
      const updatedRecent = await SearchService.getRecentSearches();
      setRecentSearches(updatedRecent);
      
      // Notify parent if callback provided
      if (onSearchResultsChange) {
        onSearchResultsChange(results);
      }
    } catch (error) {
      logger.error('Error searching gyms:', error);
      logger.warn('Error case - clearing search results');
      setSearchResults([]);
      setIsSearchComplete(true);
    } finally {
      logger.finish('Search complete, setting isSearching to false');
      setIsSearching(false);
    }
  }, [allGyms, onSearchResultsChange]);

  // Debounced search input handler
  const handleInputChange = useCallback((text: string) => {
    setSearchQuery(text);
    setShowSuggestions(false);
    
    // Clear previous timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    // Set new timeout for debounced search
    debounceTimeoutRef.current = setTimeout(() => {
      performSearch(text);
    }, 300); // 300ms debounce
  }, [performSearch]);

  // Handle suggestion selection
  const handleSelectSuggestion = useCallback((suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    performSearch(suggestion);
  }, [performSearch]);

  // Clear recent searches
  const handleClearRecent = useCallback(async () => {
    try {
      await SearchService.clearRecentSearches();
      setRecentSearches([]);
      setShowSuggestions(false);
    } catch (error) {
      logger.error('Error clearing recent searches:', error);
    }
  }, []);

  // Close search and reset state
  const closeSearch = useCallback(() => {
    logger.search('closeSearch called - clearing search state');
    setIsSearching(false);
    setSearchQuery('');
    setSearchResults([]);
    setIsSearchComplete(false);
    setShowSuggestions(false);
    
    // Clear any pending debounce
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
  }, []);

  // Start searching
  const startSearch = useCallback(() => {
    setIsSearching(true);
    setShowSuggestions(recentSearches.length > 0);
  }, [recentSearches.length]);

  // Handle input focus
  const handleInputFocus = useCallback(() => {
    logger.searchInput('TextInput onFocus - input focused');
    if (searchQuery.length === 0 && recentSearches.length > 0) {
      setShowSuggestions(true);
    }
  }, [searchQuery.length, recentSearches.length]);

  // Handle input blur
  const handleInputBlur = useCallback(() => {
    logger.searchInput('TextInput onBlur - input lost focus');
    // Don't hide suggestions immediately to allow for taps
    setTimeout(() => {
      if (!searchQuery.trim()) {
        setShowSuggestions(false);
      }
    }, 200);
  }, [searchQuery]);

  // Generate search suggestions based on query
  const generateSuggestions = useCallback((query: string) => {
    if (query.length < 2) return [];
    
    const suggestions = allGyms
      .map(gym => gym.name)
      .filter(name => name.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 5); // Limit to 5 suggestions
    
    setSearchSuggestions(suggestions);
  }, [allGyms]);

  // Update suggestions when query changes
  useEffect(() => {
    if (searchQuery.length >= 2) {
      generateSuggestions(searchQuery);
    } else {
      setSearchSuggestions([]);
    }
  }, [searchQuery, generateSuggestions]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  return {
    // State
    isSearching,
    searchQuery,
    searchResults,
    isSearchComplete,
    searchSuggestions,
    recentSearches,
    showSuggestions,
    
    // Actions
    handleInputChange,
    handleSelectSuggestion,
    handleClearRecent,
    closeSearch,
    startSearch,
    handleInputFocus,
    handleInputBlur,
    performSearch,
    loadRecentSearches,
  };
}; 