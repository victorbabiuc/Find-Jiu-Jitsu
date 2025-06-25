import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { useDashboardNavigation } from '../navigation/useNavigation';
import { beltColors } from '../utils/constants';

const LocationScreen: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { userBelt, setSelectedLocation } = useApp();
  const navigation = useDashboardNavigation();
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  
  const beltColor = beltColors[userBelt];

  // Debug logging
  console.log('LocationScreen rendered');
  console.log('User belt:', userBelt);

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
    console.log('Near Me button pressed');
    setIsLoadingLocation(true);
    
    try {
      const hasPermission = await requestLocationPermission();
      
      if (!hasPermission) {
        console.log('Location permission denied');
        Alert.alert(
          'Location Permission Required',
          'To find open mats near you, we need access to your location. Please enable location permissions in your device settings.',
          [
            { text: 'OK', style: 'default' },
            { text: 'Settings', onPress: () => Location.requestForegroundPermissionsAsync() }
          ]
        );
        setIsLoadingLocation(false);
        return;
      }

      const location = await getCurrentLocation();
      
      if (!location) {
        console.log('Failed to get current location');
        Alert.alert(
          'Location Error',
          'Unable to get your current location. Please try again or select a location manually.',
          [{ text: 'OK', style: 'default' }]
        );
        setIsLoadingLocation(false);
        return;
      }

      const locationName = await reverseGeocode(location.coords.latitude, location.coords.longitude);
      console.log('Location selected (Near Me):', locationName);
      setSelectedLocation(locationName);
      console.log('Navigating to TimeSelection screen');
      navigation.navigate('TimeSelection');
      
    } catch (error) {
      console.error('Location error:', error);
      Alert.alert(
        'Location Error',
        'Something went wrong while getting your location. Please try again or select a location manually.',
        [{ text: 'OK', style: 'default' }]
      );
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handleLocationSelect = (location: string) => {
    console.log('Location selected:', location);
    setSelectedLocation(location);
    console.log('Navigating to TimeSelection screen');
    navigation.navigate('TimeSelection');
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
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.text.primary }]}>
          Where do you want to train?
        </Text>
        
        {/* Theme Toggle */}
        <TouchableOpacity
          style={[styles.themeToggle, { backgroundColor: theme.surface }]}
          onPress={toggleTheme}
          activeOpacity={0.7}
        >
          <Text style={[styles.themeToggleText, { color: theme.text.secondary }]}>
            {theme.name === 'dark' ? '☀️' : '🌙'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
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
                  <Text style={[styles.buttonText, { color: beltColor.textOnColor, marginLeft: 8 }]}>
                    Getting location...
                  </Text>
                </View>
              ) : (
                <>
                  <Text style={[styles.locationIcon, { color: beltColor.textOnColor }]}>
                    📍
                  </Text>
                  <Text style={[styles.buttonText, { color: beltColor.textOnColor }]}>
                    Near Me
                  </Text>
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
              <Text style={[styles.locationIcon, { color: theme.text.primary }]}>
                🏢
              </Text>
              <Text style={[styles.buttonText, { color: theme.text.primary }]}>
                Tampa, FL
              </Text>
            </View>
          </TouchableOpacity>

          {/* Austin, TX Button */}
          <TouchableOpacity
            style={[styles.locationButton, { backgroundColor: theme.surface }]}
            onPress={() => handleLocationSelect('Austin, TX')}
          >
            <View style={styles.buttonContent}>
              <Text style={[styles.locationIcon, { color: theme.text.primary }]}>
                🏢
              </Text>
              <Text style={[styles.buttonText, { color: theme.text.primary }]}>
                Austin, TX
              </Text>
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
  themeToggle: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  themeToggleText: {
    fontSize: 18,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
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