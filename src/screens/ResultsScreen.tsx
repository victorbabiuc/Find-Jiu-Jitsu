import React, { useState, useEffect, useMemo } from 'react';
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
  Clipboard,
  ScrollView,
  LayoutAnimation,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { useLoading } from '../context/LoadingContext';
import { useFindNavigation } from '../navigation/useNavigation';
import { beltColors } from '../utils/constants';
import { OpenMat } from '../types';
import { GymDetailsModal } from '../components';
import { apiService } from '../services';
import { FindStackRouteProp } from '../navigation/types';

const { width } = Dimensions.get('window');

interface ResultsScreenProps {
  route: FindStackRouteProp<'Results'>;
}

const ResultsScreen: React.FC<ResultsScreenProps> = ({ route }) => {
  const { theme } = useTheme();
  const { selectedLocation, userBelt, favorites, toggleFavorite } = useApp();
  const { showTransitionalLoading } = useLoading();
  const navigation = useFindNavigation();
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
  const [activeFilters, setActiveFilters] = useState({
    gi: false,
    nogi: false,
    price: null, // null, 'free', or 'paid'
    radius: null,
    timeOfDay: null
  });

  // Dropdown state
  const [showPriceDropdown, setShowPriceDropdown] = useState(false);
  const [selectedPrice, setSelectedPrice] = useState(null); // null, 'free', or 'paid'
  
  // Add state for dropdown positioning
  const [priceDropdownPosition, setPriceDropdownPosition] = useState({ x: 0, y: 0 });
  
  // Modal state
  const [selectedGym, setSelectedGym] = useState<OpenMat | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [suggestModalVisible, setSuggestModalVisible] = useState(false);
  


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

  // TEMPORARY: Load data once on mount to stop infinite loop
  useEffect(() => {
    const fetchData = async () => {
      console.log('🔄 ResultsScreen: Loading data once on mount');
      
      // Show transitional loading for data fetching
      showTransitionalLoading("Discovering open mat sessions...", 2000);
      
      try {
        setLoading(true);
        
        // Prepare filters object with date selection
        const filters: any = {};
        if (dateSelection) {
          filters.dateSelection = dateSelection;
        }
        if (dates) {
          filters.dates = dates;
        }
        
        const data = await apiService.getOpenMats(location, filters);
        console.log('✅ ResultsScreen: Data loaded successfully -', data.length, 'gyms');
        
        setOpenMats(data);
      } catch (error) {
        console.error('❌ ResultsScreen: Error fetching gyms:', error);
        setOpenMats([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Empty dependency array to run only once

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

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 3);
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
    switch (type) {
      case 'gi':
        return 'Gi 🥋';
      case 'nogi':
        return 'No-Gi 👕';
      case 'both':
        return 'Gi & No-Gi 🥋👕';
      default:
        return 'Open Mat 🥋👕';
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

  const handleSuggestGym = () => {
    setSuggestModalVisible(true);
  };

  const handleCopyEmail = async () => {
    try {
      await Clipboard.setString('glootieapp@gmail.com');
      Alert.alert('Email Copied', 'Email address copied to clipboard!');
    } catch (error) {
      console.error('Error copying email:', error);
      Alert.alert('Error', 'Failed to copy email address');
    }
  };

  const handleCloseSuggestModal = () => {
    setSuggestModalVisible(false);
  };

  const toggleFilter = (filterType: 'gi' | 'nogi') => {
    setActiveFilters(prev => ({
      ...prev,
      [filterType]: !prev[filterType]
    }));
  };

  const handlePriceFilter = (priceType: 'free' | 'paid') => {
    // Toggle behavior: if same option is selected, deselect it
    const newValue = selectedPrice === priceType ? null : priceType;
    setSelectedPrice(newValue);
    setShowPriceDropdown(false);
    
    // Update active filters
    setActiveFilters(prev => ({
      ...prev,
      price: newValue
    }));
  };

  const handleFilterTap = (filterName: string) => {
    console.log(`Filter tapped: ${filterName}`);
    
    if (filterName === 'Price') {
      console.log('Price clicked, toggling from:', showPriceDropdown);
      setShowPriceDropdown(!showPriceDropdown);
    } else {
      // TODO: Implement dropdown filters for Radius, Time of Day
    }
  };

  const handlePriceButtonLayout = (event: any) => {
    const { x, y, width, height } = event.nativeEvent.layout;
    setPriceDropdownPosition({ x, y: y + height });
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
        const hasBoth = sessionTypes.includes('both') || sessionTypes.includes('mixed');
        const hasUnknown = sessionTypes.some(type => !type || type === 'unknown' || type === '');
        
        if (activeFilters.gi && activeFilters.nogi) {
          // Show gyms that have EITHER Gi OR No-Gi OR both/mixed/unknown
          return hasGi || hasNoGi || hasBoth || hasUnknown;
        } else if (activeFilters.gi) {
          // Show gyms with Gi, both/mixed, or unknown types
          return hasGi || hasBoth || hasUnknown;
        } else if (activeFilters.nogi) {
          // Show gyms with No-Gi, both/mixed, or unknown types
          return hasNoGi || hasBoth || hasUnknown;
        }
        return false;
      });
    }
    
    // Apply price filter
    if (activeFilters.price === 'free') {
      filtered = filtered.filter(gym => gym.matFee === 0);
    } else if (activeFilters.price === 'paid') {
      filtered = filtered.filter(gym => gym.matFee > 0);
    }
    
    return filtered;
  }, [openMats, activeFilters]);

  // Show loading state - removed in favor of transitional loading
  if (loading) {
    return null; // Let transitional loading handle this
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Touch handler to close dropdown when clicking outside */}
      {showPriceDropdown && (
        <TouchableOpacity
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999
          }}
          activeOpacity={1}
          onPress={() => setShowPriceDropdown(false)}
        />
      )}
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={[styles.backIcon, { color: theme.text.primary }]}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={[styles.headerTitle, { color: theme.text.primary }]}>Open Mats Near You</Text>
          <View style={styles.headerSubtitleRow}>
            <Text style={[styles.headerSubtitle, { color: theme.text.secondary }]}> 
              {filteredGyms.length} results • {location}
              {dateSelection && ` • ${getDateSelectionDisplay(dateSelection)}`}
            </Text>
            <TouchableOpacity 
              style={styles.suggestionButton}
              onPress={handleSuggestGym}
              activeOpacity={0.7}
            >
              <Text style={styles.suggestionButtonText}>Suggestion +</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Filter Pills */}
      <View style={styles.filterSection}>
        <ScrollView 
          horizontal={true} 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContainer}
        >
          {/* Gi Toggle Filter */}
          <TouchableOpacity 
            style={[
              styles.filterPill,
              {
                backgroundColor: activeFilters.gi ? '#0C92F2' : '#F0F3F5',
                borderWidth: activeFilters.gi ? 0 : 1,
                borderColor: activeFilters.gi ? 'transparent' : '#E0E0E0',
                marginRight: 8,
                shadowColor: activeFilters.gi ? '#0C92F2' : 'transparent',
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
                backgroundColor: activeFilters.nogi ? '#0C92F2' : '#F0F3F5',
                borderWidth: activeFilters.nogi ? 0 : 1,
                borderColor: activeFilters.nogi ? 'transparent' : '#E0E0E0',
                marginRight: 8,
                shadowColor: activeFilters.nogi ? '#0C92F2' : 'transparent',
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

          {/* Price Dropdown Filter */}
          <TouchableOpacity 
            style={[
              styles.filterPill,
              {
                backgroundColor: activeFilters.price ? '#0C92F2' : '#F0F3F5',
                borderWidth: activeFilters.price ? 0 : 1,
                borderColor: activeFilters.price ? 'transparent' : '#E0E0E0',
              }
            ]}
            onPress={() => handleFilterTap('Price')}
            onLayout={handlePriceButtonLayout}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.filterPillText,
              { 
                color: activeFilters.price ? '#FFFFFF' : '#60798A',
                fontWeight: activeFilters.price ? '600' : '500'
              }
            ]}>
              {selectedPrice === null ? 'Price' : selectedPrice === 'free' ? 'Free' : '$$$'}
            </Text>
            <Ionicons 
              name="chevron-down" 
              size={16} 
              color={activeFilters.price ? '#FFFFFF' : '#60798A'} 
              style={styles.filterArrow} 
            />
          </TouchableOpacity>

          {/* Radius Dropdown Filter */}
          <TouchableOpacity 
            style={styles.filterPill}
            onPress={() => handleFilterTap('Radius')}
            activeOpacity={0.7}
          >
            <Text style={styles.filterPillText}>Radius</Text>
            <Ionicons name="chevron-down" size={16} color="#111518" style={styles.filterArrow} />
          </TouchableOpacity>

          {/* Time of Day Dropdown Filter */}
          <TouchableOpacity 
            style={styles.filterPill}
            onPress={() => handleFilterTap('Time of Day')}
            activeOpacity={0.7}
          >
            <Text style={styles.filterPillText}>Time of Day</Text>
            <Ionicons name="chevron-down" size={16} color="#111518" style={styles.filterArrow} />
          </TouchableOpacity>
        </ScrollView>

        {/* Price Dropdown Menu - Rendered outside ScrollView */}
        {showPriceDropdown && (
          <View style={{
            position: 'absolute',
            top: priceDropdownPosition.y,
            left: priceDropdownPosition.x,
            backgroundColor: '#FFFFFF',
            borderRadius: 8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 5,
            minWidth: 120,
            zIndex: 1000,
            borderWidth: 1,
            borderColor: '#E0E0E0'
          }}>
            <TouchableOpacity
              onPress={() => {
                handlePriceFilter('free');
                setShowPriceDropdown(false);
              }}
              style={{ 
                padding: 12, 
                borderBottomWidth: 1, 
                borderBottomColor: '#F0F3F5',
                backgroundColor: selectedPrice === 'free' ? '#F8FAFC' : 'transparent'
              }}
            >
              <Text style={{ 
                color: selectedPrice === 'free' ? '#0C92F2' : '#111518',
                fontWeight: selectedPrice === 'free' ? '600' : 'normal'
              }}>
                Free
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => {
                handlePriceFilter('paid');
                setShowPriceDropdown(false);
              }}
              style={{ 
                padding: 12,
                backgroundColor: selectedPrice === 'paid' ? '#F8FAFC' : 'transparent'
              }}
            >
              <Text style={{ 
                color: selectedPrice === 'paid' ? '#0C92F2' : '#111518',
                fontWeight: selectedPrice === 'paid' ? '600' : 'normal'
              }}>
                $$$
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Content */}
      {filteredGyms.length === 0 ? (
        // Empty state
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: theme.text.primary }]}>
            No open mats found in {location}
            {dateSelection && ` for ${getDateSelectionDisplay(dateSelection).toLowerCase()}`}
          </Text>
          <Text style={[styles.emptySubtext, { color: theme.text.secondary }]}>
            {dateSelection 
              ? 'Try selecting a different date or check other days of the week.'
              : 'Check back soon or add a gym in your city!'
            }
          </Text>
        </View>
      ) : (
        // Gym List
        <FlatList
          data={filteredGyms}
          keyExtractor={(gym) => gym.id}
          renderItem={({ item: gym }) => (
            <View key={gym.id} style={styles.card}>
              {/* Header: Gym Name + Heart Button */}
              <View style={styles.cardHeader}>
                <Text style={styles.gymName}>{gym.name}</Text>
                <TouchableOpacity 
                  style={styles.heartButton}
                  onPress={() => handleHeartPress(gym)}
                >
                  <Text style={styles.heartIcon}>
                    {favorites.has(gym.id) ? '♥' : '♡'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Session Type Subtitle */}
              <Text style={styles.sessionSubtitle}>Open Mat Session</Text>

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

              {/* Info Section */}
              <View style={styles.infoSection}>
                {/* Fees Section */}
                <View style={styles.feesSection}>
                  <View style={styles.feesHeader}>
                    <Text style={styles.infoIcon}>💵</Text>
                    <Text style={styles.infoText}>Fees</Text>
                  </View>
                  <View style={styles.feeItem}>
                    <Text style={styles.feeLabel}>Open mat - </Text>
                    <Text style={styles.feeValue}>
                      {gym.matFee === 0 ? 'Free' : gym.matFee ? `$${gym.matFee}` : '?/unknown'}
                    </Text>
                  </View>
                  <View style={styles.feeItem}>
                    <Text style={styles.feeLabel}>Class Drop in - </Text>
                    <Text style={styles.feeValue}>
                      {gym.dropInFee === 0 ? 'Free' : gym.dropInFee ? `$${gym.dropInFee}` : '?/unknown'}
                    </Text>
                  </View>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoIcon}>📍</Text>
                  <Text style={styles.infoText}>{gym.distance} miles • {location}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoIcon}>⚠️</Text>
                  <Text style={styles.infoText}>Waiver required on arrival</Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.buttonRow}>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => {
                    // TODO: Implement call functionality
                    Alert.alert('Call Gym', 'Call functionality coming soon!');
                  }}
                >
                  <Text style={styles.buttonText}>📞 Call</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.actionButton, styles.middleButton]}
                  onPress={() => handleHeartPress(gym)}
                >
                  <Text style={styles.buttonText}>
                    {favorites.has(gym.id) ? '💾 Saved' : '💾 Save'}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => {
                    // TODO: Implement directions functionality
                    Alert.alert('Get Directions', 'Directions functionality coming soon!');
                  }}
                >
                  <Text style={styles.buttonText}>🧭 Go</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          onEndReachedThreshold={0.1}
        />
      )}

      {/* Gym Details Modal */}
      <GymDetailsModal
        gym={selectedGym}
        visible={modalVisible}
        onClose={handleCloseModal}
        onHeartPress={selectedGym ? () => handleHeartPress(selectedGym) : undefined}
        isFavorited={selectedGym ? favorites.has(selectedGym.id) : false}
      />

      {/* Suggest Gym Modal */}
      <Modal
        visible={suggestModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCloseSuggestModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.suggestModal}>
            <Text style={styles.suggestModalTitle}>Send gym suggestions to:</Text>
            <Text style={styles.suggestModalEmail}>glootieapp@gmail.com</Text>
            <Text style={styles.suggestModalNote}>Include gym name, location, and schedule</Text>
            
            <View style={styles.suggestModalButtons}>
              <TouchableOpacity
                style={styles.copyEmailButton}
                onPress={handleCopyEmail}
                activeOpacity={0.8}
              >
                <Text style={styles.copyEmailButtonText}>Copy Email</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleCloseSuggestModal}
                activeOpacity={0.8}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    gap: 12,
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
  },
  headerSubtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  suggestionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F0F3F5',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginLeft: 8,
  },
  suggestionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#60798A',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    marginBottom: 16,
    padding: 16,
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
    justifyContent: 'space-between',
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
  heartButton: {
    padding: 4,
    marginLeft: 8,
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
  suggestModal: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    width: '80%',
    maxHeight: '80%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  suggestModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
    color: '#1F2937',
    textAlign: 'center',
  },
  suggestModalEmail: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#0C92F2',
    textAlign: 'center',
  },
  suggestModalNote: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 20,
    color: '#6B7280',
    textAlign: 'center',
  },
  suggestModalButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  copyEmailButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#0C92F2',
  },
  copyEmailButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: 'white',
  },
  closeButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#6B7280',
  },
  closeButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: 'white',
  },
  filterContainer: {
    paddingVertical: 12,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F0F3F5',
    marginRight: 12,
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
    paddingVertical: 12,
    marginBottom: 8,
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
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  // Premium card styles
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
  instructorText: {
    fontSize: 13,
    color: '#60798A',
    fontStyle: 'italic',
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
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F0F3F5',
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  middleButton: {
    marginHorizontal: 6,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111518',
  },
});

export default ResultsScreen; 