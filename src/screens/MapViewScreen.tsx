import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Linking,
  Platform,
  Dimensions,
  ScrollView,
} from 'react-native';
// Map component removed due to compatibility issues
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { useLoading } from '../context/LoadingContext';
import { OpenMat } from '../types';
import { haptics, animations } from '../utils';
import { apiService } from '../services/api.service';
import { githubDataService } from '../services/github-data.service';

interface MapViewScreenProps {
  route: any;
  navigation: any;
}

// Filter interface to match ResultsScreen
interface ActiveFilters {
  gi: boolean;
  nogi: boolean;
  price: 'free' | null;
}

const MapViewScreen: React.FC<MapViewScreenProps> = ({ route, navigation }) => {
  const { theme } = useTheme();
  const { selectedLocation, favorites, toggleFavorite } = useApp();
  const { showTransitionalLoading } = useLoading();
  
  const [gyms, setGyms] = useState<OpenMat[]>([]);
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [loading, setLoading] = useState(true);
  const [mapRegion, setMapRegion] = useState<any>({
    latitude: 27.9478, // Tampa default
    longitude: -82.4588,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  });
  
  // Filter state (matching ResultsScreen)
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({
    gi: false,
    nogi: false,
    price: null,
  });

  const mapRef = useRef<any>(null);

  // Get user location
  useEffect(() => {
    const getUserLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const location = await Location.getCurrentPositionAsync({});
          setUserLocation(location);
          
          // Center map on user location if available
          setMapRegion({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.1,
            longitudeDelta: 0.1,
          });
        }
      } catch (error) {
        console.log('Location permission denied or error:', error);
      }
    };

    getUserLocation();
  }, []);

  // Load gym data
  useEffect(() => {
    const fetchGymData = async () => {
      try {
        setLoading(true);
        
        // Determine city from location string
        const city = selectedLocation.toLowerCase().includes('austin') ? 'austin' : 
                     selectedLocation.toLowerCase().includes('tampa') ? 'tampa' : 'tampa';
        
        // Force refresh data from GitHub
        if (city === 'tampa') {
          await githubDataService.forceRefreshTampaData();
        } else {
          await githubDataService.refreshData(city);
        }
        
        const data = await apiService.getOpenMats(selectedLocation, {}, true);
        setGyms(data);
      } catch (error) {
        console.error('Error fetching gym data:', error);
        setGyms([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGymData();
  }, [selectedLocation]);

  // Update map region based on selected location
  useEffect(() => {
    const region = selectedLocation.toLowerCase().includes('austin') 
      ? {
          latitude: 30.2672, // Austin
          longitude: -97.7431,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }
      : {
          latitude: 27.9478, // Tampa
          longitude: -82.4588,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        };
    
    setMapRegion(region);
    
    // Animate to new region
    if (mapRef.current) {
      mapRef.current.animateToRegion(region, 1000);
    }
  }, [selectedLocation]);

  // Filter and sort gyms based on active filters (same logic as ResultsScreen)
  const filteredGyms = useMemo(() => {
    let filtered = [...gyms];
    
    // Apply Gi/No-Gi filters with smart logic
    if (activeFilters.gi || activeFilters.nogi) {
      filtered = filtered.filter(gym => {
        // Check what session types this gym offers
        const sessionTypes = gym.openMats.map(mat => mat.type);
        const hasGi = sessionTypes.includes('gi');
        const hasNoGi = sessionTypes.includes('nogi');
        const hasBoth = sessionTypes.includes('both');
        
        if (activeFilters.gi && activeFilters.nogi) {
          // Show gyms that have EITHER Gi OR No-Gi OR both
          const matches = hasGi || hasNoGi || hasBoth;
          return matches;
        } else if (activeFilters.gi) {
          // Show gyms with Gi or both types
          const matches = hasGi || hasBoth;
          return matches;
        } else if (activeFilters.nogi) {
          // Show gyms with No-Gi or both types
          const matches = hasNoGi || hasBoth;
          return matches;
        }
        return false;
      }).map(gym => {
        // Filter the sessions within each gym based on active filters
        let filteredSessions = gym.openMats;
        
        if (activeFilters.gi && !activeFilters.nogi) {
          // Only show Gi sessions
          filteredSessions = gym.openMats.filter(session => session.type === 'gi' || session.type === 'both');
        } else if (activeFilters.nogi && !activeFilters.gi) {
          // Only show No-Gi sessions
          filteredSessions = gym.openMats.filter(session => session.type === 'nogi' || session.type === 'both');
        }
        // If both filters are active, show all sessions (no filtering needed)
        
        return {
          ...gym,
          openMats: filteredSessions
        };
      });
    }
    
    // Apply free filter
    if (activeFilters.price === 'free') {
      filtered = filtered.filter(gym => gym.matFee === 0);
    }
    
    // Sort gyms by their earliest session time (same logic as ResultsScreen)
    filtered.sort((a, b) => {
      const earliestSessionA = a.openMats[0];
      const earliestSessionB = b.openMats[0];
      
      if (!earliestSessionA && !earliestSessionB) return 0;
      if (!earliestSessionA) return 1;
      if (!earliestSessionB) return -1;
      
      // Define day order for sorting (Friday first, then Saturday, then Sunday)
      const dayOrder = {
        'Friday': 1,
        'Saturday': 2,
        'Sunday': 3,
        'Monday': 4,
        'Tuesday': 5,
        'Wednesday': 6,
        'Thursday': 7
      };
      
      const dayA = dayOrder[earliestSessionA.day as keyof typeof dayOrder] || 999;
      const dayB = dayOrder[earliestSessionB.day as keyof typeof dayOrder] || 999;
      
      // First sort by day
      if (dayA !== dayB) {
        return dayA - dayB;
      }
      
      // If same day, sort by time (earlier time first)
      const timeA = earliestSessionA.time;
      const timeB = earliestSessionB.time;
      
      // Convert time to minutes for comparison
      const getMinutesFromTime = (timeStr: string): number => {
        const cleanTime = timeStr.trim().toLowerCase();
        
        // Handle time ranges like "6:30 PM - 7:30 PM" by taking the start time
        const timeRangeMatch = cleanTime.match(/^(.+?)\s*-\s*(.+)$/);
        if (timeRangeMatch) {
          return getMinutesFromTime(timeRangeMatch[1]); // Use start time
        }
        
        // Handle formats like "5:00 PM", "6pm", "12:30 AM"
        const match = cleanTime.match(/^(\d+):?(\d*)\s*(am|pm)$/);
        if (match) {
          let hour = parseInt(match[1]);
          const minute = match[2] ? parseInt(match[2]) : 0;
          const period = match[3];
          
          if (period === 'pm' && hour !== 12) hour += 12;
          if (period === 'am' && hour === 12) hour = 0;
          
          return hour * 60 + minute;
        }
        
        // Handle 24-hour format like "18:00"
        const militaryMatch = cleanTime.match(/^(\d+):(\d+)$/);
        if (militaryMatch) {
          const hour = parseInt(militaryMatch[1]);
          const minute = parseInt(militaryMatch[2]);
          return hour * 60 + minute;
        }
        
        return 999; // Default for unparseable times
      };
      
      const minutesA = getMinutesFromTime(timeA);
      const minutesB = getMinutesFromTime(timeB);
      
      return minutesA - minutesB;
    });
    
    return filtered;
  }, [gyms, activeFilters]);

  // Parse coordinates from address (fallback method)
  const getCoordinatesFromAddress = (address: string): { latitude: number; longitude: number } | null => {
    // This is a simplified fallback - in production, you'd use a geocoding service
    // For now, return null to skip pins without coordinates
    return null;
  };

  // Handle gym press
  const handleGymPress = (gym: OpenMat) => {
    haptics.light();
    // Navigate to gym details or show modal
    navigation.navigate('Results', { gym });
  };

  // Handle directions
  const handleDirections = (gym: OpenMat) => {
    haptics.light();
    const address = encodeURIComponent(gym.address);
    const url = Platform.OS === 'ios' 
      ? `http://maps.apple.com/?daddr=${address}`
      : `https://maps.google.com/?daddr=${address}`;
    
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'Could not open maps app');
    });
  };

  // Handle website
  const handleWebsite = (gym: OpenMat) => {
    haptics.light();
    if (gym.website) {
      Linking.openURL(gym.website).catch(() => {
        Alert.alert('Error', 'Could not open website');
      });
    }
  };

  // Handle heart press
  const handleHeartPress = (gym: OpenMat) => {
    haptics.light();
    toggleFavorite(gym.id);
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.text.primary }]}>
            Loading gyms...
          </Text>
        </View>
      </View>
    );
  }

      return (
      <View style={styles.container}>
        {/* Location List View (Map Alternative) */}
        <View style={styles.locationListContainer}>
          <View style={styles.locationListHeader}>
            <Ionicons name="location" size={24} color={theme.text.primary} />
            <Text style={[styles.locationListTitle, { color: theme.text.primary }]}>
              Gym Locations
            </Text>
          </View>
          
          <ScrollView style={styles.locationList} showsVerticalScrollIndicator={false}>
            {filteredGyms.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="search-outline" size={48} color={theme.text.secondary} />
                <Text style={[styles.emptyStateText, { color: theme.text.secondary }]}>
                  No gyms found with current filters
                </Text>
              </View>
            ) : (
              filteredGyms.map((gym) => (
                <TouchableOpacity
                  key={gym.id}
                  style={styles.locationItem}
                  onPress={() => handleGymPress(gym)}
                >
                  <View style={styles.locationItemContent}>
                    <View style={styles.locationItemHeader}>
                      <Text style={[styles.locationItemTitle, { color: theme.text.primary }]}>
                        {gym.name}
                      </Text>
                      <TouchableOpacity
                        style={styles.heartButton}
                        onPress={() => handleHeartPress(gym)}
                      >
                        <Text style={styles.heartIcon}>
                          {favorites.has(gym.id) ? '♥' : '♡'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                    
                    <Text style={[styles.locationItemAddress, { color: theme.text.secondary }]}>
                      {gym.address}
                    </Text>
                    
                    {gym.openMats && gym.openMats.length > 0 && (
                      <Text style={[styles.locationItemSession, { color: theme.text.secondary }]}>
                        {gym.openMats[0].day} {gym.openMats[0].time}
                      </Text>
                    )}
                    
                    <Text style={[styles.locationItemPricing, { color: gym.matFee === 0 ? '#10B981' : theme.text.secondary }]}>
                      {gym.matFee === 0 ? 'Free' : `$${gym.matFee}`}
                    </Text>
                    
                    <View style={styles.locationItemActions}>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleDirections(gym)}
                      >
                        <Ionicons name="navigate" size={16} color="#007AFF" />
                        <Text style={styles.actionButtonText}>Directions</Text>
                      </TouchableOpacity>
                      
                      {gym.website && (
                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={() => handleWebsite(gym)}
                        >
                          <Ionicons name="globe" size={16} color="#007AFF" />
                          <Text style={styles.actionButtonText}>Website</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>
      
      {/* Filter Section */}
      <View style={styles.filterSection}>
        <ScrollView 
          horizontal={true} 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContainer}
        >
          {/* Gi Toggle Filter */}
          <TouchableOpacity 
            style={[
              styles.filterPill,
              {
                backgroundColor: activeFilters.gi ? '#374151' : '#F0F3F5',
                borderWidth: activeFilters.gi ? 0 : 1,
                borderColor: activeFilters.gi ? 'transparent' : '#E0E0E0',
                marginRight: 8,
                shadowColor: activeFilters.gi ? '#374151' : 'transparent',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: activeFilters.gi ? 0.3 : 0,
                shadowRadius: 4,
                elevation: activeFilters.gi ? 3 : 0,
              }
            ]}
            onPress={() => {
              haptics.light();
              setActiveFilters(prev => ({ ...prev, gi: !prev.gi }));
            }}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.filterPillText,
              { 
                color: activeFilters.gi ? '#FFFFFF' : '#60798A',
                fontWeight: activeFilters.gi ? '700' : '500'
              }
            ]}>
              Gi
            </Text>
          </TouchableOpacity>

          {/* No-Gi Toggle Filter */}
          <TouchableOpacity 
            style={[
              styles.filterPill,
              {
                backgroundColor: activeFilters.nogi ? '#374151' : '#F0F3F5',
                borderWidth: activeFilters.nogi ? 0 : 1,
                borderColor: activeFilters.nogi ? 'transparent' : '#E0E0E0',
                marginRight: 8,
                shadowColor: activeFilters.nogi ? '#374151' : 'transparent',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: activeFilters.nogi ? 0.3 : 0,
                shadowRadius: 4,
                elevation: activeFilters.nogi ? 3 : 0,
              }
            ]}
            onPress={() => {
              haptics.light();
              setActiveFilters(prev => ({ ...prev, nogi: !prev.nogi }));
            }}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.filterPillText,
              { 
                color: activeFilters.nogi ? '#FFFFFF' : '#60798A',
                fontWeight: activeFilters.nogi ? '700' : '500'
              }
            ]}>
              No-Gi
            </Text>
          </TouchableOpacity>

          {/* Free Filter */}
          <TouchableOpacity 
            style={[
              styles.filterPill,
              {
                backgroundColor: activeFilters.price === 'free' ? '#374151' : '#F0F3F5',
                borderWidth: activeFilters.price === 'free' ? 0 : 1,
                borderColor: activeFilters.price === 'free' ? 'transparent' : '#E0E0E0',
                marginRight: 8,
                shadowColor: activeFilters.price === 'free' ? '#374151' : 'transparent',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: activeFilters.price === 'free' ? 0.3 : 0,
                shadowRadius: 4,
                elevation: activeFilters.price === 'free' ? 3 : 0,
              }
            ]}
            onPress={() => {
              haptics.light();
              setActiveFilters(prev => ({ 
                ...prev, 
                price: prev.price === 'free' ? null : 'free' 
              }));
            }}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.filterPillText,
              { 
                color: activeFilters.price === 'free' ? '#FFFFFF' : '#60798A',
                fontWeight: activeFilters.price === 'free' ? '700' : '500'
              }
            ]}>
              Free
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            haptics.light();
            navigation.goBack();
          }}
        >
          <Ionicons name="arrow-back" size={24} color={theme.text.primary} />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: theme.text.primary }]}>
            Map View
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme.text.secondary }]}>
            {filteredGyms.length} gyms in {selectedLocation} • Location View
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
  },
  header: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  callout: {
    width: 200,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 0,
  },
  calloutContent: {
    padding: 12,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
    color: '#2D3748',
  },
  calloutAddress: {
    fontSize: 12,
    color: '#4A5568',
    marginBottom: 6,
  },
  calloutSession: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 4,
  },
  calloutPricing: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
    marginBottom: 8,
  },
  calloutButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 8,
  },
  calloutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  calloutButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#007AFF',
    marginLeft: 4,
  },
  filterSection: {
    position: 'absolute',
    top: 120,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  filterContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 60,
    alignItems: 'center',
  },
  filterPillText: {
    fontSize: 14,
    fontWeight: '500',
  },
  locationListContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  locationListHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  locationListTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
  },
  locationList: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 16,
    textAlign: 'center',
  },
  locationItem: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  locationItemContent: {
    flex: 1,
  },
  locationItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationItemTitle: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  heartButton: {
    padding: 4,
  },
  heartIcon: {
    fontSize: 20,
    color: '#EF4444',
  },
  locationItemAddress: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  locationItemSession: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  locationItemPricing: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  locationItemActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#007AFF',
    marginLeft: 4,
  },
});

export default MapViewScreen; 