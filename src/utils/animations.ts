import { Animated, Easing } from 'react-native';

/**
 * Animation utility service
 * Provides common animation patterns and configurations
 */

export const animations = {
  /**
   * Fade in animation
   * @param value - Animated.Value
   * @param duration - Animation duration in ms
   * @param delay - Delay before animation starts in ms
   */
  fadeIn: (value: Animated.Value, duration: number = 300, delay: number = 0) => {
    return Animated.timing(value, {
      toValue: 1,
      duration,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
  },

  /**
   * Fade out animation
   * @param value - Animated.Value
   * @param duration - Animation duration in ms
   */
  fadeOut: (value: Animated.Value, duration: number = 300) => {
    return Animated.timing(value, {
      toValue: 0,
      duration,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    });
  },

  /**
   * Slide up animation
   * @param value - Animated.Value
   * @param distance - Distance to slide in pixels
   * @param duration - Animation duration in ms
   * @param delay - Delay before animation starts in ms
   */
  slideUp: (value: Animated.Value, distance: number = 50, duration: number = 300, delay: number = 0) => {
    return Animated.timing(value, {
      toValue: 0,
      duration,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
  },

  /**
   * Slide down animation
   * @param value - Animated.Value
   * @param distance - Distance to slide in pixels
   * @param duration - Animation duration in ms
   */
  slideDown: (value: Animated.Value, distance: number = 50, duration: number = 300) => {
    return Animated.timing(value, {
      toValue: distance,
      duration,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    });
  },

  /**
   * Scale animation
   * @param value - Animated.Value
   * @param toValue - Target scale value
   * @param duration - Animation duration in ms
   * @param delay - Delay before animation starts in ms
   */
  scale: (value: Animated.Value, toValue: number = 1, duration: number = 300, delay: number = 0) => {
    return Animated.timing(value, {
      toValue,
      duration,
      delay,
      easing: Easing.out(Easing.back(1.2)),
      useNativeDriver: true,
    });
  },

  /**
   * Bounce animation
   * @param value - Animated.Value
   * @param duration - Animation duration in ms
   */
  bounce: (value: Animated.Value, duration: number = 300) => {
    return Animated.sequence([
      Animated.timing(value, {
        toValue: 1.1,
        duration: duration * 0.3,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(value, {
        toValue: 1,
        duration: duration * 0.7,
        easing: Easing.out(Easing.back(1.2)),
        useNativeDriver: true,
      }),
    ]);
  },

  /**
   * Pulse animation
   * @param value - Animated.Value
   * @param duration - Animation duration in ms
   */
  pulse: (value: Animated.Value, duration: number = 1000) => {
    return Animated.loop(
      Animated.sequence([
        Animated.timing(value, {
          toValue: 1.05,
          duration: duration / 2,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(value, {
          toValue: 1,
          duration: duration / 2,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
      ])
    );
  },

  /**
   * Stagger animation for multiple items
   * @param values - Array of Animated.Values
   * @param animation - Animation function to apply
   * @param staggerDelay - Delay between each item in ms
   */
  stagger: (values: Animated.Value[], animation: (value: Animated.Value, index: number) => Animated.CompositeAnimation, staggerDelay: number = 50) => {
    return Animated.stagger(staggerDelay, values.map((value, index) => animation(value, index)));
  },

  /**
   * Parallel animation for multiple animations
   * @param animations - Array of animations to run in parallel
   */
  parallel: (animations: Animated.CompositeAnimation[]) => {
    return Animated.parallel(animations);
  },

  /**
   * Sequence animation for multiple animations
   * @param animations - Array of animations to run in sequence
   */
  sequence: (animations: Animated.CompositeAnimation[]) => {
    return Animated.sequence(animations);
  },
};

/**
 * Common animation configurations
 */
export const animationConfigs = {
  fast: { duration: 200, easing: Easing.out(Easing.cubic) },
  normal: { duration: 300, easing: Easing.out(Easing.cubic) },
  slow: { duration: 500, easing: Easing.out(Easing.cubic) },
  bouncy: { duration: 400, easing: Easing.out(Easing.back(1.2)) },
  smooth: { duration: 600, easing: Easing.inOut(Easing.cubic) },
};

export default animations; 