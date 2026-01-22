// Notification Banner - Modern Toast Design
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Animated,
  StyleSheet,
  TouchableOpacity,
  Vibration,
  PanResponder,
  Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import {
  colors,
  spacing,
  borderRadius,
  fontSize,
  fontWeight,
} from '../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Toast type configurations
const toastConfigs = {
  success: {
    icon: 'checkmark-circle',
    color: colors.success,
    bgColor: colors.successMuted,
    gradient: ['rgba(52, 211, 153, 0.2)', 'rgba(52, 211, 153, 0.05)'],
  },
  error: {
    icon: 'alert-circle',
    color: colors.error,
    bgColor: colors.errorMuted,
    gradient: ['rgba(248, 113, 113, 0.2)', 'rgba(248, 113, 113, 0.05)'],
  },
  warning: {
    icon: 'warning',
    color: colors.warning,
    bgColor: colors.warningMuted,
    gradient: ['rgba(251, 191, 36, 0.2)', 'rgba(251, 191, 36, 0.05)'],
  },
  info: {
    icon: 'information-circle',
    color: colors.info,
    bgColor: colors.infoMuted,
    gradient: ['rgba(96, 165, 250, 0.2)', 'rgba(96, 165, 250, 0.05)'],
  },
};

// Progress bar for auto-dismiss
function ProgressBar({ duration, color, onComplete }) {
  const progressAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (duration > 0) {
      Animated.timing(progressAnim, {
        toValue: 0,
        duration: duration,
        useNativeDriver: false,
      }).start(() => {
        if (onComplete) onComplete();
      });
    }
  }, [duration]);

  if (duration <= 0) return null;

  return (
    <View style={styles.progressContainer}>
      <Animated.View
        style={[
          styles.progressBar,
          {
            backgroundColor: color,
            width: progressAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', '100%'],
            }),
          },
        ]}
      />
    </View>
  );
}

export function NotificationBanner({
  visible,
  title,
  message,
  type = 'info',
  duration = 4000,
  onDismiss,
  vibrate = true,
}) {
  const translateY = useRef(new Animated.Value(-100)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.9)).current;
  const isDismissing = useRef(false);

  const config = toastConfigs[type] || toastConfigs.info;

  // Pan responder for swipe to dismiss
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 10 || gestureState.dy < -10;
      },
      onPanResponderMove: (_, gestureState) => {
        // Allow horizontal swipe or upward swipe
        if (gestureState.dy < 0) {
          translateY.setValue(gestureState.dy);
        }
        translateX.setValue(gestureState.dx);
      },
      onPanResponderRelease: (_, gestureState) => {
        const shouldDismiss =
          gestureState.dy < -50 ||
          Math.abs(gestureState.dx) > SCREEN_WIDTH * 0.3 ||
          Math.abs(gestureState.vx) > 0.5 ||
          gestureState.vy < -0.5;

        if (shouldDismiss) {
          handleDismiss(gestureState.dx > 0 ? 'right' : gestureState.dy < 0 ? 'up' : 'left');
        } else {
          // Snap back
          Animated.parallel([
            Animated.spring(translateY, {
              toValue: 0,
              useNativeDriver: true,
              tension: 100,
              friction: 8,
            }),
            Animated.spring(translateX, {
              toValue: 0,
              useNativeDriver: true,
              tension: 100,
              friction: 8,
            }),
          ]).start();
        }
      },
    })
  ).current;

  useEffect(() => {
    if (visible && !isDismissing.current) {
      // Reset values
      translateY.setValue(-100);
      translateX.setValue(0);
      opacity.setValue(0);
      scale.setValue(0.9);

      // Vibrate
      if (vibrate) {
        Vibration.vibrate([0, 80]);
      }

      // Animate in
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 80,
          friction: 10,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          tension: 80,
          friction: 8,
        }),
      ]).start();

      isDismissing.current = false;
    }
  }, [visible]);

  const handleDismiss = (direction = 'up') => {
    if (isDismissing.current) return;
    isDismissing.current = true;

    const animations = [
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 0.9,
        useNativeDriver: true,
      }),
    ];

    if (direction === 'up') {
      animations.push(
        Animated.timing(translateY, {
          toValue: -150,
          duration: 200,
          useNativeDriver: true,
        })
      );
    } else {
      animations.push(
        Animated.timing(translateX, {
          toValue: direction === 'right' ? SCREEN_WIDTH : -SCREEN_WIDTH,
          duration: 200,
          useNativeDriver: true,
        })
      );
    }

    Animated.parallel(animations).start(() => {
      isDismissing.current = false;
      if (onDismiss) onDismiss();
    });
  };

  const handleProgressComplete = () => {
    if (onDismiss && !isDismissing.current) {
      handleDismiss('up');
    }
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            { translateY },
            { translateX },
            { scale },
          ],
          opacity,
        },
      ]}
      {...panResponder.panHandlers}
    >
      <BlurView intensity={30} tint="dark" style={styles.blurContainer}>
        <View style={[styles.content, { borderLeftColor: config.color }]}>
          {/* Icon */}
          <View style={[styles.iconContainer, { backgroundColor: config.bgColor }]}>
            <Ionicons name={config.icon} size={22} color={config.color} />
          </View>

          {/* Text Content */}
          <View style={styles.textContainer}>
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
            {message && (
              <Text style={styles.message} numberOfLines={2}>
                {message}
              </Text>
            )}
          </View>

          {/* Close Button */}
          {onDismiss && (
            <TouchableOpacity
              onPress={() => handleDismiss('up')}
              style={styles.closeButton}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Progress bar */}
        <ProgressBar
          duration={duration}
          color={config.color}
          onComplete={handleProgressComplete}
        />
      </BlurView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: spacing.md,
    right: spacing.md,
    zIndex: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  blurContainer: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    backgroundColor: 'rgba(20, 20, 20, 0.85)',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderLeftWidth: 3,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    marginLeft: spacing.sm,
    marginRight: spacing.xs,
  },
  title: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  message: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: fontSize.sm * 1.4,
  },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.glass,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    height: 2,
    backgroundColor: colors.glass,
  },
  progressBar: {
    height: '100%',
  },
});

export default NotificationBanner;
