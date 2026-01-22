// Chat View Component - Modern Design with Snapshot Rendering
import React, { useRef, useCallback, useEffect } from 'react';
import { View, StyleSheet, Text, Animated } from 'react-native';
import { WebView } from 'react-native-webview';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../constants/theme';
import { ErrorDisplay } from './ErrorDisplay';

// Loading indicator with pulse animation
function LoadingState() {
  const pulseAnim = useRef(new Animated.Value(0.3)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 0.3, duration: 1000, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(scaleAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
          Animated.timing(scaleAnim, { toValue: 0.95, duration: 1000, useNativeDriver: true }),
        ]),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  return (
    <View style={styles.stateContainer}>
      <Animated.View style={[styles.loadingIcon, { opacity: pulseAnim, transform: [{ scale: scaleAnim }] }]}>
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          style={styles.loadingGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name="chatbubbles-outline" size={32} color={colors.white} />
        </LinearGradient>
      </Animated.View>
      <Text style={styles.stateTitle}>Loading Chat</Text>
      <View style={styles.loadingDots}>
        <AnimatedDot delay={0} />
        <AnimatedDot delay={200} />
        <AnimatedDot delay={400} />
      </View>
    </View>
  );
}

// Animated loading dot
function AnimatedDot({ delay }) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 400, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [delay]);

  return <Animated.View style={[styles.loadingDot, { opacity }]} />;
}

// Empty state when no snapshot
function EmptyState() {
  return (
    <View style={styles.stateContainer}>
      <View style={styles.emptyIcon}>
        <LinearGradient
          colors={[colors.primaryMuted, 'rgba(200, 191, 255, 0.05)']}
          style={styles.emptyGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name="chatbubble-ellipses-outline" size={40} color={colors.primary} />
        </LinearGradient>
      </View>
      <Text style={styles.stateTitle}>No Chat Active</Text>
      <Text style={styles.stateSubtitle}>Open a chat in Antigravity to see it here</Text>

      {/* Hint card */}
      <View style={styles.hintCard}>
        <View style={styles.hintIconContainer}>
          <Ionicons name="information-circle-outline" size={18} color={colors.primary} />
        </View>
        <Text style={styles.hintText}>
          Start a conversation on your desktop and it will appear here in real-time
        </Text>
      </View>
    </View>
  );
}

export function ChatView({ snapshot, isLoading, error, onRetry, onScroll, onElementClick }) {
  const webViewRef = useRef(null);

  // Build HTML content from snapshot
  const buildHTML = useCallback(() => {
    if (!snapshot || !snapshot.html) {
      return null;
    }

    // Inject custom styles and click handlers
    const customCSS = `
      <style>
        body {
          background-color: ${snapshot.backgroundColor || colors.background} !important;
          color: ${snapshot.color || colors.text} !important;
          font-family: ${snapshot.fontFamily || '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'} !important;
          margin: 0;
          padding: 12px;
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          user-select: none;
        }

        /* Hide scrollbars */
        ::-webkit-scrollbar { display: none; }

        /* Make thinking blocks tappable */
        [class*="thinking"], [class*="thought"] {
          cursor: pointer;
        }

        /* Improve touch targets */
        button, [role="button"] {
          min-height: 44px;
          min-width: 44px;
        }

        /* Better text rendering */
        * {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        /* Smooth scroll behavior */
        html {
          scroll-behavior: smooth;
        }
      </style>
    `;

    const customJS = `
      <script>
        // Send scroll position to React Native
        let lastScrollTop = 0;
        document.addEventListener('scroll', function(e) {
          const target = e.target === document ? document.documentElement : e.target;
          const scrollTop = target.scrollTop;
          const scrollHeight = target.scrollHeight;
          const clientHeight = target.clientHeight;
          const scrollPercent = scrollTop / (scrollHeight - clientHeight);

          if (Math.abs(scrollTop - lastScrollTop) > 10) {
            lastScrollTop = scrollTop;
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'scroll',
              scrollTop,
              scrollPercent
            }));
          }
        }, true);

        // Handle element clicks
        document.addEventListener('click', function(e) {
          const target = e.target;
          const classes = target.className || '';

          // Check for thinking/thought blocks
          if (classes.includes('thinking') || classes.includes('thought')) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'click',
              selector: '.' + classes.split(' ')[0],
              text: target.textContent?.substring(0, 50)
            }));
          }
        });

        // Auto-scroll to bottom on content change
        const observer = new MutationObserver(() => {
          window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        });
        observer.observe(document.body, { childList: true, subtree: true });
      </script>
    `;

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
          <style>${snapshot.css || ''}</style>
          ${customCSS}
        </head>
        <body>
          ${snapshot.html}
          ${customJS}
        </body>
      </html>
    `;
  }, [snapshot]);

  // Handle messages from WebView
  const handleMessage = useCallback((event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      if (data.type === 'scroll' && onScroll) {
        onScroll(data.scrollPercent);
      } else if (data.type === 'click' && onElementClick) {
        onElementClick(data.selector, data.text);
      }
    } catch (e) {
      console.error('WebView message error:', e);
    }
  }, [onScroll, onElementClick]);

  // Show error if there's an error and no snapshot
  if (error && !snapshot) {
    return (
      <ErrorDisplay
        error={error}
        onRetry={onRetry}
      />
    );
  }

  // Show loading state
  if (isLoading && !snapshot) {
    return <LoadingState />;
  }

  // Show empty state if no snapshot
  const html = buildHTML();
  if (!html) {
    return <EmptyState />;
  }

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ html }}
        style={styles.webview}
        onMessage={handleMessage}
        scrollEnabled={true}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        bounces={true}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        originWhitelist={['*']}
        mixedContentMode="always"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  stateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.xl,
  },
  loadingIcon: {
    marginBottom: spacing.lg,
  },
  loadingGradient: {
    width: 72,
    height: 72,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingDots: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  emptyIcon: {
    marginBottom: spacing.lg,
  },
  emptyGradient: {
    width: 88,
    height: 88,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primaryMuted,
  },
  stateTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  stateSubtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  hintCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    maxWidth: 300,
    gap: spacing.sm,
  },
  hintIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  hintText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: fontSize.sm * 1.5,
  },
});

export default ChatView;
