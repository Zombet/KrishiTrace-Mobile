import { useEffect, useState, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl, Modal, ScrollView,
  Animated, Alert, Easing,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import blockchain from '../../services/blockchain';

// ── Hash display helper ──
const shortHash = (h) => h ? `${h.slice(0, 8)}…${h.slice(-8)}` : '—';

// ── Mining Animation Component ──
const MiningOverlay = ({ visible, onDone }) => {
  const spinAnim = useRef(new Animated.Value(0)).current;
  const [fakeHash, setFakeHash] = useState('');

  useEffect(() => {
    if (!visible) return;
    Animated.loop(
      Animated.timing(spinAnim, { toValue: 1, duration: 1000, easing: Easing.linear, useNativeDriver: true })
    ).start();

    const chars = '0123456789abcdef';
    const interval = setInterval(() => {
      let h = '';
      for (let i = 0; i < 64; i++) h += chars[Math.floor(Math.random() * 16)];
      setFakeHash(h);
    }, 50);

    const timeout = setTimeout(() => {
      clearInterval(interval);
      spinAnim.stopAnimation();
      onDone?.();
    }, 2200);

    return () => { clearInterval(interval); clearTimeout(timeout); };
  }, [visible]);

  if (!visible) return null;

  const spin = spinAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <View style={miningStyles.overlay}>
      <View style={miningStyles.card}>
        <Animated.Text style={[miningStyles.icon, { transform: [{ rotate: spin }] }]}>⛏️</Animated.Text>
        <Text style={miningStyles.title}>Mining Block...</Text>
        <Text style={miningStyles.subtitle}>Computing SHA-256 hash</Text>
        <View style={miningStyles.hashBox}>
          <Text style={miningStyles.hashText} numberOfLines={2}>{fakeHash}</Text>
        </View>
        <View style={miningStyles.dots}>
          {[0, 1, 2].map(i => (
            <Animated.View key={i} style={[miningStyles.dot, {
              opacity: spinAnim.interpolate({
                inputRange: [i * 0.33, Math.min((i + 1) * 0.33, 1)],
                outputRange: [0.3, 1],
                extrapolate: 'clamp',
              })
            }]} />
          ))}
        </View>
      </View>
    </View>
  );
};

