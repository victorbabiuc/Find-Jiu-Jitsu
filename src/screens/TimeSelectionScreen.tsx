import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Modal,
  Platform,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { useDashboardNavigation } from '../navigation/useNavigation';
import { beltColors } from '../utils/constants';
import DateTimePicker from '@react-native-community/datetimepicker';

function getNextWeekendDates() {
  const today = new Date();
  const day = today.getDay();
  // 6 = Saturday, 0 = Sunday
  const nextSaturday = new Date(today);
  nextSaturday.setDate(today.getDate() + ((6 - day + 7) % 7));
  const nextSunday = new Date(nextSaturday);
  nextSunday.setDate(nextSaturday.getDate() + 1);
  return [nextSaturday, nextSunday];
}

const dateOptions = [
  { label: 'Today', value: 'today' },
  { label: 'Tomorrow', value: 'tomorrow' },
  { label: 'This Weekend', value: 'weekend' },
  { label: 'Select Dates', value: 'custom' },
];

const TimeSelectionScreen: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { userBelt, selectedLocation } = useApp();
  const navigation = useDashboardNavigation();
  const beltColor = beltColors[userBelt];
  
  const [selectedOption, setSelectedOption] = useState<string>('today');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [multiSelectDates, setMultiSelectDates] = useState<Date[]>([]);
  const [tempSelectedDates, setTempSelectedDates] = useState<Date[]>([]);
  const [customDatePickerDate, setCustomDatePickerDate] = useState(new Date());
  const [showSummary, setShowSummary] = useState(false);

  // Debug logging
  console.log('TimeSelectionScreen rendered');
  console.log('Selected location:', selectedLocation);

  // Helper to get today/tomorrow
  const getDateForOption = (option: string) => {
    const today = new Date();
    if (option === 'today') return [today];
    if (option === 'tomorrow') {
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      return [tomorrow];
    }
    if (option === 'weekend') {
      return getNextWeekendDates();
    }
    if (option === 'custom') {
      return multiSelectDates;
    }
    return [];
  };

  // Handle option select
  const handleOptionSelect = (value: string) => {
    setSelectedOption(value);
    if (value === 'custom') {
      setTempSelectedDates(multiSelectDates.length ? multiSelectDates : []);
      setShowDatePicker(true);
    } else if (value === 'weekend') {
      setMultiSelectDates(getNextWeekendDates());
      setShowSummary(true);
    } else {
      setMultiSelectDates(getDateForOption(value));
      setShowSummary(true);
    }
  };

  // Handle multi-date selection
  const handleDateChange = (event: any, date?: Date) => {
    if (date) {
      // Toggle date in tempSelectedDates
      const exists = tempSelectedDates.some(d => d.toDateString() === date.toDateString());
      let newDates;
      if (exists) {
        newDates = tempSelectedDates.filter(d => d.toDateString() !== date.toDateString());
      } else {
        newDates = [...tempSelectedDates, date];
      }
      setTempSelectedDates(newDates);
    }
  };

  // Confirm multi-date selection
  const handleDone = () => {
    setMultiSelectDates(tempSelectedDates);
    setSelectedOption('custom');
    setShowDatePicker(false);
    setShowSummary(true);
  };

  // Format selected dates for summary
  const getSelectedDatesSummary = () => {
    if (selectedOption === 'weekend') return '2 days selected';
    if (selectedOption === 'custom') return `${multiSelectDates.length} day${multiSelectDates.length !== 1 ? 's' : ''} selected`;
    if (selectedOption === 'today' || selectedOption === 'tomorrow') return '1 day selected';
    return '';
  };

  // Render grid buttons
  const renderOptionButton = (option: typeof dateOptions[0]) => {
    const isSelected = selectedOption === option.value;
    return (
      <TouchableOpacity
        key={option.value}
        style={[
          styles.optionButton,
          !isSelected && styles.optionButtonUnselected,
          isSelected && { borderColor: beltColor.primary, borderWidth: 2, backgroundColor: '#fff' },
        ]}
        onPress={() => handleOptionSelect(option.value)}
        activeOpacity={0.85}
      >
        <Text style={[
          styles.optionText,
          isSelected ? { color: beltColor.primary } : { color: '#fff' },
        ]}>
          {option.label}
        </Text>
        {option.value === 'custom' && multiSelectDates.length > 0 && (
          <Text style={styles.selectedCount}>{multiSelectDates.length} selected</Text>
        )}
        {option.value === 'weekend' && isSelected && (
          <Text style={styles.selectedCount}>2 selected</Text>
        )}
      </TouchableOpacity>
    );
  };

  // Render multi-date picker modal (simple: show next 14 days as buttons)
  const renderMultiDatePicker = () => {
    const days = Array.from({ length: 14 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() + i);
      return d;
    });
    return (
      <Modal
        transparent
        visible={showDatePicker}
        animationType="fade"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.datePickerContainer}>
            <Text style={styles.modalTitle}>Select Dates</Text>
            <FlatList
              data={days}
              keyExtractor={d => d.toDateString()}
              numColumns={2}
              renderItem={({ item: d }) => {
                const selected = tempSelectedDates.some(sel => sel.toDateString() === d.toDateString());
                return (
                  <TouchableOpacity
                    style={[
                      styles.dateButton,
                      selected && { backgroundColor: beltColor.primary },
                    ]}
                    onPress={() => handleDateChange(null, d)}
                  >
                    <Text style={[styles.dateButtonText, selected && { color: 'white', fontWeight: '700' }]}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', weekday: 'short' })}
                    </Text>
                    {selected && <Text style={styles.checkmark}>✓</Text>}
                  </TouchableOpacity>
                );
              }}
              contentContainerStyle={{ gap: 12, paddingHorizontal: 4, paddingBottom: 8 }}
              columnWrapperStyle={{ gap: 12, justifyContent: 'space-between' }}
            />
            <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  const handleSearch = () => {
    console.log('Find Open Mats button pressed');
    console.log('Date/time selected:', { date: multiSelectDates, time: 'any' });
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
            {dateOptions.map(renderOptionButton)}
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

      {showSummary && (
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryText}>{getSelectedDatesSummary()}</Text>
        </View>
      )}

      {renderMultiDatePicker()}
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
    flexBasis: '48%',
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 8,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#444',
  },
  optionButtonUnselected: {
    backgroundColor: '#333',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
  },
  selectedCount: {
    color: '#888',
    fontSize: 13,
    marginTop: 4,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  datePickerContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  dateButton: {
    width: '48%',
    flex: 0,
    backgroundColor: '#eee',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginVertical: 4,
    minWidth: 120,
    minHeight: 48,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dateButtonText: {
    color: '#222',
    fontSize: 15,
    fontWeight: '600',
  },
  checkmark: {
    color: '#2196F3',
    fontSize: 18,
    marginLeft: 4,
    fontWeight: '700',
  },
  doneButton: {
    marginTop: 16,
    backgroundColor: '#222',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  doneButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  summaryContainer: {
    marginBottom: 16,
    alignItems: 'center',
  },
  summaryText: {
    color: '#222',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default TimeSelectionScreen; 