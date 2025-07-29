import React, { useState, useEffect } from 'react';
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
import { beltColors, selectionColor } from '../utils';

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
    <TouchableWithoutFeedback onPress={() => onPress(day)}>
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

  // Clear dates when component mounts (fresh start each time)
  useEffect(() => {
    setSelectedDates([]);
  }, []); // Empty dependency array = runs once on mount

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
    setSelectedDates([]);
  };

  const handleCalendarSearch = () => {
    if (selectedDates.length === 0) {
      // Show some feedback that dates need to be selected
      return;
    }
    
    // Navigate to results with selected dates
    navigation.navigate('Results', {
      location: selectedLocation,
      dateSelection: selectedDates.length > 0 ? 'custom' : 'today',
      dates: selectedDates.length > 0 
        ? selectedDates.map(date => date.toISOString())
        : [new Date().toISOString()]
    });
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
            When do you want to train?
          </Text>
          
          <Text style={{
            fontSize: 16,
            color: '#6B7280',
            marginBottom: 8,
            textAlign: 'center',
            alignSelf: 'center',
            width: '100%'
          }}>
            Select dates or use quick actions
          </Text>

          <Text style={{
            fontSize: 16,
            color: '#6B7280',
            marginBottom: 16,
            textAlign: 'center',
            alignSelf: 'center',
            width: '100%'
          }}>
            📍 {selectedLocation}
          </Text>

          {/* Header separator */}
          <View style={{
            height: 1,
            backgroundColor: '#E5E7EB',
            marginBottom: 12
          }} />
        </View>

        {/* Quick Action Buttons */}
        <View style={{ 
          flexDirection: 'row',
          justifyContent: 'center',
          paddingHorizontal: 20,
          marginBottom: 8
        }}>
          <TouchableOpacity
            style={{
              paddingHorizontal: 20,
              paddingVertical: 10,
              backgroundColor: '#F3F4F6',
              borderRadius: 20,
              borderWidth: 1,
              borderColor: '#E0E0E0',
              marginHorizontal: 4,
            }}
            onPress={() => handleQuickSelect('today')}
          >
            <Text style={{ fontSize: 15, color: '#374151', fontWeight: '500' }}>Today</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={{
              paddingHorizontal: 20,
              paddingVertical: 10,
              backgroundColor: '#F3F4F6',
              borderRadius: 20,
              borderWidth: 1,
              borderColor: '#E0E0E0',
              marginHorizontal: 4,
            }}
            onPress={() => handleQuickSelect('tomorrow')}
          >
            <Text style={{ fontSize: 15, color: '#374151', fontWeight: '500' }}>Tomorrow</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={{
              paddingHorizontal: 20,
              paddingVertical: 10,
              backgroundColor: '#F3F4F6',
              borderRadius: 20,
              borderWidth: 1,
              borderColor: '#E0E0E0',
              marginHorizontal: 4,
            }}
            onPress={() => handleQuickSelect('weekend')}
          >
            <Text style={{ fontSize: 15, color: '#374151', fontWeight: '500' }}>Weekend</Text>
          </TouchableOpacity>
        </View>

        {/* Calendar separator */}
        <View style={{
          height: 1,
          backgroundColor: '#E5E7EB',
          marginTop: 8,
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

      {/* Bottom Action Buttons */}
      <View style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
                 backgroundColor: '#FFFFFF',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB'
      }}>
        {selectedDates.length > 0 ? (
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity
              style={{
                flex: 1,
                paddingVertical: 12,
                backgroundColor: '#F3F4F6',
                borderRadius: 8,
                alignItems: 'center'
              }}
              onPress={clearAllSelections}
            >
              <Text style={{ color: '#6B7280', fontWeight: '600' }}>Clear</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={{
                flex: 1,
                paddingVertical: 12,
                backgroundColor: '#4B5563',
                borderRadius: 8,
                alignItems: 'center'
              }}
              onPress={handleCalendarSearch}
            >
              <Text style={{ color: 'white', fontWeight: '600' }}>Search</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{ alignItems: 'center' }}>
                         <Text style={{
               fontSize: 16,
               color: '#6B7280',
               textAlign: 'center'
             }}>
              Select dates to search for open mats
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default TimeSelectionScreen;
