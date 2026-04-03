import { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, RefreshControl, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { getHarvests, getMarketPrices, getIoTReadings } from '../../services/api';
import { Colors } from '../../constants/Colors';
import LanguageSelector from '../../components/LanguageSelector';
import { useTranslation } from 'react-i18next';

const LargeActionCard = ({ emoji, title, subtitle, backgroundColor, onPress, darkText = false }) => (
  <TouchableOpacity style={[styles.largeCard, { backgroundColor }]} onPress={onPress} activeOpacity={0.86}>
    <Text style={styles.largeEmoji}>{emoji}</Text>
    <Text style={[styles.largeTitle, darkText && styles.darkText]}>{title}</Text>
    <Text style={[styles.largeSubtitle, darkText && styles.darkSubtext]}>{subtitle}</Text>
  </TouchableOpacity>
);

const SmallStat = ({ emoji, label, value }) => (
  <View style={styles.statCard}>
    <Text style={styles.statEmoji}>{emoji}</Text>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

export default function DashboardScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const [harvests, setHarvests] = useState([]);
  const [market, setMarket] = useState([]);
  const [iot, setIot] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAll();
  }, []);

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

  const onRefresh = () => {
    setRefreshing(true);
    loadAll();
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  const latest = harvests[0];
  const lang = (i18n.language || 'en').split('-')[0];
  const localText = {
    en: {
      helper: "Simple actions for today's farm work",
      statusHealthy: 'Farm Status: Healthy',
      locationNotSet: 'Location not set',
      dateNotSet: 'Date not set',
      todayGlance: 'Today At A Glance',
      latestHarvest: 'Latest Harvest',
      moreTools: 'More Tools',
      harvests: 'Harvests',
      prices: 'Prices',
      sensors: 'Sensors',
      addHarvest: 'Add Harvest',
      addHarvestSub: "Save today's crop",
      scanQr: 'Scan QR',
      scanQrSub: 'Check a batch',
      bookTractor: 'Book Tractor',
      bookTractorSub: 'Hire nearby tractor',
      bookEquipment: 'Book Equipment',
      bookEquipmentSub: 'Rent tools easily',
      marketSub: "See today's prices",
      ledgerSub: 'Check records',
      iotSub: 'View sensor alerts',
      reportsSub: 'Open reports',
      gisSub: 'See farm map',
      profileSub: 'Open your account',
    },
    hi: {
      helper: 'आज के खेत काम के लिए सरल विकल्प',
      statusHealthy: 'खेत की स्थिति: स्वस्थ',
      locationNotSet: 'स्थान सेट नहीं है',
      dateNotSet: 'तारीख सेट नहीं है',
      todayGlance: 'आज की झलक',
      latestHarvest: 'सबसे हाल की फसल',
      moreTools: 'और साधन',
      harvests: 'फसल',
      prices: 'भाव',
      sensors: 'सेंसर',
      addHarvest: 'फसल जोड़ें',
      addHarvestSub: 'आज की फसल सहेजें',
      scanQr: 'QR स्कैन',
      scanQrSub: 'बैच जांचें',
      bookTractor: 'ट्रैक्टर बुक करें',
      bookTractorSub: 'आसपास का ट्रैक्टर लें',
      bookEquipment: 'उपकरण बुक करें',
      bookEquipmentSub: 'उपकरण किराये पर लें',
      marketSub: 'आज के भाव देखें',
      ledgerSub: 'रिकॉर्ड देखें',
      iotSub: 'सेंसर अलर्ट देखें',
      reportsSub: 'रिपोर्ट खोलें',
      gisSub: 'खेत का नक्शा देखें',
      profileSub: 'अपना खाता खोलें',
    },
    te: {
      helper: 'ఈరోజు పొలం పనులకు సులభమైన ఎంపికలు',
      statusHealthy: 'పొలం స్థితి: బాగుంది',
      locationNotSet: 'స్థానం సెట్ చేయలేదు',
      dateNotSet: 'తేదీ సెట్ చేయలేదు',
      todayGlance: 'ఈరోజు ముఖ్య సమాచారం',
      latestHarvest: 'తాజా పంట',
      moreTools: 'ఇంకా సాధనాలు',
      harvests: 'పంటలు',
      prices: 'ధరలు',
      sensors: 'సెన్సర్లు',
      addHarvest: 'పంట జోడించండి',
      addHarvestSub: 'ఈరోజు పంటను సేవ్ చేయండి',
      scanQr: 'QR స్కాన్',
      scanQrSub: 'బ్యాచ్ చూడండి',
      bookTractor: 'ట్రాక్టర్ బుక్ చేయండి',
      bookTractorSub: 'సమీప ట్రాక్టర్ తీసుకోండి',
      bookEquipment: 'పరికరాలు బుక్ చేయండి',
      bookEquipmentSub: 'పరికరాలు అద్దెకు తీసుకోండి',
      marketSub: 'ఈరోజు ధరలు చూడండి',
      ledgerSub: 'రికార్డులు చూడండి',
      iotSub: 'సెన్సర్ అలర్ట్లు చూడండి',
      reportsSub: 'రిపోర్టులు తెరవండి',
      gisSub: 'పొలం మ్యాప్ చూడండి',
      profileSub: 'మీ ఖాతా తెరవండి',
    },
    kn: {
      helper: 'ಇಂದಿನ ಹೊಲದ ಕೆಲಸಕ್ಕೆ ಸರಳ ಆಯ್ಕೆಗಳು',
      statusHealthy: 'ಹೊಲದ ಸ್ಥಿತಿ: ಉತ್ತಮ',
      locationNotSet: 'ಸ್ಥಳ ಸೆಟ್ ಆಗಿಲ್ಲ',
      dateNotSet: 'ದಿನಾಂಕ ಸೆಟ್ ಆಗಿಲ್ಲ',
      todayGlance: 'ಇಂದಿನ ನೋಟ',
      latestHarvest: 'ಇತ್ತೀಚಿನ ಫಸಲು',
      moreTools: 'ಇನ್ನಷ್ಟು ಸಾಧನಗಳು',
      harvests: 'ಫಸಲುಗಳು',
      prices: 'ಬೆಲೆಗಳು',
      sensors: 'ಸೆನ್ಸರ್‌ಗಳು',
      addHarvest: 'ಫಸಲು ಸೇರಿಸಿ',
      addHarvestSub: 'ಇಂದಿನ ಫಸಲು ಉಳಿಸಿ',
      scanQr: 'QR ಸ್ಕ್ಯಾನ್',
      scanQrSub: 'ಬ್ಯಾಚ್ ಪರಿಶೀಲಿಸಿ',
      bookTractor: 'ಟ್ರಾಕ್ಟರ್ ಬುಕ್ ಮಾಡಿ',
      bookTractorSub: 'ಹತ್ತಿರದ ಟ್ರಾಕ್ಟರ್ ಪಡೆಯಿರಿ',
      bookEquipment: 'ಉಪಕರಣ ಬುಕ್ ಮಾಡಿ',
      bookEquipmentSub: 'ಉಪಕರಣ ಬಾಡಿಗೆಗೆ ಪಡೆಯಿರಿ',
      marketSub: 'ಇಂದಿನ ಬೆಲೆ ನೋಡಿ',
      ledgerSub: 'ದಾಖಲೆ ನೋಡಿ',
      iotSub: 'ಸೆನ್ಸರ್ ಎಚ್ಚರಿಕೆ ನೋಡಿ',
      reportsSub: 'ವರದಿ ತೆರೆಯಿರಿ',
      gisSub: 'ಹೊಲದ ನಕ್ಷೆ ನೋಡಿ',
      profileSub: 'ನಿಮ್ಮ ಖಾತೆ ತೆರೆಯಿರಿ',
    },
    ta: {
      helper: 'இன்றைய பண்ணை வேலையிற்கான எளிய தேர்வுகள்',
      statusHealthy: 'பண்ணை நிலை: நன்றாக உள்ளது',
      locationNotSet: 'இடம் அமைக்கப்படவில்லை',
      dateNotSet: 'தேதி அமைக்கப்படவில்லை',
      todayGlance: 'இன்றைய பார்வை',
      latestHarvest: 'சமீப அறுவடை',
      moreTools: 'மேலும் கருவிகள்',
      harvests: 'அறுவடை',
      prices: 'விலைகள்',
      sensors: 'சென்சர்கள்',
      addHarvest: 'அறுவடை சேர்',
      addHarvestSub: 'இன்றைய பயிரை சேமி',
      scanQr: 'QR ஸ்கேன்',
      scanQrSub: 'தொகுப்பை பாருங்கள்',
      bookTractor: 'டிராக்டர் பதிவு',
      bookTractorSub: 'அருகிலுள்ள டிராக்டர் எடு',
      bookEquipment: 'உபகரணம் பதிவு',
      bookEquipmentSub: 'கருவிகளை வாடகைக்கு எடு',
      marketSub: 'இன்றைய விலைகளை பார்',
      ledgerSub: 'பதிவுகளை பார்',
      iotSub: 'சென்சர் எச்சரிக்கைகளை பார்',
      reportsSub: 'அறிக்கைகளைத் திற',
      gisSub: 'பண்ணை வரைபடத்தை பார்',
      profileSub: 'உங்கள் கணக்கைத் திற',
    },
  }[lang] || {
    helper: "Simple actions for today's farm work",
    statusHealthy: 'Farm Status: Healthy',
    locationNotSet: 'Location not set',
    dateNotSet: 'Date not set',
    todayGlance: 'Today At A Glance',
    latestHarvest: 'Latest Harvest',
    moreTools: 'More Tools',
    harvests: 'Harvests',
    prices: 'Prices',
    sensors: 'Sensors',
    addHarvest: 'Add Harvest',
    addHarvestSub: "Save today's crop",
    scanQr: 'Scan QR',
    scanQrSub: 'Check a batch',
    bookTractor: 'Book Tractor',
    bookTractorSub: 'Hire nearby tractor',
    bookEquipment: 'Book Equipment',
    bookEquipmentSub: 'Rent tools easily',
    marketSub: "See today's prices",
    ledgerSub: 'Check records',
    iotSub: 'View sensor alerts',
    reportsSub: 'Open reports',
    gisSub: 'See farm map',
    profileSub: 'Open your account',
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
    >
      <View style={styles.header}>
        <View style={styles.headerTextWrap}>
          <Text style={styles.greeting}>{t('dashboard.greeting')} 👋</Text>
          <Text style={styles.brandName}>KrishiTrace</Text>
          <Text style={styles.helperText}>{localText.helper}</Text>
        </View>
        <LanguageSelector />
      </View>

      <View style={styles.statusCard}>
        <Text style={styles.statusEmoji}>🌿</Text>
        <View style={styles.statusTextWrap}>
          <Text style={styles.statusTitle}>{localText.statusHealthy}</Text>
          <Text style={styles.statusSubtitle}>📍 {latest?.location || localText.locationNotSet}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>{t('dashboard.quick_actions')}</Text>
      <View style={styles.grid}>
        <LargeActionCard
          emoji="🌾"
          title={localText.addHarvest}
          subtitle={localText.addHarvestSub}
          backgroundColor="#2f9d62"
          onPress={() => router.push('/(tabs)/harvest')}
        />
        <LargeActionCard
          emoji="📷"
          title={localText.scanQr}
          subtitle={localText.scanQrSub}
          backgroundColor="#2088c7"
          onPress={() => router.push('/(tabs)/scan')}
        />
        <LargeActionCard
          emoji="🚜"
          title={localText.bookTractor}
          subtitle={localText.bookTractorSub}
          backgroundColor="#f49a27"
          onPress={() => router.push('/(tabs)/tractor')}
        />
        <LargeActionCard
          emoji="🛠️"
          title={localText.bookEquipment}
          subtitle={localText.bookEquipmentSub}
          backgroundColor="#d5ad1f"
          onPress={() => router.push('/(tabs)/equipment')}
          darkText
        />
      </View>

      <Text style={styles.sectionTitle}>{localText.todayGlance}</Text>
      <View style={styles.statsRow}>
        <SmallStat emoji="🌾" label={localText.harvests} value={harvests.length} />
        <SmallStat emoji="💹" label={localText.prices} value={market.length} />
        <SmallStat emoji="📡" label={localText.sensors} value={iot.length} />
      </View>

      {latest && (
        <>
          <Text style={styles.sectionTitle}>{localText.latestHarvest}</Text>
          <TouchableOpacity style={styles.harvestCard} onPress={() => router.push('/(tabs)/harvest')} activeOpacity={0.88}>
            <View style={styles.harvestTop}>
              <View>
                <Text style={styles.harvestCrop}>🌿 {latest.cropType || latest.crop || 'Crop'}</Text>
                <Text style={styles.harvestMeta}>{latest.quantity || '-'} {latest.unit || 'kg'}</Text>
                <Text style={styles.harvestMeta}>📍 {latest.location || localText.locationNotSet}</Text>
              </View>
              <Text style={styles.harvestLargeEmoji}>🚜</Text>
            </View>
            <Text style={styles.harvestDate}>📅 {latest.harvestDate ? new Date(latest.harvestDate).toDateString() : localText.dateNotSet}</Text>
          </TouchableOpacity>
        </>
      )}

      <Text style={styles.sectionTitle}>{localText.moreTools}</Text>
      <View style={styles.grid}>
        <LargeActionCard
          emoji="💹"
          title={t('dashboard.market')}
          subtitle={localText.marketSub}
          backgroundColor="#7aa83b"
          onPress={() => router.push('/(tabs)/market')}
        />
        <LargeActionCard
          emoji="🔗"
          title={t('dashboard.ledger')}
          subtitle={localText.ledgerSub}
          backgroundColor="#4a87d9"
          onPress={() => router.push('/(tabs)/ledger')}
        />
        <LargeActionCard
          emoji="📡"
          title={t('dashboard.iot')}
          subtitle={localText.iotSub}
          backgroundColor="#4e92b7"
          onPress={() => router.push('/(tabs)/iot')}
        />
        <LargeActionCard
          emoji="📊"
          title={t('dashboard.reports')}
          subtitle={localText.reportsSub}
          backgroundColor="#8b72c5"
          onPress={() => router.push('/(tabs)/reports')}
        />
        <LargeActionCard
          emoji="🗺️"
          title={t('dashboard.gis')}
          subtitle={localText.gisSub}
          backgroundColor="#4fa06d"
          onPress={() => router.push('/(tabs)/gis')}
        />
        <LargeActionCard
          emoji="👤"
          title={t('tabs.profile')}
          subtitle={localText.profileSub}
          backgroundColor="#7a8a5c"
          onPress={() => router.push('/(tabs)/profile')}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#e7f1df' },
  content: { padding: 20, paddingTop: 56, paddingBottom: 36 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#e7f1df' },
  loadingText: { color: '#66705e', marginTop: 12 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  headerTextWrap: { flex: 1, paddingRight: 12 },
  greeting: { color: '#4f5c4f', fontSize: 15, fontWeight: '600' },
  brandName: { color: '#1f2d1f', fontSize: 30, fontWeight: '800', marginTop: 2 },
  helperText: { color: '#6b7666', fontSize: 13, marginTop: 4 },
  statusCard: {
    backgroundColor: '#f8fbf5',
    borderRadius: 24,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  statusEmoji: { fontSize: 34, marginRight: 14 },
  statusTextWrap: { flex: 1 },
  statusTitle: { color: '#2d422d', fontSize: 18, fontWeight: '700' },
  statusSubtitle: { color: '#72806f', fontSize: 14, marginTop: 6 },
  sectionTitle: { color: '#314031', fontSize: 17, fontWeight: '800', marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 18 },
  largeCard: {
    width: '48%',
    minHeight: 154,
    borderRadius: 24,
    padding: 18,
    marginBottom: 12,
    justifyContent: 'space-between',
  },
  largeEmoji: { fontSize: 46 },
  largeTitle: { color: '#fffdf7', fontSize: 21, fontWeight: '800' },
  largeSubtitle: { color: '#fff8eb', fontSize: 14, fontWeight: '600', lineHeight: 18 },
  darkText: { color: '#2b260e' },
  darkSubtext: { color: '#3d3510' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 18 },
  statCard: {
    width: '31%',
    backgroundColor: '#f8fbf5',
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  statEmoji: { fontSize: 28, marginBottom: 6 },
  statValue: { color: '#243324', fontSize: 22, fontWeight: '800' },
  statLabel: { color: '#6f7d6d', fontSize: 12, marginTop: 4, textAlign: 'center' },
  harvestCard: {
    backgroundColor: '#f8fbf5',
    borderRadius: 24,
    padding: 18,
    marginBottom: 18,
  },
  harvestTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  harvestCrop: { color: '#253425', fontSize: 21, fontWeight: '800', marginBottom: 8 },
  harvestMeta: { color: '#70806d', fontSize: 14, marginBottom: 4 },
  harvestLargeEmoji: { fontSize: 62 },
  harvestDate: { color: '#647064', fontSize: 14, marginTop: 8 },
});
