import React, { useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  Dimensions,
  Platform,
  Animated,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { OpenMat } from '../types';
import { haptics, animations } from '../utils';

const { height } = Dimensions.get('window');

interface GymDetailsModalProps {
  gym: OpenMat | null;
  visible: boolean;
  onClose: () => void;
  onHeartPress?: () => void;
  isFavorited?: boolean;
}

const GymDetailsModal: React.FC<GymDetailsModalProps> = ({
  gym,
  visible,
  onClose,
  onHeartPress,
  isFavorited = false,
}) => {
  // Animation values
  const heartScaleAnim = useRef(new Animated.Value(1)).current;
  const modalScaleAnim = useRef(new Animated.Value(0.8)).current;
  const modalOpacityAnim = useRef(new Animated.Value(0)).current;
  const backdropOpacityAnim = useRef(new Animated.Value(0)).current;
  // const heartColorAnim = useRef(new Animated.Value(isFavorited ? 1 : 0)).current; // Temporarily disabled

  if (!gym) return null;

  // Animate modal when visibility changes
  React.useEffect(() => {
    if (visible) {
      // Animate in
      Animated.parallel([
        Animated.timing(backdropOpacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(modalOpacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(modalScaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animate out
      Animated.parallel([
        Animated.timing(backdropOpacityAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(modalOpacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(modalScaleAnim, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleHeartPress = () => {
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
    if (onHeartPress) {
      onHeartPress();
    }
  };

  const handleAddressPress = async () => {
    try {
      const encodedAddress = encodeURIComponent(gym.address);
      const mapsUrl = `maps://0,0?q=${encodedAddress}`;

      const canOpen = await Linking.canOpenURL(mapsUrl);
      if (canOpen) {
        await Linking.openURL(mapsUrl);
      } else {
        // Fallback to Apple Maps or Google Maps web URL
        const fallbackUrl =
          Platform.OS === 'ios'
            ? `http://maps.apple.com/?q=${encodedAddress}`
            : `https://maps.google.com/?q=${encodedAddress}`;
        await Linking.openURL(fallbackUrl);
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to open maps app');
    }
  };

  const handleWebsitePress = async () => {
    if (!gym.website) return;

    try {
      const url = gym.website.startsWith('http') ? gym.website : `https://${gym.website}`;
      await Linking.openURL(url);
    } catch (error) {
      Alert.alert('Error', 'Unable to open website');
    }
  };

  const handlePhonePress = async () => {
    if (!gym.phoneNumber) return;

    try {
      const phoneUrl = `tel:${gym.phoneNumber}`;
      await Linking.openURL(phoneUrl);
    } catch (error) {
      Alert.alert('Error', 'Unable to open phone app');
    }
  };

  const formatWebsiteUrl = (url: string) => {
    return url.replace(/^https?:\/\//, '').replace(/^www\./, '');
  };

  const formatPhoneNumber = (phone: string) => {
    // Remove any non-digit characters and format as (XXX) XXX-XXXX
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone; // Return original if not 10 digits
  };

  return (
    <Modal visible={visible} transparent={true} animationType="none" onRequestClose={onClose}>
      <Animated.View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0,0,0,0.5)',
          opacity: backdropOpacityAnim,
        }}
      >
        <Animated.View
          style={{
            backgroundColor: '#F9FAFB',
            borderRadius: 20,
            width: '90%',
            maxHeight: height * 0.85,
            overflow: 'hidden',
            opacity: modalOpacityAnim,
            transform: [{ scale: modalScaleAnim }],
          }}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 20,
              paddingTop: 20,
              paddingBottom: 8,
              borderBottomWidth: 1,
              borderBottomColor: '#F3F4F6',
            }}
          >
            <Text style={{ fontSize: 22, fontWeight: 'bold', flex: 1 }}>{gym.name}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {onHeartPress && (
                <Animated.View style={{ transform: [{ scale: heartScaleAnim }] }}>
                  <TouchableOpacity
                    onPress={handleHeartPress}
                    style={{
                      padding: 12,
                      marginRight: 8,
                      minWidth: 44,
                      minHeight: 44,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Ionicons
                      name={isFavorited ? 'heart' : 'heart-outline'}
                      size={24}
                      color={isFavorited ? '#EF4444' : '#9CA3AF'}
                    />
                  </TouchableOpacity>
                </Animated.View>
              )}
              <TouchableOpacity
                onPress={onClose}
                style={{
                  padding: 12,
                  minWidth: 44,
                  minHeight: 44,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontSize: 26 }}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Scrollable Content */}
          <ScrollView
            contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32 }}
            showsVerticalScrollIndicator={true}
            bounces={Platform.OS === 'ios'}
          >
            {/* Location */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 10 }}>Location</Text>
              <TouchableOpacity onPress={handleAddressPress} style={{ marginBottom: 5 }}>
                <Text
                  style={{
                    color: '#3B82F6',
                    textDecorationLine: 'underline',
                    fontSize: 16,
                  }}
                >
                  {gym.address}
                </Text>
              </TouchableOpacity>
              <Text style={{ color: '#666', fontSize: 14 }}>{gym.distance} miles away</Text>
            </View>

            {/* Phone Number */}
            {gym.phoneNumber && (
              <View style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 10 }}>Phone</Text>
                <TouchableOpacity onPress={handlePhonePress}>
                  <Text
                    style={{
                      color: '#3B82F6',
                      textDecorationLine: 'underline',
                      fontSize: 16,
                    }}
                  >
                    {formatPhoneNumber(gym.phoneNumber)}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Website */}
            {gym.website && (
              <View style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 10 }}>Website</Text>
                <TouchableOpacity onPress={handleWebsitePress}>
                  <Text
                    style={{
                      color: '#3B82F6',
                      textDecorationLine: 'underline',
                      fontSize: 16,
                    }}
                  >
                    {formatWebsiteUrl(gym.website)}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Schedule */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 10 }}>
                Open Mat Schedule
              </Text>
              {gym.openMats.map((session, index) => (
                <View key={index} style={{ marginBottom: 10 }}>
                  <Text>
                    {session.day} {session.time}
                  </Text>
                  <Text style={{ color: '#666' }}>
                    {session.type === 'gi'
                      ? 'Gi Only'
                      : session.type === 'nogi'
                        ? 'No-Gi Only'
                        : session.type.toLowerCase() === 'mma' ||
                            session.type.toLowerCase() === 'mma sparring'
                          ? 'MMA Sparring'
                          : session.type === 'both'
                            ? 'Gi & No-Gi'
                            : session.type}
                  </Text>
                </View>
              ))}
            </View>

            {/* Pricing */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 10 }}>Pricing</Text>
              <Text style={{ marginBottom: 5 }}>
                Open Mat: {gym.matFee === 0 ? 'Free' : `$${gym.matFee}`}
              </Text>
              <Text>
                Drop-in Class:{' '}
                {typeof gym.dropInFee === 'number'
                  ? gym.dropInFee === 0
                    ? 'Free'
                    : `$${gym.dropInFee}`
                  : 'Contact gym'}
              </Text>
            </View>
          </ScrollView>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

export default GymDetailsModal;
