import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { animations } from '../utils';

interface SkeletonCardProps {
  index?: number;
}

const SkeletonCard: React.FC<SkeletonCardProps> = ({ index = 0 }) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    // Stagger entrance animation based on index
    const entranceDelay = index * 100;
    
    // Start entrance animations
    animations.parallel([
      animations.fadeIn(fadeAnim, 400, entranceDelay),
      animations.scale(scaleAnim, 1, 400, entranceDelay),
    ]).start();

    // Start shimmer animation
    const shimmerAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: false,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: false,
        }),
      ])
    );
    
    shimmerAnimation.start();

    return () => {
      shimmerAnimation.stop();
    };
  }, [index]);

  const shimmerOpacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        }
      ]}
    >
      <View style={styles.card}>
        {/* Card Header */}
        <View style={styles.cardHeader}>
          <View style={styles.logoHeartContainer}>
            {/* Gym Logo Skeleton */}
            <Animated.View 
              style={[
                styles.skeletonLogo,
                { opacity: shimmerOpacity }
              ]} 
            />
            {/* Gym Name and Address */}
            <View style={styles.textContainer}>
              <Animated.View 
                style={[
                  styles.skeletonGymName,
                  { opacity: shimmerOpacity }
                ]} 
              />
              <Animated.View 
                style={[
                  styles.skeletonAddress,
                  { opacity: shimmerOpacity }
                ]} 
              />
            </View>
          </View>
          {/* Heart Button Skeleton */}
          <Animated.View 
            style={[
              styles.skeletonHeartButton,
              { opacity: shimmerOpacity }
            ]} 
          />
        </View>

        {/* Session Subtitle Skeleton */}
        <Animated.View 
          style={[
            styles.skeletonSubtitle,
            { opacity: shimmerOpacity }
          ]} 
        />

        {/* Sessions Section Skeleton */}
        <View style={styles.sessionsSection}>
          <View style={styles.sessionBlock}>
            <Animated.View 
              style={[
                styles.skeletonDayHeader,
                { opacity: shimmerOpacity }
              ]} 
            />
            <Animated.View 
              style={[
                styles.skeletonTimeRange,
                { opacity: shimmerOpacity }
              ]} 
            />
          </View>
          <View style={styles.sessionBlock}>
            <Animated.View 
              style={[
                styles.skeletonDayHeader,
                { opacity: shimmerOpacity }
              ]} 
            />
            <Animated.View 
              style={[
                styles.skeletonTimeRange,
                { opacity: shimmerOpacity }
              ]} 
            />
          </View>
        </View>

        {/* Fees Section Skeleton */}
        <View style={styles.feesSection}>
          <View style={styles.feesHeader}>
            <Animated.View 
              style={[
                styles.skeletonInfoIcon,
                { opacity: shimmerOpacity }
              ]} 
            />
            <Animated.View 
              style={[
                styles.skeletonInfoText,
                { opacity: shimmerOpacity }
              ]} 
            />
          </View>
          <View style={styles.feeItem}>
            <Animated.View 
              style={[
                styles.skeletonFeeLabel,
                { opacity: shimmerOpacity }
              ]} 
            />
            <Animated.View 
              style={[
                styles.skeletonFeeValue,
                { opacity: shimmerOpacity }
              ]} 
            />
          </View>
          <View style={styles.feeItem}>
            <Animated.View 
              style={[
                styles.skeletonFeeLabel,
                { opacity: shimmerOpacity }
              ]} 
            />
            <Animated.View 
              style={[
                styles.skeletonFeeValue,
                { opacity: shimmerOpacity }
              ]} 
            />
          </View>
        </View>

        {/* Action Buttons Skeleton */}
        <View style={styles.buttonRow}>
          <Animated.View 
            style={[
              styles.skeletonActionButton,
              { opacity: shimmerOpacity }
            ]} 
          />
          <Animated.View 
            style={[
              styles.skeletonActionButton,
              { opacity: shimmerOpacity }
            ]} 
          />
          <Animated.View 
            style={[
              styles.skeletonActionButton,
              { opacity: shimmerOpacity }
            ]} 
          />
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: '100%',
    maxWidth: 500,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  logoHeartContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  skeletonLogo: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E5E7EB',
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
  },
  skeletonGymName: {
    height: 20,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 4,
    width: '80%',
  },
  skeletonAddress: {
    height: 14,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    width: '60%',
  },
  skeletonHeartButton: {
    width: 32,
    height: 32,
    backgroundColor: '#E5E7EB',
    borderRadius: 16,
  },
  skeletonSubtitle: {
    height: 14,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 12,
    width: '40%',
  },
  sessionsSection: {
    marginBottom: 12,
  },
  sessionBlock: {
    marginBottom: 8,
  },
  skeletonDayHeader: {
    height: 16,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 2,
    width: '30%',
  },
  skeletonTimeRange: {
    height: 14,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 2,
    width: '70%',
  },
  feesSection: {
    marginBottom: 12,
  },
  feesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  skeletonInfoIcon: {
    width: 18,
    height: 18,
    backgroundColor: '#E5E7EB',
    borderRadius: 9,
    marginRight: 6,
  },
  skeletonInfoText: {
    height: 14,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    width: 40,
  },
  feeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 30,
    marginBottom: 4,
  },
  skeletonFeeLabel: {
    height: 13,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    width: 80,
    marginRight: 4,
  },
  skeletonFeeValue: {
    height: 13,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    width: 40,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  skeletonActionButton: {
    flex: 1,
    height: 36,
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
  },
});

export default SkeletonCard; 