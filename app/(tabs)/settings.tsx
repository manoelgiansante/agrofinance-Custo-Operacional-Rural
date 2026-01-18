import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { 
  ChevronRight,
  Bell,
  Shield,
  HelpCircle,
  Star,
  LogOut,
  Trash2,
  Plus,
  User,
  Mail,
  Edit3,
  Cloud,
  CloudOff,
  Lock,
  Eye,
  EyeOff,
  Leaf
} from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';

export default function SettingsScreen() {
  const router = useRouter();
  const { operations, deleteOperation, sectors, deleteSector } = useApp();
  const { signOut, isAuthenticated, user, signIn, signUp } = useAuth();
  const [notifications, setNotifications] = useState(true);
  
  // Estados para login inline
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleAuth = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }

    setIsLoading(true);
    try {
      if (isLogin) {
        await signIn(email.trim(), password);
      } else {
        await signUp(email.trim(), password);
        Alert.alert('Sucesso', 'Conta criada! Verifique seu email para confirmar.');
      }
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro ao autenticar');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteOperation = (id: string, name: string) => {
    Alert.alert(
      'Excluir Operação',
      `Deseja excluir "${name}"? Os lançamentos associados permanecerão no sistema.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: () => deleteOperation(id)
        },
      ]
    );
  };

  const handleDeleteSector = (id: string, name: string) => {
    Alert.alert(
      'Excluir Setor',
      `Deseja excluir "${name}"? As operações e lançamentos associados permanecerão no sistema.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: () => deleteSector(id)
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Configurações</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Seção de Conta - Sempre no topo */}
        {!isAuthenticated ? (
          // Usuário não logado - Tela de Login/Cadastro estilo página inicial
          <View style={styles.heroSection}>
            <View style={styles.heroHeader}>
              <View style={styles.heroLogo}>
                <Leaf size={32} color={colors.primary} strokeWidth={1.5} />
              </View>
              <Text style={styles.heroTitle}>Agrofinance</Text>
              <Text style={styles.heroSubtitle}>Gestão de Custo Operacional Rural</Text>
            </View>

            <View style={styles.authCard}>
              <View style={styles.authTabs}>
                <TouchableOpacity 
                  style={[styles.authTab, isLogin && styles.authTabActive]}
                  onPress={() => setIsLogin(true)}
                >
                  <Text style={[styles.authTabText, isLogin && styles.authTabTextActive]}>Entrar</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.authTab, !isLogin && styles.authTabActive]}
                  onPress={() => setIsLogin(false)}
                >
                  <Text style={[styles.authTabText, !isLogin && styles.authTabTextActive]}>Criar Conta</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.authForm}>
                <View style={styles.inputContainer}>
                  <Mail size={18} color={colors.textMuted} strokeWidth={1.5} />
                  <TextInput
                    style={styles.authInput}
                    placeholder="Email"
                    placeholderTextColor={colors.textMuted}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Lock size={18} color={colors.textMuted} strokeWidth={1.5} />
                  <TextInput
                    style={styles.authInput}
                    placeholder="Senha"
                    placeholderTextColor={colors.textMuted}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    {showPassword ? (
                      <EyeOff size={18} color={colors.textMuted} strokeWidth={1.5} />
                    ) : (
                      <Eye size={18} color={colors.textMuted} strokeWidth={1.5} />
                    )}
                  </TouchableOpacity>
                </View>

                <TouchableOpacity 
                  style={[styles.authSubmitButton, isLoading && styles.authSubmitButtonDisabled]}
                  onPress={handleAuth}
                  disabled={isLoading}
                >
                  <Text style={styles.authSubmitButtonText}>
                    {isLoading ? 'Aguarde...' : (isLogin ? 'Entrar' : 'Criar Conta')}
                  </Text>
                </TouchableOpacity>

                {isLogin && (
                  <TouchableOpacity style={styles.forgotPassword}>
                    <Text style={styles.forgotPasswordText}>Esqueci minha senha</Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.authDivider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>ou continue sem conta</Text>
                <View style={styles.dividerLine} />
              </View>

              <View style={styles.offlineNotice}>
                <CloudOff size={16} color={colors.textMuted} strokeWidth={1.5} />
                <Text style={styles.offlineNoticeText}>
                  Seus dados ficam salvos apenas neste dispositivo
                </Text>
              </View>
            </View>
          </View>
        ) : (
          // Usuário logado
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Conta</Text>
            <View style={styles.accountCard}>
              <View style={styles.accountHeader}>
                <View style={styles.accountAvatar}>
                  <User size={24} color={colors.primary} strokeWidth={1.5} />
                </View>
                <View style={styles.accountInfo}>
                  <Text style={styles.accountEmail}>{user?.email}</Text>
                  <View style={styles.syncBadge}>
                    <Cloud size={12} color={colors.success} strokeWidth={1.5} />
                    <Text style={styles.syncText}>Sincronizado</Text>
                  </View>
                </View>
              </View>
              
              <TouchableOpacity 
                style={styles.accountButton}
                onPress={() => {
                  Alert.alert(
                    'Sair da Conta',
                    'Seus dados locais serão mantidos. Deseja sair?',
                    [
                      { text: 'Cancelar', style: 'cancel' },
                      { 
                        text: 'Sair', 
                        style: 'destructive',
                        onPress: async () => {
                          try {
                            await signOut();
                          } catch (error) {
                            Alert.alert('Erro', 'Não foi possível sair da conta');
                          }
                        }
                      },
                    ]
                  );
                }}
              >
                <LogOut size={16} color={colors.error} strokeWidth={1.5} />
                <Text style={styles.accountButtonText}>Sair</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Seção de Setores */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Setores</Text>
            <TouchableOpacity onPress={() => router.push('/add-sector')}>
              <Plus size={20} color={colors.primary} strokeWidth={1.5} />
            </TouchableOpacity>
          </View>

          {sectors.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Nenhum setor cadastrado</Text>
            </View>
          ) : (
            sectors.map((sector) => (
              <View key={sector.id} style={styles.operationItem}>
                <View style={[styles.operationDot, { backgroundColor: sector.color }]} />
                <View style={styles.operationInfo}>
                  <Text style={styles.operationName}>{sector.name}</Text>
                  <Text style={styles.operationDescription}>{sector.description}</Text>
                </View>
                <TouchableOpacity 
                  style={styles.editButton}
                  onPress={() => router.push(`/edit-sector?id=${sector.id}` as any)}
                >
                  <Edit3 size={16} color={colors.textMuted} strokeWidth={1.5} />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.deleteButton}
                  onPress={() => handleDeleteSector(sector.id, sector.name)}
                >
                  <Trash2 size={16} color={colors.error} strokeWidth={1.5} />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        {/* Seção de Operações */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Operações</Text>
            <TouchableOpacity onPress={() => router.push('/add-operation')}>
              <Plus size={20} color={colors.primary} strokeWidth={1.5} />
            </TouchableOpacity>
          </View>

          {operations.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Nenhuma operação cadastrada</Text>
            </View>
          ) : (
            operations.map((operation) => (
              <View key={operation.id} style={styles.operationItem}>
                <View style={[styles.operationDot, { backgroundColor: operation.color }]} />
                <View style={styles.operationInfo}>
                  <Text style={styles.operationName}>{operation.name}</Text>
                  <Text style={styles.operationDescription}>{operation.description}</Text>
                </View>
                <TouchableOpacity 
                  style={styles.editButton}
                  onPress={() => router.push(`/edit-operation?id=${operation.id}` as any)}
                >
                  <Edit3 size={16} color={colors.textMuted} strokeWidth={1.5} />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.deleteButton}
                  onPress={() => handleDeleteOperation(operation.id, operation.name)}
                >
                  <Trash2 size={16} color={colors.error} strokeWidth={1.5} />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        {/* Preferências */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferências</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingIcon}>
              <Bell size={18} color={colors.primary} strokeWidth={1.5} />
            </View>
            <Text style={styles.settingLabel}>Notificações</Text>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: colors.border, true: colors.primary + '40' }}
              thumbColor={notifications ? colors.primary : colors.textMuted}
            />
          </View>
        </View>

        {/* Assinatura */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Assinatura</Text>
          
          <TouchableOpacity 
            style={styles.subscriptionCard}
            onPress={() => router.push('/subscription')}
          >
            <View style={styles.subscriptionIcon}>
              <Star size={20} color={colors.accent} strokeWidth={1.5} />
            </View>
            <View style={styles.subscriptionInfo}>
              <Text style={styles.subscriptionTitle}>Plano Premium</Text>
              <Text style={styles.subscriptionText}>
                Todas as funcionalidades liberadas
              </Text>
            </View>
            <ChevronRight size={18} color={colors.textMuted} strokeWidth={1.5} />
          </TouchableOpacity>
        </View>

        {/* Suporte */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Suporte</Text>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIcon}>
              <HelpCircle size={18} color={colors.textSecondary} strokeWidth={1.5} />
            </View>
            <Text style={styles.menuLabel}>Central de Ajuda</Text>
            <ChevronRight size={18} color={colors.textMuted} strokeWidth={1.5} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIcon}>
              <Shield size={18} color={colors.textSecondary} strokeWidth={1.5} />
            </View>
            <Text style={styles.menuLabel}>Privacidade</Text>
            <ChevronRight size={18} color={colors.textMuted} strokeWidth={1.5} />
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Agrofinance v1.0.0</Text>
          <Text style={styles.footerSubtext}>Custo Operacional Rural</Text>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: -0.5,
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  // Conta - Logado
  accountCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.primary + '20',
  },
  accountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  accountAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  accountInfo: {
    flex: 1,
  },
  accountEmail: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 4,
  },
  syncBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  syncText: {
    fontSize: 12,
    color: colors.success,
  },
  accountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: 4,
  },
  accountButtonText: {
    fontSize: 14,
    color: colors.error,
    fontWeight: '500',
  },
  // Hero Section - Login
  heroSection: {
    paddingHorizontal: 24,
    marginBottom: 28,
  },
  heroHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  heroLogo: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 14,
    color: colors.textMuted,
  },
  authCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  authTabs: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceAlt,
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  authTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  authTabActive: {
    backgroundColor: colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  authTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textMuted,
  },
  authTabTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  authForm: {
    gap: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
  },
  authInput: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
  },
  authSubmitButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  authSubmitButtonDisabled: {
    opacity: 0.7,
  },
  authSubmitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textLight,
  },
  forgotPassword: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: colors.primary,
  },
  authDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  offlineNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    backgroundColor: colors.surfaceAlt,
    borderRadius: 10,
  },
  offlineNoticeText: {
    fontSize: 13,
    color: colors.textMuted,
  },
  // Operações e Setores
  operationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  operationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  operationInfo: {
    flex: 1,
  },
  operationName: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
  },
  operationDescription: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  editButton: {
    padding: 8,
    marginRight: 4,
  },
  deleteButton: {
    padding: 8,
  },
  emptyState: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textMuted,
  },
  // Preferências
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingLabel: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
  },
  // Assinatura
  subscriptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.accent + '30',
  },
  subscriptionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.accent + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  subscriptionInfo: {
    flex: 1,
  },
  subscriptionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  subscriptionText: {
    fontSize: 13,
    color: colors.textMuted,
  },
  // Menu
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
  },
  // Footer
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  footerText: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 2,
  },
  footerSubtext: {
    fontSize: 12,
    color: colors.textMuted,
    opacity: 0.7,
  },
  bottomSpacing: {
    height: 30,
  },
});
