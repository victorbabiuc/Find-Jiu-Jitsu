import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { OpenMat, OpenMatSession } from '../types';
import { useTheme } from '../context/ThemeContext';

interface ShareCardProps {
  gym: OpenMat;
  session: OpenMatSession;
}

const ShareCard = React.forwardRef<View, ShareCardProps>(({ gym, session }, ref) => {
  const { theme } = useTheme();

  const getSessionTypeEmoji = (type: string) => {
    switch (type.toLowerCase()) {
      case 'gi':
        return '🥋';
      case 'nogi':
        return '👕';
      case 'both':
        return '🥋👕';
      case 'mma':
      case 'mma sparring':
        return '🥊';
      default:
        return '🥋';
    }
  };

  const formatTime = (time: string) => {
    return time.replace(/\s+/g, ' ').trim();
  };

  return (
    <View ref={ref} style={[styles.container, { backgroundColor: theme.background.primary }]}>
      <LinearGradient
        colors={[theme.background.primary, theme.background.secondary]}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.appName, { color: theme.text.primary }]}>Find Jiu Jitsu</Text>
          <Text style={[styles.tagline, { color: theme.text.secondary }]}>Open Mat Sessions</Text>
        </View>

        {/* Gym Info */}
        <View style={styles.gymSection}>
          <Text style={[styles.gymName, { color: theme.text.primary }]}>{gym.name}</Text>
          <Text style={[styles.gymAddress, { color: theme.text.secondary }]}>{gym.address}</Text>
        </View>

        {/* Session Info */}
        <View style={styles.sessionSection}>
          <View style={styles.sessionHeader}>
            <Text style={[styles.sessionType, { color: theme.text.primary }]}>
              {getSessionTypeEmoji(session.type)} {session.type}
            </Text>
            <Text style={[styles.sessionDay, { color: theme.text.primary }]}>
              {session.day}
            </Text>
          </View>
          
          <Text style={[styles.sessionTime, { color: theme.text.primary }]}>
            {formatTime(session.time)}
          </Text>
        </View>

        {/* Pricing Info */}
        <View style={styles.pricingSection}>
          {gym.matFee && gym.matFee !== '0' && (
            <Text style={[styles.pricing, { color: theme.text.secondary }]}>
              Open Mat Fee: ${gym.matFee}
            </Text>
          )}
          {gym.dropInFee && gym.dropInFee !== '0' && (
            <Text style={[styles.pricing, { color: theme.text.secondary }]}>
              Drop-in Fee: ${gym.dropInFee}
            </Text>
          )}
          {(!gym.matFee || gym.matFee === '0') && (!gym.dropInFee || gym.dropInFee === '0') && (
            <Text style={[styles.pricing, { color: theme.text.secondary }]}>
              Free Open Mat
            </Text>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.text.secondary }]}>
            Find more sessions at findjiujitsu.com
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: 1080,
    height: 1920,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'absolute',
    left: -9999,
    top: -9999,
  },
  gradient: {
    flex: 1,
    padding: 60,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  appName: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 24,
    fontWeight: '500',
  },
  gymSection: {
    marginBottom: 60,
  },
  gymName: {
    fontSize: 42,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  gymAddress: {
    fontSize: 28,
    textAlign: 'center',
    lineHeight: 36,
  },
  sessionSection: {
    alignItems: 'center',
    marginBottom: 60,
  },
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sessionType: {
    fontSize: 36,
    fontWeight: 'bold',
    marginRight: 20,
  },
  sessionDay: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  sessionTime: {
    fontSize: 48,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  pricingSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  pricing: {
    fontSize: 28,
    marginBottom: 8,
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 20,
    textAlign: 'center',
  },
});

ShareCard.displayName = 'ShareCard';

export default ShareCard; 