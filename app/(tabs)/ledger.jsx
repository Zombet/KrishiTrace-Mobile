import { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, ActivityIndicator,
  RefreshControl, TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { getLedger } from '../../services/api';
import { Colors } from '../../constants/Colors';

const LedgerCard = ({ item }) => {
  const compliant = item.fairPriceCompliant;
  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View>
          <Text style={styles.cropName}>{item.cropType || '—'}</Text>
          <Text style={styles.farmerName}>👤 {item.farmerName || 'Farmer'}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: compliant ? Colors.success + '22' : Colors.error + '22' }]}>
          <Text style={[styles.badgeText, { color: compliant ? Colors.success : Colors.error }]}>
            {compliant ? '✅ Compliant' : '⚠️ Violation'}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.row}>
        <Text style={styles.metaLabel}>Quantity</Text>
        <Text style={styles.metaValue}>{item.quantity} {item.unit || 'kg'}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.metaLabel}>Farmer Payout</Text>
        <Text style={[styles.metaValue, { color: Colors.gold }]}>₹{item.payoutBreakdown?.farmerPayout}/kg</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.metaLabel}>Consumer Price</Text>
        <Text style={styles.metaValue}>₹{item.payoutBreakdown?.finalConsumerPrice}/kg</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.metaLabel}>Date</Text>
        <Text style={styles.metaValue}>
          {item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-IN') : '—'}
        </Text>
      </View>

      {item.txHash && (
        <View style={styles.txBox}>
          <Text style={styles.txLabel}>🔗 TX Hash</Text>
          <Text style={styles.txHash} numberOfLines={1}>{item.txHash}</Text>
        </View>
      )}
    </View>
  );
};

export default function LedgerScreen() {
  const router = useRouter();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [total, setTotal] = useState(0);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const res = await getLedger();
      const data = res.data;
      setRecords(data.records || data || []);
      setTotal(data.total || (data.records || data || []).length);
    } catch (_) {}
    setLoading(false);
    setRefreshing(false);
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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>🔗 Ledger</Text>
        <Text style={styles.subtitle}>{total} records on chain</Text>
      </View>

      <FlatList
        data={records}
        keyExtractor={(item, i) => item._id || String(i)}
        renderItem={({ item }) => <LedgerCard item={item} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={{ fontSize: 48 }}>🔗</Text>
            <Text style={styles.emptyText}>No ledger records yet.</Text>
            <Text style={styles.emptySubText}>Submit a harvest to create your first ledger entry.</Text>
          </View>
        }
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={Colors.primary} />}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.bg },

  header: {
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: { marginBottom: 6 },
  backText: { color: Colors.primary, fontSize: 16 },
  title: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary },
  subtitle: { color: Colors.textSecondary, fontSize: 13, marginTop: 2 },

  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  cropName: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary, textTransform: 'capitalize' },
  farmerName: { color: Colors.textSecondary, fontSize: 13, marginTop: 2 },
  badge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { fontSize: 12, fontWeight: '700' },

  divider: { height: 1, backgroundColor: Colors.border, marginBottom: 10 },

  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  metaLabel: { color: Colors.textSecondary, fontSize: 13 },
  metaValue: { color: Colors.textPrimary, fontSize: 13, fontWeight: '600' },

  txBox: { marginTop: 10, backgroundColor: Colors.bgInput, borderRadius: 10, padding: 10 },
  txLabel: { color: Colors.textMuted, fontSize: 11, marginBottom: 4 },
  txHash: { color: Colors.blue, fontSize: 11, fontFamily: 'monospace' },

  empty: { alignItems: 'center', paddingTop: 80 },
  emptyText: { color: Colors.textPrimary, fontSize: 18, fontWeight: '600', marginTop: 12 },
  emptySubText: { color: Colors.textSecondary, fontSize: 14, marginTop: 6, textAlign: 'center' },
});
