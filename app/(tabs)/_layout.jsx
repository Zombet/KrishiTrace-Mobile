import { Tabs } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import '../../services/i18n';

const TabIcon = ({ icon, focused }) => (
  <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.45 }}>{icon}</Text>
);

export default function TabsLayout() {
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.bgCard,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 8,
        },
        tabBarActiveTintColor:   Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '700' },
      }}
    >
      {/* ── Visible Tabs ── */}
      <Tabs.Screen name="dashboard" options={{ title: t('tabs.home'),    tabBarIcon: ({ focused }) => <TabIcon icon="🏠" focused={focused} /> }} />
      <Tabs.Screen name="harvest"   options={{ title: t('tabs.harvest'), tabBarIcon: ({ focused }) => <TabIcon icon="🌾" focused={focused} /> }} />
      <Tabs.Screen name="scan"      options={{ title: t('tabs.scan'),    tabBarIcon: ({ focused }) => <TabIcon icon="📷" focused={focused} /> }} />
      <Tabs.Screen name="more"      options={{ title: t('tabs.hub'),     tabBarIcon: ({ focused }) => <TabIcon icon="⋯"  focused={focused} /> }} />
      <Tabs.Screen name="profile"   options={{ title: t('tabs.profile'), tabBarIcon: ({ focused }) => <TabIcon icon="👤" focused={focused} /> }} />

      {/* ── Hidden Tabs (navigable but not in tab bar) ── */}
      <Tabs.Screen name="market"  options={{ href: null }} />
      <Tabs.Screen name="ledger"  options={{ href: null }} />
      <Tabs.Screen name="iot"     options={{ href: null }} />
      <Tabs.Screen name="reports" options={{ href: null }} />
      <Tabs.Screen name="gis"     options={{ href: null }} />
      <Tabs.Screen name="tractor" options={{ href: null }} />
      <Tabs.Screen name="equipment" options={{ href: null }} />
    </Tabs>
  );
}
