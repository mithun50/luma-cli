// Header Component
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, fontWeight } from '../constants/theme';

export function Header({
  title = 'Luma',
  isConnected = false,
  mode = 'Unknown',
  model = 'Unknown',
  onSettingsPress,
  onRefreshPress,
}) {
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <Text style={styles.title}>{title}</Text>
        <View style={[styles.statusDot, isConnected ? styles.connected : styles.disconnected]} />
      </View>

      <View style={styles.center}>
        <View style={styles.modeContainer}>
          <Text style={[
            styles.modeText,
            mode === 'Fast' ? styles.modeFast : styles.modePlanning
          ]}>
            {mode}
          </Text>
        </View>
        <Text style={styles.modelText} numberOfLines={1}>
          {model}
        </Text>
      </View>

      <View style={styles.right}>
        {onRefreshPress && (
          <TouchableOpacity onPress={onRefreshPress} style={styles.iconButton}>
            <Ionicons name="refresh" size={22} color={colors.text} />
          </TouchableOpacity>
        )}
        {onSettingsPress && (
          <TouchableOpacity onPress={onSettingsPress} style={styles.iconButton}>
            <Ionicons name="settings-outline" size={22} color={colors.text} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.backgroundSecondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: spacing.sm,
  },
  connected: {
    backgroundColor: colors.success,
  },
  disconnected: {
    backgroundColor: colors.error,
  },
  center: {
    flex: 2,
    alignItems: 'center',
  },
  modeContainer: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  modeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
  modeFast: {
    color: colors.modeFast,
  },
  modePlanning: {
    color: colors.modePlanning,
  },
  modelText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
  },
  iconButton: {
    padding: spacing.xs,
    marginLeft: spacing.xs,
  },
});

export default Header;
