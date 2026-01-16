import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useMemo } from 'react';
import { useRouter } from 'expo-router';
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Lock, Crown } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';

export default function ReportsScreen() {
  const router = useRouter();
  const { expenses, operations, isPremiumFeature } = useApp();
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  const monthlyData = useMemo(() => {
    const month = selectedMonth.getMonth();
    const year = selectedMonth.getFullYear();

    const monthExpenses = expenses.filter(exp => {
      const expDate = new Date(exp.createdAt);
      return expDate.getMonth() === month && expDate.getFullYear() === year;
    });

    const operationTotals = operations.map(op => {
      const opExpenses = monthExpenses.filter(exp => exp.operationId === op.id);
      const total = opExpenses.reduce((sum, exp) => sum + exp.agreedValue, 0);
      const paid = opExpenses.filter(e => e.status === 'paid').reduce((sum, e) => sum + e.agreedValue, 0);
      const pending = total - paid;
      return {
        operation: op,
        total,
        paid,
        pending,
        count: opExpenses.length,
      };
    }).filter(item => item.total > 0);

    const totalMonth = monthExpenses.reduce((sum, exp) => sum + exp.agreedValue, 0);
    const totalPaid = monthExpenses.filter(e => e.status === 'paid').reduce((sum, e) => sum + e.agreedValue, 0);
    const totalPending = totalMonth - totalPaid;

    return {
      operationTotals,
      totalMonth,
      totalPaid,
      totalPending,
      expenseCount: monthExpenses.length,
    };
  }, [expenses, operations, selectedMonth]);

  const prevMonthData = useMemo(() => {
    const prevMonth = new Date(selectedMonth);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    const month = prevMonth.getMonth();
    const year = prevMonth.getFullYear();

    return expenses
      .filter(exp => {
        const expDate = new Date(exp.createdAt);
        return expDate.getMonth() === month && expDate.getFullYear() === year;
      })
      .reduce((sum, exp) => sum + exp.agreedValue, 0);
  }, [expenses, selectedMonth]);

  const percentChange = prevMonthData > 0 
    ? ((monthlyData.totalMonth - prevMonthData) / prevMonthData) * 100 
    : 0;

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const changeMonth = (direction: number) => {
    const newDate = new Date(selectedMonth);
    newDate.setMonth(newDate.getMonth() + direction);
    setSelectedMonth(newDate);
  };

  const maxTotal = Math.max(...monthlyData.operationTotals.map(item => item.total), 1);

  if (isPremiumFeature('reports')) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>Relatórios</Text>
        </View>

        <View style={styles.lockedContainer}>
          <View style={styles.lockedIcon}>
            <Lock size={32} color={colors.primary} />
          </View>
          <Text style={styles.lockedTitle}>Relatórios Premium</Text>
          <Text style={styles.lockedDescription}>
            Desbloqueie relatórios detalhados para acompanhar seus gastos por operação, mês e categoria.
          </Text>
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <View style={styles.featureCheck}>
                <Crown size={12} color={colors.primary} />
              </View>
              <Text style={styles.featureText}>Relatórios mensais detalhados</Text>
            </View>
            <View style={styles.featureItem}>
              <View style={styles.featureCheck}>
                <Crown size={12} color={colors.primary} />
              </View>
              <Text style={styles.featureText}>Comparativo entre meses</Text>
            </View>
            <View style={styles.featureItem}>
              <View style={styles.featureCheck}>
                <Crown size={12} color={colors.primary} />
              </View>
              <Text style={styles.featureText}>Distribuição por operação</Text>
            </View>
            <View style={styles.featureItem}>
              <View style={styles.featureCheck}>
                <Crown size={12} color={colors.primary} />
              </View>
              <Text style={styles.featureText}>Gráficos e visualizações</Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.upgradeButton}
            onPress={() => router.push('/subscription')}
          >
            <Crown size={18} color={colors.textLight} />
            <Text style={styles.upgradeButtonText}>Ver Planos</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Relatórios</Text>
      </View>

      <View style={styles.monthSelector}>
        <TouchableOpacity 
          style={styles.monthButton}
          onPress={() => changeMonth(-1)}
        >
          <ChevronLeft size={20} color={colors.primary} strokeWidth={1.5} />
        </TouchableOpacity>
        <Text style={styles.monthText}>
          {selectedMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
        </Text>
        <TouchableOpacity 
          style={styles.monthButton}
          onPress={() => changeMonth(1)}
        >
          <ChevronRight size={20} color={colors.primary} strokeWidth={1.5} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total do Mês</Text>
          <Text style={styles.summaryValue}>{formatCurrency(monthlyData.totalMonth)}</Text>
          
          {percentChange !== 0 && (
            <View style={[
              styles.changeIndicator,
              { backgroundColor: percentChange > 0 ? colors.error + '10' : colors.success + '10' }
            ]}>
              {percentChange > 0 ? (
                <TrendingUp size={14} color={colors.error} strokeWidth={1.5} />
              ) : (
                <TrendingDown size={14} color={colors.success} strokeWidth={1.5} />
              )}
              <Text style={[
                styles.changeText,
                { color: percentChange > 0 ? colors.error : colors.success }
              ]}>
                {Math.abs(percentChange).toFixed(1)}% vs mês anterior
              </Text>
            </View>
          )}

          <View style={styles.summaryGrid}>
            <View style={styles.summaryGridItem}>
              <Text style={styles.gridLabel}>Pago</Text>
              <Text style={[styles.gridValue, { color: colors.success }]}>
                {formatCurrency(monthlyData.totalPaid)}
              </Text>
            </View>
            <View style={styles.gridDivider} />
            <View style={styles.summaryGridItem}>
              <Text style={styles.gridLabel}>Pendente</Text>
              <Text style={[styles.gridValue, { color: colors.warning }]}>
                {formatCurrency(monthlyData.totalPending)}
              </Text>
            </View>
            <View style={styles.gridDivider} />
            <View style={styles.summaryGridItem}>
              <Text style={styles.gridLabel}>Lançamentos</Text>
              <Text style={styles.gridValue}>{monthlyData.expenseCount}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Por Operação</Text>

          {monthlyData.operationTotals.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Nenhum lançamento neste mês</Text>
            </View>
          ) : (
            monthlyData.operationTotals.map((item) => (
              <View key={item.operation.id} style={styles.operationCard}>
                <View style={styles.operationHeader}>
                  <View style={[styles.operationDot, { backgroundColor: item.operation.color }]} />
                  <Text style={styles.operationName}>{item.operation.name}</Text>
                  <Text style={styles.operationTotal}>{formatCurrency(item.total)}</Text>
                </View>
                
                <View style={styles.barContainer}>
                  <View 
                    style={[
                      styles.barFill,
                      { 
                        width: `${(item.total / maxTotal) * 100}%`,
                        backgroundColor: item.operation.color,
                      }
                    ]} 
                  />
                </View>

                <View style={styles.operationDetails}>
                  <Text style={styles.detailText}>
                    <Text style={{ color: colors.success }}>{formatCurrency(item.paid)}</Text> pago
                  </Text>
                  <Text style={styles.detailText}>
                    <Text style={{ color: colors.warning }}>{formatCurrency(item.pending)}</Text> pendente
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>

        {monthlyData.operationTotals.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Distribuição</Text>
            <View style={styles.distributionCard}>
              {monthlyData.operationTotals.map((item) => {
                const percentage = (item.total / monthlyData.totalMonth) * 100;
                return (
                  <View key={item.operation.id} style={styles.distributionItem}>
                    <View style={styles.distributionHeader}>
                      <View style={[styles.distributionDot, { backgroundColor: item.operation.color }]} />
                      <Text style={styles.distributionName}>{item.operation.name}</Text>
                      <Text style={styles.distributionPercent}>{percentage.toFixed(1)}%</Text>
                    </View>
                    <View style={styles.distributionBarContainer}>
                      <View 
                        style={[
                          styles.distributionBar,
                          { 
                            width: `${percentage}%`,
                            backgroundColor: item.operation.color,
                          }
                        ]} 
                      />
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
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
    paddingBottom: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: -0.5,
  },
  lockedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  lockedIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  lockedTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  lockedDescription: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  featuresList: {
    width: '100%',
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  featureCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  featureText: {
    fontSize: 14,
    color: colors.text,
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  upgradeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textLight,
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  monthButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  monthText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    textTransform: 'capitalize',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 32,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: -1,
    marginBottom: 12,
  },
  changeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    marginBottom: 20,
  },
  changeText: {
    fontSize: 13,
    fontWeight: '500',
  },
  summaryGrid: {
    flexDirection: 'row',
    width: '100%',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  summaryGridItem: {
    flex: 1,
    alignItems: 'center',
  },
  gridLabel: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 4,
  },
  gridValue: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  gridDivider: {
    width: 1,
    backgroundColor: colors.border,
  },
  section: {
    marginTop: 28,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  operationCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  operationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  operationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  operationName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
  },
  operationTotal: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  barContainer: {
    height: 6,
    backgroundColor: colors.borderLight,
    borderRadius: 3,
    marginBottom: 12,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
  operationDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailText: {
    fontSize: 13,
    color: colors.textMuted,
  },
  distributionCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  distributionItem: {
    marginBottom: 16,
  },
  distributionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  distributionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  distributionName: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },
  distributionPercent: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  distributionBarContainer: {
    height: 4,
    backgroundColor: colors.borderLight,
    borderRadius: 2,
    overflow: 'hidden',
  },
  distributionBar: {
    height: '100%',
    borderRadius: 2,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textMuted,
  },
  bottomSpacing: {
    height: 30,
  },
});
