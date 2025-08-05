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
import MapView, { Marker, Callout, Region, Circle } from 'react-native-maps';
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
  
  const { theme } = useTheme();
  const { selectedLocation, favorites, toggleFavorite } = useApp();
  const { showTransitionalLoading, hideTransitionalLoading } = useLoading();
  
  // Get parameters from navigation route
  const { location, locationText, radius } = route.params || {};
  
  // Determine center location based on selected city
  const getCenterLocation = () => {
    if (locationText?.toLowerCase().includes('miami')) {
      return { latitude: 25.7617, longitude: -80.1918 }; // Miami downtown
    } else if (locationText?.toLowerCase().includes('austin')) {
      return { latitude: 30.2672, longitude: -97.7431 }; // Austin downtown
    } else if (locationText?.toLowerCase().includes('st. petersburg')) {
      return { latitude: 27.7731, longitude: -82.6400 }; // St. Petersburg downtown
    } else {
      return { latitude: 27.9506, longitude: -82.4572 }; // Tampa downtown (default)
    }
  };
  
  const centerLocation = location || getCenterLocation();
  const radiusInMiles = radius || 15;
  
  // Calculate delta based on radius
  const getDeltaForRadius = (radiusMiles: number): number => {
    switch (radiusMiles) {
      case 5: return 0.12;
      case 10: return 0.24;
      case 15: return 0.36;
      default: return 0.24; // Default for 10 miles
    }
  };
  
  const [gyms, setGyms] = useState<OpenMat[]>([]);
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);

  const [mapRegion, setMapRegion] = useState<Region>({
    latitude: centerLocation.latitude,
    longitude: centerLocation.longitude,
    latitudeDelta: getDeltaForRadius(radiusInMiles),
    longitudeDelta: getDeltaForRadius(radiusInMiles),
  });
  
  // Filter state (matching ResultsScreen)
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({
    gi: false,
    nogi: false,
    price: null,
  });

  const mapRef = useRef<MapView>(null);

  // Simple coordinate parsing function
  const parseCoordinates = (coordinateString: string): { latitude: number; longitude: number } | null => {
    try {
      const [lat, lng] = coordinateString.split(',').map(coord => parseFloat(coord.trim()));
      if (isNaN(lat) || isNaN(lng)) {
        return null;
      }
      return { latitude: lat, longitude: lng };
    } catch (error) {
      return null;
    }
  };

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
          // Silent fail for location permission
        }
    };

    getUserLocation();
  }, []);

  // Load gym data
  useEffect(() => {
    const fetchGymData = async () => {
      try {
        // Show loading when fetch starts
        showTransitionalLoading('Loading map data...', 2000);
        
        // Determine city from location string
        console.log('🔍 MapViewScreen: selectedLocation:', selectedLocation);
        const city = selectedLocation.toLowerCase().includes('austin') ? 'austin' : 
                     selectedLocation.toLowerCase().includes('miami') ? 'miami' : 
                     selectedLocation.toLowerCase().includes('st. petersburg') ? 'stpete' : 
                     selectedLocation.toLowerCase().includes('tampa') ? 'tampa' : 'tampa';
        console.log('🔍 MapViewScreen: Determined city:', city);
        
        // For Tampa Bay area, load both Tampa and St Pete data
        let allGymData = [];
        
        if (city === 'tampa' || city === 'stpete') {
          console.log('🔍 MapViewScreen: Loading Tampa Bay area data (Tampa + St Pete)');
          
          // Load Tampa data
          await githubDataService.forceRefreshTampaData();
          const tampaData = await apiService.getOpenMats('tampa', undefined, true);
          console.log('🔍 MapViewScreen: Loaded Tampa data:', tampaData.length, 'gyms');
          
          // Load St Pete data
          await githubDataService.forceRefreshStPeteData();
          const stpeteData = await apiService.getOpenMats('stpete', undefined, true);
          console.log('🔍 MapViewScreen: Loaded St Pete data:', stpeteData.length, 'gyms');
          
          // Combine the data
          allGymData = [...tampaData, ...stpeteData];
          console.log('🔍 MapViewScreen: Combined Tampa Bay data:', allGymData.length, 'gyms');
        } else {
          // For other cities, load single city data
          if (city === 'miami') {
            await githubDataService.forceRefreshMiamiData();
          } else if (city === 'austin') {
            await githubDataService.refreshData('austin');
          }
          
          allGymData = await apiService.getOpenMats(city, undefined, true);
          console.log('🔍 MapViewScreen: Loaded single city data:', allGymData.length, 'gyms');
        }
        
        setGyms(allGymData);
        console.log('🔍 MapViewScreen: Final gym data:', allGymData.length, 'gyms');
        console.log('🔍 MapViewScreen: Gym names:', allGymData.map(g => g.name));
        
        // Don't override map region - keep the one set from route parameters
        
              } catch (error) {
          // Silent fail for gym data loading
        } finally {
        // Hide loading when done
        hideTransitionalLoading();
      }
    };

    fetchGymData();
  }, [selectedLocation]);

  // Update map region when it changes
  useEffect(() => {
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
    console.log('🔍 MapViewScreen: Active filters:', activeFilters);
    console.log('🔍 MapViewScreen: First few gyms:', filtered.slice(0, 3).map(g => ({ name: g.name, coordinates: g.coordinates })));
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
    
    // Check for coordinates that might be over water
    const isOverWater = checkIfOverWater(latitude, longitude, cityKey);
    
    // Only log critical issues
    if (!isReasonableDistance || isOverWater) {
      console.warn('⚠️ Coordinate issue detected for', gymName);
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

  // Simple coordinate validation for Tampa area
  const validateGymCoordinates = (latitude: number, longitude: number, gymName: string, city: string): void => {
    const issues: string[] = [];
    
    // Check if coordinates are valid numbers
    if (isNaN(latitude) || isNaN(longitude)) {
      issues.push('Invalid coordinate format');
    }
    
    // Check latitude bounds for Tampa area (27.5 to 28.5)
    if (latitude < 27.5 || latitude > 28.5) {
      issues.push('Latitude outside Tampa area bounds');
    }
    
    // Check longitude bounds for Tampa area (-83.0 to -82.0)
    if (longitude < -83.0 || longitude > -82.0) {
      issues.push('Longitude outside Tampa area bounds');
    }
    
    const isValid = issues.length === 0;
    
    // Only log critical validation issues
    if (!isValid && issues.length > 0) {
      console.warn('⚠️ Coordinate validation issue for', gymName, ':', issues.join(', '));
    }
  };

  // Handle gym press
  const handleGymPress = (gym: OpenMat) => {
    haptics.light();
    // Navigate to gym details or show modal
  };

  // Handle directions
  const handleDirections = (gym: OpenMat) => {
    haptics.light();
    const address = encodeURIComponent(gym.address);
    const url = Platform.OS === 'ios' 
      ? `maps://app?daddr=${address}`
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





  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        region={mapRegion}
        showsUserLocation={true}
        showsMyLocationButton={true}
        zoomEnabled={true}
        scrollEnabled={true}
        rotateEnabled={true}
        pitchEnabled={true}
        onMapReady={() => {
          console.log('🔍 MapViewScreen: Map is ready!');
          console.log('🔍 MapViewScreen: Center location:', centerLocation);
          console.log('🔍 MapViewScreen: Radius:', radiusInMiles, 'miles');
        }}
        onPress={(e) => {
          console.log('🔍 MapViewScreen: Map pressed at:', e.nativeEvent.coordinate);
        }}
      >
        {/* Radius Circle */}
        <Circle
          center={centerLocation}
          radius={radiusInMiles * 1609.34} // Convert miles to meters
          fillColor="rgba(96, 121, 138, 0.1)"
          strokeColor="rgba(96, 121, 138, 0.3)"
          strokeWidth={2}
        />

        {/* Center Location Marker */}
        <Marker
          coordinate={centerLocation}
          title={locationText || 'Selected Location'}
          pinColor="#60798A"
        />

        {/* Add gym markers if coordinates exist */}
        {console.log('🔍 MapViewScreen: Rendering', filteredGyms.length, 'gym markers')}
        {filteredGyms.map((gym) => {
          console.log('🔍 MapViewScreen: Checking gym', gym.name, 'coordinates:', gym.coordinates, 'type:', typeof gym.coordinates);
          if (!gym.coordinates) {
            console.log('🔍 MapViewScreen: Gym', gym.name, 'has no coordinates');
            return null;
          }
          
          const coords = parseCoordinates(gym.coordinates);
          if (!coords) {
            console.log('🔍 MapViewScreen: Gym', gym.name, 'has invalid coordinates:', gym.coordinates);
            return null;
          }
          
          const { latitude, longitude } = coords;
          
          // Validate coordinates (informational only - don't block markers)
          validateGymCoordinates(latitude, longitude, gym.name, selectedLocation);
          
          console.log('🔍 MapViewScreen: Adding marker for', gym.name, 'at', latitude, longitude);
          
          return (
            <Marker
              key={gym.id}
              coordinate={{ latitude, longitude }}
              title={gym.name}
              onPress={() => {
                haptics.light(); // Light haptic for marker selection
                console.log('🔍 MapViewScreen: Gym marker pressed:', gym.name);
              }}
            >
              <Callout
                onPress={() => handleDirections(gym)}
                tooltip={false}
              >
                <View style={styles.calloutContainer}>
                  <Text style={styles.calloutTitle}>{gym.name}</Text>
                  <TouchableOpacity onPress={() => handleDirections(gym)}>
                    <Text style={styles.calloutAddress}>📍 {gym.address}</Text>
                    <Text style={styles.calloutHint}>Tap for directions</Text>
                  </TouchableOpacity>
                </View>
              </Callout>
            </Marker>
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
            {filteredGyms.length} gyms • {locationText || 'Tampa Downtown'} • {radiusInMiles}mi radius
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
  calloutContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111518',
    marginBottom: 4,
  },
  calloutAddress: {
    fontSize: 14,
    fontWeight: '500',
    color: '#60798A',
    textDecorationLine: 'underline',
  },
  calloutHint: {
    fontSize: 12,
    fontWeight: '400',
    color: '#9CA3AF',
    marginTop: 2,
    fontStyle: 'italic',
  },
});

export default MapViewScreen; 