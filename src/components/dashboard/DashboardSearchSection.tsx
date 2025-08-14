import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { OpenMat } from '../../types';
import { haptics } from '../../utils';
import SearchSuggestions from '../SearchSuggestions';
import SkeletonCard from '../SkeletonCard';

interface DashboardSearchSectionProps {
  isSearching: boolean;
  searchQuery: string;
  searchResults: OpenMat[];
  searchSuggestions: string[];
  recentSearches: string[];
  showSuggestions: boolean;
  modalVisible: boolean;
  searchInputRef: React.RefObject<TextInput>;
  onSearchButtonPress: () => void;
  onInputChange: (text: string) => void;
  onInputFocus: () => void;
  onInputBlur: () => void;
  onSubmitEditing: () => void;
  onCloseSearch: () => void;
  onSelectSuggestion: (suggestion: string) => void;
  onClearRecent: () => void;
  onGymPress: (gym: OpenMat) => void;
  GymSearchResult: React.FC<{ gym: OpenMat }>;
  SkeletonSearchResult: React.FC<{ index: number }>;
}

const DashboardSearchSection: React.FC<DashboardSearchSectionProps> = ({
  isSearching,
  searchQuery,
  searchResults,
  searchSuggestions,
  recentSearches,
  showSuggestions,
  modalVisible,
  searchInputRef,
  onSearchButtonPress,
  onInputChange,
  onInputFocus,
  onInputBlur,
  onSubmitEditing,
  onCloseSearch,
  onSelectSuggestion,
  onClearRecent,
  onGymPress,
  GymSearchResult,
  SkeletonSearchResult,
}) => {
  const { theme } = useTheme();

  return (
    <>
      {/* Search Backdrop - only when search is active */}
      {(isSearching || searchResults.length > 0) && (
        <TouchableWithoutFeedback onPress={onCloseSearch}>
          <View
            style={styles.searchBackdrop}
            pointerEvents={searchResults.length > 0 || modalVisible ? 'box-none' : 'auto'}
          />
        </TouchableWithoutFeedback>
      )}

      {/* Search/Add City Card */}
      <View style={styles.searchSection}>
        {/* Search Button - Always rendered, hidden when searching */}
        <TouchableOpacity
          style={[
            styles.cityCard,
            { backgroundColor: theme.surface },
            isSearching && {
              opacity: 0,
              pointerEvents: 'none',
              position: 'absolute',
              zIndex: -1,
            },
          ]}
          onPress={onSearchButtonPress}
        >
          <View style={styles.cityCardContent}>
            <Ionicons name="search" size={24} color={theme.text.secondary} />
            <View style={styles.cityCardText}>
              <Text style={[styles.cityCardTitle, { color: theme.text.primary }]}>Search gyms</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={theme.text.secondary} />
          </View>
        </TouchableOpacity>

        {/* Search Input - Always rendered, hidden when not searching */}
        <View
          style={[
            styles.searchContainer,
            { backgroundColor: theme.surface },
            !isSearching &&
              searchResults.length === 0 &&
              !searchQuery.trim() && {
                opacity: 0,
                pointerEvents: 'none',
                position: 'absolute',
                zIndex: -1,
              },
          ]}
        >
          <View style={styles.searchInputContainer}>
            <Ionicons
              name="search"
              size={20}
              color={theme.text.secondary}
              style={styles.searchIcon}
            />
            <TextInput
              ref={searchInputRef}
              style={[styles.searchInput, { color: theme.text.primary }]}
              placeholder="Search gym names or cities"
              placeholderTextColor={theme.text.secondary}
              value={searchQuery}
              onChangeText={onInputChange}
              onFocus={onInputFocus}
              onBlur={onInputBlur}
              onSubmitEditing={onSubmitEditing}
              returnKeyType="search"
            />
            <TouchableOpacity style={styles.closeSearchButton} onPress={onCloseSearch}>
              <Ionicons name="close" size={20} color={theme.text.secondary} />
            </TouchableOpacity>
          </View>

          {/* Search suggestions */}
          <SearchSuggestions
            query={searchQuery}
            suggestions={searchSuggestions}
            recentSearches={recentSearches}
            isLoading={isSearching}
            onSelectSuggestion={onSelectSuggestion}
            onClearRecent={onClearRecent}
            visible={showSuggestions && !searchResults.length}
          />

          {/* Search results list */}
          {searchResults.length > 0 && (
            <View style={styles.searchResultsContainer}>
              {searchResults.map((gym, index) => (
                <TouchableOpacity key={`gym-${index}`} onPress={() => onGymPress(gym)}>
                  <GymSearchResult gym={gym} />
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Skeleton loading for search */}
          {isSearching && searchQuery.trim() && searchResults.length === 0 && (
            <View style={styles.searchResultsContainer}>
              {Array.from({ length: 3 }, (_, i) => (
                <SkeletonSearchResult key={`skeleton-${i}`} index={i} />
              ))}
            </View>
          )}
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  searchBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1,
  },
  searchSection: {
    position: 'relative',
    width: '100%',
    maxWidth: 400,
    marginBottom: 12,
    zIndex: 2,
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
    zIndex: 2,
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
  searchContainer: {
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
    zIndex: 2,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  searchIcon: {
    position: 'absolute',
    left: 12,
    zIndex: 1,
  },
  searchInput: {
    flex: 1,
    height: 24,
    paddingHorizontal: 16,
    paddingLeft: 40,
    fontSize: 16,
    fontWeight: '500',
  },
  closeSearchButton: {
    padding: 16,
    marginLeft: 8,
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchResultsContainer: {
    marginTop: 12,
    width: '100%',
  },
});

export default DashboardSearchSection;
