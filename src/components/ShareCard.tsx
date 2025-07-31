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

  const formatSessionType = (type: string) => {
    const typeStr = String(type || '').toLowerCase();
    switch (typeStr) {
      case 'gi':
        return 'Gi';
      case 'nogi':
        return 'No-Gi';
      case 'both':
        return 'Gi/No-Gi';
      case 'mma':
      case 'mma sparring':
        return 'MMA';
      default:
        return type || 'Training';
    }
  };

  return (
    <View ref={ref} style={styles.container}>
      {/* Main Content Card */}
      <View style={styles.contentCard}>
        {/* Gym Info */}
        <View style={styles.gymSection}>
          {/* Gym Logo - Optimized for performance */}
          {(() => {
            const gymId = String(gym.id || '');
            if (gymId.includes('10th-planet')) {
              return <Image source={require('../../assets/logos/10th-planet-austin.png')} style={styles.gymLogo} />;
            } else if (gymId.includes('stjj')) {
              return <Image source={require('../../assets/logos/STJJ.png')} style={styles.gymLogo} />;
            } else if (gymId.includes('gracie-tampa-south')) {
              return <Image source={require('../../assets/logos/gracie-tampa-south.png')} style={styles.gymLogo} />;
            } else if (gymId.includes('tmt')) {
              return <Image source={require('../../assets/logos/TMT.png')} style={styles.gymLogo} />;
            } else {
              return (
                <View style={styles.gymLogoPlaceholder}>
                  <Text style={styles.gymLogoText}>
                    {String(gym.name || '').split(' ').map(word => word[0]).join('').toUpperCase()}
                  </Text>
                </View>
              );
            }
          })()}
          
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
              {getSessionTypeEmoji(String(session.type || ''))} {formatSessionType(session.type)}
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
            JiuJitsu Finder
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
    padding: 40,
    paddingTop: 80,
    justifyContent: 'space-between',
  },
  contentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    padding: 60,
    marginBottom: 60,
    // Simplified shadows for better performance
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    overflow: 'hidden',
  },
  gymSection: {
    marginBottom: 50,
    alignItems: 'center',
  },
  gymLogo: {
    width: 140,
    height: 140,
    borderRadius: 70,
    marginBottom: 30,
  },
  gymLogoPlaceholder: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  gymLogoText: {
    fontSize: 56,
    fontWeight: 'bold',
    color: '#6B7280',
  },
  gymName: {
    fontSize: 72,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
    lineHeight: 78,
    color: '#111827',
  },
  gymAddress: {
    fontSize: 44,
    textAlign: 'center',
    lineHeight: 52,
    marginBottom: 12,
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
    fontSize: 36,
    textAlign: 'center',
    color: '#6B7280',
  },
  divider: {
    height: 3,
    backgroundColor: '#E5E7EB',
    marginVertical: 30,
    borderRadius: 2,
  },
  sessionSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  openMatLabel: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#111827',
  },
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sessionType: {
    fontSize: 44,
    fontWeight: 'bold',
    marginRight: 20,
    color: '#111827',
  },
  sessionDay: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#111827',
  },
  sessionTime: {
    fontSize: 68,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#111827',
  },
  inviteSection: {
    alignItems: 'center',
    marginBottom: 80,
    paddingVertical: 40,
  },
  inviteText: {
    fontSize: 60,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 68,
    color: '#111827',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerAppIcon: {
    width: 140,
    height: 140,
    marginRight: 20,
    borderRadius: 70,
    backgroundColor: 'transparent',
    resizeMode: 'contain',
  },
  footerTextContainer: {
    alignItems: 'flex-start',
  },
  footerText: {
    fontSize: 56,
    textAlign: 'left',
    fontWeight: '800',
    color: '#111827',
    marginBottom: 6,
  },
  footerSubtext: {
    fontSize: 36,
    textAlign: 'left',
    fontWeight: '500',
    color: '#6B7280',
  },
});

ShareCard.displayName = 'ShareCard';

export default ShareCard; 