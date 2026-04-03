import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Colors } from '../../constants/Colors';

const MenuItem = ({ icon, label, onPress, danger, last }) => (
  <TouchableOpacity
    style={[styles.menuItem, !last && styles.menuDivider]}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <Text style={styles.menuIcon}>{icon}</Text>
    <Text style={[styles.menuLabel, danger && { color: Colors.error }]}>{label}</Text>
    <Text style={styles.menuArrow}>›</Text>
  </TouchableOpacity>
);

export default function ProfileScreen() {
  const router = useRouter();
  const { i18n } = useTranslation();
  const [email, setEmail] = useState('');
  const langCode = (i18n.language || 'en').split('-')[0];
  const lang = ['hi', 'te'].includes(langCode) ? langCode : 'en';
  const copy = {
    en: {
      headerEyebrow: 'Your farm profile',
      headerTitle: 'Profile',
      headerSubtitle: 'Keep your account, harvest access, and trusted tools in one place.',
      name: 'KrishiTrace Farmer',
      loggedIn: 'Logged In',
      verified: 'Verified Account',
      stats: ['Batches', 'Verified', 'Markets'],
      account: 'Account',
      accountItems: ['My Harvests', 'Market Prices', 'Scan QR Code'],
      settings: 'Settings',
      settingsItems: ['Connected to Vercel API', 'Privacy Policy', 'App Version 1.0.0'],
      signOut: 'Sign Out',
      signOutTitle: 'Sign Out',
      signOutConfirm: 'Are you sure you want to logout?',
      cancel: 'Cancel',
      logout: 'Logout',
      footer: 'Powered by',
    },
    hi: {
      headerEyebrow: '\u0906\u092a\u0915\u0940 \u0916\u0947\u0924 \u092a\u094d\u0930\u094b\u092b\u093e\u0907\u0932',
      headerTitle: '\u092a\u094d\u0930\u094b\u092b\u093c\u093e\u0907\u0932',
      headerSubtitle: '\u0905\u092a\u0928\u093e \u0916\u093e\u0924\u093e, \u092b\u0938\u0932 \u090f\u0915\u094d\u0938\u0947\u0938 \u0914\u0930 \u092d\u0930\u094b\u0938\u0947\u092e\u0902\u0926 \u091f\u0942\u0932 \u090f\u0915 \u091c\u0917\u0939 \u0930\u0916\u0947\u0902\u0964',
      name: 'KrishiTrace \u0915\u093f\u0938\u093e\u0928',
      loggedIn: '\u0932\u0949\u0917\u094d\u0921 \u0907\u0928',
      verified: '\u0938\u0924\u094d\u092f\u093e\u092a\u093f\u0924 \u0916\u093e\u0924\u093e',
      stats: ['\u092c\u0948\u091a', '\u0938\u0924\u094d\u092f\u093e\u092a\u093f\u0924', '\u092e\u093e\u0930\u094d\u0915\u0947\u091f'],
      account: '\u0916\u093e\u0924\u093e',
      accountItems: ['\u092e\u0947\u0930\u0940 \u092b\u0938\u0932\u0947\u0902', '\u092c\u093e\u091c\u093c\u093e\u0930 \u092d\u093e\u0935', 'QR \u0938\u094d\u0915\u0948\u0928 \u0915\u0930\u0947\u0902'],
      settings: '\u0938\u0947\u091f\u093f\u0902\u0917\u094d\u0938',
      settingsItems: ['Vercel API \u0938\u0947 \u091c\u0941\u095c\u093e', '\u092a\u094d\u0930\u093e\u0907\u0935\u0947\u0938\u0940 \u092a\u0949\u0932\u093f\u0938\u0940', '\u090f\u092a \u0935\u0930\u094d\u091c\u0928 1.0.0'],
      signOut: '\u0938\u093e\u0907\u0928 \u0906\u0909\u091f',
      signOutTitle: '\u0938\u093e\u0907\u0928 \u0906\u0909\u091f',
      signOutConfirm: '\u0915\u094d\u092f\u093e \u0906\u092a \u0938\u091a\u092e\u0941\u091a \u0932\u0949\u0917\u0906\u0909\u091f \u0915\u0930\u0928\u093e \u091a\u093e\u0939\u0924\u0947 \u0939\u0948\u0902?',
      cancel: '\u0930\u0926\u094d\u0926 \u0915\u0930\u0947\u0902',
      logout: '\u0932\u0949\u0917\u0906\u0909\u091f',
      footer: '\u0926\u094d\u0935\u093e\u0930\u093e \u0938\u0902\u091a\u093e\u0932\u093f\u0924',
    },
    te: {
      headerEyebrow: '\u0c2e\u0c40 \u0c2b\u0c3e\u0c30\u0c4d\u0c2e\u0c4d \u0c2a\u0c4d\u0c30\u0c4a\u0c2b\u0c48\u0c32\u0c4d',
      headerTitle: '\u0c2a\u0c4d\u0c30\u0c4a\u0c2b\u0c48\u0c32\u0c4d',
      headerSubtitle: '\u0c2e\u0c40 \u0c16\u0c3e\u0c24\u0c3e, \u0c2a\u0c02\u0c1f \u0c05\u0c15\u0c4d\u0c38\u0c46\u0c38\u0c4d \u0c2e\u0c30\u0c3f\u0c2f\u0c41 \u0c28\u0c2e\u0c4d\u0c2e\u0c15\u0c2e\u0c48\u0c28 \u0c1f\u0c42\u0c32\u0c4d\u0c38\u0c28\u0c41 \u0c12\u0c15 \u0c1a\u0c4b\u0c1f \u0c09\u0c02\u0c1a\u0c02\u0c21\u0c3f.',
      name: 'KrishiTrace \u0c30\u0c48\u0c24\u0c41',
      loggedIn: '\u0c32\u0c3e\u0c17\u0c3f\u0c28\u0c4d \u0c05\u0c2f\u0c4d\u0c2f\u0c3e\u0c30\u0c41',
      verified: '\u0c27\u0c43\u0c35\u0c40\u0c15\u0c30\u0c3f\u0c02\u0c1a\u0c2c\u0c21\u0c3f\u0c28 \u0c16\u0c3e\u0c24\u0c3e',
      stats: ['\u0c2c\u0c4d\u0c2f\u0c3e\u0c1a\u0c4d\u0c32\u0c41', '\u0c27\u0c43\u0c35\u0c40\u0c15\u0c30\u0c3f\u0c02\u0c1a\u0c2c\u0c21\u0c3f\u0c28\u0c35\u0c3f', '\u0c2e\u0c3e\u0c30\u0c4d\u0c15\u0c46\u0c1f\u0c4d\u0c32\u0c41'],
      account: '\u0c16\u0c3e\u0c24\u0c3e',
      accountItems: ['\u0c28\u0c3e \u0c2a\u0c02\u0c1f\u0c32\u0c41', '\u0c2e\u0c3e\u0c30\u0c4d\u0c15\u0c46\u0c1f\u0c4d \u0c27\u0c30\u0c32\u0c41', 'QR \u0c38\u0c4d\u0c15\u0c3e\u0c28\u0c4d'],
      settings: '\u0c38\u0c46\u0c1f\u0c4d\u0c1f\u0c3f\u0c02\u0c17\u0c4d\u0c38\u0c4d',
      settingsItems: ['Vercel API\u0c15\u0c41 \u0c15\u0c28\u0c46\u0c15\u0c4d\u0c1f\u0c4d \u0c05\u0c2f\u0c4d\u0c2f\u0c3f\u0c02\u0c26\u0c3f', '\u0c17\u0c4b\u0c2a\u0c4d\u0c2f\u0c24 \u0c35\u0c3f\u0c27\u0c3e\u0c28\u0c02', '\u0c2f\u0c3e\u0c2a\u0c4d \u0c35\u0c30\u0c4d\u0c37\u0c28\u0c4d 1.0.0'],
      signOut: '\u0c38\u0c48\u0c28\u0c4d \u0c06\u0c09\u0c1f\u0c4d',
      signOutTitle: '\u0c38\u0c48\u0c28\u0c4d \u0c06\u0c09\u0c1f\u0c4d',
      signOutConfirm: '\u0c2e\u0c40\u0c30\u0c41 \u0c28\u0c3f\u0c1c\u0c02\u0c17\u0c3e \u0c32\u0c3e\u0c17\u0c4d\u0c05\u0c09\u0c1f\u0c4d \u0c05\u0c35\u0c4d\u0c35\u0c3e\u0c32\u0c28\u0c3f \u0c05\u0c28\u0c41\u0c15\u0c41\u0c02\u0c1f\u0c41\u0c28\u0c4d\u0c28\u0c3e\u0c30\u0c3e?',
      cancel: '\u0c30\u0c26\u0c4d\u0c26\u0c41',
      logout: '\u0c32\u0c3e\u0c17\u0c4d\u0c05\u0c09\u0c1f\u0c4d',
      footer: '\u0c26\u0c4d\u0c35\u0c3e\u0c30\u0c3e \u0c28\u0c21\u0c41\u0c38\u0c4d\u0c24\u0c4b\u0c02\u0c26\u0c3f',
    },
  }[lang] || null;

  useEffect(() => {
    AsyncStorage.getItem('krishitrace_email').then((value) => {
      if (value) setEmail(value);
    });
  }, []);

  const handleLogout = () => {
    Alert.alert(copy.signOutTitle, copy.signOutConfirm, [
      { text: copy.cancel, style: 'cancel' },
      {
        text: copy.logout,
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.removeItem('krishitrace_token');
          await AsyncStorage.removeItem('krishitrace_email');
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const accountItems = [
    { icon: '🌾', label: copy.accountItems[0], onPress: () => router.push('/(tabs)/harvest') },
    { icon: '📈', label: copy.accountItems[1], onPress: () => router.push('/(tabs)/market') },
    { icon: '📷', label: copy.accountItems[2], onPress: () => router.push('/(tabs)/scan') },
  ];

  const settingsItems = [
    { icon: '🌐', label: copy.settingsItems[0], onPress: () => {} },
    { icon: '🔒', label: copy.settingsItems[1], onPress: () => {} },
    { icon: 'ℹ️', label: copy.settingsItems[2], onPress: () => {} },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>{copy.headerEyebrow}</Text>
        <Text style={styles.headerTitle}>{copy.headerTitle}</Text>
        <Text style={styles.headerSubtitle}>{copy.headerSubtitle}</Text>
      </View>

      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>🧑‍🌾</Text>
        </View>
        <Text style={styles.nameText}>{copy.name}</Text>
        <Text style={styles.emailText}>{email || copy.loggedIn}</Text>
        <View style={styles.verifiedBadge}>
          <Text style={styles.verifiedText}>{copy.verified}</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        {[
          { label: copy.stats[0], value: '—' },
          { label: copy.stats[1], value: '—' },
          { label: copy.stats[2], value: '—' },
        ].map(({ label, value }) => (
          <View key={label} style={styles.statBox}>
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statLabel}>{label}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>{copy.account}</Text>
      <View style={styles.menuCard}>
        {accountItems.map((item, index) => (
          <MenuItem key={item.label} {...item} last={index === accountItems.length - 1} />
        ))}
      </View>

      <Text style={styles.sectionTitle}>{copy.settings}</Text>
      <View style={styles.menuCard}>
        {settingsItems.map((item, index) => (
          <MenuItem key={item.label} {...item} last={index === settingsItems.length - 1} />
        ))}
      </View>

      <View style={styles.menuCard}>
        <MenuItem icon="🚪" label={copy.signOut} onPress={handleLogout} danger last />
      </View>

      <Text style={styles.footer}>
        KrishiTrace Mobile v1.0.0{'\n'}
        {copy.footer} `krishitrace-one.vercel.app`
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: 20, paddingTop: 56, paddingBottom: 60 },
  header: { marginBottom: 24 },
  eyebrow: { color: Colors.primary, fontSize: 13, fontWeight: '700', marginBottom: 6 },
  headerTitle: { color: Colors.textPrimary, fontSize: 26, fontWeight: '800' },
  headerSubtitle: { color: Colors.textSecondary, fontSize: 14, marginTop: 4, lineHeight: 20 },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 28,
    backgroundColor: Colors.bgCard,
    borderRadius: 28,
    padding: 22,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: Colors.bgInput,
    borderWidth: 2,
    borderColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: { fontSize: 44 },
  nameText: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary },
  emailText: { fontSize: 14, color: Colors.textSecondary, marginTop: 2 },
  verifiedBadge: {
    marginTop: 8,
    backgroundColor: Colors.primary + '18',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  verifiedText: { color: Colors.primary, fontSize: 13, fontWeight: '700' },
  statsRow: { flexDirection: 'row', marginBottom: 28, gap: 12 },
  statBox: {
    flex: 1,
    backgroundColor: Colors.bgCard,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statValue: { color: Colors.textPrimary, fontSize: 22, fontWeight: '800' },
  statLabel: { color: Colors.textSecondary, fontSize: 12, marginTop: 2 },
  sectionTitle: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 10,
    marginTop: 8,
  },
  menuCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
    overflow: 'hidden',
  },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 15 },
  menuDivider: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  menuIcon: { fontSize: 20, marginRight: 14 },
  menuLabel: { flex: 1, color: Colors.textPrimary, fontSize: 15, fontWeight: '500' },
  menuArrow: { color: Colors.textMuted, fontSize: 20 },
  footer: { color: Colors.textMuted, fontSize: 11, textAlign: 'center', marginTop: 20, lineHeight: 18 },
});
