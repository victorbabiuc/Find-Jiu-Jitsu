import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
} from 'react-native';

interface ResultsFilterBarProps {
  activeFilters: {
    gi: boolean;
    nogi: boolean;
    price: string | null;
  };
  sessionCounts: {
    giCount: number;
    nogiCount: number;
  };
  toggleFilter: (filterType: 'gi' | 'nogi') => void;
  handleFilterTap: (filterName: string) => void;
  toggleViewMode: () => void;
  filterAnim: Animated.Value;
}

const ResultsFilterBar: React.FC<ResultsFilterBarProps> = ({
  activeFilters,
  sessionCounts,
  toggleFilter,
  handleFilterTap,
  toggleViewMode,
  filterAnim,
}) => {
  return (
    <Animated.View style={[styles.filterSection, { alignItems: 'center' }, { opacity: filterAnim }]}>
      <ScrollView 
        horizontal={true} 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[
          styles.filterContainer,
          {
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingVertical: 8,
            marginTop: 3,
            marginBottom: 3,
            paddingRight: 24
          }
        ]}
        style={{ flexGrow: 0 }}
      >
        {/* Free Toggle Filter - FIRST BUTTON */}
        <TouchableOpacity 
          style={[
            styles.filterPill,
            {
              backgroundColor: activeFilters.price === 'free' ? '#374151' : '#F0F3F5',
              borderWidth: activeFilters.price === 'free' ? 0 : 1,
              borderColor: activeFilters.price === 'free' ? 'transparent' : '#E0E0E0',
              marginRight: 8,
              shadowColor: activeFilters.price === 'free' ? '#374151' : 'transparent',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: activeFilters.price === 'free' ? 0.3 : 0,
              shadowRadius: 4,
              elevation: activeFilters.price === 'free' ? 3 : 0,
            }
          ]}
          onPress={() => handleFilterTap('Free')}
          activeOpacity={0.7}
        >
          <Text 
            style={[
              styles.filterPillText,
              { 
                color: activeFilters.price === 'free' ? '#FFFFFF' : '#60798A',
                fontWeight: activeFilters.price === 'free' ? '700' : '500'
              }
            ]}
            numberOfLines={1}
          >
            FREE FIRST
          </Text>
        </TouchableOpacity>

        {/* Gi Toggle Filter */}
        <TouchableOpacity 
          style={[
            styles.filterPill,
            {
              backgroundColor: activeFilters.gi ? '#374151' : '#F0F3F5',
              borderWidth: activeFilters.gi ? 0 : 1,
              borderColor: activeFilters.gi ? 'transparent' : '#E0E0E0',
              marginRight: 8,
              shadowColor: activeFilters.gi ? '#374151' : 'transparent',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: activeFilters.gi ? 0.3 : 0,
              shadowRadius: 4,
              elevation: activeFilters.gi ? 3 : 0,
            }
          ]}
          onPress={() => toggleFilter('gi')}
          activeOpacity={0.7}
        >
          <Text 
            style={[
              styles.filterPillText,
              { 
                color: activeFilters.gi ? '#FFFFFF' : '#60798A',
                fontWeight: activeFilters.gi ? '700' : '500'
              }
            ]}
            numberOfLines={1}
          >
            Gi ({sessionCounts.giCount})
          </Text>
        </TouchableOpacity>

        {/* No-Gi Toggle Filter */}
        <TouchableOpacity 
          style={[
            styles.filterPill,
            {
              backgroundColor: activeFilters.nogi ? '#374151' : '#F0F3F5',
              borderWidth: activeFilters.nogi ? 0 : 1,
              borderColor: activeFilters.nogi ? 'transparent' : '#E0E0E0',
              marginRight: 8,
              shadowColor: activeFilters.nogi ? '#374151' : 'transparent',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: activeFilters.nogi ? 0.3 : 0,
              shadowRadius: 4,
              elevation: activeFilters.nogi ? 3 : 0,
            }
          ]}
          onPress={() => toggleFilter('nogi')}
          activeOpacity={0.7}
        >
          <Text 
            style={[
              styles.filterPillText,
              { 
                color: activeFilters.nogi ? '#FFFFFF' : '#60798A',
                fontWeight: activeFilters.nogi ? '700' : '500'
              }
            ]}
            numberOfLines={1}
          >
            No-Gi ({sessionCounts.nogiCount})
          </Text>
        </TouchableOpacity>

        {/* Map Toggle Button */}
        <TouchableOpacity 
          style={[
            styles.filterPill,
            {
              backgroundColor: '#F0F3F5',
              borderWidth: 1,
              borderColor: '#E0E0E0',
              marginRight: 4,
              shadowColor: 'transparent',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0,
              shadowRadius: 4,
              elevation: 0,
            }
          ]}
          onPress={toggleViewMode}
          activeOpacity={0.7}
        >
          <View style={styles.mapButtonContent}>
            <Text style={styles.mapText}>Map</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  filterSection: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 8,
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterPillText: {
    fontSize: 14,
    textAlign: 'center',
  },
  mapButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#60798A',
  },
});

export default ResultsFilterBar; 