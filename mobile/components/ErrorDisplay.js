// Error Display Component
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../constants/theme';
import { AppError, ErrorCategory } from '../utils';

// Get icon for error category
function getErrorIcon(category) {
  switch (category) {
    case ErrorCategory.NETWORK:
      return '!';
    case ErrorCategory.TIMEOUT:
      return '!';
    case ErrorCategory.SERVER:
      return '!';
    case ErrorCategory.WEBSOCKET:
      return '!';
    case ErrorCategory.STORAGE:
      return '!';
    default:
      return '!';
  }
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

  const icon = getErrorIcon(displayInfo.category);
  const canRetry = displayInfo.retryable && onRetry;

  // Compact mode: inline banner
  if (compact) {
    return (
      <View style={[styles.compactContainer, style]}>
        <View style={styles.compactContent}>
          <View style={styles.compactIcon}>
            <Text style={styles.compactIconText}>{icon}</Text>
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
              <Text style={styles.compactDismissText}>X</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  // Full mode: centered card
  return (
    <View style={[styles.fullContainer, style]}>
      <View style={styles.fullCard}>
        <View style={styles.fullIcon}>
          <Text style={styles.fullIconText}>{icon}</Text>
        </View>
        <Text style={styles.fullTitle}>{displayInfo.title}</Text>
        <Text style={styles.fullMessage}>{displayInfo.message}</Text>
        {canRetry && (
          <TouchableOpacity onPress={onRetry} style={styles.fullRetryButton}>
            <Text style={styles.fullRetryText}>Try Again</Text>
          </TouchableOpacity>
        )}
        {onDismiss && !canRetry && (
          <TouchableOpacity onPress={onDismiss} style={styles.fullDismissButton}>
            <Text style={styles.fullDismissText}>Dismiss</Text>
          </TouchableOpacity>
        )}
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
    backgroundColor: colors.error + '20',
    borderLeftWidth: 3,
    borderLeftColor: colors.error,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginHorizontal: spacing.md,
    marginVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  compactContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  compactIconText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: fontWeight.bold,
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
  },
  compactRetryButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  compactRetryText: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  compactDismissButton: {
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
    marginLeft: spacing.xs,
  },
  compactDismissText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
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
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    maxWidth: 300,
    width: '100%',
  },
  fullIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.error + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  fullIconText: {
    color: colors.error,
    fontSize: 24,
    fontWeight: fontWeight.bold,
  },
  fullTitle: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  fullMessage: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
  fullRetryButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
    minWidth: 120,
  },
  fullRetryText: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    textAlign: 'center',
  },
  fullDismissButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
  },
  fullDismissText: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    textAlign: 'center',
  },
});

export default ErrorDisplay;
