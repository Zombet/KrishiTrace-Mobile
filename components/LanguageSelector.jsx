import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../constants/Colors';

const LANGUAGES = [
  { code: 'en', label: 'English', emoji: '🇬🇧' },
  { code: 'hi', label: 'हिंदी', emoji: '🇮🇳' },
  { code: 'te', label: 'తెలుగు', emoji: '🇮🇳' },
  { code: 'kn', label: 'ಕನ್ನಡ', emoji: '🇮🇳' },
  { code: 'ta', label: 'தமிழ்', emoji: '🇮🇳' }
];

export default function LanguageSelector() {
  const { i18n } = useTranslation();
  const [modalVisible, setModalVisible] = useState(false);

  const changeLang = async (code) => {
    i18n.changeLanguage(code);
    await AsyncStorage.setItem('appLang', code);
    setModalVisible(false);
  };

  const currentLang = LANGUAGES.find(l => l.code === i18n.language) || LANGUAGES[0];

  return (
    <>
      <TouchableOpacity style={styles.btn} onPress={() => setModalVisible(true)}>
        <Text style={styles.btnText}>🌐 {currentLang.code.toUpperCase()}</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="fade" transparent onRequestClose={() => setModalVisible(false)}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setModalVisible(false)}>
          <View style={styles.modalBody}>
            <Text style={styles.title}>Select Language</Text>
            {LANGUAGES.map(l => (
               <TouchableOpacity 
                 key={l.code} 
                 style={[styles.langBtn, i18n.language === l.code && styles.langBtnActive]}
                 onPress={() => changeLang(l.code)}
               >
                 <Text style={styles.langEmoji}>{l.emoji}</Text>
                 <Text style={[styles.langText, i18n.language === l.code && styles.langTextActive]}>{l.label}</Text>
               </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  btn: { backgroundColor: Colors.bgCard, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: Colors.border },
  btnText: { fontSize: 13, fontWeight: '700', color: Colors.primary },
  overlay: { flex: 1, backgroundColor: '#000000aa', justifyContent: 'center', alignItems: 'center' },
  modalBody: { width: '80%', backgroundColor: Colors.bgCard, borderRadius: 16, padding: 20 },
  title: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary, marginBottom: 16, textAlign: 'center' },
  langBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, borderRadius: 12, marginBottom: 8, backgroundColor: Colors.bgInput },
  langBtnActive: { backgroundColor: Colors.primary },
  langEmoji: { fontSize: 20, marginRight: 12 },
  langText: { fontSize: 16, color: Colors.textSecondary, fontWeight: '600' },
  langTextActive: { color: '#fff' }
});
