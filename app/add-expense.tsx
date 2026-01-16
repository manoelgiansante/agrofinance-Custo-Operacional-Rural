import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { X, ChevronDown } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { expenseCategories } from '@/mocks/data';

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

  const handleSave = () => {
    if (!description.trim()) {
      Alert.alert('Erro', 'Informe a descrição do lançamento');
      return;
    }
    if (!selectedOperation) {
      Alert.alert('Erro', 'Selecione uma operação');
      return;
    }
    if (!agreedValue || parseFloat(agreedValue) <= 0) {
      Alert.alert('Erro', 'Informe um valor válido');
      return;
    }
    if (!dueDate) {
      Alert.alert('Erro', 'Informe a data de vencimento');
      return;
    }

    addExpense({
      operationId: selectedOperation,
      description: description.trim(),
      supplier: supplier.trim() || 'Não informado',
      category: selectedCategory || 'Outros',
      agreedValue: parseFloat(agreedValue),
      dueDate: dueDate,
      status: 'pending',
      createdBy: 'Usuário',
      notes: notes.trim() || undefined,
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
            placeholder="Ex: Ração para gado"
            placeholderTextColor={colors.textMuted}
            value={description}
            onChangeText={setDescription}
          />
        </View>

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
          <Text style={styles.label}>Valor Combinado *</Text>
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
    fontWeight: '600',
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
    fontWeight: '600',
    color: colors.textLight,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
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
  pickerText: {
    fontSize: 15,
    color: colors.text,
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
    fontWeight: '600',
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
  bottomSpacing: {
    height: 40,
  },
});
