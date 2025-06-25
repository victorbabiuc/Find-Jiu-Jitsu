import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { useDashboardNavigation } from '../navigation/useNavigation';
import { beltColors } from '../utils/constants';

const TimeSelectionScreen: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { userBelt, selectedLocation } = useApp();
  const navigation = useDashboardNavigation();
  const beltColor = beltColors[userBelt];
  
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');

  // Debug logging
  console.log('TimeSelectionScreen rendered');
  console.log('Selected location:', selectedLocation);
  console.log('Selected date:', selectedDate);
  console.log('Selected time:', selectedTime);

  const dateOptions = [
    { label: 'Today', value: 'today' },
    { label: 'Tomorrow', value: 'tomorrow' },
    { label: 'This Week', value: 'this_week' },
    { label: 'This Weekend', value: 'this_weekend' }
  ];

  const timeOptions = [
    { label: 'Morning', value: 'morning', time: '6am - 12pm' },
    { label: 'Afternoon', value: 'afternoon', time: '12pm - 5pm' },
    { label: 'Evening', value: 'evening', time: '5pm - 10pm' },
    { label: 'Any Time', value: 'any', time: 'All day' }
  ];

  const handleSearch = () => {
    console.log('Find Open Mats button pressed');
    console.log('Date/time selected:', { date: selectedDate, time: selectedTime });
    console.log('Selected location before navigation:', selectedLocation);
    
    // Extract just the city name (before the comma if it exists)
    const cityName = selectedLocation ? selectedLocation.split(',')[0].trim() : 'Tampa';
    console.log('City name extracted:', cityName);
    console.log('Navigating to Results screen with location:', cityName);
    
    // Navigate to ResultsScreen with location parameter
    navigation.navigate('Results', { location: cityName });
  };

  const handleBack = () => {
    console.log('Back button pressed');
    navigation.goBack();
  };

  const handleDateSelect = (date: string) => {
    console.log('Date selected:', date);
    setSelectedDate(date);
  };

  const handleTimeSelect = (time: string) => {
    console.log('Time selected:', time);
    setSelectedTime(time);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Belt Status Bar */}
      <LinearGradient
        colors={[beltColor.primary, beltColor.secondary]}
        style={styles.beltStatusBar}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
        >
          <Text style={[styles.backButtonText, { color: theme.text.primary }]}>
            ← Back
          </Text>
        </TouchableOpacity>
        
        <Text style={[styles.headerTitle, { color: theme.text.primary }]}>
          When do you want to train?
        </Text>
        
        {/* Theme Toggle */}
        <TouchableOpacity
          style={[styles.themeToggle, { backgroundColor: theme.surface }]}
          onPress={toggleTheme}
          activeOpacity={0.7}
        >
          <Text style={[styles.themeToggleText, { color: theme.text.secondary }]}>
            {theme.name === 'dark' ? '☀️' : '🌙'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Scrollable Content */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Date Selection */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>
            Select Date
          </Text>
          <View style={styles.optionsContainer}>
            {dateOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionButton,
                  { backgroundColor: theme.surface },
                  selectedDate === option.value && {
                    borderColor: beltColor.primary,
                    borderWidth: 2,
                  }
                ]}
                onPress={() => handleDateSelect(option.value)}
              >
                <Text style={[
                  styles.optionText,
                  { color: theme.text.primary },
                  selectedDate === option.value && { color: beltColor.primary, fontWeight: '600' }
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Time Selection */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>
            Select Time of Day
          </Text>
          <View style={styles.optionsContainer}>
            {timeOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionButton,
                  { backgroundColor: theme.surface },
                  selectedTime === option.value && {
                    borderColor: beltColor.primary,
                    borderWidth: 2,
                  }
                ]}
                onPress={() => handleTimeSelect(option.value)}
              >
                <View style={styles.timeOptionContent}>
                  <View style={styles.timeOptionRow}>
                    <Text style={[
                      styles.optionText,
                      { color: theme.text.primary },
                      selectedTime === option.value && { color: beltColor.primary, fontWeight: '600' }
                    ]}>
                      {option.label}
                    </Text>
                    <Text style={[
                      styles.timeText,
                      { color: theme.text.secondary },
                      selectedTime === option.value && { color: beltColor.secondary }
                    ]}>
                      {option.time}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Selected Location */}
        <View style={styles.locationInfo}>
          <Text style={[styles.locationLabel, { color: theme.text.secondary }]}>
            Location:
          </Text>
          <Text style={[styles.locationValue, { color: theme.text.primary }]}>
            {selectedLocation || 'Not selected'}
          </Text>
        </View>
      </ScrollView>

      {/* Find Open Mats Button - Fixed at bottom */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.searchButton}
          onPress={handleSearch}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[beltColor.primary, beltColor.secondary]}
            style={styles.buttonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={[styles.searchButtonText, { color: beltColor.textOnColor }]}>
              Find Open Mats
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  beltStatusBar: {
    height: 1,
    width: '100%',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  themeToggle: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  themeToggleText: {
    fontSize: 18,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40, // Extra padding at bottom for spacing
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  timeOptionContent: {
    width: '100%',
  },
  timeOptionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  locationLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginRight: 8,
  },
  locationValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  searchButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  buttonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  searchButtonText: {
    fontSize: 18,
    fontWeight: '700',
  },
});

export default TimeSelectionScreen; 