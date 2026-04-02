import { useRouter } from 'expo-router';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Colors } from '../../constants/Colors';

const FeatureCard = ({ icon, title, subtitle, color, onPress }) => (
  <TouchableOpacity style={[styles.card, { borderLeftColor: color, borderLeftWidth: 3 }]} onPress={onPress} activeOpacity={0.8}>
    <Text style={styles.cardIcon}>{icon}</Text>
    <View style={styles.cardText}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardSubtitle}>{subtitle}</Text>
    </View>
    <Text style={styles.arrow}>›</Text>
  </TouchableOpacity>
);

export default function MoreScreen() {
  const router = useRouter();

  const features = [
    { icon: '📈', title: 'Market Prices', subtitle: 'Live mandi rates for all crops', color: Colors.gold, route: '/(tabs)/market' },
    { icon: '🔗', title: 'Ledger', subtitle: 'Immutable supply chain records', color: Colors.blue, route: '/(tabs)/ledger' },
    { icon: '📡', title: 'IoT Sensors', subtitle: 'Real-time temperature & humidity alerts', color: Colors.primary, route: '/(tabs)/iot' },
    { icon: '📊', title: 'Reports', subtitle: 'Compliance summary & analytics', color: '#a78bfa', route: '/(tabs)/reports' },
    { icon: '🗺️', title: 'GIS Farm Map', subtitle: 'Geographic farm & shipment tracking', color: '#f97316', route: '/(tabs)/gis' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>⋯ More Features</Text>
        <Text style={styles.subtitle}>All KrishiTrace tools in one place</Text>
      </View>

      <Text style={styles.sectionLabel}>PLATFORM FEATURES</Text>
      {features.map((f) => (
        <FeatureCard key={f.title} {...f} onPress={() => router.push(f.route)} />
      ))}

      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>🔗 Connected to Live Backend</Text>
        <Text style={styles.bannerText}>
          All data syncs with your web app at{'\n'}krishitrace-one.vercel.app
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: 20, paddingTop: 56, paddingBottom: 60 },

  header: { marginBottom: 28 },
  title: { fontSize: 24, fontWeight: '800', color: Colors.textPrimary },
  subtitle: { color: Colors.textSecondary, fontSize: 14, marginTop: 4 },

  sectionLabel: { color: Colors.textMuted, fontSize: 11, fontWeight: '700', letterSpacing: 1.5, marginBottom: 12 },

  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIcon: { fontSize: 30, marginRight: 14 },
  cardText: { flex: 1 },
  cardTitle: { color: Colors.textPrimary, fontSize: 16, fontWeight: '700' },
  cardSubtitle: { color: Colors.textSecondary, fontSize: 13, marginTop: 2 },
  arrow: { color: Colors.textMuted, fontSize: 24, marginLeft: 8 },

  banner: {
    marginTop: 24,
    backgroundColor: Colors.primary + '15',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.primary + '40',
  },
  bannerTitle: { color: Colors.primary, fontSize: 15, fontWeight: '700', marginBottom: 6 },
  bannerText: { color: Colors.textSecondary, fontSize: 13, lineHeight: 20 },
});
