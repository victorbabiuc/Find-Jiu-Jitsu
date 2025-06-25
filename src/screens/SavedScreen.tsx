import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { useMainTabNavigation } from '../navigation/useNavigation';
import { beltColors } from '../utils/constants';
import { OpenMat } from '../types';
import { GymDetailsModal } from '../components';
import { apiService } from '../services';

const { width } = Dimensions.get('window');

const SavedScreen: React.FC = () => {
  const { theme } = useTheme();
  const { favorites, toggleFavorite, userBelt } = useApp();
  const navigation = useMainTabNavigation();
  const beltColor = beltColors[userBelt];
  
  // State for saved gyms data
  const [savedGyms, setSavedGyms] = useState<OpenMat[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [selectedGym, setSelectedGym] = useState<OpenMat | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Fetch saved gyms data
  useEffect(() => {
    const fetchSavedGyms = async () => {
      try {
        setLoading(true);
        // Get all gyms from API and filter by favorites
        const allGyms = await apiService.getOpenMats('Tampa'); // We'll need to handle multiple locations
        const saved = allGyms.filter(gym => favorites.has(parseInt(gym.id)));
        setSavedGyms(saved);
      } catch (error) {
        console.error('Error fetching saved gyms:', error);
        setSavedGyms([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSavedGyms();
  }, [favorites]);

  const handleGymPress = (gym: OpenMat) => {
    setSelectedGym(gym);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedGym(null);
  };

  const handleHeartPress = (gym: OpenMat) => {
    toggleFavorite(parseInt(gym.id));
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

  const handleFindMats = () => {
    navigation.navigate('Find', { screen: 'Location' });
  };

  // Show loading state
  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.text.primary }]}>Loading saved gyms...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTextContainer}>
          <Text style={[styles.headerTitle, { color: theme.text.primary }]}>Saved Gyms</Text>
          <Text style={[styles.headerSubtitle, { color: theme.text.secondary }]}> 
            {savedGyms.length} saved • Your favorites
          </Text>
        </View>
      </View>

      {/* Content */}
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
          <TouchableOpacity
            style={[styles.findMatsButton, { backgroundColor: beltColor.primary }]}
            onPress={handleFindMats}
            activeOpacity={0.8}
          >
            <Text style={[styles.findMatsButtonText, { color: beltColor.textOnColor }]}>
              Find Open Mats
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        // Saved Gyms List
        <FlatList
          data={savedGyms}
          keyExtractor={(gym) => gym.id}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
          bounces={true}
          renderItem={({ item: gym }) => (
            <TouchableOpacity
              style={[styles.card, { backgroundColor: theme.surface, borderLeftColor: beltColor.primary }]}
              activeOpacity={0.85}
              onPress={() => handleGymPress(gym)}
            >
              {/* Logo/Initials */}
              <LinearGradient
                colors={[beltColor.primary, beltColor.secondary]}
                style={styles.logoCircle}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={[styles.logoText, { color: beltColor.textOnColor }]}> 
                  {getInitials(gym.name)}
                </Text>
              </LinearGradient>
              
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
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Gym Details Modal */}
      {selectedGym && (
        <GymDetailsModal
          gym={selectedGym}
          visible={modalVisible}
          onClose={handleCloseModal}
          onHeartPress={() => handleHeartPress(selectedGym)}
          isFavorited={favorites.has(parseInt(selectedGym.id))}
        />
      )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
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
  findMatsButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 160,
  },
  findMatsButtonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
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
    padding: 4,
  },
});

export default SavedScreen; 