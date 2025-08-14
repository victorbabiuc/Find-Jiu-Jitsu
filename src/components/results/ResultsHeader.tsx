import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Animated } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import appIcon from '../../../assets/icon.png';

interface ResultsHeaderProps {
  location: string;
  filteredGymsLength: number;
  dateSelection: string | null;
  headerAnim: Animated.Value;
  onNavigateHome: () => void;
  getGymCountText: (count: number, location: string) => string;
  getDateSelectionDisplay: (dateSelection: string) => string;
}

const ResultsHeader: React.FC<ResultsHeaderProps> = ({
  location,
  filteredGymsLength,
  dateSelection,
  headerAnim,
  onNavigateHome,
  getGymCountText,
  getDateSelectionDisplay,
}) => {
  const { theme } = useTheme();

  return (
    <Animated.View style={[styles.header, { opacity: headerAnim }]}>
      <TouchableOpacity onPress={onNavigateHome} activeOpacity={0.7}>
        <Image source={appIcon} style={styles.headerLogo} />
      </TouchableOpacity>
      <View style={styles.headerTextContainer}>
        <Text style={[styles.headerTitle, { color: theme.text.primary }]}>JiuJitsu Finder</Text>
        <Text style={styles.locationContext}>{getGymCountText(filteredGymsLength, location)}</Text>
        <Text style={[styles.headerSubtitle, { color: theme.text.secondary }]}>
          {dateSelection && `${getDateSelectionDisplay(dateSelection)}`}
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  locationContext: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '400',
  },
});

export default ResultsHeader;
