// Chat List Component - Modern Multichat Management
import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Animated,
  TextInput,
  Alert,
  ActivityIndicator,
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

// Chat item component
function ChatItem({ chat, isActive, onPress, onDelete, onRename }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [showActions, setShowActions] = useState(false);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.98, useNativeDriver: true }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();
  };

  const handleLongPress = () => {
    setShowActions(true);
  };

  return (
    <>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onLongPress={handleLongPress}
        activeOpacity={1}
        delayLongPress={500}
      >
        <Animated.View
          style={[
            styles.chatItem,
            isActive && styles.chatItemActive,
            { transform: [{ scale: scaleAnim }] },
          ]}
        >
          <View style={styles.chatIcon}>
            <Ionicons
              name={isActive ? 'chatbubble' : 'chatbubble-outline'}
              size={20}
              color={isActive ? colors.primary : colors.textMuted}
            />
          </View>
          <View style={styles.chatInfo}>
            <Text
              style={[styles.chatName, isActive && styles.chatNameActive]}
              numberOfLines={1}
            >
              {chat.name || 'Untitled Chat'}
            </Text>
            {chat.timestamp && (
              <Text style={styles.chatTime}>{chat.timestamp}</Text>
            )}
          </View>
          {isActive && (
            <View style={styles.activeBadge}>
              <View style={styles.activeDot} />
            </View>
          )}
        </Animated.View>
      </TouchableOpacity>

      {/* Actions Modal */}
      <Modal
        visible={showActions}
        transparent
        animationType="fade"
        onRequestClose={() => setShowActions(false)}
      >
        <TouchableOpacity
          style={styles.actionsOverlay}
          activeOpacity={1}
          onPress={() => setShowActions(false)}
        >
          <View style={styles.actionsContainer}>
            <Text style={styles.actionsTitle}>{chat.name || 'Untitled Chat'}</Text>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                setShowActions(false);
                onRename(chat);
              }}
            >
              <Ionicons name="pencil-outline" size={20} color={colors.text} />
              <Text style={styles.actionText}>Rename</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.actionButtonDanger]}
              onPress={() => {
                setShowActions(false);
                onDelete(chat);
              }}
            >
              <Ionicons name="trash-outline" size={20} color={colors.error} />
              <Text style={[styles.actionText, styles.actionTextDanger]}>Delete</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

// New chat button
function NewChatButton({ onPress, isLoading }) {
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
      disabled={isLoading}
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          style={styles.newChatButton}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.white} size="small" />
          ) : (
            <>
              <Ionicons name="add" size={20} color={colors.white} />
              <Text style={styles.newChatText}>New Chat</Text>
            </>
          )}
        </LinearGradient>
      </Animated.View>
    </TouchableOpacity>
  );
}

