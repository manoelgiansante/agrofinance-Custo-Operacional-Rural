import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useState, useMemo } from 'react';
import { X, ChevronDown, Check, Split, Percent } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { expenseCategories } from '@/mocks/data';
import { ExpenseAllocation } from '@/types';

interface OperationAllocation {
  operationId: string;
  percentage: number;
}

export default function AddExpenseScreen() {
  const router = useRouter();
  const { operations, addExpense } = useApp();
  
  const [description, setDescription] = useState('');
  const [supplier, setSupplier] = useState('');
  const [agreedValue, setAgreedValue] = useState('');
  const [selectedOperation, setSelectedOperation] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [showOperationPicker, setShowOperationPicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  
  const [isSharedExpense, setIsSharedExpense] = useState(false);
  const [selectedOperations, setSelectedOperations] = useState<OperationAllocation[]>([]);
  const [showMultiOperationPicker, setShowMultiOperationPicker] = useState(false);

  const totalPercentage = useMemo(() => {
    return selectedOperations.reduce((sum, op) => sum + op.percentage, 0);
  }, [selectedOperations]);

  const allocations: ExpenseAllocation[] = useMemo(() => {
    const value = parseFloat(agreedValue) || 0;
    return selectedOperations.map(op => ({
      operationId: op.operationId,
      percentage: op.percentage,
      value: (value * op.percentage) / 100,
    }));
  }, [selectedOperations, agreedValue]);

  const toggleOperationSelection = (operationId: string) => {
    const existing = selectedOperations.find(op => op.operationId === operationId);
    if (existing) {
      setSelectedOperations(prev => prev.filter(op => op.operationId !== operationId));
    } else {
      const remainingPercentage = 100 - totalPercentage;
      const defaultPercentage = remainingPercentage > 0 ? Math.min(remainingPercentage, 50) : 0;
      setSelectedOperations(prev => [...prev, { operationId, percentage: defaultPercentage }]);
    }
  };

  const updateOperationPercentage = (operationId: string, percentage: number) => {
    setSelectedOperations(prev => 
      prev.map(op => op.operationId === operationId ? { ...op, percentage } : op)
    );
  };

  const distributeEqually = () => {
    if (selectedOperations.length === 0) return;
    const equalPercentage = Math.floor(100 / selectedOperations.length);
    const remainder = 100 - (equalPercentage * selectedOperations.length);
    
    setSelectedOperations(prev => 
      prev.map((op, index) => ({
        ...op,
        percentage: equalPercentage + (index === 0 ? remainder : 0),
      }))
    );
  };

  const handleSave = () => {
    if (!description.trim()) {
      Alert.alert('Erro', 'Informe a descrição do lançamento');
      return;
    }
    
    if (isSharedExpense) {
      if (selectedOperations.length < 2) {
        Alert.alert('Erro', 'Selecione pelo menos 2 operações para ratear');
        return;
      }
      if (totalPercentage !== 100) {
        Alert.alert('Erro', 'A soma dos percentuais deve ser 100%');
        return;
      }
    } else {
      if (!selectedOperation) {
        Alert.alert('Erro', 'Selecione uma operação');
        return;
      }
    }
    
    if (!agreedValue || parseFloat(agreedValue) <= 0) {
      Alert.alert('Erro', 'Informe um valor válido');
      return;
    }
    if (!dueDate) {
      Alert.alert('Erro', 'Informe a data de vencimento');
      return;
    }

    const primaryOperationId = isSharedExpense 
      ? selectedOperations[0]?.operationId 
      : selectedOperation;

    if (!primaryOperationId) {
      Alert.alert('Erro', 'Selecione uma operação');
      return;
    }

    addExpense({
      operationId: primaryOperationId,
      description: description.trim(),
      supplier: supplier.trim() || 'Não informado',
      category: selectedCategory || 'Outros',
      agreedValue: parseFloat(agreedValue),
      dueDate: dueDate,
      status: 'pending',
      createdBy: 'Usuário',
      notes: notes.trim() || undefined,
      isShared: isSharedExpense,
      allocations: isSharedExpense ? allocations : undefined,
    });

    router.back();
  };

  const formatCurrency = (value: string) => {
    const number = value.replace(/\D/g, '');
    const formatted = (parseInt(number) / 100).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return formatted;
  };

  const handleValueChange = (text: string) => {
    const numbers = text.replace(/\D/g, '');
    if (numbers) {
      setAgreedValue((parseInt(numbers) / 100).toString());
    } else {
      setAgreedValue('');
    }
  };

  const selectedOperationData = operations.find(op => op.id === selectedOperation);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
          <X size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Novo Lançamento</Text>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Salvar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.field}>
          <Text style={styles.label}>Descrição *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Conta de energia"
            placeholderTextColor={colors.textMuted}
            value={description}
            onChangeText={setDescription}
          />
        </View>

        <View style={styles.sharedToggleContainer}>
          <View style={styles.sharedToggleLeft}>
            <Split size={20} color={isSharedExpense ? colors.primary : colors.textMuted} />
            <View style={styles.sharedToggleText}>
              <Text style={styles.sharedToggleTitle}>Ratear custo</Text>
              <Text style={styles.sharedToggleSubtitle}>Dividir entre operações</Text>
            </View>
          </View>
          <Switch
            value={isSharedExpense}
            onValueChange={(value) => {
              setIsSharedExpense(value);
              if (!value) {
                setSelectedOperations([]);
              }
            }}
            trackColor={{ false: colors.border, true: colors.primaryLight }}
            thumbColor={isSharedExpense ? colors.primary : colors.surface}
          />
        </View>

        {!isSharedExpense ? (
          <View style={styles.field}>
            <Text style={styles.label}>Operação *</Text>
            <TouchableOpacity 
              style={styles.select}
              onPress={() => setShowOperationPicker(!showOperationPicker)}
            >
              {selectedOperationData ? (
                <View style={styles.selectedOption}>
                  <View style={[styles.optionDot, { backgroundColor: selectedOperationData.color }]} />
                  <Text style={styles.selectText}>{selectedOperationData.name}</Text>
                </View>
              ) : (
                <Text style={styles.selectPlaceholder}>Selecione a operação</Text>
              )}
              <ChevronDown size={20} color={colors.textMuted} />
            </TouchableOpacity>
            
            {showOperationPicker && (
              <View style={styles.picker}>
                {operations.map(op => (
                  <TouchableOpacity
                    key={op.id}
                    style={styles.pickerItem}
                    onPress={() => {
                      setSelectedOperation(op.id);
                      setShowOperationPicker(false);
                    }}
                  >
                    <View style={[styles.optionDot, { backgroundColor: op.color }]} />
                    <Text style={styles.pickerText}>{op.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        ) : (
          <View style={styles.field}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Operações para Rateio *</Text>
              {selectedOperations.length >= 2 && (
                <TouchableOpacity onPress={distributeEqually} style={styles.equalizeButton}>
                  <Percent size={14} color={colors.primary} />
                  <Text style={styles.equalizeText}>Igualar</Text>
                </TouchableOpacity>
              )}
            </View>
            
            <TouchableOpacity 
              style={styles.select}
              onPress={() => setShowMultiOperationPicker(!showMultiOperationPicker)}
            >
              {selectedOperations.length > 0 ? (
                <Text style={styles.selectText}>
                  {selectedOperations.length} operação(ões) selecionada(s)
                </Text>
              ) : (
                <Text style={styles.selectPlaceholder}>Selecione as operações</Text>
              )}
              <ChevronDown size={20} color={colors.textMuted} />
            </TouchableOpacity>

            {showMultiOperationPicker && (
              <View style={styles.picker}>
                {operations.map(op => {
                  const isSelected = selectedOperations.some(s => s.operationId === op.id);
                  return (
                    <TouchableOpacity
                      key={op.id}
                      style={[styles.pickerItem, isSelected && styles.pickerItemSelected]}
                      onPress={() => toggleOperationSelection(op.id)}
                    >
                      <View style={[styles.optionDot, { backgroundColor: op.color }]} />
                      <Text style={styles.pickerText}>{op.name}</Text>
                      {isSelected && <Check size={18} color={colors.primary} />}
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {selectedOperations.length > 0 && (
              <View style={styles.allocationContainer}>
                <Text style={styles.allocationTitle}>Distribuição do Rateio</Text>
                {selectedOperations.map(allocation => {
                  const op = operations.find(o => o.id === allocation.operationId);
                  const value = parseFloat(agreedValue) || 0;
                  const allocatedValue = (value * allocation.percentage) / 100;
                  
                  return (
                    <View key={allocation.operationId} style={styles.allocationRow}>
                      <View style={styles.allocationInfo}>
                        <View style={[styles.optionDotSmall, { backgroundColor: op?.color || colors.primary }]} />
                        <Text style={styles.allocationName} numberOfLines={1}>
                          {op?.name || ''}
                        </Text>
                      </View>
                      <View style={styles.allocationInputContainer}>
                        <TextInput
                          style={styles.allocationInput}
                          keyboardType="numeric"
                          value={allocation.percentage.toString()}
                          onChangeText={(text) => {
                            const num = parseInt(text) || 0;
                            updateOperationPercentage(allocation.operationId, Math.min(100, Math.max(0, num)));
                          }}
                          maxLength={3}
                        />
                        <Text style={styles.allocationPercent}>%</Text>
                      </View>
                      <Text style={styles.allocationValue}>
                        R$ {allocatedValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </Text>
                    </View>
                  );
                })}
                <View style={[styles.allocationTotalRow, totalPercentage !== 100 && styles.allocationTotalError]}>
                  <Text style={[styles.allocationTotalLabel, totalPercentage !== 100 && styles.allocationTotalErrorText]}>
                    Total: {totalPercentage}%
                  </Text>
                  {totalPercentage !== 100 && (
                    <Text style={styles.allocationErrorHint}>Deve ser 100%</Text>
                  )}
                </View>
              </View>
            )}
          </View>
        )}

        <View style={styles.field}>
          <Text style={styles.label}>Fornecedor</Text>
          <TextInput
            style={styles.input}
            placeholder="Nome do fornecedor"
            placeholderTextColor={colors.textMuted}
            value={supplier}
            onChangeText={setSupplier}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Categoria</Text>
          <TouchableOpacity 
            style={styles.select}
            onPress={() => setShowCategoryPicker(!showCategoryPicker)}
          >
            <Text style={selectedCategory ? styles.selectText : styles.selectPlaceholder}>
              {selectedCategory || 'Selecione a categoria'}
            </Text>
            <ChevronDown size={20} color={colors.textMuted} />
          </TouchableOpacity>
          
          {showCategoryPicker && (
            <View style={styles.picker}>
              {expenseCategories.map(cat => (
                <TouchableOpacity
                  key={cat.id}
                  style={styles.pickerItem}
                  onPress={() => {
                    setSelectedCategory(cat.name);
                    setShowCategoryPicker(false);
                  }}
                >
                  <Text style={styles.pickerText}>{cat.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Valor Total *</Text>
          <View style={styles.currencyInput}>
            <Text style={styles.currencyPrefix}>R$</Text>
            <TextInput
              style={styles.currencyField}
              placeholder="0,00"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              value={agreedValue ? formatCurrency((parseFloat(agreedValue) * 100).toString()) : ''}
              onChangeText={handleValueChange}
            />
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Data de Vencimento *</Text>
          <TextInput
            style={styles.input}
            placeholder="DD/MM/AAAA"
            placeholderTextColor={colors.textMuted}
            value={dueDate}
            onChangeText={setDueDate}
            keyboardType="numeric"
            maxLength={10}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Observações</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Adicione notas ou observações..."
            placeholderTextColor={colors.textMuted}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
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
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    backgroundColor: colors.surface,
  },
  closeButton: {
    padding: 4,
  },
  title: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: colors.text,
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.textLight,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  field: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textArea: {
    minHeight: 100,
  },
  select: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectText: {
    fontSize: 15,
    color: colors.text,
  },
  selectPlaceholder: {
    fontSize: 15,
    color: colors.textMuted,
  },
  selectedOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  optionDotSmall: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  picker: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  pickerItemSelected: {
    backgroundColor: colors.primaryLight + '20',
  },
  pickerText: {
    fontSize: 15,
    color: colors.text,
    flex: 1,
  },
  currencyInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  currencyPrefix: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.textSecondary,
    paddingHorizontal: 14,
    backgroundColor: colors.background,
    paddingVertical: 14,
  },
  currencyField: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    padding: 14,
  },
  sharedToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sharedToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sharedToggleText: {
    marginLeft: 12,
  },
  sharedToggleTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.text,
  },
  sharedToggleSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  equalizeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight + '20',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  equalizeText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: colors.primary,
    marginLeft: 4,
  },
  allocationContainer: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  allocationTitle: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: colors.textSecondary,
    marginBottom: 12,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  allocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  allocationInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  allocationName: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  allocationInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 8,
    paddingHorizontal: 8,
    marginHorizontal: 12,
  },
  allocationInput: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.text,
    width: 40,
    textAlign: 'center' as const,
    paddingVertical: 6,
  },
  allocationPercent: {
    fontSize: 12,
    color: colors.textMuted,
  },
  allocationValue: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: colors.primary,
    width: 90,
    textAlign: 'right' as const,
  },
  allocationTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  allocationTotalError: {
    borderTopColor: colors.error,
  },
  allocationTotalLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.text,
  },
  allocationTotalErrorText: {
    color: colors.error,
  },
  allocationErrorHint: {
    fontSize: 12,
    color: colors.error,
  },
  bottomSpacing: {
    height: 40,
  },
});
