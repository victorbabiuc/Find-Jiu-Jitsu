import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuthNavigation, useDashboardNavigation } from './useNavigation';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

// Example Login Screen
export const LoginScreen = () => {
  const navigation = useAuthNavigation();
  const { login } = useAuth();
  const { theme } = useTheme();

  const handleLogin = async () => {
    try {
      await login('test@example.com', 'password');
      // Navigation will automatically switch to Main tab due to auth state change
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text.primary }]}>
        Welcome to Open Mat Finder
      </Text>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.surface }]}
        onPress={handleLogin}
      >
        <Text style={[styles.buttonText, { color: theme.text.primary }]}>
          Sign In
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.surface }]}
        onPress={() => navigation.navigate('Registration')}
      >
        <Text style={[styles.buttonText, { color: theme.text.primary }]}>
          Create Account
        </Text>
      </TouchableOpacity>
    </View>
  );
};

// Example Dashboard Screen
export const DashboardHomeScreen = () => {
  const navigation = useDashboardNavigation();
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text.primary }]}>
        Find Open Mats
      </Text>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.surface }]}
        onPress={() => navigation.navigate('TimeSelection')}
      >
        <Text style={[styles.buttonText, { color: theme.text.primary }]}>
          Select Time
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.surface }]}
        onPress={() => navigation.navigate('Results', { location: 'Current Location' })}
      >
        <Text style={[styles.buttonText, { color: theme.text.primary }]}>
          View Results
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 30,
    textAlign: 'center',
  },
  button: {
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
    marginVertical: 10,
    minWidth: 200,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
}); 