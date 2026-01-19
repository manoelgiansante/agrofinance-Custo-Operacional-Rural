import { useState, useEffect, useCallback } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import { supabase } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';

// =====================================================
// TIPOS - SISTEMA INTEGRADO RUMO (SSO)
// =====================================================
export type SubscriptionPlan = 'free' | 'premium' | 'enterprise';
export type SubscriptionStatus = 'active' | 'expired' | 'cancelled' | 'trial';

export interface Subscription {
  id: string;
  user_id: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  starts_at: string;
  expires_at: string | null;
  created_at: string;
  apps_included: string[];
  features: string[];
}

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  phone?: string;
  farm_name?: string;
  created_at: string;
}

// =====================================================
// AUTH CONTEXT - LOGIN ÚNICO INTEGRADO
// =====================================================
export const [AuthProvider, useAuth] = createContextHook(() => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(false);

  // =====================================================
  // CARREGAR PERFIL AUTOMÁTICO
  // =====================================================
  const loadUserProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (data) {
        setProfile(data);
        return data;
      }
      return null;
    } catch (error) {
      console.log('[Auth] Error loading profile:', error);
      return null;
    }
  }, []);

  // =====================================================
  // CARREGAR ASSINATURA INTEGRADA AUTOMÁTICA
  // =====================================================
  const loadSubscription = useCallback(async (userId: string): Promise<Subscription | null> => {
    setIsLoadingSubscription(true);
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (data) {
        // Verificar expiração
        const isExpired = data.expires_at && new Date(data.expires_at) < new Date();
        if (isExpired && data.status === 'active') {
          await supabase.from('subscriptions').update({ status: 'expired' }).eq('id', data.id);
          data.status = 'expired';
        }
        setSubscription(data);
        setIsLoadingSubscription(false);
        return data;
      }

      // Criar trial de 7 dias com acesso TOTAL a todos os apps
      const trialSubscription = {
        user_id: userId,
        plan: 'free' as SubscriptionPlan,
        status: 'trial' as SubscriptionStatus,
        starts_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        apps_included: ['operacional', 'finance', 'maquinas'],
        features: ['basic_reports', 'limited_entries', 'integration'],
      };

      const { data: created } = await supabase
        .from('subscriptions')
        .insert(trialSubscription)
        .select()
        .single();

      if (created) {
        setSubscription(created);
      }
      setIsLoadingSubscription(false);
      return created || null;
    } catch (error) {
      console.log('[Auth] Error loading subscription:', error);
      setIsLoadingSubscription(false);
      return null;
    }
  }, []);

  // =====================================================
  // INICIALIZAÇÃO - AUTO-INTEGRAÇÃO
  // =====================================================
  useEffect(() => {
    console.log('[Auth] Initializing integrated auth...');
    
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
        
        // AUTO-INTEGRAÇÃO: Login = acesso automático a tudo
        if (session?.user) {
          await loadUserProfile(session.user.id);
          await loadSubscription(session.user.id);
        }
      } catch (error) {
        console.log('[Auth] Exception:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    let authSub: { unsubscribe: () => void } | null = null;
    
    try {
      const authListener = supabase.auth.onAuthStateChange(async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Auto-carregar tudo quando logar
        if (session?.user) {
          await loadUserProfile(session.user.id);
          await loadSubscription(session.user.id);
        } else {
          setProfile(null);
          setSubscription(null);
        }
        setIsLoading(false);
      });
      authSub = authListener.data.subscription;
    } catch (error) {
      console.log('[Auth] Listener error:', error);
    }

    return () => { authSub?.unsubscribe(); };
  }, [loadUserProfile, loadSubscription]);

  // =====================================================
  // VERIFICAÇÕES DE ACESSO
  // =====================================================
  const hasAccessToApp = useCallback((appName: string): boolean => {
    if (!subscription) return false;
    if (subscription.plan === 'premium' || subscription.plan === 'enterprise') {
      return subscription.status === 'active' || subscription.status === 'trial';
    }
    return subscription.apps_included?.includes(appName) ?? false;
  }, [subscription]);

  const hasFeature = useCallback((featureName: string): boolean => {
    if (!subscription) return false;
    if (subscription.plan === 'premium') return subscription.status === 'active';
    return subscription.features?.includes(featureName) ?? false;
  }, [subscription]);

  const needsPayment = useCallback((): boolean => {
    if (!subscription) return true;
    if (subscription.status === 'trial') {
      return subscription.expires_at ? new Date(subscription.expires_at) < new Date() : false;
    }
    return subscription.status === 'expired' || subscription.status === 'cancelled';
  }, [subscription]);

  const trialDaysRemaining = useCallback((): number => {
    if (!subscription || subscription.status !== 'trial' || !subscription.expires_at) return 0;
    const diff = new Date(subscription.expires_at).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [subscription]);

  // =====================================================
  // UPGRADE APÓS PAGAMENTO
  // =====================================================
  const upgradeSubscription = useCallback(async (plan: SubscriptionPlan): Promise<boolean> => {
    if (!user) return false;
    try {
      const newExpiration = new Date();
      newExpiration.setMonth(newExpiration.getMonth() + 1);

      const updates = {
        plan,
        status: 'active' as SubscriptionStatus,
        starts_at: new Date().toISOString(),
        expires_at: newExpiration.toISOString(),
        apps_included: ['operacional', 'finance', 'maquinas'],
        features: ['unlimited_entries', 'advanced_reports', 'pdf_export', 'excel_export', 
                   'multi_farm', 'team_members', 'priority_support', 'integrations', 'api_access'],
      };

      if (subscription?.id) {
        await supabase.from('subscriptions').update(updates).eq('id', subscription.id);
      } else {
        await supabase.from('subscriptions').insert({ ...updates, user_id: user.id });
      }

      await loadSubscription(user.id);
      return true;
    } catch (error) {
      console.log('[Auth] Upgrade error:', error);
      return false;
    }
  }, [user, subscription, loadSubscription]);

  // =====================================================
  // AUTH ACTIONS
  // =====================================================
  const signUp = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return data;
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    // Profile e subscription carregam automaticamente via listener
    return data;
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setProfile(null);
    setSubscription(null);
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  }, []);

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!user) return false;
    try {
      await supabase.from('profiles').update(updates).eq('id', user.id);
      setProfile(prev => prev ? { ...prev, ...updates } : null);
      return true;
    } catch { return false; }
  }, [user]);

  // =====================================================
  // RETORNO - TUDO INTEGRADO
  // =====================================================
  return {
    // Auth
    session, user, isLoading, isAuthenticated: !!session,
    // Perfil
    profile, updateProfile,
    // Assinatura integrada
    subscription, isLoadingSubscription,
    isPremium: subscription?.plan === 'premium' || subscription?.plan === 'enterprise',
    isTrial: subscription?.status === 'trial',
    isActive: subscription?.status === 'active' || subscription?.status === 'trial',
    // Verificações
    hasAccessToApp, hasFeature, needsPayment, trialDaysRemaining,
    // Ações
    signUp, signIn, signOut, resetPassword, upgradeSubscription, loadSubscription,
  };
});
