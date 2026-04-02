import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { register } from '../../services/api';
import { Colors } from '../../constants/Colors';

export default function RegisterScreen() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'farmer' });
  const [loading, setLoading] = useState(false);

  const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

  const handleRegister = async () => {
    if (!form.name || !form.email || !form.password) {
      Alert.alert('Missing Fields', 'Please fill all fields.');
      return;
    }
    setLoading(true);
    try {
      await register(form);
      Alert.alert('Success!', 'Account created. Please login.', [
        { text: 'Login', onPress: () => router.replace('/(auth)/login') },
      ]);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Registration failed.';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        <View style={styles.brandArea}>
          <Text style={styles.logo}>🌾</Text>
          <Text style={styles.brandName}>KrishiTrace</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join the KrishiTrace farmer network</Text>

          {[
            { label: 'Full Name', key: 'name', placeholder: 'Ravi Kumar' },
            { label: 'Email', key: 'email', placeholder: 'ravi@example.com', keyboard: 'email-address' },
            { label: 'Password', key: 'password', placeholder: '••••••••', secure: true },
          ].map(({ label, key, placeholder, keyboard, secure }) => (
            <View key={key}>
              <Text style={styles.label}>{label}</Text>
              <TextInput
                style={styles.input}
                placeholder={placeholder}
                placeholderTextColor={Colors.textMuted}
                value={form[key]}
                onChangeText={set(key)}
                keyboardType={keyboard || 'default'}
                autoCapitalize={key === 'email' ? 'none' : 'words'}
                secureTextEntry={secure}
              />
            </View>
          ))}

          {/* Role selector */}
          <Text style={styles.label}>Role</Text>
          <View style={styles.roleRow}>
            {['farmer', 'buyer', 'inspector'].map((r) => (
              <TouchableOpacity
                key={r}
                style={[styles.roleBtn, form.role === r && styles.roleBtnActive]}
                onPress={() => set('role')(r)}
              >
                <Text style={[styles.roleBtnText, form.role === r && styles.roleBtnTextActive]}>
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.btnText}>Create Account</Text>
            }
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkBtn} onPress={() => router.back()}>
            <Text style={styles.linkText}>
              Already registered? <Text style={styles.linkAccent}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll:    { flexGrow: 1, justifyContent: 'center', padding: 20 },

  brandArea: { alignItems: 'center', marginBottom: 28 },
  logo:      { fontSize: 52 },
  brandName: { fontSize: 28, fontWeight: '800', color: Colors.primary },

  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    elevation: 8,
  },

  title:    { fontSize: 22, fontWeight: '700', color: Colors.textPrimary, marginBottom: 4 },
  subtitle: { fontSize: 13, color: Colors.textSecondary, marginBottom: 20 },

  label: { fontSize: 13, color: Colors.textSecondary, marginBottom: 6, marginTop: 12 },
  input: {
    backgroundColor: Colors.bgInput,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    color: Colors.textPrimary,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
  },

  roleRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  roleBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 10,
    backgroundColor: Colors.bgInput, borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center',
  },
  roleBtnActive:     { backgroundColor: Colors.primary, borderColor: Colors.primary },
  roleBtnText:       { color: Colors.textSecondary, fontSize: 13, fontWeight: '600' },
  roleBtnTextActive: { color: '#fff' },

  btn:         { backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 24 },
  btnDisabled: { opacity: 0.6 },
  btnText:     { color: '#fff', fontSize: 16, fontWeight: '700' },

  linkBtn:    { alignItems: 'center', marginTop: 16 },
  linkText:   { color: Colors.textSecondary, fontSize: 14 },
  linkAccent: { color: Colors.primary, fontWeight: '600' },
});
