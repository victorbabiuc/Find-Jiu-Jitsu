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
    primary: '#475569',
    secondary: '#64748B',
    accent: '#0F172A',
    surface: '#47556915',
    gradient: 'linear-gradient(135deg, #475569 0%, #0F172A 100%)',
    cardGradient: 'linear-gradient(135deg, #475569 0%, #64748B 100%)',
    textOnColor: '#FFFFFF'
  },
  purple: {
    primary: '#475569',
    secondary: '#64748B',
    accent: '#0F172A',
    surface: '#47556915',
    gradient: 'linear-gradient(135deg, #475569 0%, #0F172A 100%)',
    cardGradient: 'linear-gradient(135deg, #475569 0%, #64748B 100%)',
    textOnColor: '#FFFFFF'
  },
  brown: {
    primary: '#475569',
    secondary: '#64748B',
    accent: '#0F172A',
    surface: '#47556915',
    gradient: 'linear-gradient(135deg, #475569 0%, #0F172A 100%)',
    cardGradient: 'linear-gradient(135deg, #475569 0%, #64748B 100%)',
    textOnColor: '#FFFFFF'
  },
  black: {
    primary: '#475569',
    secondary: '#64748B',
    accent: '#0F172A',
    surface: '#47556915',
    gradient: 'linear-gradient(135deg, #475569 0%, #0F172A 100%)',
    cardGradient: 'linear-gradient(135deg, #475569 0%, #64748B 100%)',
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