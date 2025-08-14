import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import * as AppleAuthentication from 'expo-apple-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Simple user interface without Firebase dependencies
interface SimpleUser {
  id: string;
  uid?: string; // Alias for id for compatibility
  email?: string;
  displayName?: string;
  photoURL?: string;
  emailVerified?: boolean;
  metadata?: {
    creationTime?: string;
    lastSignInTime?: string;
  };
  provider: 'google' | 'apple' | 'anonymous';
}

interface AuthContextType {
  user: SimpleUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<SimpleUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Google Sign-In setup
  const googleRequest = {
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || 'your-web-client-id-here',
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || 'your-ios-client-id-here',
    androidClientId:
      process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || 'your-android-client-id-here',
    scopes: ['profile', 'email'],
  };

  const [request, response, promptAsync] = Google.useAuthRequest(googleRequest);

  // Load user from storage on app start
  useEffect(() => {
    const loadUserFromStorage = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.log('Error loading user from storage:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserFromStorage();
  }, []);

  // Handle Google Sign-In response
  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;

      if (!id_token) {
        return;
      }

      // Create a simple user object from Google response
      const simpleUser: SimpleUser = {
        id: `google_${Date.now()}`, // Generate a simple ID
        uid: `google_${Date.now()}`, // Alias for compatibility
        email: response.params.email,
        displayName: response.params.name,
        photoURL: response.params.picture,
        emailVerified: true, // Google accounts are typically verified
        metadata: {
          creationTime: new Date().toISOString(),
          lastSignInTime: new Date().toISOString(),
        },
        provider: 'google',
      };

      // Save user to storage and state
      AsyncStorage.setItem('user', JSON.stringify(simpleUser));
      setUser(simpleUser);
    } else if (response?.type === 'error') {
      // Google auth response error handled silently
      console.log('Google auth error:', response.error);
    }
  }, [response]);

  const signInWithGoogle = async () => {
    try {
      // Check if Google auth is properly configured
      if (!request) {
        throw new Error('Google authentication not configured. Please check your client IDs.');
      }

      // Validate that client IDs are set
      const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
      const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

      if (!webClientId || webClientId === 'your-web-client-id-here') {
        throw new Error(
          'Google Web Client ID not configured. Please set EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID in your .env file.'
        );
      }

      if (!iosClientId || iosClientId === 'your-ios-client-id-here') {
        throw new Error(
          'Google iOS Client ID not configured. Please set EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID in your .env file.'
        );
      }

      const result = await promptAsync();

      if (result.type === 'cancel') {
        return;
      }

      if (result.type === 'error') {
        // Handle specific OAuth errors
        const errorMessage = result.error?.message || 'Unknown error';

        // Check for OAuth consent screen errors
        if (errorMessage.includes('unverified app') || errorMessage.includes('consent screen')) {
          throw new Error(
            'OAuth consent screen not configured. Please configure the OAuth consent screen in Google Cloud Console.'
          );
        }

        // Check for redirect URI errors
        if (errorMessage.includes('redirect_uri_mismatch')) {
          throw new Error('Redirect URI mismatch. Please check your Google OAuth configuration.');
        }

        throw new Error(`Google sign-in error: ${errorMessage}`);
      }

      // Google sign-in initiated successfully
    } catch (error) {
      // Google sign-in error handled silently
      console.log('Google sign-in error:', error);
      return;
    }
  };

  const signInWithApple = async () => {
    try {
      setLoading(true);

      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      // Create a simple user object from Apple response
      const simpleUser: SimpleUser = {
        id: `apple_${Date.now()}`, // Generate a simple ID
        uid: `apple_${Date.now()}`, // Alias for compatibility
        email: credential.email || undefined,
        displayName: credential.fullName?.givenName
          ? `${credential.fullName.givenName} ${credential.fullName.familyName || ''}`.trim()
          : undefined,
        emailVerified: true, // Apple accounts are typically verified
        metadata: {
          creationTime: new Date().toISOString(),
          lastSignInTime: new Date().toISOString(),
        },
        provider: 'apple',
      };

      // Save user to storage and state
      await AsyncStorage.setItem('user', JSON.stringify(simpleUser));
      setUser(simpleUser);

      // Apple Sign-In successful
    } catch (error) {
      console.log('Apple sign-in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);

      // Clear user from storage and state
      await AsyncStorage.multiRemove(['user', 'token', 'auth_credentials']);

      setUser(null);

      // Sign out successful
    } catch (error) {
      console.log('Sign out error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    signInWithGoogle,
    signInWithApple,
    signOut: signOut,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
