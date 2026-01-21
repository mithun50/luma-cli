// Settings Modal Component
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../constants/theme';
import { config } from '../constants/config';

export function SettingsModal({
  visible,
  onClose,
  mode,
  model,
  onModeChange,
  onModelChange,
  onDisconnect,
  serverUrl,
}) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {/* Connection Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Connection</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Server</Text>
              <Text style={styles.infoValue} numberOfLines={1}>{serverUrl || 'Not connected'}</Text>
            </View>
          </View>

          {/* Mode Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mode</Text>
            <View style={styles.optionsRow}>
              {config.modes.map((m) => (
                <TouchableOpacity
                  key={m}
                  style={[
                    styles.optionButton,
                    mode === m && styles.optionButtonActive,
                    mode === m && (m === 'Fast' ? styles.fastActive : styles.planningActive),
                  ]}
                  onPress={() => onModeChange(m)}
                >
                  <Ionicons
                    name={m === 'Fast' ? 'flash' : 'bulb'}
                    size={20}
                    color={mode === m ? colors.text : colors.textSecondary}
                  />
                  <Text style={[
                    styles.optionText,
                    mode === m && styles.optionTextActive
                  ]}>
                    {m}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Model Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Model</Text>
            {config.models.map((m) => (
              <TouchableOpacity
                key={m}
                style={[
                  styles.modelButton,
                  model?.includes(m.split(' ')[0]) && styles.modelButtonActive,
                ]}
                onPress={() => onModelChange(m)}
              >
                <Text style={[
                  styles.modelText,
                  model?.includes(m.split(' ')[0]) && styles.modelTextActive
                ]}>
                  {m}
                </Text>
                {model?.includes(m.split(' ')[0]) && (
                  <Ionicons name="checkmark" size={20} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Disconnect */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.disconnectButton}
              onPress={onDisconnect}
            >
              <Ionicons name="log-out-outline" size={20} color={colors.error} />
              <Text style={styles.disconnectText}>Disconnect</Text>
            </TouchableOpacity>
          </View>

          {/* App Info */}
          <View style={[styles.section, styles.infoSection]}>
            <Text style={styles.infoTitle}>Luma Mobile</Text>
            <Text style={styles.infoVersion}>Version 1.0.0</Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  closeButton: {
    padding: spacing.xs,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    textTransform: 'uppercase',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    color: colors.text,
    fontSize: fontSize.md,
  },
  infoValue: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    flex: 1,
    textAlign: 'right',
    marginLeft: spacing.md,
  },
  optionsRow: {
    flexDirection: 'row',
  },
  optionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    marginRight: spacing.sm,
  },
  optionButtonActive: {
    borderWidth: 2,
  },
  fastActive: {
    borderColor: colors.modeFast,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  planningActive: {
    borderColor: colors.modePlanning,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
  },
  optionText: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    marginLeft: spacing.xs,
  },
  optionTextActive: {
    color: colors.text,
  },
  modelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
  },
  modelButtonActive: {
    borderWidth: 1,
    borderColor: colors.primary,
  },
  modelText: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
  },
  modelTextActive: {
    color: colors.text,
    fontWeight: fontWeight.medium,
  },
  disconnectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
  },
  disconnectText: {
    color: colors.error,
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    marginLeft: spacing.sm,
  },
  infoSection: {
    alignItems: 'center',
    borderBottomWidth: 0,
  },
  infoTitle: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
  },
  infoVersion: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
  },
});

export default SettingsModal;
