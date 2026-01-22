// Connect Screen - Modern Premium Design
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  Easing,
  Dimensions,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import {
  colors,
  spacing,
  borderRadius,
  fontSize,
  fontWeight,
  shadows,
} from '../constants/theme';
import { storage } from '../services';
import { QRScanner } from './QRScanner';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Animated orb background
function AnimatedOrbs() {
  const orb1 = useRef(new Animated.Value(0)).current;
  const orb2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate1 = Animated.loop(
      Animated.sequence([
        Animated.timing(orb1, { toValue: 1, duration: 8000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(orb1, { toValue: 0, duration: 8000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    const animate2 = Animated.loop(
      Animated.sequence([
        Animated.timing(orb2, { toValue: 1, duration: 6000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(orb2, { toValue: 0, duration: 6000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    animate1.start();
    animate2.start();
    return () => { animate1.stop(); animate2.stop(); };
  }, []);

  const translateY1 = orb1.interpolate({ inputRange: [0, 1], outputRange: [0, 30] });
  const translateX1 = orb1.interpolate({ inputRange: [0, 1], outputRange: [0, 20] });
  const translateY2 = orb2.interpolate({ inputRange: [0, 1], outputRange: [0, -25] });
  const translateX2 = orb2.interpolate({ inputRange: [0, 1], outputRange: [0, -15] });

  return (
    <View style={styles.orbContainer}>
      <Animated.View style={[styles.orb, styles.orb1, { transform: [{ translateY: translateY1 }, { translateX: translateX1 }] }]} />
      <Animated.View style={[styles.orb, styles.orb2, { transform: [{ translateY: translateY2 }, { translateX: translateX2 }] }]} />
    </View>
  );
}

// Modern logo with glow
function Logo({ isConnecting }) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  useEffect(() => {
    if (isConnecting) {
      const spin = Animated.loop(
        Animated.timing(rotateAnim, { toValue: 1, duration: 2000, easing: Easing.linear, useNativeDriver: true })
      );
      spin.start();
      return () => spin.stop();
    } else {
      rotateAnim.setValue(0);
    }
  }, [isConnecting]);

  const spin = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <View style={styles.logoContainer}>
      {/* Glow effect */}
      <Animated.View style={[styles.logoGlow, { transform: [{ scale: pulseAnim }] }]} />

      {/* Logo image */}
      <Animated.View style={[
        styles.logoWrapper,
        { transform: [{ scale: pulseAnim }] }
      ]}>
        <Image
          source={require('../assets/logo.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />
        {/* Connecting overlay */}
        {isConnecting && (
          <Animated.View style={[styles.connectingOverlay, { transform: [{ rotate: spin }] }]}>
            <Ionicons name="sync-outline" size={32} color={colors.primary} />
          </Animated.View>
        )}
      </Animated.View>
    </View>
  );
}

// Glass card component
function GlassCard({ children, style }) {
  return (
    <View style={[styles.glassCard, style]}>
      {children}
    </View>
  );
}

// Modern button component
function PrimaryButton({ onPress, disabled, loading, children, icon }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <LinearGradient
          colors={disabled ? [colors.backgroundCard, colors.backgroundCard] : [colors.primary, colors.primaryDark]}
          style={[styles.primaryButton, disabled && styles.primaryButtonDisabled]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          {loading ? (
            <Animated.View style={{ transform: [{ rotate: scaleAnim.interpolate({ inputRange: [0.97, 1], outputRange: ['0deg', '360deg'] }) }] }}>
              <Ionicons name="sync-outline" size={22} color={colors.white} />
            </Animated.View>
          ) : icon ? (
            <Ionicons name={icon} size={22} color={disabled ? colors.textMuted : colors.white} />
          ) : null}
          <Text style={[styles.primaryButtonText, disabled && styles.primaryButtonTextDisabled]}>
            {children}
          </Text>
        </LinearGradient>
      </Animated.View>
    </TouchableOpacity>
  );
}

export function ConnectScreen({ onConnect, isConnecting, error, initialUrl }) {
  const [serverUrl, setServerUrl] = useState('');
  const [recentUrls, setRecentUrls] = useState([]);
  const [showScanner, setShowScanner] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, easing: Easing.out(Easing.exp), useNativeDriver: true }),
    ]).start();
    loadRecentUrls();
  }, []);

  // Handle initial URL from deep link
  useEffect(() => {
    if (initialUrl) {
      setServerUrl(initialUrl);
    }
  }, [initialUrl]);

  const loadRecentUrls = async () => {
    const saved = await storage.getServerUrl();
    if (saved) {
      setServerUrl(saved);
      setRecentUrls([saved]);
    }
  };

  const handleConnect = () => {
    if (!serverUrl.trim()) return;
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
    let url = scannedUrl.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'http://' + url;
    }
    setServerUrl(url);
    onConnect(url);
  };

  return (
    <View style={styles.container}>
      <AnimatedOrbs />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>

            {/* Header */}
            <View style={styles.header}>
              <Logo isConnecting={isConnecting} />
              <Text style={styles.title}>Luma</Text>
              <Text style={styles.subtitle}>Remote Control for Antigravity</Text>
            </View>

            {/* Connection Card */}
            <GlassCard style={styles.connectionCard}>
              <Text style={styles.cardTitle}>Connect to Server</Text>

              {/* Input Field */}
              <View style={[styles.inputWrapper, inputFocused && styles.inputWrapperFocused]}>
                <Ionicons name="globe-outline" size={20} color={colors.textTertiary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={serverUrl}
                  onChangeText={setServerUrl}
                  placeholder="192.168.1.100:3000"
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="url"
                  editable={!isConnecting}
                  onFocus={() => setInputFocused(true)}
                  onBlur={() => setInputFocused(false)}
                  keyboardAppearance="dark"
                  returnKeyType="go"
                  onSubmitEditing={handleConnect}
                />
                <TouchableOpacity
                  style={styles.qrButton}
                  onPress={() => setShowScanner(true)}
                  disabled={isConnecting}
                >
                  <Ionicons name="qr-code-outline" size={22} color={colors.primary} />
                </TouchableOpacity>
              </View>

              {/* Error Message */}
              {error && (
                <View style={styles.errorContainer}>
                  <View style={styles.errorIcon}>
                    <Ionicons name="alert-circle" size={18} color={colors.error} />
                  </View>
                  <Text style={styles.errorText}>
                    {error.message || 'Connection failed'}
                  </Text>
                </View>
              )}

              {/* Connect Button */}
              <PrimaryButton
                onPress={handleConnect}
                disabled={!serverUrl.trim() || isConnecting}
                loading={isConnecting}
                icon="flash"
              >
                {isConnecting ? 'Connecting...' : 'Connect'}
              </PrimaryButton>
            </GlassCard>

            {/* Recent Connections */}
            {recentUrls.length > 0 && !isConnecting && (
              <View style={styles.recentSection}>
                <Text style={styles.sectionLabel}>RECENT</Text>
                {recentUrls.map((url, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.recentItem}
                    onPress={() => handleQuickConnect(url)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.recentIconBg}>
                      <Ionicons name="time-outline" size={18} color={colors.primary} />
                    </View>
                    <Text style={styles.recentText} numberOfLines={1}>{url}</Text>
                    <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Quick Guide */}
            <View style={styles.guideSection}>
              <Text style={styles.sectionLabel}>QUICK START</Text>
              <View style={styles.stepsRow}>
                {[
                  { num: '1', icon: 'terminal-outline', text: 'Start server' },
                  { num: '2', icon: 'qr-code-outline', text: 'Scan QR' },
                  { num: '3', icon: 'flash-outline', text: 'Connect' },
                ].map((step, i) => (
                  <View key={i} style={styles.stepItem}>
                    <View style={styles.stepIconBg}>
                      <Ionicons name={step.icon} size={20} color={colors.primary} />
                    </View>
                    <Text style={styles.stepText}>{step.text}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Version */}
            <Text style={styles.version}>v1.0.0</Text>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      <QRScanner
        visible={showScanner}
        onScan={handleQRScan}
        onClose={() => setShowScanner(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  orbContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  orb: {
    position: 'absolute',
    borderRadius: 999,
  },
  orb1: {
    width: 320,
    height: 320,
    backgroundColor: colors.primaryDark,
    opacity: 0.12,
    top: -120,
    right: -100,
  },
  orb2: {
    width: 280,
    height: 280,
    backgroundColor: colors.tertiary,
    opacity: 0.06,
    bottom: 80,
    left: -100,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  content: {
    flex: 1,
    paddingTop: spacing.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoContainer: {
    position: 'relative',
    marginBottom: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    width: 120,
    height: 120,
  },
  logoGlow: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: colors.primaryDark,
    opacity: 0.25,
  },
  logoWrapper: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    width: 100,
    height: 100,
    borderRadius: 20,
  },
  connectingOverlay: {
    position: 'absolute',
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
  },
  title: {
    fontSize: fontSize.display,
    fontWeight: fontWeight.bold,
    color: colors.text,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  glassCard: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.xxl,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    padding: spacing.xl,
    marginBottom: spacing.lg,
  },
  connectionCard: {
    marginTop: spacing.md,
  },
  cardTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceVariant,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  inputWrapperFocused: {
    borderColor: colors.primary,
    backgroundColor: colors.inputBgFocus,
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    height: 52,
    fontSize: fontSize.md,
    color: colors.text,
  },
  qrButton: {
    padding: spacing.sm,
    marginLeft: spacing.sm,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.errorMuted,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  errorIcon: {
    marginRight: spacing.sm,
  },
  errorText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.error,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: borderRadius.xl,
    gap: spacing.sm,
  },
  primaryButtonDisabled: {
    opacity: 0.5,
  },
  primaryButtonText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.white,
  },
  primaryButtonTextDisabled: {
    color: colors.textMuted,
  },
  recentSection: {
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.textTertiary,
    letterSpacing: 1.5,
    marginBottom: spacing.md,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceVariant,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  recentIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  recentText: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.text,
  },
  guideSection: {
    marginBottom: spacing.xl,
  },
  stepsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stepItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.surfaceVariant,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginHorizontal: spacing.xs,
  },
  stepIconBg: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  stepText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  version: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textAlign: 'center',
  },
});

export default ConnectScreen;
