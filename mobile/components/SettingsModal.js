// Settings Modal - Modern Bottom Sheet Design with Workspace Management
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Animated,
  Dimensions,
  PanResponder,
  ActivityIndicator,
  Image,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import {
  colors,
  spacing,
  borderRadius,
  fontSize,
  fontWeight,
} from '../constants/theme';
import { config } from '../constants/config';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.85;

// Handle bar at top of sheet
function HandleBar() {
  return (
    <View style={styles.handleContainer}>
      <View style={styles.handle} />
    </View>
  );
}

// Section header
function SectionHeader({ title, icon }) {
  return (
    <View style={styles.sectionHeader}>
      <Ionicons name={icon} size={16} color={colors.primary} />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

// Glass card wrapper
function GlassCard({ children, style }) {
  return (
    <View style={[styles.glassCard, style]}>
      {children}
    </View>
  );
}

// Segmented control for mode
function ModeSelector({ mode, onModeChange }) {
  const animValue = useRef(new Animated.Value(mode === 'Fast' ? 0 : 1)).current;

  useEffect(() => {
    Animated.spring(animValue, {
      toValue: mode === 'Fast' ? 0 : 1,
      useNativeDriver: true,
      tension: 100,
      friction: 10,
    }).start();
  }, [mode]);

  const translateX = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, (SCREEN_WIDTH - spacing.lg * 2 - spacing.xs * 2) / 2],
  });

  return (
    <GlassCard>
      <View style={styles.segmentedContainer}>
        <Animated.View
          style={[
            styles.segmentedIndicator,
            { transform: [{ translateX }] },
          ]}
        >
          <LinearGradient
            colors={mode === 'Fast' ? [colors.modeFast, '#2DD4BF'] : [colors.primary, colors.primaryDark]}
            style={styles.segmentedGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        </Animated.View>

        {config.modes.map((m) => (
          <TouchableOpacity
            key={m}
            style={styles.segmentedButton}
            onPress={() => onModeChange(m)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={m === 'Fast' ? 'flash' : 'bulb-outline'}
              size={18}
              color={mode === m ? colors.white : colors.textSecondary}
            />
            <Text style={[
              styles.segmentedText,
              mode === m && styles.segmentedTextActive,
            ]}>
              {m}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </GlassCard>
  );
}

// Model selection item
function ModelItem({ name, isSelected, onPress }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.98, useNativeDriver: true }).start();
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
      <Animated.View style={[
        styles.modelItem,
        isSelected && styles.modelItemActive,
        { transform: [{ scale: scaleAnim }] },
      ]}>
        <View style={styles.modelInfo}>
          <Ionicons
            name="cube-outline"
            size={20}
            color={isSelected ? colors.primary : colors.textMuted}
          />
          <Text style={[
            styles.modelName,
            isSelected && styles.modelNameActive,
          ]}>
            {name}
          </Text>
        </View>

        <View style={[
          styles.radioOuter,
          isSelected && styles.radioOuterActive,
        ]}>
          {isSelected && (
            <View style={styles.radioInner} />
          )}
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

// Workspace action button
function WorkspaceButton({ icon, label, onPress, variant = 'default', isLoading = false }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.95, useNativeDriver: true }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();
  };

  const isPrimary = variant === 'primary';
  const isDanger = variant === 'danger';

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
      disabled={isLoading}
    >
      <Animated.View style={[
        styles.workspaceButton,
        isPrimary && styles.workspaceButtonPrimary,
        isDanger && styles.workspaceButtonDanger,
        { transform: [{ scale: scaleAnim }] },
      ]}>
        {isLoading ? (
          <ActivityIndicator
            size="small"
            color={isPrimary ? colors.white : isDanger ? colors.error : colors.text}
          />
        ) : (
          <>
            <Ionicons
              name={icon}
              size={18}
              color={isPrimary ? colors.white : isDanger ? colors.error : colors.text}
            />
            <Text style={[
              styles.workspaceButtonText,
              isPrimary && styles.workspaceButtonTextPrimary,
              isDanger && styles.workspaceButtonTextDanger,
            ]}>
              {label}
            </Text>
          </>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}

// Disconnect button
function DisconnectButton({ onPress }) {
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
      <Animated.View style={[
        styles.disconnectButton,
        { transform: [{ scale: scaleAnim }] },
      ]}>
        <Ionicons name="log-out-outline" size={20} color={colors.error} />
        <Text style={styles.disconnectText}>Disconnect</Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

// Workspace error banner
function WorkspaceErrorBanner({ error, onRetry, onDismiss }) {
  if (!error) return null;

  return (
    <View style={styles.workspaceError}>
      <View style={styles.workspaceErrorContent}>
        <Ionicons name="alert-circle" size={16} color={colors.error} />
        <Text style={styles.workspaceErrorText} numberOfLines={2}>
          {error.message || error.error || 'Workspace error'}
        </Text>
      </View>
      <View style={styles.workspaceErrorActions}>
        {error.retryable && onRetry && (
          <TouchableOpacity onPress={onRetry} style={styles.workspaceErrorButton}>
            <Text style={styles.workspaceErrorButtonText}>Retry</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={onDismiss}>
          <Ionicons name="close" size={16} color={colors.textMuted} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export function SettingsModal({
  visible,
  onClose,
  mode,
  model,
  onModeChange,
  onModelChange,
  onDisconnect,
  serverUrl,
  // Workspace props
  workspace,
  workspaceLoading,
  workspaceError,
  onOpenFolder,
  onCloseWorkspace,
  onWorkspaceRetry,
  onClearWorkspaceError,
  // Chat management props
  onShowChats,
}) {
  const slideAnim = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 65,
          friction: 11,
        }),
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      slideAnim.setValue(SHEET_HEIGHT);
      backdropAnim.setValue(0);
    }
  }, [visible]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: SHEET_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(backdropAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  // Pan responder for drag to close
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dy > 10;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          slideAnim.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100 || gestureState.vy > 0.5) {
          handleClose();
        } else {
          Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      {/* Backdrop */}
      <Animated.View
        style={[styles.backdrop, { opacity: backdropAnim }]}
      >
        <TouchableOpacity
          style={styles.backdropTouch}
          onPress={handleClose}
          activeOpacity={1}
        />
      </Animated.View>

      {/* Bottom Sheet */}
      <Animated.View
        style={[
          styles.sheet,
          { transform: [{ translateY: slideAnim }] },
        ]}
      >
        <BlurView intensity={40} tint="dark" style={styles.blurContainer}>
          {/* Handle area for drag */}
          <View {...panResponder.panHandlers}>
            <HandleBar />

            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Settings</Text>
              <TouchableOpacity
                onPress={handleClose}
                style={styles.closeButton}
                activeOpacity={0.7}
              >
                <View style={styles.closeButtonInner}>
                  <Ionicons name="close" size={18} color={colors.textSecondary} />
                </View>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {/* Connection Info */}
            <View style={styles.section}>
              <SectionHeader title="Connection" icon="server-outline" />
              <GlassCard>
                <View style={styles.connectionInfo}>
                  <View style={styles.connectionRow}>
                    <View style={styles.statusDot} />
                    <Text style={styles.connectionLabel}>Connected to</Text>
                  </View>
                  <Text style={styles.connectionUrl} numberOfLines={1}>
                    {serverUrl || 'Unknown'}
                  </Text>
                </View>
              </GlassCard>
            </View>

            {/* Workspace Section */}
            <View style={styles.section}>
              <SectionHeader title="Workspace" icon="folder-outline" />

              {/* Workspace Error */}
              <WorkspaceErrorBanner
                error={workspaceError}
                onRetry={onWorkspaceRetry}
                onDismiss={onClearWorkspaceError}
              />

              <GlassCard>
                <View style={styles.workspaceInfo}>
                  {workspace?.projectName ? (
                    <>
                      <View style={styles.workspaceRow}>
                        <Ionicons name="folder-open" size={20} color={colors.primary} />
                        <Text style={styles.workspaceName} numberOfLines={1}>
                          {workspace.projectName}
                        </Text>
                      </View>
                      {workspace.directory && (
                        <Text style={styles.workspacePath} numberOfLines={1}>
                          {workspace.directory}
                        </Text>
                      )}
                    </>
                  ) : (
                    <View style={styles.workspaceEmpty}>
                      <Ionicons name="folder-outline" size={24} color={colors.textMuted} />
                      <Text style={styles.workspaceEmptyText}>No folder open</Text>
                    </View>
                  )}
                </View>
              </GlassCard>

              <View style={styles.workspaceActions}>
                <WorkspaceButton
                  icon="folder-open-outline"
                  label="Open Folder"
                  onPress={onOpenFolder}
                  variant="primary"
                  isLoading={workspaceLoading}
                />
                {workspace?.projectName && (
                  <WorkspaceButton
                    icon="close-circle-outline"
                    label="Close Folder"
                    onPress={onCloseWorkspace}
                    variant="default"
                    isLoading={workspaceLoading}
                  />
                )}
              </View>
            </View>

            {/* Chat Management */}
            {onShowChats && (
              <View style={styles.section}>
                <SectionHeader title="Chats" icon="chatbubbles-outline" />
                <TouchableOpacity
                  style={styles.chatsButton}
                  onPress={() => {
                    handleClose();
                    setTimeout(onShowChats, 300);
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.chatsButtonContent}>
                    <Ionicons name="list-outline" size={20} color={colors.text} />
                    <Text style={styles.chatsButtonText}>Manage Chats</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                </TouchableOpacity>
              </View>
            )}

            {/* Mode Selection */}
            <View style={styles.section}>
              <SectionHeader title="Mode" icon="speedometer-outline" />
              <ModeSelector mode={mode} onModeChange={onModeChange} />
            </View>

            {/* Model Selection */}
            <View style={styles.section}>
              <SectionHeader title="Model" icon="hardware-chip-outline" />
              <GlassCard style={styles.modelList}>
                {config.models.map((m, index) => (
                  <React.Fragment key={m}>
                    <ModelItem
                      name={m}
                      isSelected={model?.includes(m.split(' ')[0]) || model === m}
                      onPress={() => onModelChange(m)}
                    />
                    {index < config.models.length - 1 && (
                      <View style={styles.modelDivider} />
                    )}
                  </React.Fragment>
                ))}
              </GlassCard>
            </View>

            {/* Disconnect */}
            <View style={styles.section}>
              <DisconnectButton onPress={onDisconnect} />
            </View>

            {/* App Info */}
            <View style={styles.appInfo}>
              <Image
                source={require('../assets/logo.png')}
                style={styles.appLogoImage}
                resizeMode="contain"
              />
              <Text style={styles.appName}>Luma Mobile</Text>
              <Text style={styles.appVersion}>Version 1.0.0</Text>
            </View>
          </ScrollView>
        </BlurView>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  backdropTouch: {
    flex: 1,
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SHEET_HEIGHT,
    borderTopLeftRadius: borderRadius.xxxl,
    borderTopRightRadius: borderRadius.xxxl,
    overflow: 'hidden',
  },
  blurContainer: {
    flex: 1,
    backgroundColor: 'rgba(20, 20, 20, 0.85)',
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.textMuted,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  closeButton: {
    padding: spacing.xs,
  },
  closeButtonInner: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.glass,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  sectionTitle: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  glassCard: {
    backgroundColor: colors.glass,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    overflow: 'hidden',
  },
  connectionInfo: {
    padding: spacing.md,
  },
  connectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
    marginRight: spacing.sm,
  },
  connectionLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  connectionUrl: {
    fontSize: fontSize.md,
    color: colors.text,
    fontWeight: fontWeight.medium,
  },
  // Workspace error styles
  workspaceError: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.errorMuted,
    padding: spacing.sm,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.error,
  },
  workspaceErrorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.xs,
  },
  workspaceErrorText: {
    fontSize: fontSize.xs,
    color: colors.error,
    flex: 1,
  },
  workspaceErrorActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  workspaceErrorButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.glass,
    borderRadius: borderRadius.md,
  },
  workspaceErrorButtonText: {
    fontSize: fontSize.xs,
    color: colors.primary,
    fontWeight: fontWeight.medium,
  },
  // Workspace styles
  workspaceInfo: {
    padding: spacing.md,
  },
  workspaceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  workspaceName: {
    fontSize: fontSize.md,
    color: colors.text,
    fontWeight: fontWeight.medium,
    flex: 1,
  },
  workspacePath: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: spacing.xs,
    marginLeft: spacing.lg + spacing.sm,
  },
  workspaceEmpty: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  workspaceEmptyText: {
    fontSize: fontSize.md,
    color: colors.textMuted,
  },
  workspaceActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  workspaceButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    gap: spacing.xs,
  },
  workspaceButtonPrimary: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  workspaceButtonDanger: {
    backgroundColor: colors.errorMuted,
    borderColor: colors.error,
  },
  workspaceButtonText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.text,
  },
  workspaceButtonTextPrimary: {
    color: colors.white,
  },
  workspaceButtonTextDanger: {
    color: colors.error,
  },
  // Chats button
  chatsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    backgroundColor: colors.glass,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  chatsButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  chatsButtonText: {
    fontSize: fontSize.md,
    color: colors.text,
    fontWeight: fontWeight.medium,
  },
  // Mode selector
  segmentedContainer: {
    flexDirection: 'row',
    padding: spacing.xs,
    position: 'relative',
  },
  segmentedIndicator: {
    position: 'absolute',
    top: spacing.xs,
    left: spacing.xs,
    width: '50%',
    height: '100%',
    paddingRight: spacing.xs,
  },
  segmentedGradient: {
    flex: 1,
    borderRadius: borderRadius.lg,
  },
  segmentedButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: spacing.xs,
    zIndex: 1,
  },
  segmentedText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
  },
  segmentedTextActive: {
    color: colors.white,
  },
  // Model list
  modelList: {
    padding: 0,
  },
  modelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  modelItemActive: {
    backgroundColor: colors.primaryMuted,
  },
  modelInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  modelName: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    flex: 1,
  },
  modelNameActive: {
    color: colors.text,
    fontWeight: fontWeight.medium,
  },
  modelDivider: {
    height: 1,
    backgroundColor: colors.glassBorder,
    marginHorizontal: spacing.md,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterActive: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  // Disconnect button
  disconnectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.errorMuted,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xl,
    gap: spacing.sm,
  },
  disconnectText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.error,
  },
  // App info
  appInfo: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    marginBottom: spacing.xl,
  },
  appLogoSmall: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  appLogoImage: {
    width: 48,
    height: 48,
    borderRadius: 12,
    marginBottom: spacing.sm,
  },
  appName: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
  },
  appVersion: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
});

export default SettingsModal;
