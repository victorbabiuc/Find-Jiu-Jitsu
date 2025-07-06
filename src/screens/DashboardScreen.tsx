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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { useMainTabNavigation } from '../navigation/useNavigation';
import { beltColors } from '../utils/constants';
import { OpenMat } from '../types';
import { SafeAreaView as SafeAreaViewRN } from 'react-native-safe-area-context';
import { apiService } from '../services';

const { width } = Dimensions.get('window');

// TODO: v2.0 - Replace with user's home gym info

const DashboardScreen: React.FC = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { userBelt, selectedLocation, favorites, toggleFavorite } = useApp();
  const navigation = useMainTabNavigation();
  
  const beltColor = beltColors[userBelt];
  
  // State for next open mat
  const [nextOpenMat, setNextOpenMat] = useState<OpenMat | null>(null);
  const [loading, setLoading] = useState(true);

  const handleFindMats = () => {
    navigation.navigate('Find', { screen: 'Location' });
  };

  const handleQuickToday = () => {
    navigation.navigate('Find', { screen: 'TimeSelection' });
  };

  const handleQuickTomorrow = () => {
    navigation.navigate('Find', { screen: 'TimeSelection' });
  };

  // Helper functions for next open mat logic
  const getCurrentDay = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()];
  };

  const getCurrentTime = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const parseTime = (timeStr: string) => {
    const time = timeStr.toUpperCase();
    const match = time.match(/(\d+):?(\d*)\s*(AM|PM)/);
    if (!match) return 0;
    
    let hours = parseInt(match[1]);
    const minutes = match[2] ? parseInt(match[2]) : 0;
    const period = match[3];
    
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    
    return hours * 60 + minutes;
  };



  const findNextOpenMat = (gyms: OpenMat[]) => {
    const dayOrder = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDay = getCurrentDay();
    const currentTime = parseTime(getCurrentTime());
    const currentDayIndex = dayOrder.indexOf(currentDay);
    
    // Collect all sessions from all gyms
    const allSessions: Array<{ gym: OpenMat; session: any; dayIndex: number; timeMinutes: number; weekOffset: number }> = [];
    
    gyms.forEach(gym => {
      gym.openMats.forEach(session => {
        const sessionDayIndex = dayOrder.indexOf(session.day);
        const sessionTime = parseTime(session.time);
        
        // Calculate week offset and adjusted day index
        let weekOffset = 0;
        let adjustedDayIndex = sessionDayIndex;
        
        // If session is today, check if time is in future
        if (sessionDayIndex === currentDayIndex) {
          if (sessionTime > currentTime) {
            // Session is later today
            allSessions.push({ gym, session, dayIndex: sessionDayIndex, timeMinutes: sessionTime, weekOffset: 0 });
          }
        } else if (sessionDayIndex > currentDayIndex) {
          // Session is later this week
          allSessions.push({ gym, session, dayIndex: sessionDayIndex, timeMinutes: sessionTime, weekOffset: 0 });
        } else {
          // Session is earlier in the week, so it's next week
          allSessions.push({ gym, session, dayIndex: sessionDayIndex, timeMinutes: sessionTime, weekOffset: 1 });
        }
      });
    });
    
    // Sort by week offset first, then by day, then by time
    allSessions.sort((a, b) => {
      if (a.weekOffset !== b.weekOffset) {
        return a.weekOffset - b.weekOffset;
      }
      if (a.dayIndex !== b.dayIndex) {
        return a.dayIndex - b.dayIndex;
      }
      return a.timeMinutes - b.timeMinutes;
    });
    
    // Always return the first session (there should always be at least one)
    if (allSessions.length > 0) {
      const nextSession = allSessions[0];
      return {
        ...nextSession.gym,
        openMats: [nextSession.session]
      };
    }
    
    // Fallback: if somehow no sessions found, return the first gym's first session
    if (gyms.length > 0 && gyms[0].openMats.length > 0) {
      return {
        ...gyms[0],
        openMats: [gyms[0].openMats[0]]
      };
    }
    
    return null;
  };

  // Fetch and find next open mat
  useEffect(() => {
    const fetchNextOpenMat = async () => {
      try {
        setLoading(true);
        const location = selectedLocation || 'Tampa';
        const allGyms = await apiService.getOpenMats(location);
        const next = findNextOpenMat(allGyms);
        setNextOpenMat(next);
      } catch (error) {
        console.error('Error fetching next open mat:', error);
        setNextOpenMat(null);
      } finally {
        setLoading(false);
      }
    };

    fetchNextOpenMat();
  }, [selectedLocation]);

  const handleGymPress = (gym: OpenMat) => {
    // Navigate to Find tab first, then to results
    const location = selectedLocation || 'Tampa';
    navigation.navigate('Find', { screen: 'Results', params: { location } });
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

  const handleHeartPress = (gym: OpenMat) => {
    toggleFavorite(gym.id);
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.background }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Welcome Section */}
      <SafeAreaViewRN edges={['top']}>
        <LinearGradient
          colors={[beltColor.primary, beltColor.secondary]}
          style={styles.welcomeSection}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerRow}>
            <View>
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
            </View>

          </View>
        </LinearGradient>
      </SafeAreaViewRN>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>
          Quick Actions
        </Text>
        
        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: beltColor.primary }]}
          onPress={handleFindMats}
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
            onPress={handleQuickToday}
          >
            <Text style={[styles.dateButtonText, { color: theme.text.primary }]}>
              Today
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.dateButton, { backgroundColor: theme.surface }]}
            onPress={handleQuickTomorrow}
          >
            <Text style={[styles.dateButtonText, { color: theme.text.primary }]}>
              Tomorrow
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Next Open Mat */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>
          Next Open Mat
        </Text>
        
        {loading ? (
          <View style={[styles.loadingCard, { backgroundColor: theme.surface }]}>
            <Text style={[styles.loadingText, { color: theme.text.secondary }]}>
              Finding your next session...
            </Text>
          </View>
        ) : nextOpenMat ? (
          <View style={[styles.card, { backgroundColor: theme.surface }]}>
            {/* Header: Gym Name + Heart Button */}
            <View style={styles.cardHeader}>
              <Text style={styles.gymName}>{nextOpenMat.name}</Text>
              <TouchableOpacity 
                style={styles.heartButton}
                onPress={() => handleHeartPress(nextOpenMat)}
              >
                <Text style={styles.heartIcon}>
                  {favorites.has(nextOpenMat.id) ? '♥' : '♡'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Session Type Subtitle */}
            <Text style={styles.sessionSubtitle}>Open Mat Session</Text>

            {/* Sessions Section */}
            <View style={styles.sessionsSection}>
              {nextOpenMat.openMats.map((session, index) => (
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
                    {nextOpenMat.matFee === 0 ? 'Free' : nextOpenMat.matFee ? `$${nextOpenMat.matFee}` : '?/unknown'}
                  </Text>
                </View>
                <View style={styles.feeItem}>
                  <Text style={styles.feeLabel}>Class Drop in - </Text>
                  <Text style={styles.feeValue}>
                    {nextOpenMat.dropInFee === 0 ? 'Free' : nextOpenMat.dropInFee ? `$${nextOpenMat.dropInFee}` : '?/unknown'}
                  </Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoIcon}>📍</Text>
                <Text style={styles.infoText}>{nextOpenMat.distance} miles • {selectedLocation || 'Tampa'}</Text>
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
                  Alert.alert('Call Gym', 'Call functionality coming soon!');
                }}
              >
                <Text style={styles.buttonText}>📞 Call</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, styles.middleButton]}
                onPress={() => handleHeartPress(nextOpenMat)}
              >
                <Text style={styles.buttonText}>
                  {favorites.has(nextOpenMat.id) ? '💾 Saved' : '💾 Save'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => {
                  Alert.alert('Get Directions', 'Directions functionality coming soon!');
                }}
              >
                <Text style={styles.buttonText}>🧭 Go</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={[styles.loadingCard, { backgroundColor: theme.surface }]}>
            <Text style={[styles.loadingText, { color: theme.text.secondary }]}>
              Loading next session...
            </Text>
          </View>
        )}
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
  // New gym card styles (matching ResultsScreen)
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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

});

export default DashboardScreen; 