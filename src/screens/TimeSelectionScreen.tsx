import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity, 
  PanResponder,
  Dimensions
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { useFindNavigation } from '../navigation/useNavigation';
import { useLoading } from '../context';
import { beltColors } from '../utils/constants';

const { width: screenWidth } = Dimensions.get('window');

const TimeSelectionScreen: React.FC = () => {
  // Safe context access
  const themeContext = useTheme();
  const theme = themeContext?.theme || {
    background: '#000000',
    surface: '#111111', 
    text: { primary: '#ffffff', secondary: '#a3a3a3' }
  };

  const appContext = useApp();
  const userBelt = appContext?.userBelt || 'blue';
  const selectedLocation = appContext?.selectedLocation || 'Tampa';

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
  
  // Drag selection state
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartDate, setDragStartDate] = useState<Date | null>(null);
  const [dragEndDate, setDragEndDate] = useState<Date | null>(null);
  const [calendarLayout, setCalendarLayout] = useState<{x: number, y: number, width: number, height: number} | null>(null);

  // Weekday labels
  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Calendar helpers
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 (Sun) - 6 (Sat)
    // Shift so Monday is 0, Sunday is 6
    firstDayOfMonth = (firstDayOfMonth + 6) % 7;

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
      const newDates = selectedDates.filter(selected => 
        !(selected.getDate() === date.getDate() &&
          selected.getMonth() === date.getMonth() &&
          selected.getFullYear() === date.getFullYear())
      );
      setSelectedDates(newDates);
    } else {
      const newDates = [...selectedDates, date];
      setSelectedDates(newDates);
    }
  };

  const getDatesInRange = (startDate: Date, endDate: Date): Date[] => {
    const dates: Date[] = [];
    const current = new Date(startDate);
    
    while (current <= endDate) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return dates;
  };

  // Calculate date from touch position
  const getDateFromPosition = (x: number, y: number, monthDate: Date, monthDays: (Date | null)[]): Date | null => {
    if (!calendarLayout) return null;
    
    // Calculate cell dimensions
    const cellWidth = calendarLayout.width / 7;
    const cellHeight = cellWidth; // Square cells
    
    // Calculate relative position within calendar
    const relativeX = x - calendarLayout.x;
    const relativeY = y - calendarLayout.y;
    
    // Calculate grid position
    const col = Math.floor(relativeX / cellWidth);
    const row = Math.floor(relativeY / cellHeight);
    
    // Calculate index in monthDays array
    const index = row * 7 + col;
    
    if (index >= 0 && index < monthDays.length && monthDays[index]) {
      return monthDays[index];
    }
    
    return null;
  };

  const handleDragStart = (date: Date) => {
    setIsDragging(true);
    setDragStartDate(date);
    setDragEndDate(date);
    setSelectedDates([]); // Clear previous selections
  };

  const handleDragMove = (date: Date) => {
    if (isDragging && dragStartDate) {
      setDragEndDate(date);
    }
  };

  const handleDragEnd = () => {
    if (isDragging && dragStartDate && dragEndDate) {
      const start = dragStartDate < dragEndDate ? dragStartDate : dragEndDate;
      const end = dragStartDate < dragEndDate ? dragEndDate : dragStartDate;
      const rangeDates = getDatesInRange(start, end);
      setSelectedDates(rangeDates);
    }
    
    setIsDragging(false);
    setDragStartDate(null);
    setDragEndDate(null);
  };

  const isDateInDragRange = (date: Date): boolean => {
    if (!isDragging || !dragStartDate || !dragEndDate) return false;
    
    const start = dragStartDate < dragEndDate ? dragStartDate : dragEndDate;
    const end = dragStartDate < dragEndDate ? dragEndDate : dragStartDate;
    
    return date >= start && date <= end;
  };

  // PanResponder for drag selection
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dx) > 10 || Math.abs(gestureState.dy) > 10;
      },
      onPanResponderGrant: (evt) => {
        // Calculate which date was touched
        const firstMonthDays = getDaysInMonth(currentDate);
        const touchedDate = getDateFromPosition(
          evt.nativeEvent.pageX, 
          evt.nativeEvent.pageY, 
          currentDate, 
          firstMonthDays
        );
        
        if (touchedDate) {
          handleDragStart(touchedDate);
        }
      },
      onPanResponderMove: (evt) => {
        if (isDragging) {
          // Calculate which date is currently under finger
          const firstMonthDays = getDaysInMonth(currentDate);
          const nextMonth = new Date(currentDate);
          nextMonth.setMonth(nextMonth.getMonth() + 1);
          const secondMonthDays = getDaysInMonth(nextMonth);
          
          // Try first month
          let touchedDate = getDateFromPosition(
            evt.nativeEvent.pageX, 
            evt.nativeEvent.pageY, 
            currentDate, 
            firstMonthDays
          );
          
          // If not found in first month, try second month
          if (!touchedDate) {
            touchedDate = getDateFromPosition(
              evt.nativeEvent.pageX, 
              evt.nativeEvent.pageY, 
              nextMonth, 
              secondMonthDays
            );
          }
          
          if (touchedDate) {
            handleDragMove(touchedDate);
          }
        }
      },
      onPanResponderRelease: () => {
        handleDragEnd();
      }
    })
  ).current;

  const handleCalendarSearch = () => {
    if (selectedDates.length === 0) {
      // If no dates selected, use today
      const today = new Date();
      setSelectedDates([today]);
      showLoading();
      navigation.navigate('Results', { 
        location: selectedLocation,
        dateSelection: 'custom',
        dates: [today.toISOString()]
      });
    } else {
      showLoading();
      navigation.navigate('Results', { 
        location: selectedLocation,
        dateSelection: 'custom',
        dates: selectedDates.map(date => date.toISOString())
      });
    }
  };

  // Add a handleQuickSelect function for quick actions
  const handleQuickSelect = (type: 'today' | 'tomorrow' | 'weekend') => {
    const today = new Date();
    if (type === 'today') {
      setSelectedDates([today]);
      showLoading();
      navigation.navigate('Results', {
        location: selectedLocation,
        dateSelection: 'today',
        dates: [today.toISOString()]
      });
    } else if (type === 'tomorrow') {
      const tomorrow = new Date();
      tomorrow.setDate(today.getDate() + 1);
      setSelectedDates([tomorrow]);
      showLoading();
      navigation.navigate('Results', {
        location: selectedLocation,
        dateSelection: 'tomorrow',
        dates: [tomorrow.toISOString()]
      });
    } else if (type === 'weekend') {
      // Always select Friday, Saturday, Sunday (Mon=1, ..., Sun=0)
      const currentDay = today.getDay(); // 0 (Sun) - 6 (Sat)
      // Shift so Monday is 0, Sunday is 6
      const dayIdx = (currentDay + 6) % 7;
      // Friday: 4, Saturday: 5, Sunday: 6
      let friday = new Date(today);
      let saturday = new Date(today);
      let sunday = new Date(today);
      friday.setDate(today.getDate() + ((4 - dayIdx + 7) % 7));
      saturday.setDate(today.getDate() + ((5 - dayIdx + 7) % 7));
      sunday.setDate(today.getDate() + ((6 - dayIdx + 7) % 7));
      setSelectedDates([]);
      showLoading();
      navigation.navigate('Results', {
        location: selectedLocation,
        dateSelection: 'weekend',
        dates: [friday.toISOString(), saturday.toISOString(), sunday.toISOString()]
      });
    }
  };

  // Helper function to format selected dates for display
  const formatSelectedDates = () => {
    if (selectedDates.length === 0) return '';
    if (selectedDates.length === 1) {
      return selectedDates[0].toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
    }
    if (selectedDates.length === 2) {
      const date1 = selectedDates[0].toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
      const date2 = selectedDates[1].toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
      return `${date1} - ${date2}`;
    }
    return `${selectedDates.length} dates selected`;
  };

  return (
    <SafeAreaView style={{
      flex: 1,
      backgroundColor: theme.background
    }}>
      <TouchableOpacity
        style={{ flex: 1 }}
        activeOpacity={1}
        onPress={() => {
          // Clear date selections when tapping on white space
          if (selectedDates.length > 0) {
            setSelectedDates([]);
          }
        }}
      >
        <ScrollView 
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: selectedDates.length > 0 ? 120 : 100 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={{
            paddingHorizontal: 16,
            paddingTop: 20,
            paddingBottom: 24
          }}>
            <Text style={{
              color: theme.text.primary,
              fontSize: 28,
              fontWeight: 'bold',
              marginBottom: 8,
              textAlign: 'center'
            }}>
              When do you want to train?
            </Text>
            <Text style={{
              color: theme.text.secondary,
              fontSize: 16,
              textAlign: 'center',
              marginBottom: 8
            }}>
              Select dates or use quick actions
            </Text>
            <Text style={{
              color: theme.text.secondary,
              fontSize: 14,
              textAlign: 'center',
              fontStyle: 'italic'
            }}>
              📍 {selectedLocation}
            </Text>
          </View>

          {/* Quick Action Buttons */}
          <View style={{
            paddingHorizontal: 16,
            marginBottom: 24
          }}>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginBottom: 16
            }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: '#F0F3F5',
                  paddingVertical: 10,
                  paddingHorizontal: 14,
                  borderRadius: 20,
                  marginRight: 8,
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: '#E0E0E0'
                }}
                onPress={() => handleQuickSelect('today')}
                activeOpacity={0.7}
              >
                <Text style={{
                  color: '#60798A',
                  fontWeight: '600',
                  fontSize: 14
                }}>
                  Today
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: '#F0F3F5',
                  paddingVertical: 10,
                  paddingHorizontal: 14,
                  borderRadius: 20,
                  marginRight: 8,
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: '#E0E0E0'
                }}
                onPress={() => handleQuickSelect('tomorrow')}
                activeOpacity={0.7}
              >
                <Text style={{
                  color: '#60798A',
                  fontWeight: '600',
                  fontSize: 14
                }}>
                  Tomorrow
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: '#F0F3F5',
                  paddingVertical: 10,
                  paddingHorizontal: 14,
                  borderRadius: 20,
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: '#E0E0E0'
                }}
                onPress={() => handleQuickSelect('weekend')}
                activeOpacity={0.7}
              >
                <Text style={{
                  color: '#60798A',
                  fontWeight: '600',
                  fontSize: 14
                }}>
                  Weekend
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Calendar Section */}
          <View 
            {...panResponder.panHandlers}
            onLayout={(event) => {
              const { x, y, width, height } = event.nativeEvent.layout;
              setCalendarLayout({ x, y, width, height });
            }}
          >
            {/* Reusable Calendar Month Component */}
            {(() => {
              const renderCalendarMonth = (monthDate: Date) => {
                const monthDays = getDaysInMonth(monthDate);
                
                return (
                  <View style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: 12,
                    padding: 12,
                    marginBottom: 12,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                    elevation: 3
                  }}>
                    {/* Month Header */}
                    <Text style={{
                      color: '#111518',
                      fontSize: 18,
                      fontWeight: 'bold',
                      textAlign: 'center',
                      marginBottom: 8
                    }}>
                      {formatMonthYear(monthDate)}
                    </Text>

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
                            color: '#6B7280',
                            fontSize: 12,
                            fontWeight: '600'
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
                      {monthDays.map((day, index) => (
                        <View key={index} style={{
                          width: '14.28%',
                          aspectRatio: 1,
                          padding: 2
                        }}>
                          {day ? (
                            <TouchableOpacity
                              onPress={() => {
                                if (!isDragging) {
                                  toggleDateSelection(day);
                                }
                              }}
                              style={{
                                flex: 1,
                                justifyContent: 'center',
                                alignItems: 'center',
                                borderRadius: 24,
                                backgroundColor: isDateSelected(day) 
                                  ? '#0C92F2' 
                                  : isDateInDragRange(day)
                                  ? 'rgba(12, 146, 242, 0.3)'
                                  : '#F5F5F5',
                                minHeight: 48,
                                minWidth: 48
                              }}
                            >
                              <Text style={{
                                color: isDateSelected(day) 
                                  ? '#FFFFFF'
                                  : '#111518',
                                fontSize: 14,
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
                );
              };

              // Calculate next month
              const nextMonth = new Date(currentDate);
              nextMonth.setMonth(nextMonth.getMonth() + 1);

              return (
                <>
                  {/* First Month (Current) */}
                  {renderCalendarMonth(currentDate)}
                  
                  {/* Second Month (Next) */}
                  {renderCalendarMonth(nextMonth)}
                </>
              );
            })()}
          </View>
        </ScrollView>
      </TouchableOpacity>
      
      {/* Floating Search Button - Only show when dates are manually selected */}
      {selectedDates.length > 0 && (
        <View style={{
          position: 'absolute',
          bottom: 85, // Position above the bottom navigation bar
          left: 0,
          right: 0,
          backgroundColor: '#FFFFFF',
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 24,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
          elevation: 12,
          zIndex: 1000, // Ensure it's above other elements
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB'
        }}>
          {/* Selected dates display */}
          <View style={{
            marginBottom: 12,
            alignItems: 'center'
          }}>
            <Text style={{
              color: '#6B7280',
              fontSize: 14,
              fontWeight: '500',
              marginBottom: 4
            }}>
              Selected: {formatSelectedDates()}
            </Text>
          </View>
          
          {/* Search button */}
          <TouchableOpacity
            style={{
              backgroundColor: beltColor.primary,
              padding: 20,
              borderRadius: 16,
              alignItems: 'center',
              shadowColor: beltColor.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 6,
              minHeight: 60
            }}
            onPress={handleCalendarSearch}
          >
            <Text style={{
              color: beltColor.textOnColor || '#FFFFFF',
              textAlign: 'center',
              fontWeight: 'bold',
              fontSize: 18
            }}>
              🔍 Search Open Mats
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

export default TimeSelectionScreen; 