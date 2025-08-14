/**
 * Centralized logging utility for the JiuJitsu Finder app
 * Provides consistent logging with development/production environment awareness
 */

type LogData = unknown;

/**
 * Debug logging - only shown in development
 */
export const debug = (message: string, data?: LogData): void => {
  if (__DEV__) {
    console.log(`🔍 ${message}`, data || '');
  }
};

/**
 * Info logging - only shown in development
 */
export const info = (message: string, data?: LogData): void => {
  if (__DEV__) {
    console.log(`ℹ️ ${message}`, data || '');
  }
};

/**
 * Success logging - only shown in development
 */
export const success = (message: string, data?: LogData): void => {
  if (__DEV__) {
    console.log(`✅ ${message}`, data || '');
  }
};

/**
 * Warning logging - only shown in development
 */
export const warn = (message: string, data?: LogData): void => {
  if (__DEV__) {
    console.warn(`⚠️ ${message}`, data || '');
  }
};

/**
 * Error logging - always shown (both development and production)
 */
export const error = (message: string, error?: unknown): void => {
  console.error(`❌ ${message}`, error || '');
};

/**
 * Loading/refresh logging - only shown in development
 */
export const loading = (message: string, data?: LogData): void => {
  if (__DEV__) {
    console.log(`🔄 ${message}`, data || '');
  }
};

/**
 * Search-related logging - only shown in development
 */
export const search = (message: string, data?: LogData): void => {
  if (__DEV__) {
    console.log(`🔍 ${message}`, data || '');
  }
};

/**
 * Location-related logging - only shown in development
 */
export const location = (message: string, data?: LogData): void => {
  if (__DEV__) {
    console.log(`📍 ${message}`, data || '');
  }
};

/**
 * Date/time-related logging - only shown in development
 */
export const dateTime = (message: string, data?: LogData): void => {
  if (__DEV__) {
    console.log(`📅 ${message}`, data || '');
  }
};

/**
 * Key/parameter logging - only shown in development
 */
export const key = (message: string, data?: LogData): void => {
  if (__DEV__) {
    console.log(`🔑 ${message}`, data || '');
  }
};

/**
 * Data/statistics logging - only shown in development
 */
export const data = (message: string, data?: LogData): void => {
  if (__DEV__) {
    console.log(`📊 ${message}`, data || '');
  }
};

/**
 * Grouping/combining logging - only shown in development
 */
export const group = (message: string, data?: LogData): void => {
  if (__DEV__) {
    console.log(`🔄 ${message}`, data || '');
  }
};

/**
 * Adding/creation logging - only shown in development
 */
export const add = (message: string, data?: LogData): void => {
  if (__DEV__) {
    console.log(`➕ ${message}`, data || '');
  }
};

/**
 * Filtering logging - only shown in development
 */
export const filter = (message: string, data?: LogData): void => {
  if (__DEV__) {
    console.log(`🔍 ${message}`, data || '');
  }
};

/**
 * Sorting logging - only shown in development
 */
export const sort = (message: string, data?: LogData): void => {
  if (__DEV__) {
    console.log(`📅 ${message}`, data || '');
  }
};

/**
 * Share-related logging - only shown in development
 */
export const share = (message: string, data?: LogData): void => {
  if (__DEV__) {
    console.log(`📤 ${message}`, data || '');
  }
};

/**
 * Capture/image logging - only shown in development
 */
export const capture = (message: string, data?: LogData): void => {
  if (__DEV__) {
    console.log(`📸 ${message}`, data || '');
  }
};

/**
 * Render/component logging - only shown in development
 */
export const render = (message: string, data?: LogData): void => {
  if (__DEV__) {
    console.log(`🎨 ${message}`, data || '');
  }
};

/**
 * Search input logging - only shown in development
 */
export const searchInput = (message: string, data?: LogData): void => {
  if (__DEV__) {
    console.log(`🎯 ${message}`, data || '');
  }
};

/**
 * State change logging - only shown in development
 */
export const state = (message: string, data?: LogData): void => {
  if (__DEV__) {
    console.log(`🔄 ${message}`, data || '');
  }
};

/**
 * UI visibility logging - only shown in development
 */
export const visibility = (message: string, data?: LogData): void => {
  if (__DEV__) {
    console.log(`👁️ ${message}`, data || '');
  }
};

/**
 * Navigation logging - only shown in development
 */
export const navigation = (message: string, data?: LogData): void => {
  if (__DEV__) {
    console.log(`🧭 ${message}`, data || '');
  }
};

/**
 * Text input logging - only shown in development
 */
export const textInput = (message: string, data?: LogData): void => {
  if (__DEV__) {
    console.log(`📝 ${message}`, data || '');
  }
};

/**
 * Clear/delete logging - only shown in development
 */
export const clear = (message: string, data?: LogData): void => {
  if (__DEV__) {
    console.log(`🗑️ ${message}`, data || '');
  }
};

/**
 * Start/beginning logging - only shown in development
 */
export const start = (message: string, data?: LogData): void => {
  if (__DEV__) {
    console.log(`🚀 ${message}`, data || '');
  }
};

/**
 * Finish/complete logging - only shown in development
 */
export const finish = (message: string, data?: LogData): void => {
  if (__DEV__) {
    console.log(`🏁 ${message}`, data || '');
  }
};

/**
 * Force/override logging - only shown in development
 */
export const force = (message: string, data?: LogData): void => {
  if (__DEV__) {
    console.log(`🔄 ${message}`, data || '');
  }
};

/**
 * Cache-related logging - only shown in development
 */
export const cache = (message: string, data?: LogData): void => {
  if (__DEV__) {
    console.log(`💾 ${message}`, data || '');
  }
};

/**
 * Rate limit logging - only shown in development
 */
export const rateLimit = (message: string, data?: LogData): void => {
  if (__DEV__) {
    console.log(`⚠️ ${message}`, data || '');
  }
};

/**
 * Main logger object with all logging methods
 */
export const logger = {
  debug,
  info,
  success,
  warn,
  error,
  loading,
  search,
  location,
  dateTime,
  key,
  data,
  group,
  add,
  filter,
  sort,
  share,
  capture,
  render,
  searchInput,
  state,
  visibility,
  navigation,
  textInput,
  clear,
  start,
  finish,
  force,
  cache,
  rateLimit,
};
