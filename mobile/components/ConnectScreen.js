// Connect Screen Component - Like Expo Go's connection screen
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../constants/theme';
import { storage } from '../services';
import { QRScanner } from './QRScanner';

export function ConnectScreen({ onConnect, isConnecting, error }) {
  const [serverUrl, setServerUrl] = useState('');
  const [recentUrls, setRecentUrls] = useState([]);
  const [showScanner, setShowScanner] = useState(false);

  // Load recent URLs
  useEffect(() => {
    loadRecentUrls();
  }, []);

  const loadRecentUrls = async () => {
    const saved = await storage.getServerUrl();
    if (saved) {
      setServerUrl(saved);
      setRecentUrls([saved]);
    }
  };

  const handleConnect = () => {
    if (!serverUrl.trim()) return;

    // Ensure URL has protocol
    let url = serverUrl.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'http://' + url;
    }

    onConnect(url);
  };

  const handleQuickConnect = (url) => {
    setServerUrl(url);
    onConnect(url);
  };

  const handleQRScan = (scannedUrl) => {
    // Ensure URL has protocol
    let url = scannedUrl.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'http://' + url;
    }
    setServerUrl(url);
    onConnect(url);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Ionicons name="planet" size={64} color={colors.primary} />
          </View>
          <Text style={styles.title}>Luma</Text>
          <Text style={styles.subtitle}>Remote Control for Antigravity</Text>
        </View>

        {/* Connection Form */}
        <View style={styles.formContainer}>
          <Text style={styles.label}>Server URL</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={serverUrl}
              onChangeText={setServerUrl}
              placeholder="http://192.168.1.100:3000"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              editable={!isConnecting}
            />
            <TouchableOpacity
              style={styles.scanButton}
              onPress={() => setShowScanner(true)}
              disabled={isConnecting}
            >
              <Ionicons name="qr-code" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {error && (
            <View style={styles.errorContainer}>
              <Ionicons name="warning" size={16} color={colors.error} />
              <Text style={styles.errorText}>
                {error.message || error.title || String(error)}
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.connectButton, isConnecting && styles.connectButtonDisabled]}
            onPress={handleConnect}
            disabled={isConnecting || !serverUrl.trim()}
          >
            {isConnecting ? (
              <ActivityIndicator color={colors.text} />
            ) : (
              <>
                <Ionicons name="link" size={20} color={colors.text} />
                <Text style={styles.connectButtonText}>Connect</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Recent Connections */}
        {recentUrls.length > 0 && (
          <View style={styles.recentContainer}>
            <Text style={styles.recentTitle}>Recent</Text>
            {recentUrls.map((url, index) => (
              <TouchableOpacity
                key={index}
                style={styles.recentItem}
                onPress={() => handleQuickConnect(url)}
                disabled={isConnecting}
              >
                <Ionicons name="time-outline" size={20} color={colors.textSecondary} />
                <Text style={styles.recentText} numberOfLines={1}>{url}</Text>
                <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Instructions */}
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>How to Connect</Text>
          <View style={styles.step}>
            <Text style={styles.stepNumber}>1</Text>
            <Text style={styles.stepText}>Start Antigravity with debug mode</Text>
          </View>
          <View style={styles.step}>
            <Text style={styles.stepNumber}>2</Text>
            <Text style={styles.stepText}>Run: luma-cli start</Text>
          </View>
          <View style={styles.step}>
            <Text style={styles.stepNumber}>3</Text>
            <Text style={styles.stepText}>Scan QR code or enter URL above</Text>
          </View>
        </View>
      </ScrollView>

      {/* QR Scanner Modal */}
      <QRScanner
        visible={showScanner}
        onScan={handleQRScan}
        onClose={() => setShowScanner(false)}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.lg,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: spacing.xxl,
    marginBottom: spacing.xl,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  formContainer: {
    marginBottom: spacing.xl,
  },
  label: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: fontSize.md,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  scanButton: {
    width: 50,
    height: 50,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    padding: spacing.sm,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: borderRadius.md,
  },
  errorText: {
    color: colors.error,
    fontSize: fontSize.sm,
    marginLeft: spacing.xs,
  },
  connectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    marginTop: spacing.md,
  },
  connectButtonDisabled: {
    opacity: 0.6,
  },
  connectButtonText: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    marginLeft: spacing.sm,
  },
  recentContainer: {
    marginBottom: spacing.xl,
  },
  recentTitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
  },
  recentText: {
    flex: 1,
    color: colors.text,
    fontSize: fontSize.md,
    marginLeft: spacing.sm,
  },
  instructionsContainer: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  instructionsTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    textAlign: 'center',
    lineHeight: 24,
    marginRight: spacing.sm,
  },
  stepText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
  },
});

export default ConnectScreen;
