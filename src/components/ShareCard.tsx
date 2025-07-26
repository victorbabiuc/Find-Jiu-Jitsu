import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { OpenMat, OpenMatSession } from '../types';
import { useTheme } from '../context/ThemeContext';

interface ShareCardProps {
  gym: OpenMat;
  session: OpenMatSession;
  includeImGoing?: boolean;
}

const ShareCard = React.forwardRef<View, ShareCardProps>(({ gym, session, includeImGoing = false }, ref) => {
  const { theme } = useTheme();

  const getSessionTypeEmoji = (type: string) => {
    const typeStr = String(type || '').toLowerCase();
    switch (typeStr) {
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
    return String(time || '').replace(/\s+/g, ' ').trim();
  };

  return (
    <View ref={ref} style={[styles.container, { backgroundColor: '#FDF6E3' }]}>
      <LinearGradient
        colors={['#FDF6E3', '#F5E6D3']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.appName, { color: '#2D3748' }]}>Find Jiu Jitsu</Text>
          <Text style={[styles.tagline, { color: '#4A5568' }]}>Open Mat Sessions</Text>
        </View>

        {/* Gym Info */}
        <View style={styles.gymSection}>
          {/* Gym Logo */}
          {(String(gym.id || '').includes('10th-planet')) ? (
            <Image source={require('../../assets/logos/10th-planet-austin.png')} style={styles.gymLogo} />
          ) : (String(gym.id || '').includes('stjj')) ? (
            <Image source={require('../../assets/logos/STJJ.png')} style={styles.gymLogo} />
          ) : (String(gym.id || '').includes('gracie-tampa-south')) ? (
            <Image source={require('../../assets/logos/gracie-tampa-south.png')} style={styles.gymLogo} />
          ) : (String(gym.id || '').includes('tmt')) ? (
            <Image source={require('../../assets/logos/TMT.png')} style={styles.gymLogo} />
          ) : (
            <View style={styles.gymLogoPlaceholder}>
              <Text style={styles.gymLogoText}>{String(gym.name || '').split(' ').map(word => word[0]).join('').toUpperCase()}</Text>
            </View>
          )}
          <Text style={[styles.gymName, { color: '#2D3748' }]}>{String(gym.name || '')}</Text>
          <Text style={[styles.gymAddress, { color: '#4A5568' }]}>{String(gym.address || '')}</Text>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Session Info */}
        <View style={styles.sessionSection}>
          <Text style={[styles.openMatLabel, { color: '#2D3748' }]}>Open Mat</Text>
          <View style={styles.sessionHeader}>
            <Text style={[styles.sessionType, { color: '#2D3748' }]}>
              {getSessionTypeEmoji(String(session.type || ''))} {String(session.type || '')}
            </Text>
            <Text style={[styles.sessionDay, { color: '#2D3748' }]}>
              {String(session.day || '')}
            </Text>
          </View>
          
          <Text style={[styles.sessionTime, { color: '#2D3748' }]}>
            {formatTime(String(session.time || ''))}
          </Text>
        </View>

        {/* Pricing Info */}
        <View style={styles.pricingSection}>
          {Boolean(gym.matFee) && gym.matFee !== 0 && (
            <Text style={[styles.pricing, { color: '#4A5568' }]}>
              Open Mat Fee: ${String(gym.matFee || 0)}
            </Text>
          )}
          {Boolean(gym.dropInFee) && gym.dropInFee !== 0 && (
            <Text style={[styles.pricing, { color: '#4A5568' }]}>
              Drop-in Fee: ${String(gym.dropInFee || 0)}
            </Text>
          )}
          {(!Boolean(gym.matFee) || gym.matFee === 0) && (
            <Text style={[styles.pricing, { color: '#4A5568' }]}>
              Open Mat - Free
            </Text>
          )}
        </View>

        {/* Invite Message */}
        <View style={styles.inviteSection}>
          <Text style={[styles.inviteText, { color: '#2D3748' }]}>
            {includeImGoing ? '🏃 I\'m going, come train with me!' : '🏃 Join me for training!'}
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Image source={require('../../assets/adaptive-icon.png')} style={styles.appIcon} />
          <Text style={[styles.footerText, { color: theme.text.secondary }]}>
            Find Jiu Jitsu App
          </Text>
          <Text style={[styles.ctaText, { color: theme.text.secondary }]}>
            Swipe up for app!
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
    padding: 80,
    paddingTop: 100,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    paddingTop: 20,
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
    marginBottom: 40,
    alignItems: 'center',
    paddingVertical: 10,
  },
  gymLogo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 16,
  },
  gymLogoPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  gymLogoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4A5568',
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
  divider: {
    height: 2,
    backgroundColor: '#E2E8F0',
    marginVertical: 10,
    borderRadius: 1,
  },
  sessionSection: {
    alignItems: 'center',
    marginBottom: 40,
    paddingVertical: 10,
  },
  openMatLabel: {
    fontSize: 42,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sessionType: {
    fontSize: 40,
    fontWeight: 'bold',
    marginRight: 20,
  },
  sessionDay: {
    fontSize: 40,
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
    paddingVertical: 10,
  },
  pricing: {
    fontSize: 28,
    marginBottom: 8,
    textAlign: 'center',
  },
  inviteSection: {
    alignItems: 'center',
    marginBottom: 60,
    paddingVertical: 20,
  },
  inviteText: {
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  appIcon: {
    width: 40,
    height: 40,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  footerText: {
    fontSize: 20,
    textAlign: 'center',
    marginRight: 10,
  },
  ctaText: {
    fontSize: 18,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});

ShareCard.displayName = 'ShareCard';

export default ShareCard; 