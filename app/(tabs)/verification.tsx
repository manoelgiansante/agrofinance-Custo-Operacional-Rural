import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle,
  Clock,
  ChevronRight
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
        'Verificação',
        'Informe o valor da nota fiscal para verificar.',
        [{ text: 'OK' }]
      );
      router.push(`/expense-detail?id=${expense.id}`);
      return;
    }

    if (expense.invoiceValue !== expense.agreedValue) {
      Alert.alert(
        'Divergência Detectada',
        `Valor combinado: ${formatCurrency(expense.agreedValue)}\nValor da nota: ${formatCurrency(expense.invoiceValue)}\n\nDiferença: ${formatCurrency(Math.abs(expense.invoiceValue - expense.agreedValue))}`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Marcar Divergência', 
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
      `Confirmar pagamento de "${expense.description}"?`,
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

  const tabs: { key: TabType; label: string; count: number }[] = [
    { key: 'pending', label: 'Pendentes', count: pendingExpenses.length },
    { key: 'discrepancy', label: 'Divergências', count: discrepancyExpenses.length },
    { key: 'verified', label: 'Verificados', count: verifiedExpenses.length },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Verificação</Text>
        <Text style={styles.subtitle}>Confira notas fiscais e boletos</Text>
      </View>

      <View style={styles.tabsContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[styles.tabLabel, activeTab === tab.key && styles.tabLabelActive]}>
              {tab.label}
            </Text>
            <View style={[
              styles.tabBadge, 
              activeTab === tab.key && styles.tabBadgeActive
            ]}>
              <Text style={[
                styles.tabBadgeText,
                activeTab === tab.key && styles.tabBadgeTextActive
              ]}>
                {tab.count}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {getFilteredExpenses().length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              {activeTab === 'pending' && <Clock size={40} color={colors.textMuted} strokeWidth={1.5} />}
              {activeTab === 'discrepancy' && <AlertTriangle size={40} color={colors.textMuted} strokeWidth={1.5} />}
              {activeTab === 'verified' && <CheckCircle2 size={40} color={colors.textMuted} strokeWidth={1.5} />}
            </View>
            <Text style={styles.emptyTitle}>
              {activeTab === 'pending' && 'Nenhum pendente'}
              {activeTab === 'discrepancy' && 'Nenhuma divergência'}
              {activeTab === 'verified' && 'Nenhum verificado'}
            </Text>
            <Text style={styles.emptyText}>
              {activeTab === 'pending' && 'Todos os lançamentos foram verificados'}
              {activeTab === 'discrepancy' && 'Não há divergências a resolver'}
              {activeTab === 'verified' && 'Verifique os lançamentos pendentes'}
            </Text>
          </View>
        ) : (
          getFilteredExpenses().map((expense) => {
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
                  <ChevronRight size={18} color={colors.textMuted} strokeWidth={1.5} />
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
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={() => handleVerify(expense)}
                    >
                      <CheckCircle2 size={16} color={colors.textLight} strokeWidth={1.5} />
                      <Text style={styles.actionButtonText}>Verificar</Text>
                    </TouchableOpacity>
                  )}
                  {activeTab === 'verified' && (
                    <TouchableOpacity 
                      style={[styles.actionButton, styles.actionButtonSuccess]}
                      onPress={() => handleMarkAsPaid(expense)}
                    >
                      <CheckCircle2 size={16} color={colors.textLight} strokeWidth={1.5} />
                      <Text style={styles.actionButtonText}>Marcar como Pago</Text>
                    </TouchableOpacity>
                  )}
                  {activeTab === 'discrepancy' && (
                    <TouchableOpacity 
                      style={[styles.actionButton, styles.actionButtonOutline]}
                      onPress={() => router.push(`/expense-detail?id=${expense.id}`)}
                    >
                      <Text style={styles.actionButtonTextOutline}>Ver Detalhes</Text>
                    </TouchableOpacity>
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
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 20,
    gap: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
  },
  tabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  tabLabelActive: {
    color: colors.textLight,
  },
  tabBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  tabBadgeActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  tabBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabBadgeTextActive: {
    color: colors.textLight,
  },
  list: {
    flex: 1,
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  operationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 2,
  },
  cardSupplier: {
    fontSize: 13,
    color: colors.textMuted,
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
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  valueAmountError: {
    color: colors.error,
  },
  valueDivider: {
    width: 1,
    backgroundColor: colors.border,
  },
  notesContainer: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
    backgroundColor: colors.warning + '10',
    borderRadius: 8,
  },
  notesText: {
    fontSize: 13,
    color: colors.warning,
  },
  cardActions: {
    padding: 16,
    paddingTop: 0,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: colors.primary,
    borderRadius: 8,
    gap: 8,
  },
  actionButtonSuccess: {
    backgroundColor: colors.success,
  },
  actionButtonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textLight,
  },
  actionButtonTextOutline: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
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
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
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
