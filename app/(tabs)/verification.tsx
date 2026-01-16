import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  FileText,
  ChevronRight,
  Clock
} from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { Expense } from '@/types';

type TabType = 'pending' | 'discrepancy' | 'verified';

export default function VerificationScreen() {
  const router = useRouter();
  const { expenses, operations, updateExpense } = useApp();
  const [activeTab, setActiveTab] = useState<TabType>('pending');

  const pendingExpenses = expenses.filter(e => e.status === 'pending');
  const discrepancyExpenses = expenses.filter(e => e.status === 'discrepancy');
  const verifiedExpenses = expenses.filter(e => e.status === 'verified');

  const getFilteredExpenses = () => {
    switch (activeTab) {
      case 'pending': return pendingExpenses;
      case 'discrepancy': return discrepancyExpenses;
      case 'verified': return verifiedExpenses;
    }
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const handleVerify = (expense: Expense) => {
    if (!expense.invoiceValue) {
      Alert.alert(
        'Informar Valor da Nota',
        'Informe o valor da nota fiscal para verificar este lançamento.',
        [{ text: 'OK' }]
      );
      router.push(`/expense-detail?id=${expense.id}`);
      return;
    }

    if (expense.invoiceValue !== expense.agreedValue) {
      Alert.alert(
        'Divergência Encontrada',
        `Valor combinado: ${formatCurrency(expense.agreedValue)}\nValor da nota: ${formatCurrency(expense.invoiceValue)}\n\nDiferença: ${formatCurrency(Math.abs(expense.invoiceValue - expense.agreedValue))}`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Marcar como Divergência', 
            style: 'destructive',
            onPress: () => updateExpense(expense.id, { 
              status: 'discrepancy',
              verifiedBy: 'Usuário',
              verificationNotes: `Divergência de ${formatCurrency(Math.abs(expense.invoiceValue! - expense.agreedValue))}`
            })
          },
        ]
      );
    } else {
      updateExpense(expense.id, { 
        status: 'verified',
        verifiedBy: 'Usuário',
      });
    }
  };

  const handleMarkAsPaid = (expense: Expense) => {
    Alert.alert(
      'Confirmar Pagamento',
      `Deseja marcar "${expense.description}" como pago?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Confirmar', 
          onPress: () => updateExpense(expense.id, { 
            status: 'paid',
            paymentDate: new Date().toISOString(),
          })
        },
      ]
    );
  };

  const tabs: { key: TabType; label: string; count: number; color: string }[] = [
    { key: 'pending', label: 'Pendentes', count: pendingExpenses.length, color: colors.statusPending },
    { key: 'discrepancy', label: 'Divergências', count: discrepancyExpenses.length, color: colors.error },
    { key: 'verified', label: 'Verificados', count: verifiedExpenses.length, color: colors.success },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Verificação</Text>
        <Text style={styles.subtitle}>Confira notas fiscais e boletos</Text>
      </View>

      <View style={styles.tabsContainer}>
        {tabs.map(tab => (
          <TouchableOpacity 
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[styles.tabLabel, activeTab === tab.key && styles.tabLabelActive]}>
              {tab.label}
            </Text>
            <View style={[styles.tabBadge, { backgroundColor: tab.color }]}>
              <Text style={styles.tabBadgeText}>{tab.count}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {getFilteredExpenses().length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              {activeTab === 'pending' && <Clock size={48} color={colors.textMuted} />}
              {activeTab === 'discrepancy' && <AlertTriangle size={48} color={colors.textMuted} />}
              {activeTab === 'verified' && <CheckCircle2 size={48} color={colors.textMuted} />}
            </View>
            <Text style={styles.emptyTitle}>
              {activeTab === 'pending' && 'Nenhum pendente'}
              {activeTab === 'discrepancy' && 'Nenhuma divergência'}
              {activeTab === 'verified' && 'Nenhum verificado'}
            </Text>
            <Text style={styles.emptyText}>
              {activeTab === 'pending' && 'Todos os lançamentos foram verificados'}
              {activeTab === 'discrepancy' && 'Ótimo! Não há divergências'}
              {activeTab === 'verified' && 'Verifique os lançamentos pendentes'}
            </Text>
          </View>
        ) : (
          getFilteredExpenses().map(expense => {
            const operation = operations.find(op => op.id === expense.operationId);
            const hasDifference = expense.invoiceValue && expense.invoiceValue !== expense.agreedValue;
            
            return (
              <View key={expense.id} style={styles.card}>
                <TouchableOpacity 
                  style={styles.cardHeader}
                  onPress={() => router.push(`/expense-detail?id=${expense.id}`)}
                >
                  <View style={[styles.operationDot, { backgroundColor: operation?.color }]} />
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardTitle} numberOfLines={1}>{expense.description}</Text>
                    <Text style={styles.cardSupplier}>{expense.supplier}</Text>
                  </View>
                  <ChevronRight size={18} color={colors.textMuted} />
                </TouchableOpacity>

                <View style={styles.cardValues}>
                  <View style={styles.valueItem}>
                    <Text style={styles.valueLabel}>Combinado</Text>
                    <Text style={styles.valueAmount}>{formatCurrency(expense.agreedValue)}</Text>
                  </View>
                  <View style={styles.valueDivider} />
                  <View style={styles.valueItem}>
                    <Text style={styles.valueLabel}>Nota Fiscal</Text>
                    <Text style={[
                      styles.valueAmount,
                      hasDifference && styles.valueAmountError
                    ]}>
                      {expense.invoiceValue ? formatCurrency(expense.invoiceValue) : '—'}
                    </Text>
                  </View>
                  {hasDifference && (
                    <>
                      <View style={styles.valueDivider} />
                      <View style={styles.valueItem}>
                        <Text style={styles.valueLabel}>Diferença</Text>
                        <Text style={[styles.valueAmount, styles.valueAmountError]}>
                          {formatCurrency(Math.abs(expense.invoiceValue! - expense.agreedValue))}
                        </Text>
                      </View>
                    </>
                  )}
                </View>

                {expense.verificationNotes && (
                  <View style={styles.notesContainer}>
                    <Text style={styles.notesText}>{expense.verificationNotes}</Text>
                  </View>
                )}

                <View style={styles.cardActions}>
                  {activeTab === 'pending' && (
                    <>
                      <TouchableOpacity 
                        style={[styles.actionButton, styles.actionButtonPrimary]}
                        onPress={() => handleVerify(expense)}
                      >
                        <CheckCircle2 size={18} color={colors.textLight} />
                        <Text style={styles.actionButtonTextLight}>Verificar</Text>
                      </TouchableOpacity>
                    </>
                  )}
                  {activeTab === 'verified' && (
                    <TouchableOpacity 
                      style={[styles.actionButton, styles.actionButtonSuccess]}
                      onPress={() => handleMarkAsPaid(expense)}
                    >
                      <CheckCircle2 size={18} color={colors.textLight} />
                      <Text style={styles.actionButtonTextLight}>Marcar como Pago</Text>
                    </TouchableOpacity>
                  )}
                  {activeTab === 'discrepancy' && (
                    <>
                      <TouchableOpacity 
                        style={[styles.actionButton, styles.actionButtonOutline]}
                        onPress={() => router.push(`/expense-detail?id=${expense.id}`)}
                      >
                        <FileText size={18} color={colors.primary} />
                        <Text style={styles.actionButtonTextPrimary}>Ver Detalhes</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </View>
            );
          })
        )}
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.surface,
    gap: 8,
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabLabelActive: {
    color: colors.textLight,
  },
  tabBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  tabBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textLight,
  },
  list: {
    flex: 1,
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    marginBottom: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  operationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  cardSupplier: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  cardValues: {
    flexDirection: 'row',
    padding: 16,
  },
  valueItem: {
    flex: 1,
    alignItems: 'center',
  },
  valueLabel: {
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 4,
  },
  valueAmount: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  valueAmountError: {
    color: colors.error,
  },
  valueDivider: {
    width: 1,
    backgroundColor: colors.borderLight,
  },
  notesContainer: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
    backgroundColor: colors.warning + '15',
    borderRadius: 8,
  },
  notesText: {
    fontSize: 13,
    color: colors.warning,
    fontWeight: '500',
  },
  cardActions: {
    flexDirection: 'row',
    padding: 12,
    paddingTop: 0,
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  actionButtonPrimary: {
    backgroundColor: colors.primary,
  },
  actionButtonSuccess: {
    backgroundColor: colors.success,
  },
  actionButtonOutline: {
    backgroundColor: colors.primary + '10',
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  actionButtonTextLight: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textLight,
  },
  actionButtonTextPrimary: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
  },
  bottomSpacing: {
    height: 30,
  },
});
