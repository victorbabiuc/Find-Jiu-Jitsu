import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { OpenMat, OpenMatSession } from '../../types';
import { formatTimeRange, getSessionTypeWithIcon, formatDate, openWebsite, openDirections, haptics } from '../../utils';
import stjjLogo from '../../../assets/logos/STJJ.png';
import tenthPlanetLogo from '../../../assets/logos/10th-planet-austin.png';

interface DashboardGymModalProps {
  gym: OpenMat;
  onClose: () => void;
  visible: boolean;
  favorites: Set<string>;
  copiedGymId: string | null;
  onHeartPress: (gym: OpenMat) => void;
  onCopyGym: (gym: OpenMat) => void;
  onShareGym: (gym: OpenMat) => void;
}

const DashboardGymModal: React.FC<DashboardGymModalProps> = ({
  gym,
  onClose,
  visible,
  favorites,
  copiedGymId,
  onHeartPress,
  onCopyGym,
  onShareGym,
}) => {
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
          style={styles.modalCard}
        >
          {/* Close button */}
          <TouchableOpacity style={styles.modalCloseButton} onPress={() => {
            haptics.light(); // Light haptic for modal close
            onClose();
          }}>
            <Ionicons name="close" size={18} color="#111518" />
          </TouchableOpacity>
          
          {/* Gym header with logo */}
          <View style={styles.cardHeader}>
            <View style={styles.gymNameContainer}>
              <Text style={styles.gymName}>{gym.name}</Text>
            </View>
            <View style={styles.logoContainer}>
              {gym.id.includes('stjj') ? (
                <Image source={stjjLogo} style={styles.gymLogo} />
              ) : gym.id.includes('10th-planet') ? (
                <Image source={tenthPlanetLogo} style={styles.gymLogo} />
              ) : (
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarText}>
                    {gym.name.split(' ').map((word: string) => word[0]).join('').slice(0, 2).toUpperCase()}
                  </Text>
                </View>
              )}
            </View>
          </View>
          
          {/* Address */}
          <Text style={styles.gymAddress}>{gym.address}</Text>
          
          {/* Open Mat Sessions */}
          {gym.openMats && gym.openMats.length > 0 && (
            <View style={styles.sessionsSection}>
              <Text style={styles.sessionsTitle}>Open Mat Sessions</Text>
              {gym.openMats.map((session: OpenMatSession, index: number) => (
                <View key={index} style={styles.sessionBlock}>
                  <View style={styles.sessionHeader}>
                    <Text style={styles.sessionDay}>{session.day}</Text>
                    <Text style={styles.sessionType}>
                      {getSessionTypeWithIcon(session.type)}
                    </Text>
                  </View>
                  <Text style={styles.sessionTime}>
                    {formatTimeRange(session.time)}
                  </Text>
                </View>
              ))}
            </View>
          )}
          
          {/* Fees section */}
          <View style={styles.feesSection}>
            <Text style={styles.feesTitle}>Fees</Text>
            <View style={styles.feeItem}>
              <Text style={styles.feeLabel}>Open mat - </Text>
              <Text style={[styles.feeValue, gym.matFee === 0 && { color: '#10B981' }]}>
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

          {/* Last Updated Section */}
          <View style={styles.lastUpdatedContainer}>
            <Text style={styles.lastUpdatedText}>
              Last updated: {gym.lastUpdated ? formatDate(gym.lastUpdated) : 'Unknown'}
            </Text>
          </View>
          
          {/* Action buttons */}
          <View style={styles.unifiedButtonBar}>
            <TouchableOpacity style={styles.iconButton} onPress={() => onHeartPress(gym)}>
              <Text style={[
                styles.iconText, 
                styles.heartIcon,
                { color: favorites.has(gym.id) ? '#EF4444' : '#9CA3AF' }
              ]}>
                {favorites.has(gym.id) ? '♥' : '♡'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.iconButton} 
              onPress={() => onCopyGym(gym)}
              disabled={copiedGymId === gym.id}
            >
              {copiedGymId === gym.id ? (
                <Ionicons name="checkmark" size={22} color="#10B981" />
              ) : (
                <Ionicons name="copy-outline" size={22} color="#60798A" />
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.iconButton, (!gym.website || gym.website.trim() === '') && styles.disabledIconButton]}
              onPress={() => gym.website && openWebsite(gym.website)}
              disabled={!gym.website || gym.website.trim() === ''}
            >
              <Ionicons 
                name="globe-outline" 
                size={22} 
                color={(!gym.website || gym.website.trim() === '') ? '#9CA3AF' : '#111518'} 
              />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.iconButton, (!gym.address || gym.address === 'Tampa, FL' || gym.address === 'Austin, TX') && styles.disabledIconButton]}
              onPress={() => openDirections(gym.address)}
              disabled={!gym.address || gym.address === 'Tampa, FL' || gym.address === 'Austin, TX'}
            >
              <Ionicons 
                name="location-outline" 
                size={22} 
                color={(!gym.address || gym.address === 'Tampa, FL' || gym.address === 'Austin, TX') ? '#9CA3AF' : '#111518'} 
              />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.iconButton} onPress={() => {
              haptics.light(); // Light haptic for share button
              onShareGym(gym);
            }}>
              <Ionicons name="share-outline" size={22} color="#111518" />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    margin: 20,
    maxWidth: 400,
    width: '100%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalCloseButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 8,
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
  gymAddress: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 18,
  },
  sessionsSection: {
    marginBottom: 16,
  },
  sessionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  sessionBlock: {
    marginBottom: 8,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  sessionDay: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
  },
  sessionType: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  sessionTime: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111518',
    lineHeight: 20,
  },
  feesSection: {
    marginBottom: 16,
  },
  feesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
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

export default DashboardGymModal; 