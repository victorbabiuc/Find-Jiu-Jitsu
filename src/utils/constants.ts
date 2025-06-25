import { BeltType } from '../types';

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
    primary: '#3B82F6',
    secondary: '#60A5FA',
    accent: '#2563EB',
    surface: '#3B82F615',
    gradient: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
    cardGradient: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)',
    textOnColor: '#FFFFFF'
  },
  purple: {
    primary: '#A855F7',
    secondary: '#C084FC',
    accent: '#9333EA',
    surface: '#A855F715',
    gradient: 'linear-gradient(135deg, #A855F7 0%, #9333EA 100%)',
    cardGradient: 'linear-gradient(135deg, #A855F7 0%, #C084FC 100%)',
    textOnColor: '#FFFFFF'
  },
  brown: {
    primary: '#D97706',
    secondary: '#F59E0B',
    accent: '#B45309',
    surface: '#D9770615',
    gradient: 'linear-gradient(135deg, #D97706 0%, #B45309 100%)',
    cardGradient: 'linear-gradient(135deg, #D97706 0%, #F59E0B 100%)',
    textOnColor: '#FFFFFF'
  },
  black: {
    primary: '#525252',
    secondary: '#737373',
    accent: '#404040',
    surface: '#52525215',
    gradient: 'linear-gradient(135deg, #525252 0%, #171717 100%)',
    cardGradient: 'linear-gradient(135deg, #525252 0%, #737373 100%)',
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