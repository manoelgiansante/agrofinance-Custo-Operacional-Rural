import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
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
  Plus
} from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';

export default function SettingsScreen() {
  const router = useRouter();
  const { operations, deleteOperation } = useApp();
  const [notifications, setNotifications] = useState(true);

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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Configurações</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Operações</Text>
            <TouchableOpacity onPress={() => router.push('/add-operation')}>
              <Plus size={20} color={colors.primary} strokeWidth={1.5} />
            </TouchableOpacity>
          </View>

          {operations.map((operation) => (
            <View key={operation.id} style={styles.operationItem}>
              <View style={[styles.operationDot, { backgroundColor: operation.color }]} />
              <View style={styles.operationInfo}>
                <Text style={styles.operationName}>{operation.name}</Text>
                <Text style={styles.operationDescription}>{operation.description}</Text>
              </View>
              <TouchableOpacity 
                style={styles.deleteButton}
                onPress={() => handleDeleteOperation(operation.id, operation.name)}
              >
                <Trash2 size={18} color={colors.error} strokeWidth={1.5} />
              </TouchableOpacity>
            </View>
          ))}
        </View>

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
              <Text style={styles.subscriptionTitle}>Plano Gratuito</Text>
              <Text style={styles.subscriptionText}>
                Upgrade para mais recursos
              </Text>
            </View>
            <ChevronRight size={18} color={colors.textMuted} strokeWidth={1.5} />
          </TouchableOpacity>
        </View>

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

        <View style={styles.section}>
          <TouchableOpacity style={[styles.menuItem, styles.menuItemDanger]}>
            <View style={[styles.menuIcon, styles.menuIconDanger]}>
              <LogOut size={18} color={colors.error} strokeWidth={1.5} />
            </View>
            <Text style={[styles.menuLabel, { color: colors.error }]}>Sair da Conta</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Agrofinance v1.0.0</Text>
          <Text style={styles.footerSubtext}>Custo Operacional</Text>
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
  deleteButton: {
    padding: 8,
  },
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
  menuItemDanger: {
    borderColor: colors.error + '20',
    backgroundColor: colors.error + '05',
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
  menuIconDanger: {
    backgroundColor: colors.error + '10',
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
  },
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
