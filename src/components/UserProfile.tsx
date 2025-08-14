import React from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { SignOutButton } from './SignOutButton';

export const UserProfile: React.FC = () => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <Text style={styles.notAuthenticatedText}>Please sign in to view your profile</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.profileSection}>
        <Text style={styles.title}>User Profile</Text>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{user?.email || 'Not provided'}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Display Name:</Text>
          <Text style={styles.value}>{user?.displayName || 'Not provided'}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>User ID:</Text>
          <Text style={styles.value}>{user?.uid || 'Not available'}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Email Verified:</Text>
          <Text style={styles.value}>{user?.emailVerified ? 'Yes' : 'No'}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Account Created:</Text>
          <Text style={styles.value}>
            {user?.metadata?.creationTime
              ? new Date(user.metadata.creationTime).toLocaleDateString()
              : 'Not available'}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Last Sign In:</Text>
          <Text style={styles.value}>
            {user?.metadata?.lastSignInTime
              ? new Date(user.metadata.lastSignInTime).toLocaleDateString()
              : 'Not available'}
          </Text>
        </View>
      </View>

      <View style={styles.actionsSection}>
        <SignOutButton
          variant="danger"
          onSuccess={() => {
            Alert.alert('Signed Out', 'You have been successfully signed out.');
          }}
          onError={error => {
            Alert.alert('Error', 'Failed to sign out. Please try again.');
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F9FAFB',
  },
  profileSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
    color: '#1F2937',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    flex: 1,
  },
  value: {
    fontSize: 16,
    color: '#1F2937',
    flex: 2,
    textAlign: 'right',
  },
  actionsSection: {
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#6B7280',
    marginTop: 50,
  },
  notAuthenticatedText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#6B7280',
    marginTop: 50,
  },
});
