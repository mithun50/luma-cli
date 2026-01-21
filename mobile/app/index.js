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
import {
  Header,
  ChatView,
  InputBar,
  ConnectScreen,
  SettingsModal,
  NotificationBanner,
} from '../components';

export default function MainScreen() {
  const [showSettings, setShowSettings] = useState(false);

  // Connection management
  const {
    isConnected,
    isConnecting,
    serverUrl,
    error: connectionError,
    connect,
    disconnect,
  } = useConnection();

  // Snapshot polling (only when connected)
  const {
    snapshot,
    isLoading: isLoadingSnapshot,
    error: snapshotError,
  } = useSnapshot(isConnected);

  // App state (mode, model)
  const {
    mode,
    model,
    isLoading: isLoadingState,
    setMode: updateMode,
    setModel: updateModel,
    refresh: refreshState,
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

  // Handle send message
  const handleSend = useCallback(async (message) => {
    if (!isConnected) return;

    try {
      await api.sendMessage(message);
      // Generation state will be updated via WebSocket events
    } catch (e) {
      console.error('Send error:', e);
      Alert.alert('Error', 'Failed to send message');
    }
  }, [isConnected]);

  // Handle stop generation
  const handleStop = useCallback(async () => {
    if (!isConnected) return;

    try {
      await api.stopGeneration();
      // Generation state will be updated via WebSocket events
    } catch (e) {
      console.error('Stop error:', e);
    }
  }, [isConnected]);

  // Handle mode change
  const handleModeChange = useCallback(async (newMode) => {
    try {
      await updateMode(newMode);
    } catch (e) {
      Alert.alert('Error', 'Failed to change mode');
    }
  }, [updateMode]);

  // Handle model change
  const handleModelChange = useCallback(async (newModel) => {
    try {
      await updateModel(newModel);
    } catch (e) {
      Alert.alert('Error', 'Failed to change model');
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

        {/* Chat View */}
        <ChatView
          snapshot={snapshot}
          isLoading={isLoadingSnapshot}
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

        {/* In-App Notification Banner */}
        <NotificationBanner
          visible={!!notification}
          title={notification?.title}
          message={notification?.message}
          type={notification?.type}
          duration={notification?.duration}
          vibrate={notification?.vibrate}
          onDismiss={dismissNotification}
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
