import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Share,
  Alert,
  Modal,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import tenthPlanetLogo from '../../assets/logos/10th-planet-austin.png';
import stjjLogo from '../../assets/logos/STJJ.png';
import { ShareCard, Toast } from './index';
import { captureAndShareCard } from '../utils/screenshot';
import { haptics, animations } from '../utils';
import { useTheme } from '../context/ThemeContext';
import { OpenMat, OpenMatSession } from '../types';

interface OpenMatCardProps {
  gym: OpenMat;
  favorites: Set<string>;
  onHeartPress: (gym: OpenMat) => void;
  onPress?: (gym: OpenMat) => void;
  openWebsite: (url: string) => void;
  openDirections: (address: string) => void;
}

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 3);
};

const OpenMatCard: React.FC<OpenMatCardProps> = ({
  gym,
  favorites,
  onHeartPress,
  onPress,
  openWebsite,
  openDirections,
}) => {
  const cardRef = useRef<View>(null);
  const { theme } = useTheme();
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [includeImGoing, setIncludeImGoing] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const buttonScaleAnim = useRef(new Animated.Value(1)).current;
  const heartScaleAnim = useRef(new Animated.Value(1)).current;
  const cardPressAnim = useRef(new Animated.Value(1)).current;
  // const heartColorAnim = useRef(new Animated.Value(0)).current; // Temporarily disabled

  // State tracking removed for production

  // Entrance animation
  useEffect(() => {
    animations
      .parallel([animations.fadeIn(fadeAnim, 400), animations.scale(scaleAnim, 1, 400)])
      .start();
  }, []);

  const handleShare = async () => {
    try {
      // Use the full address from the gym data
      const displayAddress = gym.address;

      // Get session info from the first session in openMats array
      const firstSession = gym.openMats && gym.openMats.length > 0 ? gym.openMats[0] : null;
      const sessionInfo = firstSession
        ? `⏰ ${firstSession.day.toUpperCase()} ${firstSession.time} - ${firstSession.type === 'gi' ? 'Gi' : firstSession.type === 'nogi' ? 'No-Gi' : 'Gi & No-Gi'}`
        : '';

      const inviteMessage = includeImGoing
        ? "🏃 I'm going, come train with me!"
        : '🏃 Join me for training!';

      const shareText =
        `${gym.name}\n` +
        (displayAddress && displayAddress.trim() !== '' ? `📍 ${displayAddress}\n` : '') +
        (gym.website ? `🌐 ${gym.website.replace(/^https?:\/\//, '')}\n` : '') +
        (sessionInfo ? `${sessionInfo}\n` : '') +
        `💵 Open mat: ${gym.matFee === 0 ? 'Free' : gym.matFee ? `$${gym.matFee}` : 'Contact gym'}\n\n` +
        `${inviteMessage}\n\n` +
        `📱 Get the app:\nhttps://bit.ly/40DjTlM`;

      Share.share({
        message: shareText,
        title: `${gym.name} - Jiu Jitsu Gym`,
      });
    } catch (error) {
      // Share error handled silently
    }
  };

  const handleScreenshotShare = async () => {
    if (isSharing) return; // Prevent multiple clicks

    haptics.light(); // Light haptic for button press
    setIsSharing(true);
    try {
      // Get the first session for the share card
      const firstSession = gym.openMats && gym.openMats.length > 0 ? gym.openMats[0] : null;

      if (!firstSession) {
        haptics.warning(); // Warning haptic for no sessions
        Alert.alert('No Sessions', 'No sessions available to share.');
        return;
      }

      await captureAndShareCard(cardRef, gym, firstSession);
      haptics.success(); // Success haptic for successful share
    } catch (error) {
      haptics.error(); // Error haptic for failed share
      Alert.alert('❌ Sharing Error', 'Failed to create and share the image. Please try again.', [
        { text: 'OK' },
      ]);
    } finally {
      setIsSharing(false);
    }
  };

  const handleShareOptions = () => {
    setShowShareOptions(true);
  };

  const handleHeartPress = () => {
    const isFavorited = favorites.has(gym.id);

    // Haptic feedback
    if (isFavorited) {
      haptics.light(); // Light haptic for unfavoriting
    } else {
      haptics.success(); // Success haptic for favoriting
    }

    // Heart button animation
    animations
      .sequence([
        animations.scale(heartScaleAnim, 1.3, 150),
        animations.scale(heartScaleAnim, 1, 200),
      ])
      .start();

    // Color transition animation - temporarily disabled
    // const targetColor = isFavorited ? 0 : 1;
    // Animated.timing(heartColorAnim, {
    //   toValue: targetColor,
    //   duration: 300,
    //   useNativeDriver: false,
    // }).start();

    // Call the original handler
    onHeartPress(gym);
  };

  const handleCopy = async () => {
    if (isCopying) return; // Prevent multiple clicks

    haptics.light(); // Light haptic for button press
    animations.bounce(buttonScaleAnim, 200).start(); // Button press animation
    setIsCopying(true);
    try {
      // Get session info from the first session in openMats array
      const firstSession = gym.openMats && gym.openMats.length > 0 ? gym.openMats[0] : null;
      const sessionInfo = firstSession
        ? `📅 ${firstSession.day.toUpperCase()}, ${firstSession.time}`
        : '';

      const copyText = `🥋 ${gym.name} - Open Mat
${sessionInfo}
👕 ${firstSession ? (firstSession.type === 'gi' ? 'Gi' : firstSession.type === 'nogi' ? 'No-Gi' : 'Gi & No-Gi') : 'Session'}
💵 Open mat: ${gym.matFee === 0 ? 'Free' : gym.matFee ? `$${gym.matFee}` : 'Contact gym'}
📍 ${gym.address}
🏃 I'm going, come train with me!
📱 Get the app: https://bit.ly/40DjTlM`;

      await Clipboard.setStringAsync(copyText);

      haptics.success(); // Success haptic for successful copy
      // Show success toast
      setToastMessage('Copied to clipboard!');
      setToastType('success');
      setShowToast(true);
    } catch (error) {
      haptics.error(); // Error haptic for failed copy
      // Show error toast
      setToastMessage('Failed to copy to clipboard');
      setToastType('error');
      setShowToast(true);
    } finally {
      setIsCopying(false);
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      {/* Invisible ShareCard rendered off-screen */}
      {gym.openMats && gym.openMats.length > 0 && (
        <ShareCard
          ref={cardRef}
          gym={gym}
          session={gym.openMats[0]}
          includeImGoing={includeImGoing}
        />
      )}

      <View
        style={[
          styles.card,
          {
            transform: [{ scale: cardPressAnim }],
          },
        ]}
        onTouchStart={() => {
          if (onPress) {
            Animated.spring(cardPressAnim, {
              toValue: 0.98,
              tension: 100,
              friction: 8,
              useNativeDriver: true,
            }).start();
          }
        }}
        onTouchEnd={() => {
          if (onPress) {
            Animated.spring(cardPressAnim, {
              toValue: 1,
              tension: 100,
              friction: 8,
              useNativeDriver: true,
            }).start();
            // Small delay to ensure animation completes before navigation
            setTimeout(() => {
              onPress(gym);
            }, 100);
          }
        }}
      >
        {/* Header: Logo/Avatar + Gym Name + Heart */}
        <View style={styles.cardHeader}>
          {gym.id.includes('10th-planet') ? (
            <Image source={tenthPlanetLogo} style={styles.gymLogo} />
          ) : gym.id.includes('stjj') ? (
            <Image source={stjjLogo} style={styles.gymLogo} />
          ) : (
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{getInitials(gym.name)}</Text>
            </View>
          )}
          <Text style={styles.gymName}>{gym.name}</Text>
          <View style={styles.logoHeartContainer}>
            <Animated.View style={{ transform: [{ scale: heartScaleAnim }] }}>
              <TouchableOpacity style={styles.heartButton} onPress={handleHeartPress}>
                <Text
                  style={[
                    styles.heartIcon,
                    { color: favorites.has(gym.id) ? '#EF4444' : '#9CA3AF' },
                  ]}
                >
                  {favorites.has(gym.id) ? '♥' : '♡'}
                </Text>
              </TouchableOpacity>
            </Animated.View>
            <Animated.View style={{ transform: [{ scale: buttonScaleAnim }] }}>
              <TouchableOpacity
                style={[styles.copyButton, isCopying && styles.disabledButton]}
                onPress={handleCopy}
                disabled={isCopying}
              >
                {isCopying ? (
                  <ActivityIndicator size="small" color="#60798A" />
                ) : (
                  <Ionicons name="copy-outline" size={20} color="#60798A" />
                )}
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>

        {/* Session Type Subtitle */}
        <Text style={styles.sessionSubtitle}>Open Mat Sessions</Text>

        {/* Sessions Section */}
        <View style={styles.sessionsSection}>
          {gym.openMats.map((session: OpenMatSession, index: number) => (
            <View key={index} style={styles.sessionBlock}>
              <Text style={styles.dayHeader}>{session.day.toUpperCase()}</Text>
              <Text style={styles.timeRange}>
                {session.time} •{' '}
                {session.type === 'gi'
                  ? 'Gi 🥋'
                  : session.type === 'nogi'
                    ? 'No-Gi 👕'
                    : session.type.toLowerCase() === 'mma' ||
                        session.type.toLowerCase() === 'mma sparring'
                      ? 'MMA Sparring 🥊'
                      : session.type === 'both'
                        ? 'Gi & No-Gi 🥋👕'
                        : `${session.type} 🥋👕`}
              </Text>
            </View>
          ))}
        </View>

        {/* Fees Section */}
        <View style={styles.feesSection}>
          <View style={styles.feesHeader}>
            <Text style={styles.infoIcon}>💵</Text>
            <Text style={styles.infoText}>Fees</Text>
          </View>
          <View style={styles.feeItem}>
            <Text style={styles.feeLabel}>Open mat - </Text>
            <Text style={[styles.feeValue, gym.matFee === 0 && { color: '#10B981' }]}>
              {' '}
              {/* Green if free */}
              {gym.matFee === 0 ? 'Free' : gym.matFee ? `$${gym.matFee}` : '?/unknown'}
            </Text>
          </View>
          <View style={styles.feeItem}>
            <Text style={styles.feeLabel}>Class Drop in - </Text>
            <Text style={styles.feeValue}>
              {typeof gym.dropInFee === 'number'
                ? gym.dropInFee === 0
                  ? 'Free'
                  : `$${gym.dropInFee}`
                : '?/unknown'}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              (!gym.website || gym.website.trim() === '') && styles.disabledButton,
            ]}
            onPress={() => {
              if (gym.website && gym.website.trim() !== '') {
                haptics.light(); // Light haptic for website button
                openWebsite(gym.website);
              }
            }}
            disabled={!gym.website || gym.website.trim() === ''}
          >
            <Text
              style={[
                styles.buttonText,
                (!gym.website || gym.website.trim() === '') && styles.disabledText,
              ]}
            >
              🌐 Website
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.actionButton,
              (!gym.address || gym.address === 'Tampa, FL' || gym.address === 'Austin, TX') &&
                styles.disabledButton,
            ]}
            onPress={() => {
              if (gym.address && gym.address !== 'Tampa, FL' && gym.address !== 'Austin, TX') {
                haptics.light(); // Light haptic for directions button
                openDirections(gym.address);
              }
            }}
            disabled={!gym.address || gym.address === 'Tampa, FL' || gym.address === 'Austin, TX'}
          >
            <Text
              style={[
                styles.buttonText,
                (!gym.address || gym.address === 'Tampa, FL' || gym.address === 'Austin, TX') &&
                  styles.disabledText,
              ]}
            >
              📍 Directions
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, isSharing && styles.disabledButton]}
            onPress={() => {
              haptics.light(); // Light haptic for share button
              handleShareOptions();
            }}
            disabled={isSharing}
          >
            {isSharing ? (
              <ActivityIndicator size="small" color="#111518" />
            ) : (
              <Text style={styles.buttonText}>↗️ Share</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Share Options Modal - Moved outside TouchableOpacity */}
      <Modal
        visible={showShareOptions}
        transparent
        animationType="slide"
        onRequestClose={() => setShowShareOptions(false)}
      >
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}
          activeOpacity={1}
          onPress={() => setShowShareOptions(false)}
        >
          <View
            style={{
              backgroundColor: theme.surface,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              paddingHorizontal: 20,
              paddingTop: 20,
              paddingBottom: 40,
            }}
          >
            <Text
              style={{
                fontSize: 20,
                fontWeight: 'bold',
                marginBottom: 20,
                color: theme.text.primary,
                textAlign: 'center',
              }}
            >
              Share Open Mat
            </Text>

            {/* I'm Going Toggle */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 20,
                paddingHorizontal: 10,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  color: theme.text.primary,
                  flex: 1,
                }}
              >
                Say "I'm going"?
              </Text>
              <TouchableOpacity
                style={{
                  width: 50,
                  height: 30,
                  backgroundColor: includeImGoing ? '#007AFF' : '#ccc',
                  borderRadius: 15,
                  justifyContent: 'center',
                  alignItems: includeImGoing ? 'flex-end' : 'flex-start',
                  paddingHorizontal: 2,
                }}
                onPress={() => setIncludeImGoing(!includeImGoing)}
              >
                <View
                  style={{
                    width: 26,
                    height: 26,
                    backgroundColor: 'white',
                    borderRadius: 13,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.2,
                    shadowRadius: 1,
                    elevation: 2,
                  }}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={{
                padding: 16,
                backgroundColor: theme.surfaceHover,
                borderRadius: 12,
                marginBottom: 12,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onPress={() => {
                setShowShareOptions(false);
                handleShare(); // Existing text share
              }}
            >
              <Text style={{ fontSize: 18, color: theme.text.primary }}>📝 Share as Text</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                padding: 16,
                backgroundColor: theme.surfaceHover,
                borderRadius: 12,
                marginBottom: 12,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onPress={() => {
                setShowShareOptions(false);
                handleScreenshotShare(); // Image share function
              }}
            >
              <Text style={{ fontSize: 18, color: theme.text.primary }}>📸 Share as Image</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{ padding: 16, marginTop: 8 }}
              onPress={() => setShowShareOptions(false)}
            >
              <Text
                style={{
                  fontSize: 16,
                  color: theme.text.secondary,
                  textAlign: 'center',
                }}
              >
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Toast Notification */}
      <Toast
        visible={showToast}
        message={toastMessage}
        type={toastType}
        onHide={() => setShowToast(false)}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: '100%',
    maxWidth: 500,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  gymLogo: {
    width: 36,
    height: 36,
    borderRadius: 18,
    resizeMode: 'contain',
    marginRight: 10,
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
  },
  gymName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  logoHeartContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  copyButton: {
    padding: 12,
    marginLeft: 4,
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartButton: {
    padding: 12,
    marginRight: 4,
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartIcon: {
    fontSize: 24,
  },
  sessionSubtitle: {
    fontSize: 14,
    color: '#60798A',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  sessionsSection: {
    marginBottom: 12,
  },
  sessionBlock: {
    marginBottom: 8,
  },
  dayHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111518',
    marginBottom: 2,
  },
  timeRange: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111518',
    marginBottom: 2,
  },
  feesSection: {
    marginBottom: 12,
  },
  feesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  feeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 30,
    marginBottom: 4,
  },
  feeLabel: {
    fontSize: 13,
    color: '#60798A',
    fontWeight: '500',
  },
  feeValue: {
    fontSize: 13,
    color: '#111518',
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
    gap: 8,
  },
  infoIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  infoText: {
    fontSize: 14,
    fontWeight: '500',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minHeight: 44,
  },
  buttonText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#111518',
    textAlign: 'center',
  },
  disabledButton: {
    backgroundColor: '#F3F4F6',
    borderColor: '#D1D5DB',
    opacity: 0.7,
  },
  disabledText: {
    color: '#9CA3AF',
  },
});

