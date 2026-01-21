// In-App Notification Service for Luma Mobile
// Uses event-based system with NotificationBanner component

class NotificationService {
  constructor() {
    this.listeners = [];
    this.settings = {
      enabled: true,
      sound: true,
      vibrate: true,
      onGenerationComplete: true,
      onError: true,
    };
  }

  /**
   * Subscribe to notification events
   * @param {Function} callback - Callback function (notification) => void
   * @returns {Function} Unsubscribe function
   */
  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  /**
   * Emit notification to all subscribers
   * @param {Object} notification - { title, message, type, duration }
   */
  emit(notification) {
    this.listeners.forEach(callback => {
      try {
        callback(notification);
      } catch (e) {
        console.error('Notification listener error:', e);
      }
    });
  }

  /**
   * Request permissions (always granted for in-app notifications)
   * @returns {Promise<boolean>}
   */
  async requestPermissions() {
    return true;
  }

  /**
   * Show notification when AI generation completes
   * @param {Object} options
   * @param {number} options.duration - Generation duration in ms
   */
  async notifyGenerationComplete({ duration = 0 } = {}) {
    if (!this.settings.enabled || !this.settings.onGenerationComplete) {
      return;
    }

    const durationText = duration > 0
      ? ` (${Math.round(duration / 1000)}s)`
      : '';

    this.emit({
      title: 'AI Response Ready',
      message: `Generation complete${durationText}`,
      type: 'success',
      duration: 4000,
      vibrate: this.settings.vibrate,
    });
  }

  /**
   * Show notification for errors
   * @param {string} message - Error message
   */
  async notifyError(message) {
    if (!this.settings.enabled || !this.settings.onError) {
      return;
    }

    this.emit({
      title: 'Error',
      message: message,
      type: 'error',
      duration: 5000,
      vibrate: this.settings.vibrate,
    });
  }

  /**
   * Show custom notification
   * @param {string} title - Notification title
   * @param {string} body - Notification body
   * @param {string} type - 'success', 'error', 'info'
   */
  async notify(title, body, type = 'info') {
    if (!this.settings.enabled) {
      return;
    }

    this.emit({
      title,
      message: body,
      type,
      duration: 4000,
      vibrate: this.settings.vibrate,
    });
  }

  /**
   * Update notification settings
   * @param {Object} newSettings - New settings
   */
  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
  }

  /**
   * Get current settings
   * @returns {Object} Current settings
   */
  getSettings() {
    return { ...this.settings };
  }

  /**
   * Cancel/clear notifications (no-op for in-app)
   */
  async cancelAll() {
    // No-op for in-app notifications
  }
}

// Export singleton instance
export const notifications = new NotificationService();
export default notifications;
