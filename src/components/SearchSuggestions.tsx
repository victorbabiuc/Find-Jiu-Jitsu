import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { haptics } from '../utils';

interface SearchSuggestionsProps {
  query: string;
  suggestions: string[];
  recentSearches: string[];
  isLoading: boolean;
  onSelectSuggestion: (suggestion: string) => void;
  onClearRecent: () => void;
  visible: boolean;
}

const SearchSuggestions: React.FC<SearchSuggestionsProps> = ({
  query,
  suggestions,
  recentSearches,
  isLoading,
  onSelectSuggestion,
  onClearRecent,
  visible,
}) => {
  if (!visible) return null;

  const renderSuggestionItem = ({ item, index }: { item: string; index: number }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => {
        haptics.light();
        onSelectSuggestion(item);
      }}
      activeOpacity={0.7}
    >
      <Ionicons name="search" size={16} color="#6B7280" style={styles.suggestionIcon} />
      <Text style={styles.suggestionText} numberOfLines={1}>
        {item}
      </Text>
    </TouchableOpacity>
  );

  const renderRecentItem = ({ item, index }: { item: string; index: number }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => {
        haptics.light();
        onSelectSuggestion(item);
      }}
      activeOpacity={0.7}
    >
      <Ionicons name="time" size={16} color="#6B7280" style={styles.suggestionIcon} />
      <Text style={styles.suggestionText} numberOfLines={1}>
        {item}
      </Text>
    </TouchableOpacity>
  );

  const renderHeader = () => {
    if (query.length >= 2) {
      return (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Search Results</Text>
        </View>
      );
    } else if (recentSearches.length > 0) {
      return (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Searches</Text>
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => {
              haptics.light();
              onClearRecent();
            }}
          >
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return null;
  };

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="small" color="#6B7280" />
          <Text style={styles.emptyText}>Searching...</Text>
        </View>
      );
    }

    if (query.length >= 2 && suggestions.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="search" size={24} color="#9CA3AF" />
          <Text style={styles.emptyText}>No gyms found</Text>
        </View>
      );
    }

    if (query.length === 0 && recentSearches.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="search" size={24} color="#9CA3AF" />
          <Text style={styles.emptyText}>Start typing to search gyms</Text>
        </View>
      );
    }

    return null;
  };

  const data = query.length >= 2 ? suggestions : recentSearches;
  const renderItem = query.length >= 2 ? renderSuggestionItem : renderRecentItem;

  return (
    <View style={styles.container}>
      {renderHeader()}
      <View style={styles.list}>
        {data.length > 0
          ? data.map((item, index) => (
              <React.Fragment key={`${query.length >= 2 ? 'suggestion' : 'recent'}-${index}`}>
                {renderItem({ item, index })}
              </React.Fragment>
            ))
          : renderEmpty()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginTop: 8,
    maxHeight: 300,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  list: {
    maxHeight: 250,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  clearButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  clearButtonText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  suggestionIcon: {
    marginRight: 12,
  },
  suggestionText: {
    fontSize: 16,
    color: '#1F2937',
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default SearchSuggestions;
