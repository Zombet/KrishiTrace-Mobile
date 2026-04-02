import { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Modal, TextInput, Alert, ActivityIndicator, RefreshControl,
  Animated, ScrollView, Platform,
} from 'react-native';
import Voice from '@react-native-voice/voice';
import { getHarvests, addHarvest } from '../../services/api';
import api from '../../services/api';
import { Colors } from '../../constants/Colors';

const CROPS = ['Rice', 'Wheat', 'Tomato', 'Onion', 'Mango', 'Cotton', 'Sugarcane', 'Maize', 'Potato', 'Banana'];

const LANGUAGES = [
  { code: 'en-IN', label: 'EN', name: 'English' },
  { code: 'hi-IN', label: 'हि', name: 'Hindi' },
  { code: 'te-IN', label: 'తె', name: 'Telugu' },
  { code: 'kn-IN', label: 'ಕ', name: 'Kannada' },
  { code: 'ta-IN', label: 'த',  name: 'Tamil' },
];

const VOICE_HINTS = {
  'en-IN': '"Tomato 50 kg harvest date 10th March payout 30 rupees"',
  'hi-IN': '"टमाटर 50 किलो कटाई तारीख 10 मार्च पेआउट 30 रुपये"',
  'te-IN': '"టమాటా 50 కేజీలు కోత తేదీ 10 మార్చి పేమెంట్ 30 రూపాయలు"',
  'kn-IN': '"ಟೊಮ್ಯಾಟೊ 50 ಕಿಲೋ ಕೊಯ್ಲು ದಿನಾಂಕ 10 ಮಾರ್ಚ್ ಪಾವತಿ 30 ರೂಪಾಯಿ"',
  'ta-IN': '"தக்காளி 50 கிலோ அறுவடை தேதி 10 மார்ச் கட்டணம் 30 ரூபாய்"',
};

const statusColor = (s) => {
  if (!s) return Colors.textSecondary;
  if (s.toLowerCase().includes('verif')) return Colors.success;
  if (s.toLowerCase().includes('transit')) return Colors.gold;
  return Colors.blue;
};

const HarvestCard = ({ item }) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <Text style={styles.cropName}>{item.cropType || 'Crop'}</Text>
      <View style={[styles.badge, { backgroundColor: statusColor(item.status) + '22' }]}>
        <Text style={[styles.badgeText, { color: statusColor(item.status) }]}>
          {item.fairPriceCompliant === true ? '✅ Compliant' :
           item.fairPriceCompliant === false ? '⚠️ Violation' :
           item.status || 'Recorded'}
        </Text>
      </View>
    </View>
    <Text style={styles.meta}>📍 {item.farmAddress || item.location || 'Location not set'}</Text>
    <Text style={styles.meta}>⚖️  {item.quantity} {item.unit || 'kg'}</Text>
    {item.payoutBreakdown?.farmerPayout && (
      <Text style={styles.meta}>💰 ₹{item.payoutBreakdown.farmerPayout}/kg farmer payout</Text>
    )}
    <Text style={styles.meta}>📅 {item.harvestDate ? new Date(item.harvestDate).toDateString() : '—'}</Text>
  </View>
);

