import React, { useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { UserProfile } from '../components/UserProfile';
import { beltColors } from '../utils/constants';

const ProfileScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { theme } = useTheme();
  const { userBelt } = useApp();
  const { isAuthenticated, user } = useAuth();
  const beltColor = beltColors[userBelt];

  // Show different content based on authentication status
  if (isAuthenticated && user) {
    // For authenticated users, show the UserProfile component
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        {/* Belt Status Bar */}
        <LinearGradient
          colors={[beltColor.primary, beltColor.secondary]}
          style={styles.beltStatusBar}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        />
        
        <UserProfile />
      </SafeAreaView>
    );
  }

  // For unauthenticated users, show a welcome screen with sign-in options
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Belt Status Bar */}
      <LinearGradient
        colors={[beltColor.primary, beltColor.secondary]}
        style={styles.beltStatusBar}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      />
      
      {/* Welcome Content */}
      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <View style={styles.welcomeSection}>
          <View style={styles.welcomeHeader}>
            <Image
              source={require('../../assets/icon.png')}
              style={styles.appIcon}
            />
            <Text style={[styles.welcomeTitle, { color: theme.text.primary }]}>
              Welcome to Find Jiu Jitsu
            </Text>
            <Text style={[styles.welcomeSubtitle, { color: theme.text.secondary }]}>
              Discover and connect with Jiu Jitsu gyms in your area
            </Text>
          </View>

          <View style={styles.featuresSection}>
            <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>
              What you can do:
            </Text>
            
            <View style={styles.featureItem}>
              <Ionicons name="location" size={24} color={beltColor.primary} />
              <Text style={[styles.featureText, { color: theme.text.secondary }]}>
                Find gyms near you with detailed information
              </Text>
            </View>
            
            <View style={styles.featureItem}>
              <Ionicons name="heart" size={24} color={beltColor.primary} />
              <Text style={[styles.featureText, { color: theme.text.secondary }]}>
                Save your favorite gyms for quick access
              </Text>
            </View>
            
            <View style={styles.featureItem}>
              <Ionicons name="time" size={24} color={beltColor.primary} />
              <Text style={[styles.featureText, { color: theme.text.secondary }]}>
                Filter by class times and availability
              </Text>
            </View>
            
            <View style={styles.featureItem}>
              <Ionicons name="settings" size={24} color={beltColor.primary} />
              <Text style={[styles.featureText, { color: theme.text.secondary }]}>
                Customize your belt level and preferences
              </Text>
            </View>
          </View>

          <View style={styles.signInSection}>
            <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>
              Sign in to unlock more features:
            </Text>
            
            <TouchableOpacity 
              style={[styles.signInButton, { backgroundColor: beltColor.primary }]}
              onPress={() => navigation.navigate('Login')}
            >
              <Ionicons name="log-in" size={20} color="white" />
              <Text style={styles.signInButtonText}>Sign in with Google or Apple</Text>
            </TouchableOpacity>
            
            <Text style={[styles.skipText, { color: theme.text.secondary }]}>
              You can continue using the app without signing in
            </Text>
          </View>
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
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  welcomeSection: {
    flex: 1,
  },
  welcomeHeader: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  appIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  featuresSection: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  featureText: {
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
    lineHeight: 22,
  },
  signInSection: {
    alignItems: 'center',
  },
  signInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  signInButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  skipText: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default ProfileScreen; 