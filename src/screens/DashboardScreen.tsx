import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  Image,
  Animated,
} from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import { useAuth, useTheme, useApp, useLoading } from '../context';
import { useMainTabNavigation } from '../navigation/useNavigation';
import { beltColors, selectionColor, haptics, animations, logger } from '../utils';
import { SafeAreaView as SafeAreaViewRN } from 'react-native-safe-area-context';
import { OpenMat } from '../types';
import { Toast, ContactFooter } from '../components';


import appIcon from '../../assets/icon.png'; // <-- Import app icon

import { Ionicons } from '@expo/vector-icons';
import { githubDataService } from '../services';

const { width } = Dimensions.get('window');



// TODO: v2.0 - Replace with user's home gym info

const DashboardScreen: React.FC = () => {
  const { user, isAuthenticated, signOut } = useAuth();
  const { theme } = useTheme();
  const { userBelt, selectedLocation, setSelectedLocation, favorites, toggleFavorite } = useApp();
  const navigation = useMainTabNavigation();
  
  const beltColor = beltColors[userBelt];
  
  const { showTransitionalLoading } = useLoading();
  

  
  // Animation values
  const screenFadeAnim = useRef(new Animated.Value(0)).current;
  const contentSlideAnim = useRef(new Animated.Value(30)).current;
  // Heart button animation values - temporarily disabled for debugging
  // const heartScaleAnim = useRef(new Animated.Value(1)).current;
  // const heartColorAnim = useRef(new Animated.Value(0)).current;
  
  // Gym count state
  const [tampaGymCount, setTampaGymCount] = useState(18);
  const [austinGymCount, setAustinGymCount] = useState(30);
  const [miamiGymCount, setMiamiGymCount] = useState(13);
  const [stpeteGymCount, setStPeteGymCount] = useState(3);
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



  // Load gym counts and all gym data on component mount
  useEffect(() => {
    const loadGymData = async () => {
      try {
        const [tampaGyms, austinGyms, miamiGyms, stpeteGyms] = await Promise.all([
          githubDataService.getGymData('tampa'),
          githubDataService.getGymData('austin'),
          githubDataService.getGymData('miami'),
          githubDataService.getGymData('stpete')
        ]);
        

        
        // Count unique gyms by name (same logic as ResultsScreen grouping)
        const tampaUnique = new Set(tampaGyms.map(gym => gym.name)).size;
        const austinUnique = new Set(austinGyms.map(gym => gym.name)).size;
        const miamiUnique = new Set(miamiGyms.map(gym => gym.name)).size;
        const stpeteUnique = new Set(stpeteGyms.map(gym => gym.name)).size;
        
        setTampaGymCount(tampaUnique);
        setAustinGymCount(austinUnique);
        setMiamiGymCount(miamiUnique);
        setStPeteGymCount(stpeteUnique);
      } catch (error) {
        logger.error('Failed to load gym data:', error);
        // Keep default values if loading fails
      } finally {
        setIsLoadingCounts(false);
      }
    };
    
    loadGymData();
  }, []);



  const handleQuickToday = () => {
    haptics.medium(); // Medium haptic for navigation action
    navigation.navigate('Find', { screen: 'TimeSelection' });
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
        <View style={{ backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#E5E5E5' }}>
          <View style={styles.headerLogoContainer}>
            <Image source={appIcon} style={styles.headerLogo} />
          </View>
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
        <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>
          Where do you want to train?
        </Text>
        

        
        {/* Available Cities */}
        <View style={styles.citiesContainer}>
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
          
          <TouchableOpacity
            style={[
              styles.cityCard,
              { backgroundColor: theme.surface },
              selectedLocation === 'Miami' && { backgroundColor: selectionColor }
            ]}
            onPress={() => {
              haptics.medium(); // Medium haptic for city selection
              setSelectedLocation('Miami');
              navigation.navigate('Find', { screen: 'TimeSelection' });
            }}
          >
            <View style={styles.cityCardContent}>
              <Text style={styles.cityEmoji}>🌴</Text>
              <View style={styles.cityCardText}>
                <Text style={[
                  styles.cityCardTitle,
                  { color: selectedLocation === 'Miami' ? '#FFFFFF' : theme.text.primary }
                ]}>
                  Miami, FL
                </Text>
                <Text style={[
                  styles.cityCardSubtitle,
                  { color: selectedLocation === 'Miami' ? '#FFFFFF' : theme.text.secondary }
                ]}>
                  {isLoadingCounts ? 'Loading...' : `${miamiGymCount} gyms available`}
                </Text>
              </View>
              <Ionicons 
                name="chevron-forward" 
                size={20} 
                color={selectedLocation === 'Miami' ? '#FFFFFF' : theme.text.secondary} 
              />
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.cityCard,
              { backgroundColor: theme.surface },
              selectedLocation === 'St. Petersburg' && { backgroundColor: selectionColor }
            ]}
            onPress={() => {
              haptics.medium(); // Medium haptic for city selection
              setSelectedLocation('St. Petersburg');
              navigation.navigate('Find', { screen: 'TimeSelection' });
            }}
          >
            <View style={styles.cityCardContent}>
              <Text style={styles.cityEmoji}>🌊</Text>
              <View style={styles.cityCardText}>
                <Text style={[
                  styles.cityCardTitle,
                  { color: selectedLocation === 'St. Petersburg' ? '#FFFFFF' : theme.text.primary }
                ]}>
                  St. Petersburg, FL
                </Text>
                <Text style={[
                  styles.cityCardSubtitle,
                  { color: selectedLocation === 'St. Petersburg' ? '#FFFFFF' : theme.text.secondary }
                ]}>
                  {isLoadingCounts ? 'Loading...' : `${stpeteGymCount} gyms available`}
                </Text>
              </View>
              <Ionicons 
                name="chevron-forward" 
                size={20} 
                color={selectedLocation === 'St. Petersburg' ? '#FFFFFF' : theme.text.secondary} 
              />
            </View>
          </TouchableOpacity>
          
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
              <Text style={styles.cityEmoji}>☀️</Text>
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
        </View>
      </View>

      {/* More Cities Coming Soon */}


      {/* Bottom Spacing */}
      <View style={styles.bottomSpacing} />
    </ScrollView>
        </Animated.View>
    
    {/* Toast Notification */}
    <Toast
      visible={showToast}
      message={toastMessage}
      type={toastType}
      onHide={() => setShowToast(false)}
    />

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
  headerLogoContainer: {
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerLogo: {
    width: 60,
    height: 60,
    borderRadius: 30,
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