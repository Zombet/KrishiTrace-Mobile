import { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, RefreshControl, ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { getHarvests, getMarketPrices, getIoTReadings } from '../../services/api';
import { Colors } from '../../constants/Colors';
import LanguageSelector from '../../components/LanguageSelector';
import { useTranslation } from 'react-i18next';

const SummaryCard = ({ icon, label, value, color }) => (
  <View style={[styles.card, { borderLeftColor: color, borderLeftWidth: 3 }]}>
    <Text style={styles.cardIcon}>{icon}</Text>
    <Text style={styles.cardValue}>{value}</Text>
    <Text style={styles.cardLabel}>{label}</Text>
  </View>
);

export default function DashboardScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [user, setUser]         = useState(null);
  const [harvests, setHarvests] = useState([]);
  const [market, setMarket]     = useState([]);
  const [iot, setIot]           = useState([]);
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    try {
      const [h, m, i] = await Promise.allSettled([
        getHarvests(), getMarketPrices(), getIoTReadings(),
      ]);
      if (h.status === 'fulfilled') setHarvests(h.value.data?.data || h.value.data || []);
      if (m.status === 'fulfilled') setMarket(m.value.data?.data || m.value.data || []);
      if (i.status === 'fulfilled') setIot(i.value.data?.data || i.value.data || []);
    } catch (_) {}
    setLoading(false);
    setRefreshing(false);
  };

  const onRefresh = () => { setRefreshing(true); loadAll(); };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading dashboard…</Text>
      </View>
    );
  }

  // latest harvest
  const latest = harvests[0];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{t('dashboard.greeting')} 👋</Text>
          <Text style={styles.brandName}>KrishiTrace</Text>
        </View>
        <LanguageSelector />
      </View>

      {/* Summary Cards */}
      <Text style={styles.sectionTitle}>Overview</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cardRow}>
        <SummaryCard icon="🌾" label={t('tabs.harvest')}  value={harvests.length}        color={Colors.primary} />
        <SummaryCard icon="📈" label={t('dashboard.market')}  value={market.length + ''} color={Colors.gold}   />
        <SummaryCard icon="📡" label={t('dashboard.iot')}    value={iot.length + ''}   color={Colors.blue}   />
        <SummaryCard icon="✅" label="Verified"        value={harvests.filter(h => h.verified).length} color={Colors.success} />
      </ScrollView>

      {/* Latest Harvest */}
      {latest && (
        <>
          <Text style={styles.sectionTitle}>{t('dashboard.recent_activity')}</Text>
          <View style={styles.harvestCard}>
            <View style={styles.harvestRow}>
              <Text style={styles.harvestCrop}>{latest.cropType || latest.crop || 'Crop'}</Text>
              <View style={[styles.badge, { backgroundColor: Colors.primary + '33' }]}>
                <Text style={[styles.badgeText, { color: Colors.primary }]}>
                  {latest.status || 'Recorded'}
                </Text>
              </View>
            </View>
            <Text style={styles.harvestMeta}>
              📍 {latest.location || 'Location not set'}
            </Text>
            <Text style={styles.harvestMeta}>
              ⚖️  {latest.quantity || '—'} {latest.unit || 'kg'}
            </Text>
            <Text style={styles.harvestMeta}>
              📅 {latest.harvestDate ? new Date(latest.harvestDate).toDateString() : 'Date not set'}
            </Text>
            <TouchableOpacity
              style={styles.viewBtn}
              onPress={() => router.push('/(tabs)/harvest')}
            >
              <Text style={styles.viewBtnText}>View All →</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>{t('dashboard.quick_actions')}</Text>
      <View style={styles.actionGrid}>
        {[
          { icon: '➕', label: t('harvest.add'),     route: '/(tabs)/harvest' },
          { icon: '📷', label: t('tabs.scan'),      route: '/(tabs)/scan'    },
          { icon: '📈', label: t('dashboard.market'),route: '/(tabs)/market'  },
          { icon: '🔗', label: t('dashboard.ledger'),route: '/(tabs)/ledger'  },
          { icon: '📡', label: t('dashboard.iot'),   route: '/(tabs)/iot'     },
          { icon: '📊', label: t('dashboard.reports'),route: '/(tabs)/reports' },
          { icon: '🗺️',  label: t('dashboard.gis'),   route: '/(tabs)/gis'     },
          { icon: '👤', label: t('tabs.profile'),   route: '/(tabs)/profile' },
        ].map(({ icon, label, route }) => (
          <TouchableOpacity
            key={label}
            style={styles.actionCard}
            onPress={() => router.push(route)}
            activeOpacity={0.8}
          >
            <Text style={styles.actionIcon}>{icon}</Text>
            <Text style={styles.actionLabel}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content:   { padding: 20, paddingTop: 56 },
  center:    { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.bg },
  loadingText: { color: Colors.textSecondary, marginTop: 12 },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  greeting:  { color: Colors.textSecondary, fontSize: 14 },
  brandName: { color: Colors.primary, fontSize: 26, fontWeight: '800' },
  alertBtn:  { padding: 8 },

  sectionTitle: { color: Colors.textSecondary, fontSize: 13, fontWeight: '700', marginBottom: 12, letterSpacing: 1, textTransform: 'uppercase' },

  cardRow: { marginBottom: 24 },
  card: {
    backgroundColor: Colors.bgCard, borderRadius: 16, padding: 16,
    marginRight: 12, minWidth: 110, alignItems: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  cardIcon:  { fontSize: 28, marginBottom: 6 },
  cardValue: { color: Colors.textPrimary, fontSize: 20, fontWeight: '800' },
  cardLabel: { color: Colors.textSecondary, fontSize: 11, marginTop: 4, textAlign: 'center' },

  harvestCard: {
    backgroundColor: Colors.bgCard, borderRadius: 16,
    padding: 18, borderWidth: 1, borderColor: Colors.border, marginBottom: 24,
  },
  harvestRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  harvestCrop: { color: Colors.textPrimary, fontSize: 18, fontWeight: '700' },
  harvestMeta: { color: Colors.textSecondary, fontSize: 13, marginBottom: 6 },
  badge:       { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText:   { fontSize: 12, fontWeight: '600' },
  viewBtn:     { marginTop: 10, alignSelf: 'flex-end' },
  viewBtnText: { color: Colors.primary, fontSize: 14, fontWeight: '600' },

  actionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 40 },
  actionCard: {
    width: '47%', backgroundColor: Colors.bgCard, borderRadius: 16,
    padding: 20, alignItems: 'center', borderWidth: 1, borderColor: Colors.border,
  },
  actionIcon:  { fontSize: 32, marginBottom: 8 },
  actionLabel: { color: Colors.textPrimary, fontSize: 14, fontWeight: '600' },
});
