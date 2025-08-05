import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Dimensions,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Share, Linking } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { captureCardAsImage } from '../utils/screenshot';
import { OpenMat, OpenMatSession } from '../types';
import { useTheme } from '../context/ThemeContext';
import ShareCard from './ShareCard';

interface CustomShareModalProps {
  visible: boolean;
  onClose: () => void;
  gym: OpenMat;
  session: OpenMatSession;
  shareCardRef: React.RefObject<View | null>;
  imageUri?: string;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const CustomShareModal: React.FC<CustomShareModalProps> = ({
  visible,
  onClose,
  gym,
  session,
  shareCardRef,
  imageUri,
}) => {
  // Guard against null gym
  if (!gym) {
    return null;
  }

  const { theme } = useTheme();

  // State for tracking sharing progress
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImageUri, setCapturedImageUri] = useState<string | null>(null);
  const [cardStyle, setCardStyle] = useState<'classic' | 'modern' | 'dark'>('classic');

  // Social sharing options with icons and colors
  const shareOptions = [
    {
      id: 'instagram',
      name: 'Instagram Stories',
      icon: 'logo-instagram',
      color: '#E4405F',
    },
    {
      id: 'snapchat',
      name: 'Snapchat',
      icon: 'logo-snapchat',
      color: '#FFFC00',
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      icon: 'logo-tiktok',
      color: '#000000',
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      icon: 'logo-whatsapp',
      color: '#25D366',
    },
    {
      id: 'messages',
      name: 'Messages',
      icon: 'chatbubble-outline',
      color: '#34C759',
    },
    {
      id: 'copy',
      name: 'Copy Link',
      icon: 'copy-outline',
      color: '#8E8E93',
    },
    {
      id: 'more',
      name: 'More',
      icon: 'ellipsis-horizontal',
      color: '#8E8E93',
    },
  ];

  // Capture image when modal opens or style changes
  useEffect(() => {
    if (visible && !capturedImageUri) {
      // Add a delay to ensure ShareCard is fully rendered
      setTimeout(() => {
        captureImage();
      }, 300);
    }
  }, [visible, cardStyle]);

  // Clean up captured image when modal closes
  useEffect(() => {
    if (!visible) {
      setCapturedImageUri(null);
      setIsCapturing(false);
    }
  }, [visible]);

  const captureImage = async () => {
    console.log('Attempting to capture image, shareCardRef.current:', shareCardRef.current ? 'exists' : 'null');
    
    if (!shareCardRef.current) {
      console.log('ShareCard ref is null, retrying in 500ms...');
      setTimeout(() => {
        captureImage();
      }, 500);
      return;
    }
    
    setIsCapturing(true);
    try {
      console.log('Capturing image...');
      const uri = await captureCardAsImage(shareCardRef);
      console.log('Image captured successfully:', uri ? 'URI received' : 'No URI');
      setCapturedImageUri(uri);
    } catch (error) {
      console.error('Failed to capture image:', error);
      // Retry once more after a delay
      setTimeout(() => {
        console.log('Retrying image capture...');
        captureImage();
      }, 1000);
    } finally {
      setIsCapturing(false);
    }
  };

  // Helper function to check if apps are installed
  const checkAppInstalled = async (url: string): Promise<boolean> => {
    try {
      return await Linking.canOpenURL(url);
    } catch {
      return false;
    }
  };