// ── Block Detail Modal ──
const BlockDetailModal = ({ block, visible, onClose, chainValid }) => {
  if (!block) return null;

  const isTampered = block.data?._tampered === true;
  const isGenesis = block.data?.type === 'GENESIS';

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={detailStyles.overlay}>
        <View style={detailStyles.sheet}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={detailStyles.header}>
              <Text style={detailStyles.headerIcon}>
                {isGenesis ? '🌱' : isTampered ? '🔴' : '🟢'}
              </Text>
              <Text style={detailStyles.headerTitle}>
                Block #{block.index}
              </Text>
              <Text style={detailStyles.headerSub}>
                {isGenesis ? 'Genesis Block' : isTampered ? 'Tampered Block' : 'Valid Block'}
              </Text>
            </View>

            {/* Hash Info */}
            <View style={detailStyles.section}>
              <Text style={detailStyles.sectionTitle}>🔐 CRYPTOGRAPHIC HASHES</Text>
              <View style={detailStyles.hashCard}>
                <Text style={detailStyles.hashLabel}>Block Hash</Text>
                <Text style={detailStyles.hashValue}>{block.hash}</Text>
              </View>
              <View style={detailStyles.hashCard}>
                <Text style={detailStyles.hashLabel}>Previous Hash</Text>
                <Text style={detailStyles.hashValue}>{block.previousHash}</Text>
              </View>
              <View style={detailStyles.hashCard}>
                <Text style={detailStyles.hashLabel}>Nonce</Text>
                <Text style={[detailStyles.hashValue, { color: Colors.gold }]}>{block.nonce}</Text>
              </View>
            </View>

            {/* Timestamp */}
            <View style={detailStyles.section}>
              <Text style={detailStyles.sectionTitle}>⏰ TIMESTAMP</Text>
              <View style={detailStyles.infoRow}>
                <Text style={detailStyles.infoLabel}>Created</Text>
                <Text style={detailStyles.infoValue}>
                  {new Date(block.timestamp).toLocaleString()}
                </Text>
              </View>
            </View>

            {/* Block Data */}
            <View style={detailStyles.section}>
              <Text style={detailStyles.sectionTitle}>📦 BLOCK DATA</Text>
              <View style={detailStyles.dataCard}>
                <Text style={detailStyles.dataJson}>
                  {JSON.stringify(block.data, null, 2)}
                </Text>
              </View>
            </View>

            {/* Verification Status */}
            <View style={[detailStyles.statusBanner, {
              backgroundColor: isTampered ? Colors.error + '15' : Colors.success + '15',
              borderColor: isTampered ? Colors.error + '40' : Colors.success + '40',
            }]}>
              <Text style={{ fontSize: 24, marginRight: 10 }}>
                {isTampered ? '❌' : '✅'}
              </Text>
              <View style={{ flex: 1 }}>
                <Text style={[detailStyles.statusTitle, {
                  color: isTampered ? Colors.error : Colors.success
                }]}>
                  {isTampered ? 'Hash Mismatch Detected' : 'Hash Verified'}
                </Text>
                <Text style={detailStyles.statusSub}>
                  {isTampered
                    ? 'This block\'s data has been modified after creation. The hash no longer matches.'
                    : 'Block hash matches computed hash. Data integrity confirmed.'}
                </Text>
              </View>
            </View>
          </ScrollView>

          <TouchableOpacity style={detailStyles.closeBtn} onPress={onClose}>
            <Text style={detailStyles.closeBtnText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// ── Main Blockchain Explorer Screen ──
export default function BlockchainExplorer() {
  const router = useRouter();
  const [chain, setChain] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [validation, setValidation] = useState({ valid: true, brokenAt: -1 });
  const [stats, setStats] = useState(null);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [detailModal, setDetailModal] = useState(false);
  const [mining, setMining] = useState(false);
  const [viewMode, setViewMode] = useState('timeline'); // 'timeline' or 'list'

  const loadChain = useCallback(async () => {
    try {
      const [c, v, s] = await Promise.all([
        blockchain.getChain(),
        blockchain.validateChain(),
        blockchain.getChainStats(),
      ]);
      setChain(c);
      setValidation(v);
      setStats(s);
    } catch (e) {
      console.log('Load chain error:', e);
    }
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { loadChain(); }, [loadChain]);

  const handleTamperTest = () => {
    if (chain.length < 2) {
      Alert.alert('Need More Blocks', 'Add at least one harvest first to demonstrate tamper detection.');
      return;
    }

    Alert.alert(
      '🔓 Tamper Test',
      'This will corrupt Block #1\'s data WITHOUT updating its hash — simulating a hack attempt. The chain validation will detect the mismatch.\n\nProceed?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Corrupt Block #1', style: 'destructive',
          onPress: async () => {
            await blockchain.tamperBlock(1);
            await loadChain();
            Alert.alert(
              '🔴 Block Tampered!',
              'Block #1 has been corrupted. Notice how the chain status changed to INVALID and the broken link is highlighted.\n\nTap "Restore Chain" to fix it.'
            );
          }
        }
      ]
    );
  };

  const handleRestore = () => {
    Alert.alert(
      '🔧 Restore Chain',
      'This will recalculate all hashes and fix the chain linkage. In a real blockchain, this would be impossible without consensus.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restore', style: 'default',
          onPress: async () => {
            await blockchain.restoreChain();
            await loadChain();
            Alert.alert('✅ Chain Restored', 'All block hashes have been recalculated and the chain is valid again.');
          }
        }
      ]
    );
  };

  const handleReset = () => {
    Alert.alert(
      '⚠️ Reset Blockchain',
      'This will delete all blocks and start fresh with a new genesis block. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset', style: 'destructive',
          onPress: async () => {
            await blockchain.resetChain();
            await loadChain();
          }
        }
      ]
    );
  };

  const openBlockDetail = (block) => {
    setSelectedBlock(block);
    setDetailModal(true);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const renderTimelineBlock = ({ item, index: listIndex }) => {
    const isGenesis = item.data?.type === 'GENESIS';
    const isTampered = item.data?._tampered === true;
    const isBrokenLink = validation.brokenAt === item.index;
    const blockColor = isTampered || isBrokenLink ? Colors.error : isGenesis ? Colors.primary : Colors.blue;

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => openBlockDetail(item)}
        style={styles.timelineItem}
      >
        {/* Timeline connector */}
        <View style={styles.timelineTrack}>
          {listIndex > 0 && (
            <View style={[styles.timelineLine, {
              backgroundColor: isBrokenLink ? Colors.error : Colors.border
            }]}>
              {isBrokenLink && (
                <Text style={styles.brokenIcon}>💔</Text>
              )}
            </View>
          )}
          <View style={[styles.timelineDot, { backgroundColor: blockColor }]}>
            <Text style={styles.dotText}>
              {isGenesis ? '🌱' : isTampered ? '🔴' : '🔗'}
            </Text>
          </View>
        </View>

        {/* Block card */}
        <View style={[styles.blockCard, {
          borderColor: isTampered || isBrokenLink ? Colors.error : Colors.border,
          borderWidth: isTampered || isBrokenLink ? 2 : 1,
        }]}>
          <View style={styles.blockHeader}>
            <Text style={styles.blockIndex}>Block #{item.index}</Text>
            <View style={[styles.statusDot, { backgroundColor: blockColor }]} />
          </View>

          {/* Type */}
          <Text style={[styles.blockType, { color: blockColor }]}>
            {isGenesis ? '🌱 Genesis' :
              item.data?.type === 'HARVEST_CREATED' ? `🌾 ${item.data.cropType || 'Harvest'}` :
                isTampered ? '⚠️ Tampered' : item.data?.type || 'Data'}
          </Text>

          {/* Harvest info */}
          {item.data?.type === 'HARVEST_CREATED' && (
            <View style={styles.harvestInfo}>
              <Text style={styles.harvestMeta}>
                ⚖️ {item.data.quantity} {item.data.unit || 'kg'}
                {item.data.location ? `  📍 ${item.data.location}` : ''}
              </Text>
            </View>
          )}

          {/* Hash */}
          <View style={styles.hashRow}>
            <Text style={styles.hashLabel}>Hash</Text>
            <Text style={styles.hashValue}>{shortHash(item.hash)}</Text>
          </View>
          <View style={styles.hashRow}>
            <Text style={styles.hashLabel}>Prev</Text>
            <Text style={styles.hashValue}>{shortHash(item.previousHash)}</Text>
          </View>

          {/* Time */}
          <Text style={styles.blockTime}>
            {new Date(item.timestamp).toLocaleString()}
          </Text>

          {/* Tap hint */}
          <Text style={styles.tapHint}>tap to inspect →</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>🔐 Blockchain Explorer</Text>
        <Text style={styles.subtitle}>Local chain simulation</Text>
      </View>

      {/* Chain Status Banner */}
      <View style={[styles.statusBanner, {
        backgroundColor: validation.valid ? Colors.success + '15' : Colors.error + '15',
        borderColor: validation.valid ? Colors.success + '40' : Colors.error + '40',
      }]}>
        <View style={styles.statusLeft}>
          <Text style={{ fontSize: 28 }}>{validation.valid ? '✅' : '❌'}</Text>
          <View style={styles.statusInfo}>
            <Text style={[styles.statusTitle, {
              color: validation.valid ? Colors.success : Colors.error
            }]}>
              {validation.valid ? 'Chain Valid' : 'Chain Broken!'}
            </Text>
            <Text style={styles.statusSub}>
              {stats?.totalBlocks || 0} blocks · {stats?.harvestBlocks || 0} harvests
              {!validation.valid ? ` · Break at #${validation.brokenAt}` : ''}
            </Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.actionRow} contentContainerStyle={styles.actionRowContent}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: Colors.error + '22', borderColor: Colors.error + '55' }]}
          onPress={handleTamperTest}
        >
          <Text style={styles.actionIcon}>🔓</Text>
          <Text style={[styles.actionText, { color: Colors.error }]}>Tamper Test</Text>
        </TouchableOpacity>

        {!validation.valid && (
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: Colors.success + '22', borderColor: Colors.success + '55' }]}
            onPress={handleRestore}
          >
            <Text style={styles.actionIcon}>🔧</Text>
            <Text style={[styles.actionText, { color: Colors.success }]}>Restore Chain</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: Colors.blue + '22', borderColor: Colors.blue + '55' }]}
          onPress={() => setViewMode(viewMode === 'timeline' ? 'list' : 'timeline')}
        >
          <Text style={styles.actionIcon}>{viewMode === 'timeline' ? '📋' : '⏳'}</Text>
          <Text style={[styles.actionText, { color: Colors.blue }]}>
            {viewMode === 'timeline' ? 'List View' : 'Timeline'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: Colors.textMuted + '22', borderColor: Colors.textMuted + '55' }]}
          onPress={handleReset}
        >
          <Text style={styles.actionIcon}>🗑️</Text>
          <Text style={[styles.actionText, { color: Colors.textMuted }]}>Reset</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Block List */}
      <FlatList
        data={[...chain].reverse()}
        keyExtractor={(item) => String(item.index)}
        renderItem={renderTimelineBlock}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={{ fontSize: 48 }}>🔗</Text>
            <Text style={styles.emptyText}>No blocks yet</Text>
            <Text style={styles.emptySubText}>Add a harvest to create your first block</Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); loadChain(); }}
            tintColor={Colors.primary}
          />
        }
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
      />

      {/* Block Detail Modal */}
      <BlockDetailModal
        block={selectedBlock}
        visible={detailModal}
        onClose={() => setDetailModal(false)}
        chainValid={validation.valid}
      />

      {/* Mining Animation */}
      <MiningOverlay visible={mining} onDone={() => setMining(false)} />
    </View>
  );
}

