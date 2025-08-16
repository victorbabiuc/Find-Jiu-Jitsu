import React, { memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { OpenMat, OpenMatSession } from '../../types';
import {
  formatTimeRange,
  getSessionTypeWithIcon,
  formatDate,
  openWebsite,
  openDirections,
  haptics,
} from '../../utils';
import tenthPlanetLogo from '../../../assets/logos/10th-planet-austin.png';
import stjjLogo from '../../../assets/logos/STJJ.png';

interface ResultsGymCardProps {
  gym: OpenMat;
  favorites: Set<string>;
  toggleFavorite: (id: string) => void;
  copyingGymId: string | null;
  copiedGymId: string | null;
  sharingGymId: string | null;
  handleShareImage: (gym: OpenMat) => void;
  gymLogos: Record<string, any>;
  handleHeartPress: (gym: OpenMat) => void;
  animateScale: (animValue: Animated.Value, scale: number) => void;
  heartScaleAnim: Animated.Value;
  copyScaleAnim: Animated.Value;
  websiteScaleAnim: Animated.Value;
  directionsScaleAnim: Animated.Value;
  shareScaleAnim: Animated.Value;
  index: number; // Index for component identification
}

const ResultsGymCard: React.FC<ResultsGymCardProps> = memo(
  ({
    gym,
    favorites,
    toggleFavorite,
    copyingGymId,
    copiedGymId,
    sharingGymId,
    handleShareImage,
    gymLogos,
    handleHeartPress,
    animateScale,
    heartScaleAnim,
    copyScaleAnim,
    websiteScaleAnim,
    directionsScaleAnim,
    shareScaleAnim,
    index,
  }) => {
    // Subtle button animation - native iOS feel
    const animateButtonPress = (animValue: Animated.Value) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // Instantly scale to 0.97 (very subtle)
      Animated.timing(animValue, {
        toValue: 0.97,
        duration: 100,
        useNativeDriver: true,
      }).start();
    };

    const animateButtonRelease = (animValue: Animated.Value) => {
      // Smoothly return to 1.0
      Animated.timing(animValue, {
        toValue: 1.0,
        duration: 100,
        useNativeDriver: true,
      }).start();
    };

    // Subtle button handlers - native iOS feel
    const handleWebsitePress = () => {
      console.log('BUTTON PRESSED: website');
      if (gym.website && gym.website.trim() !== '') {
        animateButtonPress(websiteScaleAnim);
        openWebsite(gym.website);
        // Return to normal scale after a short delay
        setTimeout(() => animateButtonRelease(websiteScaleAnim), 100);
      }
    };

    const handleDirectionsPress = () => {
      console.log('BUTTON PRESSED: directions');
      if (gym.address && gym.address !== 'Tampa, FL' && gym.address !== 'Austin, TX') {
        animateButtonPress(directionsScaleAnim);
        openDirections(gym.address);
        // Return to normal scale after a short delay
        setTimeout(() => animateButtonRelease(directionsScaleAnim), 100);
      }
    };

    const handleHeartPressLocal = () => {
      console.log('BUTTON PRESSED: heart');
      animateButtonPress(heartScaleAnim);
      haptics.light();
      handleHeartPress(gym);
      // Return to normal scale after a short delay
      setTimeout(() => animateButtonRelease(heartScaleAnim), 100);
    };

    const handleCopyPress = () => {
      console.log('BUTTON PRESSED: copy');
      if (copyingGymId !== gym.id && copiedGymId !== gym.id) {
        animateButtonPress(copyScaleAnim);
        // Note: Copy functionality is handled by the parent component
        // Return to normal scale after a short delay
        setTimeout(() => animateButtonRelease(copyScaleAnim), 100);
      }
    };

    const handleSharePress = () => {
      console.log('BUTTON PRESSED: share');
      if (sharingGymId !== gym.id) {
        animateButtonPress(shareScaleAnim);
        haptics.light();
        handleShareImage(gym);
        // Return to normal scale after a short delay
        setTimeout(() => animateButtonRelease(shareScaleAnim), 100);
      }
    };

    return (
      <View key={gym.id} style={styles.card}>
        <View style={styles.cardTouchable}>
          {/* Header: Gym Name + Logo */}
          <View style={styles.cardHeader}>
            {/* Left side - Gym name */}
            <View style={styles.gymNameContainer}>
              <Text style={styles.gymName}>{gym.name}</Text>
            </View>

            {/* Right side - Logo */}
            <View style={styles.logoContainer}>
              {gym.id.includes('10th-planet') ? (
                <Image source={tenthPlanetLogo} style={styles.gymLogo} />
              ) : gym.id.includes('stjj') ? (
                <Image source={stjjLogo} style={styles.gymLogo} />
              ) : false ? (
                <Image source={{ uri: gymLogos[gym.id] }} style={styles.gymLogo} />
              ) : (
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarText}>
                    {gym.name
                      .split(' ')
                      .map((word: string) => word[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()}
                  </Text>
                </View>
              )}
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
                  {formatTimeRange(session.time)} • {getSessionTypeWithIcon(session.type)}
                </Text>
              </View>
            ))}
          </View>

          {/* Fees Section */}
          <View style={styles.feesSection}>
            <View style={styles.feesHeader}>
              <Text style={styles.feesTitle}>Fees</Text>
            </View>
            <View style={styles.feeItem}>
              <Text style={styles.feeLabel}>Open mat - </Text>
              <Text style={[styles.feeValue, gym.matFee === 0 && { color: '#10B981' }]}>
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

          {/* Last Updated Section */}
          <View style={styles.lastUpdatedContainer}>
            <Text style={styles.lastUpdatedText}>
              Last updated: {gym.lastUpdated ? formatDate(gym.lastUpdated) : 'Unknown'}
            </Text>
          </View>

          {/* Unified Button Bar */}
          <View style={styles.unifiedButtonBar}>
            {/* Website Button */}
            <Animated.View style={{ transform: [{ scale: websiteScaleAnim }] }}>
              <TouchableOpacity
                style={[
                  styles.iconButton,
                  (!gym.website || gym.website.trim() === '') && styles.disabledIconButton,
                ]}
                onPress={handleWebsitePress}
                disabled={!gym.website || gym.website.trim() === ''}
                activeOpacity={1}
              >
                <Ionicons
                  name="globe-outline"
                  size={22}
                  color={!gym.website || gym.website.trim() === '' ? '#9CA3AF' : '#111518'}
                />
              </TouchableOpacity>
            </Animated.View>

            {/* Directions Button */}
            <Animated.View style={{ transform: [{ scale: directionsScaleAnim }] }}>
              <TouchableOpacity
                style={[
                  styles.iconButton,
                  (!gym.address || gym.address === 'Tampa, FL' || gym.address === 'Austin, TX') &&
                    styles.disabledIconButton,
                ]}
                onPress={handleDirectionsPress}
                disabled={
                  !gym.address || gym.address === 'Tampa, FL' || gym.address === 'Austin, TX'
                }
                activeOpacity={1}
              >
                <Ionicons
                  name="location-outline"
                  size={22}
                  color={
                    !gym.address || gym.address === 'Tampa, FL' || gym.address === 'Austin, TX'
                      ? '#9CA3AF'
                      : '#111518'
                  }
                />
              </TouchableOpacity>
            </Animated.View>

            {/* Heart Button */}
            <Animated.View style={{ transform: [{ scale: heartScaleAnim }] }}>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={handleHeartPressLocal}
                activeOpacity={1}
              >
                <Text
                  style={[
                    styles.iconText,
                    styles.heartIcon,
                    { color: favorites.has(gym.id) ? '#EF4444' : '#9CA3AF' },
                  ]}
                >
                  {favorites.has(gym.id) ? '♥' : '♡'}
                </Text>
              </TouchableOpacity>
            </Animated.View>

            {/* Copy Button */}
            <Animated.View style={{ transform: [{ scale: copyScaleAnim }] }}>
              <TouchableOpacity
                style={[styles.iconButton, copyingGymId === gym.id && styles.disabledIconButton]}
                onPress={handleCopyPress}
                disabled={copyingGymId === gym.id || copiedGymId === gym.id}
                activeOpacity={1}
              >
                {copyingGymId === gym.id ? (
                  <ActivityIndicator size="small" color="#60798A" />
                ) : copiedGymId === gym.id ? (
                  <Ionicons name="checkmark" size={22} color="#10B981" />
                ) : (
                  <Ionicons name="copy-outline" size={22} color="#60798A" />
                )}
              </TouchableOpacity>
            </Animated.View>

            {/* Share Button */}
            <Animated.View style={{ transform: [{ scale: shareScaleAnim }] }}>
              <TouchableOpacity
                style={[styles.iconButton, sharingGymId === gym.id && styles.disabledIconButton]}
                onPress={handleSharePress}
                disabled={sharingGymId === gym.id}
                activeOpacity={1}
              >
                {sharingGymId === gym.id ? (
                  <ActivityIndicator size="small" color="#111518" />
                ) : (
                  <Ionicons name="share-outline" size={22} color="#111518" />
                )}
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  cardTouchable: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  gymNameContainer: {
    flex: 1,
    marginRight: 12,
  },
  gymName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111518',
    lineHeight: 24,
  },
  logoContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gymLogo: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  sessionSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 12,
  },
  sessionsSection: {
    marginBottom: 16,
  },
  sessionBlock: {
    marginBottom: 8,
  },
  dayHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 2,
  },
  timeRange: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111518',
    lineHeight: 20,
  },
  feesSection: {
    marginBottom: 16,
  },
  feesHeader: {
    marginBottom: 8,
  },
  feesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  feeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  feeLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  feeValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111518',
  },
  lastUpdatedContainer: {
    marginBottom: 16,
  },
  lastUpdatedText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#9CA3AF',
  },
  unifiedButtonBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  disabledIconButton: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
  },
  iconText: {
    fontSize: 18,
    fontWeight: '400',
  },
  heartIcon: {
    fontSize: 20,
  },
});

export default ResultsGymCard;
