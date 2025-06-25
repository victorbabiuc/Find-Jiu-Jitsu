import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Dimensions,
  Linking,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { useDashboardNavigation } from '../navigation/useNavigation';
import { beltColors } from '../utils/constants';
import { OpenMat } from '../types';
import { GymDetailsModal } from '../components';
import { apiService } from '../services';
import { DashboardStackRouteProp } from '../navigation/types';

const { width } = Dimensions.get('window');

interface ResultsScreenProps {
  route: DashboardStackRouteProp<'Results'>;
}

const ResultsScreen: React.FC<ResultsScreenProps> = ({ route }) => {
  const { theme } = useTheme();
  const { selectedLocation, userBelt } = useApp();
  const navigation = useDashboardNavigation();
  const beltColor = beltColors[userBelt];
  
  // Get location from route params
  const location = route.params?.location || 'Tampa';
  
  // State for API data
  const [openMats, setOpenMats] = useState<OpenMat[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [selectedGym, setSelectedGym] = useState<OpenMat | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Fetch data from API
  useEffect(() => {
    const fetchOpenMats = async () => {
      try {
        setLoading(true);
        const data = await apiService.getOpenMats(location);
        setOpenMats(data);
        console.log('API data loaded:', data.length, 'gyms found');
        console.log('Total gyms:', data.length);
      } catch (error) {
        console.error('Error fetching open mats:', error);
        setOpenMats([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOpenMats();
  }, [location]);

  const handleGymPress = (gym: OpenMat) => {
    console.log('Gym pressed:', gym.name);
    setSelectedGym(gym);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    console.log('Modal closed');
    setModalVisible(false);
    setSelectedGym(null);
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

  const getMatTypeDisplay = (openMats: any[]) => {
    const types = openMats.map(mat => mat.type);
    if (types.includes('both')) return 'Gi & No-Gi';
    if (types.includes('gi') && types.includes('nogi')) return 'Gi & No-Gi';
    if (types.includes('gi')) return 'Gi Only';
    if (types.includes('nogi')) return 'No-Gi Only';
    return 'Mixed';
  };

  // Show loading state
  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background, flex: 1 }]}> 
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={[styles.backIcon, { color: theme.text.primary }]}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={[styles.headerTitle, { color: theme.text.primary }]}>Open Mats Near You</Text>
            <Text style={[styles.headerSubtitle, { color: theme.text.secondary }]}> 
              Loading...
            </Text>
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.text.secondary }]}>Finding open mats...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background, flex: 1 }]}>  
      {/* Beta Info Banner */}
      <View style={styles.betaBanner}>
        <Text style={styles.betaBannerText}>🚧 Beta Version - Data may be incomplete</Text>
      </View>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={[styles.backIcon, { color: theme.text.primary }]}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={[styles.headerTitle, { color: theme.text.primary }]}>Open Mats Near You</Text>
          <Text style={[styles.headerSubtitle, { color: theme.text.secondary }]}> 
            {openMats.length} results • {location}
          </Text>
        </View>
        {/* Report Issue Button */}
        <TouchableOpacity
          style={styles.reportIssueButton}
          onPress={() => Linking.openURL('mailto:support@openmatfinder.com?subject=Open%20Mat%20Finder%20Beta%20Feedback')}
        >
          <Text style={styles.reportIssueText}>Report Issue</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={{ flex: 1 }}>
        {openMats.length === 0 ? (
          // Empty state
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.text.primary }]}>No open mats found in {location}</Text>
            <Text style={[styles.emptySubtext, { color: theme.text.secondary }]}>Check back soon or add a gym in your city!</Text>
          </View>
        ) : (
          // Gym List
          <FlatList
            data={openMats}
            keyExtractor={(gym) => gym.id}
            style={{ flex: 1 }}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={true}
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
                    {gym.name ? gym.name : getInitials(gym.name)}
                  </Text>
                </LinearGradient>
                {/* Card Content */}
                <View style={styles.cardContent}>
                  <View style={styles.cardHeaderRow}>
                    <Text style={[styles.gymName, { color: theme.text.primary }]}>{gym.name}</Text>
                    <View style={styles.ratingRow}>
                      <Text style={styles.star}>📍</Text>
                      <Text style={[styles.ratingText, { color: theme.text.secondary }]}>{gym.distance} mi</Text>
                    </View>
                  </View>
                  <Text style={[styles.timeText, { color: theme.text.secondary }]}>{formatOpenMats(gym.openMats)}</Text>
                  <View style={styles.infoRow}>
                    <Text style={[styles.infoText, { color: theme.text.secondary }]}>📍 {gym.address}</Text>
                    {getPriceDisplay(gym.matFee)}
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={[styles.infoText, { color: theme.text.secondary }]}>🥋 {gym.openMats.length} sessions</Text>
                    <Text style={[styles.infoText, { color: theme.text.secondary }]}>💰 {gym.matFee === 0 ? 'Free' : `$${gym.matFee}`}</Text>
                  </View>
                  <View style={styles.skillTagsRow}>
                    <View style={[styles.skillTag, { backgroundColor: beltColor.surface }]}> 
                      <Text style={[styles.skillTagText, { color: beltColor.primary }]}>{getMatTypeDisplay(gym.openMats)}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </View>

      {/* Gym Details Modal */}
      <GymDetailsModal
        gym={selectedGym}
        visible={modalVisible}
        onClose={handleCloseModal}
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
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 16,
    borderLeftWidth: 2,
    marginBottom: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
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
    minWidth: 0,
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
    flexShrink: 1,
    marginRight: 8,
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
    fontSize: 15,
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
  betaBanner: {
    backgroundColor: '#F59E0B',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'center',
    marginTop: 36,
    marginBottom: 4,
    minHeight: 28,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.93,
  },
  betaBannerText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 13,
    letterSpacing: 0.5,
  },
  reportIssueButton: {
    marginLeft: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(245,158,11,0.12)',
    alignSelf: 'center',
  },
  reportIssueText: {
    color: '#F59E0B',
    fontWeight: '700',
    fontSize: 13,
    letterSpacing: 0.5,
  },
});

export default ResultsScreen; 