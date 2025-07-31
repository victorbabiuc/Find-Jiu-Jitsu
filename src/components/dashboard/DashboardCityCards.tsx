import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { haptics } from '../../utils';

interface DashboardCityCardsProps {
  selectedLocation: string;
  tampaGymCount: number;
  austinGymCount: number;
  isLoadingCounts: boolean;
  onTampaPress: () => void;
  onAustinPress: () => void;
}

const DashboardCityCards: React.FC<DashboardCityCardsProps> = ({
  selectedLocation,
  tampaGymCount,
  austinGymCount,
  isLoadingCounts,
  onTampaPress,
  onAustinPress,
}) => {
  const { theme } = useTheme();

  return (
    <View style={styles.citiesContainer}>
      <TouchableOpacity
        style={[
          styles.cityCard,
          { backgroundColor: theme.surface },
          selectedLocation === 'Tampa' && { backgroundColor: '#374151' }
        ]}
        onPress={onTampaPress}
      >
        <View style={styles.cityCardContent}>
          <Text style={styles.cityEmoji}>🌴</Text>
          <View style={styles.cityCardText}>
            <Text style={[
              styles.cityCardTitle,
              { color: selectedLocation === 'Tampa' ? '#FFFFFF' : theme.text.primary }
            ]}>
              Tampa, FL
            </Text>
            <Text style={[
              styles.cityCardSubtitle,
              { color: selectedLocation === 'Tampa' ? '#FFFFFF' : theme.text.secondary }
            ]}>
              {isLoadingCounts ? 'Loading...' : `${tampaGymCount} gyms available`}
            </Text>
          </View>
          <Ionicons 
            name="chevron-forward" 
            size={20} 
            color={selectedLocation === 'Tampa' ? '#FFFFFF' : theme.text.secondary} 
          />
        </View>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[
          styles.cityCard,
          { backgroundColor: theme.surface },
          selectedLocation === 'Austin' && { backgroundColor: '#374151' }
        ]}
        onPress={onAustinPress}
      >
        <View style={styles.cityCardContent}>
          <Text style={styles.cityEmoji}>🤠</Text>
          <View style={styles.cityCardText}>
            <Text style={[
              styles.cityCardTitle,
              { color: selectedLocation === 'Austin' ? '#FFFFFF' : theme.text.primary }
            ]}>
              Austin, TX
            </Text>
            <Text style={[
              styles.cityCardSubtitle,
              { color: selectedLocation === 'Austin' ? '#FFFFFF' : theme.text.secondary }
            ]}>
              {isLoadingCounts ? 'Loading...' : `${austinGymCount} gyms available`}
            </Text>
          </View>
          <Ionicons 
            name="chevron-forward" 
            size={20} 
            color={selectedLocation === 'Austin' ? '#FFFFFF' : theme.text.secondary} 
          />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  citiesContainer: {
    width: '100%',
    maxWidth: 400,
  },
  cityCard: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    backgroundColor: '#FFFFFF',
  },
  cityCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cityCardText: {
    flex: 1,
    marginLeft: 12,
    marginRight: 12,
  },
  cityCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  cityCardSubtitle: {
    fontSize: 14,
    fontWeight: '400',
  },
  cityEmoji: {
    fontSize: 24,
  },
});

export default DashboardCityCards; 