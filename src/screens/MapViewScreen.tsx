import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Linking,
  Platform,
  Dimensions,
} from 'react-native';
import MapView, { Marker, Callout, Region } from 'react-native-maps';
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

const MapViewScreen: React.FC<MapViewScreenProps> = ({ route, navigation }) => {
  const { theme } = useTheme();
  const { selectedLocation, favorites, toggleFavorite } = useApp();
  const { showTransitionalLoading } = useLoading();
  
  const [gyms, setGyms] = useState<OpenMat[]>([]);
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [loading, setLoading] = useState(true);
  const [mapRegion, setMapRegion] = useState<Region>({
    latitude: 27.9478, // Tampa default
    longitude: -82.4588,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  });

  const mapRef = useRef<MapView>(null);

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
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={mapRegion}
        showsUserLocation={true}
        showsMyLocationButton={true}
        showsCompass={true}
        showsScale={true}
      >
        {gyms.map((gym) => {
          // Try to get coordinates from address (simplified fallback)
          const coordinates = getCoordinatesFromAddress(gym.address);
          
          // Skip gyms without coordinates for now
          if (!coordinates) return null;

          return (
            <Marker
              key={gym.id}
              coordinate={coordinates}
              title={gym.name}
              description={gym.address}
              onCalloutPress={() => haptics.light()}
            >
              <Callout style={styles.callout}>
                <View style={styles.calloutContent}>
                  <Text style={styles.calloutTitle}>{gym.name}</Text>
                  <Text style={styles.calloutAddress}>{gym.address}</Text>
                  
                  {gym.openMats && gym.openMats.length > 0 && (
                    <Text style={styles.calloutSession}>
                      {gym.openMats[0].day} {gym.openMats[0].time}
                    </Text>
                  )}
                  
                  <Text style={styles.calloutPricing}>
                    {gym.matFee === 0 ? 'Free' : `$${gym.matFee}`}
                  </Text>
                  
                  <View style={styles.calloutButtons}>
                    <TouchableOpacity
                      style={styles.calloutButton}
                      onPress={() => handleGymPress(gym)}
                    >
                      <Ionicons name="information-circle" size={16} color="#007AFF" />
                      <Text style={styles.calloutButtonText}>Details</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={styles.calloutButton}
                      onPress={() => handleDirections(gym)}
                    >
                      <Ionicons name="navigate" size={16} color="#007AFF" />
                      <Text style={styles.calloutButtonText}>Directions</Text>
                    </TouchableOpacity>
                    
                    {gym.website && (
                      <TouchableOpacity
                        style={styles.calloutButton}
                        onPress={() => handleWebsite(gym)}
                      >
                        <Ionicons name="globe" size={16} color="#007AFF" />
                        <Text style={styles.calloutButtonText}>Website</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </Callout>
            </Marker>
          );
        })}
      </MapView>
      
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
            {gyms.length} gyms in {selectedLocation}
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
});

export default MapViewScreen; 