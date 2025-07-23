import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User as FirebaseUser, signInWithCredential, GoogleAuthProvider, OAuthProvider } from 'firebase/auth';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import * as AppleAuthentication from 'expo-apple-authentication';
import { auth } from '../config/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Google Sign-In setup
  // Note: You need to configure Google Sign-In in Firebase Console and get client IDs
  // Go to Firebase Console > Authentication > Sign-in method > Google > Configure
  // Then get the client IDs from Google Cloud Console for your project
  const googleRequest = {
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || 'your-web-client-id-here',
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || 'your-ios-client-id-here',
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || 'your-android-client-id-here',
    scopes: ['profile', 'email'],
  };

  const [request, response, promptAsync] = Google.useAuthRequest(googleRequest);

  useEffect(() => {
    console.log('🔐 AuthContext: Initializing Firebase auth listener');
    
    if (!auth) {
      console.log('Firebase disabled - skipping auth listener');
      setLoading(false);
      return;
    }
    
    const unsubscribe = auth.onAuthStateChanged((user: FirebaseUser | null) => {
      console.log('🔐 AuthContext: Auth state changed', user ? 'User logged in' : 'No user');
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Handle Google Sign-In response
  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      
      if (!id_token) {
        console.error('🔐 AuthContext: No ID token received from Google');
        return;
      }
      
      if (!auth) {
        console.log('Firebase disabled - skipping Google sign-in to Firebase');
        return;
      }
      
      console.log('🔐 AuthContext: Received ID token from Google, signing in to Firebase');
      const credential = GoogleAuthProvider.credential(
        id_token,
        response.params.access_token
      );
      
      signInWithCredential(auth, credential)
        .then((result) => {
          console.log('🔐 AuthContext: Google sign-in successful', result.user.email);
        })
        .catch((error) => {
          console.error('🔐 AuthContext: Google sign-in failed', error);
          // You might want to show a user-friendly error message here
        });
    } else if (response?.type === 'error') {
      console.error('🔐 AuthContext: Google auth response error', response.error);
    }
  }, [response]);

  const signInWithGoogle = async () => {
    try {
      console.log('🔐 AuthContext: Starting Google sign-in');
      
      // Check if Google auth is properly configured
      if (!request) {
        throw new Error('Google authentication not configured. Please check your client IDs.');
      }
      
      // Validate that client IDs are set
      const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
      const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
      
      if (!webClientId || webClientId === 'your-web-client-id-here') {
        throw new Error('Google Web Client ID not configured. Please set EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID in your .env file.');
      }
      
      if (!iosClientId || iosClientId === 'your-ios-client-id-here') {
        throw new Error('Google iOS Client ID not configured. Please set EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID in your .env file.');
      }
      
      console.log('🔐 AuthContext: Google client IDs validated, initiating sign-in');
      
      const result = await promptAsync();
      
      if (result.type === 'cancel') {
        console.log('🔐 AuthContext: Google sign-in cancelled by user');
        return;
      }
      
      if (result.type === 'error') {
        // Handle specific OAuth errors
        const errorMessage = result.error?.message || 'Unknown error';
        console.error('🔐 AuthContext: Google sign-in error:', errorMessage);
        
        // Check for OAuth consent screen errors
        if (errorMessage.includes('unverified app') || errorMessage.includes('consent screen')) {
          throw new Error('OAuth consent screen not configured. Please configure the OAuth consent screen in Google Cloud Console.');
        }
        
        // Check for redirect URI errors
        if (errorMessage.includes('redirect_uri_mismatch')) {
          throw new Error('Redirect URI mismatch. Please check your Google OAuth configuration.');
        }
        
        throw new Error(`Google sign-in error: ${errorMessage}`);
      }
      
      console.log('🔐 AuthContext: Google sign-in initiated successfully');
    } catch (error) {
      console.error('🔐 AuthContext: Google sign-in error', error);
      
      // Don't throw the error to prevent navigation crashes
      // Instead, log it and let the UI handle it gracefully
      return;
    }
  };

  const signInWithApple = async () => {
    try {
      setLoading(true);
      console.log('🍎 Starting Apple Sign-In...');
      
      if (!auth) {
        console.log('Firebase disabled - skipping Apple sign-in to Firebase');
        setLoading(false);
        return;
      }
      
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      const { identityToken } = credential;
      const provider = new OAuthProvider('apple.com');
      const firebaseCredential = provider.credential({
        idToken: identityToken || undefined,
        rawNonce: undefined, // Apple nonce handling can be added later
      });
      
      await signInWithCredential(auth, firebaseCredential);
      console.log('✅ Apple Sign-In successful');
    } catch (error) {
      console.error('❌ Apple Sign-In Error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      console.log('🔐 AuthContext: Starting sign out process');
      
      if (!auth) {
        console.log('Firebase disabled - skipping Firebase sign out');
        // Still clear local storage
        await AsyncStorage.multiRemove([
          'user',
          'token',
          'auth_credentials'
        ]);
        setLoading(false);
        return;
      }
      
      // Sign out from Firebase
      await auth.signOut();
      
      // Clear any stored authentication data
      await AsyncStorage.multiRemove([
        'user',
        'token',
        'auth_credentials'
      ]);
      
      console.log('✅ AuthContext: Sign out successful');
    } catch (error) {
      console.error('❌ AuthContext: Sign out error', error);
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
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};