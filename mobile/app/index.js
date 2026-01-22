// Main App Screen - Like Expo Go
import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../constants/theme';
import { api, storage } from '../services';
import { useConnection, useSnapshot, useAppState, useNotifications } from '../hooks';
import { AppError, wrapError } from '../utils';
import {
  Header,
  ChatView,
  InputBar,
  ConnectScreen,
  SettingsModal,
  NotificationBanner,
  ErrorDisplay,
} from '../components';

export default function MainScreen() {
  const [showSettings, setShowSettings] = useState(false);

  // Connection management
  const {
    isConnected,
    isConnecting,
    isReconnecting,
    reconnectInfo,
    serverUrl,
    error: connectionError,
    connect,
    disconnect,
    retry: retryConnection,
    forceReconnectWs,
    clearError: clearConnectionError,
  } = useConnection();

  // Snapshot polling (only when connected)
  const {
    snapshot,
    isLoading: isLoadingSnapshot,
    error: snapshotError,
    retry: retrySnapshot,
  } = useSnapshot(isConnected);

  // App state (mode, model)
  const {
    mode,
    model,
    isLoading: isLoadingState,
    error: appStateError,
    setMode: updateMode,
    setModel: updateModel,
    refresh: refreshState,
    clearError: clearAppStateError,
  } = useAppState(isConnected);

  // Notifications (handles generation state via WebSocket)
  const {
    isGenerating,
    notification,
    dismissNotification,
  } = useNotifications(isConnected);

  // Refresh app state when connected
  useEffect(() => {
    if (isConnected) {
      refreshState();
    }
  }, [isConnected]);

  // Handle connection
  const handleConnect = useCallback(async (url) => {
    const success = await connect(url);
    if (success) {
      await storage.setServerUrl(url);
    }
  }, [connect]);

  // Handle disconnect
  const handleDisconnect = useCallback(async () => {
    await disconnect();
    setShowSettings(false);
  }, [disconnect]);

  // Handle send message with retry option
  const handleSend = useCallback(async (message) => {
    if (!isConnected) return;

    try {
      await api.sendMessage(message);
      // Generation state will be updated via WebSocket events
    } catch (err) {
      const appError = err instanceof AppError ? err : wrapError(err);
      console.error('Send error:', appError.originalError || appError);

      // Show alert with retry option if error is retryable
      if (appError.retryable) {
        Alert.alert(
          appError.title || 'Error',
          appError.message || 'Failed to send message',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Retry',
              onPress: () => handleSend(message),
            },
          ]
        );
      } else {
        Alert.alert(
          appError.title || 'Error',
          appError.message || 'Failed to send message'
        );
      }
    }
  }, [isConnected]);

  // Handle stop generation
  const handleStop = useCallback(async () => {
    if (!isConnected) return;

    try {
      await api.stopGeneration();
      // Generation state will be updated via WebSocket events
    } catch (err) {
      console.error('Stop error:', err);
    }
  }, [isConnected]);

  // Handle mode change
  const handleModeChange = useCallback(async (newMode) => {
    try {
      await updateMode(newMode);
    } catch (err) {
      const appError = err instanceof AppError ? err : wrapError(err);
      Alert.alert(
        appError.title || 'Error',
        appError.message || 'Failed to change mode'
      );
    }
  }, [updateMode]);

  // Handle model change
  const handleModelChange = useCallback(async (newModel) => {
    try {
      await updateModel(newModel);
    } catch (err) {
      const appError = err instanceof AppError ? err : wrapError(err);
      Alert.alert(
        appError.title || 'Error',
        appError.message || 'Failed to change model'
      );
    }
  }, [updateModel]);

  // Handle scroll in chat view
  const handleScroll = useCallback((scrollPercent) => {
    // Can be used for scroll-to-bottom button visibility
  }, []);

  // Handle element click in chat view
  const handleElementClick = useCallback((selector, text) => {
    console.log('Element clicked:', selector, text);
  }, []);

  // Build reconnecting notification message
  const getReconnectingMessage = () => {
    if (!isReconnecting || !reconnectInfo) return null;
    return {
      title: 'Reconnecting',
      message: `Attempt ${reconnectInfo.attempt}/${reconnectInfo.maxAttempts}...`,
      type: 'warning',
      duration: 0, // Persistent until connection restored
    };
  };

  // Show connect screen if not connected
  if (!isConnected) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <ConnectScreen
          onConnect={handleConnect}
          isConnecting={isConnecting}
          error={connectionError}
        />
      </SafeAreaView>
    );
  }

  // Determine which notification to show (reconnecting takes priority)
  const reconnectingNotification = getReconnectingMessage();
  const activeNotification = reconnectingNotification || notification;

  // Main chat screen
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        {/* Header */}
        <Header
          isConnected={isConnected}
          isGenerating={isGenerating}
          mode={mode}
          model={model}
          onSettingsPress={() => setShowSettings(true)}
        />

        {/* Chat View with error handling */}
        <ChatView
          snapshot={snapshot}
          isLoading={isLoadingSnapshot}
          error={snapshotError}
          onRetry={retrySnapshot}
          onScroll={handleScroll}
          onElementClick={handleElementClick}
        />

        {/* Input Bar */}
        <InputBar
          onSend={handleSend}
          onStop={handleStop}
          isGenerating={isGenerating}
          isConnected={isConnected}
          placeholder="Type a message..."
        />

        {/* Settings Modal */}
        <SettingsModal
          visible={showSettings}
          onClose={() => setShowSettings(false)}
          mode={mode}
          model={model}
          onModeChange={handleModeChange}
          onModelChange={handleModelChange}
          onDisconnect={handleDisconnect}
          serverUrl={serverUrl}
        />

        {/* In-App Notification Banner (includes reconnecting state) */}
        <NotificationBanner
          visible={!!activeNotification}
          title={activeNotification?.title}
          message={activeNotification?.message}
          type={activeNotification?.type}
          duration={activeNotification?.duration}
          vibrate={activeNotification?.vibrate}
          onDismiss={reconnectingNotification ? undefined : dismissNotification}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
