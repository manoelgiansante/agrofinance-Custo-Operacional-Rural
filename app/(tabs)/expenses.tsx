import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Search, Plus, Calendar } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';

export default function ExpensesScreen() {
  const router = useRouter();
  const { expenses, operations } = useApp();
  const [search, setSearch] = useState('');
  const [selectedOperation, setSelectedOperation] = useState<string | null>(null);

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.description.toLowerCase().includes(search.toLowerCase()) ||
      expense.supplier.toLowerCase().includes(search.toLowerCase());
    const matchesOperation = !selectedOperation || expense.operationId === selectedOperation;
    return matchesSearch && matchesOperation;
  });

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Lançamentos</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => router.push('/add-expense')}
        >
          <Plus size={20} color={colors.textLight} strokeWidth={1.5} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Search size={18} color={colors.textMuted} strokeWidth={1.5} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar lançamento..."
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContent}
      >
        <TouchableOpacity 
          style={[styles.filterChip, !selectedOperation && styles.filterChipActive]}
          onPress={() => setSelectedOperation(null)}
        >
          <Text style={[styles.filterText, !selectedOperation && styles.filterTextActive]}>
            Todas
          </Text>
        </TouchableOpacity>
        {operations.map((operation) => (
          <TouchableOpacity 
            key={operation.id}
            style={[
              styles.filterChip, 
              selectedOperation === operation.id && styles.filterChipActive
            ]}
            onPress={() => setSelectedOperation(selectedOperation === operation.id ? null : operation.id)}
          >
            <View style={[styles.filterDot, { backgroundColor: operation.color }]} />
            <Text style={[
              styles.filterText,
              selectedOperation === operation.id && styles.filterTextActive
            ]}>
              {operation.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {filteredExpenses.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Nenhum lançamento</Text>
            <Text style={styles.emptyText}>
              {search ? 'Tente uma busca diferente' : 'Adicione seu primeiro lançamento'}
            </Text>
          </View>
        ) : (
          filteredExpenses.map((expense) => {
            const operation = operations.find(op => op.id === expense.operationId);
            return (
              <TouchableOpacity 
                key={expense.id}
                style={styles.expenseCard}
                onPress={() => router.push(`/expense-detail?id=${expense.id}`)}
              >
                <View style={[styles.expenseIndicator, { backgroundColor: operation?.color || colors.primary }]} />
                <View style={styles.expenseContent}>
                  <View style={styles.expenseHeader}>
                    <Text style={styles.expenseDescription} numberOfLines={1}>
                      {expense.description}
                    </Text>
                    <Text style={styles.expenseValue}>{formatCurrency(expense.agreedValue)}</Text>
                  </View>
                  <View style={styles.expenseDetails}>
                    <Text style={styles.expenseSupplier}>{expense.supplier}</Text>
                    <View style={styles.expenseMeta}>
                      <Calendar size={12} color={colors.textMuted} strokeWidth={1.5} />
                      <Text style={styles.expenseDate}>{formatDate(expense.dueDate)}</Text>
                    </View>
                  </View>
                  <View style={styles.expenseFooter}>
                    <View style={[styles.operationBadge, { backgroundColor: operation?.color + '12' }]}>
                      <Text style={[styles.operationBadgeText, { color: operation?.color }]}>
                        {operation?.name}
                      </Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(expense.status) + '12' }]}>
                      <Text style={[styles.statusText, { color: getStatusColor(expense.status) }]}>
                        {getStatusLabel(expense.status)}
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: -0.5,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: colors.text,
  },
  filterScroll: {
    maxHeight: 44,
    marginBottom: 16,
  },
  filterContent: {
    paddingHorizontal: 24,
    gap: 10,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  filterTextActive: {
    color: colors.textLight,
  },
  list: {
    flex: 1,
    paddingHorizontal: 24,
  },
  expenseCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  expenseIndicator: {
    width: 4,
  },
  expenseContent: {
    flex: 1,
    padding: 16,
  },
  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  expenseDescription: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
    marginRight: 12,
  },
  expenseValue: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  expenseDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  expenseSupplier: {
    fontSize: 13,
    color: colors.textMuted,
  },
  expenseMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  expenseDate: {
    fontSize: 12,
    color: colors.textMuted,
  },
  expenseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  operationBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  operationBadgeText: {
    fontSize: 11,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
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
  },
  bottomSpacing: {
    height: 30,
  },
});
