import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { OpenMat, OpenMatSession } from '../types';
import { useTheme } from '../context/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';

interface ShareCardProps {
  gym: OpenMat;
  session: OpenMatSession;
  includeImGoing?: boolean;
  style?: 'classic' | 'modern' | 'dark';
}

const ShareCard = React.forwardRef<View, ShareCardProps>(
  ({ gym, session, includeImGoing = false, style = 'classic' }, ref) => {
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
      return String(time || '')
        .replace(/\s+/g, ' ')
        .trim();
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

    // Get gym brand colors for modern style
    const getGymBrandColors = () => {
      const gymId = String(gym.id || '');
      if (gymId.includes('10th-planet')) {
        return ['#FF6B35', '#CC4A1A']; // Orange gradient
      } else if (gymId.includes('stjj')) {
        return ['#1E40AF', '#1E3A8A']; // Blue gradient
      } else if (gymId.includes('gracie-tampa-south')) {
        return ['#DC2626', '#B91C1C']; // Red gradient
      } else if (gymId.includes('tmt')) {
        return ['#059669', '#047857']; // Green gradient
      } else {
        return ['#3B82F6', '#1D4ED8']; // Default blue gradient
      }
    };

    const brandColors = getGymBrandColors();

    // Style-specific styles
    const getStyleSpecificStyles = () => {
      switch (style) {
        case 'modern':
          return {
            container: { backgroundColor: 'transparent' },
            contentCard: {
              backgroundColor: 'transparent',
              borderWidth: 0,
              shadowOpacity: 0.2,
            },
            gymName: { color: '#FFFFFF' },
            gymAddress: { color: '#E5E7EB' },
            websiteText: { color: '#E5E7EB' },
            openMatLabel: { color: '#FFFFFF' },
            sessionType: { color: '#FFFFFF' },
            sessionDateTime: { color: '#FFFFFF' },
            inviteText: { color: '#FFFFFF' },
            footerText: { color: '#FFFFFF' },
            footerSubtext: { color: '#E5E7EB' },
          };
        case 'dark':
          return {
            container: { backgroundColor: '#000000' },
            contentCard: {
              backgroundColor: '#1F2937',
              borderColor: '#374151',
            },
            gymName: { color: '#FFFFFF' },
            gymAddress: { color: '#9CA3AF' },
            websiteText: { color: '#9CA3AF' },
            openMatLabel: { color: '#FFFFFF' },
            sessionType: { color: '#FFFFFF' },
            sessionDateTime: { color: '#FFFFFF' },
            inviteText: { color: '#FFFFFF' },
            footerText: { color: '#FFFFFF' },
            footerSubtext: { color: '#9CA3AF' },
          };
        default: // classic
          return {
            container: { backgroundColor: '#F9FAFB' },
            contentCard: {
              backgroundColor: '#FFFFFF',
              borderColor: '#D1D5DB',
            },
            gymName: { color: '#111827' },
            gymAddress: { color: '#6B7280' },
            websiteText: { color: '#6B7280' },
            openMatLabel: { color: '#111827' },
            sessionType: { color: '#111827' },
            sessionDateTime: { color: '#111827' },
            inviteText: { color: '#111827' },
            footerText: { color: '#111827' },
            footerSubtext: { color: '#6B7280' },
          };
      }
    };

    const styleStyles = getStyleSpecificStyles();

    const renderContent = () => (
      <View ref={ref} style={[styles.container, styleStyles.container]}>
        {/* Gradient background for modern style */}
        {style === 'modern' && (
          <LinearGradient
            colors={brandColors as [string, string]}
            style={styles.gradientBackground}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        )}

        {/* Main Content Card */}
        <View style={[styles.contentCard, styleStyles.contentCard]}>
          {/* Gym Info */}
          <View style={styles.gymSection}>
            {/* Gym Logo - Optimized for performance */}
            {(() => {
              const gymId = String(gym.id || '');
              if (gymId.includes('10th-planet')) {
                return (
                  <Image
                    source={require('../../assets/logos/10th-planet-austin.png')}
                    style={styles.gymLogo}
                  />
                );
              } else if (gymId.includes('stjj')) {
                return (
                  <Image source={require('../../assets/logos/STJJ.png')} style={styles.gymLogo} />
                );
              } else if (gymId.includes('gracie-tampa-south')) {
                return (
                  <Image
                    source={require('../../assets/logos/gracie-tampa-south.png')}
                    style={styles.gymLogo}
                  />
                );
              } else if (gymId.includes('tmt')) {
                return (
                  <Image source={require('../../assets/logos/TMT.png')} style={styles.gymLogo} />
                );
              } else {
                return (
                  <View style={styles.gymLogoPlaceholder}>
                    <Text style={styles.gymLogoText}>
                      {String(gym.name || '')
                        .split(' ')
                        .map(word => word[0])
                        .join('')
                        .toUpperCase()}
                    </Text>
                  </View>
                );
              }
            })()}

            {/* Gym Name */}
            <Text style={[styles.gymName, styleStyles.gymName]}>{String(gym.name || '')}</Text>

            {/* Address */}
            <Text style={[styles.gymAddress, styleStyles.gymAddress]}>
              {String(gym.address || '')}
            </Text>

            {/* Website (if available) */}
            {gym.website && (
              <View style={styles.websiteContainer}>
                <Ionicons
                  name="globe-outline"
                  size={16}
                  color={style === 'dark' ? '#9CA3AF' : '#6B7280'}
                  style={styles.websiteIcon}
                />
                <Text style={[styles.websiteText, styleStyles.websiteText]}>{gym.website}</Text>
              </View>
            )}
          </View>

          {/* Divider */}
          <View
            style={[styles.divider, { backgroundColor: style === 'dark' ? '#374151' : '#E5E7EB' }]}
          />

          {/* Session Info */}
          <View style={styles.sessionSection}>
            <Text style={[styles.openMatLabel, styleStyles.openMatLabel]}>Open Mat</Text>
            <Text style={[styles.sessionType, styleStyles.sessionType]}>
              {getSessionTypeEmoji(String(session.type || ''))} {formatSessionType(session.type)}
            </Text>
            <Text style={[styles.sessionDateTime, styleStyles.sessionDateTime]}>
              {String(session.day || '')} {formatTime(String(session.time || ''))}
            </Text>
          </View>
        </View>

        {/* Personal CTA */}
        <View style={styles.inviteSection}>
          <Text style={[styles.inviteText, styleStyles.inviteText]}>
            {includeImGoing ? "I'm going, come train with me! 🔥" : 'Join me for training! 🔥'}
          </Text>
        </View>

        {/* Footer Branding */}
        <View style={styles.footer}>
          <Image
            source={require('../../assets/icon.png')}
            style={styles.footerAppIcon}
            resizeMode="contain"
            onError={error => console.log('Footer app icon error:', error)}
          />
          <View style={styles.footerTextContainer}>
            <Text style={[styles.footerText, styleStyles.footerText]}>JiuJitsu Finder</Text>
            <Text style={[styles.footerSubtext, styleStyles.footerSubtext]}>
              Find your next roll
            </Text>
          </View>
        </View>
      </View>
    );

    return renderContent();
  }
);

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
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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
  sessionType: {
    fontSize: 48,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#111827',
  },
  sessionDateTime: {
    fontSize: 48,
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerAppIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'transparent',
    resizeMode: 'contain',
    marginBottom: 16,
  },
  footerTextContainer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 48,
    textAlign: 'center',
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
  },
  footerSubtext: {
    fontSize: 32,
    textAlign: 'center',
    fontWeight: '500',
    color: '#6B7280',
  },
});

ShareCard.displayName = 'ShareCard';

export default ShareCard;
