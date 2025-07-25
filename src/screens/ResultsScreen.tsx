import React, { useState, useEffect, useMemo, useRef } from 'react';
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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { useLoading } from '../context/LoadingContext';
import { useFindNavigation } from '../navigation/useNavigation';
import { beltColors } from '../utils/constants';
import { OpenMat } from '../types';
import { GymDetailsModal, ShareCard } from '../components';
import { apiService, gymLogoService } from '../services';
import { githubDataService } from '../services/github-data.service';
import { FindStackRouteProp } from '../navigation/types';
import { captureAndShareCard } from '../utils/screenshot';
import tenthPlanetLogo from '../../assets/logos/10th-planet-austin.png';
import stjjLogo from '../../assets/logos/STJJ.png';
import appIcon from '../../assets/icon.png';

const { width } = Dimensions.get('window');

interface ResultsScreenProps {
  route: FindStackRouteProp<'Results'>;
}

const ResultsScreen: React.FC<ResultsScreenProps> = ({ route }) => {
  const { theme } = useTheme();
  const { selectedLocation, userBelt, favorites, toggleFavorite } = useApp();
  const { showTransitionalLoading } = useLoading();
  const findNavigation = useFindNavigation();
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
  const [loading, setLoading] = useState(true);
  
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
  const shareCardRef = useRef<View>(null);
  const [shareCardGym, setShareCardGym] = useState<OpenMat | null>(null);
  const [shareCardSession, setShareCardSession] = useState<any>(null);

  // Component lifecycle tracking removed for production

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
      showTransitionalLoading("Discovering open mat sessions...", 2000);
      try {
        setLoading(true);
        
        // Determine city from location string
        const city = location.toLowerCase().includes('austin') ? 'austin' : 
                     location.toLowerCase().includes('tampa') ? 'tampa' : 'tampa';
        
        // Force refresh data from GitHub
        await githubDataService.refreshData(city);
        
        // Check last update time silently
        const lastUpdate = await githubDataService.getLastUpdateTime(city);
        
        const filters: any = {};
        if (dateSelection) {
          filters.dateSelection = dateSelection;
        }
        if (dates) {
          filters.dates = dates;
        }
        const data = await apiService.getOpenMats(location, filters, true);
        setOpenMats(data);
      } catch (error) {
        setOpenMats([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [location, dateSelection, paramsKey]);

  const handleGymPress = (gym: OpenMat) => {
    setSelectedGym(gym);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedGym(null);
  };

  const handleHeartPress = (gym: OpenMat) => {
    toggleFavorite(gym.id);
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



  const formatOpenMats = (openMats: any[]) => {
    return openMats.map(mat => `${mat.day} ${mat.time}`).join(', ');
  };

  const formatSessionsList = (openMats: any[]) => {
    return openMats.map(mat => {
      const day = mat.day;
      const time = mat.time;
      const type = mat.type === 'gi' ? 'Gi' : mat.type === 'nogi' ? 'No-Gi' : 'Mixed';
      return `${day} ${time} - ${type}`;
    });
  };

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

  const getMatTypeDisplay = (openMats: any[]) => {
    const types = openMats.map(mat => mat.type);
    if (types.includes('both')) return 'Gi & No-Gi';
    if (types.includes('gi') && types.includes('nogi')) return 'Gi & No-Gi';
    if (types.includes('gi')) return 'Gi Only';
    if (types.includes('nogi')) return 'No-Gi Only';
    return 'Mixed';
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

  const showFallbackAlert = (subject: string) => {
    Alert.alert(
      'Email Not Available',
      `Please email glootieapp@gmail.com\n\nSubject: ${subject}\n\nCopy the template and send it manually.`,
      [{ text: 'OK' }]
    );
  };







  const toggleFilter = (filterType: 'gi' | 'nogi') => {
    setActiveFilters(prev => {
      const newFilters = {
        ...prev,
        [filterType]: !prev[filterType]
      };
      return newFilters;
    });
  };

  const handleFreeFilter = () => {
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





  // Filter and sort gyms based on active filters
  const filteredGyms = useMemo(() => {
    let filtered = [...openMats];
    
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
    
    // Sort gyms by their earliest session time within the selected date range
    filtered.sort((a, b) => {
      // Get the earliest session for each gym
      const earliestSessionA = a.openMats[0]; // Sessions are already sorted by day
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
    
    // Gym sorting completed silently
    
    return filtered;
  }, [openMats, activeFilters]);

  // Show loading state - removed in favor of transitional loading
  if (loading) {
    return null; // Let transitional loading handle this
  }

  // Helper to open website
  const openWebsite = (url: string) => {
    if (url) Linking.openURL(url);
  };

  // Helper to open directions
  const openDirections = (address: string) => {
    if (!address || address === 'Tampa, FL' || address === 'Austin, TX') return;
    const url = `https://maps.apple.com/?q=${encodeURIComponent(address)}`;
    Linking.openURL(url);
  };

  // Helper to copy gym details
  const handleCopyGym = async (gym: OpenMat) => {
    try {
      const firstSession = gym.openMats && gym.openMats.length > 0 ? gym.openMats[0] : null;
      const sessionInfo = firstSession ? `📅 ${firstSession.day.toUpperCase()}, ${firstSession.time}` : '';
      
      const copyText = `🥋 ${gym.name} - Open Mat
${sessionInfo}
👕 ${firstSession ? (firstSession.type === 'gi' ? 'Gi' : firstSession.type === 'nogi' ? 'No-Gi' : 'Gi & No-Gi') : 'Session'}
💵 Open mat: ${gym.matFee === 0 ? 'Free' : gym.matFee ? `$${gym.matFee}` : 'Contact gym'}
📍 ${gym.address}
🏃 I'm going, come train with me!
📱 Get the app: https://bit.ly/40DjTlM`;

      await Clipboard.setStringAsync(copyText);
      // Copy silently to avoid UI blocking
      console.log('Copied to clipboard successfully');
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  // Copy function that closes the modal
  const handleCopyAndCloseModal = async (gym: OpenMat) => {
    await handleCopyGym(gym);
    setShowShareOptions(false);
  };

  // Direct image sharing function
  const handleShareImage = async (gym: OpenMat) => {
    try {
      const firstSession = gym.openMats && gym.openMats.length > 0 ? gym.openMats[0] : null;
      
      if (!firstSession) {
        Alert.alert('No Sessions', 'No sessions available to share.');
        return;
      }

      // Set the gym and session for the ShareCard
      setShareCardGym(gym);
      setShareCardSession(firstSession);

      // Wait a moment for the ShareCard to render, then capture
      setTimeout(async () => {
        try {
          await captureAndShareCard(shareCardRef, gym, firstSession);
        } catch (error) {
          Alert.alert(
            'Sharing Error',
            'Failed to create and share the image. Please try again.',
            [{ text: 'OK' }]
          );
        }
      }, 100);
    } catch (error) {
      Alert.alert(
        'Sharing Error',
        'Failed to create and share the image. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => findNavigation.navigate('Home')}
          activeOpacity={0.7}
        >
          <Image source={appIcon} style={styles.headerLogo} />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={[styles.headerTitle, { color: theme.text.primary }]}>Find Jiu Jitsu</Text>
          <Text style={styles.locationContext}>Showing gyms in {location}</Text>
          <Text style={[styles.headerSubtitle, { color: theme.text.secondary }]}> 
            {filteredGyms.length} results • {location}
            {dateSelection && ` • ${getDateSelectionDisplay(dateSelection)}`}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.envelopeButton}
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

      {/* Filter Pills */}
      <View style={[styles.filterSection, { alignItems: 'center' }]}>
        <ScrollView 
          horizontal={true} 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[
            styles.filterContainer,
            {
              justifyContent: 'center',
              alignItems: 'center',
              paddingHorizontal: 16,
              paddingVertical: 8,
              marginTop: 3, // was 5
              marginBottom: 3 // was 5
            }
          ]}
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
            onPress={() => toggleFilter('nogi')}
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

          {/* Free Toggle Filter */}
          <TouchableOpacity 
            style={[
              styles.filterPill,
              {
                backgroundColor: activeFilters.price === 'free' ? '#374151' : '#F0F3F5',
                borderWidth: activeFilters.price === 'free' ? 0 : 1,
                borderColor: activeFilters.price === 'free' ? 'transparent' : '#E0E0E0',
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

      {/* Content */}
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
      ) : (
        // Gym List
        <FlatList
          data={filteredGyms}
          keyExtractor={(gym) => gym.id}
          renderItem={({ item: gym }) => {
            return (
            <View key={gym.id} style={styles.card}>
              {/* Header: Logo/Avatar + Gym Name + Heart */}
              <View style={styles.cardHeader}>
                {gym.id.includes('10th-planet') ? (
                  <Image source={tenthPlanetLogo} style={styles.gymLogo} />
                ) : gym.id.includes('stjj') ? (
                  <Image source={stjjLogo} style={styles.gymLogo} />
                ) : gymLogos[gym.id] ? (
                  <Image source={{ uri: gymLogos[gym.id] }} style={styles.gymLogo} />
                ) : (
                  <View style={styles.avatarCircle}>
                    <Text style={styles.avatarText}>{gymLogoService.getInitials(gym.name)}</Text>
                  </View>
                )}
                <Text style={styles.gymName}>{gym.name}</Text>
                <View style={styles.logoHeartContainer}>
                  <TouchableOpacity 
                    style={styles.heartButton}
                    onPress={() => handleHeartPress(gym)}
                  >
                    <Text style={styles.heartIcon}>
                      {favorites.has(gym.id) ? '♥' : '♡'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.copyButton}
                    onPress={() => handleCopyAndCloseModal(gym)}
                  >
                    <Ionicons name="copy-outline" size={20} color="#60798A" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Session Type Subtitle */}
              <Text style={styles.sessionSubtitle}>Open Mat Sessions</Text>

              {/* Sessions Section */}
              <View style={styles.sessionsSection}>
                {gym.openMats.map((session, index) => (
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
                  <Text style={styles.infoIcon}>💵</Text>
                  <Text style={styles.infoText}>Fees</Text>
                </View>
                <View style={styles.feeItem}>
                  <Text style={styles.feeLabel}>Open mat - </Text>
                  <Text style={[styles.feeValue, gym.matFee === 0 && { color: '#10B981' }]}> {/* Green if free */}
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

              {/* Compact Location/Waiver Row */}
              <View style={styles.infoRow}>
                <Text style={styles.infoIcon}>⚠️</Text>
                <Text style={[styles.infoText, { marginLeft: 4 }]}>Waiver required</Text>
              </View>

              {/* Action Buttons */}
              <View style={styles.buttonRow}>
                {gym.website && (
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => openWebsite(gym.website)}
                  >
                    <Text style={styles.buttonText}>🌐 Website</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity 
                  style={[styles.actionButton, (!gym.address || gym.address === 'Tampa, FL' || gym.address === 'Austin, TX') && styles.disabledButton]}
                  onPress={() => openDirections(gym.address)}
                  disabled={!gym.address || gym.address === 'Tampa, FL' || gym.address === 'Austin, TX'}
                >
                  <Text style={[styles.buttonText, (!gym.address || gym.address === 'Tampa, FL' || gym.address === 'Austin, TX') && styles.disabledText]}>📍 Directions</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => handleShareImage(gym)}
                >
                  <Text style={styles.buttonText}>↗️ Share</Text>
                </TouchableOpacity>
              </View>
            </View>
            );
          }}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          onEndReachedThreshold={0.1}
        />
      )}


      {/* Hidden ShareCard for image generation */}
      {shareCardGym && shareCardSession && (
        <View style={{ position: 'absolute', left: -9999, top: -9999 }}>
          <ShareCard 
            ref={shareCardRef}
            gym={shareCardGym}
            session={shareCardSession}
            includeImGoing={true}
          />
        </View>
      )}

      {/* Gym Details Modal */}
      <GymDetailsModal
        gym={selectedGym}
        visible={modalVisible}
        onClose={handleCloseModal}
        onHeartPress={selectedGym ? () => handleHeartPress(selectedGym) : undefined}
        isFavorited={selectedGym ? favorites.has(selectedGym.id) : false}
      />

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
    justifyContent: 'space-between',
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
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 16,
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
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    textAlign: 'center',
  },
  envelopeButton: {
    padding: 8,
    marginLeft: 16,
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
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    fontSize: 18,
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
  copyButton: {
    padding: 4,
    marginLeft: 4,
  },
  heartButton: {
    padding: 4,
    marginRight: 4,
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
    backgroundColor: '#0C92F2',
    shadowColor: '#0C92F2',
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
    fontSize: 13,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },

  filterContainer: {
    paddingVertical: 0,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14, // was 20
    paddingVertical: 6, // was 10
    borderRadius: 20,
    backgroundColor: '#F0F3F5',
    marginRight: 8, // was 16
  },
  filterPillText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111518',
  },
  filterArrow: {
    marginLeft: 6,
  },
  filterSection: {
    paddingHorizontal: 16,
    paddingVertical: 0,
    marginBottom: 0,
    position: 'relative',
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
  heartIcon: {
    fontSize: 24,
    color: '#FF6B6B',
  },
  sessionSubtitle: {
    fontSize: 14,
    color: '#60798A',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  sessionsSection: {
    marginBottom: 12,
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
    marginBottom: 12,
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
  infoIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minHeight: 36,
  },
  buttonText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#111518',
    textAlign: 'center',
  },
  disabledButton: {
    backgroundColor: '#F3F4F6',
    borderColor: '#D1D5DB',
    opacity: 0.7,
  },
  disabledText: {
    color: '#9CA3AF',
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
  },
  gymLogo: {
    width: 36,
    height: 36,
    borderRadius: 18,
    resizeMode: 'contain',
    marginRight: 10,
  },
});

export default ResultsScreen; 