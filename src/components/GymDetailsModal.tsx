import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import { OpenMat } from '../types';

const { height } = Dimensions.get('window');

interface GymDetailsModalProps {
  gym: OpenMat | null;
  visible: boolean;
  onClose: () => void;
}

const GymDetailsModal: React.FC<GymDetailsModalProps> = ({
  gym,
  visible,
  onClose,
}) => {
  if (!gym) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <View style={{
          backgroundColor: 'white',
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          maxHeight: height * 0.85,
          width: '100%',
          overflow: 'hidden',
        }}>
          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' }}>
            <Text style={{ fontSize: 22, fontWeight: 'bold', flex: 1 }}>{gym.name}</Text>
            <TouchableOpacity onPress={onClose} style={{ padding: 8, marginLeft: 8 }}>
              <Text style={{ fontSize: 26 }}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Scrollable Content */}
          <View style={{ flex: 1, minHeight: 0 }}>
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32 }}
              showsVerticalScrollIndicator={true}
              bounces={Platform.OS === 'ios'}
            >
              {/* Location */}
              <View style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 10 }}>Location</Text>
                <Text>{gym.address}</Text>
                <Text>{gym.distance} miles away</Text>
              </View>

              {/* Schedule */}
              <View style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 10 }}>Open Mat Schedule</Text>
                {gym.openMats.map((session, index) => (
                  <View key={index} style={{ marginBottom: 10 }}>
                    <Text>{session.day} {session.time}</Text>
                    <Text style={{ color: '#666' }}>{session.type === 'gi' ? 'Gi Only' : session.type === 'nogi' ? 'No-Gi Only' : 'Gi & No-Gi'}</Text>
                  </View>
                ))}
              </View>

              {/* Pricing */}
              <View style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 10 }}>Pricing</Text>
                <Text>{gym.matFee === 0 ? 'Free' : `$${gym.matFee}`}</Text>
              </View>
            </ScrollView>
          </View>

          {/* Footer */}
          <View style={{ paddingHorizontal: 20, paddingBottom: 24, paddingTop: 8, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#F3F4F6' }}>
            <TouchableOpacity
              style={{ backgroundColor: '#3B82F6', padding: 15, borderRadius: 10, alignItems: 'center' }}
              onPress={() => {/* Add navigation logic */}}
            >
              <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>Get Directions</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default GymDetailsModal; 