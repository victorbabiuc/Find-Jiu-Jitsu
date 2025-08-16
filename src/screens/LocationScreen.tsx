import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { useFindNavigation } from '../navigation/useNavigation';
import { beltColors, haptics } from '../utils';
import { useLoading } from '../context';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { SearchService, githubDataService } from '../services';
import { OpenMat, OpenMatSession, GymSearchResult } from '../types';

const LocationScreen: React.FC = () => {
  const { theme } = useTheme();
  const { userBelt, setSelectedLocation } = useApp();
  const navigation = useFindNavigation();
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GymSearchResult>({ cities: [], gyms: [] });
  const [allGyms, setAllGyms] = useState<OpenMat[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { showLoading, hideLoading } = useLoading();

  const beltColor = beltColors[userBelt];

  // Load gym data on component mount
  useEffect(() => {
    const loadGymData = async () => {
      try {
        const [tampaGyms, austinGyms] = await Promise.all([
          githubDataService.getGymData('tampa'),
          githubDataService.getGymData('austin'),
        ]);
        setAllGyms([...tampaGyms, ...austinGyms]);
      } catch (error) {
        console.error('Error loading gym data:', error);
      }
    };

    loadGymData();
  }, []);

  const requestLocationPermission = async (): Promise<boolean> => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  };

  const getCurrentLocation = async (): Promise<Location.LocationObject | null> => {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      return location;
    } catch (error) {
      console.error('Error getting current location:', error);
      return null;
    }
  };

  const reverseGeocode = async (latitude: number, longitude: number): Promise<string> => {
    try {
      const results = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (results.length > 0) {
        const result = results[0];
        const city = result.city || result.subregion || result.region || 'Unknown City';
        const state = result.region || '';
        return state ? `${city}, ${state}` : city;
      }
      return 'Unknown Location';
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      return 'Unknown Location';
    }
  };

  const handleNearMe = async () => {
    haptics.medium(); // Medium haptic for location action
    setIsLoadingLocation(true);
    showLoading();
    try {
      const hasPermission = await requestLocationPermission();

      if (!hasPermission) {
        Alert.alert(
          'Location Permission Required',
          'To find open mats near you, we need access to your location. Please enable location permissions in your device settings.',
          [
            { text: 'OK', style: 'default' },
            { text: 'Settings', onPress: () => Location.requestForegroundPermissionsAsync() },
          ]
        );
        setIsLoadingLocation(false);
        hideLoading();
        return;
      }

      const location = await getCurrentLocation();

      if (!location) {
        Alert.alert(
          'Location Error',
          'Unable to get your current location. Please try again or select a location manually.',
          [{ text: 'OK', style: 'default' }]
        );
        setIsLoadingLocation(false);
        hideLoading();
        return;
      }

      const locationName = await reverseGeocode(
        location.coords.latitude,
        location.coords.longitude
      );
      setSelectedLocation(locationName);
      // Navigate immediately - loading will be hidden by navigation state listener
      navigation.navigate('TimeSelection');
    } catch (error) {
      console.error('Location error:', error);
      Alert.alert(
        'Location Error',
        'Something went wrong while getting your location. Please try again or select a location manually.',
        [{ text: 'OK', style: 'default' }]
      );
      hideLoading();
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handleLocationSelect = (location: string) => {
    haptics.medium(); // Medium haptic for location selection
    setSelectedLocation(location);
    showLoading();
    // Navigate immediately - loading will be hidden by navigation state listener
    navigation.navigate('TimeSelection');
  };

  const CityButton: React.FC<{ city: { name: string; count: number } }> = ({ city }) => (
    <TouchableOpacity
      style={[styles.cityButton, { backgroundColor: theme.surface }]}
      onPress={() => handleLocationSelect(city.name)}
    >
      <View style={styles.cityButtonContent}>
        <Text style={[styles.cityName, { color: theme.text.primary }]}>{city.name}</Text>
        <Text style={[styles.cityCount, { color: theme.text.secondary }]}>{city.count} gyms</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={theme.text.secondary} />
    </TouchableOpacity>
  );

  const GymQuickCard: React.FC<{ gym: OpenMat }> = ({ gym }) => (
    <TouchableOpacity
      style={[styles.gymCard, { backgroundColor: theme.surface }]}
      onPress={() => {
        haptics.light(); // Light haptic for gym selection
        // Navigate to results with this gym pre-selected
        setSelectedLocation(gym.address.includes('Tampa') ? 'Tampa, FL' : 'Austin, TX');
        showLoading();
        navigation.navigate('TimeSelection');
      }}
    >
      <View style={styles.gymCardContent}>
        <Text style={[styles.gymName, { color: theme.text.primary }]}>{gym.name}</Text>
        <Text style={[styles.gymAddress, { color: theme.text.secondary }]}>{gym.address}</Text>
        <Text style={[styles.gymSessions, { color: theme.text.secondary }]}>
          {gym.openMats.length} session{gym.openMats.length !== 1 ? 's' : ''}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={theme.text.secondary} />
    </TouchableOpacity>
  );

  const handleSearch = async (text: string) => {
    setSearchQuery(text);

    if (text.trim().length === 0) {
      setSearchResults({ cities: [], gyms: [] });
      return;
    }

    setIsSearching(true);
    try {
      const lowerText = text.toLowerCase();

      // Search for cities
      const cities: Array<{ name: string; count: number }> = [];
      if (
        lowerText.includes('tampa') ||
        lowerText.includes('fl') ||
        lowerText.includes('florida')
      ) {
        const tampaGyms = allGyms.filter(gym => gym.address.toLowerCase().includes('tampa'));
        cities.push({ name: 'Tampa, FL', count: tampaGyms.length });
      }
      if (lowerText.includes('austin') || lowerText.includes('tx') || lowerText.includes('texas')) {
        const austinGyms = allGyms.filter(gym => gym.address.toLowerCase().includes('austin'));
        cities.push({ name: 'Austin, TX', count: austinGyms.length });
      }

      // Search for gyms
      const gyms = SearchService.searchGyms(text, allGyms);

      setSearchResults({ cities, gyms });
      console.log('Search results:', { cities, gyms });
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults({ cities: [], gyms: [] });
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddCityPress = () => {
    if (searchQuery.trim()) {
      handleSearch(searchQuery);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Belt Status Bar */}
      <LinearGradient
        colors={[beltColor.primary, beltColor.secondary]}
        style={styles.beltStatusBar}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      />

      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 20,
          paddingTop: 24,
          paddingBottom: 12,
        }}
      >
        <Text style={{ fontSize: 22, fontWeight: '700', color: theme.text.primary }}>Location</Text>
        <TouchableOpacity
          onPress={() => {
            Alert.alert(
              'Send us your suggestions!',
              'glootieapp@gmail.com\n\nTap Copy to copy the email address and send us your feedback!',
              [
                {
                  text: 'Copy',
                  onPress: () => Clipboard.setStringAsync('glootieapp@gmail.com'),
                },
                { text: 'Cancel', style: 'cancel' },
              ]
            );
          }}
          accessibilityLabel="Send Suggestions"
        >
          <Ionicons name="mail-outline" size={26} color={theme.text.secondary} />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Search Input */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons
              name="search-outline"
              size={20}
              color={theme.text.secondary}
              style={styles.searchIcon}
            />
            <TextInput
              placeholder="Search for a city or gym"
              value={searchQuery}
              onChangeText={handleSearch}
              onSubmitEditing={() => handleAddCityPress()}
              returnKeyType="search"
              style={[
                styles.searchInput,
                {
                  backgroundColor: theme.surface,
                  color: theme.text.primary,
                  borderColor: theme.text.secondary,
                },
              ]}
              placeholderTextColor={theme.text.secondary}
            />
            {searchQuery.trim() && (
              <TouchableOpacity style={styles.searchButton} onPress={handleAddCityPress}>
                <Ionicons name="search" size={24} color={theme.text.secondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Search Results */}
        {(searchResults.cities.length > 0 || searchResults.gyms.length > 0) && (
          <View style={styles.searchResultsContainer}>
            {isSearching && (
              <View style={styles.searchingContainer}>
                <ActivityIndicator size="small" color={theme.text.secondary} />
                <Text style={[styles.searchingText, { color: theme.text.secondary }]}>
                  Searching...
                </Text>
              </View>
            )}

            {/* City Results */}
            {searchResults.cities.length > 0 && (
              <View style={styles.resultsSection}>
                <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>Cities</Text>
                {searchResults.cities.map((city, index) => (
                  <CityButton key={`city-${index}`} city={city} />
                ))}
              </View>
            )}

            {/* Gym Results */}
            {searchResults.gyms.length > 0 && (
              <View style={styles.resultsSection}>
                <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>Gyms</Text>
                {searchResults.gyms.map((gym, index) => (
                  <GymQuickCard key={`gym-${gym.id || index}`} gym={gym} />
                ))}
              </View>
            )}
          </View>
        )}

        <View style={styles.locationOptions}>
          {/* Near Me Button */}
          <TouchableOpacity
            style={[styles.locationButton, { backgroundColor: theme.surface }]}
            onPress={handleNearMe}
            disabled={isLoadingLocation}
          >
            <LinearGradient
              colors={[beltColor.primary, beltColor.secondary]}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {isLoadingLocation ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator color={beltColor.textOnColor} size="small" />
                  <Text
                    style={[styles.buttonText, { color: beltColor.textOnColor, marginLeft: 8 }]}
                  >
                    Getting location...
                  </Text>
                </View>
              ) : (
                <>
                  <Text style={[styles.locationIcon, { color: beltColor.textOnColor }]}>📍</Text>
                  <Text style={[styles.buttonText, { color: beltColor.textOnColor }]}>Near Me</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Tampa, FL Button */}
          <TouchableOpacity
            style={[styles.locationButton, { backgroundColor: theme.surface }]}
            onPress={() => handleLocationSelect('Tampa, FL')}
          >
            <View style={styles.buttonContent}>
              <Text style={[styles.locationIcon, { color: theme.text.primary }]}>🏢</Text>
              <Text style={[styles.buttonText, { color: theme.text.primary }]}>Tampa, FL</Text>
            </View>
          </TouchableOpacity>

          {/* Austin, TX Button */}
          <TouchableOpacity
            style={[styles.locationButton, { backgroundColor: theme.surface }]}
            onPress={() => handleLocationSelect('Austin, TX')}
          >
            <View style={styles.buttonContent}>
              <Text style={[styles.locationIcon, { color: theme.text.primary }]}>🏢</Text>
              <Text style={[styles.buttonText, { color: theme.text.primary }]}>Austin, TX</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Info Text */}
        <View style={styles.infoContainer}>
          <Text style={[styles.infoText, { color: theme.text.secondary }]}>
            Select your preferred location to find open mats nearby
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  beltStatusBar: {
    height: 1,
    width: '100%',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    flex: 1,
  },

  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  searchContainer: {
    marginBottom: 24,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  searchIcon: {
    position: 'absolute',
    left: 12,
    zIndex: 1,
  },
  searchButton: {
    position: 'absolute',
    right: 12,
    padding: 8,
  },
  searchInput: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingLeft: 44, // Extra padding for the search icon
    fontSize: 16,
    fontWeight: '500',
  },
  searchResultsContainer: {
    marginBottom: 24,
  },
  searchingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  searchingText: {
    marginLeft: 8,
    fontSize: 14,
  },
  resultsSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  cityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cityButtonContent: {
    flex: 1,
  },
  cityName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  cityCount: {
    fontSize: 14,
  },
  gymCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  gymCardContent: {
    flex: 1,
  },
  gymName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  gymAddress: {
    fontSize: 14,
    marginBottom: 2,
  },
  gymSessions: {
    fontSize: 12,
  },
  locationOptions: {
    gap: 16,
    marginBottom: 32,
  },
  locationButton: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  buttonGradient: {
    paddingVertical: 20,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  buttonContent: {
    paddingVertical: 20,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  infoContainer: {
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default LocationScreen;
