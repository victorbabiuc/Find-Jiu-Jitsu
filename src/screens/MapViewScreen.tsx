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
import MapView, { Marker, Callout, Region } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { useLoading } from '../context/LoadingContext';
import { OpenMat } from '../types';
import { FindStackRouteProp, FindStackNavigationProp } from '../navigation/types';
import { haptics, animations } from '../utils';
import { apiService } from '../services/api.service';
import { githubDataService } from '../services/github-data.service';

interface MapViewScreenProps {
  route: FindStackRouteProp<'MapView'>;
  navigation: FindStackNavigationProp;
}

// Filter interface to match ResultsScreen
interface ActiveFilters {
  gi: boolean;
  nogi: boolean;
  price: 'free' | null;
}

const MapViewScreen: React.FC<MapViewScreenProps> = ({ route, navigation }) => {
  console.log('🔍 MapViewScreen: Component rendering');
  
  const { theme } = useTheme();
  const { selectedLocation, favorites, toggleFavorite } = useApp();
  const { showTransitionalLoading, hideTransitionalLoading } = useLoading();
  
  const [gyms, setGyms] = useState<OpenMat[]>([]);
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);

  const [mapRegion, setMapRegion] = useState<Region>({
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

  const mapRef = useRef<MapView>(null);

  // Get user location
  useEffect(() => {
    console.log('🔍 MapViewScreen: Getting user location');
    const getUserLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        console.log('🔍 MapViewScreen: Location permission status:', status);
        if (status === 'granted') {
          const location = await Location.getCurrentPositionAsync({});
          console.log('🔍 MapViewScreen: User location obtained:', location.coords);
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
        console.log('🔍 MapViewScreen: Location permission denied or error:', error);
      }
    };

    getUserLocation();
  }, []);

  // Load gym data
  useEffect(() => {
    console.log('🔍 MapViewScreen: Loading gym data for:', selectedLocation);
    const fetchGymData = async () => {
      try {
        // Show loading when fetch starts
        showTransitionalLoading('Loading map data...', 2000);
        
        // Determine city from location string
        const city = selectedLocation.toLowerCase().includes('austin') ? 'austin' : 
                     selectedLocation.toLowerCase().includes('tampa') ? 'tampa' : 'tampa';
        
        console.log('🔍 MapViewScreen: Fetching data for city:', city);
        
        // Force refresh data from GitHub
        if (city === 'tampa') {
          await githubDataService.forceRefreshTampaData();
        } else {
          await githubDataService.refreshData(city);
        }
        
        // Get gym data
        const gymData = await apiService.getOpenMats(city);
        console.log('🔍 MapViewScreen: Gym data loaded:', gymData.length, 'gyms');
        console.log('🔍 MapViewScreen: Sample gym with coordinates:', gymData.find(g => g.coordinates));
        console.log('🔍 MapViewScreen: First gym data structure:', JSON.stringify(gymData[0], null, 2));
        setGyms(gymData);
        
        // Center map on selected city
        if (city === 'tampa') {
          setMapRegion({
            latitude: 27.9478,
            longitude: -82.4588,
            latitudeDelta: 0.1,
            longitudeDelta: 0.1,
          });
        } else if (city === 'austin') {
          setMapRegion({
            latitude: 30.2672,
            longitude: -97.7431,
            latitudeDelta: 0.1,
            longitudeDelta: 0.1,
          });
        }
        
      } catch (error) {
        console.error('🔍 MapViewScreen: Error fetching gym data:', error);
      } finally {
        // Hide loading when done
        hideTransitionalLoading();
      }
    };

    fetchGymData();
  }, [selectedLocation]);

  // Update map region when it changes
  useEffect(() => {
    console.log('🔍 MapViewScreen: Map region updated:', mapRegion);
    if (mapRef.current && mapRegion) {
      mapRef.current.animateToRegion(mapRegion, 1000);
    }
  }, [mapRegion]);

  // Filter and sort gyms (matching ResultsScreen logic)
  const filteredGyms = useMemo(() => {
    let filtered = [...gyms];

    // Apply Gi/No-Gi filters
    if (activeFilters.gi || activeFilters.nogi) {
      filtered = filtered.filter(gym => {
        if (!gym.openMats || gym.openMats.length === 0) return false;
        
        return gym.openMats.some(session => {
          const sessionType = session.type.toLowerCase();
          if (activeFilters.gi && (sessionType.includes('gi') || sessionType.includes('both'))) {
            return true;
          }
          if (activeFilters.nogi && (sessionType.includes('nogi') || sessionType.includes('both'))) {
            return true;
          }
          return false;
        });
      });
    }

    // Apply price filter
    if (activeFilters.price === 'free') {
      filtered = filtered.filter(gym => gym.matFee === 0);
    }

    // Sort by distance (for now, just keep original order)
    console.log('🔍 MapViewScreen: Filtered gyms:', filtered.length, 'gyms');
    return filtered;
  }, [gyms, activeFilters]);

  // Helper function to get minutes from time string
  const getMinutesFromTime = (timeStr: string): number => {
    const time = timeStr.toLowerCase().replace(/\s/g, '');
    const isPM = time.includes('pm');
    let [hours, minutes] = time.replace(/[ap]m/g, '').split(':').map(Number);
    
    if (isPM && hours !== 12) hours += 12;
    if (!isPM && hours === 12) hours = 0;
    
    return hours * 60 + (minutes || 0);
  };

  // Helper function to get coordinates from address (placeholder)
  const getCoordinatesFromAddress = (address: string): { latitude: number; longitude: number } | null => {
    // This would normally use a geocoding service
    // For now, return null to use pre-stored coordinates
    return null;
  };

  // City center coordinates for validation
  const CITY_CENTERS = {
    'Tampa': { latitude: 27.9506, longitude: -82.4572 },
    'Austin': { latitude: 30.2672, longitude: -97.7431 },
    'tampa': { latitude: 27.9506, longitude: -82.4572 },
    'austin': { latitude: 30.2672, longitude: -97.7431 }
  };

  // Validate coordinate ranges
  const validateCoordinateRanges = (latitude: number, longitude: number): boolean => {
    const isValidLat = latitude >= -90 && latitude <= 90;
    const isValidLng = longitude >= -180 && longitude <= 180;
    
    if (!isValidLat) {
      console.warn('⚠️ Coordinate Validation: Invalid latitude', latitude, 'for gym');
    }
    if (!isValidLng) {
      console.warn('⚠️ Coordinate Validation: Invalid longitude', longitude, 'for gym');
    }
    
    return isValidLat && isValidLng;
  };

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Validate coordinates for specific city (informational only)
  const validateCoordinatesForCity = (latitude: number, longitude: number, city: string, gymName: string): boolean => {
    const cityKey = city.toLowerCase();
    const cityCenter = (CITY_CENTERS as any)[cityKey];
    
    if (!cityCenter) {
      console.warn('⚠️ Coordinate Validation: Unknown city', city, 'for gym', gymName);
      return true; // Don't block unknown cities
    }

    const distance = calculateDistance(latitude, longitude, cityCenter.latitude, cityCenter.longitude);
    
    // Check if coordinates are reasonable for the city
    const isReasonableDistance = distance <= 50; // 50 miles max
    
    if (!isReasonableDistance) {
      console.warn('⚠️ Coordinate Validation: Gym', gymName, 'is', distance.toFixed(1), 'miles from', city, 'center');
      console.warn('⚠️ Coordinate Validation: Coordinates', latitude, longitude, 'seem too far from expected location');
    }

    // Check for coordinates that might be over water
    const isOverWater = checkIfOverWater(latitude, longitude, cityKey);
    if (isOverWater) {
      console.warn('⚠️ Coordinate Validation: Gym', gymName, 'coordinates', latitude, longitude, 'appear to be over water');
    }

    // Return true for all coordinates (non-blocking)
    return true;
  };

  // Check if coordinates might be over water (basic heuristic)
  const checkIfOverWater = (latitude: number, longitude: number, city: string): boolean => {
    // Basic water detection for Tampa Bay area
    if (city === 'tampa') {
      // Tampa Bay area water coordinates (approximate)
      const waterAreas = [
        { lat: 27.7, lng: -82.6, radius: 0.3 }, // Tampa Bay
        { lat: 27.8, lng: -82.5, radius: 0.2 }, // Hillsborough Bay
        { lat: 27.9, lng: -82.4, radius: 0.15 }, // Old Tampa Bay
      ];
      
      for (const area of waterAreas) {
        const distance = calculateDistance(latitude, longitude, area.lat, area.lng);
        if (distance < area.radius) {
          return true;
        }
      }
    }
    
    // Basic water detection for Austin area
    if (city === 'austin') {
      // Lake Travis and other water bodies (approximate)
      const waterAreas = [
        { lat: 30.4, lng: -97.9, radius: 0.2 }, // Lake Travis
        { lat: 30.2, lng: -97.7, radius: 0.1 }, // Lady Bird Lake
      ];
      
      for (const area of waterAreas) {
        const distance = calculateDistance(latitude, longitude, area.lat, area.lng);
        if (distance < area.radius) {
          return true;
        }
      }
    }
    
    return false;
  };

  // Comprehensive coordinate validation (informational only)
  const validateGymCoordinates = (latitude: number, longitude: number, gymName: string, city: string): void => {
    console.log('🔍 Coordinate Validation: Validating', gymName, 'at', latitude, longitude);
    
    // Step 1: Validate coordinate ranges
    const hasValidRanges = validateCoordinateRanges(latitude, longitude);
    if (!hasValidRanges) {
      console.warn('⚠️ Coordinate Validation: Invalid coordinate ranges for', gymName);
    }
    
    // Step 2: Validate for specific city
    const isValidForCity = validateCoordinatesForCity(latitude, longitude, city, gymName);
    if (!isValidForCity) {
      console.warn('⚠️ Coordinate Validation: Coordinates seem suspicious for', gymName, 'in', city);
    }
    
    if (hasValidRanges && isValidForCity) {
      console.log('✅ Coordinate Validation: Coordinates valid for', gymName);
    }
  };

  // Handle gym press
  const handleGymPress = (gym: OpenMat) => {
    haptics.light();
    // Navigate to gym details or show modal
    console.log('🔍 MapViewScreen: Gym pressed:', gym.name);
  };

  // Handle directions
  const handleDirections = (gym: OpenMat) => {
    haptics.light();
    const address = encodeURIComponent(gym.address);
    const url = Platform.OS === 'ios' 
      ? `http://maps.apple.com/?daddr=${address}`
      : `https://maps.google.com/?daddr=${address}`;
    
    Linking.openURL(url).catch(err => {
      console.error('Error opening directions:', err);
      Alert.alert('Error', 'Could not open directions');
    });
  };

  // Handle website
  const handleWebsite = (gym: OpenMat) => {
    haptics.light();
    if (gym.website) {
      Linking.openURL(gym.website).catch(err => {
        console.error('Error opening website:', err);
        Alert.alert('Error', 'Could not open website');
      });
    }
  };

  // Handle heart press
  const handleHeartPress = (gym: OpenMat) => {
    haptics.light();
    toggleFavorite(gym.id);
  };



  console.log('🔍 MapViewScreen: Rendering main component with', filteredGyms.length, 'gyms');

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={mapRegion}
        showsUserLocation={true}
        showsMyLocationButton={true}
        zoomEnabled={true}
        scrollEnabled={true}
        rotateEnabled={true}
        pitchEnabled={true}
        onMapReady={() => {
          console.log('🔍 MapViewScreen: Map is ready!');
        }}
        onPress={(e) => {
          console.log('🔍 MapViewScreen: Map pressed at:', e.nativeEvent.coordinate);
        }}
      >
        {/* Add gym markers if coordinates exist */}
        {filteredGyms.map((gym) => {
          console.log('🔍 MapViewScreen: Checking gym', gym.name, 'coordinates:', gym.coordinates, 'type:', typeof gym.coordinates);
          if (!gym.coordinates) {
            console.log('🔍 MapViewScreen: Gym', gym.name, 'has no coordinates');
            return null;
          }
          
          const [latitude, longitude] = gym.coordinates.split(',').map(Number);
          if (isNaN(latitude) || isNaN(longitude)) {
            console.log('🔍 MapViewScreen: Gym', gym.name, 'has invalid coordinates:', gym.coordinates);
            return null;
          }
          
          // Validate coordinates (informational only - don't block markers)
          validateGymCoordinates(latitude, longitude, gym.name, selectedLocation);
          
          console.log('🔍 MapViewScreen: Adding marker for', gym.name, 'at', latitude, longitude);
          
          return (
            <Marker
              key={gym.id}
              coordinate={{ latitude, longitude }}
              title={gym.name}
              description={gym.address}
              onPress={() => {
                haptics.light(); // Light haptic for marker selection
                console.log('🔍 MapViewScreen: Gym marker pressed:', gym.name);
              }}
            />
          );
        })}
      </MapView>

      {/* Simple Header */}
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
            {filteredGyms.length} gyms in {selectedLocation}
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
    padding: 12,
    marginRight: 12,
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
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
});

export default MapViewScreen; 