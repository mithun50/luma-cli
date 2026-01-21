// Luma Storage Service
import AsyncStorage from '@react-native-async-storage/async-storage';
import { config } from '../constants/config';

class LumaStorage {
  async get(key) {
    try {
      const value = await AsyncStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Storage get error:', error);
      return null;
    }
  }

  async set(key, value) {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Storage set error:', error);
      return false;
    }
  }

  async remove(key) {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Storage remove error:', error);
      return false;
    }
  }

  async clear() {
    try {
      await AsyncStorage.clear();
      return true;
    } catch (error) {
      console.error('Storage clear error:', error);
      return false;
    }
  }

  // Convenience methods
  async getServerUrl() {
    return this.get(config.storageKeys.serverUrl);
  }

  async setServerUrl(url) {
    return this.set(config.storageKeys.serverUrl, url);
  }

  async getPreferences() {
    const prefs = await this.get(config.storageKeys.preferences);
    return prefs || {};
  }

  async setPreferences(prefs) {
    return this.set(config.storageKeys.preferences, prefs);
  }

  async updatePreference(key, value) {
    const prefs = await this.getPreferences();
    prefs[key] = value;
    return this.setPreferences(prefs);
  }
}

// Export singleton instance
export const storage = new LumaStorage();
export default storage;