export default function HarvestScreen() {
  const [harvests, setHarvests]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modal, setModal]           = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Voice states
  const [voiceModal, setVoiceModal] = useState(false);
  const [voiceLang, setVoiceLang]   = useState('en-IN');
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [parsing, setParsing]       = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const [form, setForm] = useState({
    cropType: '', location: '', quantity: '', unit: 'kg',
    farmerPayout: '', finalConsumerPrice: '', transportCost: '', notes: '',
  });

  useEffect(() => { 
    load(); 
    
    // Voice event listeners
    Voice.onSpeechStart = () => setIsListening(true);
    Voice.onSpeechEnd = () => setIsListening(false);
    Voice.onSpeechError = (e) => {
      setIsListening(false);
      stopPulse();
      // Code 7 is usually No match/user didn't speak
      if (e.error?.code !== '7') {
         Alert.alert('Microphone Error', e.error?.message || 'Could not connect to microphone.');
      }
    };
    Voice.onSpeechResults = (e) => {
      if (e.value && e.value.length > 0) {
        setTranscript(e.value[0]);
      }
    };

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const load = async () => {
    try {
      const res = await getHarvests();
      setHarvests(res.data?.data || res.data || []);
    } catch (_) {}
    setLoading(false);
    setRefreshing(false);
  };

  // Pulse animation for mic button
  const startPulse = () => {
    pulseAnim.setValue(1);
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.25, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,   duration: 800, useNativeDriver: true }),
      ])
    ).start();
  };
  
  const stopPulse = () => { pulseAnim.stopAnimation(); pulseAnim.setValue(1); };

  const startListeningNode = async () => {
    try {
      setTranscript('');
      setIsListening(true);
      startPulse();
      await Voice.start(voiceLang);
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to start voice recognition.');
      setIsListening(false);
      stopPulse();
    }
  };

  const stopListeningNode = async () => {
    try {
      setIsListening(false);
      stopPulse();
      await Voice.stop();
    } catch (e) {
      console.error(e);
    }
  };

  const handleVoiceSubmit = async () => {
    if (!transcript.trim()) {
      Alert.alert('No speech detected', 'Please say something to log the harvest.');
      return;
    }
    setParsing(true);
    try {
      const { data } = await api.post('/harvest/voice', {
        transcript: transcript.trim(),
        language: voiceLang.split('-')[0], // e.g. "en" or "hi"
      });
      const p = data.parsed;
      setForm((f) => ({
        ...f,
        cropType:            p.cropType            || f.cropType,
        quantity:            p.quantity != null     ? String(p.quantity)            : f.quantity,
        unit:                p.unit                 || f.unit,
        farmerPayout:        p.farmerPayout != null ? String(p.farmerPayout)        : f.farmerPayout,
        finalConsumerPrice:  p.finalConsumerPrice != null ? String(p.finalConsumerPrice) : f.finalConsumerPrice,
        transportCost:       p.transportCost != null ? String(p.transportCost)      : f.transportCost,
      }));
      setVoiceModal(false);
      setTranscript('');
      setModal(true);
      Alert.alert('✅ AI Parsed!', `Extracted: ${p.cropType || ''} ${p.quantity || ''} ${p.unit || ''}. Review and submit.`);
    } catch (err) {
      Alert.alert('Parse Error', err?.response?.data?.message || 'Could not parse. Please fill manually.');
    } finally {
      setParsing(false);
    }
  };

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  const handleAdd = async () => {
    if (!form.cropType || !form.quantity || !form.farmerPayout || !form.finalConsumerPrice) {
      Alert.alert('Missing Fields', 'Crop, quantity, farmer payout and consumer price are required.');
      return;
    }
    setSubmitting(true);
    try {
      await addHarvest({
        ...form,
        quantity:           Number(form.quantity),
        farmerPayout:       Number(form.farmerPayout),
        finalConsumerPrice: Number(form.finalConsumerPrice),
        transportCost:      Number(form.transportCost || 0),
      });
      setModal(false);
      setForm({ cropType: '', location: '', quantity: '', unit: 'kg', farmerPayout: '', finalConsumerPrice: '', transportCost: '', notes: '' });
      load();
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to add harvest.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={Colors.primary} /></View>;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🌾 My Harvests</Text>
        <View style={styles.headerBtns}>
          <TouchableOpacity style={styles.voiceBtn} onPress={() => { setVoiceModal(true); setTranscript(''); }}>
            <Text style={styles.voiceBtnText}>🎙 Voice</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.addBtn} onPress={() => setModal(true)}>
            <Text style={styles.addBtnText}>+ Add</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={harvests}
        keyExtractor={(item, i) => item._id || String(i)}
        renderItem={({ item }) => <HarvestCard item={item} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🌱</Text>
            <Text style={styles.emptyText}>No harvests yet.</Text>
            <Text style={styles.emptySubText}>Tap 🎙 Voice to log with AI or + Add to fill manually.</Text>
          </View>
        }
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={Colors.primary} />}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
      />

      {/* ── Voice Input Modal ── */}
      <Modal visible={voiceModal} animationType="slide" transparent onRequestClose={() => { setVoiceModal(false); stopListeningNode(); }}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>🎙 Native Voice Input</Text>
            <Text style={styles.modalSubtitle}>
              Speak natively into your device {Platform.OS === 'android' ? '(Requires Dev Build/APK)' : ''}
            </Text>

            {/* Language Selector */}
            <Text style={styles.label}>Language</Text>
            <View style={styles.langRow}>
              {LANGUAGES.map((l) => (
                <TouchableOpacity
                  key={l.code}
                  style={[styles.langBtn, voiceLang === l.code && styles.langBtnActive]}
                  onPress={() => setVoiceLang(l.code)}
                >
                  <Text style={[styles.langBtnText, voiceLang === l.code && styles.langBtnTextActive]}>
                    {l.label}
                  </Text>
                  <Text style={styles.langName}>{l.name}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Hint */}
            <View style={styles.hintBox}>
              <Text style={styles.hintLabel}>Say exactly this:</Text>
              <Text style={styles.hintText}>{VOICE_HINTS[voiceLang]}</Text>
            </View>

            {/* Live Transcript */}
            <View style={styles.transcriptBox}>
              {transcript ? (
                 <Text style={styles.transcriptText}>"{transcript}"</Text>
              ) : (
                 <Text style={styles.transcriptPlaceholder}>
                   {isListening ? "Listening..." : "Tap the big mic icon below and speak..."}
                 </Text>
              )}
            </View>

            {/* Mic Record Button */}
            <View style={styles.micArea}>
              <TouchableOpacity onPress={isListening ? stopListeningNode : startListeningNode} activeOpacity={0.8}>
                <Animated.View style={[styles.micRing, isListening && { backgroundColor: Colors.error + '44' }, { transform: [{ scale: pulseAnim }] }]}>
                  <View style={[styles.micBtn, isListening && { backgroundColor: Colors.error }]}>
                    <Text style={[styles.micIcon, { color: '#fff' }]}>🎙</Text>
                  </View>
                </Animated.View>
              </TouchableOpacity>
              <Text style={[styles.micHint, isListening && { color: Colors.error, fontWeight: '700' }]}>
                {isListening ? 'Tap to stop recording' : 'Tap to start speaking'}
              </Text>
            </View>

            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => { setVoiceModal(false); stopListeningNode(); setTranscript(''); }}>
                <Text style={{ color: Colors.textSecondary, fontWeight: '600' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.submitBtn, !transcript && { opacity: 0.5 }]} 
                onPress={handleVoiceSubmit} 
                disabled={parsing || !transcript}
              >
                {parsing
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.submitBtnText}>🤖 Parse with AI</Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Add Harvest Modal ── */}
      <Modal visible={modal} animationType="slide" transparent onRequestClose={() => setModal(false)}>
        <View style={styles.modalOverlay}>
          <ScrollView>
            <View style={[styles.modalSheet, { marginTop: 60 }]}>
              <Text style={styles.modalTitle}>Add Harvest Batch</Text>

              <Text style={styles.label}>Crop Type</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 4 }}>
                <View style={styles.cropRow}>
                  {CROPS.map((c) => (
                    <TouchableOpacity
                      key={c}
                      style={[styles.cropChip, form.cropType.toLowerCase() === c.toLowerCase() && styles.cropChipActive]}
                      onPress={() => set('cropType')(c)}
                    >
                      <Text style={[styles.cropChipText, form.cropType.toLowerCase() === c.toLowerCase() && styles.cropChipTextActive]}>{c}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              <Text style={styles.label}>Location / Village</Text>
              <TextInput style={styles.input} placeholder="e.g. Kurnool, AP" placeholderTextColor={Colors.textMuted}
                value={form.location} onChangeText={set('location')} />

              <View style={styles.row}>
                <View style={{ flex: 2 }}>
                  <Text style={styles.label}>Quantity</Text>
                  <TextInput style={styles.input} placeholder="500" placeholderTextColor={Colors.textMuted}
                    value={form.quantity} onChangeText={set('quantity')} keyboardType="numeric" />
                </View>
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={styles.label}>Unit</Text>
                  <TouchableOpacity
                    style={[styles.input, { justifyContent: 'center', alignItems: 'center', height: 50 }]}
                    onPress={() => set('unit')(form.unit === 'kg' ? 'quintal' : form.unit === 'quintal' ? 'ton' : 'kg')}
                  >
                    <Text style={{ color: Colors.textPrimary, fontWeight: '600' }}>{form.unit}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={styles.label}>Farmer Payout (₹/kg) *</Text>
              <TextInput style={styles.input} placeholder="e.g. 30" placeholderTextColor={Colors.textMuted}
                value={form.farmerPayout} onChangeText={set('farmerPayout')} keyboardType="numeric" />

              <Text style={styles.label}>Consumer Price (₹/kg) *</Text>
              <TextInput style={styles.input} placeholder="e.g. 55" placeholderTextColor={Colors.textMuted}
                value={form.finalConsumerPrice} onChangeText={set('finalConsumerPrice')} keyboardType="numeric" />

              <Text style={styles.label}>Transport Cost (₹/kg)</Text>
              <TextInput style={styles.input} placeholder="e.g. 5" placeholderTextColor={Colors.textMuted}
                value={form.transportCost} onChangeText={set('transportCost')} keyboardType="numeric" />

              <View style={styles.modalBtns}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setModal(false)}>
                  <Text style={{ color: Colors.textSecondary, fontWeight: '600' }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.submitBtn} onPress={handleAdd} disabled={submitting}>
                  {submitting
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={styles.submitBtnText}>Save to Ledger</Text>
                  }
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  center:    { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.bg },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 56, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  title:      { fontSize: 20, fontWeight: '800', color: Colors.textPrimary },
  headerBtns: { flexDirection: 'row', gap: 8 },
  voiceBtn:   { backgroundColor: Colors.blue, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  voiceBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  addBtn:     { backgroundColor: Colors.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  addBtnText: { color: '#fff', fontWeight: '700' },

  card: {
    backgroundColor: Colors.bgCard, borderRadius: 16, padding: 16,
    marginBottom: 12, borderWidth: 1, borderColor: Colors.border,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  cropName:   { fontSize: 17, fontWeight: '700', color: Colors.textPrimary, textTransform: 'capitalize' },
  badge:      { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText:  { fontSize: 12, fontWeight: '600' },
  meta:       { color: Colors.textSecondary, fontSize: 13, marginBottom: 4 },

  empty:       { alignItems: 'center', paddingTop: 80 },
  emptyIcon:   { fontSize: 52, marginBottom: 12 },
  emptyText:   { color: Colors.textPrimary, fontSize: 18, fontWeight: '600' },
  emptySubText:{ color: Colors.textSecondary, fontSize: 14, marginTop: 4, textAlign: 'center', paddingHorizontal: 20 },

  // Modals
  modalOverlay: { flex: 1, backgroundColor: '#000000aa', justifyContent: 'flex-end' },
  modalSheet:   {
    backgroundColor: Colors.bgCard, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingBottom: 40, borderWidth: 1, borderColor: Colors.border,
  },
  modalTitle:    { fontSize: 20, fontWeight: '800', color: Colors.textPrimary, marginBottom: 6 },
  modalSubtitle: { color: Colors.textSecondary, fontSize: 13, lineHeight: 20, marginBottom: 16 },

  // Voice Modal
  langRow:         { flexDirection: 'row', gap: 8, marginBottom: 16 },
  langBtn:         { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 12, backgroundColor: Colors.bgInput, borderWidth: 1, borderColor: Colors.border },
  langBtnActive:   { backgroundColor: Colors.primary, borderColor: Colors.primary },
  langBtnText:     { color: Colors.textSecondary, fontSize: 16, fontWeight: '700' },
  langBtnTextActive: { color: '#fff' },
  langName:        { color: Colors.textMuted, fontSize: 9, marginTop: 2 },

  transcriptBox:   { backgroundColor: Colors.bgInput, borderRadius: 12, padding: 16, minHeight: 80, justifyContent: 'center', marginBottom: 20, borderWidth: 1, borderColor: Colors.border },
  transcriptText:  { color: Colors.textPrimary, fontSize: 16, fontStyle: 'italic', textAlign: 'center' },
  transcriptPlaceholder: { color: Colors.textMuted, fontSize: 14, textAlign: 'center' },

  micArea: { alignItems: 'center', marginBottom: 16 },
  micRing: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.blue + '33', justifyContent: 'center', alignItems: 'center' },
  micBtn:  { width: 60, height: 60, borderRadius: 30, backgroundColor: Colors.blue, justifyContent: 'center', alignItems: 'center' },
  micIcon: { fontSize: 28 },
  micHint: { color: Colors.textSecondary, fontSize: 13, marginTop: 12 },

  hintBox:   { backgroundColor: Colors.bgInput, borderRadius: 12, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: Colors.border },
  hintLabel: { color: Colors.textMuted, fontSize: 11, marginBottom: 4 },
  hintText:  { color: Colors.textSecondary, fontSize: 12, fontStyle: 'italic' },

  // Form
  label:         { color: Colors.textSecondary, fontSize: 13, marginBottom: 6, marginTop: 12 },
  input:         { backgroundColor: Colors.bgInput, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, color: Colors.textPrimary, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },
  row:           { flexDirection: 'row' },
  cropRow:       { flexDirection: 'row', gap: 8, paddingVertical: 4 },
  cropChip:      { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: Colors.bgInput, borderWidth: 1, borderColor: Colors.border },
  cropChipActive:{ backgroundColor: Colors.primary, borderColor: Colors.primary },
  cropChipText:  { color: Colors.textSecondary, fontSize: 13 },
  cropChipTextActive: { color: '#fff', fontWeight: '600' },

  modalBtns:     { flexDirection: 'row', gap: 12, marginTop: 20 },
  cancelBtn:     { flex: 1, padding: 14, borderRadius: 12, alignItems: 'center', backgroundColor: Colors.bgInput },
  submitBtn:     { flex: 1, padding: 14, borderRadius: 12, alignItems: 'center', backgroundColor: Colors.primary },
  submitBtnText: { color: '#fff', fontWeight: '700' },
});