export default React.memo(OpenMatCard, (prevProps, nextProps) => {
  // Return true if props are equal (skip re-render)
  // Return false if props changed (re-render)

  // Check if gym data changed
  if (prevProps.gym.id !== nextProps.gym.id) return false;
  if (prevProps.gym.name !== nextProps.gym.name) return false;
  if (prevProps.gym.address !== nextProps.gym.address) return false;
  if (prevProps.gym.website !== nextProps.gym.website) return false;
  if (prevProps.gym.matFee !== nextProps.gym.matFee) return false;
  if (prevProps.gym.dropInFee !== nextProps.gym.dropInFee) return false;
  if (prevProps.gym.coordinates !== nextProps.gym.coordinates) return false;
  if (prevProps.gym.lastUpdated !== nextProps.gym.lastUpdated) return false;

  // Check if openMats sessions changed
  if (prevProps.gym.openMats?.length !== nextProps.gym.openMats?.length) return false;

  // Deep compare openMats sessions
  if (prevProps.gym.openMats && nextProps.gym.openMats) {
    for (let i = 0; i < prevProps.gym.openMats.length; i++) {
      const prevSession = prevProps.gym.openMats[i];
      const nextSession = nextProps.gym.openMats[i];
      if (
        prevSession.day !== nextSession.day ||
        prevSession.time !== nextSession.time ||
        prevSession.type !== nextSession.type
      ) {
        return false;
      }
    }
  }

  // Check if favorite status changed
  const prevIsFavorite = prevProps.favorites.has(prevProps.gym.id);
  const nextIsFavorite = nextProps.favorites.has(nextProps.gym.id);
  if (prevIsFavorite !== nextIsFavorite) return false;

  // Check if function references changed (these should be stable)
  if (prevProps.onHeartPress !== nextProps.onHeartPress) return false;
  if (prevProps.onPress !== nextProps.onPress) return false;
  if (prevProps.openWebsite !== nextProps.openWebsite) return false;
  if (prevProps.openDirections !== nextProps.openDirections) return false;

  // All props are equal, skip re-render
  return true;
});
