import { Tabs, useRouter, usePathname } from 'expo-router';
import { Home, FileText, CheckCircle, BarChart3, Settings, User, LogOut } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { Platform, View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';

// Componente de Item do Menu para Web
function MenuItem({ 
  icon: Icon, 
  label, 
  route, 
  isActive 
}: { 
  icon: any; 
  label: string; 
  route: string; 
  isActive: boolean;
}) {
  const router = useRouter();
  
  return (
    <Pressable
      style={[styles.menuItem, isActive && styles.menuItemActive]}
      onPress={() => router.push(route as any)}
    >
      <Icon size={20} color={isActive ? colors.primary : colors.textMuted} strokeWidth={1.5} />
      <Text style={[styles.menuLabel, isActive && styles.menuLabelActive]}>{label}</Text>
    </Pressable>
  );
}

// Layout com Sidebar para Web
function WebLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  const menuItems = [
    { icon: Home, label: 'Dashboard', route: '/' },
    { icon: FileText, label: 'Lançamentos', route: '/expenses' },
    { icon: CheckCircle, label: 'Verificação', route: '/verification' },
    { icon: BarChart3, label: 'Relatórios', route: '/reports' },
    { icon: Settings, label: 'Configurações', route: '/settings' },
  ];
  
  return (
    <View style={styles.webContainer}>
      {/* Sidebar */}
      <View style={styles.sidebar}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoIcon}>
            <Text style={styles.logoText}>R</Text>
          </View>
          <View>
            <Text style={styles.logoTitle}>Rumo</Text>
            <Text style={styles.logoSubtitle}>Operacional</Text>
          </View>
        </View>
        
        {/* Menu */}
        <ScrollView style={styles.menuContainer} showsVerticalScrollIndicator={false}>
          {menuItems.map((item) => (
            <MenuItem
              key={item.route}
              icon={item.icon}
              label={item.label}
              route={item.route}
              isActive={pathname === item.route || (item.route === '/' && pathname === '/(tabs)')}
            />
          ))}
        </ScrollView>
        
        {/* User Section */}
        <View style={styles.userSection}>
          <View style={styles.userInfo}>
            <View style={styles.userAvatar}>
              <User size={18} color={colors.textMuted} />
            </View>
            <View>
              <Text style={styles.userName}>Minha Conta</Text>
              <Text style={styles.userPlan}>Premium</Text>
            </View>
          </View>
        </View>
      </View>
      
      {/* Main Content */}
      <View style={styles.mainContent}>
        {children}
      </View>
    </View>
  );
}

export default function TabLayout() {
  // Na web, usar layout com sidebar
  if (Platform.OS === 'web') {
    return (
      <WebLayout>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarStyle: { display: 'none' },
          }}
        >
          <Tabs.Screen name="index" options={{ title: 'Início' }} />
          <Tabs.Screen name="expenses" options={{ title: 'Lançamentos' }} />
          <Tabs.Screen name="verification" options={{ title: 'Verificação' }} />
          <Tabs.Screen name="reports" options={{ title: 'Relatórios' }} />
          <Tabs.Screen name="settings" options={{ title: 'Config' }} />
        </Tabs>
      </WebLayout>
    );
  }
  
  // No mobile, usar tabs padrão
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

const styles = StyleSheet.create({
  webContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: colors.background,
  },
  sidebar: {
    width: 260,
    backgroundColor: colors.surface,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    paddingVertical: 20,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 30,
    gap: 12,
  },
  logoIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '700',
  },
  logoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  logoSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  menuContainer: {
    flex: 1,
    paddingHorizontal: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 4,
    gap: 12,
  },
  menuItemActive: {
    backgroundColor: `${colors.primary}15`,
  },
  menuLabel: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: '500',
  },
  menuLabelActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  userSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  userPlan: {
    fontSize: 12,
    color: colors.primary,
  },
  mainContent: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
