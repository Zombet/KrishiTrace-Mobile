import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Modal, FlatList, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native';
import api from '../services/api';
import { Colors } from '../constants/Colors';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';

export default function MarketChatbot({ visible, onClose, initialCropContext = null }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [asking, setAsking] = useState(false);
  const flatListRef = useRef(null);

  useEffect(() => {
    if (visible) {
      setMessages([
        { role: 'bot', text: `Namaste! 🙏 I'm your Market Price Advisor. Ask me anything about selling your ${initialCropContext || 'crop'} — prices, best time to sell, MSP, or revenue estimates.` }
      ]);
    }
  }, [visible, initialCropContext]);

  const sendMessage = async (presetText = null) => {
    const q = presetText || input.trim();
    if (!q) return;

    setMessages(m => [...m, { role: 'user', text: q }]);
    if (!presetText) setInput('');
    setAsking(true);

    try {
      const { data } = await api.post('/market/ask', {
        question: q,
        cropContext: initialCropContext?.toLowerCase(),
      });
      setMessages(m => [...m, { role: 'bot', text: data.answer }]);
    } catch (err) {
      setMessages(m => [...m, { role: 'bot', text: 'Sorry, could not fetch answer right now. Please try again.' }]);
    } finally {
      setAsking(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalSheet}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <Icon name="robot-outline" size={24} color={Colors.primary} />
            </View>
            <View>
              <Text style={styles.title}>Market Advisor</Text>
              <Text style={styles.subtitle}>AI Pricing Assistant</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Icon name="close" size={24} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Chat List */}
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(_, i) => String(i)}
            contentContainerStyle={styles.chatContainer}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            renderItem={({ item }) => (
              <View style={[styles.msgRow, item.role === 'user' ? styles.msgRight : styles.msgLeft]}>
                {item.role === 'bot' && (
                  <View style={styles.avatarBot}>
                    <Icon name="robot-outline" size={16} color="#fff" />
                  </View>
                )}
                <View style={[styles.bubble, item.role === 'user' ? styles.bubbleUser : styles.bubbleBot]}>
                  <Text style={[styles.msgText, item.role === 'user' && { color: '#fff' }]}>
                    {item.text}
                  </Text>
                </View>
              </View>
            )}
            ListFooterComponent={asking ? (
              <View style={[styles.msgRow, styles.msgLeft]}>
                 <View style={styles.avatarBot}>
                    <Icon name="robot-outline" size={16} color="#fff" />
                  </View>
                 <View style={[styles.bubble, styles.bubbleBot, { paddingVertical: 14 }]}>
                    <ActivityIndicator size="small" color={Colors.primary} />
                 </View>
              </View>
            ) : null}
          />

          {/* Suggestions */}
          {messages.length < 3 && !asking && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.suggestionLayer}>
               {[`Price of ${initialCropContext || 'tomato'}?`, 'What is the MSP?', 'Best time to sell?'].map(s => (
                 <TouchableOpacity key={s} style={styles.suggestionChip} onPress={() => sendMessage(s)}>
                    <Text style={styles.suggestionText}>{s}</Text>
                 </TouchableOpacity>
               ))}
            </ScrollView>
          )}

          {/* Input Box */}
          <View style={styles.inputArea}>
            <TextInput
              style={styles.input}
              placeholder="Ask about prices..."
              placeholderTextColor={Colors.textMuted}
              value={input}
              onChangeText={setInput}
              onSubmitEditing={() => sendMessage()}
            />
            <TouchableOpacity 
              style={[styles.sendBtn, !input.trim() && { opacity: 0.5 }]} 
              onPress={() => sendMessage()} 
              disabled={asking || !input.trim()}
            >
              <Icon name="send" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

// Ensure ScrollView is imported
import { ScrollView } from 'react-native';

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: '#000000bb', justifyContent: 'flex-end' },
  modalSheet:   { backgroundColor: Colors.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24, height: '85%' },
  
  header: { 
    flexDirection: 'row', alignItems: 'center', padding: 16, 
    borderBottomWidth: 1, borderBottomColor: Colors.border, backgroundColor: Colors.bgCard,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
  },
  headerIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primary + '22', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  title:    { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  subtitle: { fontSize: 13, color: Colors.textSecondary },
  closeBtn: { marginLeft: 'auto', padding: 8 },

  chatContainer: { padding: 16, paddingBottom: 24 },
  msgRow: { flexDirection: 'row', marginBottom: 16, alignItems: 'flex-end', maxWidth: '85%' },
  msgLeft:  { alignSelf: 'flex-start' },
  msgRight: { alignSelf: 'flex-end', justifyContent: 'flex-end' },
  
  avatarBot: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  bubble:    { borderRadius: 18, paddingHorizontal: 16, paddingVertical: 12 },
  bubbleBot: { backgroundColor: Colors.bgCard, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: Colors.border },
  bubbleUser:{ backgroundColor: Colors.blue, borderBottomRightRadius: 4 },
  msgText:   { fontSize: 15, color: Colors.textPrimary, lineHeight: 22 },

  suggestionLayer: { maxHeight: 50, paddingHorizontal: 16, marginBottom: 8 },
  suggestionChip:  { backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.primary + '55', borderRadius: 16, paddingHorizontal: 14, justifyContent: 'center', marginRight: 8, height: 36 },
  suggestionText:  { color: Colors.primary, fontSize: 13, fontWeight: '600' },

  inputArea: { flexDirection: 'row', padding: 16, borderTopWidth: 1, borderTopColor: Colors.border, backgroundColor: Colors.bg, paddingBottom: Platform.OS === 'ios' ? 32 : 16 },
  input:     { flex: 1, backgroundColor: Colors.bgInput, borderWidth: 1, borderColor: Colors.border, borderRadius: 24, paddingHorizontal: 16, fontSize: 15, color: Colors.textPrimary, maxHeight: 100, minHeight: 48 },
  sendBtn:   { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center', marginLeft: 12 },
});
