// Input Bar Component - Modern Chat Style
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  Animated,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import {
  colors,
  spacing,
  borderRadius,
  fontSize,
} from '../constants/theme';

// Animated send button
function SendButton({ onPress, disabled, loading }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (loading) {
      const spin = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      );
      spin.start();
      return () => spin.stop();
    } else {
      rotateAnim.setValue(0);
    }
  }, [loading]);

  const handlePressIn = () => {
    if (!disabled) {
      Animated.spring(scaleAnim, { toValue: 0.9, useNativeDriver: true }).start();
    }
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      activeOpacity={1}
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <LinearGradient
          colors={disabled ? [colors.backgroundCard, colors.backgroundCard] : [colors.primary, colors.primaryDark]}
          style={styles.sendButton}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Animated.View style={loading ? { transform: [{ rotate: spin }] } : {}}>
            <Ionicons
              name={loading ? "sync-outline" : "arrow-up"}
              size={22}
              color={disabled ? colors.textMuted : colors.white}
            />
          </Animated.View>
        </LinearGradient>
      </Animated.View>
    </TouchableOpacity>
  );
}

// Stop button with animation
function StopButton({ onPress }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.1, duration: 500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.9, useNativeDriver: true }).start();
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
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <View style={styles.stopButtonOuter}>
          <Animated.View style={[styles.stopButtonPulse, { transform: [{ scale: pulseAnim }] }]} />
          <View style={styles.stopButton}>
            <View style={styles.stopIcon} />
          </View>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

export function InputBar({
  onSend,
  onStop,
  isGenerating = false,
  isConnected = true,
  placeholder = 'Message...',
}) {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);

  const handleSend = async () => {
    if (!message.trim() || isSending || !isConnected) return;

    const text = message.trim();
    setMessage('');
    setIsSending(true);
    Keyboard.dismiss();

    try {
      await onSend(text);
    } catch (e) {
      console.error('Send error:', e);
    }

    setIsSending(false);
  };

  const handleStop = async () => {
    if (onStop) {
      await onStop();
    }
  };

  const canSend = message.trim().length > 0 && isConnected && !isGenerating;

  return (
    <View style={styles.container}>
      <View style={[styles.inputWrapper, isFocused && styles.inputWrapperFocused]}>
        <TextInput
          ref={inputRef}
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          multiline
          maxLength={10000}
          editable={isConnected && !isGenerating}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          textAlignVertical="center"
          keyboardAppearance="dark"
          returnKeyType="default"
          blurOnSubmit={false}
        />
      </View>

      {isGenerating ? (
        <StopButton onPress={handleStop} />
      ) : (
        <SendButton
          onPress={handleSend}
          disabled={!canSend}
          loading={isSending}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    paddingBottom: Platform.OS === 'ios' ? spacing.md : spacing.lg,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.outlineVariant,
    gap: spacing.sm,
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: colors.surfaceVariant,
    borderRadius: borderRadius.xxl,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    paddingHorizontal: spacing.lg,
    paddingVertical: Platform.OS === 'ios' ? spacing.sm : spacing.xs,
    minHeight: 48,
    maxHeight: 120,
    justifyContent: 'center',
  },
  inputWrapperFocused: {
    borderColor: colors.primary,
    backgroundColor: colors.inputBgFocus,
  },
  input: {
    fontSize: fontSize.md,
    color: colors.text,
    maxHeight: 100,
    paddingTop: Platform.OS === 'android' ? 8 : 0,
    paddingBottom: Platform.OS === 'android' ? 8 : 0,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stopButtonOuter: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stopButtonPulse: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.errorMuted,
  },
  stopButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stopIcon: {
    width: 14,
    height: 14,
    borderRadius: 2,
    backgroundColor: colors.white,
  },
});

export default InputBar;
