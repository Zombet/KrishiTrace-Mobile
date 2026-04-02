import { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Modal, TextInput, Alert, ActivityIndicator, RefreshControl,
} from 'react-native';
import { getHarvests, addHarvest } from '../../services/api';
import { Colors } from '../../constants/Colors';

const CROPS = ['Rice', 'Wheat', 'Tomato', 'Onion', 'Mango', 'Cotton', 'Sugarcane', 'Maize'];

const HarvestCard = ({ item }) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <Text style={styles.cropName}>{item.cropType || item.crop || 'Crop'}</Text>
      <View style={[styles.badge, { backgroundColor: statusColor(item.status) + '22' }]}>
        <Text style={[styles.badgeText, { color: statusColor(item.status) }]}>
          {item.status || 'Recorded'}
        </Text>
      </View>
    </View>
    <Text style={styles.meta}>📍 {item.location || 'Location not set'}</Text>
    <Text style={styles.meta}>⚖️  {item.quantity || '—'} {item.unit || 'kg'}</Text>
    <Text style={styles.meta}>📅 {item.harvestDate ? new Date(item.harvestDate).toDateString() : '—'}</Text>
    {item.farmerId && <Text style={styles.meta}>👤 {item.farmerId}</Text>}
  </View>
);

const statusColor = (s) => {
  if (!s) return Colors.textSecondary;
  if (s.toLowerCase().includes('verif')) return Colors.success;
  if (s.toLowerCase().includes('transit')) return Colors.gold;
  return Colors.blue;
};

export default function HarvestScreen() {
  const [harvests, setHarvests]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modal, setModal]         = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    cropType: '', location: '', quantity: '', unit: 'kg', notes: '',
  });

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const res = await getHarvests();
      setHarvests(res.data?.data || res.data || []);
    } catch (_) {}
    setLoading(false);
    setRefreshing(false);
  };

  const onRefresh = () => { setRefreshing(true); load(); };

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  const handleAdd = async () => {
    if (!form.cropType || !form.location || !form.quantity) {
      Alert.alert('Missing Fields', 'Crop, location and quantity are required.');
      return;
    }
    setSubmitting(true);
    try {
      await addHarvest({ ...form, quantity: Number(form.quantity) });
      setModal(false);
      setForm({ cropType: '', location: '', quantity: '', unit: 'kg', notes: '' });
      load();
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to add harvest.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🌾 Harvest Batches</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setModal(true)}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={harvests}
        keyExtractor={(item, i) => item._id || String(i)}
        renderItem={({ item }) => <HarvestCard item={item} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🌱</Text>
            <Text style={styles.emptyText}>No harvests recorded yet.</Text>
            <Text style={styles.emptySubText}>Tap "+ Add" to log your first batch.</Text>
          </View>
        }
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
      />

      {/* Add Harvest Modal */}
      <Modal visible={modal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Add Harvest Batch</Text>

            {/* Crop selector */}
            <Text style={styles.label}>Crop Type</Text>
            <View style={styles.cropGrid}>
              {CROPS.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[styles.cropChip, form.cropType === c && styles.cropChipActive]}
                  onPress={() => set('cropType')(c)}
                >
                  <Text style={[styles.cropChipText, form.cropType === c && styles.cropChipTextActive]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>

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
                  style={[styles.input, { justifyContent: 'center', alignItems: 'center' }]}
                  onPress={() => set('unit')(form.unit === 'kg' ? 'ton' : 'kg')}
                >
                  <Text style={{ color: Colors.textPrimary, fontWeight: '600' }}>{form.unit}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <Text style={styles.label}>Notes (optional)</Text>
            <TextInput style={[styles.input, { height: 70 }]} placeholder="Any extra info…"
              placeholderTextColor={Colors.textMuted} value={form.notes}
              onChangeText={set('notes')} multiline />

            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModal(false)}>
                <Text style={{ color: Colors.textSecondary, fontWeight: '600' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={handleAdd} disabled={submitting}>
                {submitting
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.submitBtnText}>Save Batch</Text>
                }
              </TouchableOpacity>
            </View>
          </View>
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
  title:   { fontSize: 20, fontWeight: '800', color: Colors.textPrimary },
  addBtn:  { backgroundColor: Colors.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 },
  addBtnText: { color: '#fff', fontWeight: '700' },

  card: {
    backgroundColor: Colors.bgCard, borderRadius: 16, padding: 16,
    marginBottom: 12, borderWidth: 1, borderColor: Colors.border,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  cropName:   { fontSize: 17, fontWeight: '700', color: Colors.textPrimary },
  badge:      { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText:  { fontSize: 12, fontWeight: '600' },
  meta:       { color: Colors.textSecondary, fontSize: 13, marginBottom: 4 },

  empty:       { alignItems: 'center', paddingTop: 80 },
  emptyIcon:   { fontSize: 52, marginBottom: 12 },
  emptyText:   { color: Colors.textPrimary, fontSize: 18, fontWeight: '600' },
  emptySubText:{ color: Colors.textSecondary, fontSize: 14, marginTop: 4 },

  modalOverlay: { flex: 1, backgroundColor: '#00000088', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: Colors.bgCard, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingBottom: 40, borderWidth: 1, borderColor: Colors.border,
  },
  modalTitle: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary, marginBottom: 20 },

  label: { color: Colors.textSecondary, fontSize: 13, marginBottom: 6, marginTop: 12 },
  input: {
    backgroundColor: Colors.bgInput, borderRadius: 12, borderWidth: 1,
    borderColor: Colors.border, color: Colors.textPrimary,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 15,
  },
  row: { flexDirection: 'row' },

  cropGrid:         { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  cropChip:         { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, backgroundColor: Colors.bgInput, borderWidth: 1, borderColor: Colors.border },
  cropChipActive:   { backgroundColor: Colors.primary, borderColor: Colors.primary },
  cropChipText:     { color: Colors.textSecondary, fontSize: 13 },
  cropChipTextActive: { color: '#fff', fontWeight: '600' },

  modalBtns:   { flexDirection: 'row', gap: 12, marginTop: 20 },
  cancelBtn:   { flex: 1, padding: 14, borderRadius: 12, alignItems: 'center', backgroundColor: Colors.bgInput },
  submitBtn:   { flex: 1, padding: 14, borderRadius: 12, alignItems: 'center', backgroundColor: Colors.primary },
  submitBtnText: { color: '#fff', fontWeight: '700' },
});
