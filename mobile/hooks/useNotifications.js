// Notifications Hook - Handle in-app notifications
import { useEffect, useState, useCallback } from 'react';
import { websocket, notifications } from '../services';

export function useNotifications(isConnected) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [notification, setNotification] = useState(null);

  // Subscribe to notification service events
  useEffect(() => {
    const unsubscribe = notifications.subscribe((notif) => {
      setNotification(notif);
    });

    return unsubscribe;
  }, []);

  // Handle WebSocket events for generation state
  useEffect(() => {
    if (!isConnected) return;

    // Generation started
    const handleGenerationStarted = () => {
      console.log('Generation started');
      setIsGenerating(true);
    };

    // Generation complete - show notification
    const handleGenerationComplete = async (data) => {
      console.log('Generation complete:', data);
      setIsGenerating(false);

      // Show in-app notification
      await notifications.notifyGenerationComplete({
        duration: data.duration || 0,
      });
    };

    // Snapshot update - includes isGenerating flag
    const handleSnapshotUpdate = (data) => {
      if (typeof data.isGenerating === 'boolean') {
        setIsGenerating(data.isGenerating);
      }
    };

    // Error handler
    const handleError = async (data) => {
      await notifications.notifyError(data.message || 'An error occurred');
    };

    // Subscribe to events
    websocket.on('generation_started', handleGenerationStarted);
    websocket.on('generation_complete', handleGenerationComplete);
    websocket.on('snapshot_update', handleSnapshotUpdate);
    websocket.on('error', handleError);

    // Cleanup
    return () => {
      websocket.off('generation_started', handleGenerationStarted);
      websocket.off('generation_complete', handleGenerationComplete);
      websocket.off('snapshot_update', handleSnapshotUpdate);
      websocket.off('error', handleError);
    };
  }, [isConnected]);

  // Dismiss notification
  const dismissNotification = useCallback(() => {
    setNotification(null);
  }, []);

  // Update notification settings
  const updateSettings = useCallback((newSettings) => {
    notifications.updateSettings(newSettings);
  }, []);

  // Get notification settings
  const getSettings = useCallback(() => {
    return notifications.getSettings();
  }, []);

  return {
    isGenerating,
    notification,
    dismissNotification,
    updateSettings,
    getSettings,
  };
}

export default useNotifications;
