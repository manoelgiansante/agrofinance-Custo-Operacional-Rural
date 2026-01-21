import { Tabs, useRouter, usePathname } from 'expo-router';
import { Home, FileText, CheckCircle, BarChart3, Settings, User, Menu, X } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { Platform, View, Text, StyleSheet, Pressable, ScrollView, useWindowDimensions } from 'react-native';
import { useState, useEffect } from 'react';

// Breakpoint para considerar mobile (menos que 768px)
const MOBILE_BREAKPOINT = 768;

// Layout com Sidebar para Web
function WebLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Detecta se é mobile baseado na largura da tela
  const isMobile = width < MOBILE_BREAKPOINT;
  
  // Fecha sidebar quando navegar (no mobile)
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [pathname, isMobile]);
  
  const menuItems = [
    { icon: Home, label: 'Dashboard', route: '/' },
    { icon: FileText, label: 'Lançamentos', route: '/expenses' },
    { icon: CheckCircle, label: 'Verificação', route: '/verification' },
    { icon: BarChart3, label: 'Relatórios', route: '/reports' },
    { icon: Settings, label: 'Configurações', route: '/settings' },
  ];

  const handleMenuItemPress = (route: string) => {
    router.push(route as any);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };
  
  return (
    <View style={styles.webContainer}>
      {/* Overlay para fechar sidebar no mobile */}
      {isMobile && sidebarOpen && (
        <Pressable 
          style={styles.overlay} 
          onPress={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar - sempre visível no desktop, toggle no mobile */}
      {(!isMobile || sidebarOpen) && (
        <View style={[
          styles.sidebar,
          isMobile && styles.sidebarMobile
        ]}>
          {/* Header com botão de fechar no mobile */}
          <View style={styles.sidebarHeader}>
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
            
            {/* Botão fechar no mobile */}
            {isMobile && (
              <Pressable 
                style={styles.closeButton}
                onPress={() => setSidebarOpen(false)}
              >
                <X size={24} color={colors.text} strokeWidth={1.5} />
              </Pressable>
            )}
          </View>
          
          {/* Menu */}
          <ScrollView style={styles.menuContainer} showsVerticalScrollIndicator={false}>
            {menuItems.map((item) => (
              <Pressable
                key={item.route}
                style={[
                  styles.menuItem, 
                  (pathname === item.route || (item.route === '/' && pathname === '/(tabs)')) && styles.menuItemActive
                ]}
                onPress={() => handleMenuItemPress(item.route)}
              >
                <item.icon 
                  size={20} 
                  color={(pathname === item.route || (item.route === '/' && pathname === '/(tabs)')) ? colors.primary : colors.textMuted} 
                  strokeWidth={1.5} 
                />
                <Text style={[
                  styles.menuLabel, 
                  (pathname === item.route || (item.route === '/' && pathname === '/(tabs)')) && styles.menuLabelActive
                ]}>
                  {item.label}
                </Text>
              </Pressable>
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
      )}
      
      {/* Main Content */}
      <View style={styles.mainContent}>
        {/* Header mobile com hamburger menu */}
        {isMobile && (
          <View style={styles.mobileHeader}>
            <Pressable 
              style={styles.hamburgerButton}
              onPress={() => setSidebarOpen(true)}
            >
              <Menu size={24} color={colors.text} strokeWidth={1.5} />
            </Pressable>
            <View style={styles.mobileLogoContainer}>
              <View style={styles.mobileLogoIcon}>
                <Text style={styles.mobileLogoText}>R</Text>
              </View>
              <Text style={styles.mobileLogoTitle}>Rumo</Text>
            </View>
            <View style={styles.hamburgerButton} />
          </View>
        )}
        {children}
      </View>
    </View>
  );
}

export default function TabLayout() {
  const { width } = useWindowDimensions();
  
  // Detecta se é mobile baseado na largura da tela (< 768px)
  const isMobileWeb = Platform.OS === 'web' && width < MOBILE_BREAKPOINT;
  
  // No mobile web, usar tabs na parte inferior igual ao app nativo
  if (isMobileWeb) {
    return (
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            paddingTop: 8,
            paddingBottom: 12,
            height: 65,
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
            tabBarIcon: ({ color }) => <Home size={22} color={color} strokeWidth={1.5} />,
          }}
        />
        <Tabs.Screen
          name="expenses"
          options={{
            title: 'Lançamentos',
            tabBarIcon: ({ color }) => <FileText size={22} color={color} strokeWidth={1.5} />,
          }}
        />
        <Tabs.Screen
          name="verification"
          options={{
            title: 'Verificação',
            tabBarIcon: ({ color }) => <CheckCircle size={22} color={color} strokeWidth={1.5} />,
          }}
        />
        <Tabs.Screen
          name="reports"
          options={{
            title: 'Relatórios',
            tabBarIcon: ({ color }) => <BarChart3 size={22} color={color} strokeWidth={1.5} />,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Config',
            tabBarIcon: ({ color }) => <Settings size={22} color={color} strokeWidth={1.5} />,
          }}
        />
      </Tabs>
    );
  }
  
  // Na web DESKTOP, usar layout com sidebar
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
  
  // No mobile nativo, usar tabs padrão
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
          paddingBottom: Platform.OS === 'web' ? 8 : 8,
          height: Platform.OS === 'web' ? 60 : 64,
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
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 10,
  },
  sidebar: {
    width: 260,
    backgroundColor: colors.surface,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    paddingVertical: 20,
  },
  sidebarMobile: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    zIndex: 20,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  sidebarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 12,
  },
  closeButton: {
    padding: 8,
    borderRadius: 8,
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
  mobileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  hamburgerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  mobileLogoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mobileLogoIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mobileLogoText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  mobileLogoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
});
