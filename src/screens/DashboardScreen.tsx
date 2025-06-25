import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { useDashboardNavigation } from '../navigation/useNavigation';
import { beltColors } from '../utils/constants';
import { OpenMat } from '../types';

const { width } = Dimensions.get('window');

// Mock data for recently viewed gyms
const mockRecentlyViewed: OpenMat[] = [
  {
    id: '1',
    name: 'STJJ',
    address: 'Tampa, FL',
    distance: 5.2,
    openMats: [
      { day: 'Sunday', time: '9:00 AM', type: 'gi' },
      { day: 'Thursday', time: '5:00 PM', type: 'nogi' }
    ],
    matFee: 0
  },
  {
    id: '2',
    name: 'RMNU',
    address: 'Tampa, FL',
    distance: 7.1,
    openMats: [
      { day: 'Wednesday', time: '6:00 PM', type: 'both' }
    ],
    matFee: 0
  },
  {
    id: '3',
    name: 'Gracie Humaita',
    address: 'Tampa, FL',
    distance: 4.8,
    openMats: [
      { day: 'Tuesday', time: '6:30 PM', type: 'both' }
    ],
    matFee: 0
  }
];

const DashboardScreen: React.FC = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { userBelt } = useApp();
  const dashboardNavigation = useDashboardNavigation();
  
  const beltColor = beltColors[userBelt];

  const handleFindOpenMats = () => {
    // Navigate to LocationScreen in the Dashboard stack
    dashboardNavigation.navigate('Location');
  };

  const handleQuickDate = (days: number | string) => {
    // Navigate to time selection with pre-selected date
    dashboardNavigation.navigate('TimeSelection');
  };

  const handleGymPress = (gym: OpenMat) => {
    // Navigate to gym details or results
    dashboardNavigation.navigate('Results');
  };

  const formatTime = (openMats: any[]) => {
    return openMats.map(mat => `${mat.day} ${mat.time}`).join(', ');
  };

  const formatPrice = (matFee: number) => {
    return matFee === 0 ? 'Free' : `$${matFee}`;
  };

  const getMatTypeDisplay = (openMats: any[]) => {
    const types = openMats.map(mat => mat.type);
    if (types.includes('both')) return 'Gi & No-Gi';
    if (types.includes('gi') && types.includes('nogi')) return 'Gi & No-Gi';
    if (types.includes('gi')) return 'Gi Only';
    if (types.includes('nogi')) return 'No-Gi Only';
    return 'Mixed';
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.background }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Welcome Section */}
      <LinearGradient
        colors={[beltColor.primary, beltColor.secondary]}
        style={styles.welcomeSection}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={[styles.welcomeText, { color: beltColor.textOnColor }]}>
          Welcome back,
        </Text>
        <Text style={[styles.userName, { color: beltColor.textOnColor }]}>
          {user?.name || 'Fighter'}
        </Text>
        <View style={styles.beltIndicator}>
          <Text style={[styles.beltText, { color: beltColor.textOnColor }]}>
            {userBelt.charAt(0).toUpperCase() + userBelt.slice(1)} Belt
          </Text>
        </View>
      </LinearGradient>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>
          Quick Actions
        </Text>
        
        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: beltColor.primary }]}
          onPress={handleFindOpenMats}
        >
          <LinearGradient
            colors={[beltColor.primary, beltColor.secondary]}
            style={styles.buttonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={[styles.primaryButtonText, { color: beltColor.textOnColor }]}>
              Find Open Mats
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Quick Date Buttons */}
        <View style={styles.quickDateContainer}>
          <TouchableOpacity
            style={[styles.dateButton, { backgroundColor: theme.surface }]}
            onPress={() => handleQuickDate(0)}
          >
            <Text style={[styles.dateButtonText, { color: theme.text.primary }]}>
              Today
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.dateButton, { backgroundColor: theme.surface }]}
            onPress={() => handleQuickDate(1)}
          >
            <Text style={[styles.dateButtonText, { color: theme.text.primary }]}>
              Tomorrow
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recently Viewed Gyms */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>
          Recently Viewed
        </Text>
        
        {mockRecentlyViewed.map((gym) => (
          <TouchableOpacity
            key={gym.id}
            style={[styles.gymCard, { backgroundColor: theme.surface }]}
            onPress={() => handleGymPress(gym)}
          >
            <View style={styles.gymHeader}>
              <Text style={[styles.gymName, { color: theme.text.primary }]}>
                {gym.name}
              </Text>
              <View style={styles.gymRating}>
                <Text style={[styles.ratingText, { color: theme.text.secondary }]}>
                  📍 {gym.distance} mi
                </Text>
              </View>
            </View>
            
            <View style={styles.gymDetails}>
              <View style={styles.gymInfo}>
                <Text style={[styles.gymInfoText, { color: theme.text.secondary }]}>
                  🕐 {formatTime(gym.openMats)}
                </Text>
                <Text style={[styles.gymInfoText, { color: theme.text.secondary }]}>
                  📍 {gym.address}
                </Text>
                <Text style={[styles.gymInfoText, { color: theme.text.secondary }]}>
                  💰 {formatPrice(gym.matFee)}
                </Text>
              </View>
              
              <View style={styles.gymStats}>
                <Text style={[styles.attendeesText, { color: theme.text.secondary }]}>
                  🥋 {gym.openMats.length} sessions
                </Text>
                <Text style={[styles.skillText, { color: theme.text.tertiary }]}>
                  {getMatTypeDisplay(gym.openMats)}
                </Text>
              </View>
            </View>
            
            <View style={styles.gymTags}>
              {gym.openMats.map((session, index) => (
                <View key={index} style={[styles.tag, { backgroundColor: beltColor.surface }]}>
                  <Text style={[styles.tagText, { color: beltColor.primary }]}>
                    {session.type === 'both' ? 'Gi & No-Gi' : session.type === 'gi' ? 'Gi' : 'No-Gi'}
                  </Text>
                </View>
              ))}
            </View>
          </TouchableOpacity>
        ))}
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
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
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
  gymCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  gymHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  gymName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  gymRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '500',
  },
  gymDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  gymInfo: {
    flex: 1,
  },
  gymInfoText: {
    fontSize: 14,
    marginBottom: 4,
  },
  gymStats: {
    alignItems: 'flex-end',
  },
  attendeesText: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  skillText: {
    fontSize: 12,
    fontWeight: '500',
  },
  gymTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  bottomSpacing: {
    height: 20,
  },
});

export default DashboardScreen; 