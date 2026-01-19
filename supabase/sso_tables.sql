-- =====================================================
-- SISTEMA INTEGRADO RUMO - TABELAS SSO
-- Execute no Supabase Dashboard
-- =====================================================

-- 1. PROFILES (Perfil unificado de usuário)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  avatar_url TEXT,
  phone VARCHAR(50),
  farm_name VARCHAR(255),
  cpf_cnpj VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. SUBSCRIPTIONS (Assinatura única para todos os apps)
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan VARCHAR(20) NOT NULL DEFAULT 'free', -- free, premium, enterprise
  status VARCHAR(20) NOT NULL DEFAULT 'trial', -- active, expired, cancelled, trial
  starts_at TIMESTAMP NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP,
  -- Apps incluídos (todos compartilham mesma assinatura)
  apps_included TEXT[] DEFAULT ARRAY['operacional', 'finance', 'maquinas'],
  -- Features desbloqueadas
  features TEXT[] DEFAULT ARRAY['basic_reports', 'limited_entries'],
  -- Pagamento
  payment_method VARCHAR(50),
  payment_id VARCHAR(255),
  amount DECIMAL(10,2),
  currency VARCHAR(10) DEFAULT 'BRL',
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. PAYMENT_HISTORY (Histórico de pagamentos)
CREATE TABLE IF NOT EXISTS payment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id),
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'BRL',
  status VARCHAR(20) NOT NULL, -- pending, completed, failed, refunded
  payment_method VARCHAR(50),
  payment_provider VARCHAR(50), -- stripe, pix, boleto
  payment_id VARCHAR(255),
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;

-- Policies - Usuário só vê seus próprios dados
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own subscription" ON subscriptions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own payments" ON payment_history
  FOR SELECT USING (auth.uid() = user_id);

-- Trigger para criar profile automaticamente no signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  
  -- Criar assinatura trial de 7 dias automaticamente
  INSERT INTO public.subscriptions (user_id, plan, status, expires_at)
  VALUES (
    NEW.id,
    'free',
    'trial',
    NOW() + INTERVAL '7 days'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger no signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_payment_history_user_id ON payment_history(user_id);