// ── Main Styles ──
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.bg },

  header: {
    paddingHorizontal: 16, paddingTop: 56, paddingBottom: 14,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  backBtn: { marginBottom: 6 },
  backText: { color: Colors.primary, fontSize: 16 },
  title: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary },
  subtitle: { color: Colors.textSecondary, fontSize: 13, marginTop: 2 },

  statusBanner: {
    flexDirection: 'row', alignItems: 'center', marginHorizontal: 16,
    marginTop: 12, padding: 14, borderRadius: 14, borderWidth: 1,
  },
  statusLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  statusInfo: { marginLeft: 12 },
  statusTitle: { fontSize: 16, fontWeight: '800' },
  statusSub: { color: Colors.textSecondary, fontSize: 12, marginTop: 2 },

  actionRow: { marginTop: 8, marginBottom: 4, flexShrink: 0, height: 58 },
  actionRowContent: { paddingHorizontal: 16, paddingVertical: 6, gap: 10, alignItems: 'center' },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14,
    paddingVertical: 10, borderRadius: 12, borderWidth: 1.5,
  },
  actionIcon: { fontSize: 16, marginRight: 6 },
  actionText: { fontSize: 13, fontWeight: '700' },

  // Timeline
  timelineItem: { flexDirection: 'row', marginBottom: 4 },
  timelineTrack: { width: 44, alignItems: 'center' },
  timelineLine: { width: 2, height: 24, marginBottom: -4 },
  timelineDot: {
    width: 36, height: 36, borderRadius: 18,
    justifyContent: 'center', alignItems: 'center',
    zIndex: 1,
  },
  dotText: { fontSize: 16 },
  brokenIcon: { position: 'absolute', top: 2, fontSize: 12 },

  blockCard: {
    flex: 1, backgroundColor: Colors.bgCard, borderRadius: 14,
    padding: 14, marginLeft: 8, borderWidth: 1, borderColor: Colors.border,
  },
  blockHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 6,
  },
  blockIndex: { color: Colors.textPrimary, fontSize: 15, fontWeight: '800' },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  blockType: { fontSize: 14, fontWeight: '700', marginBottom: 8 },

  harvestInfo: { marginBottom: 8 },
  harvestMeta: { color: Colors.textSecondary, fontSize: 12 },

  hashRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    marginBottom: 2,
  },
  hashLabel: { color: Colors.textMuted, fontSize: 11, fontWeight: '600' },
  hashValue: { color: Colors.blue, fontSize: 11, fontFamily: 'monospace' },

  blockTime: { color: Colors.textMuted, fontSize: 10, marginTop: 6 },
  tapHint: { color: Colors.textMuted, fontSize: 10, textAlign: 'right', marginTop: 4, fontStyle: 'italic' },

  empty: { alignItems: 'center', paddingTop: 80 },
  emptyText: { color: Colors.textPrimary, fontSize: 18, fontWeight: '600', marginTop: 12 },
  emptySubText: { color: Colors.textSecondary, fontSize: 14, marginTop: 6, textAlign: 'center' },
});

