import { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ActivityIndicator, ScrollView, Alert,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { getQRData } from '../../services/api';
import { Colors } from '../../constants/Colors';

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scanned, setScanned] = useState(false);

  const handleBarcode = async ({ data }) => {
    if (scanned || loading) return;
    setScanned(true);
    setLoading(true);
    setScanning(false);

    try {
      const id = data.includes('/') ? data.split('/').pop() : data;
      const res = await getQRData(id);
      setResult(res.data?.data || res.data);
    } catch (err) {
      Alert.alert(
        'QR Error',
        err?.response?.status === 404
          ? 'Batch not found. This QR may not be from KrishiTrace.'
          : 'Failed to fetch trace data. Check your internet connection.',
        [{ text: 'OK', onPress: () => setScanned(false) }]
      );
    } finally {
      setLoading(false);
    }
  };

  if (!permission) {
    return <View style={styles.center}><ActivityIndicator color={Colors.primary} /></View>;
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={{ fontSize: 48, marginBottom: 16 }}>📷</Text>
        <Text style={styles.permTitle}>Camera Access Required</Text>
        <Text style={styles.permSubtitle}>KrishiTrace needs camera access to scan QR codes on harvest batches.</Text>
        <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
          <Text style={styles.permBtnText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (result) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.resultContent}>
        <View style={styles.resultHeader}>
          <Text style={styles.resultIcon}>✅</Text>
          <Text style={styles.resultTitle}>Trace Found</Text>
          <Text style={styles.resultSubtitle}>Supply chain verified in KrishiTrace records</Text>
        </View>

        <Section title="🌾 Crop Information">
          <Row label="Crop" value={result.cropType || result.crop || '—'} />
          <Row label="Quantity" value={`${result.quantity || '—'} ${result.unit || 'kg'}`} />
          <Row label="Status" value={result.status || '—'} highlight />
        </Section>

        <Section title="📍 Origin">
          <Row label="Location" value={result.location || '—'} />
          <Row label="Harvest Date" value={result.harvestDate ? new Date(result.harvestDate).toDateString() : '—'} />
        </Section>

        {result.ledger && (
          <Section title="🔗 Ledger">
            <Row label="Block Hash" value={result.ledger.hash || '—'} mono />
            <Row label="Timestamp" value={result.ledger.timestamp ? new Date(result.ledger.timestamp).toLocaleString() : '—'} />
            <Row label="Verified By" value={result.ledger.verifiedBy || '—'} />
          </Section>
        )}

        {result.iot && (
          <Section title="📡 IoT Sensor Data">
            <Row label="Temperature" value={result.iot.temperature ? `${result.iot.temperature}°C` : '—'} />
            <Row label="Humidity" value={result.iot.humidity ? `${result.iot.humidity}%` : '—'} />
          </Section>
        )}

        <TouchableOpacity
          style={styles.scanAgainBtn}
          onPress={() => { setResult(null); setScanned(false); setScanning(true); }}
        >
          <Text style={styles.scanAgainText}>Scan Another QR</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  if (scanning) {
    return (
      <View style={styles.container}>
        <CameraView
          style={StyleSheet.absoluteFillObject}
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={handleBarcode}
        />
        <View style={styles.overlay}>
          <View style={styles.scanFrame} />
          <Text style={styles.scanHint}>Point camera at a KrishiTrace QR code</Text>
        </View>
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.scanHint}>Fetching trace data...</Text>
          </View>
        )}
        <TouchableOpacity style={styles.cancelScanBtn} onPress={() => setScanning(false)}>
          <Text style={styles.cancelScanText}>✕ Cancel</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.center}>
      <Text style={{ fontSize: 80 }}>📷</Text>
      <Text style={styles.scanTitle}>QR Trace Scanner</Text>
      <Text style={styles.scanSubtitle}>
        Scan any KrishiTrace QR code to view the full farm-to-table supply chain trace.
      </Text>
      <TouchableOpacity style={styles.startBtn} onPress={() => setScanning(true)}>
        <Text style={styles.startBtnText}>Start Scanning</Text>
      </TouchableOpacity>
    </View>
  );
}

const Section = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.sectionCard}>{children}</View>
  </View>
);

const Row = ({ label, value, highlight, mono }) => (
  <View style={styles.row}>
    <Text style={styles.rowLabel}>{label}</Text>
    <Text
      style={[
        styles.rowValue,
        highlight && { color: Colors.primary },
        mono && { fontFamily: 'monospace', fontSize: 11 },
      ]}
      numberOfLines={2}
    >
      {value}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.bg, padding: 32 },
  resultContent: { padding: 20, paddingTop: 56, paddingBottom: 60 },

  permTitle: { color: Colors.textPrimary, fontSize: 20, fontWeight: '700', textAlign: 'center' },
  permSubtitle: { color: Colors.textSecondary, fontSize: 14, textAlign: 'center', marginTop: 8, marginBottom: 24 },
  permBtn: { backgroundColor: Colors.primary, paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12 },
  permBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  scanTitle: { color: Colors.textPrimary, fontSize: 24, fontWeight: '800', marginTop: 16, textAlign: 'center' },
  scanSubtitle: { color: Colors.textSecondary, fontSize: 14, textAlign: 'center', marginTop: 8, lineHeight: 22, marginBottom: 32 },
  startBtn: { backgroundColor: Colors.primary, paddingHorizontal: 48, paddingVertical: 16, borderRadius: 14 },
  startBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },

  overlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  scanFrame: {
    width: 240,
    height: 240,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: Colors.primary,
    backgroundColor: 'transparent',
    marginBottom: 24,
  },
  scanHint: { color: '#fff', fontWeight: '600', textAlign: 'center', marginTop: 8 },
  loadingOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000000aa' },
  cancelScanBtn: { position: 'absolute', top: 56, right: 20, backgroundColor: '#00000088', borderRadius: 20, padding: 10 },
  cancelScanText: { color: '#fff', fontWeight: '700' },

  resultHeader: { alignItems: 'center', marginBottom: 28 },
  resultIcon: { fontSize: 52, marginBottom: 8 },
  resultTitle: { fontSize: 24, fontWeight: '800', color: Colors.textPrimary },
  resultSubtitle: { color: Colors.textSecondary, fontSize: 13, marginTop: 4, textAlign: 'center' },

  section: { marginBottom: 20 },
  sectionTitle: { color: Colors.textSecondary, fontSize: 12, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 },
  sectionCard: { backgroundColor: Colors.bgCard, borderRadius: 14, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.border },
  rowLabel: { color: Colors.textSecondary, fontSize: 13, flex: 1 },
  rowValue: { color: Colors.textPrimary, fontSize: 13, fontWeight: '600', flex: 2, textAlign: 'right' },

  scanAgainBtn: { backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 12 },
  scanAgainText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
