import { BeltType } from '../types';

// Selection color for UI elements (buttons, tabs, etc.) - matches active filter buttons
export const selectionColor = '#374151'; // Subtle gray for selections

export const beltColors: Record<BeltType, {
  primary: string;
  secondary: string;
  accent: string;
  surface: string;
  gradient: string;
  cardGradient: string;
  textOnColor: string;
}> = {
  white: {
    primary: '#F8F9FA',
    secondary: '#E9ECEF',
    accent: '#DEE2E6',
    surface: '#F8F9FA15',
    gradient: 'linear-gradient(135deg, #F8F9FA 0%, #E9ECEF 100%)',
    cardGradient: 'linear-gradient(135deg, #FFFFFF 0%, #F8F9FA 100%)',
    textOnColor: '#000000'
  },
  blue: {
    primary: '#60A5FA', // Brighter blue
    secondary: '#3B82F6',
    accent: '#1D4ED8',
    surface: '#2563EB15',
    gradient: 'linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%)',
    cardGradient: 'linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%)',
    textOnColor: '#FFFFFF'
  },
  purple: {
    primary: '#A78BFA', // Brighter purple
    secondary: '#8B5CF6',
    accent: '#4C1D95',
    surface: '#7C3AED15',
    gradient: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)',
    cardGradient: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)',
    textOnColor: '#FFFFFF'
  },
  brown: {
    primary: '#F59E0B', // Brighter brown/orange
    secondary: '#FBBF24',
    accent: '#92400E',
    surface: '#D9770615',
    gradient: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
    cardGradient: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
    textOnColor: '#FFFFFF'
  },
  black: {
    primary: '#374151', // Brighter black/gray
    secondary: '#6B7280',
    accent: '#000000',
    surface: '#11182715',
    gradient: 'linear-gradient(135deg, #374151 0%, #6B7280 100%)',
    cardGradient: 'linear-gradient(135deg, #374151 0%, #6B7280 100%)',
    textOnColor: '#FFFFFF'
  }
};

export const loadingMessages = [
  "Rolling into action!",
  "Finding your training partners...",
  "Scanning the mats...",
  "Preparing for battle...",
  "Getting your gi ready...",
  "Warming up the mats..."
];

export const quickDateOptions = [
  { label: 'Today', value: 0 },
  { label: 'Tomorrow', value: 1 },
  { label: 'This Week', value: 7 },
  { label: 'This Weekend', value: 'weekend' }
];

export const timeOfDayOptions = [
  { label: 'Morning', value: 'morning', time: '6am - 12pm' },
  { label: 'Afternoon', value: 'afternoon', time: '12pm - 5pm' },
  { label: 'Evening', value: 'evening', time: '5pm - 10pm' },
  { label: 'Any Time', value: 'any', time: 'All day' }
];