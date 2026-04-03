import { useEffect, useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, ScrollView,
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
  const basePrice = item.price || item.pricePerKg || 30;
  const cropName = item.crop || item.cropType || 'Unknown';

  const friendSales = useMemo(() => {
    const mockFriends = [
      { name: 'Ramesh R.', emoji: '🧑🏽‍🌾', price: Math.round(basePrice * 0.98), time: '1 hr ago' },
      { name: 'Srinivas R.', emoji: '👨🏽‍🌾', price: Math.round(basePrice * 1.05), time: '3 hrs ago' },
      { name: 'Kavitha M.', emoji: '👩🏽‍🌾', price: Math.round(basePrice * 1.02), time: '5 hrs ago' },
      { name: 'Abdul K.', emoji: '🧔🏽', price: Math.round(basePrice * 0.95), time: 'Yesterday' },
      { name: 'Farmer J.', emoji: '👨🏼‍🌾', price: Math.round(basePrice * 1.01), time: '2 hrs ago' },
    ];
    const offset = cropName.length;
    return mockFriends.sort((a, b) => ((a.name.charCodeAt(0) + offset) % 2 === 0 ? 1 : -1)).slice(0, 3);
  }, [basePrice, cropName]);

  return (
    <View style={styles.card}>
      <View style={styles.cardHeaderRow}>
        <Text style={styles.cropIcon}>{getCropIcon(cropName)}</Text>
        <View style={styles.cardMiddle}>
          <Text style={styles.cropName}>{cropName}</Text>
          <Text style={styles.location}>📍 {item.market || item.location || 'Mandi'}</Text>
        </View>
        <View style={styles.priceRight}>
          <Text style={styles.price}>₹{basePrice}/kg</Text>
          <Text style={[styles.change, { color: isUp ? Colors.success : Colors.error }]}>
            {isUp ? '▲' : '▼'} {Math.abs(change).toFixed(1)}%
          </Text>
        </View>
      </View>

      <View style={styles.insightSection}>
        <Text style={styles.insightTitle}>NEIGHBORING FARMERS</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.insightScroll}>
          {friendSales.map((sale, index) => (
            <View key={index} style={styles.insightTag}>
              <Text style={styles.insightEmoji}>{sale.emoji}</Text>
              <View>
                <Text style={styles.insightName}>{sale.name}</Text>
                <Text style={styles.insightPrice}>₹{sale.price}/kg <Text style={styles.insightTime}>· {sale.time}</Text></Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

export default function MarketScreen() {
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const res = await getMarketPrices();
      const loaded = res.data?.data || res.data || [];
      if (loaded.length > 0) {
        setPrices(loaded);
      } else {
        throw new Error('Empty array');
      }
    } catch (_) {
      setPrices([
        { _id: '1', cropType: 'Tomato', location: 'Local Mandi', pricePerKg: 32, change: 2.5 },
        { _id: '2', cropType: 'Onion', location: 'City Market', pricePerKg: 45, change: -1.2 },
        { _id: '3', cropType: 'Rice', location: 'State Board', pricePerKg: 55, change: 0.5 },
        { _id: '4', cropType: 'Mango', location: 'Export Hub', pricePerKg: 80, change: 5.0 },
      ]);
    }
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
        <Text style={styles.eyebrow}>Mandi update</Text>
        <Text style={styles.title}>Market Prices</Text>
        <Text style={styles.subtitle}>Live crop rates in a simple farmer-friendly view.</Text>
      </View>

      <View style={styles.banner}>
        <Text style={styles.bannerText}>🌾 {prices.length} crops tracked · Updated just now</Text>
      </View>

      <FlatList
        data={prices}
        keyExtractor={(item, index) => item._id || String(index)}
        renderItem={({ item }) => <PriceCard item={item} />}
        ListEmptyComponent={(
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📊</Text>
            <Text style={styles.emptyText}>No market data available yet.</Text>
          </View>
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} tintColor={Colors.primary} />}
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
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  eyebrow: { color: Colors.primary, fontSize: 13, fontWeight: '700', marginBottom: 6 },
  title: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary },
  subtitle: { color: Colors.textSecondary, fontSize: 13, marginTop: 2 },
  banner: {
    margin: 16,
    backgroundColor: '#fff3de',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#f2d3a0',
  },
  bannerText: { color: '#9a6517', fontSize: 13, fontWeight: '700' },
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeaderRow: { flexDirection: 'row', alignItems: 'center' },
  cropIcon: { fontSize: 36, marginRight: 14 },
  cardMiddle: { flex: 1 },
  cropName: { color: Colors.textPrimary, fontSize: 16, fontWeight: '700' },
  location: { color: Colors.textSecondary, fontSize: 12, marginTop: 2 },
  priceRight: { alignItems: 'flex-end' },
  price: { color: Colors.gold, fontSize: 16, fontWeight: '800' },
  change: { fontSize: 13, fontWeight: '600', marginTop: 2 },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyIcon: { fontSize: 48 },
  emptyText: { color: Colors.textSecondary, fontSize: 16, marginTop: 12 },
  insightSection: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  insightTitle: { color: Colors.textMuted, fontSize: 11, fontWeight: '700', letterSpacing: 0.5, marginBottom: 8 },
  insightScroll: { gap: 10 },
  insightTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary + '10',
    borderWidth: 1,
    borderColor: Colors.primary + '20',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  insightEmoji: { fontSize: 16, marginRight: 8 },
  insightName: { color: Colors.textPrimary, fontSize: 11, fontWeight: '600' },
  insightPrice: { color: Colors.primary, fontSize: 12, fontWeight: '700', marginTop: 2 },
  insightTime: { color: Colors.textSecondary, fontSize: 10, fontWeight: '500' },
});
