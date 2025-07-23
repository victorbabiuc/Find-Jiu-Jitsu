import React, { useRef, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Share, Alert, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import tenthPlanetLogo from '../../assets/logos/10th-planet-austin.png';
import stjjLogo from '../../assets/logos/STJJ.png';
import { ShareCard } from './index';
import { captureAndShareCard } from '../utils/screenshot';
import { useTheme } from '../context/ThemeContext';

interface OpenMatCardProps {
  gym: any;
  favorites: Set<string>;
  onHeartPress: (gym: any) => void;
  onPress?: (gym: any) => void;
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

  // State tracking removed for production

  const handleShare = async () => {
    try {
      // Use the full address from the gym data
      const displayAddress = gym.address;
      
      // Get session info from the first session in openMats array
      const firstSession = gym.openMats && gym.openMats.length > 0 ? gym.openMats[0] : null;
      const sessionInfo = firstSession ? `⏰ ${firstSession.day.toUpperCase()} ${firstSession.time} - ${firstSession.type === 'gi' ? 'Gi' : firstSession.type === 'nogi' ? 'No-Gi' : 'Gi & No-Gi'}` : '';
      
      const shareText = `${gym.name}\n` +
        (displayAddress && displayAddress.trim() !== '' ? `📍 ${displayAddress}\n` : '') +
        (gym.website ? `🌐 ${gym.website.replace(/^https?:\/\//, '')}\n` : '') +
        (sessionInfo ? `${sessionInfo}\n` : '') +
        `💵 Open mat: ${gym.matFee === 0 ? 'Free' : gym.matFee ? `$${gym.matFee}` : 'Contact gym'}\n\n` +
        `📱 Get the app:\nhttps://apps.apple.com/us/app/find-jiu-jitsu/id6747903814`;
      
      Share.share({
        message: shareText,
        title: `${gym.name} - Jiu Jitsu Gym`
      });
    } catch (error) {
      // Share error handled silently
    }
  };

  const handleScreenshotShare = async () => {
    try {
      // Get the first session for the share card
      const firstSession = gym.openMats && gym.openMats.length > 0 ? gym.openMats[0] : null;
      
      if (!firstSession) {
        Alert.alert('No Sessions', 'No sessions available to share.');
        return;
      }

      await captureAndShareCard(cardRef, gym, firstSession);
    } catch (error) {
      Alert.alert(
        'Sharing Error',
        'Failed to create and share the image. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleShareOptions = () => {
    setShowShareOptions(true);
  };

  return (
    <View style={styles.container}>
      {/* Invisible ShareCard rendered off-screen */}
      {gym.openMats && gym.openMats.length > 0 && (
        <ShareCard 
          ref={cardRef}
          gym={gym}
          session={gym.openMats[0]}
        />
      )}
      
      <TouchableOpacity onPress={onPress ? () => onPress(gym) : undefined} activeOpacity={onPress ? 0.9 : 1} style={styles.card}>
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
          <TouchableOpacity 
            style={styles.heartButton}
            onPress={() => onHeartPress(gym)}
          >
            <Text style={styles.heartIcon}>
              {favorites.has(gym.id) ? '♥' : '♡'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Session Type Subtitle */}
      <Text style={styles.sessionSubtitle}>Jiu Jitsu Session</Text>

      {/* Sessions Section */}
      <View style={styles.sessionsSection}>
        {gym.openMats.map((session: any, index: number) => (
          <View key={index} style={styles.sessionBlock}>
            <Text style={styles.dayHeader}>
              {session.day.toUpperCase()}
            </Text>
            <Text style={styles.timeRange}>
              {session.time} • {session.type === 'gi' ? 'Gi 🥋' : 
                               session.type === 'nogi' ? 'No-Gi 👕' : 
                               session.type.toLowerCase() === 'mma' || session.type.toLowerCase() === 'mma sparring' ? 'MMA Sparring 🥊' :
                               session.type === 'both' ? 'Gi & No-Gi 🥋👕' : 
                               `${session.type} 🥋👕`}
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
          <Text style={[styles.feeValue, gym.matFee === 0 && { color: '#10B981' }]}> {/* Green if free */}
            {gym.matFee === 0 ? 'Free' : gym.matFee ? `$${gym.matFee}` : '?/unknown'}
          </Text>
        </View>
        <View style={styles.feeItem}>
          <Text style={styles.feeLabel}>Class Drop in - </Text>
          <Text style={styles.feeValue}>
            {typeof gym.dropInFee === 'number' ? (gym.dropInFee === 0 ? 'Free' : `$${gym.dropInFee}`) : '?/unknown'}
          </Text>
        </View>
      </View>

      {/* Compact Waiver Row */}
      {gym.waiverRequired && (
        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>⚠️</Text>
          <Text style={[styles.infoText, { marginLeft: 4 }]}>Waiver required</Text>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.buttonRow}>
        {gym.website && (
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => openWebsite(gym.website)}
          >
            <Text style={styles.buttonText}>🌐 Website</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity 
          style={[styles.actionButton, (!gym.address || gym.address === 'Tampa, FL' || gym.address === 'Austin, TX') && styles.disabledButton]}
          onPress={() => openDirections(gym.address)}
          disabled={!gym.address || gym.address === 'Tampa, FL' || gym.address === 'Austin, TX'}
        >
          <Text style={[styles.buttonText, (!gym.address || gym.address === 'Tampa, FL' || gym.address === 'Austin, TX') && styles.disabledText]}>📍 Directions</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={handleShareOptions}
        >
          <Text style={styles.buttonText}>↗️ Share</Text>
        </TouchableOpacity>
      </View>
      </TouchableOpacity>

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
          <View style={{
            backgroundColor: theme.surface,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            paddingHorizontal: 20,
            paddingTop: 20,
            paddingBottom: 40,
          }}>
            <Text style={{ 
              fontSize: 20, 
              fontWeight: 'bold', 
              marginBottom: 20, 
              color: theme.text.primary,
              textAlign: 'center'
            }}>
              Share Open Mat
            </Text>
            
            <TouchableOpacity
              style={{ 
                padding: 16, 
                backgroundColor: theme.surfaceHover, 
                borderRadius: 12, 
                marginBottom: 12,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center'
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
                justifyContent: 'center'
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
              <Text style={{ 
                fontSize: 16, 
                color: theme.text.secondary, 
                textAlign: 'center' 
              }}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
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
    gap: 8,
  },
  heartButton: {
    padding: 4,
    marginLeft: 8,
  },
  heartIcon: {
    fontSize: 24,
    color: '#FF6B6B',
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
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minHeight: 44,
  },
  buttonText: {
    fontSize: 13,
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

export default OpenMatCard; 