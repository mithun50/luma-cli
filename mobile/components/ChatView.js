// Chat View Component - Renders the snapshot HTML
import React, { useRef, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import { colors, spacing } from '../constants/theme';
import { ErrorDisplay } from './ErrorDisplay';

export function ChatView({ snapshot, isLoading, error, onRetry, onScroll, onElementClick }) {
  const webViewRef = useRef(null);

  // Build HTML content from snapshot
  const buildHTML = useCallback(() => {
    if (!snapshot || !snapshot.html) {
      return `
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              body {
                background-color: ${colors.background};
                color: ${colors.textSecondary};
                font-family: -apple-system, BlinkMacSystemFont, sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
                text-align: center;
              }
            </style>
          </head>
          <body>
            <div>
              <p>No chat snapshot available</p>
              <p style="font-size: 12px; opacity: 0.6;">Open a chat in Antigravity to see it here</p>
            </div>
          </body>
        </html>
      `;
    }

    // Inject custom styles and click handlers
    const customCSS = `
      <style>
        body {
          background-color: ${snapshot.backgroundColor || colors.background} !important;
          color: ${snapshot.color || colors.text} !important;
          font-family: ${snapshot.fontFamily || '-apple-system, BlinkMacSystemFont, sans-serif'} !important;
          margin: 0;
          padding: 8px;
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

  if (isLoading && !snapshot) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading chat...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ html: buildHTML() }}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: spacing.md,
    color: colors.textSecondary,
  },
});

export default ChatView;