  // Helper function to get session type text
  const getSessionTypeText = (type: string) => {
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

  const handleShareOption = async (optionId: string) => {
    if (isCapturing) {
      Alert.alert('Please wait', 'Image is still being prepared for sharing');
      return;
    }

    const shareMessage = `I'm training at ${gym.name}! ${session?.day} ${session?.time} ${getSessionTypeText(session?.type)}. Come train with me! Find open mats: https://bit.ly/40DjTlM`;
    const appLink = 'https://bit.ly/40DjTlM';

    try {
      switch (optionId) {
        case 'instagram':
          const instagramInstalled = await checkAppInstalled('instagram://story-camera');
          if (instagramInstalled) {
            await Linking.openURL('instagram://story-camera');
            Alert.alert(
              'Instagram Stories',
              'Instagram has opened! Add the image from your camera roll to share your training session.',
              [{ text: 'OK' }]
            );
          } else {
            Alert.alert('Instagram not installed', 'Please install Instagram to share to Stories');
          }
          break;

        case 'snapchat':
          const snapchatInstalled = await checkAppInstalled('snapchat://');
          if (snapchatInstalled) {
            await Linking.openURL('snapchat://');
            Alert.alert(
              'Snapchat',
              'Snapchat has opened! Add the image from your camera roll to share your training session.',
              [{ text: 'OK' }]
            );
          } else {
            Alert.alert('Snapchat not installed', 'Please install Snapchat to share');
          }
          break;

        case 'tiktok':
          const tiktokInstalled = await checkAppInstalled('tiktok://');
          if (tiktokInstalled) {
            await Linking.openURL('tiktok://');
            Alert.alert(
              'TikTok',
              'TikTok has opened! Add the image from your camera roll to share your training session.',
              [{ text: 'OK' }]
            );
          } else {
            Alert.alert('TikTok not installed', 'Please install TikTok to share');
          }
          break;

        case 'whatsapp':
          const whatsappInstalled = await checkAppInstalled('whatsapp://');
          if (whatsappInstalled) {
            const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(shareMessage)}`;
            await Linking.openURL(whatsappUrl);
          } else {
            Alert.alert('WhatsApp not installed', 'Please install WhatsApp to share');
          }
          break;

        case 'messages':
          await Share.share({
            message: shareMessage,
            url: capturedImageUri || undefined,
          });
          break;

        case 'copy':
          await Clipboard.setStringAsync(appLink);
          Alert.alert('Link Copied!', 'App download link has been copied to clipboard');
          break;

        case 'more':
          await Share.share({
            message: shareMessage,
            url: capturedImageUri || undefined,
          });
          break;

        default:
          console.log(`Share to ${optionId} selected`);
      }
    } catch (error) {
      console.error('Sharing error:', error);
      Alert.alert('Sharing Error', 'Failed to share. Please try again.');
    }
  };

  console.log('CustomShareModal rendering, visible:', visible, 'gym:', gym?.name);
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
          style={[styles.modalContent, { backgroundColor: theme.surface }]}
        >
          {/* Handle bar for swipe down gesture */}
          <View style={styles.handleBar} />
          
          {/* Close button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color={theme.text.primary} />
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text.primary }]}>
              Share Session
            </Text>
            <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
              Share this open mat session with your training partners
            </Text>
          </View>

          {/* Style Picker */}
          <View style={styles.stylePickerContainer}>
            <Text style={[styles.stylePickerLabel, { color: theme.text.secondary }]}>
              Card Style
            </Text>
            <View style={styles.stylePickerButtons}>
              <TouchableOpacity 
                style={[
                  styles.styleButton, 
                  cardStyle === 'classic' && styles.styleButtonActive,
                  { borderColor: theme.border }
                ]}
                onPress={() => setCardStyle('classic')}
              >
                                 <Text style={[
                   styles.styleButtonText, 
                   { color: cardStyle === 'classic' ? '#3B82F6' : theme.text.primary }
                 ]}>
                   Classic
                 </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.styleButton, 
                  cardStyle === 'modern' && styles.styleButtonActive,
                  { borderColor: theme.border }
                ]}
                onPress={() => setCardStyle('modern')}
              >
                                 <Text style={[
                   styles.styleButtonText, 
                   { color: cardStyle === 'modern' ? '#3B82F6' : theme.text.primary }
                 ]}>
                   Modern
                 </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.styleButton, 
                  cardStyle === 'dark' && styles.styleButtonActive,
                  { borderColor: theme.border }
                ]}
                onPress={() => setCardStyle('dark')}
              >
                                 <Text style={[
                   styles.styleButtonText, 
                   { color: cardStyle === 'dark' ? '#3B82F6' : theme.text.primary }
                 ]}>
                   Dark
                 </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Preview Card Section */}
          <View style={styles.previewSection}>
            <Text style={[styles.previewLabel, { color: theme.text.secondary }]}>
              Preview
            </Text>
            <View style={styles.previewCard}>
              {/* Loading indicator while capturing */}
              {isCapturing && (
                <View style={styles.capturingOverlay}>
                  <ActivityIndicator size="large" color={theme.text.primary} />
                  <Text style={[styles.capturingText, { color: theme.text.secondary }]}>
                    Preparing image...
                  </Text>
                </View>
              )}
              
                        {/* Mini preview of the ShareCard */}
          <View style={styles.previewCardContent}>
            <View style={styles.previewGymInfo}>
              <View style={styles.previewLogo}>
                {/* Use actual gym logo if available, otherwise show initials */}
                {gym && (String(gym.id || '').includes('10th-planet')) ? (
                  <Image source={require('../../assets/logos/10th-planet-austin.png')} style={styles.previewLogoImage} />
                ) : gym && (String(gym.id || '').includes('stjj')) ? (
                  <Image source={require('../../assets/logos/STJJ.png')} style={styles.previewLogoImage} />
                ) : gym && (String(gym.id || '').includes('gracie-tampa-south')) ? (
                  <Image source={require('../../assets/logos/gracie-tampa-south.png')} style={styles.previewLogoImage} />
                ) : gym && (String(gym.id || '').includes('tmt')) ? (
                  <Image source={require('../../assets/logos/TMT.png')} style={styles.previewLogoImage} />
                ) : (
                  <Text style={styles.previewLogoText}>
                    {gym.name.split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase()}
                  </Text>
                )}
              </View>
              <View style={styles.previewText}>
                <Text style={[styles.previewGymName, { color: theme.text.primary }]}>
                  {gym.name}
                </Text>
                <Text style={[styles.previewSession, { color: theme.text.secondary }]}>
                  {session?.day} • {session?.time}
                </Text>
                <Text style={[styles.previewStyle, { color: theme.text.secondary }]}>
                  Style: {cardStyle.charAt(0).toUpperCase() + cardStyle.slice(1)}
                </Text>
              </View>
            </View>
            <View style={styles.previewAppIcon}>
              <Ionicons name="fitness" size={16} color={theme.text.secondary} />
            </View>
          </View>
            </View>
          </View>

          {/* Share Options Grid */}
          <View style={styles.shareOptionsSection}>
            <Text style={[styles.shareOptionsLabel, { color: theme.text.secondary }]}>
              Share to
            </Text>
            <View style={styles.shareOptionsGrid}>
              {shareOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.shareOption,
                    isCapturing && styles.disabledShareOption,
                  ]}
                  onPress={() => handleShareOption(option.id)}
                  disabled={isCapturing}
                >
                  <View
                    style={[
                      styles.shareOptionIcon,
                      { backgroundColor: option.color },
                      isCapturing && styles.disabledShareOptionIcon,
                    ]}
                  >
                    <Ionicons
                      name={option.icon as any}
                      size={30}
                      color={option.id === 'tiktok' ? '#FFFFFF' : '#FFFFFF'}
                    />
                  </View>
                  <Text style={[
                    styles.shareOptionText, 
                    { color: theme.text.primary },
                    isCapturing && styles.disabledShareOptionText,
                  ]}>
                    {option.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Bottom spacing */}
          <View style={styles.bottomSpacing} />
        </TouchableOpacity>
      </TouchableOpacity>

      {/* Hidden ShareCard for image generation */}
      {(() => {
        if (gym && session) {
          return (
            <View style={{ position: 'absolute', left: -9999, top: -9999 }}>
              <ShareCard 
                ref={shareCardRef}
                gym={gym}
                session={session}
                includeImGoing={true}
                style={cardStyle}
              />
            </View>
          );
        }
        return null;
      })()}
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
    maxHeight: screenHeight * 0.85,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 1,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    marginBottom: 24,
    paddingRight: 40, // Space for close button
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 22,
  },
  stylePickerContainer: {
    marginBottom: 24,
  },
  stylePickerLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  stylePickerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  styleButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  styleButtonActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderColor: '#3B82F6',
  },
  styleButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  previewSection: {
    marginBottom: 32,
  },
  previewLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  previewCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    position: 'relative',
  },
  capturingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  capturingText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  previewCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  previewGymInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  previewLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  previewLogoImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  previewLogoText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  previewText: {
    flex: 1,
  },
  previewGymName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  previewSession: {
    fontSize: 14,
    fontWeight: '500',
  },
  previewStyle: {
    fontSize: 12,
    fontWeight: '400',
    marginTop: 2,
  },
  previewAppIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareOptionsSection: {
    marginBottom: 20,
  },
  shareOptionsLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  shareOptionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  shareOption: {
    width: 65,
    alignItems: 'center',
    marginBottom: 20,
    minHeight: 44,
    justifyContent: 'center',
  },
  disabledShareOption: {
    opacity: 0.5,
  },
  shareOptionIcon: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  disabledShareOptionIcon: {
    opacity: 0.5,
  },
  shareOptionText: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 16,
  },
  disabledShareOptionText: {
    opacity: 0.5,
  },
  bottomSpacing: {
    height: 20,
  },
});

export default CustomShareModal; 