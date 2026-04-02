import { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl,
} from 'react-native';
import { getMarketPrices } from '../../services/api';
import { Colors } from '../../constants/Colors';

const CROP_ICONS = {
  rice: '🌾', wheat: '🌿', tomato: '🍅', onion: '🧅', mango: '🥭',
  cotton: '🌀', sugarcane: '🎋', maize: '🌽', potato: '🥔', default: '🌱',
};

const getCropIcon = (name = '') => {
  const key = name.toLowerCase();
  return CROP_ICONS[key] || CROP_ICONS.default;
};

const PriceCard = ({ item }) => {
  const change = item.priceChange || item.change || 0;
  const isUp = change >= 0;

  return (
    <View style={styles.card}>
      <Text style={styles.cropIcon}>{getCropIcon(item.crop || item.cropType)}</Text>
      <View style={styles.cardMiddle}>
        <Text style={styles.cropName}>{item.crop || item.cropType || 'Unknown'}</Text>
        <Text style={styles.location}>📍 {item.market || item.location || 'Mandi'}</Text>
      </View>
      <View style={styles.priceRight}>
        <Text style={styles.price}>₹{item.price || item.pricePerKg || '—'}/kg</Text>
        <Text style={[styles.change, { color: isUp ? Colors.success : Colors.error }]}>
          {isUp ? '▲' : '▼'} {Math.abs(change).toFixed(1)}%
        </Text>
      </View>
    </View>
  );
};

export default function MarketScreen() {
  const [prices, setPrices]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const res = await getMarketPrices();
      setPrices(res.data?.data || res.data || []);
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
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>📈 Market Prices</Text>
        <Text style={styles.subtitle}>Live mandi rates</Text>
      </View>

      {/* Summary banner */}
      <View style={styles.banner}>
        <Text style={styles.bannerText}>
          🌾 {prices.length} crops tracked · Updated just now
        </Text>
      </View>

      <FlatList
        data={prices}
        keyExtractor={(item, i) => item._id || String(i)}
        renderItem={({ item }) => <PriceCard item={item} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={{ fontSize: 48 }}>📊</Text>
            <Text style={styles.emptyText}>No market data available yet.</Text>
          </View>
        }
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} tintColor={Colors.primary} />}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  center:    { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.bg },

  header: {
    paddingHorizontal: 16, paddingTop: 56, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  title:    { fontSize: 22, fontWeight: '800', color: Colors.textPrimary },
  subtitle: { color: Colors.textSecondary, fontSize: 13, marginTop: 2 },

  banner: {
    margin: 16, backgroundColor: Colors.primary + '22',
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10,
    borderWidth: 1, borderColor: Colors.primary + '44',
  },
  bannerText: { color: Colors.primary, fontSize: 13, fontWeight: '600' },

  card: {
    backgroundColor: Colors.bgCard, borderRadius: 16, padding: 16,
    marginBottom: 10, borderWidth: 1, borderColor: Colors.border,
    flexDirection: 'row', alignItems: 'center',
  },
  cropIcon:   { fontSize: 36, marginRight: 14 },
  cardMiddle: { flex: 1 },
  cropName:   { color: Colors.textPrimary, fontSize: 16, fontWeight: '700' },
  location:   { color: Colors.textSecondary, fontSize: 12, marginTop: 2 },

  priceRight: { alignItems: 'flex-end' },
  price:      { color: Colors.gold, fontSize: 16, fontWeight: '800' },
  change:     { fontSize: 13, fontWeight: '600', marginTop: 2 },

  empty:     { alignItems: 'center', paddingTop: 80 },
  emptyText: { color: Colors.textSecondary, fontSize: 16, marginTop: 12 },
});
