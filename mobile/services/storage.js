// Luma Storage Service
import AsyncStorage from '@react-native-async-storage/async-storage';
import { config } from '../constants/config';
import { AppError, ErrorCategory } from '../utils';

class LumaStorage {
  async get(key) {
    try {
      const value = await AsyncStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Storage get error:', error);
      throw new AppError(ErrorCategory.STORAGE, error, 'Failed to read data');
    }
  }

  async set(key, value) {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Storage set error:', error);
      throw new AppError(ErrorCategory.STORAGE, error, 'Failed to save data');
    }
  }

  async remove(key) {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Storage remove error:', error);
      throw new AppError(ErrorCategory.STORAGE, error, 'Failed to remove data');
    }
  }

  async clear() {
    try {
      await AsyncStorage.clear();
      return true;
    } catch (error) {
      console.error('Storage clear error:', error);
      throw new AppError(ErrorCategory.STORAGE, error, 'Failed to clear storage');
    }
  }

  // Safe get - returns default value on error instead of throwing
  async safeGet(key, defaultValue = null) {
    try {
      const value = await AsyncStorage.getItem(key);
      return value ? JSON.parse(value) : defaultValue;
    } catch (error) {
      console.error('Storage safeGet error:', error);
      return defaultValue;
    }
  }

  // Safe set - returns false on error instead of throwing
  async safeSet(key, value) {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Storage safeSet error:', error);
      return false;
    }
  }

  // Convenience methods (using safe versions to avoid breaking app flow)
  async getServerUrl() {
    return this.safeGet(config.storageKeys.serverUrl);
  }

  async setServerUrl(url) {
    return this.safeSet(config.storageKeys.serverUrl, url);
  }

  async getPreferences() {
    const prefs = await this.safeGet(config.storageKeys.preferences);
    return prefs || {};
  }

  async setPreferences(prefs) {
    return this.safeSet(config.storageKeys.preferences, prefs);
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
