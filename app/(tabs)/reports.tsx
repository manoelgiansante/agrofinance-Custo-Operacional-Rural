import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';



export default function ReportsScreen() {
  const { expenses, operations } = useApp();
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
      const pending = opExpenses.filter(e => e.status !== 'paid').reduce((sum, e) => sum + e.agreedValue, 0);
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
          <ChevronLeft size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.monthText}>
          {selectedMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
        </Text>
        <TouchableOpacity 
          style={styles.monthButton}
          onPress={() => changeMonth(1)}
        >
          <ChevronRight size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.summaryCard}>
          <View style={styles.summaryMain}>
            <Text style={styles.summaryLabel}>Total do Mês</Text>
            <Text style={styles.summaryValue}>{formatCurrency(monthlyData.totalMonth)}</Text>
            {percentChange !== 0 && (
              <View style={[
                styles.changeIndicator,
                { backgroundColor: percentChange > 0 ? colors.error + '20' : colors.success + '20' }
              ]}>
                {percentChange > 0 ? (
                  <TrendingUp size={14} color={colors.error} />
                ) : (
                  <TrendingDown size={14} color={colors.success} />
                )}
                <Text style={[
                  styles.changeText,
                  { color: percentChange > 0 ? colors.error : colors.success }
                ]}>
                  {Math.abs(percentChange).toFixed(1)}% vs mês anterior
                </Text>
              </View>
            )}
          </View>
          
          <View style={styles.summaryGrid}>
            <View style={styles.summaryGridItem}>
              <Text style={styles.gridLabel}>Pago</Text>
              <Text style={[styles.gridValue, { color: colors.success }]}>
                {formatCurrency(monthlyData.totalPaid)}
              </Text>
            </View>
            <View style={styles.summaryGridItem}>
              <Text style={styles.gridLabel}>Pendente</Text>
              <Text style={[styles.gridValue, { color: colors.warning }]}>
                {formatCurrency(monthlyData.totalPending)}
              </Text>
            </View>
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
            monthlyData.operationTotals.map((item, index) => (
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
                  <Text style={styles.detailText}>{item.count} lançamentos</Text>
                </View>
              </View>
            ))
          )}
        </View>

        {monthlyData.operationTotals.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Distribuição</Text>
            <View style={styles.distributionCard}>
              {monthlyData.operationTotals.map((item, index) => {
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  monthButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    textTransform: 'capitalize',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  summaryCard: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
  },
  summaryMain: {
    alignItems: 'center',
    marginBottom: 20,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.textLight,
    opacity: 0.8,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.textLight,
    marginBottom: 8,
  },
  changeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  changeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  summaryGrid: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    padding: 16,
  },
  summaryGridItem: {
    flex: 1,
    alignItems: 'center',
  },
  gridLabel: {
    fontSize: 12,
    color: colors.textLight,
    opacity: 0.7,
    marginBottom: 4,
  },
  gridValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textLight,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  operationCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  operationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  operationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  operationName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  operationTotal: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  barContainer: {
    height: 8,
    backgroundColor: colors.borderLight,
    borderRadius: 4,
    marginBottom: 12,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  operationDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  distributionCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
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
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  distributionName: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },
  distributionPercent: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  distributionBarContainer: {
    height: 6,
    backgroundColor: colors.borderLight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  distributionBar: {
    height: '100%',
    borderRadius: 3,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: colors.surface,
    borderRadius: 14,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textMuted,
  },
  bottomSpacing: {
    height: 30,
  },
});
