import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { beltColors } from '../utils/constants';
import { BeltType } from '../types';
import { apiService } from '../services';
import { OpenMat } from '../types';

const ProfileDetailsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { userBelt, setUserBelt, selectedLocation } = useApp();
  const { user, isAuthenticated } = useAuth();

  // Form state
  const [selectedBelt, setSelectedBelt] = useState<BeltType>(userBelt);
  const beltColor = beltColors[selectedBelt];
  const [yearsTraining, setYearsTraining] = useState('0');
  const [selectedHomeGym, setSelectedHomeGym] = useState('');
  const [giPreference, setGiPreference] = useState<'Gi' | 'No-Gi' | 'Both'>('Both');
  const [isSaving, setIsSaving] = useState(false);

  // Dropdown states
  const [showBeltDropdown, setShowBeltDropdown] = useState(false);
  const [showGymDropdown, setShowGymDropdown] = useState(false);

  // Data state
  const [availableGyms, setAvailableGyms] = useState<OpenMat[]>([]);

  // Belt options
  const beltOptions: { label: string; value: BeltType; color: string }[] = [
    { label: 'White Belt', value: 'white', color: '#F8F9FA' },
    { label: 'Blue Belt', value: 'blue', color: '#3B82F6' },
    { label: 'Purple Belt', value: 'purple', color: '#A855F7' },
    { label: 'Brown Belt', value: 'brown', color: '#8B4513' },
    { label: 'Black Belt', value: 'black', color: '#525252' },
  ];

  // Debug initial state
  console.log('🔍 ProfileDetailsScreen - Initial state:');
  console.log('🔍 selectedBelt:', selectedBelt);
  console.log('🔍 showBeltDropdown:', showBeltDropdown);
  console.log('🔍 beltOptions count:', beltOptions.length);

  // Gi preference options
  const giPreferenceOptions = [
    { label: 'Gi Only', value: 'Gi' as const },
    { label: 'No-Gi Only', value: 'No-Gi' as const },
    { label: 'Both', value: 'Both' as const },
  ];

  // Load available gyms
  useEffect(() => {
    const loadGyms = async () => {
      try {
        const gyms = await apiService.getOpenMats(selectedLocation);
        setAvailableGyms(gyms);
      } catch (error) {
        console.error('Error loading gyms:', error);
      }
    };

    if (isAuthenticated) {
      loadGyms();
    }
  }, [selectedLocation, isAuthenticated]);

  // Handle belt selection
  const handleBeltSelect = (belt: BeltType) => {
    console.log('🔍 Belt selected:', belt);
    console.log('🔍 Previous selectedBelt:', selectedBelt);
    setSelectedBelt(belt);
    setShowBeltDropdown(false);
    console.log('🔍 Updated selectedBelt to:', belt);
  };

  // Handle backdrop press to close dropdowns
  const handleBackdropPress = () => {
    console.log('🔍 Backdrop pressed - closing dropdowns');
    setShowBeltDropdown(false);
    setShowGymDropdown(false);
  };

  // Handle gym selection
  const handleGymSelect = (gymName: string) => {
    setSelectedHomeGym(gymName);
    setShowGymDropdown(false);
  };

  // Handle years training input validation
  const handleYearsTrainingChange = (text: string) => {
    const numericValue = text.replace(/[^0-9]/g, '');
    const years = parseInt(numericValue) || 0;
    if (years >= 0 && years <= 50) {
      setYearsTraining(numericValue);
    }
  };

  // Handle save profile
  const handleSaveProfile = async () => {
    if (!isAuthenticated || !user?.uid) {
      Alert.alert('Error', 'You must be signed in to save your profile.');
      return;
    }

    setIsSaving(true);
    try {
      // Update local belt state
      setUserBelt(selectedBelt);

      // Update Firebase user profile
      const profileData = {
        belt: selectedBelt,
        yearsTraining: parseInt(yearsTraining) || 0,
        homeGym: selectedHomeGym,
        giPreference,
        updatedAt: new Date(),
      };

      // Save to Firebase (you'll need to implement this in your Firebase service)
      // await firebaseService.updateUserProfile(user.uid, profileData);

      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // If not authenticated, show sign-in prompt
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <LinearGradient
          colors={[beltColor.primary, beltColor.secondary]}
          style={styles.beltStatusBar}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        />
        
        <View style={styles.content}>
          <View style={styles.signInPrompt}>
            <Ionicons name="person-circle-outline" size={80} color={theme.text.secondary} />
            <Text style={[styles.signInTitle, { color: theme.text.primary }]}>
              Sign in to create profile
            </Text>
            <Text style={[styles.signInSubtitle, { color: theme.text.secondary }]}>
              Create your profile to personalize your experience and sync your preferences across devices.
            </Text>
            <TouchableOpacity
              style={[styles.signInButton, { backgroundColor: '#3B82F6' }]}
              onPress={() => navigation.navigate('Login' as never)}
            >
              <Text style={[styles.signInButtonText, { color: '#FFFFFF' }]}>
                Sign In
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Belt Status Bar */}
      <LinearGradient
        colors={[beltColor.primary, beltColor.secondary]}
        style={styles.beltStatusBar}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text.primary }]}>
          Profile Details
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Profile Banner */}
      <LinearGradient
        colors={[beltColor.primary, beltColor.secondary]}
        style={styles.profileBanner}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.bannerContent}>
          <View style={styles.avatarContainer}>
            <Text style={[styles.avatarText, { color: beltColor.textOnColor }]}>
              {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: beltColor.textOnColor }]}>
              {user?.displayName || 'User'}
            </Text>
            <Text style={[styles.userEmail, { color: beltColor.textOnColor }]}>
              {user?.email}
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* Form Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} pointerEvents="box-none">
        {/* Backdrop overlay for dropdowns - rendered BEFORE dropdowns for proper touch handling */}
        {(showBeltDropdown || showGymDropdown) && (
          <TouchableOpacity
            style={styles.overlay}
            activeOpacity={1}
            onPress={handleBackdropPress}
          />
        )}
        <View style={styles.formContainer}>
          {/* Belt Selection */}
          <View style={styles.formSection}>
            <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>
              Belt Level
            </Text>
            <View style={styles.dropdownContainer} pointerEvents="box-none">
              <TouchableOpacity
                style={[styles.dropdownButton, { 
                  backgroundColor: theme.surface,
                  borderColor: theme.border
                }]}
                activeOpacity={0.8}
                onPress={() => { 
                  console.log('🔍 Belt dropdown pressed');
                  console.log('🔍 Current showBeltDropdown:', showBeltDropdown);
                  setShowBeltDropdown(!showBeltDropdown);
                  console.log('🔍 Setting showBeltDropdown to:', !showBeltDropdown);
                }}
              >
                <View style={styles.dropdownContent}>
                  <View style={[styles.beltIndicator, { backgroundColor: beltColors[selectedBelt].primary }]} />
                  <Text style={[styles.dropdownText, { color: theme.text.primary }]}>
                    {beltOptions.find(b => b.value === selectedBelt)?.label}
                  </Text>
                </View>
                <Ionicons 
                  name={showBeltDropdown ? "chevron-up" : "chevron-down"} 
                  size={20} 
                  color={theme.text.secondary} 
                />
              </TouchableOpacity>

              {/* Belt Dropdown */}
              {showBeltDropdown && (
                <View style={[styles.dropdown, { backgroundColor: theme.surface }]}>
                  {beltOptions.map((option) => {
                    console.log('🔍 Rendering belt option:', option.label, option.value);
                    return (
                      <TouchableOpacity
                        key={option.value}
                        style={[
                          styles.dropdownItem,
                          selectedBelt === option.value && { backgroundColor: beltColor.surface }
                        ]}
                        activeOpacity={0.7}
                        onPress={() => handleBeltSelect(option.value)}
                      >
                        <View style={[styles.beltIndicator, { backgroundColor: option.color }]} />
                        <Text style={[styles.dropdownItemText, { color: theme.text.primary }]}>
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>
          </View>

          {/* Years Training */}
          <View style={styles.formSection}>
            <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>
              Years Training
            </Text>
            <TextInput
              style={[styles.textInput, { 
                backgroundColor: theme.surface,
                color: theme.text.primary,
                borderColor: theme.border
              }]}
              value={yearsTraining}
              onChangeText={handleYearsTrainingChange}
              placeholder="Enter years (0-50)"
              placeholderTextColor={theme.text.secondary}
              keyboardType="numeric"
              maxLength={2}
            />
          </View>

          {/* Home Gym Selection */}
          <View style={styles.formSection}>
            <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>
              Home Gym
            </Text>
            <View style={styles.dropdownContainer} pointerEvents="box-none">
              <TouchableOpacity
                style={[styles.dropdownButton, { 
                  backgroundColor: theme.surface,
                  borderColor: theme.border
                }]}
                activeOpacity={0.8}
                onPress={() => setShowGymDropdown(!showGymDropdown)}
              >
                <View style={styles.dropdownContent}>
                  <Text style={[styles.dropdownText, { color: theme.text.primary }]}>
                    {selectedHomeGym || 'Select your home gym'}
                  </Text>
                </View>
                <Ionicons 
                  name={showGymDropdown ? "chevron-up" : "chevron-down"} 
                  size={20} 
                  color={theme.text.secondary} 
                />
              </TouchableOpacity>

              {/* Gym Dropdown */}
              {showGymDropdown && (
                <View style={[styles.dropdown, { backgroundColor: theme.surface }]}>
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    activeOpacity={0.7}
                    onPress={() => handleGymSelect('')}
                  >
                    <Text style={[styles.dropdownItemText, { color: theme.text.secondary }]}>
                      No home gym
                    </Text>
                  </TouchableOpacity>
                  {availableGyms.map((gym) => (
                    <TouchableOpacity
                      key={gym.id}
                      style={[
                        styles.dropdownItem,
                        selectedHomeGym === gym.name && { backgroundColor: beltColor.surface }
                      ]}
                      activeOpacity={0.7}
                      onPress={() => handleGymSelect(gym.name)}
                    >
                      <Text style={[styles.dropdownItemText, { color: theme.text.primary }]}>
                        {gym.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>

          {/* Gi/No-Gi Preference */}
          <View style={styles.formSection}>
            <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>
              Training Preference
            </Text>
            <View style={styles.preferenceContainer}>
              {giPreferenceOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.preferenceButton,
                    { 
                      backgroundColor: theme.surface,
                      borderColor: theme.border
                    },
                    giPreference === option.value && { backgroundColor: '#3B82F6' }
                  ]}
                  onPress={() => setGiPreference(option.value)}
                >
                  <Text style={[
                    styles.preferenceText,
                    { 
                      color: giPreference === option.value 
                        ? '#FFFFFF' 
                        : theme.text.primary 
                    }
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[
              styles.saveButton,
              { backgroundColor: '#374151' },
              isSaving && { opacity: 0.7 }
            ]}
            onPress={handleSaveProfile}
            disabled={isSaving}
          >
            <Text style={[styles.saveButtonText, { color: '#FFFFFF' }]}>
              {isSaving ? 'Saving...' : 'Save Profile'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  beltStatusBar: {
    height: 1,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  profileBanner: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    opacity: 0.9,
  },
  content: {
    flex: 1,
  },
  formContainer: {
    padding: 20,
  },
  formSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  dropdownContainer: {
    position: 'relative',
    zIndex: 1001,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
  },
  dropdownContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  beltIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  dropdownText: {
    fontSize: 16,
    flex: 1,
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 10,
    zIndex: 1002,
    maxHeight: 200,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  dropdownItemText: {
    fontSize: 16,
    flex: 1,
  },
  textInput: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
  },
  preferenceContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  preferenceButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  preferenceText: {
    fontSize: 14,
    fontWeight: '500',
  },
  saveButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 32,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  signInPrompt: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  signInTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  signInSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  signInButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  signInButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    zIndex: 999,
  },
});

export default ProfileDetailsScreen; 