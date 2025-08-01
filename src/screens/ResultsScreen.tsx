import React, { useState, useEffect, useMemo, useRef, memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Dimensions,
  Linking,
  SafeAreaView,
  Alert,
  Modal,
  ScrollView,
  LayoutAnimation,
  Share,
  Image,
  ActivityIndicator,
  RefreshControl,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { useLoading } from '../context/LoadingContext';
import { useFindNavigation, useMainTabNavigation } from '../navigation/useNavigation';
import { beltColors, selectionColor, haptics, animations, formatTimeRange, formatSingleTime, addOneHour, getSessionTypeWithIcon, getMatTypeDisplay, formatDate, openWebsite, openDirections, handleCopyGym, formatOpenMats, formatSessionsList, logger } from '../utils';
import { OpenMat, OpenMatSession, SearchFilters } from '../types';
import { GymDetailsModal, ShareCard, Toast, ContactFooter, SkeletonCard } from '../components';
import { apiService, gymLogoService } from '../services';
import { githubDataService } from '../services/github-data.service';
import { FindStackRouteProp } from '../navigation/types';
import { captureCardAsImage } from '../utils/screenshot';
import tenthPlanetLogo from '../../assets/logos/10th-planet-austin.png';
import stjjLogo from '../../assets/logos/STJJ.png';
import appIcon from '../../assets/icon.png';

const { width } = Dimensions.get('window');

// Sort gyms by their next upcoming session
const sortByNextSession = (gyms: OpenMat[]): OpenMat[] => {
  const now = new Date();
  const currentDayIndex = now.getDay();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  
  return [...gyms].sort((a, b) => {
    // Get next session for each gym
    const getNextSession = (gym: OpenMat) => {
      // Convert session day to day index (0-6)
      const dayMap: Record<string, number> = { 'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6 };
      
      // Find the soonest session
      let soonestDays = Infinity;
      gym.openMats.forEach(session => {
        const sessionDayIndex = dayMap[session.day] ?? 0; // Use nullish coalescing for safety
        let daysUntil = (sessionDayIndex - currentDayIndex + 7) % 7;
        
        // If it's today, check if session has passed
        if (daysUntil === 0) {
          // Parse session time and compare with current time
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
          
          const sessionTime = getMinutesFromTime(session.time);
          // If session has passed today, set to next week
          if (sessionTime <= currentTime) {
            daysUntil = 7;
          }
        }
        
        soonestDays = Math.min(soonestDays, daysUntil);
      });
      
      return soonestDays;
    };
    
    return getNextSession(a) - getNextSession(b);
  });
};

interface ResultsScreenProps {
  route: FindStackRouteProp<'Results'>;
}

const ResultsScreen: React.FC<ResultsScreenProps> = ({ route }) => {
  const { theme } = useTheme();
  const { selectedLocation, userBelt, favorites, toggleFavorite } = useApp();
  const { showTransitionalLoading } = useLoading();
  const findNavigation = useFindNavigation();
  const navigation = useMainTabNavigation();
  const beltColor = beltColors[userBelt];
  
  // Get location and date filtering from route params
  const location = route.params?.location || 'Tampa';
  const dateSelection = route.params?.dateSelection;
  
  // Memoize the dates array to prevent infinite re-renders
  const dates = useMemo(() => {
    if (!route.params?.dates) return undefined;
    return route.params.dates.map((dateString: string) => new Date(dateString));
  }, [route.params?.dates?.join(',')]); // Use string comparison for stable dependency

  // Create a stable params key for useEffect dependencies
  const paramsKey = useMemo(() => {
    const dateCount = route.params?.dates?.length || 0;
    return `${location}-${dateSelection}-${dateCount}`;
  }, [location, dateSelection, route.params?.dates?.length]);

  // State for API data
  const [openMats, setOpenMats] = useState<OpenMat[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);
  
  // Filter state
  const [activeFilters, setActiveFilters] = useState<{
    gi: boolean;
    nogi: boolean;
    price: 'free' | null;
  }>({
    gi: false,
    nogi: false,
    price: null, // null or 'free'
  });

  // Share card ref and state for image generation
  const shareCardRef = useRef<View | null>(null);
  const [shareCardGym, setShareCardGym] = useState<OpenMat | null>(null);
  const [shareCardSession, setShareCardSession] = useState<any>(null);
  
  // Loading states for user actions
  const [copyingGymId, setCopyingGymId] = useState<string | null>(null);
  const [sharingGymId, setSharingGymId] = useState<string | null>(null);
  const [copiedGymId, setCopiedGymId] = useState<string | null>(null);
  
  // Toast state
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  
  // Email copy state
  const [emailCopied, setEmailCopied] = useState(false);
  

  
  // Animation values
  const headerAnim = useRef(new Animated.Value(0)).current;
  const filterAnim = useRef(new Animated.Value(0)).current;
  const listAnim = useRef(new Animated.Value(0)).current;
  
  // Scale animation values for button press feedback
  const heartScaleAnim = useRef(new Animated.Value(1)).current;
  // const heartColorAnim = useRef(new Animated.Value(0)).current; // Temporarily disabled
  const copyScaleAnim = useRef(new Animated.Value(1)).current;
  const websiteScaleAnim = useRef(new Animated.Value(1)).current;
  const directionsScaleAnim = useRef(new Animated.Value(1)).current;
  const shareScaleAnim = useRef(new Animated.Value(1)).current;
  
  // Scale animation function
  const animateScale = (animValue: Animated.Value, scale: number) => {
    Animated.spring(animValue, {
      toValue: scale,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  };
  
  // View mode state
  // Removed viewMode state since we navigate to MapView screen

  // Component lifecycle tracking removed for production

  // Entrance animations
  useEffect(() => {
    const runEntranceAnimations = async () => {
      // Stagger the animations for a smooth entrance
      animations.stagger(
        [headerAnim, filterAnim, listAnim],
        (value, index) => animations.fadeIn(value, 400, index * 100)
      ).start();
    };

    runEntranceAnimations();
  }, []);

  // Load gym logos when openMats data changes
  useEffect(() => {
    const loadGymLogos = async () => {
      const logoUrls: Record<string, string> = {};
      
      for (const gym of openMats) {
        // Skip gyms that already have hardcoded logos
        if (gym.id.includes('10th-planet') || gym.id.includes('stjj')) {
          continue;
        }
        
        try {
          const logoUrl = await gymLogoService.getGymLogo(gym.id, gym.name, gym.website);
          if (logoUrl) {
            logoUrls[gym.id] = logoUrl;
          }
        } catch (error) {
          // Logo loading failed silently
        }
      }
      
      setGymLogos(logoUrls);
    };

    if (openMats.length > 0) {
      loadGymLogos();
    }
  }, [openMats]);

  // Free filter state
  const [showFreeOnly, setShowFreeOnly] = useState(false);
  

  
  // Modal state
  const [selectedGym, setSelectedGym] = useState<OpenMat | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  
  // Gym logo state
  const [gymLogos, setGymLogos] = useState<Record<string, string>>({});

  


  // EMERGENCY FIX: Temporarily disable useEffect to stop infinite loop
  // useEffect(() => {
  //   const fetchData = async () => {
  //     console.log('🔄 ResultsScreen: Starting data fetch for', location, dateSelection);
  //     
  //     try {
  //       setLoading(true);
  //       
  //       // Prepare filters object with date selection
  //       const filters: any = {};
  //       if (dateSelection) {
  //         filters.dateSelection = dateSelection;
  //       }
  //       if (dates) {
  //         filters.dates = dates;
  //       }
  //       
  //       const data = await apiService.getOpenMats(location, filters);
  //       console.log('✅ ResultsScreen: Data loaded successfully -', data.length, 'gyms');
  //       
  //       setOpenMats(data);
  //     } catch (error) {
  //       console.error('❌ ResultsScreen: Error fetching gyms:', error);
  //       setOpenMats([]);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchData();
  // }, [location, dateSelection, datesKey]); // Use stable datesKey instead of dates array

  // Load data once on mount
  useEffect(() => {
    const fetchData = async () => {
          logger.loading('ResultsScreen: Starting data fetch');
    logger.location('Location:', { location });
    logger.dateTime('DateSelection:', { dateSelection });
    logger.dateTime('Dates:', { dates });
    logger.key('ParamsKey:', { paramsKey });
      
      setIsLoading(true);
      showTransitionalLoading("Discovering open mat sessions...", 2000);
      try {
        
        // Determine city from location string
        const city = location.toLowerCase().includes('austin') ? 'austin' : 
                     location.toLowerCase().includes('tampa') ? 'tampa' : 'tampa';
        
        // Force refresh data from GitHub
        if (city === 'tampa') {
          await githubDataService.forceRefreshTampaData();
        } else {
          await githubDataService.refreshData(city);
        }
        
        // Check last update time silently
        const lastUpdate = await githubDataService.getLastUpdateTime(city);
        
        const filters: SearchFilters = {};
        if (dateSelection) {
          filters.dateSelection = dateSelection;
        }
        if (dates) {
          filters.dates = dates;
        }
        
        logger.search('Filters being sent to API:', filters);
        const data = await apiService.getOpenMats(location, filters, true);
        logger.success('ResultsScreen: Data loaded successfully -', { count: data.length, firstGym: data[0] });
        
        setOpenMats(data);
      } catch (error) {
        logger.error('ResultsScreen: Error fetching gyms:', error);
        setOpenMats([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [location, dateSelection, paramsKey]);

  const handleGymPress = (gym: OpenMat) => {
    haptics.light(); // Light haptic for gym card selection
    setSelectedGym(gym);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    haptics.light(); // Light haptic for modal close
    setModalVisible(false);
    setSelectedGym(null);
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
    
    // Heart button animation
    animations.sequence([
      animations.scale(heartScaleAnim, 1.3, 150),
      animations.scale(heartScaleAnim, 1, 200),
    ]).start();
    
    // Color transition animation - temporarily disabled
    // const targetColor = isFavorited ? 0 : 1;
    // Animated.timing(heartColorAnim, {
    //   toValue: targetColor,
    //   duration: 300,
    //   useNativeDriver: false,
    // }).start();
    
    // Call the original handler
    toggleFavorite(gym.id);
  };

  // Pull-to-refresh function
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // Determine city from location string
      const city = location.toLowerCase().includes('austin') ? 'austin' : 
                   location.toLowerCase().includes('tampa') ? 'tampa' : 'tampa';
      
      // Force refresh data from GitHub
      if (city === 'tampa') {
        await githubDataService.forceRefreshTampaData();
      } else {
        await githubDataService.refreshData(city);
      }
      
      // Check last update time silently
      const lastUpdate = await githubDataService.getLastUpdateTime(city);
      
      const filters: SearchFilters = {};
      if (dateSelection) {
        filters.dateSelection = dateSelection;
      }
      if (dates) {
        filters.dates = dates;
      }
      const data = await apiService.getOpenMats(location, filters, true);
      setOpenMats(data);
      
      haptics.success(); // Success haptic for successful refresh
    } catch (error) {
      haptics.error(); // Error haptic for failed refresh
      // Show error toast
      setToastMessage('Failed to refresh data');
      setToastType('error');
      setShowToast(true);
    } finally {
      setRefreshing(false);
    }
  };

  const getFeeDisplay = (matFee: number, dropInFee?: number) => {
    // Open Mat Fee logic
    const openMatText = matFee === 0 ? "Open Mat - Free" :
                       matFee > 0 ? `Open Mat - $${matFee}` :
                       "Open Mat - ?";
    
    const openMatColor = matFee === 0 ? '#10B981' :
                        matFee > 0 ? '#111518' :
                        '#9CA3AF';
    
    // Drop in Fee logic
    const dropInText = dropInFee === 0 ? "Drop in - Free" :
                      dropInFee && dropInFee > 0 ? `Drop in - $${dropInFee}` :
                      "Drop in - ?";
    
    const dropInColor = dropInFee === 0 ? '#10B981' :
                       dropInFee && dropInFee > 0 ? '#111518' :
                       '#9CA3AF';
    
    return (
      <View style={styles.feeContainer}>
        <Text style={[styles.feeText, { color: openMatColor }]}>{openMatText}</Text>
        <Text style={[styles.feeText, { color: dropInColor }]}>{dropInText}</Text>
      </View>
    );
  };







  const getDateSelectionDisplay = (dateSelection: string): string => {
    switch (dateSelection) {
      case 'today':
        return 'Today';
      case 'tomorrow':
        return 'Tomorrow';
      case 'weekend':
        return 'This Weekend';
      case 'custom':
        return 'Selected Dates';
      default:
        return dateSelection;
    }
  };

  const getGymCountText = (count: number, location: string): string => {
    if (count === 0) {
      return `No gyms found in ${location}`;
    } else if (count === 1) {
      return `Showing 1 gym in ${location}`;
    } else {
      return `Showing ${count} gyms in ${location}`;
    }
  };

  const showFallbackAlert = (subject: string) => {
    Alert.alert(
      'Email Not Available',
      `Please email glootieapp@gmail.com\n\nSubject: ${subject}\n\nCopy the template and send it manually.`,
      [{ text: 'OK' }]
    );
  };









  const toggleFilter = (filterType: 'gi' | 'nogi') => {
    haptics.selection(); // Selection haptic for filter changes
    setActiveFilters(prev => {
      const newFilters = {
        ...prev,
        [filterType]: !prev[filterType]
      };
      return newFilters;
    });
  };

  const handleFreeFilter = () => {
    haptics.selection(); // Selection haptic for filter changes
    const newValue = !showFreeOnly;
    setShowFreeOnly(newValue);
    
    // Update active filters
    setActiveFilters(prev => ({
      ...prev,
      price: newValue ? 'free' : null
    }));
  };

  const handleFilterTap = (filterName: string) => {
    if (filterName === 'Free') {
      handleFreeFilter();
    }
  };





  // Group gyms by name to combine multiple sessions per gym
  const groupGymsByLocation = (gyms: OpenMat[]): OpenMat[] => {
    logger.group('Grouping gyms - input count:', { count: gyms.length });
    
    const grouped = gyms.reduce((acc, gym) => {
      if (!gym.name) {
        logger.warn('Gym without name found:', { id: gym.id });
        return acc;
      }
      
      // Use gym name as the grouping key
      const key = gym.name;
      const existing = acc.get(key);
      
      if (existing) {
        // Combine sessions from this gym with existing sessions
                  logger.group(`Combining sessions for ${gym.name}`, { newSessions: gym.openMats?.length || 0 });
        // Create new array instead of mutating existing one
        existing.openMats = [...existing.openMats, ...(gym.openMats || [])];
      } else {
        // First time seeing this gym, add it to the map
                  logger.add(`Adding new gym: ${gym.name}`, { sessions: gym.openMats?.length || 0 });
        // Create a new object with a new array to avoid mutations
        acc.set(key, { ...gym, openMats: [...(gym.openMats || [])] });
      }
      return acc;
    }, new Map<string, OpenMat>());
    
    // Convert map back to array and sort sessions within each gym
    const result = Array.from(grouped.values()).map(gym => ({
      ...gym,
      openMats: [...gym.openMats].sort((a, b) => {
        // Sort by day first, then by time
        const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const dayDiff = dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
        
        if (dayDiff !== 0) return dayDiff;
        
        // Same day, sort by time
        const getMinutesFromTime = (time: string): number => {
          const cleanTime = time.trim().toLowerCase();
          
          // Handle time ranges by taking start time
          const timeRangeMatch = cleanTime.match(/^(.+?)\s*-\s*(.+)$/);
          if (timeRangeMatch) {
            return getMinutesFromTime(timeRangeMatch[1]);
          }
          
          // Handle formats like "5:00 PM", "6pm", "12:30 AM"
          const match = cleanTime.match(/^(\d+):?(\d*)\s*(am|pm)$/);
          if (match) {
            let hours = parseInt(match[1]);
            const minutes = parseInt(match[2] || '0');
            const period = match[3]?.toUpperCase();
            
            if (period === 'PM' && hours !== 12) hours += 12;
            if (period === 'AM' && hours === 12) hours = 0;
            
            return hours * 60 + minutes;
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
        
        return getMinutesFromTime(a.time) - getMinutesFromTime(b.time);
      })
    }));
    
    logger.success('Grouping complete - output count:', { count: result.length });
    logger.debug('Gym details:', result.map(gym => ({
      name: gym.name,
      sessions: gym.openMats.length,
      sessionDetails: gym.openMats.map(session => `${session.day} ${session.time} (${session.type})`)
    })));
    
    return result;
  };

  // Memoize grouped gyms - only recalculates when openMats changes
  const groupedGyms = useMemo(() => {
    logger.group('Grouping gyms - input count:', { count: openMats.length });
    const grouped = groupGymsByLocation(openMats);
    logger.success('Grouping complete - output count:', { count: grouped.length });
    return grouped;
  }, [openMats]);

  // Memoize sorted gyms - only recalculates when groupedGyms changes
  const sortedGyms = useMemo(() => {
    logger.sort('Sorting gyms by next session');
    const sorted = sortByNextSession(groupedGyms);
    
    // Log the sorted order for debugging
    logger.sort('Sorted gyms by next session:', sorted.slice(0, 3).map((gym, index) => ({
      rank: index + 1,
      name: gym.name,
      sessions: gym.openMats.length,
      sessionDetails: gym.openMats.map(session => `${session.day} ${session.time} (${session.type})`)
    })));
    
    return sorted;
  }, [groupedGyms]);

  // Count sessions by type for filter pills
  const sessionCounts = useMemo(() => {
    let giCount = 0;
    let nogiCount = 0;
    
    // Count from sortedGyms (before filtering) to show total available sessions
    sortedGyms.forEach(gym => {
      gym.openMats.forEach(session => {
        if (session.type === 'gi') {
          giCount++;
        } else if (session.type === 'nogi') {
          nogiCount++;
        } else if (session.type === 'both' || session.type === 'Gi/NoGi') {
          // Count "both" and "Gi/NoGi" sessions in both totals
          giCount++;
          nogiCount++;
        }
      });
    });
    
    return { giCount, nogiCount };
  }, [sortedGyms]);

  // Filter gyms based on active filters (uses pre-sorted gyms)
  const filteredGyms = useMemo(() => {
    logger.filter('Filtering gyms - openMats count:', { count: openMats.length });
    logger.filter('Active filters:', activeFilters);
    
    // Start with pre-sorted gyms
    let filtered = sortedGyms;
    logger.filter('After grouping - unique gyms count:', { count: filtered.length });
    
    // Apply Gi/No-Gi filters with smart logic
    if (activeFilters.gi || activeFilters.nogi) {
      
      filtered = filtered.filter(gym => {
        // Check what session types this gym offers
        const sessionTypes = gym.openMats.map(mat => mat.type);
        const hasGi = sessionTypes.includes('gi');
        const hasNoGi = sessionTypes.includes('nogi');
        const hasBoth = sessionTypes.includes('both') || sessionTypes.includes('Gi/NoGi');
        
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
          filteredSessions = gym.openMats.filter(session => session.type === 'gi' || session.type === 'both' || session.type === 'Gi/NoGi');
        } else if (activeFilters.nogi && !activeFilters.gi) {
          // Only show No-Gi sessions
          filteredSessions = gym.openMats.filter(session => session.type === 'nogi' || session.type === 'both' || session.type === 'Gi/NoGi');
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
    
    logger.success('Filtered gyms count:', { count: filtered.length });
    return filtered;
  }, [sortedGyms, activeFilters]);





  // Helper to open website
  // Helper to copy gym details with state management
  const handleCopyGymWithState = async (gym: OpenMat) => {
    if (copyingGymId === gym.id) return; // Prevent multiple clicks
    
    setCopyingGymId(gym.id);
    try {
      await handleCopyGym(gym);
      setCopiedGymId(gym.id);
      // Reset icon after 2 seconds
      setTimeout(() => {
        setCopiedGymId(null);
      }, 2000);
    } catch (error) {
      // Error already handled in handleCopyGym
    } finally {
      setCopyingGymId(null);
    }
  };

  // Copy function that closes the modal
  const handleCopyAndCloseModal = async (gym: OpenMat) => {
    await handleCopyGymWithState(gym);
  };

  // Optimized image sharing function with immediate feedback
  const handleShareImage = async (gym: OpenMat) => {
    if (sharingGymId === gym.id) return; // Prevent multiple clicks
    
    haptics.light(); // Light haptic for button press
    setSharingGymId(gym.id); // Immediate loading state
    
    try {
      const firstSession = gym.openMats && gym.openMats.length > 0 ? gym.openMats[0] : null;
      
      if (!firstSession) {
        haptics.warning(); // Warning haptic for no sessions
        Alert.alert('No Sessions', 'No sessions available to share.');
        setSharingGymId(null);
        return;
      }

      logger.share('Setting ShareCard data:', { gym: gym.name, session: firstSession });
      
      // Set the gym and session for the ShareCard
      setShareCardGym(gym);
      setShareCardSession(firstSession);

      // Use requestAnimationFrame for better timing
      requestAnimationFrame(async () => {
        try {
          logger.capture('Capturing and sharing image...');
          
          // Capture the ShareCard as an image with optimized settings
          const imageUri = await captureCardAsImage(shareCardRef, {
            format: 'png',
            quality: 0.9, // Slightly reduced quality for faster processing
            width: 1080,
            height: 1920
          });
          
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
        } finally {
          setSharingGymId(null); // Always reset sharing state
        }
      });
      
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

  // Memoized GymCard component to prevent unnecessary re-renders
  const GymCard = memo(({ gym, favorites, toggleFavorite, copyingGymId, copiedGymId, sharingGymId, handleShareImage, gymLogos, handleHeartPress, animateScale, heartScaleAnim, copyScaleAnim, websiteScaleAnim, directionsScaleAnim, shareScaleAnim }: {
    gym: OpenMat;
    favorites: Set<string>;
    toggleFavorite: (id: string) => void;
    copyingGymId: string | null;
    copiedGymId: string | null;
    sharingGymId: string | null;
    handleShareImage: (gym: OpenMat) => void;
    gymLogos: Record<string, any>;
    handleHeartPress: (gym: OpenMat) => void;
    animateScale: (animValue: Animated.Value, scale: number) => void;
    heartScaleAnim: Animated.Value;
    copyScaleAnim: Animated.Value;
    websiteScaleAnim: Animated.Value;
    directionsScaleAnim: Animated.Value;
    shareScaleAnim: Animated.Value;
  }) => {
    return (
      <View key={gym.id} style={styles.card}>
        {/* Header: Gym Name + Logo */}
        <View style={styles.cardHeader}>
          {/* Left side - Gym name */}
          <View style={styles.gymNameContainer}>
            <Text style={styles.gymName}>{gym.name}</Text>
          </View>
          
          {/* Right side - Logo */}
          <View style={styles.logoContainer}>
            {gym.id.includes('10th-planet') ? (
              <Image source={tenthPlanetLogo} style={styles.gymLogo} />
            ) : gym.id.includes('stjj') ? (
              <Image source={stjjLogo} style={styles.gymLogo} />
            ) : false ? (
              <Image source={{ uri: gymLogos[gym.id] }} style={styles.gymLogo} />
            ) : (
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>
                  {gym.name.split(' ').map((word: string) => word[0]).join('').slice(0, 2).toUpperCase()}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Session Type Subtitle */}
        <Text style={styles.sessionSubtitle}>Open Mat Sessions</Text>

        {/* Sessions Section */}
        <View style={styles.sessionsSection}>
                        {gym.openMats.map((session: OpenMatSession, index: number) => (
            <View key={index} style={styles.sessionBlock}>
              <Text style={styles.dayHeader}>
                {session.day.toUpperCase()}
              </Text>
              <Text style={styles.timeRange}>
                {formatTimeRange(session.time)} • {getSessionTypeWithIcon(session.type)}
              </Text>
            </View>
          ))}
        </View>

        {/* Fees Section */}
        <View style={styles.feesSection}>
          <View style={styles.feesHeader}>
            <Text style={styles.feesTitle}>Fees</Text>
          </View>
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

        {/* Unified Button Bar */}
        <View style={styles.unifiedButtonBar}>
          {/* Website Button */}
          <Animated.View style={{ transform: [{ scale: websiteScaleAnim }] }}>
            <TouchableOpacity 
              style={[styles.iconButton, (!gym.website || gym.website.trim() === '') && styles.disabledIconButton]}
              onPress={() => {
                if (gym.website && gym.website.trim() !== '') {
                  openWebsite(gym.website);
                }
              }}
              disabled={!gym.website || gym.website.trim() === ''}
              onPressIn={() => animateScale(websiteScaleAnim, 0.95)}
              onPressOut={() => animateScale(websiteScaleAnim, 1.0)}
            >
              <Ionicons 
                name="globe-outline" 
                size={22} 
                color={(!gym.website || gym.website.trim() === '') ? '#9CA3AF' : '#111518'} 
              />
            </TouchableOpacity>
          </Animated.View>

          {/* Directions Button */}
          <Animated.View style={{ transform: [{ scale: directionsScaleAnim }] }}>
            <TouchableOpacity 
              style={[styles.iconButton, (!gym.address || gym.address === 'Tampa, FL' || gym.address === 'Austin, TX') && styles.disabledIconButton]}
              onPress={() => {
                if (gym.address && gym.address !== 'Tampa, FL' && gym.address !== 'Austin, TX') {
                  openDirections(gym.address);
                }
              }}
              disabled={!gym.address || gym.address === 'Tampa, FL' || gym.address === 'Austin, TX'}
              onPressIn={() => animateScale(directionsScaleAnim, 0.95)}
              onPressOut={() => animateScale(directionsScaleAnim, 1.0)}
            >
              <Ionicons 
                name="location-outline" 
                size={22} 
                color={(!gym.address || gym.address === 'Tampa, FL' || gym.address === 'Austin, TX') ? '#9CA3AF' : '#111518'} 
              />
            </TouchableOpacity>
          </Animated.View>

          {/* Heart Button */}
          <Animated.View style={{ transform: [{ scale: heartScaleAnim }] }}>
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={() => {
                haptics.light();
                handleHeartPress(gym);
              }}
              onPressIn={() => animateScale(heartScaleAnim, 0.95)}
              onPressOut={() => animateScale(heartScaleAnim, 1.0)}
            >
              <Text style={[
                styles.iconText, 
                styles.heartIcon,
                { color: favorites.has(gym.id) ? '#EF4444' : '#9CA3AF' }
              ]}>
                {favorites.has(gym.id) ? '♥' : '♡'}
              </Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Copy Button */}
          <Animated.View style={{ transform: [{ scale: copyScaleAnim }] }}>
            <TouchableOpacity 
              style={[styles.iconButton, copyingGymId === gym.id && styles.disabledIconButton]}
              onPress={() => handleCopyGymWithState(gym)}
              disabled={copyingGymId === gym.id || copiedGymId === gym.id}
              onPressIn={() => animateScale(copyScaleAnim, 0.95)}
              onPressOut={() => animateScale(copyScaleAnim, 1.0)}
            >
              {copyingGymId === gym.id ? (
                <ActivityIndicator size="small" color="#60798A" />
              ) : copiedGymId === gym.id ? (
                <Ionicons name="checkmark" size={22} color="#10B981" />
              ) : (
                <Ionicons name="copy-outline" size={22} color="#60798A" />
              )}
            </TouchableOpacity>
          </Animated.View>

          {/* Share Button */}
          <Animated.View style={{ transform: [{ scale: shareScaleAnim }] }}>
            <TouchableOpacity 
              style={[styles.iconButton, sharingGymId === gym.id && styles.disabledIconButton]}
              onPress={() => {
                haptics.light();
                handleShareImage(gym);
              }}
              disabled={sharingGymId === gym.id}
              onPressIn={() => animateScale(shareScaleAnim, 0.95)}
              onPressOut={() => animateScale(shareScaleAnim, 1.0)}
            >
              {sharingGymId === gym.id ? (
                <ActivityIndicator size="small" color="#111518" />
              ) : (
                <Ionicons name="share-outline" size={22} color="#111518" />
              )}
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
    );
  });

  // Navigate to map view
  const toggleViewMode = () => {
    haptics.light();
    findNavigation.navigate('MapView');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      {/* Header */}
      <Animated.View style={[styles.header, { opacity: headerAnim }]}>
        <TouchableOpacity
          onPress={() => navigation.navigate('Home')}
          activeOpacity={0.7}
        >
          <Image source={appIcon} style={styles.headerLogo} />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
                         <Text style={[styles.headerTitle, { color: theme.text.primary }]}>JiuJitsu Finder</Text>
          <Text style={styles.locationContext}>{getGymCountText(filteredGyms.length, location)}</Text>
          <Text style={[styles.headerSubtitle, { color: theme.text.secondary }]}> 
            {dateSelection && `${getDateSelectionDisplay(dateSelection)}`}
          </Text>
        </View>

      </Animated.View>

      {/* Filter Pills */}
      <Animated.View style={[styles.filterSection, { alignItems: 'center' }, { opacity: filterAnim }]}>
        <ScrollView 
          horizontal={true} 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[
            styles.filterContainer,
            {
              alignItems: 'center',
              paddingHorizontal: 16,
              paddingVertical: 8,
              marginTop: 3,
              marginBottom: 3,
              paddingRight: 24
            }
          ]}
          style={{ flexGrow: 0 }}
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
            onPress={() => toggleFilter('gi')}
            activeOpacity={0.7}
          >
            <Text 
              style={[
                styles.filterPillText,
                { 
                  color: activeFilters.gi ? '#FFFFFF' : '#60798A',
                  fontWeight: activeFilters.gi ? '700' : '500'
                }
              ]}
              numberOfLines={1}
            >
              Gi ({sessionCounts.giCount})
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
            onPress={() => toggleFilter('nogi')}
            activeOpacity={0.7}
          >
            <Text 
              style={[
                styles.filterPillText,
                { 
                  color: activeFilters.nogi ? '#FFFFFF' : '#60798A',
                  fontWeight: activeFilters.nogi ? '700' : '500'
                }
              ]}
              numberOfLines={1}
            >
              No-Gi ({sessionCounts.nogiCount})
            </Text>
          </TouchableOpacity>

          {/* Free Toggle Filter */}
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
            onPress={() => handleFilterTap('Free')}
            activeOpacity={0.7}
          >
            <Text 
              style={[
                styles.filterPillText,
                { 
                  color: activeFilters.price === 'free' ? '#FFFFFF' : '#60798A',
                  fontWeight: activeFilters.price === 'free' ? '700' : '500'
                }
              ]}
              numberOfLines={1}
            >
              Free
            </Text>
          </TouchableOpacity>

          {/* Map Toggle Button */}
          <TouchableOpacity 
            style={[
              styles.filterPill,
              {
                backgroundColor: '#F0F3F5',
                borderWidth: 1,
                borderColor: '#E0E0E0',
                marginRight: 4,
                shadowColor: 'transparent',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0,
                shadowRadius: 4,
                elevation: 0,
              }
            ]}
            onPress={toggleViewMode}
            activeOpacity={0.7}
          >
            <View style={styles.mapButtonContent}>
              <Text style={styles.mapText}>Map</Text>
            </View>
          </TouchableOpacity>



        </ScrollView>


      </Animated.View>

      {/* Content */}
      <Animated.View style={{ flex: 1, opacity: listAnim }}>
        {filteredGyms.length === 0 ? (
          // Enhanced Empty State
          <View style={styles.emptyStateContainer}>
          {/* Icon */}
          <View style={styles.emptyStateIconContainer}>
            <Ionicons 
              name="search-outline" 
              size={64} 
              color={theme.text.secondary} 
            />
          </View>
          
          {/* Title */}
          <Text style={[styles.emptyStateTitle, { color: theme.text.primary }]}>
            No open mats found
          </Text>
          
          {/* Dynamic Subtitle based on filters */}
          <Text style={[styles.emptyStateSubtitle, { color: theme.text.secondary }]}>
            {(() => {
              let subtitle = `No open mats in ${location}`;
              
              if (dateSelection) {
                subtitle += ` for ${getDateSelectionDisplay(dateSelection).toLowerCase()}`;
              }
              
              if (activeFilters.price === 'free') {
                subtitle = `No free open mats in ${location}`;
                if (dateSelection) subtitle += ` for ${getDateSelectionDisplay(dateSelection).toLowerCase()}`;
              }
              
              if (activeFilters.gi && !activeFilters.nogi) {
                subtitle = `No Gi-only sessions found in ${location}`;
                if (dateSelection) subtitle += ` for ${getDateSelectionDisplay(dateSelection).toLowerCase()}`;
              } else if (activeFilters.nogi && !activeFilters.gi) {
                subtitle = `No No-Gi sessions found in ${location}`;
                if (dateSelection) subtitle += ` for ${getDateSelectionDisplay(dateSelection).toLowerCase()}`;
              }
              
              return subtitle;
            })()}
          </Text>
          
          {/* Action Buttons */}
          <View style={styles.emptyStateButtons}>
            <TouchableOpacity 
              style={[styles.emptyStateButton, styles.secondaryButton]}
              onPress={() => {
                // Clear local filters
                setActiveFilters({
                  gi: false,
                  nogi: false,
                  price: null,
                });
                setShowFreeOnly(false);
                // Navigate back to TimeSelection to reset date selection
                findNavigation.navigate('TimeSelection');
              }}
            >
              <Text style={[styles.secondaryButtonText, { color: theme.text.primary }]}>Clear Filters</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.emptyStateButton, styles.secondaryButton]}
              onPress={() => findNavigation.navigate('TimeSelection')}
            >
              <Text style={[styles.secondaryButtonText, { color: theme.text.primary }]}>Change Day</Text>
            </TouchableOpacity>
          </View>
          
          {/* Suggestion Text */}
          <Text style={[styles.emptyStateSuggestion, { color: theme.text.secondary }]}>
            Try checking different days or clearing your filters
          </Text>
        </View>
      ) : isLoading ? (
        // Skeleton Loading State
        <FlatList
          data={Array.from({ length: 5 }, (_, i) => ({ id: i }))}
          keyExtractor={(item) => `skeleton-${item.id}`}
          renderItem={({ item, index }) => (
            <SkeletonCard index={index} />
          )}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
        />
      ) : (
        // Gym List (Original Card View)
        <FlatList
          data={filteredGyms}
          keyExtractor={(gym) => gym.name} // Use name since IDs are inconsistent
          renderItem={({ item: gym }) => (
            <GymCard
              gym={gym}
              favorites={favorites}
              toggleFavorite={toggleFavorite}
              copyingGymId={copyingGymId}
              copiedGymId={copiedGymId}
              sharingGymId={sharingGymId}
              handleShareImage={handleShareImage}
              gymLogos={gymLogos}
              handleHeartPress={handleHeartPress}
              animateScale={animateScale}
              heartScaleAnim={heartScaleAnim}
              copyScaleAnim={copyScaleAnim}
              websiteScaleAnim={websiteScaleAnim}
              directionsScaleAnim={directionsScaleAnim}
              shareScaleAnim={shareScaleAnim}
            />
          )}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          onEndReachedThreshold={0.1}
          // Performance optimization props
          initialNumToRender={5}      // Only render 5 cards initially
          maxToRenderPerBatch={10}    // Render 10 more as user scrolls
          windowSize={10}             // Keep 10 screens worth in memory
          removeClippedSubviews={true} // Remove offscreen views
          updateCellsBatchingPeriod={50} // Batch updates every 50ms
          maintainVisibleContentPosition={{ // Maintain scroll position
            minIndexForVisible: 0,
          }}
          // Estimated card height for better performance (card padding + content + margin)
          getItemLayout={(data, index) => ({
            length: 280, // Estimated card height based on content
            offset: 280 * index,
            index,
          })}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#10B981']}
              tintColor="#10B981"
              title="Pull to refresh"
              titleColor="#60798A"
            />
          }
        />
      )}
        </Animated.View>


      {/* Hidden ShareCard for image generation */}
      {(() => {
        if (shareCardGym && shareCardSession) {
          logger.render('Rendering ShareCard with ref:', { exists: shareCardRef.current ? 'exists' : 'null' });
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

      {/* Gym Details Modal */}
      <GymDetailsModal
        gym={selectedGym}
        visible={modalVisible}
        onClose={handleCloseModal}
        onHeartPress={selectedGym ? () => handleHeartPress(selectedGym) : undefined}
        isFavorited={selectedGym ? favorites.has(selectedGym.id) : false}
      />

      {/* Toast Notification */}
      <Toast
        visible={showToast}
        message={toastMessage}
        type={toastType}
        onHide={() => setShowToast(false)}
      />



      {/* Contact Footer */}
      <ContactFooter />

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    position: 'relative',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  backIcon: {
    fontSize: 24,
    fontWeight: '700',
  },
  headerTextContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 2,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    textAlign: 'center',
  },

  locationContext: {
    fontSize: 15,
    color: '#60798A',
    fontWeight: '500',
    marginBottom: 8,
    textAlign: 'center',
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 0,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  logoCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  logoText: {
    fontSize: 20,
    fontWeight: '700',
  },
  cardContent: {
    flex: 1,
    marginRight: 12,
    justifyContent: 'space-between',
    height: '100%',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  gymName: {
    fontSize: 21,
    fontWeight: '700',
    marginBottom: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  star: {
    color: '#FBBF24',
    fontSize: 16,
    marginRight: 2,
  },
  ratingText: {
    fontSize: 15,
    fontWeight: '600',
  },
  timeText: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    // Removed justifyContent: 'space-between' for left alignment
    marginBottom: 2,
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    fontWeight: '500',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 2,
  },
  priceText: {
    fontSize: 14,
    fontWeight: '600',
  },
  skillTagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  skillTag: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 4,
  },
  skillTagText: {
    fontSize: 13,
    fontWeight: '600',
  },

  navigateButton: {
    marginLeft: 12,
    alignSelf: 'center',
    borderRadius: 8,
    overflow: 'hidden',
  },
  navigateGradient: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navigateText: {
    fontSize: 15,
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    fontWeight: '500',
  },
  // Enhanced Empty State Styles
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 40,
  },
  emptyStateIconContainer: {
    marginBottom: 24,
    opacity: 0.6,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 32,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  emptyStateButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
    width: '100%',
  },
  emptyStateButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  primaryButton: {
    backgroundColor: selectionColor,
    shadowColor: selectionColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  secondaryButton: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptyStateSuggestion: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 16,
    opacity: 0.8,
  },
  suggestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 8,
    gap: 4,
  },
  suggestText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#60798A',
    textAlign: 'center',
  },
  suggestButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingHorizontal: 2,
  },
  mapButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  mapText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#60798A',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },

  filterContainer: {
    paddingVertical: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F0F3F5',
    marginRight: 4,
    minWidth: 60,
    minHeight: 44,
    flexShrink: 0,
  },
  filterPillText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111518',
    textAlign: 'center',
    flexShrink: 0,
  },
  filterArrow: {
    marginLeft: 6,
  },
  filterSection: {
    paddingHorizontal: 16,
    paddingVertical: 0,
    marginBottom: 0,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // New compact card styles
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  locationText: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
    marginRight: 8,
  },
  distanceText: {
    fontSize: 13,
    fontWeight: '500',
  },
  feeContainer: {
    marginBottom: 2,
  },
  feeText: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 1,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sessionTypeBadge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  sessionTypeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  logoBadgeContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoBadgeText: {
    fontSize: 20,
    fontWeight: '700',
  },
  // Expanded content styles
  expandedContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginVertical: 12,
  },
  websiteContainer: {
    marginBottom: 8,
  },
  websiteLink: {
    fontSize: 14,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  addressText: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
  },
  instructorText: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },

  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  // Card styles
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  gymNameContainer: {
    flex: 1,
    marginRight: 16,
  },
  logoContainer: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightSideContainer: {
    alignItems: 'flex-end',
  },

  logoHeartContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  logoPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  logoImage: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },

          sessionSubtitle: {
          fontSize: 14,
          color: '#60798A',
          fontStyle: 'italic',
          marginBottom: 10,    // Reduced from 12
        },
          sessionsSection: {
          marginBottom: 10,    // Reduced from 12
        },
  sessionBlock: {
    marginBottom: 8,
  },
  dayHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111518',
    marginBottom: 2,
  },
  timeRange: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111518',
    marginBottom: 2,
  },
  infoSection: {
    marginBottom: 12,
  },
          feesSection: {
          marginBottom: 10,
          backgroundColor: '#F9FAFB',  // Very light gray
          padding: 10,
          borderRadius: 8,
          marginHorizontal: -4,  // Extend to card edges
        },
  feesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  feesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111518',
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
  infoIcon: {
    fontSize: 18,
    marginRight: 6,
  },

          // Unified bottom button bar
        unifiedButtonBar: {
          flexDirection: 'row',
          justifyContent: 'space-evenly',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          paddingTop: 6,      // Reduced from 8
          marginTop: 8,       // Reduced from 12
          paddingHorizontal: 4,
        },

  // Individual icon button
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    minHeight: 44, // Accessibility minimum
    minWidth: 44, // Accessibility minimum
    width: 60,  // Fixed width instead of flex: 1
  },

  // Icon text styling
  iconText: {
    fontSize: 22,
    color: '#111518',
  },

  // Disabled icon button
  disabledIconButton: {
    opacity: 0.5,
  },

  // Disabled icon text
  disabledIconText: {
    color: '#9CA3AF',
  },

          // Keep the heart icon color
        heartIcon: {
          fontSize: 22,
          color: '#FF6B6B',
        },

  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',  // White background
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,  // Thin border
    borderColor: '#E5E7EB',  // Light gray border (or remove this line entirely)
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',  // Change to pure black for maximum contrast
  },
  gymLogo: {
    width: 56,
    height: 56,
    borderRadius: 28,
    resizeMode: 'contain',
  },



  lastUpdatedContainer: {
    paddingTop: 8,
    paddingBottom: 4,
  },
  lastUpdatedText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },

});

export default ResultsScreen; 