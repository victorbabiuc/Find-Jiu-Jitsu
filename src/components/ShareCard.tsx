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

const ShareCard = React.forwardRef<View, ShareCardProps>(({ 
  gym, 
  session, 
  includeImGoing = false, 
  style = 'classic' 
}, ref) => {
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
            backgroundColor: 'rgba(255, 255, 255, 0.8)', // White theme
            borderWidth: 1,
            borderColor: 'rgba(99, 102, 241, 0.2)', // Purple border for white theme
            shadowOpacity: 0.1,
          },
          gymName: { color: '#000000' }, // Black text for white theme
          gymAddress: { color: '#374151' }, // Dark gray for white theme
          websiteText: { color: '#6B7280' }, // Medium gray for white theme
          openMatLabel: { color: '#000000' }, // Black text for white theme
          sessionType: { color: '#000000' }, // Black text for white theme
          sessionDateTime: { color: '#000000' }, // Black text for white theme
          inviteText: { color: '#000000' }, // Black text for white theme
          footerText: { color: '#000000' }, // Black text for white theme
          footerSubtext: { color: '#374151' }, // Dark gray for white theme
        };
      case 'dark':
        return {
          container: { backgroundColor: 'transparent' },
          contentCard: { 
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.2)',
            shadowOpacity: 0.3,
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
      default: // classic style
        return {
          container: { backgroundColor: 'transparent' },
          contentCard: { 
            backgroundColor: 'rgba(255, 255, 255, 0.8)', // White theme
            borderWidth: 1,
            borderColor: 'rgba(99, 102, 241, 0.2)', // Purple border for white theme
            shadowOpacity: 0.1,
          },
          gymName: { color: '#000000' }, // Black text for white theme
          gymAddress: { color: '#374151' }, // Dark gray for white theme
          websiteText: { color: '#6B7280' }, // Medium gray for white theme
          openMatLabel: { color: '#000000' }, // Black text for white theme
          sessionType: { color: '#000000' }, // Black text for white theme
          sessionDateTime: { color: '#000000' }, // Black text for white theme
          inviteText: { color: '#000000' }, // Black text for white theme
          footerText: { color: '#000000' }, // Black text for white theme
          footerSubtext: { color: '#374151' }, // Dark gray for white theme
        };
    }
  };

  const styleStyles = getStyleSpecificStyles();

  const renderContent = () => (
    <View ref={ref} style={[styles.container, styleStyles.container]}>
      {/* Gradient background - now white/light theme */}
      <LinearGradient
        colors={['#FFFFFF', '#F3F4F6']} // White to light gray gradient
        style={styles.gradientBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      {/* Removed dark overlay for white theme */}

      {/* Subtle Mat Pattern */}
      <View style={styles.matPattern} />

      {/* Main Content Card */}
      <View style={[styles.contentCard, styleStyles.contentCard]}>
        {/* Gym Info */}
        <View style={styles.gymSection}>
          {/* Gym Logo - Enhanced styling */}
          {(() => {
            const gymId = String(gym.id || '');
            if (gymId.includes('10th-planet')) {
              return (
                <View style={styles.logoContainer}>
                  <View style={styles.logoGlow} />
                  <Image source={require('../../assets/logos/10th-planet-austin.png')} style={styles.gymLogo} />
                </View>
              );
            } else if (gymId.includes('stjj')) {
              return (
                <View style={styles.logoContainer}>
                  <View style={styles.logoGlow} />
                  <Image source={require('../../assets/logos/STJJ.png')} style={styles.gymLogo} />
                </View>
              );
            } else if (gymId.includes('gracie-tampa-south')) {
              return (
                <View style={styles.logoContainer}>
                  <View style={styles.logoGlow} />
                  <Image source={require('../../assets/logos/gracie-tampa-south.png')} style={styles.gymLogo} />
                </View>
              );
            } else if (gymId.includes('tmt')) {
              return (
                <View style={styles.logoContainer}>
                  <View style={styles.logoGlow} />
                  <Image source={require('../../assets/logos/TMT.png')} style={styles.gymLogo} />
                </View>
              );
            } else {
              return (
                <View style={styles.logoContainer}>
                  <View style={styles.logoGlow} />
                  <View style={styles.gymLogoPlaceholder}>
                    <Text style={styles.gymLogoText}>
                      {String(gym.name || '').split(' ').map(word => word[0]).join('').toUpperCase()}
                    </Text>
                  </View>
                </View>
              );
            }
          })()}
          
          {/* Gym Name */}
          <Text style={[styles.gymName, styleStyles.gymName]}>{String(gym.name || '')}</Text>
          
          {/* Address */}
          <Text style={[styles.gymAddress, styleStyles.gymAddress]}>📍 {String(gym.address || '')}</Text>
          
          {/* Divider Line */}
          <View style={styles.addressDivider} />
          
          {/* Website (if available) */}
          {gym.website && (
            <View style={styles.websiteContainer}>
              <Ionicons name="globe-outline" size={16} color="#FFFFFF" style={styles.websiteIcon} />
              <Text style={[styles.websiteText, styleStyles.websiteText]}>{gym.website}</Text>
            </View>
          )}
        </View>

        {/* Divider */}
        <View style={[styles.divider, { backgroundColor: 'rgba(99, 102, 241, 0.3)' }]} />

        {/* Session Info */}
        <View style={styles.sessionSection}>
          <View style={styles.sessionBadge}>
            <Text style={[styles.openMatLabel, styleStyles.openMatLabel]}>Open Mat</Text>
          </View>
          <View style={styles.sessionBadge}>
            <Text style={[styles.sessionType, styleStyles.sessionType]}>
              {getSessionTypeEmoji(String(session.type || ''))} {formatSessionType(session.type)}
            </Text>
          </View>
          <View style={styles.sessionBadge}>
            <Text style={[styles.sessionDateTime, styleStyles.sessionDateTime]}>
              {String(session.day || '').toUpperCase()} • {formatTime(String(session.time || ''))}
            </Text>
          </View>
        </View>
      </View>

      {/* Personal CTA */}
      <View style={styles.inviteSection}>
        <View style={styles.ctaContainer}>
          <Text style={[styles.inviteText, styleStyles.inviteText]}>
            LET'S ROLL!
          </Text>
          <Text style={styles.ctaSubtitle}>
            See you on the mats
          </Text>
        </View>
      </View>

      {/* Bottom App Promotion */}
      <View style={styles.bottomPromotion}>
        <Text style={styles.downloadText}>Download JiuJitsu Finder</Text>
        <Text style={styles.availableText}>Available on App Store</Text>
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
          <Text style={[styles.footerText, styleStyles.footerText]}>
            JiuJitsu Finder
          </Text>
          <Text style={[styles.footerSubtext, styleStyles.footerSubtext]}>
            Train anywhere, anytime!
          </Text>
        </View>
      </View>
    </View>
  );

  return renderContent();
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
    backgroundColor: 'transparent', // Changed from white to transparent for gradient
    padding: 60, // Increased from 40 to 60
    paddingTop: 100, // Increased from 80 to 100 for app branding space
    justifyContent: 'space-between',
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)', // Semi-transparent overlay
  },
  matPattern: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100, // As requested
    width: '100%', // As requested
    backgroundColor: 'rgba(255, 255, 255, 0.02)', // As requested - subtle texture overlay
    zIndex: -1, // Ensure it's behind other content
    // Subtle texture overlay - could add SVG pattern here
  },
  contentCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)', // Semi-transparent white for white theme
    borderRadius: 20,
    padding: 40,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)', // Light purple border for white theme
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  gymSection: {
    marginBottom: 50,
    alignItems: 'center',
  },
  gymLogo: {
    width: 200, // Increased from 150 to 200 for better visibility
    height: 200, // Increased from 150 to 200 for better visibility
    borderRadius: 100, // Updated to match new size
    borderWidth: 6, // Increased from 4 to 6 for better visibility
    borderColor: '#6366F1', // Purple border for white theme
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  gymLogoPlaceholder: {
    width: 200, // Increased from 150 to 200 for better visibility
    height: 200, // Increased from 150 to 200 for better visibility
    borderRadius: 100, // Updated to match new size
    backgroundColor: '#6366F1', // Purple background for white theme
    borderWidth: 6, // Increased from 4 to 6 for better visibility
    borderColor: '#6366F1', // Purple border for white theme
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  gymLogoText: {
    fontSize: 80, // Increased from 48 to 80 for better visibility
    fontWeight: 'bold',
    color: '#FFFFFF', // White text on purple background
  },
  gymName: {
    fontSize: 56, // Increased from 52 to 56 for more impact
    fontWeight: '800', // Changed to extra bold
    marginBottom: 8, // Added margin bottom
    letterSpacing: -0.5, // Added letter spacing for modern look
    textAlign: 'center',
    color: '#000000', // Pure black for maximum readability
  },
  gymAddress: {
    fontSize: 22, // Increased from 18 to 22 for better readability
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 20,
    color: '#374151', // Dark gray for better readability
    lineHeight: 24,
  },
  addressDivider: {
    height: 1, // Thin line
    backgroundColor: '#E5E7EB', // Light gray for separation
    marginVertical: 10, // Space around the line
    marginBottom: 15, // Reduced from 20 to 15 for better spacing
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
    fontSize: 20, // Increased from 16 to 20 for better visibility
    color: '#6366F1', // Purple to match theme
    marginLeft: 8,
    textDecorationLine: 'underline',
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
    flexDirection: 'row', // Make badges side-by-side
    justifyContent: 'center',
    flexWrap: 'wrap', // Allow wrapping if needed
  },
  sessionBadge: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)', // More visible purple tint
    borderRadius: 25,
    paddingVertical: 16, // Increased from 12 to 16
    paddingHorizontal: 28, // Increased from 24 to 28
    marginVertical: 8,
    marginHorizontal: 8, // Add horizontal spacing between badges
    borderWidth: 3, // Increased from 2 to 3 for more definition
    borderColor: 'rgba(99, 102, 241, 0.3)', // Stronger purple border
  },
  openMatLabel: {
    fontSize: 28, // Increased from 24 to 28 for more prominence
    fontWeight: '700', // Increased from 600 to 700 for bolder text
    textAlign: 'center',
    color: '#000000', // Pure black for maximum readability
  },
  sessionType: {
    fontSize: 28, // Increased from 24 to 28 for more prominence
    fontWeight: '700', // Increased from 600 to 700 for bolder text
    textAlign: 'center',
    color: '#000000', // Pure black for maximum readability
  },
  sessionDateTime: {
    fontSize: 28, // Increased from 24 to 28 for more prominence
    fontWeight: '700', // Increased from 600 to 700 for bolder text
    textAlign: 'center',
    color: '#000000', // Pure black for maximum readability
  },
  inviteSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  ctaContainer: {
    backgroundColor: 'rgba(99, 102, 241, 0.4)', // Stronger purple for more presence
    borderRadius: 16,
    padding: 28, // Increased from 20 to 28
    borderWidth: 2, // Increased from 1 to 2
    borderColor: 'rgba(99, 102, 241, 0.5)', // Stronger purple border
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '80%', // Make it fuller width
    shadowColor: '#6366F1', // Purple shadow to match theme
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  inviteText: {
    fontSize: 42, // Increased from 36 to 42 for more prominence
    fontWeight: '700',
    textAlign: 'center',
    color: '#000000', // Pure black for maximum readability
    marginBottom: 4,
  },
  ctaSubtitle: {
    fontSize: 28, // Increased from 24 to 28 for more prominence
    fontWeight: '500',
    textAlign: 'center',
    color: '#1F2937', // Very dark gray for better readability
    marginTop: 4,
  },
  bottomPromotion: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)', // More visible purple tint
    borderRadius: 12, // As requested
    padding: 16, // As requested
    marginBottom: 20, // As requested
    alignItems: 'center',
    marginTop: 40,
  },
  downloadText: {
    fontSize: 20, // Increased from 16 to 20 for better readability
    fontWeight: '600',
    color: '#000000', // Pure black for maximum readability
    textAlign: 'center', // As requested
    marginBottom: 4,
  },
  availableText: {
    fontSize: 16, // Increased from 12 to 16 for better readability
    fontWeight: '500',
    color: '#4B5563', // Medium gray for better readability
    textAlign: 'center', // As requested
  },
  footer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerAppIcon: {
    width: 100, // Increased from 60 to 100 for better visibility
    height: 100, // Increased from 60 to 100 for better visibility
    borderRadius: 50, // Updated to match new size
    marginBottom: 16,
  },
  footerTextContainer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 56,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
    color: '#000000', // Pure black for maximum readability
  },
  footerSubtext: {
    fontSize: 36, // Increased from 32 to 36 for more prominence
    fontWeight: '500',
    textAlign: 'center',
    color: '#374151', // Dark gray for better readability
  },
  logoContainer: {
    position: 'relative', // Added for proper positioning
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    width: 200, // Match logo size
    height: 200, // Match logo size
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  logoGlow: {
    position: 'absolute',
    top: 0, // Center the glow behind the logo
    left: 0, // Center the glow behind the logo
    width: 200, // Updated to match new logo size
    height: 200, // Updated to match new logo size
    borderRadius: 100, // Updated to match new size
    backgroundColor: 'rgba(99, 102, 241, 0.1)', // Light purple glow for white theme
    borderWidth: 2,
    borderColor: 'rgba(99, 102, 241, 0.2)', // Light purple border for white theme
  },
});

ShareCard.displayName = 'ShareCard';

export default ShareCard; 