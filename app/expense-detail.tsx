import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Edit3, 
  Trash2, 
  CheckCircle, 
  AlertTriangle,
  Calendar,
  Building2,
  FileText
} from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';

export default function ExpenseDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { expenses, operations, updateExpense, deleteExpense } = useApp();
  
  const expense = expenses.find(e => e.id === id);
  const operation = expense ? operations.find(op => op.id === expense.operationId) : null;
  
  const [isEditing, setIsEditing] = useState(false);
  const [invoiceValue, setInvoiceValue] = useState(expense?.invoiceValue?.toString() || '');
  const [invoiceNumber, setInvoiceNumber] = useState(expense?.invoiceNumber || '');
  const [notes, setNotes] = useState(expense?.verificationNotes || '');

  useEffect(() => {
    if (expense) {
      setInvoiceValue(expense.invoiceValue?.toString() || '');
      setInvoiceNumber(expense.invoiceNumber || '');
      setNotes(expense.verificationNotes || '');
    }
  }, [expense]);

  if (!expense) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorState}>
          <Text style={styles.errorText}>Lançamento não encontrado</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const handleSave = () => {
    const parsedInvoiceValue = invoiceValue ? parseFloat(invoiceValue) : undefined;
    
    updateExpense(expense.id, {
      invoiceValue: parsedInvoiceValue,
      invoiceNumber: invoiceNumber || undefined,
      verificationNotes: notes || undefined,
    });
    
    setIsEditing(false);
  };

  const handleDelete = () => {
    Alert.alert(
      'Excluir Lançamento',
      'Tem certeza que deseja excluir este lançamento?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: () => {
            deleteExpense(expense.id);
            router.back();
          }
        },
      ]
    );
  };

  const handleMarkAsPaid = () => {
    Alert.alert(
      'Confirmar Pagamento',
      'Deseja marcar este lançamento como pago?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Confirmar', 
          onPress: () => {
            updateExpense(expense.id, { 
              status: 'paid',
              paymentDate: new Date().toISOString(),
            });
          }
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return colors.statusPending;
      case 'verified': return colors.info;
      case 'discrepancy': return colors.error;
      case 'paid': return colors.success;
      default: return colors.textMuted;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'verified': return 'Verificado';
      case 'discrepancy': return 'Divergência';
      case 'paid': return 'Pago';
      default: return status;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalhes</Text>
        <TouchableOpacity style={styles.headerButton} onPress={() => setIsEditing(!isEditing)}>
          <Edit3 size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.mainCard}>
          <View style={styles.statusRow}>
            <View style={[styles.operationBadge, { backgroundColor: operation?.color + '20' }]}>
              <View style={[styles.operationDot, { backgroundColor: operation?.color }]} />
              <Text style={[styles.operationName, { color: operation?.color }]}>
                {operation?.name}
              </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(expense.status) + '20' }]}>
              <Text style={[styles.statusText, { color: getStatusColor(expense.status) }]}>
                {getStatusLabel(expense.status)}
              </Text>
            </View>
          </View>

          <Text style={styles.description}>{expense.description}</Text>
          
          <View style={styles.infoRow}>
            <Building2 size={16} color={colors.textMuted} />
            <Text style={styles.infoText}>{expense.supplier}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Calendar size={16} color={colors.textMuted} />
            <Text style={styles.infoText}>Vencimento: {formatDate(expense.dueDate)}</Text>
          </View>

          <View style={styles.infoRow}>
            <FileText size={16} color={colors.textMuted} />
            <Text style={styles.infoText}>Categoria: {expense.category}</Text>
          </View>
        </View>

        <View style={styles.valuesCard}>
          <Text style={styles.sectionTitle}>Valores</Text>
          
          <View style={styles.valueRow}>
            <Text style={styles.valueLabel}>Valor Combinado</Text>
            <Text style={styles.valueAmount}>{formatCurrency(expense.agreedValue)}</Text>
          </View>

          {isEditing ? (
            <View style={styles.editField}>
              <Text style={styles.editLabel}>Valor da Nota Fiscal</Text>
              <TextInput
                style={styles.editInput}
                placeholder="0,00"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                value={invoiceValue}
                onChangeText={setInvoiceValue}
              />
            </View>
          ) : (
            <View style={styles.valueRow}>
              <Text style={styles.valueLabel}>Valor da Nota</Text>
              <Text style={[
                styles.valueAmount,
                expense.invoiceValue && expense.invoiceValue !== expense.agreedValue && styles.valueError
              ]}>
                {expense.invoiceValue ? formatCurrency(expense.invoiceValue) : '—'}
              </Text>
            </View>
          )}

          {expense.invoiceValue && expense.invoiceValue !== expense.agreedValue && (
            <View style={styles.differenceRow}>
              <AlertTriangle size={16} color={colors.error} />
              <Text style={styles.differenceText}>
                Diferença: {formatCurrency(Math.abs(expense.invoiceValue - expense.agreedValue))}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Informações Adicionais</Text>
          
          {isEditing ? (
            <View style={styles.editField}>
              <Text style={styles.editLabel}>Número da Nota</Text>
              <TextInput
                style={styles.editInput}
                placeholder="NF-000000"
                placeholderTextColor={colors.textMuted}
                value={invoiceNumber}
                onChangeText={setInvoiceNumber}
              />
            </View>
          ) : (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Nota Fiscal</Text>
              <Text style={styles.detailValue}>{expense.invoiceNumber || '—'}</Text>
            </View>
          )}

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Criado em</Text>
            <Text style={styles.detailValue}>{formatDate(expense.createdAt)}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Criado por</Text>
            <Text style={styles.detailValue}>{expense.createdBy}</Text>
          </View>

          {expense.paymentDate && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Data de Pagamento</Text>
              <Text style={styles.detailValue}>{formatDate(expense.paymentDate)}</Text>
            </View>
          )}
        </View>

        {isEditing && (
          <View style={styles.notesCard}>
            <Text style={styles.sectionTitle}>Observações</Text>
            <TextInput
              style={styles.notesInput}
              placeholder="Adicione observações..."
              placeholderTextColor={colors.textMuted}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        )}

        {expense.verificationNotes && !isEditing && (
          <View style={styles.notesCard}>
            <Text style={styles.sectionTitle}>Observações</Text>
            <Text style={styles.notesText}>{expense.verificationNotes}</Text>
          </View>
        )}

        <View style={styles.actions}>
          {isEditing ? (
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <CheckCircle size={20} color={colors.textLight} />
              <Text style={styles.saveButtonText}>Salvar Alterações</Text>
            </TouchableOpacity>
          ) : (
            <>
              {expense.status !== 'paid' && (
                <TouchableOpacity style={styles.paidButton} onPress={handleMarkAsPaid}>
                  <CheckCircle size={20} color={colors.textLight} />
                  <Text style={styles.paidButtonText}>Marcar como Pago</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                <Trash2 size={20} color={colors.error} />
                <Text style={styles.deleteButtonText}>Excluir</Text>
              </TouchableOpacity>
            </>
          )}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  mainCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  operationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  operationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  operationName: {
    fontSize: 13,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  description: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 10,
  },
  valuesCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  valueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  valueLabel: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  valueAmount: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  valueError: {
    color: colors.error,
  },
  differenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.error + '10',
    padding: 12,
    borderRadius: 10,
    marginTop: 8,
  },
  differenceText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.error,
    marginLeft: 8,
  },
  detailsCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  detailLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  editField: {
    marginBottom: 16,
  },
  editLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  editInput: {
    backgroundColor: colors.background,
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  notesCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  notesInput: {
    backgroundColor: colors.background,
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 100,
  },
  notesText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  actions: {
    gap: 12,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textLight,
  },
  paidButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.success,
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  paidButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textLight,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.error + '15',
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.error,
  },
  errorState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: colors.textMuted,
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textLight,
  },
  bottomSpacing: {
    height: 40,
  },
});