// ── Mining Animation Styles ──
const miningStyles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject, backgroundColor: '#000000cc',
    justifyContent: 'center', alignItems: 'center', zIndex: 999,
  },
  card: {
    backgroundColor: Colors.bgCard, borderRadius: 24, padding: 32,
    alignItems: 'center', width: '80%', borderWidth: 1, borderColor: Colors.primary + '40',
  },
  icon: { fontSize: 48, marginBottom: 16 },
  title: { color: Colors.textPrimary, fontSize: 20, fontWeight: '800', marginBottom: 4 },
  subtitle: { color: Colors.textSecondary, fontSize: 13, marginBottom: 16 },
  hashBox: {
    backgroundColor: Colors.bgInput, borderRadius: 10, padding: 12,
    width: '100%', borderWidth: 1, borderColor: Colors.border,
  },
  hashText: { color: Colors.primary, fontSize: 10, fontFamily: 'monospace', textAlign: 'center' },
  dots: { flexDirection: 'row', gap: 8, marginTop: 16 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary },
});

// ── Block Detail Modal Styles ──
const detailStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: '#000000bb', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: Colors.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    maxHeight: '90%', padding: 20, paddingBottom: 32,
  },
  header: { alignItems: 'center', marginBottom: 20, paddingTop: 8 },
  headerIcon: { fontSize: 40, marginBottom: 8 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: Colors.textPrimary },
  headerSub: { color: Colors.textSecondary, fontSize: 14, marginTop: 2 },

  section: { marginBottom: 20 },
  sectionTitle: {
    color: Colors.textMuted, fontSize: 11, fontWeight: '700',
    letterSpacing: 1.5, marginBottom: 10,
  },
  hashCard: {
    backgroundColor: Colors.bgCard, borderRadius: 10, padding: 12,
    marginBottom: 6, borderWidth: 1, borderColor: Colors.border,
  },
  hashLabel: { color: Colors.textMuted, fontSize: 11, marginBottom: 4 },
  hashValue: { color: Colors.blue, fontSize: 11, fontFamily: 'monospace' },

  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    backgroundColor: Colors.bgCard, borderRadius: 10, padding: 12,
    borderWidth: 1, borderColor: Colors.border,
  },
  infoLabel: { color: Colors.textSecondary, fontSize: 13 },
  infoValue: { color: Colors.textPrimary, fontSize: 13, fontWeight: '600' },

  dataCard: {
    backgroundColor: Colors.bgInput, borderRadius: 10, padding: 12,
    borderWidth: 1, borderColor: Colors.border,
  },
  dataJson: { color: Colors.textSecondary, fontSize: 11, fontFamily: 'monospace', lineHeight: 18 },

  statusBanner: {
    flexDirection: 'row', alignItems: 'center', padding: 14,
    borderRadius: 14, borderWidth: 1, marginBottom: 20,
  },
  statusTitle: { fontSize: 15, fontWeight: '700' },
  statusSub: { color: Colors.textSecondary, fontSize: 12, marginTop: 2, lineHeight: 18 },

  closeBtn: {
    backgroundColor: Colors.bgCard, borderRadius: 14, padding: 16,
    alignItems: 'center', borderWidth: 1, borderColor: Colors.border,
  },
  closeBtnText: { color: Colors.textPrimary, fontWeight: '700', fontSize: 15 },
});
