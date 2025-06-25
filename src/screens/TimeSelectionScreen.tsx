import React, { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { useFindNavigation } from '../navigation/useNavigation';
import { useLoading } from '../context';
import { beltColors } from '../utils/constants';

const TimeSelectionScreen: React.FC = () => {
  // Safe context access (keep working approach)
  const themeContext = useTheme();
  const theme = themeContext?.theme || {
    background: '#000000',
    surface: '#111111', 
    text: { primary: '#ffffff', secondary: '#a3a3a3' }
  };

  const appContext = useApp();
  const userBelt = appContext?.userBelt || 'blue';
  const selectedLocation = appContext?.selectedLocation || 'Location';

  // Safe navigation access
  const navigation = useFindNavigation();
  
  // Safe loading access
  const loadingContext = useLoading();
  const showLoading = loadingContext?.showLoading || (() => {});
  const hideLoading = loadingContext?.hideLoading || (() => {});

  // Safe belt colors access
  const beltColor = beltColors[userBelt] || beltColors.blue;

  // Calendar state
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);

  // Calendar helpers
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    
    const days = [];
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const isDateSelected = (date: Date) => {
    return selectedDates.some(selected => 
      selected.getDate() === date.getDate() &&
      selected.getMonth() === date.getMonth() &&
      selected.getFullYear() === date.getFullYear()
    );
  };

  const toggleDateSelection = (date: Date) => {
    if (isDateSelected(date)) {
      setSelectedDates(selectedDates.filter(selected => 
        !(selected.getDate() === date.getDate() &&
          selected.getMonth() === date.getMonth() &&
          selected.getFullYear() === date.getFullYear())
      ));
    } else {
      setSelectedDates([...selectedDates, date]);
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const handleCalendarSearch = () => {
    if (selectedDates.length === 0) {
      // If no dates selected, use current date
      showLoading();
      navigation.navigate('Results', { 
        location: selectedLocation,
        dateSelection: 'custom',
        dates: [new Date()]
      });
    } else {
      showLoading();
      navigation.navigate('Results', { 
        location: selectedLocation,
        dateSelection: 'custom',
        dates: selectedDates
      });
    }
  };

  const days = getDaysInMonth(currentDate);
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        <Text style={{ 
          color: theme.text.primary, 
          fontSize: 22, 
          fontWeight: 'bold',
          textAlign: 'center',
          marginBottom: 12 
        }}>
          When do you want to train?
        </Text>
        
        <Text style={{ 
          color: theme.text.secondary,
          textAlign: 'center',
          marginBottom: 20 
        }}>
          Location: {selectedLocation}
        </Text>

        <Text style={{ 
          color: theme.text.primary, 
          fontSize: 16, 
          fontWeight: 'bold',
          marginBottom: 10 
        }}>
          Quick Actions
        </Text>

        <View style={{ marginBottom: 16 }}>
          <TouchableOpacity
            style={{
              backgroundColor: beltColor.primary,
              padding: 10,
              borderRadius: 8,
              marginBottom: 8
            }}
            onPress={() => {
              showLoading();
              navigation.navigate('Results', { 
                location: selectedLocation,
                dateSelection: 'today' 
              });
            }}
          >
            <Text style={{
              color: beltColor.textOnColor || '#FFFFFF',
              textAlign: 'center',
              fontWeight: 'bold'
            }}>
              Today
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              backgroundColor: beltColor.primary,
              padding: 10,
              borderRadius: 8,
              marginBottom: 8
            }}
            onPress={() => {
              showLoading();
              navigation.navigate('Results', { 
                location: selectedLocation,
                dateSelection: 'tomorrow' 
              });
            }}
          >
            <Text style={{
              color: beltColor.textOnColor || '#FFFFFF',
              textAlign: 'center',
              fontWeight: 'bold'
            }}>
              Tomorrow
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              backgroundColor: beltColor.primary,
              padding: 10,
              borderRadius: 8,
              marginBottom: 8
            }}
            onPress={() => {
              showLoading();
              navigation.navigate('Results', { 
                location: selectedLocation,
                dateSelection: 'weekend' 
              });
            }}
          >
            <Text style={{
              color: beltColor.textOnColor || '#FFFFFF',
              textAlign: 'center',
              fontWeight: 'bold'
            }}>
              This Weekend
            </Text>
          </TouchableOpacity>
        </View>

        {/* Calendar Section */}
        <Text style={{ 
          color: theme.text.primary, 
          fontSize: 16, 
          fontWeight: 'bold',
          marginBottom: 10 
        }}>
          Or pick specific dates
        </Text>

        {/* Calendar Header with Month Navigation */}
        <View style={{
          backgroundColor: theme.surface,
          borderRadius: 10,
          padding: 12,
          marginBottom: 12
        }}>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12
          }}>
            <TouchableOpacity
              onPress={() => navigateMonth('prev')}
              style={{
                padding: 6,
                borderRadius: 6,
                backgroundColor: theme.background
              }}
            >
              <Text style={{
                color: theme.text.primary,
                fontSize: 14,
                fontWeight: 'bold'
              }}>
                ←
              </Text>
            </TouchableOpacity>

            <Text style={{
              color: theme.text.primary,
              fontSize: 16,
              fontWeight: 'bold'
            }}>
              {formatMonthYear(currentDate)}
            </Text>

            <TouchableOpacity
              onPress={() => navigateMonth('next')}
              style={{
                padding: 6,
                borderRadius: 6,
                backgroundColor: theme.background
              }}
            >
              <Text style={{
                color: theme.text.primary,
                fontSize: 14,
                fontWeight: 'bold'
              }}>
                →
              </Text>
            </TouchableOpacity>
          </View>

          {/* Weekday Headers */}
          <View style={{
            flexDirection: 'row',
            marginBottom: 8
          }}>
            {weekdays.map((day, index) => (
              <View key={index} style={{
                flex: 1,
                alignItems: 'center'
              }}>
                <Text style={{
                  color: theme.text.secondary,
                  fontSize: 11,
                  fontWeight: 'bold'
                }}>
                  {day}
                </Text>
              </View>
            ))}
          </View>

          {/* Calendar Grid */}
          <View style={{
            flexDirection: 'row',
            flexWrap: 'wrap'
          }}>
            {days.map((day, index) => (
              <View key={index} style={{
                width: '14.28%',
                aspectRatio: 1,
                padding: 1
              }}>
                {day ? (
                  <TouchableOpacity
                    onPress={() => toggleDateSelection(day)}
                    style={{
                      flex: 1,
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderRadius: 6,
                      backgroundColor: isDateSelected(day) 
                        ? beltColor.primary 
                        : 'transparent',
                      borderWidth: isDateSelected(day) ? 0 : 1,
                      borderColor: theme.text.secondary
                    }}
                  >
                    <Text style={{
                      color: isDateSelected(day) 
                        ? beltColor.textOnColor || '#FFFFFF'
                        : theme.text.primary,
                      fontSize: 12,
                      fontWeight: isDateSelected(day) ? 'bold' : 'normal'
                    }}>
                      {day.getDate()}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <View style={{ flex: 1 }} />
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Manual Search Button */}
        <TouchableOpacity
          style={{
            backgroundColor: beltColor.primary,
            padding: 12,
            borderRadius: 10,
            marginBottom: 16
          }}
          onPress={handleCalendarSearch}
        >
          <Text style={{
            color: beltColor.textOnColor || '#FFFFFF',
            textAlign: 'center',
            fontWeight: 'bold',
            fontSize: 15
          }}>
            Find Open Mats for Selected Dates
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default TimeSelectionScreen; 