import { useRouter } from 'expo-router';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Colors } from '../../constants/Colors';

const FeatureCard = ({ icon, title, subtitle, color, onPress }) => (
  <TouchableOpacity
    style={[styles.card, { borderLeftColor: color, borderLeftWidth: 4 }]}
    onPress={onPress}
    activeOpacity={0.8}
  >
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
  const { i18n } = useTranslation();
  const langCode = (i18n.language || 'en').split('-')[0];
  const lang = ['hi', 'te'].includes(langCode) ? langCode : 'en';
  const copy = {
    en: {
      eyebrow: 'Farmer toolbox',
      title: 'More Features',
      subtitle: 'All KrishiTrace tools in one place for daily farm work.',
      heroTitle: 'Choose the tool you need today',
      heroSubtitle: 'Track crops, verify records, watch sensors, and check maps from one friendly hub.',
      section: 'PLATFORM FEATURES',
      bannerTitle: 'Connected to live backend',
      bannerText: 'All data syncs with your web app at',
      features: [
        ['Blockchain Explorer', 'Visualize chain, tamper tests & block details'],
        ['Market Prices', 'Live mandi rates for all crops'],
        ['Blockchain Ledger', 'Immutable supply chain records'],
        ['IoT Sensors', 'Real-time temperature & humidity alerts'],
        ['Reports', 'Compliance summary & analytics'],
        ['GIS Farm Map', 'Geographic farm & shipment tracking'],
      ],
    },
    hi: {
      eyebrow: '\u0915\u093f\u0938\u093e\u0928 \u091f\u0942\u0932\u092c\u0949\u0915\u094d\u0938',
      title: '\u0914\u0930 \u0938\u0941\u0935\u093f\u0927\u093e\u090f\u0901',
      subtitle: '\u0930\u094b\u091c\u093c\u092e\u0930\u094d\u0930\u093e \u0916\u0947\u0924 \u0915\u093e\u092e \u0915\u0947 \u0932\u093f\u090f \u0938\u092d\u0940 KrishiTrace \u091f\u0942\u0932 \u090f\u0915 \u091c\u0917\u0939\u0964',
      heroTitle: '\u0906\u091c \u0915\u093e \u091c\u0930\u0942\u0930\u0940 \u091f\u0942\u0932 \u091a\u0941\u0928\u0947\u0902',
      heroSubtitle: '\u092b\u0938\u0932 \u091f\u094d\u0930\u0948\u0915 \u0915\u0930\u0947\u0902, \u0930\u093f\u0915\u0949\u0930\u094d\u0921 \u0926\u0947\u0916\u0947\u0902, \u0938\u0947\u0902\u0938\u0930 \u0926\u0947\u0916\u0947\u0902 \u0914\u0930 \u0928\u0915\u094d\u0936\u093e \u0916\u094b\u0932\u0947\u0902\u0964',
      section: '\u092a\u094d\u0932\u0947\u091f\u092b\u0949\u0930\u094d\u092e \u0938\u0941\u0935\u093f\u0927\u093e\u090f\u0901',
      bannerTitle: '\u0932\u093e\u0907\u0935 \u092c\u0948\u0915\u090f\u0902\u0921 \u0938\u0947 \u091c\u0941\u095c\u093e',
      bannerText: '\u0938\u093e\u0930\u093e \u0921\u093e\u091f\u093e \u0906\u092a\u0915\u0947 \u0935\u0947\u092c \u090f\u092a \u0938\u0947 \u0938\u093f\u0902\u0915 \u0939\u094b\u0924\u093e \u0939\u0948',
      features: [
        ['\u092c\u094d\u0932\u0949\u0915\u091a\u0947\u0928 \u090f\u0915\u094d\u0938\u092a\u094d\u0932\u094b\u0930\u0930', '\u091a\u0947\u0928, \u091b\u0947\u095c\u091b\u093e\u095c \u091f\u0947\u0938\u094d\u091f \u0914\u0930 \u092c\u094d\u0932\u0949\u0915 \u0935\u093f\u0935\u0930\u0923'],
        ['\u092c\u093e\u091c\u093c\u093e\u0930 \u092d\u093e\u0935', '\u0938\u092d\u0940 \u092b\u0938\u0932\u094b\u0902 \u0915\u0947 \u0932\u093e\u0907\u0935 \u092e\u0902\u0921\u0940 \u0930\u0947\u091f'],
        ['\u092c\u094d\u0932\u0949\u0915\u091a\u0947\u0928 \u0932\u0947\u091c\u0930', '\u0938\u092a\u094d\u0932\u093e\u0908 \u091a\u0947\u0928 \u0930\u093f\u0915\u0949\u0930\u094d\u0921'],
        ['IoT \u0938\u0947\u0902\u0938\u0930', '\u0930\u093f\u092f\u0932 \u091f\u093e\u0907\u092e \u0924\u093e\u092a\u092e\u093e\u0928 \u0914\u0930 \u0928\u092e\u0940 \u0905\u0932\u0930\u094d\u091f'],
        ['\u0930\u093f\u092a\u094b\u0930\u094d\u091f', '\u0905\u0928\u0941\u092a\u093e\u0932\u0928 \u0938\u093e\u0930\u093e\u0902\u0936 \u0914\u0930 \u090f\u0928\u093e\u0932\u093f\u091f\u093f\u0915\u094d\u0938'],
        ['GIS \u0916\u0947\u0924 \u0928\u0915\u094d\u0936\u093e', '\u0916\u0947\u0924 \u0914\u0930 \u0936\u093f\u092a\u092e\u0947\u0902\u091f \u091f\u094d\u0930\u0948\u0915\u093f\u0902\u0917'],
      ],
    },
    te: {
      eyebrow: '\u0c30\u0c48\u0c24\u0c41 \u0c1f\u0c42\u0c32\u0c4d\u0c2c\u0c3e\u0c15\u0c4d\u0c38\u0c4d',
      title: '\u0c2e\u0c30\u0c3f\u0c28\u0c4d\u0c28\u0c3f \u0c38\u0c26\u0c41\u0c2a\u0c3e\u0c2f\u0c3e\u0c32\u0c41',
      subtitle: '\u0c30\u0c4b\u0c1c\u0c41\u0c35\u0c3e\u0c30\u0c40 \u0c35\u0c4d\u0c2f\u0c35\u0c38\u0c3e\u0c2f \u0c2a\u0c28\u0c41\u0c32\u0c15\u0c41 \u0c05\u0c28\u0c4d\u0c28\u0c40 KrishiTrace \u0c1f\u0c42\u0c32\u0c4d\u0c38 \u0c12\u0c15\u0c47 \u0c1a\u0c4b\u0c1f\u0c41.',
      heroTitle: '\u0c08\u0c30\u0c4b\u0c1c\u0c41 \u0c15\u0c3e\u0c35\u0c32\u0c38\u0c3f\u0c28 \u0c1f\u0c42\u0c32\u0c4d \u0c0e\u0c02\u0c2a\u0c3f\u0c15 \u0c1a\u0c47\u0c2f\u0c02\u0c21\u0c3f',
      heroSubtitle: '\u0c2a\u0c02\u0c1f\u0c32\u0c28\u0c41 \u0c1f\u0c4d\u0c30\u0c3e\u0c15\u0c4d \u0c1a\u0c47\u0c2f\u0c02\u0c21\u0c3f, \u0c30\u0c3f\u0c15\u0c3e\u0c30\u0c4d\u0c21\u0c4d\u0c32\u0c28\u0c41 \u0c1a\u0c42\u0c21\u0c02\u0c21\u0c3f, \u0c38\u0c46\u0c28\u0c4d\u0c38\u0c30\u0c4d\u0c32\u0c28\u0c41 \u0c17\u0c2e\u0c28\u0c3f\u0c02\u0c1a\u0c02\u0c21\u0c3f.',
      section: '\u0c2a\u0c4d\u0c32\u0c3e\u0c1f\u0c4d\u0c2b\u0c3e\u0c02 \u0c38\u0c26\u0c41\u0c2a\u0c3e\u0c2f\u0c3e\u0c32\u0c41',
      bannerTitle: '\u0c32\u0c48\u0c35\u0c4d \u0c2c\u0c3e\u0c15\u0c46\u0c02\u0c21\u0c4d\u200c\u0c15\u0c41 \u0c15\u0c28\u0c46\u0c15\u0c4d\u0c1f\u0c4d \u0c05\u0c2f\u0c4d\u0c2f\u0c3f\u0c02\u0c26\u0c3f',
      bannerText: '\u0c2e\u0c40 \u0c35\u0c46\u0c2c\u0c4d \u0c2f\u0c3e\u0c2a\u0c4d\u200c\u0c24\u0c4b \u0c05\u0c28\u0c4d\u0c28\u0c3f \u0c21\u0c3e\u0c1f\u0c3e \u0c38\u0c3f\u0c02\u0c15\u0c4d \u0c05\u0c35\u0c41\u0c24\u0c41\u0c02\u0c26\u0c3f',
      features: [
        ['\u0c2c\u0c4d\u0c32\u0c3e\u0c15\u0c4d\u200c\u0c1a\u0c48\u0c28\u0c4d \u0c0e\u0c15\u0c4d\u0c38\u0c4d\u0c2a\u0c4d\u0c32\u0c4b\u0c30\u0c30\u0c4d', '\u0c1a\u0c48\u0c28\u0c4d, \u0c1f\u0c3e\u0c02\u0c2a\u0c30\u0c4d \u0c1f\u0c46\u0c38\u0c4d\u0c1f\u0c4d\u0c32\u0c41 \u0c2e\u0c30\u0c3f\u0c2f\u0c41 \u0c2c\u0c4d\u0c32\u0c3e\u0c15\u0c4d \u0c35\u0c3f\u0c35\u0c30\u0c3e\u0c32\u0c41'],
        ['\u0c2e\u0c3e\u0c30\u0c4d\u0c15\u0c46\u0c1f\u0c4d \u0c27\u0c30\u0c32\u0c41', '\u0c05\u0c28\u0c4d\u0c28\u0c3f \u0c2a\u0c02\u0c1f\u0c32 \u0c32\u0c48\u0c35\u0c4d \u0c2e\u0c02\u0c21\u0c40 \u0c30\u0c47\u0c1f\u0c4d\u0c32\u0c41'],
        ['\u0c2c\u0c4d\u0c32\u0c3e\u0c15\u0c4d\u200c\u0c1a\u0c48\u0c28\u0c4d \u0c32\u0c46\u0c21\u0c4d\u0c1c\u0c30\u0c4d', '\u0c38\u0c30\u0c2b\u0c30\u0c3e \u0c17\u0c4a\u0c32\u0c41\u0c38\u0c41 \u0c30\u0c3f\u0c15\u0c3e\u0c30\u0c4d\u0c21\u0c4d\u0c32\u0c41'],
        ['IoT \u0c38\u0c46\u0c28\u0c4d\u0c38\u0c30\u0c4d\u0c32\u0c41', '\u0c30\u0c3f\u0c2f\u0c32\u0c4d\u200c\u0c1f\u0c48\u0c2e\u0c4d \u0c09\u0c37\u0c4d\u0c23\u0c4b\u0c17\u0c4d\u0c30\u0c24 \u0c2e\u0c30\u0c3f\u0c2f\u0c41 \u0c24\u0c47\u0c2e \u0c05\u0c32\u0c30\u0c4d\u0c1f\u0c4d\u0c32\u0c41'],
        ['\u0c30\u0c3f\u0c2a\u0c4b\u0c30\u0c4d\u0c1f\u0c4d\u0c32\u0c41', '\u0c05\u0c28\u0c41\u0c2a\u0c3e\u0c32\u0c28 \u0c38\u0c3e\u0c30\u0c3e\u0c02\u0c36\u0c02 \u0c2e\u0c30\u0c3f\u0c2f\u0c41 \u0c35\u0c3f\u0c36\u0c4d\u0c32\u0c47\u0c37\u0c23'],
        ['GIS \u0c2b\u0c3e\u0c30\u0c4d\u0c2e\u0c4d \u0c2e\u0c4d\u0c2f\u0c3e\u0c2a\u0c4d', '\u0c2d\u0c4c\u0c17\u0c4b\u0c33\u0c3f\u0c15 \u0c2b\u0c3e\u0c30\u0c4d\u0c2e\u0c4d \u0c2e\u0c30\u0c3f\u0c2f\u0c41 \u0c36\u0c3f\u0c2a\u0c4d\u200c\u0c2e\u0c46\u0c02\u0c1f\u0c4d \u0c1f\u0c4d\u0c30\u0c3e\u0c15\u0c3f\u0c02\u0c17\u0c4d'],
      ],
    },
  }[lang] || null;

  const features = [
    { icon: '🔐', title: copy.features[0][0], subtitle: copy.features[0][1], color: '#10b981', route: '/(tabs)/blockchain' },
    { icon: '📈', title: copy.features[1][0], subtitle: copy.features[1][1], color: Colors.gold, route: '/(tabs)/market' },
    { icon: '🔗', title: copy.features[2][0], subtitle: copy.features[2][1], color: Colors.blue, route: '/(tabs)/ledger' },
    { icon: '📡', title: copy.features[3][0], subtitle: copy.features[3][1], color: Colors.primary, route: '/(tabs)/iot' },
    { icon: '📊', title: copy.features[4][0], subtitle: copy.features[4][1], color: '#9d7bd8', route: '/(tabs)/reports' },
    { icon: '🗺️', title: copy.features[5][0], subtitle: copy.features[5][1], color: '#f97316', route: '/(tabs)/gis' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>{copy.eyebrow}</Text>
        <Text style={styles.title}>{copy.title}</Text>
        <Text style={styles.subtitle}>{copy.subtitle}</Text>
      </View>

      <View style={styles.heroCard}>
        <Text style={styles.heroEmoji}>🌾</Text>
        <View style={styles.heroText}>
          <Text style={styles.heroTitle}>{copy.heroTitle}</Text>
          <Text style={styles.heroSubtitle}>{copy.heroSubtitle}</Text>
        </View>
      </View>

      <Text style={styles.sectionLabel}>{copy.section}</Text>
      {features.map((feature) => (
        <FeatureCard key={feature.title} {...feature} onPress={() => router.push(feature.route)} />
      ))}

      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>{copy.bannerTitle}</Text>
        <Text style={styles.bannerText}>
          {copy.bannerText}{'\n'}`krishitrace-one.vercel.app`
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: 20, paddingTop: 56, paddingBottom: 60 },
  header: { marginBottom: 24 },
  eyebrow: { color: Colors.primary, fontSize: 13, fontWeight: '700', marginBottom: 6 },
  title: { fontSize: 26, fontWeight: '800', color: Colors.textPrimary },
  subtitle: { color: Colors.textSecondary, fontSize: 14, marginTop: 4, lineHeight: 20 },
  heroCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: 24,
    padding: 18,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroEmoji: { fontSize: 42, marginRight: 14 },
  heroText: { flex: 1 },
  heroTitle: { color: Colors.textPrimary, fontSize: 18, fontWeight: '800' },
  heroSubtitle: { color: Colors.textSecondary, fontSize: 13, lineHeight: 19, marginTop: 4 },
  sectionLabel: { color: Colors.textMuted, fontSize: 11, fontWeight: '700', letterSpacing: 1.5, marginBottom: 12 },
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: 18,
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
  cardSubtitle: { color: Colors.textSecondary, fontSize: 13, marginTop: 2, lineHeight: 18 },
  arrow: { color: Colors.textMuted, fontSize: 24, marginLeft: 8 },
  banner: {
    marginTop: 24,
    backgroundColor: '#fff3de',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#f2d3a0',
  },
  bannerTitle: { color: '#9a6517', fontSize: 15, fontWeight: '700', marginBottom: 6 },
  bannerText: { color: Colors.textSecondary, fontSize: 13, lineHeight: 20 },
});
