// Input Bar Component
import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSize } from '../constants/theme';

export function InputBar({
  onSend,
  onStop,
  isGenerating = false,
  isConnected = true,
  placeholder = 'Type a message...',
}) {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

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

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          multiline
          maxLength={10000}
          editable={isConnected && !isGenerating}
        />
      </View>

      {isGenerating ? (
        <TouchableOpacity
          style={[styles.button, styles.stopButton]}
          onPress={handleStop}
        >
          <Ionicons name="stop" size={24} color={colors.text} />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[
            styles.button,
            styles.sendButton,
            (!message.trim() || !isConnected) && styles.buttonDisabled
          ]}
          onPress={handleSend}
          disabled={!message.trim() || isSending || !isConnected}
        >
          {isSending ? (
            <ActivityIndicator size="small" color={colors.text} />
          ) : (
            <Ionicons
              name="arrow-up"
              size={24}
              color={message.trim() && isConnected ? colors.text : colors.textMuted}
            />
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.backgroundSecondary,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  inputContainer: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    maxHeight: 120,
  },
  input: {
    color: colors.text,
    fontSize: fontSize.md,
    maxHeight: 100,
  },
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButton: {
    backgroundColor: colors.primary,
  },
  stopButton: {
    backgroundColor: colors.error,
  },
  buttonDisabled: {
    backgroundColor: colors.surfaceLight,
  },
});

export default InputBar;
