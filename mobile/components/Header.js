// Header Component - Modern Minimal Design
import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import {
  colors,
  spacing,
  fontSize,
  fontWeight,
  borderRadius,
} from '../constants/theme';
import { ConnectionQuality } from '../services';

// Live indicator dot with pulse animation
function LiveIndicator({ isConnected, isGenerating }) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isGenerating) {
      const pulse = Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(pulseAnim, { toValue: 1.8, duration: 800, useNativeDriver: true }),
            Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
          ]),
          Animated.sequence([
            Animated.timing(opacityAnim, { toValue: 0.3, duration: 800, useNativeDriver: true }),
            Animated.timing(opacityAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
          ]),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
      opacityAnim.setValue(1);
    }
  }, [isGenerating]);

  const color = isConnected ? colors.success : colors.error;

  return (
    <View style={styles.liveIndicator}>
      {isGenerating && (
        <Animated.View
          style={[
            styles.livePulse,
            { backgroundColor: color, transform: [{ scale: pulseAnim }], opacity: opacityAnim },
          ]}
        />
      )}
      <View style={[styles.liveDot, { backgroundColor: color }]} />
    </View>
  );
}

// Connection quality bars
function QualityBars({ quality, latency }) {
  const getActiveBars = () => {
    switch (quality) {
      case ConnectionQuality.EXCELLENT: return 4;
      case ConnectionQuality.GOOD: return 3;
      case ConnectionQuality.FAIR: return 2;
      case ConnectionQuality.POOR: return 1;
      default: return 0;
    }
  };

  const activeBars = getActiveBars();
  const barColor = quality === ConnectionQuality.POOR ? colors.error :
                   quality === ConnectionQuality.FAIR ? colors.warning : colors.success;

  return (
    <View style={styles.qualityContainer}>
      <View style={styles.qualityBars}>
        {[1, 2, 3, 4].map((bar) => (
          <View
            key={bar}
            style={[
              styles.qualityBar,
              { height: 6 + bar * 3 },
              bar <= activeBars ? { backgroundColor: barColor } : { backgroundColor: colors.border },
            ]}
          />
        ))}
      </View>
      {latency !== null && (
        <Text style={styles.latencyText}>{latency}ms</Text>
      )}
    </View>
  );
}

// Mode badge component
function ModeBadge({ mode }) {
  const isFast = mode === 'Fast';

  return (
    <View style={[styles.modeBadge, isFast ? styles.modeFastBadge : styles.modePlanningBadge]}>
      <Ionicons
        name={isFast ? 'flash' : 'bulb-outline'}
        size={12}
        color={isFast ? colors.modeFast : colors.modePlanning}
      />
      <Text style={[styles.modeText, isFast ? styles.modeFastText : styles.modePlanningText]}>
        {mode}
      </Text>
    </View>
  );
}

export function Header({
  isConnected = false,
  isGenerating = false,
  connectionQuality = ConnectionQuality.UNKNOWN,
  latency = null,
  mode = 'Fast',
  model = 'Unknown',
  onSettingsPress,
}) {
  return (
    <View style={styles.container}>
      {/* Left Section - Logo & Status */}
      <View style={styles.leftSection}>
        <View style={styles.logoRow}>
          <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            style={styles.logoIcon}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="radio-outline" size={16} color={colors.white} />
          </LinearGradient>
          <Text style={styles.logoText}>Luma</Text>
          <LiveIndicator isConnected={isConnected} isGenerating={isGenerating} />
        </View>
      </View>

      {/* Center Section - Mode & Model */}
      <View style={styles.centerSection}>
        <ModeBadge mode={mode} />
        <Text style={styles.modelText} numberOfLines={1}>
          {model}
        </Text>
      </View>

      {/* Right Section - Quality & Settings */}
      <View style={styles.rightSection}>
        {isConnected && (
          <QualityBars quality={connectionQuality} latency={latency} />
        )}
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={onSettingsPress}
          activeOpacity={0.7}
        >
          <Ionicons name="ellipsis-horizontal" size={22} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
  },
  leftSection: {
    flex: 1,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginLeft: spacing.sm,
  },
  liveIndicator: {
    marginLeft: spacing.sm,
    width: 12,
    height: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  livePulse: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  centerSection: {
    flex: 1.5,
    alignItems: 'center',
  },
  modeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    gap: 4,
  },
  modeFastBadge: {
    backgroundColor: colors.modeFastBg,
    borderColor: 'rgba(125, 216, 145, 0.3)',
  },
  modePlanningBadge: {
    backgroundColor: colors.modePlanningBg,
    borderColor: 'rgba(200, 191, 255, 0.3)',
  },
  modeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
  modeFastText: {
    color: colors.modeFast,
  },
  modePlanningText: {
    color: colors.modePlanning,
  },
  modelText: {
    fontSize: fontSize.xxs,
    color: colors.textTertiary,
    marginTop: 2,
  },
  rightSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  qualityContainer: {
    alignItems: 'flex-end',
    marginRight: spacing.sm,
  },
  qualityBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 18,
    gap: 2,
  },
  qualityBar: {
    width: 3,
    borderRadius: 1,
  },
  latencyText: {
    fontSize: 9,
    color: colors.textMuted,
    marginTop: 2,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Header;
