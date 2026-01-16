import { Tabs } from 'expo-router';
import { Home, FileText, CheckCircle, BarChart3, Settings } from 'lucide-react-native';
import { colors } from '@/constants/colors';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          paddingTop: 8,
          paddingBottom: 8,
          height: 64,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          letterSpacing: 0.2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ color, size }) => <Home size={22} color={color} strokeWidth={1.5} />,
        }}
      />
      <Tabs.Screen
        name="expenses"
        options={{
          title: 'Lançamentos',
          tabBarIcon: ({ color, size }) => <FileText size={22} color={color} strokeWidth={1.5} />,
        }}
      />
      <Tabs.Screen
        name="verification"
        options={{
          title: 'Verificação',
          tabBarIcon: ({ color, size }) => <CheckCircle size={22} color={color} strokeWidth={1.5} />,
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: 'Relatórios',
          tabBarIcon: ({ color, size }) => <BarChart3 size={22} color={color} strokeWidth={1.5} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Config',
          tabBarIcon: ({ color, size }) => <Settings size={22} color={color} strokeWidth={1.5} />,
        }}
      />
    </Tabs>
  );
}
