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
  Image,
  TextInput,
  Modal,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Animated,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth, useTheme, useApp, useLoading } from '../context';
import { useMainTabNavigation } from '../navigation/useNavigation';
import { beltColors, selectionColor, haptics, animations, formatTimeRange, formatSingleTime, addOneHour, getSessionTypeWithIcon, formatDate, openWebsite, openDirections, handleCopyGym, logger } from '../utils';
import { SafeAreaView as SafeAreaViewRN } from 'react-native-safe-area-context';
import { OpenMat, OpenMatSession, SearchFilters } from '../types';
import { Toast, ContactFooter, ShareCard, SkeletonCard, SearchSuggestions } from '../components';


import appIcon from '../../assets/icon.png'; // <-- Import app icon
import stjjLogo from '../../assets/logos/STJJ.png';
import tenthPlanetLogo from '../../assets/logos/10th-planet-austin.png';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { githubDataService, SearchService } from '../services';
import { captureCardAsImage } from '../utils/screenshot';
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
  const [selectedGym, setSelectedGym] = useState<OpenMat | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [copiedGymId, setCopiedGymId] = useState<string | null>(null);
  const [isSearchComplete, setIsSearchComplete] = useState(false);
  const { showTransitionalLoading } = useLoading();
  
  // Smart search state
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [allGyms, setAllGyms] = useState<OpenMat[]>([]);
  
  // Search input ref for focus management
  const searchInputRef = useRef<TextInput>(null);
  
  // Share card ref and state for image generation
  const shareCardRef = useRef<View | null>(null);
  const [shareCardGym, setShareCardGym] = useState<OpenMat | null>(null);
  const [shareCardSession, setShareCardSession] = useState<any>(null);
  const [sharingGymId, setSharingGymId] = useState<string | null>(null);
  
  // Animation values
  const screenFadeAnim = useRef(new Animated.Value(0)).current;
  const contentSlideAnim = useRef(new Animated.Value(30)).current;
  // Heart button animation values - temporarily disabled for debugging
  // const heartScaleAnim = useRef(new Animated.Value(1)).current;
  // const heartColorAnim = useRef(new Animated.Value(0)).current;
  
  // Gym count state
  const [tampaGymCount, setTampaGymCount] = useState(18);
  const [austinGymCount, setAustinGymCount] = useState(30);
  const [isLoadingCounts, setIsLoadingCounts] = useState(true);
  
  // Toast state
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  

  
  // Screen entrance animation
  useEffect(() => {
    const runEntranceAnimation = () => {
      Animated.parallel([
        animations.fadeIn(screenFadeAnim, 400),
        animations.slideUp(contentSlideAnim, 30, 400),
      ]).start();
    };

    // Small delay to ensure smooth entrance
    const timer = setTimeout(runEntranceAnimation, 100);
    return () => clearTimeout(timer);
  }, []);

  // Focus search input when search becomes active
  useEffect(() => {
    if (isSearching && searchInputRef.current) {
      logger.searchInput('Search input focus useEffect triggered - focusing input');
      // Small delay to ensure visibility change is complete
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isSearching]);

  // Debug state changes
  useEffect(() => {
    logger.state('isSearching changed to:', { isSearching });
  }, [isSearching]);

  useEffect(() => {
    logger.state('searchResults changed to:', { count: searchResults.length });
  }, [searchResults]);

  useEffect(() => {
    logger.state('searchQuery changed to:', { searchQuery });
  }, [searchQuery]);

  // Load gym counts and all gym data on component mount
  useEffect(() => {
    const loadGymData = async () => {
      try {
        const [tampaGyms, austinGyms] = await Promise.all([
          githubDataService.getGymData('tampa'),
          githubDataService.getGymData('austin')
        ]);
        
        // Set all gyms for search suggestions
        const allGymsData = [...tampaGyms, ...austinGyms];
        

        
        setAllGyms(allGymsData);
        
        // Count unique gyms by name (same logic as ResultsScreen grouping)
        const tampaUnique = new Set(tampaGyms.map(gym => gym.name)).size;
        const austinUnique = new Set(austinGyms.map(gym => gym.name)).size;
        
        setTampaGymCount(tampaUnique);
        setAustinGymCount(austinUnique);
      } catch (error) {
        logger.error('Failed to load gym data:', error);
        // Keep default values if loading fails
      } finally {
        setIsLoadingCounts(false);
      }
    };
    
    loadGymData();
  }, []);

  // Load recent searches on component mount
  useEffect(() => {
    const loadRecentSearches = async () => {
      try {
        const recent = await SearchService.getRecentSearches();
        setRecentSearches(recent);
      } catch (error) {
        logger.error('Error loading recent searches:', error);
      }
    };
    
    loadRecentSearches();
  }, []);

  // Generate search suggestions when query changes
  useEffect(() => {
    if (searchQuery.length >= 2 && allGyms.length > 0) {
      const suggestions = SearchService.generateSuggestions(searchQuery, allGyms);
      setSearchSuggestions(suggestions);
      setShowSuggestions(true);
    } else if (searchQuery.length === 0) {
      setSearchSuggestions([]);
      setShowSuggestions(recentSearches.length > 0);
    } else {
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery, allGyms, recentSearches]);

  // Debug container visibility
  useEffect(() => {
    const shouldHide = !isSearching && searchResults.length === 0 && !searchQuery.trim();
    logger.visibility('Search container visibility:', { 
      visibility: shouldHide ? 'HIDDEN' : 'VISIBLE',
      isSearching,
      searchResultsLength: searchResults.length,
      searchQueryLength: searchQuery.length
    });
  }, [isSearching, searchResults.length, searchQuery]);

  useFocusEffect(
    useCallback(() => {
      // Reset search when screen comes into focus
      logger.navigation('useFocusEffect triggered - calling closeSearch');
      closeSearch();
    }, [])
  );

  const handleQuickToday = () => {
    haptics.medium(); // Medium haptic for navigation action
    navigation.navigate('Find', { screen: 'TimeSelection' });
  };








  const handleHeartPress = (gym: OpenMat) => {
    const isFavorited = favorites.has(gym.id);
    
    // Haptic feedback
    if (isFavorited) {
      haptics.light(); // Light haptic for unfavoriting
    } else {
      haptics.success(); // Success haptic for favoriting
      // Show loading and navigate to favorites tab when adding
      showTransitionalLoading("Added to favorites!", 1500);
      setTimeout(() => {
        navigation.navigate('Favorites');
      }, 500);
    }
    
    // Heart button animation - temporarily disabled for debugging
    // animations.sequence([
    //   animations.scale(heartScaleAnim, 1.3, 150),
    //   animations.scale(heartScaleAnim, 1, 200),
    // ]).start();
    
    // Color transition animation - temporarily disabled for debugging
    // const targetColor = isFavorited ? 0 : 1;
    // Animated.timing(heartColorAnim, {
    //   toValue: targetColor,
    //   duration: 300,
    //   useNativeDriver: false,
    // }).start();
    
    // Call the original handler
    toggleFavorite(gym.id);
  };

  // Add openWebsite and openDirections helpers
  // Helper to copy gym details with state management
  const handleCopyGymWithState = async (gym: OpenMat) => {
    try {
      await handleCopyGym(gym);
      setCopiedGymId(gym.id);
      // Reset icon after 2 seconds
      setTimeout(() => {
        setCopiedGymId(null);
      }, 2000);
    } catch (error) {
      // Error already handled in handleCopyGym
    }
  };

  const handleShareGym = async (gym: OpenMat) => {
    if (sharingGymId === gym.id) return; // Prevent multiple clicks
    
    haptics.light(); // Light haptic for button press
    setSharingGymId(gym.id);
    try {
      const firstSession = gym.openMats && gym.openMats.length > 0 ? gym.openMats[0] : null;
      
      if (!firstSession) {
        haptics.warning(); // Warning haptic for no sessions
        Alert.alert('No Sessions', 'No sessions available to share.');
        return;
      }

      logger.share('Setting ShareCard data:', { gym: gym.name, session: firstSession });
      
      // Set the gym and session for the ShareCard
      setShareCardGym(gym);
      setShareCardSession(firstSession);

      // Wait for ShareCard to render before capturing and sharing
      setTimeout(async () => {
        try {
          logger.capture('Capturing and sharing image...');
          
          // Capture the ShareCard as an image
          const imageUri = await captureCardAsImage(shareCardRef);
          
          // Share using native iOS share sheet
          await Share.share({
            url: imageUri,
                          message: `Check out this open mat session at ${gym.name}! 🥋\n\n${firstSession.day} at ${firstSession.time}\n\nFind more sessions with JiuJitsu Finder!`
          });
          
          haptics.success(); // Success haptic for successful share
                  } catch (error) {
            logger.error('Error capturing and sharing:', error);
          haptics.error(); // Error haptic for failed share
          Alert.alert(
            '❌ Sharing Error',
            'Failed to capture and share the image. Please try again.',
            [{ text: 'OK' }]
          );
        }
      }, 200); // Delay to ensure ShareCard is rendered
      
      // Reset sharing state
      setSharingGymId(null);
    } catch (error) {
      haptics.error(); // Error haptic for failed share
      Alert.alert(
        '❌ Sharing Error',
        'Failed to prepare sharing. Please try again.',
        [{ text: 'OK' }]
      );
      setSharingGymId(null);
    }
  };



  // Separate search execution function
  const performSearch = async (query: string) => {
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
          } catch (error) {
        logger.error('Error searching gyms:', error);
        logger.warn('Error case - clearing search results');
      setSearchResults([]);
      setIsSearchComplete(true);
          } finally {
        logger.finish('Search complete, setting isSearching to false');
      setIsSearching(false);
    }
  };

  // Debounced search function
  const debouncedSearch = useDebounce(performSearch, 300);

  // Handle input change - immediate update for display, debounced for search
  const handleInputChange = (text: string) => {
    logger.textInput('handleInputChange called with:', { text });
    setSearchQuery(text);
    debouncedSearch(text);
  };

  // Handle suggestion selection
  const handleSelectSuggestion = (suggestion: string) => {
    logger.searchInput('handleSelectSuggestion called with:', { suggestion });
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    performSearch(suggestion);
  };

  // Handle clear recent searches
  const handleClearRecent = async () => {
    logger.clear('handleClearRecent called');
    try {
      await SearchService.clearRecentSearches();
      setRecentSearches([]);
      setShowSuggestions(false);
          } catch (error) {
        logger.error('Error clearing recent searches:', error);
    }
  };

  const showGymDetails = (gym: OpenMat) => {
    logger.searchInput('showGymDetails called for gym:', { gymName: gym.name });
    setSelectedGym(gym);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedGym(null);
  };

  // Helper function to close search
  const closeSearch = () => {
    logger.search('closeSearch called - clearing search state');
    setIsSearching(false);
    setSearchQuery('');
    setSearchResults([]);
    setIsSearchComplete(false);
    setShowSuggestions(false);
  };

  const GymSearchResult: React.FC<{ gym: OpenMat }> = ({ gym }) => (
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
                {gym.openMats.slice(0, 3).map((session: OpenMatSession, index: number) => (
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

  const SkeletonSearchResult: React.FC<{ index: number }> = ({ index }) => {
    const shimmerAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      // Stagger entrance animation based on index
      const entranceDelay = index * 100;
      
      // Start entrance animations
      animations.parallel([
        animations.fadeIn(fadeAnim, 400, entranceDelay),
      ]).start();

      // Start shimmer animation
      const shimmerAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: false,
          }),
          Animated.timing(shimmerAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: false,
          }),
        ])
      );
      
      shimmerAnimation.start();

      return () => {
        shimmerAnimation.stop();
      };
    }, [index]);

    const shimmerOpacity = shimmerAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 0.7],
    });

    return (
      <Animated.View 
        style={[
          styles.gymSearchResult,
          { opacity: fadeAnim }
        ]}
      >
        <View style={styles.gymSearchResultContent}>
          <View style={styles.cardHeaderRow}>
            <Animated.View 
              style={[
                styles.logoCircle,
                { opacity: shimmerOpacity }
              ]} 
            />
            <View style={styles.cardContent}>
              <Animated.View 
                style={[
                  styles.skeletonSearchName,
                  { opacity: shimmerOpacity }
                ]} 
              />
              <Animated.View 
                style={[
                  styles.skeletonSearchAddress,
                  { opacity: shimmerOpacity }
                ]} 
              />
              <View style={styles.skillTagsRow}>
                <Animated.View 
                  style={[
                    styles.skeletonSkillTag,
                    { opacity: shimmerOpacity }
                  ]} 
                />
                <Animated.View 
                  style={[
                    styles.skeletonSkillTag,
                    { opacity: shimmerOpacity }
                  ]} 
                />
              </View>
            </View>
          </View>
        </View>
        <Animated.View 
          style={[
            styles.skeletonChevron,
            { opacity: shimmerOpacity }
          ]} 
        />
      </Animated.View>
    );
  };

  const GymInfoCard: React.FC<{ gym: OpenMat; onClose: () => void; visible: boolean }> = ({ gym, onClose, visible }) => {
    return (
      <Modal
        visible={visible}
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
            <TouchableOpacity style={styles.modalCloseButton} onPress={() => {
              haptics.light(); // Light haptic for modal close
              onClose();
            }}>
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
                {gym.openMats.map((session: OpenMatSession, index: number) => (
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
              <TouchableOpacity style={styles.iconButton} onPress={() => handleHeartPress(gym)}>
                <Text style={[
                  styles.iconText, 
                  styles.heartIcon,
                  { color: favorites.has(gym.id) ? '#EF4444' : '#9CA3AF' }
                ]}>
                  {favorites.has(gym.id) ? '♥' : '♡'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.iconButton} 
                onPress={() => handleCopyGymWithState(gym)}
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
                onPress={() => gym.website && openWebsite(gym.website)}
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
              
              <TouchableOpacity style={styles.iconButton} onPress={() => {
                haptics.light(); // Light haptic for share button
                handleShareGym(gym);
              }}>
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
      <Animated.View style={{ 
        flex: 1, 
        opacity: screenFadeAnim,
        transform: [{ translateY: contentSlideAnim }]
      }}>
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
            <TouchableOpacity onPress={() => {
              haptics.medium(); // Medium haptic for sign out action
              signOut();
            }} style={styles.signOutButton}>
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
          <TouchableWithoutFeedback onPress={() => {
            console.log('🔍 Search backdrop clicked - calling closeSearch');
            closeSearch();
          }}>
            <View 
              style={styles.searchBackdrop} 
              pointerEvents={(searchResults.length > 0 || modalVisible) ? "box-none" : "auto"}
            />
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
            onPress={() => {
              haptics.light(); // Light haptic for search button tap
              console.log('🔍 Search button clicked - setting isSearching to true');
              setIsSearching(true);
            }}
          >
            <View style={styles.cityCardContent}>
              <Ionicons name="search" size={24} color={theme.text.secondary} />
              <View style={styles.cityCardText}>
                <Text style={[styles.cityCardTitle, { color: theme.text.primary }]}>
                  Search gyms
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={theme.text.secondary} />
            </View>
          </TouchableOpacity>
          
          {/* Search Input - Always rendered, hidden when not searching */}
          <View 
            style={[
              styles.searchContainer, 
              { backgroundColor: theme.surface },
              !isSearching && searchResults.length === 0 && !searchQuery.trim() && { 
                opacity: 0, 
                pointerEvents: 'none', 
                position: 'absolute',
                zIndex: -1 
              }
            ]}
            onTouchStart={() => {
              console.log('🔍 searchContainer onTouchStart');
            }}
            onTouchEnd={() => {
              console.log('🔍 searchContainer onTouchEnd');
            }}
          >
            <View 
              style={styles.searchInputContainer}
              onTouchStart={() => {
                console.log('🔍 searchInputContainer onTouchStart');
              }}
              onTouchEnd={() => {
                console.log('🔍 searchInputContainer onTouchEnd');
              }}
            >
              <Ionicons name="search" size={20} color={theme.text.secondary} style={styles.searchIcon} />
              <TextInput
                ref={searchInputRef}
                style={[styles.searchInput, { color: theme.text.primary }]}
                placeholder="Search gym names or cities"
                placeholderTextColor={theme.text.secondary}
                value={searchQuery}
                onChangeText={handleInputChange}
                onFocus={() => {
                  console.log('🎯 TextInput onFocus - input focused');
                  if (searchQuery.length === 0 && recentSearches.length > 0) {
                    setShowSuggestions(true);
                  }
                }}
                onBlur={() => {
                  console.log('🎯 TextInput onBlur - input lost focus');
                  // Don't hide suggestions immediately to allow for taps
                  setTimeout(() => {
                    if (!searchQuery.trim()) {
                      setShowSuggestions(false);
                    }
                  }, 200);
                }}
                onSubmitEditing={() => {
                  if (searchResults.length > 0) {
                    showGymDetails(searchResults[0]);
                  }
                }}
                returnKeyType="search"
              />
              <TouchableOpacity 
                style={styles.closeSearchButton}
                onPress={() => {
                  haptics.light(); // Light haptic for close search button
                  console.log('❌ Close search button clicked - calling closeSearch');
                  closeSearch();
                }}
                onPressIn={() => {
                  console.log('👆 X button onPressIn - touch started');
                }}
                onPressOut={() => {
                  console.log('👆 X button onPressOut - touch ended');
                }}
              >
                <Ionicons name="close" size={20} color={theme.text.secondary} />
              </TouchableOpacity>
            </View>
            
            {/* Search suggestions */}
            <SearchSuggestions
              query={searchQuery}
              suggestions={searchSuggestions}
              recentSearches={recentSearches}
              isLoading={isSearching}
              onSelectSuggestion={handleSelectSuggestion}
              onClearRecent={handleClearRecent}
              visible={showSuggestions && !searchResults.length}
            />
            
            {/* Search results list */}
            {searchResults.length > 0 && (
              <View style={styles.searchResultsContainer}>
                {searchResults.map((gym, index) => (
                  <TouchableOpacity 
                    key={`gym-${index}`}
                    onPress={() => {
                      haptics.light(); // Light haptic for gym card selection
                      console.log('👆 Gym card clicked for:', gym.name);
                      showGymDetails(gym);
                    }}
                  >
                    <GymSearchResult gym={gym} />
                  </TouchableOpacity>
                ))}
              </View>
            )}
            
            {/* Skeleton loading for search */}
            {isSearching && searchQuery.trim() && searchResults.length === 0 && (
              <View style={styles.searchResultsContainer}>
                {Array.from({ length: 3 }, (_, i) => (
                  <SkeletonSearchResult key={`skeleton-${i}`} index={i} />
                ))}
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
              haptics.medium(); // Medium haptic for city selection
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
              haptics.medium(); // Medium haptic for city selection
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


      {/* Bottom Spacing */}
      <View style={styles.bottomSpacing} />
    </ScrollView>
        </Animated.View>
    
    {/* Gym Info Modal */}
    {selectedGym && (
      <GymInfoCard 
        gym={selectedGym} 
        onClose={handleCloseModal}
        visible={modalVisible}
      />
    )}
    
    {/* Toast Notification */}
    <Toast
      visible={showToast}
      message={toastMessage}
      type={toastType}
      onHide={() => setShowToast(false)}
    />

    {/* Hidden ShareCard for image generation */}
    {(() => {
      if (shareCardGym && shareCardSession) {
        console.log('Rendering ShareCard with ref:', shareCardRef.current ? 'exists' : 'null');
        return (
          <View style={{ position: 'absolute', left: -9999, top: -9999 }}>
            <ShareCard 
              ref={shareCardRef}
              gym={shareCardGym}
              session={shareCardSession}
              includeImGoing={true}
            />
          </View>
        );
      }
      return null;
    })()}

    {/* Contact Footer */}
    <ContactFooter />
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
    height: 24,
    paddingHorizontal: 16,
    paddingLeft: 40,
    fontSize: 16,
    fontWeight: '500',
  },
  closeSearchButton: {
    padding: 16,
    marginLeft: 8,
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
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
    backgroundColor: '#F9FAFB',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 18,
    right: 18,
    zIndex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 22,
    width: 44,
    height: 44,
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
    paddingVertical: 12,
    paddingHorizontal: 8,
    minHeight: 44,
    minWidth: 44,
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
    zIndex: 3,
  },
  // Skeleton styles for search results
  skeletonSearchName: {
    height: 18,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 4,
    width: '80%',
  },
  skeletonSearchAddress: {
    height: 14,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 8,
    width: '60%',
  },
  skeletonSkillTag: {
    height: 24,
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
    width: 80,
  },
  skeletonChevron: {
    width: 20,
    height: 20,
    backgroundColor: '#E5E7EB',
    borderRadius: 10,
  },

});

export default DashboardScreen; 