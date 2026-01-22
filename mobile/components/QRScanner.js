// QR Scanner Component
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../constants/theme';

export function QRScanner({ visible, onScan, onClose }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  // Reset scanned state when modal opens
  useEffect(() => {
    if (visible) {
      setScanned(false);
    }
  }, [visible]);

  // Handle barcode scanned
  const handleBarcodeScanned = ({ type, data }) => {
    if (scanned) return;

    setScanned(true);

    // Check if data looks like a URL
    if (data.startsWith('http://') || data.startsWith('https://') || data.includes(':')) {
      onScan(data);
      onClose();
    } else {
      Alert.alert(
        'Invalid QR Code',
        'This QR code does not contain a valid server URL.',
        [
          { text: 'Scan Again', onPress: () => setScanned(false) },
          { text: 'Cancel', onPress: onClose, style: 'cancel' },
        ]
      );
    }
  };

  // Permission not determined yet
  if (!permission) {
    return (
      <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
        <View style={styles.container}>
          <Text style={styles.messageText}>Requesting camera permission...</Text>
        </View>
      </Modal>
    );
  }

  // Permission denied
  if (!permission.granted) {
    return (
      <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
        <View style={styles.container}>
          <View style={styles.messageContainer}>
            <Ionicons name="camera-outline" size={64} color={colors.textSecondary} />
            <Text style={styles.titleText}>Camera Permission Required</Text>
            <Text style={styles.messageText}>
              We need camera access to scan QR codes
            </Text>
            <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
              <Text style={styles.permissionButtonText}>Grant Permission</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Camera View */}
        <CameraView
          style={styles.camera}
          facing="back"
          barcodeScannerSettings={{
            barcodeTypes: ['qr'],
          }}
          onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
        >
          {/* Overlay */}
          <View style={styles.overlay}>
            {/* Top bar */}
            <View style={styles.topBar}>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Ionicons name="close" size={28} color={colors.text} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Scan QR Code</Text>
              <View style={{ width: 44 }} />
            </View>

            {/* Scanning frame */}
            <View style={styles.scanArea}>
              <View style={styles.scanFrame}>
                <View style={[styles.corner, styles.topLeft]} />
                <View style={[styles.corner, styles.topRight]} />
                <View style={[styles.corner, styles.bottomLeft]} />
                <View style={[styles.corner, styles.bottomRight]} />
              </View>
            </View>

            {/* Instructions */}
            <View style={styles.bottomArea}>
              <Text style={styles.instructionText}>
                Point your camera at the Luma server QR code
              </Text>
              {scanned && (
                <TouchableOpacity
                  style={styles.rescanButton}
                  onPress={() => setScanned(false)}
                >
                  <Ionicons name="refresh" size={20} color={colors.text} />
                  <Text style={styles.rescanText}>Scan Again</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </CameraView>
      </View>
    </Modal>
  );
}

const SCAN_FRAME_SIZE = 250;
const CORNER_SIZE = 30;
const CORNER_BORDER_WIDTH = 4;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.xxl,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  closeButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
  },
  scanArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: SCAN_FRAME_SIZE,
    height: SCAN_FRAME_SIZE,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderColor: colors.primary,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: CORNER_BORDER_WIDTH,
    borderLeftWidth: CORNER_BORDER_WIDTH,
    borderTopLeftRadius: borderRadius.sm,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: CORNER_BORDER_WIDTH,
    borderRightWidth: CORNER_BORDER_WIDTH,
    borderTopRightRadius: borderRadius.sm,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: CORNER_BORDER_WIDTH,
    borderLeftWidth: CORNER_BORDER_WIDTH,
    borderBottomLeftRadius: borderRadius.sm,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: CORNER_BORDER_WIDTH,
    borderRightWidth: CORNER_BORDER_WIDTH,
    borderBottomRightRadius: borderRadius.sm,
  },
  bottomArea: {
    padding: spacing.xl,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
  },
  instructionText: {
    color: colors.text,
    fontSize: fontSize.md,
    textAlign: 'center',
  },
  rescanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
  },
  rescanText: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    marginLeft: spacing.sm,
  },
  messageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  titleText: {
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  messageText: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  permissionButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  permissionButtonText: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  cancelButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  cancelButtonText: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
  },
});

export default QRScanner;
