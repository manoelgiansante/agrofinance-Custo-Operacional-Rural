-- AgroFinance - Custo Operacional Rural
-- Execute este SQL no Supabase SQL Editor

-- Habilitar UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de Setores
CREATE TABLE IF NOT EXISTS sectors (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  color TEXT NOT NULL DEFAULT '#2E7D32',
  icon TEXT NOT NULL DEFAULT 'Layers',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Operações
CREATE TABLE IF NOT EXISTS operations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  sector_id UUID REFERENCES sectors(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  color TEXT NOT NULL DEFAULT '#1565C0',
  icon TEXT NOT NULL DEFAULT 'Tractor',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Despesas
CREATE TABLE IF NOT EXISTS expenses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  operation_id UUID REFERENCES operations(id) ON DELETE CASCADE NOT NULL,
  description TEXT NOT NULL,
  supplier TEXT NOT NULL,
  category TEXT NOT NULL,
  agreed_value DECIMAL(12, 2) NOT NULL,
  invoice_value DECIMAL(12, 2),
  invoice_number TEXT,
  due_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'discrepancy', 'paid', 'rejected')),
  notes TEXT,
  payment_date DATE,
  verified_by TEXT,
  verification_notes TEXT,
  is_shared BOOLEAN DEFAULT false,
  allocations JSONB
);

-- Migração: Adicionar colunas de rateio na tabela expenses (executar se tabela já existe)
-- ALTER TABLE expenses ADD COLUMN IF NOT EXISTS is_shared BOOLEAN DEFAULT false;
-- ALTER TABLE expenses ADD COLUMN IF NOT EXISTS allocations JSONB;

-- Tabela de Assinaturas do Usuário
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  plan_id TEXT NOT NULL DEFAULT 'free',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_sectors_user_id ON sectors(user_id);
CREATE INDEX IF NOT EXISTS idx_operations_user_id ON operations(user_id);
CREATE INDEX IF NOT EXISTS idx_operations_sector_id ON operations(sector_id);
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_operation_id ON expenses(operation_id);
CREATE INDEX IF NOT EXISTS idx_expenses_status ON expenses(status);
CREATE INDEX IF NOT EXISTS idx_expenses_due_date ON expenses(due_date);

-- Row Level Security (RLS)
ALTER TABLE sectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Políticas de Segurança para Setores
CREATE POLICY "Users can view own sectors" ON sectors
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sectors" ON sectors
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sectors" ON sectors
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sectors" ON sectors
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas de Segurança para Operações
CREATE POLICY "Users can view own operations" ON operations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own operations" ON operations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own operations" ON operations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own operations" ON operations
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas de Segurança para Despesas
CREATE POLICY "Users can view own expenses" ON expenses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own expenses" ON expenses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own expenses" ON expenses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own expenses" ON expenses
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas de Segurança para Assinaturas
CREATE POLICY "Users can view own subscription" ON user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscription" ON user_subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription" ON user_subscriptions
  FOR UPDATE USING (auth.uid() = user_id);