// Error banner component
function ErrorBanner({ error, onRetry, onDismiss }) {
  if (!error) return null;

  return (
    <View style={styles.errorBanner}>
      <View style={styles.errorContent}>
        <Ionicons name="alert-circle" size={20} color={colors.error} />
        <View style={styles.errorTextContainer}>
          <Text style={styles.errorTitle}>{error.title || 'Error'}</Text>
          <Text style={styles.errorMessage} numberOfLines={2}>
            {error.message || error.error || 'Something went wrong'}
          </Text>
        </View>
      </View>
      <View style={styles.errorActions}>
        {error.retryable && onRetry && (
          <TouchableOpacity onPress={onRetry} style={styles.errorButton}>
            <Ionicons name="refresh" size={16} color={colors.primary} />
            <Text style={styles.errorButtonText}>Retry</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={onDismiss} style={styles.errorDismiss}>
          <Ionicons name="close" size={16} color={colors.textMuted} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export function ChatList({
  visible,
  onClose,
  chats = [],
  activeChat,
  isLoading,
  error,
  onCreateChat,
  onSwitchChat,
  onDeleteChat,
  onRenameChat,
  onRetry,
  onClearError,
}) {
  const [renameModal, setRenameModal] = useState(null);
  const [newName, setNewName] = useState('');
  const [actionError, setActionError] = useState(null);

  // Clear action error when modal closes
  const handleClose = () => {
    setActionError(null);
    onClose();
  };

  const handleDelete = (chat) => {
    Alert.alert(
      'Delete Chat',
      `Are you sure you want to delete "${chat.name || 'this chat'}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const result = await onDeleteChat(chat.id);
            if (result?.error) {
              setActionError({
                title: result.title || 'Delete Failed',
                message: result.error,
                retryable: result.retryable,
                action: () => onDeleteChat(chat.id),
              });
            }
          },
        },
      ]
    );
  };

  const handleRename = (chat) => {
    setActionError(null);
    setNewName(chat.name || '');
    setRenameModal(chat);
  };

  const submitRename = async () => {
    if (renameModal && newName.trim()) {
      const result = await onRenameChat(renameModal.id, newName.trim());
      if (result?.error) {
        setActionError({
          title: result.title || 'Rename Failed',
          message: result.error,
          retryable: result.retryable,
        });
      }
    }
    setRenameModal(null);
    setNewName('');
  };

  const handleCreateChat = async () => {
    setActionError(null);
    const result = await onCreateChat();
    if (result?.error) {
      setActionError({
        title: result.title || 'Create Failed',
        message: result.error,
        retryable: result.retryable,
        action: onCreateChat,
      });
    }
  };

  const handleSwitchChat = async (chatId) => {
    const result = await onSwitchChat(chatId);
    if (result?.error) {
      setActionError({
        title: result.title || 'Switch Failed',
        message: result.error,
        retryable: result.retryable,
      });
    } else {
      handleClose();
    }
  };

  const handleRetryAction = () => {
    if (actionError?.action) {
      actionError.action();
    }
    setActionError(null);
  };

  // Combined error (hook error or action error)
  const displayError = actionError || error;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={handleClose}
        />

        <View style={styles.sheet}>
          <BlurView intensity={40} tint="dark" style={styles.blurContainer}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.handle} />
              <View style={styles.headerRow}>
                <Text style={styles.title}>Chats</Text>
                <TouchableOpacity
                  onPress={handleClose}
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Error Banner */}
            <ErrorBanner
              error={displayError}
              onRetry={actionError?.action ? handleRetryAction : onRetry}
              onDismiss={() => {
                setActionError(null);
                if (onClearError) onClearError();
              }}
            />

            {/* New Chat Button */}
            <View style={styles.newChatContainer}>
              <NewChatButton onPress={handleCreateChat} isLoading={isLoading} />
            </View>

            {/* Chat List */}
            <ScrollView
              style={styles.chatList}
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              {/* Loading State */}
              {isLoading && chats.length === 0 && (
                <View style={styles.loadingState}>
                  <ActivityIndicator size="large" color={colors.primary} />
                  <Text style={styles.loadingText}>Loading chats...</Text>
                </View>
              )}

              {/* Empty State - only show if not loading and no error */}
              {chats.length === 0 && !isLoading && !displayError && (
                <View style={styles.emptyState}>
                  <Ionicons
                    name="chatbubbles-outline"
                    size={48}
                    color={colors.textMuted}
                  />
                  <Text style={styles.emptyText}>No chats yet</Text>
                  <Text style={styles.emptySubtext}>
                    Create a new chat to get started
                  </Text>
                </View>
              )}

              {/* Error Empty State - show when error and no chats */}
              {chats.length === 0 && !isLoading && displayError && (
                <View style={styles.emptyState}>
                  <Ionicons
                    name="cloud-offline-outline"
                    size={48}
                    color={colors.textMuted}
                  />
                  <Text style={styles.emptyText}>Unable to load chats</Text>
                  <Text style={styles.emptySubtext}>
                    Check your connection and try again
                  </Text>
                </View>
              )}

              {/* Chat Items */}
              {chats.map((chat) => (
                <ChatItem
                  key={chat.id}
                  chat={chat}
                  isActive={chat.id === activeChat || chat.isActive}
                  onPress={() => handleSwitchChat(chat.id)}
                  onDelete={handleDelete}
                  onRename={handleRename}
                />
              ))}
            </ScrollView>
          </BlurView>
        </View>
      </View>

      {/* Rename Modal */}
      <Modal
        visible={!!renameModal}
        transparent
        animationType="fade"
        onRequestClose={() => setRenameModal(null)}
      >
        <View style={styles.renameOverlay}>
          <View style={styles.renameContainer}>
            <Text style={styles.renameTitle}>Rename Chat</Text>
            <TextInput
              style={styles.renameInput}
              value={newName}
              onChangeText={setNewName}
              placeholder="Chat name"
              placeholderTextColor={colors.textMuted}
              autoFocus
              selectTextOnFocus
            />
            <View style={styles.renameButtons}>
              <TouchableOpacity
                style={styles.renameCancelButton}
                onPress={() => setRenameModal(null)}
              >
                <Text style={styles.renameCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.renameSubmitButton}
                onPress={submitRename}
              >
                <Text style={styles.renameSubmitText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  // Error banner styles
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.errorMuted,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    padding: spacing.sm,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.error,
  },
  errorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.sm,
  },
  errorTextContainer: {
    flex: 1,
  },
  errorTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.error,
  },
  errorMessage: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  errorActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  errorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.glass,
    borderRadius: borderRadius.md,
    gap: 4,
  },
  errorButtonText: {
    fontSize: fontSize.xs,
    color: colors.primary,
    fontWeight: fontWeight.medium,
  },
  errorDismiss: {
    padding: spacing.xs,
  },
  sheet: {
    height: '70%',
    borderTopLeftRadius: borderRadius.xxxl,
    borderTopRightRadius: borderRadius.xxxl,
    overflow: 'hidden',
  },
  blurContainer: {
    flex: 1,
    backgroundColor: 'rgba(20, 20, 20, 0.9)',
  },
  header: {
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.glassBorder,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.textMuted,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.glass,
    justifyContent: 'center',
    alignItems: 'center',
  },
  newChatContainer: {
    padding: spacing.md,
  },
  newChatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xl,
    gap: spacing.sm,
  },
  newChatText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.white,
  },
  chatList: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.glass,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  chatItemActive: {
    backgroundColor: colors.primaryMuted,
    borderColor: colors.primary,
  },
  chatIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.glass,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatInfo: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  chatName: {
    fontSize: fontSize.md,
    color: colors.text,
    fontWeight: fontWeight.medium,
  },
  chatNameActive: {
    color: colors.text,
    fontWeight: fontWeight.semibold,
  },
  chatTime: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  activeBadge: {
    marginLeft: spacing.sm,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
  },
  loadingState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  loadingText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.medium,
    color: colors.text,
    marginTop: spacing.md,
  },
  emptySubtext: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
  // Actions modal
  actionsOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionsContainer: {
    width: '80%',
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
  },
  actionsTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.glass,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  actionButtonDanger: {
    backgroundColor: colors.errorMuted,
  },
  actionText: {
    fontSize: fontSize.md,
    color: colors.text,
  },
  actionTextDanger: {
    color: colors.error,
  },
  // Rename modal
  renameOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  renameContainer: {
    width: '85%',
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
  },
  renameTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  renameInput: {
    backgroundColor: colors.glass,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    fontSize: fontSize.md,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  renameButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  renameCancelButton: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.glass,
    alignItems: 'center',
  },
  renameCancelText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  renameSubmitButton: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  renameSubmitText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.white,
  },
});

export default ChatList;
