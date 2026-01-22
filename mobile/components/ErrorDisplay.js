// Error Display Component - Modern Design
import React, { useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import {
  colors,
  spacing,
  borderRadius,
  fontSize,
  fontWeight,
} from '../constants/theme';
import { AppError, ErrorCategory } from '../utils';

// Get icon for error category
function getErrorConfig(category) {
  switch (category) {
    case ErrorCategory.NETWORK:
      return { icon: 'cloud-offline-outline', color: colors.error };
    case ErrorCategory.TIMEOUT:
      return { icon: 'time-outline', color: colors.warning };
    case ErrorCategory.SERVER:
      return { icon: 'server-outline', color: colors.error };
    case ErrorCategory.WEBSOCKET:
      return { icon: 'pulse-outline', color: colors.error };
    case ErrorCategory.STORAGE:
      return { icon: 'save-outline', color: colors.warning };
    default:
      return { icon: 'alert-circle-outline', color: colors.error };
  }
}

// Animated retry button
function RetryButton({ onPress, label = 'Try Again' }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.95, useNativeDriver: true }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          style={styles.retryButton}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name="refresh-outline" size={18} color={colors.white} />
          <Text style={styles.retryText}>{label}</Text>
        </LinearGradient>
      </Animated.View>
    </TouchableOpacity>
  );
}

export function ErrorDisplay({
  error,
  onRetry,
  onDismiss,
  compact = false,
  style,
}) {
  if (!error) return null;

  // Extract display info from error
  const displayInfo = error instanceof AppError
    ? error.getDisplayInfo()
    : {
        title: 'Error',
        message: error.message || 'Something went wrong',
        retryable: true,
        category: ErrorCategory.UNKNOWN,
      };

  const errorConfig = getErrorConfig(displayInfo.category);
  const canRetry = displayInfo.retryable && onRetry;

  // Compact mode: inline banner
  if (compact) {
    return (
      <View style={[styles.compactContainer, style]}>
        <View style={styles.compactContent}>
          <View style={[styles.compactIcon, { backgroundColor: errorConfig.color + '20' }]}>
            <Ionicons name={errorConfig.icon} size={16} color={errorConfig.color} />
          </View>
          <Text style={styles.compactMessage} numberOfLines={1}>
            {displayInfo.message}
          </Text>
        </View>
        <View style={styles.compactActions}>
          {canRetry && (
            <TouchableOpacity onPress={onRetry} style={styles.compactRetryButton}>
              <Text style={styles.compactRetryText}>Retry</Text>
            </TouchableOpacity>
          )}
          {onDismiss && (
            <TouchableOpacity onPress={onDismiss} style={styles.compactDismissButton}>
              <Ionicons name="close" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  // Full mode: centered card with glass effect
  return (
    <View style={[styles.fullContainer, style]}>
      <View style={styles.fullCard}>
        {/* Icon with glow effect */}
        <View style={styles.iconWrapper}>
          <View style={[styles.iconGlow, { backgroundColor: errorConfig.color + '15' }]} />
          <View style={[styles.fullIcon, { backgroundColor: errorConfig.color + '20' }]}>
            <Ionicons name={errorConfig.icon} size={32} color={errorConfig.color} />
          </View>
        </View>

        {/* Title & Message */}
        <Text style={styles.fullTitle}>{displayInfo.title}</Text>
        <Text style={styles.fullMessage}>{displayInfo.message}</Text>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          {canRetry && (
            <RetryButton onPress={onRetry} label="Try Again" />
          )}
          {onDismiss && (
            <TouchableOpacity onPress={onDismiss} style={styles.dismissButton}>
              <Text style={styles.dismissText}>Dismiss</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Compact mode styles
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderLeftWidth: 3,
    borderLeftColor: colors.error,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginHorizontal: spacing.md,
    marginVertical: spacing.xs,
    borderRadius: borderRadius.lg,
  },
  compactContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  compactMessage: {
    flex: 1,
    color: colors.text,
    fontSize: fontSize.sm,
  },
  compactActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: spacing.sm,
    gap: spacing.xs,
  },
  compactRetryButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.primaryMuted,
    borderRadius: borderRadius.md,
  },
  compactRetryText: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  compactDismissButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.glass,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Full mode styles
  fullContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.xl,
  },
  fullCard: {
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: borderRadius.xxl,
    padding: spacing.xl,
    alignItems: 'center',
    maxWidth: 320,
    width: '100%',
  },
  iconWrapper: {
    position: 'relative',
    marginBottom: spacing.lg,
  },
  iconGlow: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    top: -14,
    left: -14,
  },
  fullIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullTitle: {
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  fullMessage: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: fontSize.md * 1.5,
  },
  actionsContainer: {
    width: '100%',
    gap: spacing.sm,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.xl,
    gap: spacing.sm,
  },
  retryText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  dismissButton: {
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  dismissText: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
  },
});

export default ErrorDisplay;
