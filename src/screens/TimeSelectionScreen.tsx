import React, { useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { 
  View, 
  Text, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity, 
  TouchableWithoutFeedback
} from 'react-native';
import { useApp } from '../context';
import { useFindNavigation } from '../navigation/useNavigation';
import { Ionicons } from '@expo/vector-icons';
import { beltColors, selectionColor, haptics } from '../utils';

// Memoized DateCell component for calendar optimization
interface DateCellProps {
  day: Date | null;
  isSelected: boolean;
  isToday: boolean;
  onPress: (date: Date) => void;
}

const DateCell = React.memo(({ day, isSelected, isToday, onPress }: DateCellProps) => {
  if (!day) {
    return <View style={{ flex: 1 }} />;
  }
  
  return (
    <TouchableWithoutFeedback onPress={() => {
      haptics.light(); // Light haptic for date selection
      onPress(day);
    }}>
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 24,
        backgroundColor: isSelected 
          ? '#E5E7EB' // Darker gray background for selected dates
          : '#F5F5F5',
        minHeight: 48,
        minWidth: 48,
        borderWidth: (isToday && !isSelected) ? 2 : isSelected ? 1 : 0,
        borderColor: (isToday && !isSelected) ? '#6B7280' : isSelected ? '#9CA3AF' : 'transparent'
      }}>
        <Text style={{
          fontSize: 16,
          color: isSelected ? '#111827' : '#1F2937',
          fontWeight: (isToday || isSelected) ? 'bold' : 'normal',
        }}>
          {day.getDate()}
        </Text>
      </View>
    </TouchableWithoutFeedback>
  );
}, (prevProps, nextProps) => {
  // Only re-render if these specific props change
  return (
    prevProps.day?.getTime() === nextProps.day?.getTime() &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.isToday === nextProps.isToday
  );
});

