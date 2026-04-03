import { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Modal, TextInput, Alert, ActivityIndicator, RefreshControl,
  Animated, ScrollView, Easing,
} from 'react-native';
import { getHarvests, addHarvest } from '../../services/api';
import api from '../../services/api';
import { Colors } from '../../constants/Colors';
import MarketChatbot from '../../components/MarketChatbot';
import { useTranslation } from 'react-i18next';
import blockchain from '../../services/blockchain';

const CROPS = [
  'Tomato', 'Potato', 'Onion', 'Rice', 'Wheat', 'Maize', 'Mango', 
  'Banana', 'Jackfruit', 'Sugarcane', 'Cotton', 'Soybean', 
  'Groundnut', 'Chilli', 'Pineapple'
];

const LANGUAGES = [
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'hi', label: 'हि', name: 'Hindi' },
  { code: 'te', label: 'తె', name: 'Telugu' },
  { code: 'kn', label: 'ಕ', name: 'Kannada' },
  { code: 'ta', label: 'த',  name: 'Tamil' },
];

const VOICE_HINTS = {
  en: '"Tomato 50 kg harvest date 10th March payout 30 rupees"',
  hi: '"टमाटर 50 किलो कटाई तारीख 10 मार्च पेआउट 30 रुपये"',
  te: '"టమాటా 50 కేజీలు కోత తేదీ 10 మార్చి పేమెంట్ 30 రూపాయలు"',
  kn: '"ಟೊಮ್ಯಾಟೊ 50 ಕಿಲೋ ಕೊಯ್ಲು ದಿನಾಂಕ 10 ಮಾರ್ಚ್ ಪಾವತಿ 30 ರೂಪಾಯಿ"',
  ta: '"தக்காளி 50 கிலோ அறுவடை தேதி 10 மார்ச் கட்டணம் 30 ரூபாய்"',
};

const statusColor = (s) => {
  if (!s) return Colors.textSecondary;
  if (s.toLowerCase().includes('verif')) return Colors.success;
  if (s.toLowerCase().includes('transit')) return Colors.gold;
  return Colors.blue;
};

const MarketInsights = ({ crop, prices, loading, text }) => {
  if (!crop) return null;
  return (
    <View style={styles.insightsContainer}>
      <Text style={styles.insightsTitle}>🤝 {text.marketInsights}</Text>
      <Text style={styles.insightsSubtitle}>{text.recentSales.replace('{{crop}}', crop)}</Text>
      {loading ? (
        <ActivityIndicator size="small" color={Colors.primary} style={{ marginTop: 12, marginBottom: 8 }} />
      ) : prices.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.insightsScroll}>
          {prices.map((p, i) => (
            <View key={i} style={styles.insightCard}>
              <View style={styles.insightHeader}>
                <Text style={styles.insightEmoji}>{p.emoji}</Text>
                <Text style={styles.insightName}>{p.name}</Text>
              </View>
              <Text style={styles.insightPrice}>₹{p.price}<Text style={{ fontSize: 11, color: Colors.textSecondary }}>/{p.unit}</Text></Text>
              <Text style={styles.insightTime}>{p.time}</Text>
            </View>
          ))}
        </ScrollView>
      ) : (
        <Text style={[styles.insightsSubtitle, { marginTop: 12 }]}>{text.noSales}</Text>
      )}
    </View>
  );
};

const HarvestCard = ({ item, text }) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <Text style={styles.cropName}>{item.cropType || text.cropFallback}</Text>
      <View style={[styles.badge, { backgroundColor: statusColor(item.status) + '22' }]}>
        <Text style={[styles.badgeText, { color: statusColor(item.status) }]}>
          {item.fairPriceCompliant === true ? `✅ ${text.compliant}` :
           item.fairPriceCompliant === false ? `⚠️ ${text.violation}` :
           item.status || text.recorded}
        </Text>
      </View>
    </View>
    <Text style={styles.meta}>📍 {item.farmAddress || item.location || text.locationNotSet}</Text>
    <Text style={styles.meta}>⚖️  {item.quantity} {item.unit || 'kg'}</Text>
    {item.payoutBreakdown?.farmerPayout && (
      <Text style={styles.meta}>💰 ₹{item.payoutBreakdown.farmerPayout}/kg {text.farmerPayout}</Text>
    )}
    <Text style={styles.meta}>📅 {item.harvestDate ? new Date(item.harvestDate).toDateString() : '—'}</Text>
  </View>
);

