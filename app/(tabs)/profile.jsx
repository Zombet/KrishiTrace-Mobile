import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';

const MenuItem = ({ icon, label, onPress, danger }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.8}>
    <Text style={styles.menuIcon}>{icon}</Text>
    <Text style={[styles.menuLabel, danger && { color: Colors.error }]}>{label}</Text>
    <Text style={styles.menuArrow}>›</Text>
  </TouchableOpacity>
);

export default function ProfileScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');

  useEffect(() => {
    AsyncStorage.getItem('krishitrace_email').then((e) => {
      if (e) setEmail(e);
    });
  }, []);

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout', style: 'destructive',
        onPress: async () => {
          await AsyncStorage.removeItem('krishitrace_token');
          await AsyncStorage.removeItem('krishitrace_email');
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Avatar / Profile header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>🧑‍🌾</Text>
        </View>
        <Text style={styles.nameText}>KrishiTrace Farmer</Text>
        <Text style={styles.emailText}>{email || 'Logged In'}</Text>
        <View style={styles.verifiedBadge}>
          <Text style={styles.verifiedText}>✅ Verified Account</Text>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        {[
          { label: 'Batches', value: '—' },
          { label: 'Verified', value: '—' },
          { label: 'Markets', value: '—' },
        ].map(({ label, value }) => (
          <View key={label} style={styles.statBox}>
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statLabel}>{label}</Text>
          </View>
        ))}
      </View>

      {/* Menu */}
      <Text style={styles.sectionTitle}>Account</Text>
      <View style={styles.menuCard}>
        <MenuItem icon="🌾" label="My Harvests"     onPress={() => router.push('/(tabs)/harvest')} />
        <MenuItem icon="📈" label="Market Prices"   onPress={() => router.push('/(tabs)/market')} />
        <MenuItem icon="📷" label="Scan QR Code"    onPress={() => router.push('/(tabs)/scan')} />
      </View>

      <Text style={styles.sectionTitle}>Settings</Text>
      <View style={styles.menuCard}>
        <MenuItem icon="🌐" label="Connected to Vercel API" onPress={() => {}} />
        <MenuItem icon="🔒" label="Privacy Policy"          onPress={() => {}} />
        <MenuItem icon="ℹ️"  label="App Version 1.0.0"      onPress={() => {}} />
      </View>

      <View style={styles.menuCard}>
        <MenuItem icon="🚪" label="Sign Out" onPress={handleLogout} danger />
      </View>

      <Text style={styles.footer}>
        KrishiTrace Mobile v1.0.0{'\n'}
        Powered by krishitrace-one.vercel.app
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content:   { padding: 20, paddingTop: 56, paddingBottom: 60 },

  profileHeader: { alignItems: 'center', marginBottom: 28 },
  avatar:        { width: 90, height: 90, borderRadius: 45, backgroundColor: Colors.bgCard, borderWidth: 2, borderColor: Colors.primary, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarText:    { fontSize: 44 },
  nameText:      { fontSize: 20, fontWeight: '800', color: Colors.textPrimary },
  emailText:     { fontSize: 14, color: Colors.textSecondary, marginTop: 2 },
  verifiedBadge: { marginTop: 8, backgroundColor: Colors.primary + '22', paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20, borderWidth: 1, borderColor: Colors.primary + '44' },
  verifiedText:  { color: Colors.primary, fontSize: 13, fontWeight: '600' },

  statsRow: { flexDirection: 'row', marginBottom: 28, gap: 12 },
  statBox:  { flex: 1, backgroundColor: Colors.bgCard, borderRadius: 14, paddingVertical: 16, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  statValue: { color: Colors.textPrimary, fontSize: 22, fontWeight: '800' },
  statLabel: { color: Colors.textSecondary, fontSize: 12, marginTop: 2 },

  sectionTitle: { color: Colors.textSecondary, fontSize: 12, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10, marginTop: 8 },

  menuCard:  { backgroundColor: Colors.bgCard, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, marginBottom: 16, overflow: 'hidden' },
  menuItem:  { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: Colors.border },
  menuIcon:  { fontSize: 20, marginRight: 14 },
  menuLabel: { flex: 1, color: Colors.textPrimary, fontSize: 15 },
  menuArrow: { color: Colors.textMuted, fontSize: 20 },

  footer: { color: Colors.textMuted, fontSize: 11, textAlign: 'center', marginTop: 20, lineHeight: 18 },
});