const TimeSelectionScreen: React.FC = () => {
  const { userBelt, selectedLocation } = useApp();
  const navigation = useFindNavigation();

  // Simple state - no drag functionality
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  // Clear dates when component mounts (fresh start each time)
  useEffect(() => {
    setSelectedDates([]);
    setHasSearched(false);
  }, []); // Empty dependency array = runs once on mount

  // Clear dates when screen comes into focus (navigating back to screen)
  useFocusEffect(
    React.useCallback(() => {
      // Clear all selections when screen is focused
      setSelectedDates([]);
      setHasSearched(false);
    }, [])
  );

  // Weekday labels
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Helper functions
  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const isDateSelected = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return selectedDates.some(d => d.toISOString().split('T')[0] === dateStr);
  };

  const toggleDateSelection = (date: Date) => {
    setSelectedDates(prev => {
      const dateStr = date.toISOString().split('T')[0];
      const exists = prev.some(d => d.toISOString().split('T')[0] === dateStr);
      
      if (exists) {
        return prev.filter(d => d.toISOString().split('T')[0] !== dateStr);
      } else {
        return [...prev, date];
      }
    });
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const handleQuickSelect = (type: 'today' | 'tomorrow' | 'weekend') => {
    haptics.medium(); // Medium haptic for quick date selection
    const today = new Date();
    let dates: Date[] = [];

    switch (type) {
      case 'today':
        dates = [today];
        break;
      case 'tomorrow':
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        dates = [tomorrow];
        break;
      case 'weekend':
        // Get current day of week
        const currentDay = today.getDay();
        
        // Calculate days until Friday (5), Saturday (6), Sunday (0)
        const daysUntilFriday = (5 - currentDay + 7) % 7 || 7;
        const daysUntilSaturday = (6 - currentDay + 7) % 7 || 7;
        const daysUntilSunday = (0 - currentDay + 7) % 7 || 7;
        
        const friday = new Date(today);
        friday.setDate(today.getDate() + daysUntilFriday);
        
        const saturday = new Date(today);
        saturday.setDate(today.getDate() + daysUntilSaturday);
        
        const sunday = new Date(today);
        sunday.setDate(today.getDate() + daysUntilSunday);
        
        dates = [friday, saturday, sunday];
        break;
    }

    setSelectedDates(dates);
    
    // Automatically trigger search after selecting quick action dates
    setTimeout(() => {
      navigation.navigate('Results', {
        location: selectedLocation,
        dateSelection: 'custom',
        dates: dates.map(date => date.toISOString())
      });
    }, 100); // Small delay to ensure state is updated
  };

  const clearAllSelections = () => {
    haptics.light(); // Light haptic for clearing selections
    setSelectedDates([]);
    setHasSearched(false);
  };

  const handleCalendarSearch = () => {
    if (selectedDates.length === 0) {
      haptics.warning(); // Warning haptic for no dates selected
      // Show some feedback that dates need to be selected
      return;
    }
    
    haptics.success(); // Success haptic for search action
    setHasSearched(true);
    
    // Navigate to results with selected dates
    navigation.navigate('Results', {
      location: selectedLocation,
      dateSelection: selectedDates.length > 0 ? 'custom' : 'today',
      dates: selectedDates.length > 0 
        ? selectedDates.map(date => date.toISOString())
        : [new Date().toISOString()]
    });
  };

  const handleDynamicButtonPress = () => {
    if (hasSearched) {
      // Clear & Search Again state
      clearAllSelections();
    } else if (selectedDates.length > 0) {
      // Search state
      handleCalendarSearch();
    }
    // No dates selected state - button is disabled
  };

  const renderCalendarMonth = (monthDate: Date) => {
    const days = getDaysInMonth(monthDate);
    const monthName = monthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    return (
      <View key={monthName} style={{ marginBottom: 20 }}>
        <Text style={{
          fontSize: 18,
          fontWeight: 'bold',
          color: '#1F2937',
          marginBottom: 16,
          textAlign: 'center'
        }}>
          {monthName}
        </Text>

        {/* Weekday headers */}
        <View style={{ flexDirection: 'row', marginBottom: 8 }}>
          {weekdays.map(day => (
            <View key={day} style={{ flex: 1, alignItems: 'center' }}>
                             <Text style={{
                 fontSize: 12,
                 fontWeight: '600',
                 color: '#6B7280'
               }}>
                {day}
              </Text>
            </View>
          ))}
        </View>

        {/* Calendar grid */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {days.map((day, index) => (
            <View key={index} style={{ width: '14.28%', aspectRatio: 1, padding: 2 }}>
              <DateCell
                day={day}
                isSelected={day ? isDateSelected(day) : false}
                isToday={day ? isToday(day) : false}
                onPress={toggleDateSelection}
              />
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 6 }}>
          <Text style={{
            fontSize: 28,
            fontWeight: '700',
            color: '#111827',
            marginBottom: 8,
            textAlign: 'center',
            alignSelf: 'center',
            width: '100%'
          }}>
            Select Dates
          </Text>
          
          <Text style={{
            fontSize: 16,
            color: '#6B7280',
            marginBottom: 16,
            textAlign: 'center',
            alignSelf: 'center',
            width: '100%'
          }}>
            {selectedLocation}
          </Text>

          {/* Header separator */}
          <View style={{
            height: 1,
            backgroundColor: '#E5E7EB',
            marginBottom: 6
          }} />
        </View>

        {/* Button Container - Wrapper for both rows */}
        <View style={{ 
          flexDirection: 'column',
          paddingHorizontal: 20,
          marginBottom: 4
        }}>
          {/* Row 1: Today, Tomorrow, Weekend */}
          <View style={{ 
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 12
          }}>
            <TouchableOpacity
              style={{
                paddingHorizontal: 10,
                paddingVertical: 8,
                backgroundColor: '#F3F4F6',
                borderRadius: 12,
                borderWidth: 1,
                borderColor: '#E0E0E0',
                flex: 1,
                marginHorizontal: 3,
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 36,
              }}
              onPress={() => handleQuickSelect('today')}
            >
              <Text style={{ 
                fontSize: 12, 
                color: '#374151', 
                fontWeight: '600', 
                textAlign: 'center',
                includeFontPadding: false,
              }}>Today</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={{
                paddingHorizontal: 10,
                paddingVertical: 8,
                backgroundColor: '#F3F4F6',
                borderRadius: 12,
                borderWidth: 1,
                borderColor: '#E0E0E0',
                flex: 1,
                marginHorizontal: 3,
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 36,
              }}
              onPress={() => handleQuickSelect('tomorrow')}
            >
              <Text style={{ 
                fontSize: 12, 
                color: '#374151', 
                fontWeight: '600', 
                textAlign: 'center',
                includeFontPadding: false,
              }}>Tomorrow</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={{
                paddingHorizontal: 10,
                paddingVertical: 8,
                backgroundColor: '#F3F4F6',
                borderRadius: 12,
                borderWidth: 1,
                borderColor: '#E0E0E0',
                flex: 1,
                marginHorizontal: 3,
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 36,
              }}
              onPress={() => handleQuickSelect('weekend')}
            >
              <Text style={{ 
                fontSize: 12, 
                color: '#374151', 
                fontWeight: '600', 
                textAlign: 'center',
                includeFontPadding: false,
              }}>Weekend</Text>
            </TouchableOpacity>
          </View>

          {/* Row 2: Dynamic Button */}
          <View style={{ 
            flexDirection: 'row',
            width: '100%'
          }}>
            <TouchableOpacity
              style={{
                paddingHorizontal: 14,
                paddingVertical: 8,
                backgroundColor: hasSearched ? '#F3F4F6' : 
                               selectedDates.length > 0 ? '#4B5563' : '#E5E7EB',
                borderRadius: 12,
                borderWidth: 1,
                borderColor: hasSearched ? '#E0E0E0' : 
                            selectedDates.length > 0 ? '#4B5563' : '#E0E0E0',
                alignItems: 'center',
                justifyContent: 'center',
                flex: 1,
                minHeight: 36,
              }}
              onPress={handleDynamicButtonPress}
              disabled={selectedDates.length === 0}
            >
              <Text style={{ 
                fontSize: 13, 
                color: hasSearched ? '#6B7280' : 
                       selectedDates.length > 0 ? 'white' : '#9CA3AF', 
                fontWeight: '600',
                textAlign: 'center',
                includeFontPadding: false,
              }}>
                {hasSearched ? 'Clear & Search Again' : 
                 selectedDates.length > 0 ? 'Search' : 'Select dates'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Calendar separator */}
        <View style={{
          height: 1,
          backgroundColor: '#E5E7EB',
          marginTop: 4,
          marginBottom: 8,
          marginHorizontal: 20
        }} />

        {/* Calendar Section */}
        <View style={{ paddingHorizontal: 20 }}>
          {/* Reusable Calendar Month Component */}
          {renderCalendarMonth(currentDate)}
          
          {/* Next month */}
          {(() => {
            const nextMonth = new Date(currentDate);
            nextMonth.setMonth(nextMonth.getMonth() + 1);
            return renderCalendarMonth(nextMonth);
          })()}
        </View>

        {/* Empty space click handler */}
        <TouchableOpacity
          style={{ flex: 1 }}
          activeOpacity={1}
          onPress={() => {
            // Clear date selections when tapping on white space
            if (selectedDates.length > 0) {
              clearAllSelections();
            }
          }}
        >
          <View style={{ flex: 1, minHeight: 200 }} />
        </TouchableOpacity>
      </ScrollView>


    </SafeAreaView>
  );
};

export default TimeSelectionScreen;