export default function HarvestScreen() {
  const { t, i18n } = useTranslation();
  const langCode = (i18n.language || 'en').split('-')[0];
  const lang = ['hi', 'te'].includes(langCode) ? langCode : 'en';
  const text = {
    en: {
      marketInsights: 'Market Insights',
      recentSales: 'Recent local sales of {{crop}} by friend farmers',
      noSales: 'No recent community sales found.',
      cropFallback: 'Crop',
      compliant: 'Compliant',
      violation: 'Violation',
      recorded: 'Recorded',
      locationNotSet: 'Location not set',
      farmerPayout: 'farmer payout',
      emptyHelp: 'Tap AI Assist to log with AI or Add Batch to fill manually.',
      aiInputTitle: 'AI Assist Input',
      aiInputSubtitle: 'For this demo, type what you would say so the AI can parse harvest details.',
      recognizedLanguage: 'Recognized Language Context',
      examplePhrase: 'Example phrase:',
      yourSpeech: 'Your speech (type here)',
      cancel: 'Cancel',
      parseWithAi: 'Parse with AI',
      addBatchTitle: 'Add Batch',
      locationPlaceholder: 'e.g. Kurnool, AP',
      quantityPlaceholder: '500',
      payoutPlaceholder: 'e.g. 30',
      consumerPlaceholder: 'e.g. 55',
      transportPlaceholder: 'e.g. 5',
      emptyTranscriptTitle: 'Empty Transcript',
      emptyTranscriptMsg: 'Please type what you would say.',
      parsedTitle: 'AI Parsed',
      parsedMsg: 'Extracted: {{crop}} {{qty}} {{unit}}. Review and submit.',
      parseError: 'Parse Error',
      parseFallback: 'Could not parse. Please fill manually.',
      missingFieldsTitle: 'Missing Fields',
      missingFieldsMsg: 'Crop, quantity, farmer payout and consumer price are required.',
      minedTitle: 'Block Mined',
      minedMsg: 'Block #{{index}} added to chain\nHash: {{hash}}...\nTotal blocks: {{count}}',
      errorTitle: 'Error',
      mineFailed: 'Failed to mine block:',
      miningTitle: 'Mining Block...',
      miningSubtitle: 'Computing SHA-256 hash',
    },
    hi: {
      marketInsights: '\u092c\u093e\u091c\u093c\u093e\u0930 \u091d\u0932\u0915',
      recentSales: '\u092e\u093f\u0924\u094d\u0930 \u0915\u093f\u0938\u093e\u0928\u094b\u0902 \u0915\u0940 {{crop}} \u0915\u0940 \u0939\u093e\u0932 \u0915\u0940 \u0938\u094d\u0925\u093e\u0928\u0940\u092f \u092c\u093f\u0915\u094d\u0930\u0940',
      noSales: '\u0915\u094b\u0908 \u0939\u093e\u0932 \u0915\u0940 \u0938\u092e\u0941\u0926\u093e\u092f \u092c\u093f\u0915\u094d\u0930\u0940 \u0928\u0939\u0940\u0902 \u092e\u093f\u0932\u0940\u0964',
      cropFallback: '\u092b\u0938\u0932',
      compliant: '\u0905\u0928\u0941\u092a\u093e\u0932\u093f\u0924',
      violation: '\u0909\u0932\u094d\u0932\u0902\u0918\u0928',
      recorded: '\u0926\u0930\u094d\u091c',
      locationNotSet: '\u0938\u094d\u0925\u093e\u0928 \u0938\u0947\u091f \u0928\u0939\u0940\u0902',
      farmerPayout: '\u0915\u093f\u0938\u093e\u0928 \u092d\u0941\u0917\u0924\u093e\u0928',
      emptyHelp: 'AI \u0938\u0939\u093e\u092f\u0924\u093e \u0938\u0947 \u0932\u0949\u0917 \u0915\u0930\u0947\u0902 \u092f\u093e Add Batch \u0924\u094b \u0939\u093e\u0925 \u0938\u0947 \u092d\u0930\u0947\u0902\u0964',
      aiInputTitle: 'AI \u0938\u0939\u093e\u092f\u0924\u093e \u0907\u0928\u092a\u0941\u091f',
      aiInputSubtitle: '\u0907\u0938 \u0921\u0947\u092e\u094b \u092e\u0947\u0902 \u0906\u092a \u091c\u094b \u092c\u094b\u0932\u0924\u0947 \u0939\u0948\u0902 \u0935\u0939 \u091f\u093e\u0907\u092a \u0915\u0930\u0947\u0902.',
      recognizedLanguage: '\u092a\u0939\u091a\u093e\u0928\u0940 \u0917\u0908 \u092d\u093e\u0937\u093e',
      examplePhrase: '\u0909\u0926\u093e\u0939\u0930\u0923 \u0935\u093e\u0915\u094d\u092f:',
      yourSpeech: '\u0906\u092a\u0915\u093e \u0915\u0939\u093e \u0939\u0941\u0906 \u0935\u093e\u0915\u094d\u092f',
      cancel: '\u0930\u0926\u094d\u0926 \u0915\u0930\u0947\u0902',
      parseWithAi: 'AI \u0938\u0947 \u092a\u093e\u0930\u094d\u0938 \u0915\u0930\u0947\u0902',
      addBatchTitle: '\u092c\u0948\u091a \u091c\u094b\u095c\u0947\u0902',
      locationPlaceholder: '\u0909\u0926\u093e\u0939\u0930\u0923: Kurnool, AP',
      quantityPlaceholder: '500',
      payoutPlaceholder: '\u0909\u0926\u093e\u0939\u0930\u0923: 30',
      consumerPlaceholder: '\u0909\u0926\u093e\u0939\u0930\u0923: 55',
      transportPlaceholder: '\u0909\u0926\u093e\u0939\u0930\u0923: 5',
      emptyTranscriptTitle: '\u0916\u093e\u0932\u0940 \u091f\u094d\u0930\u093e\u0928\u094d\u0938\u0915\u094d\u0930\u093f\u092a\u094d\u091f',
      emptyTranscriptMsg: '\u0915\u0943\u092a\u092f\u093e \u091c\u094b \u0906\u092a \u092c\u094b\u0932\u0924\u0947 \u0939\u0948\u0902 \u0935\u0939 \u091f\u093e\u0907\u092a \u0915\u0930\u0947\u0902\u0964',
      parsedTitle: 'AI \u0928\u0947 \u0938\u092e\u091d\u093e',
      parsedMsg: '\u0928\u093f\u0915\u0932\u093e: {{crop}} {{qty}} {{unit}}. \u091c\u093e\u0901\u091a\u0915\u0930 \u0938\u092c\u092e\u093f\u091f \u0915\u0930\u0947\u0902\u0964',
      parseError: '\u092a\u093e\u0930\u094d\u0938 \u0917\u0932\u0924\u0940',
      parseFallback: '\u0938\u092e\u091d \u0928\u0939\u0940\u0902 \u0938\u0915\u093e. \u0915\u0943\u092a\u092f\u093e \u0939\u093e\u0925 \u0938\u0947 \u092d\u0930\u0947\u0902\u0964',
      missingFieldsTitle: '\u091c\u0930\u0942\u0930\u0940 \u092b\u0940\u0932\u094d\u0921 \u0915\u092e \u0939\u0948\u0902',
      missingFieldsMsg: '\u092b\u0938\u0932, \u092e\u093e\u0924\u094d\u0930\u093e, \u0915\u093f\u0938\u093e\u0928 \u092d\u0941\u0917\u0924\u093e\u0928 \u0914\u0930 \u0917\u094d\u0930\u093e\u0939\u0915 \u092e\u0942\u0932\u094d\u092f \u091c\u0930\u0942\u0930\u0940 \u0939\u0948\u0902\u0964',
      minedTitle: '\u092c\u094d\u0932\u0949\u0915 \u092e\u093e\u0907\u0928 \u0939\u094b \u0917\u092f\u093e',
      minedMsg: '\u092c\u094d\u0932\u0949\u0915 #{{index}} \u091a\u0947\u0928 \u092e\u0947\u0902 \u091c\u094b\u095c\u093e \u0917\u092f\u093e\nHash: {{hash}}...\n\u0915\u0941\u0932 \u092c\u094d\u0932\u0949\u0915: {{count}}',
      errorTitle: '\u0924\u094d\u0930\u0941\u091f\u093f',
      mineFailed: '\u092c\u094d\u0932\u0949\u0915 \u092e\u093e\u0907\u0928 \u0928\u0939\u0940\u0902 \u0939\u0941\u0906:',
      miningTitle: '\u092c\u094d\u0932\u0949\u0915 \u092e\u093e\u0907\u0928 \u0939\u094b \u0930\u0939\u093e \u0939\u0948...',
      miningSubtitle: 'SHA-256 hash \u0917\u0923\u0928\u093e \u0915\u0930 \u0930\u0939\u093e \u0939\u0948',
    },
    te: {
      marketInsights: '\u0c2e\u0c3e\u0c30\u0c4d\u0c15\u0c46\u0c1f\u0c4d \u0c07\u0c28\u0c4d\u0c38\u0c48\u0c1f\u0c4d\u0c38\u0c4d',
      recentSales: '\u0c2e\u0c3f\u0c24\u0c4d\u0c30 \u0c30\u0c48\u0c24\u0c41\u0c32\u0c35\u0c26\u0c4d\u0c26 {{crop}} \u0c39\u0c3e\u0c32\u0c40 \u0c05\u0c2e\u0c4d\u0c2e\u0c15\u0c3e\u0c32\u0c41',
      noSales: '\u0c39\u0c3e\u0c32\u0c40 \u0c38\u0c2e\u0c41\u0c26\u0c3e\u0c2f \u0c05\u0c2e\u0c4d\u0c2e\u0c15\u0c3e\u0c32\u0c41 \u0c15\u0c28\u0c3f\u0c2a\u0c3f\u0c02\u0c1a\u0c32\u0c47\u0c26\u0c41.',
      cropFallback: '\u0c2a\u0c02\u0c1f',
      compliant: '\u0c05\u0c28\u0c41\u0c15\u0c42\u0c32\u0c02',
      violation: '\u0c09\u0c32\u0c4d\u0c32\u0c02\u0c18\u0c28',
      recorded: '\u0c30\u0c3f\u0c15\u0c3e\u0c30\u0c4d\u0c21\u0c4d \u0c05\u0c2f\u0c3f\u0c02\u0c26\u0c3f',
      locationNotSet: '\u0c38\u0c4d\u0c25\u0c3e\u0c28\u0c02 \u0c38\u0c46\u0c1f\u0c4d \u0c1a\u0c47\u0c2f\u0c32\u0c47\u0c26\u0c41',
      farmerPayout: '\u0c30\u0c48\u0c24\u0c41 \u0c1a\u0c46\u0c32\u0c4d\u0c32\u0c3f\u0c02\u0c2a\u0c41',
      emptyHelp: 'AI \u0c38\u0c39\u0c3e\u0c2f\u0c02\u0c24\u0c4b \u0c32\u0c3e\u0c17\u0c4d \u0c1a\u0c47\u0c2f\u0c02\u0c21\u0c3f \u0c32\u0c47\u0c26\u0c3e Add Batch \u0c24\u0c4b \u0c1a\u0c47\u0c24\u0c3f\u0c24\u0c4b \u0c2d\u0c30\u0c02\u0c21\u0c3f.',
      aiInputTitle: 'AI \u0c38\u0c39\u0c3e\u0c2f \u0c07\u0c28\u0c4d\u0c2a\u0c41\u0c1f\u0c4d',
      aiInputSubtitle: '\u0c08 \u0c21\u0c46\u0c2e\u0c4b\u0c32\u0c4b \u0c2e\u0c40\u0c30\u0c41 \u0c1a\u0c46\u0c2a\u0c4d\u0c2a\u0c47\u0c26\u0c3f \u0c1f\u0c48\u0c2a\u0c4d \u0c1a\u0c47\u0c2f\u0c02\u0c21\u0c3f.',
      recognizedLanguage: '\u0c17\u0c41\u0c30\u0c4d\u0c24\u0c3f\u0c02\u0c1a\u0c3f\u0c28 \u0c2d\u0c3e\u0c37',
      examplePhrase: '\u0c09\u0c26\u0c3e\u0c39\u0c30\u0c23 \u0c35\u0c3e\u0c15\u0c4d\u0c2f\u0c02:',
      yourSpeech: '\u0c2e\u0c40 \u0c2e\u0c3e\u0c1f',
      cancel: '\u0c30\u0c26\u0c4d\u0c26\u0c41',
      parseWithAi: 'AI \u0c24\u0c4b \u0c2a\u0c3e\u0c30\u0c4d\u0c38\u0c4d \u0c1a\u0c47\u0c2f\u0c02\u0c21\u0c3f',
      addBatchTitle: '\u0c2c\u0c4d\u0c2f\u0c3e\u0c1a\u0c4d \u0c1c\u0c4b\u0c21\u0c3f\u0c02\u0c1a\u0c02\u0c21\u0c3f',
      locationPlaceholder: '\u0c09\u0c26\u0c3e: Kurnool, AP',
      quantityPlaceholder: '500',
      payoutPlaceholder: '\u0c09\u0c26\u0c3e: 30',
      consumerPlaceholder: '\u0c09\u0c26\u0c3e: 55',
      transportPlaceholder: '\u0c09\u0c26\u0c3e: 5',
      emptyTranscriptTitle: '\u0c16\u0c3e\u0c33\u0c40 \u0c1f\u0c4d\u0c30\u0c3e\u0c28\u0c4d\u0c38\u0c4d\u0c15\u0c4d\u0c30\u0c3f\u0c2a\u0c4d\u0c1f\u0c4d',
      emptyTranscriptMsg: '\u0c2e\u0c40\u0c30\u0c41 \u0c1a\u0c46\u0c2a\u0c4d\u0c2a\u0c47\u0c26\u0c3f \u0c1f\u0c48\u0c2a\u0c4d \u0c1a\u0c47\u0c2f\u0c02\u0c21\u0c3f.',
      parsedTitle: 'AI \u0c35\u0c3f\u0c36\u0c4d\u0c32\u0c47\u0c37\u0c3f\u0c02\u0c1a\u0c3f\u0c02\u0c26\u0c3f',
      parsedMsg: '\u0c24\u0c40\u0c38\u0c3f\u0c28\u0c26\u0c3f: {{crop}} {{qty}} {{unit}}. \u0c1a\u0c42\u0c38\u0c3f \u0c38\u0c2c\u0c4d\u0c2e\u0c3f\u0c1f\u0c4d \u0c1a\u0c47\u0c2f\u0c02\u0c21\u0c3f.',
      parseError: '\u0c2a\u0c3e\u0c30\u0c4d\u0c38\u0c4d \u0c24\u0c2a\u0c4d\u0c2a\u0c3f\u0c02\u0c26\u0c3f',
      parseFallback: '\u0c2a\u0c3e\u0c30\u0c4d\u0c38\u0c4d \u0c1a\u0c47\u0c2f\u0c32\u0c47\u0c15\u0c2a\u0c4b\u0c2f\u0c3e\u0c2e\u0c41.',
      missingFieldsTitle: '\u0c24\u0c2a\u0c4d\u0c2a\u0c28\u0c3f\u0c38\u0c30\u0c3f \u0c2b\u0c40\u0c32\u0c4d\u0c21\u0c4d\u0c32\u0c41',
      missingFieldsMsg: '\u0c2a\u0c02\u0c1f, \u0c2a\u0c30\u0c3f\u0c2e\u0c3e\u0c23\u0c02, \u0c30\u0c48\u0c24\u0c41 \u0c1a\u0c46\u0c32\u0c4d\u0c32\u0c3f\u0c02\u0c2a\u0c41 \u0c2e\u0c30\u0c3f\u0c2f\u0c41 \u0c35\u0c3f\u0c28\u0c3f\u0c2f\u0c4b\u0c17\u0c26\u0c3e\u0c30\u0c41 \u0c27\u0c30 \u0c15\u0c3e\u0c35\u0c3e\u0c32\u0c3f.',
      minedTitle: '\u0c2c\u0c4d\u0c32\u0c3e\u0c15\u0c4d \u0c2e\u0c48\u0c28\u0c4d \u0c05\u0c2f\u0c4d\u0c2f\u0c3f\u0c02\u0c26\u0c3f',
      minedMsg: '\u0c2c\u0c4d\u0c32\u0c3e\u0c15\u0c4d #{{index}} \u0c1a\u0c48\u0c28\u0c4d\u0c15\u0c3f \u0c1c\u0c4b\u0c21\u0c3f\u0c02\u0c1a\u0c2c\u0c21\u0c3f\u0c02\u0c26\u0c3f\nHash: {{hash}}...\n\u0c2e\u0c4a\u0c24\u0c4d\u0c24\u0c02 \u0c2c\u0c4d\u0c32\u0c3e\u0c15\u0c4d\u0c32\u0c41: {{count}}',
      errorTitle: '\u0c24\u0c2a\u0c4d\u0c2a\u0c3f\u0c02\u0c26\u0c3f',
      mineFailed: '\u0c2c\u0c4d\u0c32\u0c3e\u0c15\u0c4d \u0c2e\u0c48\u0c28\u0c4d \u0c1a\u0c47\u0c2f\u0c32\u0c47\u0c15\u0c2a\u0c4b\u0c2f\u0c3e\u0c2e\u0c41:',
      miningTitle: '\u0c2c\u0c4d\u0c32\u0c3e\u0c15\u0c4d \u0c2e\u0c48\u0c28\u0c4d \u0c05\u0c35\u0c41\u0c24\u0c4b\u0c02\u0c26\u0c3f...',
      miningSubtitle: 'SHA-256 hash \u0c17\u0c23\u0c3f\u0c02\u0c1a\u0c2c\u0c21\u0c41\u0c24\u0c4b\u0c02\u0c26\u0c3f',
    },
  }[lang] || null;
  const [harvests, setHarvests]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modal, setModal]           = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Market Advisor / Chatbot states
  const [chatModal, setChatModal]   = useState(false);
  const [pricesLoading, setPricesLoading] = useState(false);
  const [friendPrices, setFriendPrices]   = useState([]);

  // Voice AI states
  const [voiceModal, setVoiceModal] = useState(false);
  const [voiceLang, setVoiceLang]   = useState('en');
  const [transcript, setTranscript] = useState('');
  const [parsing, setParsing]       = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Mining animation states
  const [miningVisible, setMiningVisible] = useState(false);
  const miningSpinAnim = useRef(new Animated.Value(0)).current;
  const [miningHash, setMiningHash] = useState('');

  const [form, setForm] = useState({
    cropType: '', location: '', quantity: '', unit: 'kg',
    farmerPayout: '', finalConsumerPrice: '', transportCost: '', notes: '',
  });

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const res = await getHarvests();
      setHarvests(res.data?.data || res.data || []);
    } catch (_) {}
    setLoading(false);
    setRefreshing(false);
  };

  const fetchMarketAnalysis = async (c) => {
    setForm(f => ({ ...f, cropType: c }));
    setPricesLoading(true);
    setFriendPrices([]);
    try {
      const { data } = await api.get(`/market/analysis?crop=${c}&quantity=0&unit=kg`);
      
      if (data && data.currentPrice) {
        const base = data.currentPrice;
        const mockFriends = [
          { name: 'Ramesh Reddy', emoji: '🧑🏽‍🌾', price: Math.round(base * 0.98), unit: 'kg', time: '1 hr ago' },
          { name: 'Srinivas Rao', emoji: '👨🏽‍🌾', price: Math.round(base * 1.05), unit: 'kg', time: '3 hrs ago' },
          { name: 'Kavitha M.',   emoji: '👩🏽‍🌾', price: Math.round(base * 1.02), unit: 'kg', time: '5 hrs ago' },
          { name: 'Abdul Khan',   emoji: '🧔🏽‍♂️', price: Math.round(base * 0.95), unit: 'kg', time: 'Yesterday' },
          { name: 'Farmer John',  emoji: '👨🏼‍🌾', price: Math.round(base * 1.01), unit: 'kg', time: '2 hrs ago' }
        ];
        // Shuffle and pick 3 Random
        setFriendPrices(mockFriends.sort(() => 0.5 - Math.random()).slice(0, 3));
      }
      if (data && data.found) {
        setForm(f => ({
          ...f,
          farmerPayout: String(data.recommendedMin),
          finalConsumerPrice: String(data.recommendedMax),
          transportCost: String(Math.round(data.currentPrice * 0.05))
        }));
        // Optional: show a small toast here if a toast library was available
      }
    } catch (err) {
      console.log('Could not fetch market analysis', err);
    } finally {
      setPricesLoading(false);
    }
  };

  // Pulse animation for mic button
  const startPulse = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.2, duration: 600, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,   duration: 600, useNativeDriver: true }),
      ])
    ).start();
  };
  const stopPulse = () => { pulseAnim.stopAnimation(); pulseAnim.setValue(1); };

  const handleVoiceSubmit = async () => {
    if (!transcript.trim()) {
      Alert.alert(text.emptyTranscriptTitle, text.emptyTranscriptMsg);
      return;
    }
    setParsing(true);
    try {
      const { data } = await api.post('/harvest/voice', {
        transcript: transcript.trim(),
        language: voiceLang,
      });
      const p = data.parsed;
      setForm((f) => ({
        ...f,
        cropType:            p.cropType            || f.cropType,
        quantity:            p.quantity != null     ? String(p.quantity)            : f.quantity,
        unit:                p.unit                 || f.unit,
        farmerPayout:        p.farmerPayout != null ? String(p.farmerPayout)        : f.farmerPayout,
        finalConsumerPrice:  p.finalConsumerPrice != null ? String(p.finalConsumerPrice) : f.finalConsumerPrice,
        transportCost:       p.transportCost != null ? String(p.transportCost)      : f.transportCost,
      }));
      setVoiceModal(false);
      setTranscript('');
      setModal(true);
      Alert.alert(
        text.parsedTitle,
        text.parsedMsg
          .replace('{{crop}}', p.cropType || '')
          .replace('{{qty}}', p.quantity || '')
          .replace('{{unit}}', p.unit || '')
      );
    } catch (err) {
      Alert.alert(text.parseError, err?.response?.data?.message || text.parseFallback);
    } finally {
      setParsing(false);
    }
  };

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  // Mining animation helpers
  const showMiningAnimation = () => {
    setMiningVisible(true);
    miningSpinAnim.setValue(0);
    Animated.loop(
      Animated.timing(miningSpinAnim, { toValue: 1, duration: 1000, easing: Easing.linear, useNativeDriver: true })
    ).start();
    const chars = '0123456789abcdef';
    const interval = setInterval(() => {
      let h = '';
      for (let i = 0; i < 64; i++) h += chars[Math.floor(Math.random() * 16)];
      setMiningHash(h);
    }, 50);
    return interval;
  };

  const hideMiningAnimation = (interval) => {
    clearInterval(interval);
    miningSpinAnim.stopAnimation();
    setMiningVisible(false);
  };

  const handleAdd = async () => {
    if (!form.cropType || !form.quantity || !form.farmerPayout || !form.finalConsumerPrice) {
      Alert.alert(text.missingFieldsTitle, text.missingFieldsMsg);
      return;
    }
    setSubmitting(true);
    setModal(false);

    // Try API call (optional — works offline too)
    let harvestId = Date.now().toString();
    try {
      const res = await addHarvest({
        ...form,
        quantity:           Number(form.quantity),
        farmerPayout:       Number(form.farmerPayout),
        finalConsumerPrice: Number(form.finalConsumerPrice),
        transportCost:      Number(form.transportCost || 0),
      });
      harvestId = res.data?._id || res.data?.data?._id || harvestId;
      load();
    } catch (err) {
      console.log('API unavailable, recording locally on blockchain only:', err?.message);
    }

    // Show mining animation
    const interval = showMiningAnimation();

    try {
      // Write block to local blockchain (always runs)
      const { block, chainLength } = await blockchain.addBlock({
        type: 'HARVEST_CREATED',
        harvestId,
        cropType: form.cropType,
        quantity: Number(form.quantity),
        unit: form.unit,
        location: form.location,
        farmerPayout: Number(form.farmerPayout),
        finalConsumerPrice: Number(form.finalConsumerPrice),
      });

      // Keep mining animation for at least 2 seconds
      await new Promise(resolve => setTimeout(resolve, 2000));
      hideMiningAnimation(interval);

      setForm({ cropType: '', location: '', quantity: '', unit: 'kg', farmerPayout: '', finalConsumerPrice: '', transportCost: '', notes: '' });

      Alert.alert(
        text.minedTitle,
        text.minedMsg
          .replace('{{index}}', String(block.index))
          .replace('{{hash}}', block.hash.slice(0, 16))
          .replace('{{count}}', String(chainLength))
      );
    } catch (err) {
      hideMiningAnimation(interval);
      Alert.alert(text.errorTitle, `${text.mineFailed} ${err?.message || 'Unknown error'}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={Colors.primary} /></View>;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🌾 {t('harvest.title')}</Text>
        <View style={styles.headerBtns}>
          <TouchableOpacity style={styles.voiceBtn} onPress={() => { setVoiceModal(true); startPulse(); }}>
            <Text style={styles.voiceBtnText}>🎙 {t('harvest.ai_assist')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.addBtn} onPress={() => setModal(true)}>
            <Text style={styles.addBtnText}>+ {t('harvest.add')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={harvests}
        keyExtractor={(item, i) => item._id || String(i)}
        renderItem={({ item }) => <HarvestCard item={item} text={text} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🌱</Text>
            <Text style={styles.emptyText}>{t('harvest.empty')}</Text>
            <Text style={styles.emptySubText}>{text.emptyHelp}</Text>
          </View>
        }
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={Colors.primary} />}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
      />

      {/* ── Text Input Modal (Fallback for Voice) ── */}
      <Modal visible={voiceModal} animationType="slide" transparent onRequestClose={() => { setVoiceModal(false); stopPulse(); }}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>🤖 {text.aiInputTitle}</Text>
            <Text style={styles.modalSubtitle}>{text.aiInputSubtitle}</Text>

            {/* Language Selector */}
            <Text style={styles.label}>{text.recognizedLanguage}</Text>
            <View style={styles.langRow}>
              {LANGUAGES.map((l) => (
                <TouchableOpacity
                  key={l.code}
                  style={[styles.langBtn, voiceLang === l.code && styles.langBtnActive]}
                  onPress={() => setVoiceLang(l.code)}
                >
                  <Text style={[styles.langBtnText, voiceLang === l.code && styles.langBtnTextActive]}>
                    {l.label}
                  </Text>
                  <Text style={styles.langName}>{l.name}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Hint */}
            <View style={styles.hintBox}>
              <Text style={styles.hintLabel}>{text.examplePhrase}</Text>
              <Text style={styles.hintText}>{VOICE_HINTS[voiceLang]}</Text>
            </View>

            {/* Transcript Input */}
            <Text style={styles.label}>{text.yourSpeech}</Text>
            <TextInput
              style={[styles.input, { height: 90 }]}
              placeholder={VOICE_HINTS[voiceLang]}
              placeholderTextColor={Colors.textMuted}
              value={transcript}
              onChangeText={setTranscript}
              multiline
            />

            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => { setVoiceModal(false); stopPulse(); setTranscript(''); }}>
                <Text style={{ color: Colors.textSecondary, fontWeight: '600' }}>{text.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={handleVoiceSubmit} disabled={parsing}>
                {parsing
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.submitBtnText}>🤖 {text.parseWithAi}</Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Add Harvest Modal ── */}
      <Modal visible={modal} animationType="slide" transparent onRequestClose={() => setModal(false)}>
        <View style={styles.modalOverlay}>
          <ScrollView>
            <View style={[styles.modalSheet, { marginTop: 60 }]}>
              <Text style={styles.modalTitle}>{text.addBatchTitle}</Text>

              <Text style={styles.label}>{t('harvest.crop')} {pricesLoading && <ActivityIndicator size="small" color={Colors.primary} style={{marginLeft: 8}} />}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 4 }}>
                <View style={styles.cropRow}>
                  {CROPS.map((c) => (
                    <TouchableOpacity
                      key={c}
                      style={[styles.cropChip, form.cropType.toLowerCase() === c.toLowerCase() && styles.cropChipActive]}
                      onPress={() => fetchMarketAnalysis(c)}
                    >
                      <Text style={[styles.cropChipText, form.cropType.toLowerCase() === c.toLowerCase() && styles.cropChipTextActive]}>{c}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              <MarketInsights crop={form.cropType} prices={friendPrices} loading={pricesLoading} text={text} />

              <Text style={styles.label}>{t('harvest.location')}</Text>
              <TextInput style={styles.input} placeholder={text.locationPlaceholder} placeholderTextColor={Colors.textMuted}
                value={form.location} onChangeText={set('location')} />

              <View style={styles.row}>
                <View style={{ flex: 2 }}>
                  <Text style={styles.label}>{t('harvest.quantity')}</Text>
                  <TextInput style={styles.input} placeholder={text.quantityPlaceholder} placeholderTextColor={Colors.textMuted}
                    value={form.quantity} onChangeText={set('quantity')} keyboardType="numeric" />
                </View>
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={styles.label}>{t('harvest.unit')}</Text>
                  <TouchableOpacity
                    style={[styles.input, { justifyContent: 'center', alignItems: 'center', height: 50 }]}
                    onPress={() => set('unit')(form.unit === 'kg' ? 'quintal' : form.unit === 'quintal' ? 'ton' : 'kg')}
                  >
                    <Text style={{ color: Colors.textPrimary, fontWeight: '600' }}>{form.unit}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={styles.label}>{t('harvest.payout')} *</Text>
              <TextInput style={styles.input} placeholder={text.payoutPlaceholder} placeholderTextColor={Colors.textMuted}
                value={form.farmerPayout} onChangeText={set('farmerPayout')} keyboardType="numeric" />

              <Text style={styles.label}>{t('harvest.consumer_price')} *</Text>
              <TextInput style={styles.input} placeholder={text.consumerPlaceholder} placeholderTextColor={Colors.textMuted}
                value={form.finalConsumerPrice} onChangeText={set('finalConsumerPrice')} keyboardType="numeric" />

              <Text style={styles.label}>{t('harvest.transport')}</Text>
              <TextInput style={styles.input} placeholder={text.transportPlaceholder} placeholderTextColor={Colors.textMuted}
                value={form.transportCost} onChangeText={set('transportCost')} keyboardType="numeric" />

              <View style={styles.modalBtns}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setModal(false)}>
                  <Text style={{ color: Colors.textSecondary, fontWeight: '600' }}>{text.cancel}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.submitBtn} onPress={handleAdd} disabled={submitting}>
                  {submitting
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={styles.submitBtnText}>{t('harvest.submit')}</Text>
                  }
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* AI Market Chatbot Modal */}
      <MarketChatbot 
        visible={chatModal} 
        onClose={() => setChatModal(false)} 
        initialCropContext={form.cropType} 
      />

      {/* Floating Advisor Button */}
      <TouchableOpacity 
        style={styles.fabBtn} 
        onPress={() => setChatModal(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.fabIcon}>🤖</Text>
      </TouchableOpacity>

      {/* Mining Animation Overlay */}
      {miningVisible && (
        <View style={styles.miningOverlay}>
          <View style={styles.miningCard}>
            <Animated.Text style={[styles.miningIcon, { transform: [{ rotate: miningSpinAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }] }]}>⛏️</Animated.Text>
            <Text style={styles.miningTitle}>{text.miningTitle}</Text>
            <Text style={styles.miningSubtitle}>{text.miningSubtitle}</Text>
            <View style={styles.miningHashBox}>
              <Text style={styles.miningHashText} numberOfLines={2}>{miningHash}</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  center:    { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.bg },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 56, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  title:      { fontSize: 20, fontWeight: '800', color: Colors.textPrimary },
  headerBtns: { flexDirection: 'row', gap: 8 },
  voiceBtn:   { backgroundColor: Colors.blue, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  voiceBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  addBtn:     { backgroundColor: Colors.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  addBtnText: { color: '#fff', fontWeight: '700' },

  card: {
    backgroundColor: Colors.bgCard, borderRadius: 16, padding: 16,
    marginBottom: 12, borderWidth: 1, borderColor: Colors.border,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  cropName:   { fontSize: 17, fontWeight: '700', color: Colors.textPrimary, textTransform: 'capitalize' },
  badge:      { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText:  { fontSize: 12, fontWeight: '600' },
  meta:       { color: Colors.textSecondary, fontSize: 13, marginBottom: 4 },

  empty:       { alignItems: 'center', paddingTop: 80 },
  emptyIcon:   { fontSize: 52, marginBottom: 12 },
  emptyText:   { color: Colors.textPrimary, fontSize: 18, fontWeight: '600' },
  emptySubText:{ color: Colors.textSecondary, fontSize: 14, marginTop: 4, textAlign: 'center', paddingHorizontal: 20 },

  // Modals
  modalOverlay: { flex: 1, backgroundColor: '#000000aa', justifyContent: 'flex-end' },
  modalSheet:   {
    backgroundColor: Colors.bgCard, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingBottom: 40, borderWidth: 1, borderColor: Colors.border,
  },
  modalTitle:    { fontSize: 20, fontWeight: '800', color: Colors.textPrimary, marginBottom: 6 },
  modalSubtitle: { color: Colors.textSecondary, fontSize: 13, lineHeight: 20, marginBottom: 16 },

  // Voice Modal
  langRow:         { flexDirection: 'row', gap: 8, marginBottom: 16 },
  langBtn:         { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 12, backgroundColor: Colors.bgInput, borderWidth: 1, borderColor: Colors.border },
  langBtnActive:   { backgroundColor: Colors.primary, borderColor: Colors.primary },
  langBtnText:     { color: Colors.textSecondary, fontSize: 16, fontWeight: '700' },
  langBtnTextActive: { color: '#fff' },
  langName:        { color: Colors.textMuted, fontSize: 9, marginTop: 2 },

  micArea: { alignItems: 'center', marginBottom: 16 },
  micRing: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.blue + '33', justifyContent: 'center', alignItems: 'center' },
  micBtn:  { width: 60, height: 60, borderRadius: 30, backgroundColor: Colors.blue, justifyContent: 'center', alignItems: 'center' },
  micIcon: { fontSize: 28 },
  micHint: { color: Colors.textSecondary, fontSize: 13, marginTop: 8 },

  hintBox:   { backgroundColor: Colors.bgInput, borderRadius: 12, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: Colors.border },
  hintLabel: { color: Colors.textMuted, fontSize: 11, marginBottom: 4 },
  hintText:  { color: Colors.textSecondary, fontSize: 12, fontStyle: 'italic' },

  // Form
  label:         { color: Colors.textSecondary, fontSize: 13, marginBottom: 6, marginTop: 12 },
  input:         { backgroundColor: Colors.bgInput, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, color: Colors.textPrimary, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },
  row:           { flexDirection: 'row' },
  cropRow:       { flexDirection: 'row', gap: 8, paddingVertical: 4 },
  cropChip:      { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: Colors.bgInput, borderWidth: 1, borderColor: Colors.border },
  cropChipActive:{ backgroundColor: Colors.primary, borderColor: Colors.primary },
  cropChipText:  { color: Colors.textSecondary, fontSize: 13 },
  cropChipTextActive: { color: '#fff', fontWeight: '600' },

  modalBtns:     { flexDirection: 'row', gap: 12, marginTop: 20 },
  cancelBtn:     { flex: 1, padding: 14, borderRadius: 12, alignItems: 'center', backgroundColor: Colors.bgInput },
  submitBtn:     { flex: 1, padding: 14, borderRadius: 12, alignItems: 'center', backgroundColor: Colors.primary },
  submitBtnText: { color: '#fff', fontWeight: '700' },

  fabBtn: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.bgCard,
    borderWidth: 2,
    borderColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  fabIcon: {
    fontSize: 28,
  },

  // Mining overlay
  miningOverlay: {
    ...StyleSheet.absoluteFillObject, backgroundColor: '#000000cc',
    justifyContent: 'center', alignItems: 'center', zIndex: 999,
  },
  miningCard: {
    backgroundColor: Colors.bgCard, borderRadius: 24, padding: 32,
    alignItems: 'center', width: '80%', borderWidth: 1, borderColor: Colors.primary + '40',
  },
  miningIcon: { fontSize: 48, marginBottom: 16 },
  miningTitle: { color: Colors.textPrimary, fontSize: 20, fontWeight: '800', marginBottom: 4 },
  miningSubtitle: { color: Colors.textSecondary, fontSize: 13, marginBottom: 16 },
  miningHashBox: {
    backgroundColor: Colors.bgInput, borderRadius: 10, padding: 12,
    width: '100%', borderWidth: 1, borderColor: Colors.border,
  },
  miningHashText: { color: Colors.primary, fontSize: 10, fontFamily: 'monospace', textAlign: 'center' },

  // Market Insights
  insightsContainer: {
    marginTop: 16,
    marginBottom: 8,
    backgroundColor: Colors.primary + '10',
    borderRadius: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  insightsTitle: { color: Colors.primary, fontSize: 14, fontWeight: '800', marginHorizontal: 16 },
  insightsSubtitle: { color: Colors.textSecondary, fontSize: 12, marginHorizontal: 16, marginTop: 2 },
  insightsScroll: { paddingHorizontal: 16, paddingTop: 12, gap: 10 },
  insightCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: 12,
    padding: 12,
    minWidth: 140,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  insightHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  insightEmoji: { fontSize: 18, marginRight: 6 },
  insightName: { color: Colors.textPrimary, fontSize: 12, fontWeight: '600' },
  insightPrice: { color: Colors.textPrimary, fontSize: 16, fontWeight: '800' },
  insightTime: { color: Colors.textMuted, fontSize: 10, marginTop: 4 },
});
