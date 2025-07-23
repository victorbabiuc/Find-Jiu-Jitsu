import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  Alert,
  Linking,
  Share,
  FlatList,
  Image, // <-- Add Image import
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { useMainTabNavigation } from '../navigation/useNavigation';
import { beltColors } from '../utils/constants';

import { SafeAreaView as SafeAreaViewRN } from 'react-native-safe-area-context';


import appIcon from '../../assets/icon.png'; // <-- Import app icon
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';

const { width } = Dimensions.get('window');

// TODO: v2.0 - Replace with user's home gym info

const DashboardScreen: React.FC = () => {
  const { user, isAuthenticated, signOut } = useAuth();
  const { theme } = useTheme();
  const { userBelt, selectedLocation, setSelectedLocation, favorites, toggleFavorite } = useApp();
  const navigation = useMainTabNavigation();
  
  const beltColor = beltColors[userBelt];
  


  const handleQuickToday = () => {
    navigation.navigate('Find', { screen: 'TimeSelection' });
  };






  // Helper functions for gym card display
  const formatTimeRange = (sessionTime: string) => {
    // Check if the time already contains a range (has a dash/hyphen)
    if (sessionTime.includes('-') || sessionTime.includes('–')) {
      // It's already a time range, format it properly
      const parts = sessionTime.split(/[-–]/).map(part => part.trim());
      if (parts.length >= 2) {
        const startTime = formatSingleTime(parts[0]);
        const endTime = formatSingleTime(parts[1]);
        return `${startTime} - ${endTime}`;
      }
    }
    
    // It's a single time, add 1 hour
    const formattedStart = formatSingleTime(sessionTime);
    const endTime = addOneHour(sessionTime);
    return `${formattedStart} - ${endTime}`;
  };

  const formatSingleTime = (time: string) => {
    // Handle various time formats and standardize them
    const cleanTime = time.trim().toLowerCase();
    
    // Handle formats like "11am", "6pm", "5:00 PM", etc.
    let hour, minute = '00', period;
    
    // Match patterns like "11am", "6pm"
    const simpleMatch = cleanTime.match(/^(\d+)(am|pm)$/);
    if (simpleMatch) {
      hour = parseInt(simpleMatch[1]);
      period = simpleMatch[2].toUpperCase();
    } else {
      // Match patterns like "5:00 PM", "11:30 AM"
      const detailedMatch = cleanTime.match(/^(\d+):(\d+)\s*(am|pm)$/);
      if (detailedMatch) {
        hour = parseInt(detailedMatch[1]);
        minute = detailedMatch[2];
        period = detailedMatch[3].toUpperCase();
      } else {
        // Fallback - return as is
        return time;
      }
    }
    
    // Format consistently
    return `${hour}:${minute} ${period}`;
  };

  const addOneHour = (time: string) => {
    // Parse the time and add 1 hour
    const cleanTime = time.trim().toLowerCase();
    
    let hour, minute = '00', period;
    
    // Match patterns like "11am", "6pm"
    const simpleMatch = cleanTime.match(/^(\d+)(am|pm)$/);
    if (simpleMatch) {
      hour = parseInt(simpleMatch[1]);
      period = simpleMatch[2].toUpperCase();
    } else {
      // Match patterns like "5:00 PM", "11:30 AM"
      const detailedMatch = cleanTime.match(/^(\d+):(\d+)\s*(am|pm)$/);
      if (detailedMatch) {
        hour = parseInt(detailedMatch[1]);
        minute = detailedMatch[2];
        period = detailedMatch[3].toUpperCase();
      } else {
        // Fallback - return as is
        return time;
      }
    }
    
    // Add 1 hour
    hour += 1;
    
    // Handle 12-hour format
    if (hour === 13) hour = 1;
    if (hour === 12) {
      return `12:${minute} ${period === 'AM' ? 'PM' : 'AM'}`;
    }
    
    return `${hour}:${minute} ${period}`;
  };

  const getSessionTypeWithIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'gi':
        return 'Gi 🥋';
      case 'nogi':
        return 'No-Gi 👕';
      case 'both':
        return 'Gi & No-Gi 🥋👕';
      case 'mma':
      case 'mma sparring':
        return 'MMA Sparring 🥊';
      default:
        // For any other custom session types, preserve the original name
        return `${type} 🥋👕`;
    }
  };

  const handleHeartPress = (gym: OpenMat) => {
    toggleFavorite(gym.id);
  };

  // Add openWebsite and openDirections helpers
  const openWebsite = (url: string) => {
    if (url) Linking.openURL(url);
  };
  const openDirections = (address: string) => {
    if (!address || address === 'Tampa, FL' || address === 'Austin, TX') return;
    const url = `https://maps.apple.com/?q=${encodeURIComponent(address)}`;
    Linking.openURL(url);
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: '#FFFFFF' }]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Welcome Section */}
      <SafeAreaViewRN edges={['top']}>
        <View style={{ backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20, paddingTop: 24, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#E5E5E5' }}>
          <Text style={{ fontSize: 22, fontWeight: '700', color: theme.text.primary }}>Find Your Next Roll</Text>
        </View>
      </SafeAreaViewRN>

      {/* User Authentication Status */}
      {isAuthenticated && (
        <View style={styles.userSection}>
          <Text style={styles.welcomeText}>Welcome back!</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
          <View style={styles.userActions}>
            <TouchableOpacity onPress={signOut} style={styles.signOutButton}>
              <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
            <View style={styles.syncStatus}>
              <Text style={styles.syncText}>🔄 Favorites synced to cloud</Text>
            </View>
          </View>
        </View>
      )}

      {/* City Selection */}
      <View style={styles.section}>
        <View style={styles.logoContainer}>
          <Image source={appIcon} style={styles.logo} />
        </View>
        <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>
          Where do you want to train?
        </Text>
        
        {/* Search/Add City Card */}
        <TouchableOpacity
          style={[styles.cityCard, { backgroundColor: theme.surface }]}
          onPress={() => {
            // TODO: Implement city search functionality
            Alert.alert(
              'Coming Soon!',
              'City search functionality will be available in the next update.',
              [{ text: 'OK' }]
            );
          }}
        >
          <View style={styles.cityCardContent}>
            <Ionicons name="search" size={24} color={theme.text.secondary} />
            <View style={styles.cityCardText}>
              <Text style={[styles.cityCardTitle, { color: theme.text.primary }]}>
                Search for a city
              </Text>
              <Text style={[styles.cityCardSubtitle, { color: theme.text.secondary }]}>
                Add your city to find local gyms
              </Text>
            </View>
            <Ionicons name="add-circle-outline" size={24} color={theme.text.secondary} />
          </View>
        </TouchableOpacity>
        
        {/* Available Cities */}
        <View style={styles.citiesContainer}>
          <TouchableOpacity
            style={[
              styles.cityCard,
              { backgroundColor: theme.surface },
              selectedLocation === 'Tampa' && { backgroundColor: beltColor.primary }
            ]}
            onPress={() => {
              setSelectedLocation('Tampa');
              navigation.navigate('Find', { screen: 'TimeSelection' });
            }}
          >
            <View style={styles.cityCardContent}>
              <Text style={styles.cityEmoji}>🌴</Text>
              <View style={styles.cityCardText}>
                <Text style={[
                  styles.cityCardTitle,
                  { color: selectedLocation === 'Tampa' ? beltColor.textOnColor : theme.text.primary }
                ]}>
                  Tampa, FL
                </Text>
                <Text style={[
                  styles.cityCardSubtitle,
                  { color: selectedLocation === 'Tampa' ? beltColor.textOnColor : theme.text.secondary }
                ]}>
                  18 gyms available
                </Text>
              </View>
              <Ionicons 
                name="chevron-forward" 
                size={20} 
                color={selectedLocation === 'Tampa' ? beltColor.textOnColor : theme.text.secondary} 
              />
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.cityCard,
              { backgroundColor: theme.surface },
              selectedLocation === 'Austin' && { backgroundColor: beltColor.primary }
            ]}
            onPress={() => {
              setSelectedLocation('Austin');
              navigation.navigate('Find', { screen: 'TimeSelection' });
            }}
          >
            <View style={styles.cityCardContent}>
              <Text style={styles.cityEmoji}>🤠</Text>
              <View style={styles.cityCardText}>
                <Text style={[
                  styles.cityCardTitle,
                  { color: selectedLocation === 'Austin' ? beltColor.textOnColor : theme.text.primary }
                ]}>
                  Austin, TX
                </Text>
                <Text style={[
                  styles.cityCardSubtitle,
                  { color: selectedLocation === 'Austin' ? beltColor.textOnColor : theme.text.secondary }
                ]}>
                  30 gyms available
                </Text>
              </View>
              <Ionicons 
                name="chevron-forward" 
                size={20} 
                color={selectedLocation === 'Austin' ? beltColor.textOnColor : theme.text.secondary} 
              />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* More Cities Coming Soon */}
      <View style={styles.moreCitiesSection}>
        <TouchableOpacity
          style={styles.moreCitiesContent}
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
        >
          <View style={styles.moreCitiesTextContainer}>
            <Text style={[styles.moreCitiesText, { color: theme.text.secondary }]}>
              More cities coming soon!
            </Text>
            <View style={styles.emailRow}>
              <Text style={[styles.moreCitiesText, { color: theme.text.secondary }]}>
                Email us suggestions or updates
              </Text>
              <Ionicons name="mail-outline" size={16} color={theme.text.secondary} />
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* Bottom Spacing */}
      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 32,
  },
  welcomeSection: {
    padding: 24,
    paddingTop: 40,
    paddingBottom: 32,
  },
  welcomeText: {
    fontSize: 16,
    fontWeight: '400',
    marginBottom: 4,
  },
  userName: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 12,
  },
  beltIndicator: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  beltText: {
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    padding: 24,
    alignItems: 'center',
    marginBottom: 8,
    marginTop: 40, // Add top margin to move content down
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 75,
    height: 75,
    borderRadius: 37.5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  primaryButton: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  buttonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  quickDateContainer: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
    width: '100%',
    maxWidth: 400,
  },
  dateButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  dateButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  // New gym card styles (matching ResultsScreen)
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: '100%',
    maxWidth: 500,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  gymName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111518',
    flex: 1,
  },
  heartButton: {
    padding: 8,
  },
  heartIcon: {
    fontSize: 24,
    color: '#FF6B6B',
  },
  sessionSubtitle: {
    fontSize: 14,
    color: '#60798A',
    fontStyle: 'italic',
    marginBottom: 16,
  },
  sessionsSection: {
    marginBottom: 20,
  },
  sessionBlock: {
    marginBottom: 16,
  },
  dayHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111518',
    marginBottom: 4,
  },
  timeRange: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111518',
    marginBottom: 2,
  },
  infoSection: {
    marginBottom: 20,
  },
  feesSection: {
    marginBottom: 16,
  },
  feesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  feeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 30,
    marginBottom: 4,
  },
  feeLabel: {
    fontSize: 13,
    color: '#60798A',
    fontWeight: '500',
  },
  feeValue: {
    fontSize: 13,
    color: '#111518',
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  infoText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111518',
    flex: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 6,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111518',
  },
  loadingCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
  },
  emptyCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    fontWeight: '400',
    textAlign: 'center',
  },
  bottomSpacing: {
    height: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  userSection: {
    padding: 20,
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  userEmail: {
    fontSize: 14,
    color: '#60798A',
    marginBottom: 12,
  },
  signOutButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  signOutText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  userActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  syncStatus: {
    backgroundColor: '#E0F2F7',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  syncText: {
    fontSize: 12,
    color: '#007BFF',
    fontWeight: '500',
  },
  cityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 8,
    width: '100%',
    maxWidth: 400,
    position: 'relative',
  },
  cityButtonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  chevronIcon: {
    position: 'absolute',
    right: 20,
  },
  cityDropdown: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    marginBottom: 8,
    width: '100%',
    maxWidth: 400,
    zIndex: 2,
  },
  cityOption: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  cityOptionText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  dropdownBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    zIndex: 1,
  },
  cityCard: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cityCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cityCardText: {
    flex: 1,
    marginLeft: 12,
    marginRight: 12,
  },
  cityCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  cityCardSubtitle: {
    fontSize: 14,
    fontWeight: '400',
  },
  cityEmoji: {
    fontSize: 24,
  },
  citiesContainer: {
    width: '100%',
    maxWidth: 400,
  },
  moreCitiesSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 'auto',
  },
  moreCitiesContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreCitiesTextContainer: {
    alignItems: 'center',
  },
  moreCitiesText: {
    fontSize: 14,
    fontWeight: '400',
    textAlign: 'center',
    marginBottom: 4,
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },

});

export default DashboardScreen; 