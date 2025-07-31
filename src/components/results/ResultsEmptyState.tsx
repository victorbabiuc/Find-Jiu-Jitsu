import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

interface ResultsEmptyStateProps {
  location: string;
  dateSelection: string | null;
  activeFilters: {
    gi: boolean;
    nogi: boolean;
    price: string | null;
  };
  onClearFilters: () => void;
  onChangeDay: () => void;
  getDateSelectionDisplay: (dateSelection: string) => string;
}

const ResultsEmptyState: React.FC<ResultsEmptyStateProps> = ({
  location,
  dateSelection,
  activeFilters,
  onClearFilters,
  onChangeDay,
  getDateSelectionDisplay,
}) => {
  const { theme } = useTheme();

  const getEmptyStateSubtitle = () => {
    let subtitle = `No open mats in ${location}`;
    
    if (dateSelection) {
      subtitle += ` for ${getDateSelectionDisplay(dateSelection).toLowerCase()}`;
    }
    
    if (activeFilters.price === 'free') {
      subtitle = `No free open mats in ${location}`;
      if (dateSelection) subtitle += ` for ${getDateSelectionDisplay(dateSelection).toLowerCase()}`;
    }
    
    if (activeFilters.gi && !activeFilters.nogi) {
      subtitle = `No Gi-only sessions found in ${location}`;
      if (dateSelection) subtitle += ` for ${getDateSelectionDisplay(dateSelection).toLowerCase()}`;
    } else if (activeFilters.nogi && !activeFilters.gi) {
      subtitle = `No No-Gi sessions found in ${location}`;
      if (dateSelection) subtitle += ` for ${getDateSelectionDisplay(dateSelection).toLowerCase()}`;
    }
    
    return subtitle;
  };

  return (
    <View style={styles.emptyStateContainer}>
      {/* Icon */}
      <View style={styles.emptyStateIconContainer}>
        <Ionicons 
          name="search-outline" 
          size={64} 
          color={theme.text.secondary} 
        />
      </View>
      
      {/* Title */}
      <Text style={[styles.emptyStateTitle, { color: theme.text.primary }]}>
        No open mats found
      </Text>
      
      {/* Dynamic Subtitle based on filters */}
      <Text style={[styles.emptyStateSubtitle, { color: theme.text.secondary }]}>
        {getEmptyStateSubtitle()}
      </Text>
      
      {/* Action Buttons */}
      <View style={styles.emptyStateButtons}>
        <TouchableOpacity 
          style={[styles.emptyStateButton, styles.secondaryButton]}
          onPress={onClearFilters}
        >
          <Text style={[styles.secondaryButtonText, { color: theme.text.primary }]}>Clear Filters</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.emptyStateButton, styles.secondaryButton]}
          onPress={onChangeDay}
        >
          <Text style={[styles.secondaryButtonText, { color: theme.text.primary }]}>Change Day</Text>
        </TouchableOpacity>
      </View>
      
      {/* Suggestion Text */}
      <Text style={[styles.emptyStateSuggestion, { color: theme.text.secondary }]}>
        Try checking different days or clearing your filters
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  emptyStateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyStateIconContainer: {
    marginBottom: 24,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    fontWeight: '400',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  emptyStateButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  emptyStateButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyStateSuggestion: {
    fontSize: 14,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default ResultsEmptyState; 