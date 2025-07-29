import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  TextInput,
  Modal,
  ActivityIndicator,
  TouchableWithoutFeedback,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth, useTheme, useApp, useLoading } from '../context';
import { useMainTabNavigation } from '../navigation/useNavigation';
import { beltColors, selectionColor } from '../utils';
import { SafeAreaView as SafeAreaViewRN } from 'react-native-safe-area-context';
import { OpenMat } from '../types';
import { Toast } from '../components';


import appIcon from '../../assets/icon.png'; // <-- Import app icon
import stjjLogo from '../../assets/logos/STJJ.png';
import tenthPlanetLogo from '../../assets/logos/10th-planet-austin.png';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { githubDataService } from '../services';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

// Custom debounce function
const useDebounce = (callback: Function, delay: number) => {
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  
  return useCallback((...args: any[]) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => callback(...args), delay);
  }, [callback, delay]);
};

// TODO: v2.0 - Replace with user's home gym info

const DashboardScreen: React.FC = () => {
  const { user, isAuthenticated, signOut } = useAuth();
  const { theme } = useTheme();
  const { userBelt, selectedLocation, setSelectedLocation, favorites, toggleFavorite } = useApp();
  const navigation = useMainTabNavigation();
  
  const beltColor = beltColors[userBelt];
  
  // Search state
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<OpenMat[]>([]);
  const [selectedGym, setSelectedGym] = useState(null);
  const [copiedGymId, setCopiedGymId] = useState<number | null>(null);
  const [isSearchComplete, setIsSearchComplete] = useState(false);
  const { showTransitionalLoading } = useLoading();
  
  // Search input ref for focus management
  const searchInputRef = useRef<TextInput>(null);
  
  // Gym count state
  const [tampaGymCount, setTampaGymCount] = useState(18);
  const [austinGymCount, setAustinGymCount] = useState(30);
  const [isLoadingCounts, setIsLoadingCounts] = useState(true);
  
  // Toast state
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  
  // Email copy state
  const [emailCopied, setEmailCopied] = useState(false);
  
  // Focus search input when search becomes active
  useEffect(() => {
    if (isSearching && searchInputRef.current) {
      // Small delay to ensure visibility change is complete
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isSearching]);

  // Debug state changes
  useEffect(() => {
    console.log('🔄 isSearching changed to:', isSearching);
  }, [isSearching]);

  useEffect(() => {
    console.log('🔄 searchResults changed to:', searchResults.length, 'items');
  }, [searchResults]);

  useEffect(() => {
    console.log('🔄 searchQuery changed to:', searchQuery);
  }, [searchQuery]);

  // Load gym counts on component mount
  useEffect(() => {
    const loadGymCounts = async () => {
      try {
        const [tampaGyms, austinGyms] = await Promise.all([
          githubDataService.getGymData('tampa'),
          githubDataService.getGymData('austin')
        ]);
        
        // Count unique gyms by name (same logic as ResultsScreen grouping)
        const tampaUnique = new Set(tampaGyms.map(gym => gym.name)).size;
        const austinUnique = new Set(austinGyms.map(gym => gym.name)).size;
        
        setTampaGymCount(tampaUnique);
        setAustinGymCount(austinUnique);
      } catch (error) {
        console.error('Failed to load gym counts:', error);
        // Keep default values if loading fails
      } finally {
        setIsLoadingCounts(false);
      }
    };
    
    loadGymCounts();
  }, []);

  // Debug container visibility
  useEffect(() => {
    const shouldHide = !isSearching && searchResults.length === 0 && !searchQuery.trim();
    console.log('🎯 Search container visibility:', shouldHide ? 'HIDDEN' : 'VISIBLE', {
      isSearching,
      searchResultsLength: searchResults.length,
      searchQueryLength: searchQuery.length
    });
  }, [isSearching, searchResults.length, searchQuery]);

  useFocusEffect(
    useCallback(() => {
      // Reset search when screen comes into focus
      closeSearch();
    }, [])
  );

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

  const handleHeartPress = (gym: any) => {
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

  const handleCopyGym = async (gym: any) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const copyText = `I'm going to train at ${gym.name}!

${gym.name}
${gym.address}

Who's training today?`;
    
    await Clipboard.setStringAsync(copyText);
    
    setCopiedGymId(gym.id);
    // Reset icon after 2 seconds
    setTimeout(() => {
      setCopiedGymId(null);
    }, 2000);
  };

  const handleShareGym = async (gym: any) => {
    // Implementation for sharing gym info
    console.log('Share gym:', gym.name);
  };

  // Format date for last updated timestamp
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      return 'Unknown';
    }
  };

  // Separate search execution function
  const performSearch = async (query: string) => {
    console.log('🔍 performSearch called with:', query);
    
    if (!query.trim()) {
      console.log('❌ Empty query, clearing results');
      setSearchResults([]);
      setIsSearchComplete(false);
      return;
    }
    
    console.log('🚀 Starting search, setting isSearching to true');
    setIsSearching(true);
    setIsSearchComplete(false);
    try {
      // Use the existing data service to get gyms
      const tampaGyms = await githubDataService.getGymData('tampa');
      const austinGyms = await githubDataService.getGymData('austin');
      const allGyms = [...tampaGyms, ...austinGyms];
      
      // Filter gyms that match the search query
      const results = allGyms.filter(gym => 
        gym.name.toLowerCase().includes(query.toLowerCase()) ||
        gym.address.toLowerCase().includes(query.toLowerCase())
      );
      
      // Remove duplicates based on gym name and address
      const uniqueResults = results.reduce((acc: OpenMat[], gym) => {
        const exists = acc.find(g => g.name === gym.name && g.address === gym.address);
        if (!exists) {
          acc.push(gym);
        }
        return acc;
      }, [] as OpenMat[]);
      
      console.log('✅ Setting search results:', uniqueResults.length);
      setSearchResults(uniqueResults.slice(0, 10)); // Limit to 10 results
      setIsSearchComplete(true);
    } catch (error) {
      console.error('❌ Error searching gyms:', error);
      setSearchResults([]);
      setIsSearchComplete(true);
    } finally {
      console.log('🏁 Search complete, setting isSearching to false');
      setIsSearching(false);
    }
  };

  // Debounced search function
  const debouncedSearch = useDebounce(performSearch, 300);

  // Handle input change - immediate update for display, debounced for search
  const handleInputChange = (text: string) => {
    setSearchQuery(text);
    debouncedSearch(text);
  };

  const showGymDetails = (gym: any) => {
    setSelectedGym(gym);
  };

  // Helper function to close search
  const closeSearch = () => {
    setIsSearching(false);
    setSearchQuery('');
    setSearchResults([]);
    setIsSearchComplete(false);
  };

  const GymSearchResult: React.FC<{ gym: any }> = ({ gym }) => (
    <View style={styles.gymSearchResult}>
      <View style={styles.gymSearchResultContent}>
        <View style={styles.cardHeaderRow}>
          <View style={styles.logoCircle}>
            {gym.id.includes('stjj') ? (
              <Image source={stjjLogo} style={styles.gymLogo} />
            ) : gym.id.includes('10th-planet') ? (
              <Image source={tenthPlanetLogo} style={styles.gymLogo} />
            ) : (
              <Text style={styles.logoText}>
                {gym.name.split(' ').map((word: string) => word[0]).join('').slice(0, 2).toUpperCase()}
              </Text>
            )}
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.gymSearchResultName}>
              {gym.name}
            </Text>
            <Text style={styles.gymSearchResultAddress}>
              {gym.address}
            </Text>
            {gym.openMats && gym.openMats.length > 0 && (
              <View style={styles.skillTagsRow}>
                {gym.openMats.slice(0, 3).map((session: any, index: number) => (
                  <View key={index} style={[styles.skillTag, { backgroundColor: '#F0F3F5' }]}>
                    <Text style={styles.skillTagText}>
                      {session.day} {session.time}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
    </View>
  );

  const GymInfoCard: React.FC<{ gym: any; onClose: () => void }> = ({ gym, onClose }) => {
    return (
      <Modal
        visible={true}
        transparent={true}
        animationType="slide"
        onRequestClose={onClose}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1}
          onPress={onClose}
        >
          <TouchableOpacity 
            activeOpacity={1} 
            onPress={(e) => e.stopPropagation()}
            style={styles.modalCard}
          >
            {/* Close button */}
            <TouchableOpacity style={styles.modalCloseButton} onPress={onClose}>
              <Ionicons name="close" size={18} color="#111518" />
            </TouchableOpacity>
            
            {/* Gym header with logo */}
            <View style={styles.cardHeader}>
              <View style={styles.gymNameContainer}>
                <Text style={styles.gymName}>{gym.name}</Text>
              </View>
              <View style={styles.logoContainer}>
                {gym.id.includes('stjj') ? (
                  <Image source={stjjLogo} style={styles.gymLogo} />
                ) : gym.id.includes('10th-planet') ? (
                  <Image source={tenthPlanetLogo} style={styles.gymLogo} />
                ) : (
                  <View style={styles.avatarCircle}>
                    <Text style={styles.avatarText}>
                      {gym.name.split(' ').map((word: string) => word[0]).join('').slice(0, 2).toUpperCase()}
                    </Text>
                  </View>
                )}
              </View>
            </View>
            
            {/* Address */}
            <Text style={styles.gymAddress}>{gym.address}</Text>
            
            {/* Open Mat Sessions */}
            {gym.openMats && gym.openMats.length > 0 && (
              <View style={styles.sessionsSection}>
                <Text style={styles.sessionsTitle}>Open Mat Sessions</Text>
                {gym.openMats.map((session: any, index: number) => (
                  <View key={index} style={styles.sessionBlock}>
                    <View style={styles.sessionHeader}>
                      <Text style={styles.sessionDay}>{session.day}</Text>
                      <Text style={styles.sessionType}>
                        {getSessionTypeWithIcon(session.type)}
                      </Text>
                    </View>
                    <Text style={styles.sessionTime}>
                      {formatTimeRange(session.time)}
                    </Text>
                  </View>
                ))}
              </View>
            )}
            
            {/* Fees section */}
            <View style={styles.feesSection}>
              <Text style={styles.feesTitle}>Fees</Text>
              <View style={styles.feeItem}>
                <Text style={styles.feeLabel}>Open mat - </Text>
                <Text style={[styles.feeValue, gym.matFee === 0 && { color: '#10B981' }]}>
                  {gym.matFee === 0 ? 'Free' : gym.matFee ? `$${gym.matFee}` : '?/unknown'}
                </Text>
              </View>
              <View style={styles.feeItem}>
                <Text style={styles.feeLabel}>Class Drop in - </Text>
                <Text style={styles.feeValue}>
                  {typeof gym.dropInFee === 'number' ? (gym.dropInFee === 0 ? 'Free' : `$${gym.dropInFee}`) : '?/unknown'}
                </Text>
              </View>
            </View>

            {/* Last Updated Section */}
            <View style={styles.lastUpdatedContainer}>
              <Text style={styles.lastUpdatedText}>
                Last updated: {gym.lastUpdated ? formatDate(gym.lastUpdated) : 'Unknown'}
              </Text>
            </View>
            
            {/* Action buttons */}
            <View style={styles.unifiedButtonBar}>
              <TouchableOpacity style={styles.iconButton} onPress={() => toggleFavorite(gym.id)}>
                <Text style={[styles.iconText, styles.heartIcon]}>
                  {favorites.has(gym.id) ? '♥' : '♡'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.iconButton} 
                onPress={() => handleCopyGym(gym)}
                disabled={copiedGymId === gym.id}
              >
                {copiedGymId === gym.id ? (
                  <Ionicons name="checkmark" size={22} color="#10B981" />
                ) : (
                  <Ionicons name="copy-outline" size={22} color="#60798A" />
                )}
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.iconButton, (!gym.website || gym.website.trim() === '') && styles.disabledIconButton]}
                onPress={() => openWebsite(gym.website)}
                disabled={!gym.website || gym.website.trim() === ''}
              >
                <Ionicons 
                  name="globe-outline" 
                  size={22} 
                  color={(!gym.website || gym.website.trim() === '') ? '#9CA3AF' : '#111518'} 
                />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.iconButton, (!gym.address || gym.address === 'Tampa, FL' || gym.address === 'Austin, TX') && styles.disabledIconButton]}
                onPress={() => openDirections(gym.address)}
                disabled={!gym.address || gym.address === 'Tampa, FL' || gym.address === 'Austin, TX'}
              >
                <Ionicons 
                  name="location-outline" 
                  size={22} 
                  color={(!gym.address || gym.address === 'Tampa, FL' || gym.address === 'Austin, TX') ? '#9CA3AF' : '#111518'} 
                />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.iconButton} onPress={() => handleShareGym(gym)}>
                <Ionicons name="share-outline" size={22} color="#111518" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    );
  };

  return (
    <>
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
        
        {/* Search Backdrop - only when search is active */}
        {(isSearching || searchResults.length > 0) && (
          <TouchableWithoutFeedback onPress={closeSearch}>
            <View style={styles.searchBackdrop} />
          </TouchableWithoutFeedback>
        )}
        
        {/* Search/Add City Card */}
        <View style={styles.searchSection}>
          {/* Search Button - Always rendered, hidden when searching */}
          <TouchableOpacity
            style={[
              styles.cityCard, 
              { backgroundColor: theme.surface },
              isSearching && { 
                opacity: 0, 
                pointerEvents: 'none', 
                position: 'absolute',
                zIndex: -1 
              }
            ]}
            onPress={() => setIsSearching(true)}
          >
            <View style={styles.cityCardContent}>
              <Ionicons name="search" size={24} color={theme.text.secondary} />
              <View style={styles.cityCardText}>
                <Text style={[styles.cityCardTitle, { color: theme.text.primary }]}>
                  Search for a city or gym
                </Text>
                <Text style={[styles.cityCardSubtitle, { color: theme.text.secondary }]}>
                  Add your city to find local gyms
                </Text>
              </View>
              <Ionicons name="add-circle-outline" size={24} color={theme.text.secondary} />
            </View>
          </TouchableOpacity>
          
          {/* Search Input - Always rendered, hidden when not searching */}
          <View style={[
            styles.searchContainer, 
            { backgroundColor: theme.surface },
            !isSearching && searchResults.length === 0 && !searchQuery.trim() && { 
              opacity: 0, 
              pointerEvents: 'none', 
              position: 'absolute',
              zIndex: -1 
            }
          ]}>
            <View style={styles.searchInputContainer}>
              <Ionicons name="search" size={20} color={theme.text.secondary} style={styles.searchIcon} />
              <TextInput
                ref={searchInputRef}
                style={[styles.searchInput, { color: theme.text.primary }]}
                placeholder="Search for a gym"
                placeholderTextColor={theme.text.secondary}
                value={searchQuery}
                onChangeText={handleInputChange}
                onSubmitEditing={() => {
                  if (searchResults.length > 0) {
                    showGymDetails(searchResults[0]);
                  }
                }}
                returnKeyType="search"
                autoFocus
              />
              <TouchableOpacity 
                style={styles.closeSearchButton}
                onPress={closeSearch}
              >
                <Ionicons name="close" size={20} color={theme.text.secondary} />
              </TouchableOpacity>
            </View>
            
            {/* Search results list */}
            {searchResults.length > 0 && (
              <View style={styles.searchResultsContainer}>
                {searchResults.map((gym, index) => (
                  <TouchableOpacity 
                    key={`gym-${index}`}
                    onPress={() => showGymDetails(gym)}
                  >
                    <GymSearchResult gym={gym} />
                  </TouchableOpacity>
                ))}
              </View>
            )}
            
            {/* Loading indicator for search */}
            {isSearching && searchQuery.trim() && searchResults.length === 0 && (
              <View style={styles.searchLoadingContainer}>
                <ActivityIndicator size="small" color={theme.text.secondary} />
                <Text style={[styles.searchLoadingText, { color: theme.text.secondary }]}>
                  Searching gyms...
                </Text>
              </View>
            )}
          </View>
        </View>
        
        {/* Available Cities */}
        <View style={styles.citiesContainer}>
          <TouchableOpacity
            style={[
              styles.cityCard,
              { backgroundColor: theme.surface },
              selectedLocation === 'Tampa' && { backgroundColor: selectionColor }
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
                  { color: selectedLocation === 'Tampa' ? '#FFFFFF' : theme.text.primary }
                ]}>
                  Tampa, FL
                </Text>
                <Text style={[
                  styles.cityCardSubtitle,
                  { color: selectedLocation === 'Tampa' ? '#FFFFFF' : theme.text.secondary }
                ]}>
                  {isLoadingCounts ? 'Loading...' : `${tampaGymCount} gyms available`}
                </Text>
              </View>
              <Ionicons 
                name="chevron-forward" 
                size={20} 
                color={selectedLocation === 'Tampa' ? '#FFFFFF' : theme.text.secondary} 
              />
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.cityCard,
              { backgroundColor: theme.surface },
              selectedLocation === 'Austin' && { backgroundColor: selectionColor }
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
                  { color: selectedLocation === 'Austin' ? '#FFFFFF' : theme.text.primary }
                ]}>
                  Austin, TX
                </Text>
                <Text style={[
                  styles.cityCardSubtitle,
                  { color: selectedLocation === 'Austin' ? '#FFFFFF' : theme.text.secondary }
                ]}>
                  {isLoadingCounts ? 'Loading...' : `${austinGymCount} gyms available`}
                </Text>
              </View>
              <Ionicons 
                name="chevron-forward" 
                size={20} 
                color={selectedLocation === 'Austin' ? '#FFFFFF' : theme.text.secondary} 
              />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* More Cities Coming Soon */}
      <View style={styles.moreCitiesSection}>
        <TouchableOpacity
          style={styles.moreCitiesContent}
          activeOpacity={0.7}
          onPress={async () => {
            try {
              await Clipboard.setStringAsync('glootieapp@gmail.com');
              setEmailCopied(true);
              // Reset the checkmark after 2 seconds
              setTimeout(() => {
                setEmailCopied(false);
              }, 2000);
            } catch (error) {
              setToastMessage('Failed to copy email');
              setToastType('error');
              setShowToast(true);
            }
          }}
        >
          <View style={styles.moreCitiesTextContainer}>
            <Text style={[styles.moreCitiesText, { color: theme.text.secondary }]}>
              More cities coming soon!
            </Text>
            <View style={styles.emailRow}>
              <Text style={[styles.moreCitiesText, { color: "#6C757D" }]}>
                Suggestions? Email glootieapp@gmail.com
              </Text>
              <Ionicons 
                name={emailCopied ? "checkmark" : "copy-outline"} 
                size={18} 
                color={emailCopied ? "#10B981" : "#6C757D"} 
              />
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* Bottom Spacing */}
      <View style={styles.bottomSpacing} />
    </ScrollView>
    
    {/* Gym Info Modal */}
    {selectedGym && (
      <GymInfoCard 
        gym={selectedGym} 
        onClose={() => setSelectedGym(null)} 
      />
    )}
    
    {/* Toast Notification */}
    <Toast
      visible={showToast}
      message={toastMessage}
      type={toastType}
      onHide={() => setShowToast(false)}
    />
    </>
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
    marginTop: 20, // Reduced from 40 to 20
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
    marginTop: 20,
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
    marginBottom: 16,
  },
  sessionBlock: {
    marginBottom: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
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
  feeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  feeLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  feeValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111518',
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
    paddingVertical: 8,
    paddingHorizontal: 16,
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
    gap: 8,
    paddingVertical: 4,
  },
  // Search styles
  searchSection: {
    position: 'relative',
    width: '100%',
    maxWidth: 400,
    marginBottom: 12,
    zIndex: 2,
  },
  searchContainer: {
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
    backgroundColor: '#FFFFFF',
    zIndex: 2,
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
  searchInput: {
    flex: 1,
    height: 55,
    paddingHorizontal: 16,
    paddingLeft: 40,
    fontSize: 18,
    fontWeight: '500',
  },
  closeSearchButton: {
    padding: 12,
    marginLeft: 8,
  },
  searchResultsContainer: {
    marginTop: 12,
    width: '100%',
  },
  gymSearchResult: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  gymSearchResultContent: {
    flex: 1,
  },
  gymSearchResultName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
    color: '#111518',
  },
  gymSearchResultAddress: {
    fontSize: 14,
    fontWeight: '400',
    color: '#6B7280',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    backgroundColor: '#FFFFFF',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 18,
    right: 18,
    zIndex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  gymNameContainer: {
    flex: 1,
    marginRight: 16,
  },
  gymName: {
    fontSize: 21,
    fontWeight: '700',
    marginBottom: 2,
    color: '#111518',
  },
  gymAddress: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 16,
    color: '#6B7280',
  },
  logoContainer: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
  },
  gymLogo: {
    width: 56,
    height: 56,
    borderRadius: 28,
    resizeMode: 'contain',
  },
  feesSection: {
    marginBottom: 16,
  },
  feesTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
    color: '#111518',
  },
  unifiedButtonBar: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 6,
    marginTop: 8,
    paddingHorizontal: 4,
  },
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    minHeight: 44,
    width: 60,
  },
  iconText: {
    fontSize: 22,
    color: '#111518',
  },

  searchLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    paddingVertical: 10,
  },
  searchLoadingText: {
    marginLeft: 8,
    fontSize: 14,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  logoCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0F3F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  logoText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111518',
  },
  cardContent: {
    flex: 1,
  },
  skillTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  skillTag: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  skillTagText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#111518',
  },
  sessionsTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    color: '#111518',
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sessionDay: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111518',
  },
  sessionType: {
    fontSize: 14,
    fontWeight: '500',
    color: '#60798A',
    marginLeft: 8,
  },
  sessionTime: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111518',
  },
  lastUpdatedContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  lastUpdatedText: {
    fontSize: 12,
    color: '#60798A',
    fontWeight: '500',
  },
  disabledIconButton: {
    opacity: 0.5,
  },
  searchBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    zIndex: 1,
  },

});

export default DashboardScreen; 