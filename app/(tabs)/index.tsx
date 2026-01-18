import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  AlertCircle, 
  Plus,
  ChevronRight,
  Wallet,
  Clock,
  CheckCircle2,
  Crown,
  Sparkles
} from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import OnboardingTutorial from '@/components/OnboardingTutorial';

const ONBOARDING_KEY = '@agrofinance_onboarding_completed';

export default function DashboardScreen() {
  const router = useRouter();
  const { operations, expenses, getMonthlyTotal, currentPlanId, currentPlan, sectors, getOperationsBySector, loadData } = useApp();
  const [refreshing, setRefreshing] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const completed = await AsyncStorage.getItem(ONBOARDING_KEY);
      if (!completed) {
        setShowOnboarding(true);
      }
    } catch (error) {
      console.log('Error checking onboarding status:', error);
    }
  };

  const handleOnboardingComplete = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
      setShowOnboarding(false);
    } catch (error) {
      console.log('Error saving onboarding status:', error);
      setShowOnboarding(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const totalPending = expenses
    .filter(e => e.status === 'pending' || e.status === 'verified')
    .reduce((sum, e) => sum + e.agreedValue, 0);

  const totalPaid = expenses
    .filter(e => e.status === 'paid')
    .reduce((sum, e) => sum + e.agreedValue, 0);

  const discrepancies = expenses.filter(e => e.status === 'discrepancy').length;

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const getOperationTotal = (operationId: string) => {
    return expenses
      .filter(e => e.operationId === operationId)
      .reduce((sum, e) => sum + e.agreedValue, 0);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {showOnboarding && (
        <OnboardingTutorial onComplete={handleOnboardingComplete} />
      )}
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>agrofinance</Text>
            <Text style={styles.subtitle}>Custo Operacional</Text>
          </View>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => router.push('/add-expense')}
          >
            <Plus size={20} color={colors.textLight} strokeWidth={1.5} />
          </TouchableOpacity>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryTitle}>Resumo do Mês</Text>
            <Text style={styles.summaryMonth}>
              {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
            </Text>
          </View>
          
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <View style={styles.summaryIconWrapper}>
                <Wallet size={18} color={colors.primary} strokeWidth={1.5} />
              </View>
              <Text style={styles.summaryLabel}>Total</Text>
              <Text style={styles.summaryValue}>{formatCurrency(getMonthlyTotal)}</Text>
            </View>
            
            <View style={styles.summaryDivider} />
            
            <View style={styles.summaryItem}>
              <View style={[styles.summaryIconWrapper, { backgroundColor: colors.warning + '15' }]}>
                <Clock size={18} color={colors.warning} strokeWidth={1.5} />
              </View>
              <Text style={styles.summaryLabel}>Pendente</Text>
              <Text style={styles.summaryValue}>{formatCurrency(totalPending)}</Text>
            </View>
            
            <View style={styles.summaryDivider} />
            
            <View style={styles.summaryItem}>
              <View style={[styles.summaryIconWrapper, { backgroundColor: colors.success + '15' }]}>
                <CheckCircle2 size={18} color={colors.success} strokeWidth={1.5} />
              </View>
              <Text style={styles.summaryLabel}>Pago</Text>
              <Text style={styles.summaryValue}>{formatCurrency(totalPaid)}</Text>
            </View>
          </View>
        </View>

        {discrepancies > 0 && (
          <TouchableOpacity 
            style={styles.alertCard}
            onPress={() => router.push('/(tabs)/verification')}
          >
            <AlertCircle size={20} color={colors.error} strokeWidth={1.5} />
            <View style={styles.alertContent}>
              <Text style={styles.alertTitle}>Atenção</Text>
              <Text style={styles.alertText}>
                {discrepancies} {discrepancies === 1 ? 'divergência encontrada' : 'divergências encontradas'}
              </Text>
            </View>
            <ChevronRight size={18} color={colors.error} strokeWidth={1.5} />
          </TouchableOpacity>
        )}

        {currentPlanId === 'free' && (
          <TouchableOpacity 
            style={styles.upgradeBanner}
            onPress={() => router.push('/subscription')}
          >
            <View style={styles.upgradeBannerIcon}>
              <Sparkles size={20} color={colors.accent} />
            </View>
            <View style={styles.upgradeBannerContent}>
              <Text style={styles.upgradeBannerTitle}>Desbloqueie mais recursos</Text>
              <Text style={styles.upgradeBannerText}>Adicione mais operações e acesse relatórios</Text>
            </View>
            <Crown size={18} color={colors.accent} />
          </TouchableOpacity>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Setores</Text>
            <TouchableOpacity onPress={() => router.push('/add-sector')}>
              <Text style={styles.sectionLink}>+ Novo Setor</Text>
            </TouchableOpacity>
          </View>

          {sectors.filter(s => s.isActive).map((sector) => {
            const sectorOperations = getOperationsBySector(sector.id);
            const sectorTotal = sectorOperations.reduce((sum, op) => sum + getOperationTotal(op.id), 0);
            
            return (
              <View key={sector.id} style={styles.sectorCard}>
                <View style={styles.sectorHeader}>
                  <View style={[styles.sectorIndicator, { backgroundColor: sector.color }]} />
                  <View style={styles.sectorInfo}>
                    <Text style={styles.sectorName}>{sector.name}</Text>
                    <Text style={styles.sectorDescription}>{sector.description}</Text>
                  </View>
                  <Text style={styles.sectorTotal}>{formatCurrency(sectorTotal)}</Text>
                </View>
                
                {sectorOperations.filter(op => op.isActive).map((operation) => (
                  <TouchableOpacity 
                    key={operation.id}
                    style={styles.operationCard}
                    onPress={() => router.push(`/(tabs)/expenses?operation=${operation.id}`)}
                  >
                    <View style={[styles.operationIndicator, { backgroundColor: operation.color }]} />
                    <View style={styles.operationInfo}>
                      <Text style={styles.operationName}>{operation.name}</Text>
                      <Text style={styles.operationDescription}>{operation.description}</Text>
                    </View>
                    <View style={styles.operationValue}>
                      <Text style={styles.operationTotal}>{formatCurrency(getOperationTotal(operation.id))}</Text>
                      <ChevronRight size={16} color={colors.textMuted} strokeWidth={1.5} />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            );
          })}

          <View style={styles.addOperationRow}>
            <TouchableOpacity 
              style={styles.addOperationButton}
              onPress={() => router.push('/add-operation')}
            >
              <Plus size={16} color={colors.primary} strokeWidth={1.5} />
              <Text style={styles.addOperationText}>Adicionar Operação</Text>
            </TouchableOpacity>
            {currentPlanId === 'free' && (
              <View style={styles.limitBadge}>
                <Text style={styles.limitBadgeText}>{operations.length}/{currentPlan.operationsLimit}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Últimos Lançamentos</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/expenses')}>
              <Text style={styles.sectionLink}>Ver todos</Text>
            </TouchableOpacity>
          </View>

          {expenses.slice(0, 3).map((expense) => {
            const operation = operations.find(op => op.id === expense.operationId);
            return (
              <TouchableOpacity 
                key={expense.id}
                style={styles.expenseCard}
                onPress={() => router.push(`/expense-detail?id=${expense.id}`)}
              >
                <View style={[styles.expenseIndicator, { backgroundColor: operation?.color || colors.primary }]} />
                <View style={styles.expenseInfo}>
                  <Text style={styles.expenseDescription}>{expense.description}</Text>
                  <Text style={styles.expenseSupplier}>{expense.supplier}</Text>
                </View>
                <View style={styles.expenseRight}>
                  <Text style={styles.expenseValue}>{formatCurrency(expense.agreedValue)}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(expense.status) + '12' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(expense.status) }]}>
                      {getStatusLabel(expense.status)}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'pending': return colors.warning;
    case 'verified': return colors.info;
    case 'discrepancy': return colors.error;
    case 'paid': return colors.success;
    default: return colors.textMuted;
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case 'pending': return 'Pendente';
    case 'verified': return 'Verificado';
    case 'discrepancy': return 'Divergência';
    case 'paid': return 'Pago';
    default: return status;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: colors.primary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    letterSpacing: 1,
    textTransform: 'uppercase' as const,
    marginTop: 2,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryCard: {
    marginHorizontal: 24,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: -0.3,
  },
  summaryMonth: {
    fontSize: 13,
    color: colors.textMuted,
    textTransform: 'capitalize',
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.primary + '12',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  summaryDivider: {
    width: 1,
    height: 50,
    backgroundColor: colors.border,
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 24,
    marginTop: 16,
    padding: 16,
    backgroundColor: colors.error + '08',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.error + '20',
  },
  alertContent: {
    flex: 1,
    marginLeft: 12,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.error,
  },
  alertText: {
    fontSize: 13,
    color: colors.error,
    opacity: 0.8,
  },
  section: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  upgradeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 24,
    marginTop: 20,
    padding: 16,
    backgroundColor: colors.accent + '10',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.accent + '30',
  },
  upgradeBannerIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.accent + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  upgradeBannerContent: {
    flex: 1,
    marginLeft: 12,
  },
  upgradeBannerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  upgradeBannerText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: -0.2,
  },
  limitBadge: {
    backgroundColor: colors.warning + '20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  limitBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.warning,
  },
  sectionLink: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  operationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  operationIndicator: {
    width: 4,
    height: 36,
    borderRadius: 2,
  },
  operationInfo: {
    flex: 1,
    marginLeft: 14,
  },
  operationName: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 2,
  },
  operationDescription: {
    fontSize: 13,
    color: colors.textMuted,
  },
  operationValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  operationTotal: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginRight: 6,
  },
  expenseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  expenseIndicator: {
    width: 3,
    height: 32,
    borderRadius: 2,
  },
  expenseInfo: {
    flex: 1,
    marginLeft: 14,
  },
  expenseDescription: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 2,
  },
  expenseSupplier: {
    fontSize: 13,
    color: colors.textMuted,
  },
  expenseRight: {
    alignItems: 'flex-end',
  },
  expenseValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
  },
  bottomSpacing: {
    height: 30,
  },
  sectorCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden' as const,
  },
  sectorHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    padding: 16,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectorIndicator: {
    width: 6,
    height: 40,
    borderRadius: 3,
  },
  sectorInfo: {
    flex: 1,
    marginLeft: 14,
  },
  sectorName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 2,
  },
  sectorDescription: {
    fontSize: 13,
    color: colors.textMuted,
  },
  sectorTotal: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.text,
  },
  addOperationRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    marginTop: 8,
  },
  addOperationButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
  },
  addOperationText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: colors.primary,
  },
});
