import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Dimensions,
  SafeAreaView,
  Alert,
  Image,
  RefreshControl,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { useLoading } from '../context/LoadingContext';
import { useMainTabNavigation } from '../navigation/useNavigation';
import { beltColors, haptics, animations } from '../utils';
import { OpenMat, OpenMatSession } from '../types';
import { GymDetailsModal, ContactFooter } from '../components';
import { apiService, gymLogoService } from '../services';
import tenthPlanetLogo from '../../assets/logos/10th-planet-austin.png';
import stjjLogo from '../../assets/logos/STJJ.png';

const { width } = Dimensions.get('window');

const SavedScreen: React.FC = () => {
  const { theme } = useTheme();
  const { favorites, toggleFavorite, userBelt, selectedLocation } = useApp();
  const { showTransitionalLoading } = useLoading();
  const navigation = useMainTabNavigation();
  const beltColor = beltColors[userBelt];
  
  // State for saved gyms data
  const [savedGyms, setSavedGyms] = useState<OpenMat[]>([]);

  const [refreshing, setRefreshing] = useState(false);
  
  // Modal state
  const [selectedGym, setSelectedGym] = useState<OpenMat | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  
  // Gym logo state
  const [gymLogos, setGymLogos] = useState<Record<string, string>>({});
  
  // Animation values
  const headerAnim = useRef(new Animated.Value(0)).current;
  const listAnim = useRef(new Animated.Value(0)).current;
  const heartScaleAnim = useRef(new Animated.Value(1)).current;
  // const heartColorAnim = useRef(new Animated.Value(1)).current; // Temporarily disabled

  // Fetch saved gyms data
  useEffect(() => {
    const fetchSavedGyms = async () => {
      try {
        // Get all gyms from API and filter by favorites
        const location = selectedLocation || 'Tampa';
        const allGyms = await apiService.getOpenMats(location); // We'll need to handle multiple locations
        const saved = allGyms.filter(gym => favorites.has(gym.id));
        setSavedGyms(saved);
      } catch (error) {
        console.error('Error fetching saved gyms:', error);
        setSavedGyms([]);
      }
    };

    fetchSavedGyms();
  }, [favorites, selectedLocation]);

  // Entrance animations
  useEffect(() => {
    const runEntranceAnimations = async () => {
      // Stagger the animations for a smooth entrance
      animations.stagger(
        [headerAnim, listAnim],
        (value, index) => animations.fadeIn(value, 400, index * 100)
      ).start();
    };

    runEntranceAnimations();
  }, []);

  // Load gym logos when savedGyms data changes
  useEffect(() => {
    const loadGymLogos = async () => {
      const logoUrls: Record<string, string> = {};
      
      for (const gym of savedGyms) {
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

    if (savedGyms.length > 0) {
      loadGymLogos();
    }
  }, [savedGyms]);

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
      // Get all gyms from API and filter by favorites
      const location = selectedLocation || 'Tampa';
      const allGyms = await apiService.getOpenMats(location);
      const saved = allGyms.filter(gym => favorites.has(gym.id));
      setSavedGyms(saved);
      haptics.success(); // Success haptic for successful refresh
    } catch (error) {
      console.error('Error refreshing saved gyms:', error);
      haptics.error(); // Error haptic for failed refresh
    } finally {
      setRefreshing(false);
    }
  };

  const getPriceDisplay = (matFee: number) => {
    if (matFee === 0) {
      return (
        <View style={styles.priceRow}>
          <View style={[styles.dot, { backgroundColor: '#10B981' }]} />
          <Text style={[styles.priceText, { color: '#10B981' }]}>Free</Text>
        </View>
      );
    }
    return (
      <View style={styles.priceRow}>
        <View style={[styles.dot, { backgroundColor: '#10B981' }]} />
        <Text style={[styles.priceText, { color: '#10B981' }]}>${matFee}</Text>
      </View>
    );
  };



  const formatOpenMats = (openMats: OpenMatSession[]) => {
    return openMats.map(mat => `${mat.day} ${mat.time}`).join(', ');
  };





  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Header */}
      <Animated.View style={[{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 24, paddingBottom: 12 }, { opacity: headerAnim }]}>
        <Text style={{ fontSize: 22, fontWeight: '700', color: theme.text.primary }}>Saved Gyms</Text>
      </Animated.View>

      {/* Content */}
      <Animated.View style={{ flex: 1, opacity: listAnim }}>
        {savedGyms.length === 0 ? (
        // Empty state
        <View style={styles.emptyContainer}>
          <Ionicons 
            name="heart-outline" 
            size={64} 
            color={theme.text.secondary} 
            style={styles.emptyIcon}
          />
          <Text style={[styles.emptyText, { color: theme.text.primary }]}>No saved gyms yet</Text>
          <Text style={[styles.emptySubtext, { color: theme.text.secondary }]}>
            Heart gyms you like to save them here
          </Text>

        </View>
      ) : (
        // Saved Gyms List
        <FlatList
          data={savedGyms}
          keyExtractor={(gym) => gym.id}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
          bounces={true}
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
          renderItem={({ item: gym }) => (
            <TouchableOpacity
              style={[styles.card, { backgroundColor: theme.surface, borderLeftColor: beltColor.primary }]}
              activeOpacity={0.85}
              onPress={() => handleGymPress(gym)}
            >
              {/* Logo/Initials */}
              {gym.id.includes('10th-planet') ? (
                <Image source={tenthPlanetLogo} style={styles.logoCircle} />
              ) : gym.id.includes('stjj') ? (
                <Image source={stjjLogo} style={styles.logoCircle} />
              ) : gymLogos[gym.id] ? (
                <Image source={{ uri: gymLogos[gym.id] }} style={styles.logoCircle} />
              ) : (
                <LinearGradient
                  colors={[beltColor.primary, beltColor.secondary]}
                  style={styles.logoCircle}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={[styles.logoText, { color: beltColor.textOnColor }]}> 
                    {gymLogoService.getInitials(gym.name)}
                  </Text>
                </LinearGradient>
              )}
              
              {/* Card Content */}
              <View style={styles.cardContent}>
                <View style={styles.cardHeaderRow}>
                  <Text style={[styles.gymName, { color: theme.text.primary }]} numberOfLines={1}>{gym.name}</Text>
                  <View style={styles.ratingRow}>
                    <Text style={styles.star}>📍</Text>
                    <Text style={[styles.ratingText, { color: theme.text.secondary }]}>{gym.distance} mi</Text>
                  </View>
                </View>
                <Text style={[styles.timeText, { color: theme.text.secondary }]} numberOfLines={1}>{formatOpenMats(gym.openMats)}</Text>
                <View style={styles.cardFooter}>
                  {getPriceDisplay(gym.matFee)}
                  <Animated.View style={{ transform: [{ scale: heartScaleAnim }] }}>
                    <TouchableOpacity
                      style={styles.heartButton}
                      onPress={() => handleHeartPress(gym)}
                      activeOpacity={0.7}
                    >
                      <Ionicons 
                        name="heart" 
                        size={20} 
                        color="#EF4444"
                      />
                    </TouchableOpacity>
                  </Animated.View>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
        </Animated.View>

      {/* Gym Details Modal */}
      {selectedGym && (
        <GymDetailsModal
          gym={selectedGym}
          visible={modalVisible}
          onClose={handleCloseModal}
          onHeartPress={() => handleHeartPress(selectedGym)}
          isFavorited={favorites.has(selectedGym.id)}
        />
      )}

      {/* Contact Footer */}
      <ContactFooter />

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '400',
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    fontWeight: '400',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },

  scrollContent: {
    padding: 20,
  },
  card: {
    flexDirection: 'row',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  logoText: {
    fontSize: 16,
    fontWeight: '700',
  },
  cardContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  gymName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    fontSize: 12,
    marginRight: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '500',
  },
  timeText: {
    fontSize: 14,
    fontWeight: '400',
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  priceText: {
    fontSize: 12,
    fontWeight: '600',
  },
  heartButton: {
    padding: 12,
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default SavedScreen; 