import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useState, useCallback } from 'react';
import { 
  AlertCircle, 
  Plus,
  ChevronRight,
  Wallet,
  Clock,
  CheckCircle2
} from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';

export default function DashboardScreen() {
  const router = useRouter();
  const { operations, expenses, getMonthlyTotal } = useApp();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

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

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Operações</Text>
            <TouchableOpacity onPress={() => router.push('/add-operation')}>
              <Text style={styles.sectionLink}>+ Nova</Text>
            </TouchableOpacity>
          </View>

          {operations.filter(op => op.isActive).map((operation) => (
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: -0.2,
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
});
