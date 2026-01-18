import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { Operation, Expense, Sector } from '@/types';
import { subscriptionPlans } from '@/mocks/data';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';

const STORAGE_KEYS = {
  SUBSCRIPTION: '@agrofinance_subscription',
};

export const [AppProvider, useApp] = createContextHook(() => {
  const { user, isAuthenticated } = useAuth();
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [operations, setOperations] = useState<Operation[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPlanId, setCurrentPlanId] = useState<string>('free');

  const currentPlan = useMemo(() => {
    return subscriptionPlans.find(p => p.id === currentPlanId) || subscriptionPlans[0];
  }, [currentPlanId]);

  const canAddOperation = useMemo(() => {
    if (currentPlan.operationsLimit === -1) return true;
    return operations.length < currentPlan.operationsLimit;
  }, [operations.length, currentPlan]);

  const isPremiumFeature = useCallback((feature: 'reports' | 'export' | 'verification' | 'multiUser') => {
    if (currentPlanId === 'free') {
      return true;
    }
    if (currentPlanId === 'starter') {
      return feature === 'export' || feature === 'multiUser';
    }
    return false;
  }, [currentPlanId]);

  const loadData = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      console.log('[App] Fetching sectors...');
      const { data: sectorsData, error: sectorsError } = await supabase
        .from('sectors')
        .select('*')
        .order('created_at', { ascending: false });

      if (sectorsError) {
        console.log('[App] Error fetching sectors:', sectorsError);
      } else {
        const mappedSectors: Sector[] = (sectorsData || []).map(s => ({
          id: s.id,
          name: s.name,
          description: s.description || '',
          color: s.color,
          icon: s.icon,
          isActive: s.is_active,
          createdAt: s.created_at,
        }));
        setSectors(mappedSectors);
        console.log('[App] Sectors loaded:', mappedSectors.length);
      }

      console.log('[App] Fetching operations...');
      const { data: operationsData, error: operationsError } = await supabase
        .from('operations')
        .select('*')
        .order('created_at', { ascending: false });

      if (operationsError) {
        console.log('[App] Error fetching operations:', operationsError);
      } else {
        const mappedOperations: Operation[] = (operationsData || []).map(o => ({
          id: o.id,
          sectorId: o.sector_id,
          name: o.name,
          description: o.description || '',
          color: o.color,
          icon: o.icon,
          isActive: o.is_active,
          createdAt: o.created_at,
        }));
        setOperations(mappedOperations);
        console.log('[App] Operations loaded:', mappedOperations.length);
      }

      console.log('[App] Fetching expenses...');
      const { data: expensesData, error: expensesError } = await supabase
        .from('expenses')
        .select('*')
        .order('created_at', { ascending: false });

      if (expensesError) {
        console.log('[App] Error fetching expenses:', expensesError);
      } else {
        const mappedExpenses: Expense[] = (expensesData || []).map(e => ({
          id: e.id,
          operationId: e.operation_id,
          description: e.description,
          supplier: e.supplier,
          category: e.category,
          agreedValue: Number(e.agreed_value),
          invoiceValue: e.invoice_value ? Number(e.invoice_value) : undefined,
          invoiceNumber: e.invoice_number || undefined,
          dueDate: e.due_date,
          createdAt: e.created_at,
          createdBy: e.created_by,
          status: e.status as Expense['status'],
          notes: e.notes || undefined,
          paymentDate: e.payment_date || undefined,
          verifiedBy: e.verified_by || undefined,
          verificationNotes: e.verification_notes || undefined,
          isShared: e.is_shared || false,
          allocations: e.allocations ? (typeof e.allocations === 'string' ? JSON.parse(e.allocations) : e.allocations) : undefined,
        }));
        setExpenses(mappedExpenses);
        console.log('[App] Expenses loaded:', mappedExpenses.length);
      }
    } catch (error) {
      console.log('[App] Error loading data from Supabase:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('[App] User authenticated, loading data from Supabase...');
      loadData();
    } else {
      console.log('[App] User not authenticated, clearing data...');
      setSectors([]);
      setOperations([]);
      setExpenses([]);
      setIsLoading(false);
    }
  }, [isAuthenticated, user, loadData]);

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      const storedSubscription = await AsyncStorage.getItem(STORAGE_KEYS.SUBSCRIPTION);
      if (storedSubscription) {
        setCurrentPlanId(storedSubscription);
      }
    } catch (error) {
      console.log('[App] Error loading subscription:', error);
    }
  };

  const upgradePlan = useCallback(async (planId: string) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SUBSCRIPTION, planId);
      setCurrentPlanId(planId);
      console.log('[App] Plan upgraded to:', planId);
    } catch (error) {
      console.log('[App] Error saving subscription:', error);
    }
  }, []);



  const addSector = useCallback(async (sector: Omit<Sector, 'id' | 'createdAt'>) => {
    if (!user) {
      console.log('[App] Cannot add sector: user not authenticated');
      return null;
    }

    console.log('[App] Adding sector:', sector.name);
    const { data, error } = await supabase
      .from('sectors')
      .insert({
        user_id: user.id,
        name: sector.name,
        description: sector.description,
        color: sector.color,
        icon: sector.icon,
        is_active: sector.isActive,
      })
      .select()
      .single();

    if (error) {
      console.log('[App] Error adding sector:', error);
      return null;
    }

    const newSector: Sector = {
      id: data.id,
      name: data.name,
      description: data.description || '',
      color: data.color,
      icon: data.icon,
      isActive: data.is_active,
      createdAt: data.created_at,
    };

    setSectors(prev => [newSector, ...prev]);
    console.log('[App] Sector added successfully:', newSector.id);
    return newSector;
  }, [user]);

  const updateSector = useCallback(async (id: string, updates: Partial<Sector>) => {
    console.log('[App] Updating sector:', id);
    const dbUpdates: Record<string, unknown> = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.color !== undefined) dbUpdates.color = updates.color;
    if (updates.icon !== undefined) dbUpdates.icon = updates.icon;
    if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;

    const { error } = await supabase
      .from('sectors')
      .update(dbUpdates)
      .eq('id', id);

    if (error) {
      console.log('[App] Error updating sector:', error);
      return;
    }

    setSectors(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    console.log('[App] Sector updated successfully');
  }, []);

  const deleteSector = useCallback(async (id: string) => {
    console.log('[App] Deleting sector:', id);
    const { error } = await supabase
      .from('sectors')
      .delete()
      .eq('id', id);

    if (error) {
      console.log('[App] Error deleting sector:', error);
      return;
    }

    setSectors(prev => prev.filter(s => s.id !== id));
    console.log('[App] Sector deleted successfully');
  }, []);

  const getSectorById = useCallback((id: string) => {
    return sectors.find(s => s.id === id);
  }, [sectors]);

  const getOperationsBySector = useCallback((sectorId: string) => {
    return operations.filter(op => op.sectorId === sectorId);
  }, [operations]);

  const addOperation = useCallback(async (operation: Omit<Operation, 'id' | 'createdAt'>) => {
    if (!user) {
      console.log('[App] Cannot add operation: user not authenticated');
      return null;
    }

    console.log('[App] Adding operation:', operation.name);
    const { data, error } = await supabase
      .from('operations')
      .insert({
        user_id: user.id,
        sector_id: operation.sectorId,
        name: operation.name,
        description: operation.description,
        color: operation.color,
        icon: operation.icon,
        is_active: operation.isActive,
      })
      .select()
      .single();

    if (error) {
      console.log('[App] Error adding operation:', error);
      return null;
    }

    const newOperation: Operation = {
      id: data.id,
      sectorId: data.sector_id,
      name: data.name,
      description: data.description || '',
      color: data.color,
      icon: data.icon,
      isActive: data.is_active,
      createdAt: data.created_at,
    };

    setOperations(prev => [newOperation, ...prev]);
    console.log('[App] Operation added successfully:', newOperation.id);
    return newOperation;
  }, [user]);

  const updateOperation = useCallback(async (id: string, updates: Partial<Operation>) => {
    console.log('[App] Updating operation:', id);
    const dbUpdates: Record<string, unknown> = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.color !== undefined) dbUpdates.color = updates.color;
    if (updates.icon !== undefined) dbUpdates.icon = updates.icon;
    if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;
    if (updates.sectorId !== undefined) dbUpdates.sector_id = updates.sectorId;

    const { error } = await supabase
      .from('operations')
      .update(dbUpdates)
      .eq('id', id);

    if (error) {
      console.log('[App] Error updating operation:', error);
      return;
    }

    setOperations(prev => prev.map(op => op.id === id ? { ...op, ...updates } : op));
    console.log('[App] Operation updated successfully');
  }, []);

  const deleteOperation = useCallback(async (id: string) => {
    console.log('[App] Deleting operation:', id);
    const { error } = await supabase
      .from('operations')
      .delete()
      .eq('id', id);

    if (error) {
      console.log('[App] Error deleting operation:', error);
      return;
    }

    setOperations(prev => prev.filter(op => op.id !== id));
    console.log('[App] Operation deleted successfully');
  }, []);

  const addExpense = useCallback(async (expense: Omit<Expense, 'id' | 'createdAt'>) => {
    if (!user) {
      console.log('[App] Cannot add expense: user not authenticated');
      return null;
    }

    console.log('[App] Adding expense:', expense.description);
    const { data, error } = await supabase
      .from('expenses')
      .insert({
        user_id: user.id,
        operation_id: expense.operationId,
        description: expense.description,
        supplier: expense.supplier,
        category: expense.category,
        agreed_value: expense.agreedValue,
        invoice_value: expense.invoiceValue || null,
        invoice_number: expense.invoiceNumber || null,
        due_date: expense.dueDate,
        created_by: expense.createdBy,
        status: expense.status,
        notes: expense.notes || null,
        payment_date: expense.paymentDate || null,
        verified_by: expense.verifiedBy || null,
        verification_notes: expense.verificationNotes || null,
        is_shared: expense.isShared || false,
        allocations: expense.allocations ? JSON.stringify(expense.allocations) : null,
      })
      .select()
      .single();

    if (error) {
      console.log('[App] Error adding expense:', error);
      return null;
    }

    const newExpense: Expense = {
      id: data.id,
      operationId: data.operation_id,
      description: data.description,
      supplier: data.supplier,
      category: data.category,
      agreedValue: Number(data.agreed_value),
      invoiceValue: data.invoice_value ? Number(data.invoice_value) : undefined,
      invoiceNumber: data.invoice_number || undefined,
      dueDate: data.due_date,
      createdAt: data.created_at,
      createdBy: data.created_by,
      status: data.status as Expense['status'],
      notes: data.notes || undefined,
      paymentDate: data.payment_date || undefined,
      verifiedBy: data.verified_by || undefined,
      verificationNotes: data.verification_notes || undefined,
      isShared: data.is_shared || false,
      allocations: data.allocations ? (typeof data.allocations === 'string' ? JSON.parse(data.allocations) : data.allocations) : undefined,
    };

    setExpenses(prev => [newExpense, ...prev]);
    console.log('[App] Expense added successfully:', newExpense.id);
    return newExpense;
  }, [user]);

  const updateExpense = useCallback(async (id: string, updates: Partial<Expense>) => {
    console.log('[App] Updating expense:', id);
    const dbUpdates: Record<string, unknown> = {};
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.supplier !== undefined) dbUpdates.supplier = updates.supplier;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.agreedValue !== undefined) dbUpdates.agreed_value = updates.agreedValue;
    if (updates.invoiceValue !== undefined) dbUpdates.invoice_value = updates.invoiceValue;
    if (updates.invoiceNumber !== undefined) dbUpdates.invoice_number = updates.invoiceNumber;
    if (updates.dueDate !== undefined) dbUpdates.due_date = updates.dueDate;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
    if (updates.paymentDate !== undefined) dbUpdates.payment_date = updates.paymentDate;
    if (updates.verifiedBy !== undefined) dbUpdates.verified_by = updates.verifiedBy;
    if (updates.verificationNotes !== undefined) dbUpdates.verification_notes = updates.verificationNotes;

    const { error } = await supabase
      .from('expenses')
      .update(dbUpdates)
      .eq('id', id);

    if (error) {
      console.log('[App] Error updating expense:', error);
      return;
    }

    setExpenses(prev => prev.map(exp => exp.id === id ? { ...exp, ...updates } : exp));
    console.log('[App] Expense updated successfully');
  }, []);

  const deleteExpense = useCallback(async (id: string) => {
    console.log('[App] Deleting expense:', id);
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id);

    if (error) {
      console.log('[App] Error deleting expense:', error);
      return;
    }

    setExpenses(prev => prev.filter(exp => exp.id !== id));
    console.log('[App] Expense deleted successfully');
  }, []);

  const getOperationById = useCallback((id: string) => {
    return operations.find(op => op.id === id);
  }, [operations]);

  const getExpensesByOperation = useCallback((operationId: string) => {
    return expenses.filter(exp => {
      if (exp.operationId === operationId) return true;
      if (exp.isShared && exp.allocations) {
        return exp.allocations.some(a => a.operationId === operationId);
      }
      return false;
    });
  }, [expenses]);

  const getExpensesByStatus = useCallback((status: Expense['status']) => {
    return expenses.filter(exp => exp.status === status);
  }, [expenses]);

  const getPendingVerification = useMemo(() => {
    return expenses.filter(exp => exp.status === 'pending' || exp.status === 'discrepancy');
  }, [expenses]);

  const getTotalByOperation = useCallback((operationId: string) => {
    return expenses.reduce((sum, exp) => {
      if (exp.isShared && exp.allocations) {
        const allocation = exp.allocations.find(a => a.operationId === operationId);
        if (allocation) {
          return sum + allocation.value;
        }
        return sum;
      }
      if (exp.operationId === operationId) {
        return sum + exp.agreedValue;
      }
      return sum;
    }, 0);
  }, [expenses]);

  const getMonthlyTotal = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    return expenses
      .filter(exp => {
        const expDate = new Date(exp.createdAt);
        return expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear;
      })
      .reduce((sum, exp) => sum + exp.agreedValue, 0);
  }, [expenses]);

  const refreshData = useCallback(async () => {
    console.log('[App] Refreshing data...');
    await loadData();
  }, [loadData]);

  return {
    sectors,
    operations,
    expenses,
    isLoading,
    addSector,
    updateSector,
    deleteSector,
    getSectorById,
    getOperationsBySector,
    addOperation,
    updateOperation,
    deleteOperation,
    addExpense,
    updateExpense,
    deleteExpense,
    getOperationById,
    getExpensesByOperation,
    getExpensesByStatus,
    getPendingVerification,
    getTotalByOperation,
    getMonthlyTotal,
    currentPlan,
    currentPlanId,
    canAddOperation,
    isPremiumFeature,
    upgradePlan,
    refreshData,
  };
});
