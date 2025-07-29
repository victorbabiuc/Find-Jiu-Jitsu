import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
    <View ref={ref} style={styles.container}>
      {/* Main Content Card */}
      <View style={styles.contentCard}>
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
          
          {/* Gym Name */}
          <Text style={styles.gymName}>{String(gym.name || '')}</Text>
          
          {/* Address */}
          <Text style={styles.gymAddress}>{String(gym.address || '')}</Text>
          
          {/* Website (if available) */}
          {gym.website && (
            <View style={styles.websiteContainer}>
              <Ionicons name="globe-outline" size={16} color="#6B7280" style={styles.websiteIcon} />
              <Text style={styles.websiteText}>{gym.website}</Text>
            </View>
          )}
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Session Info */}
        <View style={styles.sessionSection}>
          <Text style={styles.openMatLabel}>Open Mat</Text>
          <View style={styles.sessionHeader}>
            <Text style={styles.sessionType}>
              {getSessionTypeEmoji(String(session.type || ''))} {String(session.type || '')}
            </Text>
            <Text style={styles.sessionDay}>
              {String(session.day || '')}
            </Text>
          </View>
          
          <Text style={styles.sessionTime}>
            {formatTime(String(session.time || ''))}
          </Text>
        </View>
      </View>

      {/* Personal CTA */}
      <View style={styles.inviteSection}>
        <Text style={styles.inviteText}>
          {includeImGoing ? 'I\'m going, come train with me! 🔥' : 'Join me for training! 🔥'}
        </Text>
      </View>

      {/* Footer Branding */}
      <View style={styles.footer}>
        <Image 
          source={require('../../assets/icon.png')} 
          style={styles.footerAppIcon}
          resizeMode="contain"
          onError={(error) => console.log('Footer app icon error:', error)}
        />
        <View style={styles.footerTextContainer}>
          <Text style={styles.footerText}>
            Find Jiu Jitsu
          </Text>
          <Text style={styles.footerSubtext}>
            Find your next roll
          </Text>
        </View>
      </View>
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
    backgroundColor: '#F9FAFB',
    padding: 20,
    paddingTop: 20,
    justifyContent: 'space-between',
  },
  contentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 40,
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    overflow: 'hidden',
  },
  gymSection: {
    marginBottom: 30,
    alignItems: 'center',
  },
  gymLogo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 20,
  },
  gymLogoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  gymLogoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#6B7280',
  },
  gymName: {
    fontSize: 56,
    fontWeight: 'bold',
    marginBottom: 6,
    textAlign: 'center',
    lineHeight: 62,
    color: '#111827',
  },
  gymAddress: {
    fontSize: 32,
    textAlign: 'center',
    lineHeight: 40,
    marginBottom: 8,
    color: '#6B7280',
  },
  websiteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  websiteIcon: {
    marginRight: 6,
  },
  websiteText: {
    fontSize: 26,
    textAlign: 'center',
    color: '#6B7280',
  },
  divider: {
    height: 2,
    backgroundColor: '#E5E7EB',
    marginVertical: 20,
    borderRadius: 1,
  },
  sessionSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  openMatLabel: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#111827',
  },
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sessionType: {
    fontSize: 32,
    fontWeight: 'bold',
    marginRight: 16,
    color: '#111827',
  },
  sessionDay: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#111827',
  },
  sessionTime: {
    fontSize: 52,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#111827',
  },
  inviteSection: {
    alignItems: 'center',
    marginBottom: 60,
    paddingVertical: 30,
  },
  inviteText: {
    fontSize: 48,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 56,
    color: '#111827',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerAppIcon: {
    width: 100,
    height: 100,
    marginRight: 16,
    borderRadius: 50,
    backgroundColor: 'transparent',
    resizeMode: 'contain',
  },
  footerTextContainer: {
    alignItems: 'flex-start',
  },
  footerText: {
    fontSize: 42,
    textAlign: 'left',
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 26,
    textAlign: 'left',
    fontWeight: '500',
    color: '#6B7280',
  },
});

ShareCard.displayName = 'ShareCard';

export default ShareCard; 