-- =====================================================
-- SCHEMA UNIFICADO AGROFINANCE
-- Combina: Gestão Rural + Custo Operacional Rural
-- Execute este SQL no Supabase SQL Editor
-- =====================================================

-- =====================================================
-- 1. ENABLE UUID EXTENSION
-- =====================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 2. FARMS (Fazendas)
-- =====================================================
CREATE TABLE IF NOT EXISTS farms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  cpf_cnpj TEXT NOT NULL,
  state_registration TEXT,
  area DECIMAL(10, 2),
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. SECTORS (Setores - do Custo Operacional)
-- =====================================================
CREATE TABLE IF NOT EXISTS sectors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  color TEXT NOT NULL DEFAULT '#2E7D32',
  icon TEXT NOT NULL DEFAULT 'Layers',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 4. OPERATIONS (Operações)
-- =====================================================
CREATE TABLE IF NOT EXISTS operations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
  sector_id UUID REFERENCES sectors(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  type TEXT,
  color TEXT DEFAULT '#1565C0',
  icon TEXT DEFAULT 'Tractor',
  budget DECIMAL(15, 2) DEFAULT 0,
  spent DECIMAL(15, 2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 5. SUPPLIERS (Fornecedores)
-- =====================================================
CREATE TABLE IF NOT EXISTS suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  cpf_cnpj TEXT NOT NULL,
  category TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 6. CLIENTS (Clientes)
-- =====================================================
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  cpf_cnpj TEXT NOT NULL,
  type TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  state_registration TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 7. CATEGORIES (Categorias)
-- =====================================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  color TEXT,
  icon TEXT,
  subcategories TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 8. COST CENTERS (Centros de Custo)
-- =====================================================
CREATE TABLE IF NOT EXISTS cost_centers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  operation_id UUID REFERENCES operations(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES cost_centers(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 9. EXPENSES (Despesas - Unificado)
-- =====================================================
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  supplier TEXT,
  supplier_id UUID REFERENCES suppliers(id),
  operation_id UUID REFERENCES operations(id),
  cost_center_id UUID REFERENCES cost_centers(id),
  category TEXT NOT NULL,
  subcategory TEXT,
  -- Valores
  agreed_value DECIMAL(15, 2),
  negotiated_value DECIMAL(15, 2),
  invoice_value DECIMAL(15, 2),
  actual_value DECIMAL(15, 2),
  invoice_number TEXT,
  -- Datas
  date TIMESTAMP WITH TIME ZONE,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  competence TIMESTAMP WITH TIME ZONE,
  payment_date TIMESTAMP WITH TIME ZONE,
  -- Pagamento
  payment_method TEXT,
  installments INTEGER,
  current_installment INTEGER,
  -- Status e workflow
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'discrepancy', 'paid', 'rejected', 'draft', 'approved')),
  notes TEXT,
  tags TEXT[],
  -- Verificação de serviço
  service_confirmed BOOLEAN DEFAULT false,
  service_confirmed_by TEXT,
  service_confirmed_at TIMESTAMP WITH TIME ZONE,
  -- Criação e aprovação
  created_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  verified_by TEXT,
  verification_notes TEXT,
  approved_by TEXT,
  approved_at TIMESTAMP WITH TIME ZONE,
  paid_by TEXT,
  paid_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Rateio
  is_shared BOOLEAN DEFAULT false,
  allocations JSONB
);

-- =====================================================
-- 10. REVENUES (Receitas)
-- =====================================================
CREATE TABLE IF NOT EXISTS revenues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  client_id UUID REFERENCES clients(id),
  operation_id UUID REFERENCES operations(id),
  category TEXT NOT NULL,
  value DECIMAL(15, 2) NOT NULL,
  invoice_number TEXT,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  received_date TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT NOT NULL,
  contract_id UUID,
  notes TEXT,
  created_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 11. CONTRACTS (Contratos)
-- =====================================================
CREATE TABLE IF NOT EXISTS contracts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  partner_id UUID,
  operation_id UUID REFERENCES operations(id),
  product TEXT NOT NULL,
  quantity DECIMAL(15, 2) NOT NULL,
  unit TEXT NOT NULL,
  unit_price DECIMAL(15, 2) NOT NULL,
  total_value DECIMAL(15, 2) NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  payment_terms TEXT,
  delivery_terms TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 12. STOCK ITEMS (Itens de Estoque)
-- =====================================================
CREATE TABLE IF NOT EXISTS stock_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  category TEXT NOT NULL,
  unit TEXT NOT NULL,
  current_stock DECIMAL(15, 2) DEFAULT 0,
  min_stock DECIMAL(15, 2) DEFAULT 0,
  avg_cost DECIMAL(15, 2) DEFAULT 0,
  last_purchase_price DECIMAL(15, 2),
  last_purchase_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 13. STOCK MOVEMENTS (Movimentações de Estoque)
-- =====================================================
CREATE TABLE IF NOT EXISTS stock_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id UUID REFERENCES stock_items(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  quantity DECIMAL(15, 2) NOT NULL,
  unit_price DECIMAL(15, 2) NOT NULL,
  total_value DECIMAL(15, 2) NOT NULL,
  operation_id UUID REFERENCES operations(id),
  supplier_id UUID REFERENCES suppliers(id),
  invoice_number TEXT,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  notes TEXT,
  created_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 14. PURCHASE ORDERS (Ordens de Compra)
-- =====================================================
CREATE TABLE IF NOT EXISTS purchase_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  supplier_id UUID REFERENCES suppliers(id),
  operation_id UUID REFERENCES operations(id),
  total_value DECIMAL(15, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  requested_by TEXT NOT NULL,
  approved_by TEXT,
  request_date TIMESTAMP WITH TIME ZONE NOT NULL,
  expected_delivery_date TIMESTAMP WITH TIME ZONE,
  actual_delivery_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 15. PURCHASE ORDER ITEMS
-- =====================================================
CREATE TABLE IF NOT EXISTS purchase_order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  purchase_order_id UUID REFERENCES purchase_orders(id) ON DELETE CASCADE,
  item_id UUID REFERENCES stock_items(id),
  quantity DECIMAL(15, 2) NOT NULL,
  unit_price DECIMAL(15, 2) NOT NULL,
  total_price DECIMAL(15, 2) NOT NULL,
  received_quantity DECIMAL(15, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 16. ASSETS (Patrimônio)
-- =====================================================
CREATE TABLE IF NOT EXISTS assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  operation_id UUID REFERENCES operations(id),
  purchase_date TIMESTAMP WITH TIME ZONE NOT NULL,
  purchase_value DECIMAL(15, 2) NOT NULL,
  current_value DECIMAL(15, 2) NOT NULL,
  depreciation_rate DECIMAL(5, 2),
  brand TEXT,
  model TEXT,
  serial_number TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 17. BANK ACCOUNTS (Contas Bancárias)
-- =====================================================
CREATE TABLE IF NOT EXISTS bank_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  bank TEXT,
  account_number TEXT,
  type TEXT NOT NULL,
  initial_balance DECIMAL(15, 2) DEFAULT 0,
  current_balance DECIMAL(15, 2) DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 18. TEAM MEMBERS (Membros da Equipe)
-- =====================================================
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  cpf TEXT,
  phone TEXT,
  role TEXT NOT NULL,
  permissions JSONB,
  farm_ids UUID[],
  operation_ids UUID[],
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 19. FISCAL ISSUERS (Emitentes Fiscais)
-- =====================================================
CREATE TABLE IF NOT EXISTS fiscal_issuers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  cpf_cnpj TEXT NOT NULL,
  state_registration TEXT,
  municipal_registration TEXT,
  crt TEXT NOT NULL,
  address TEXT NOT NULL,
  number TEXT NOT NULL,
  complement TEXT,
  district TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  ibge_code TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  certificate_expires_at TIMESTAMP WITH TIME ZONE,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 20. FISCAL RECIPIENTS (Destinatários Fiscais)
-- =====================================================
CREATE TABLE IF NOT EXISTS fiscal_recipients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  cpf_cnpj TEXT NOT NULL,
  state_registration TEXT,
  address TEXT NOT NULL,
  number TEXT NOT NULL,
  complement TEXT,
  district TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  ibge_code TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  authorized_third_parties TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 21. FISCAL OPERATION TEMPLATES
-- =====================================================
CREATE TABLE IF NOT EXISTS fiscal_operation_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  nature TEXT NOT NULL,
  cfop TEXT NOT NULL,
  type TEXT NOT NULL,
  finalidade TEXT NOT NULL,
  cst_icms_padrao TEXT,
  csosn_padrao TEXT,
  automatic_text TEXT,
  future_exit BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 22. FISCAL PRODUCTS
-- =====================================================
CREATE TABLE IF NOT EXISTS fiscal_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  ncm TEXT NOT NULL,
  cest TEXT,
  unit TEXT NOT NULL,
  ean TEXT,
  cfop TEXT NOT NULL,
  cst_icms TEXT,
  csosn TEXT,
  cst_pis TEXT,
  cst_cofins TEXT,
  icms_aliquot DECIMAL(5, 2),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 23. NFe (Notas Fiscais Eletrônicas)
-- =====================================================
CREATE TABLE IF NOT EXISTS nfes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  number INTEGER,
  series INTEGER,
  issuer_id UUID REFERENCES fiscal_issuers(id),
  recipient_id UUID REFERENCES fiscal_recipients(id),
  operation_template_id UUID REFERENCES fiscal_operation_templates(id),
  nature TEXT NOT NULL,
  cfop TEXT NOT NULL,
  type TEXT NOT NULL,
  issue_date TIMESTAMP WITH TIME ZONE NOT NULL,
  exit_date TIMESTAMP WITH TIME ZONE,
  items JSONB NOT NULL,
  transport JSONB NOT NULL,
  payment JSONB NOT NULL,
  funrural JSONB,
  products_value DECIMAL(15, 2) NOT NULL,
  freight_value DECIMAL(15, 2) DEFAULT 0,
  insurance_value DECIMAL(15, 2) DEFAULT 0,
  other_expenses DECIMAL(15, 2) DEFAULT 0,
  discount DECIMAL(15, 2) DEFAULT 0,
  total_value DECIMAL(15, 2) NOT NULL,
  icms_base DECIMAL(15, 2) DEFAULT 0,
  icms_value DECIMAL(15, 2) DEFAULT 0,
  additional_info TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  access_key TEXT,
  protocol TEXT,
  xml_url TEXT,
  danfe_url TEXT,
  created_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  authorized_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancellation_reason TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 24. MDFe (Manifesto Eletrônico)
-- =====================================================
CREATE TABLE IF NOT EXISTS mdfes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  number INTEGER,
  series INTEGER,
  issuer_id UUID REFERENCES fiscal_issuers(id),
  nfe_ids UUID[],
  status TEXT NOT NULL DEFAULT 'draft',
  vehicle_plate TEXT NOT NULL,
  vehicle_state TEXT NOT NULL,
  driver_cpf TEXT NOT NULL,
  driver_name TEXT NOT NULL,
  origin_city TEXT NOT NULL,
  origin_state TEXT NOT NULL,
  destination_city TEXT NOT NULL,
  destination_state TEXT NOT NULL,
  issue_date TIMESTAMP WITH TIME ZONE NOT NULL,
  access_key TEXT,
  protocol TEXT,
  created_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 25. ATTACHMENTS (Anexos)
-- =====================================================
CREATE TABLE IF NOT EXISTS attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  related_id UUID NOT NULL,
  related_type TEXT NOT NULL,
  type TEXT NOT NULL,
  uri TEXT NOT NULL,
  name TEXT NOT NULL,
  size INTEGER,
  uploaded_by TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 26. DIVERGENCES (Divergências)
-- =====================================================
CREATE TABLE IF NOT EXISTS divergences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  expense_id UUID REFERENCES expenses(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  expected_value DECIMAL(15, 2) NOT NULL,
  charged_value DECIMAL(15, 2) NOT NULL,
  evidence TEXT,
  responsible TEXT,
  deadline TIMESTAMP WITH TIME ZONE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 27. MONTH CLOSINGS (Fechamentos Mensais)
-- =====================================================
CREATE TABLE IF NOT EXISTS month_closings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  month TEXT NOT NULL,
  year INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  closed_by TEXT,
  closed_at TIMESTAMP WITH TIME ZONE,
  checklist JSONB,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 28. FIELDS (Talhões/Campos)
-- =====================================================
CREATE TABLE IF NOT EXISTS fields (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
  area DECIMAL(15, 2) NOT NULL,
  unit TEXT NOT NULL DEFAULT 'ha',
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  soil_type TEXT,
  current_crop TEXT,
  active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 29. SEASONS (Safras/Temporadas)
-- =====================================================
CREATE TABLE IF NOT EXISTS seasons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  field_id UUID REFERENCES fields(id) ON DELETE CASCADE,
  crop TEXT NOT NULL,
  planting_date TIMESTAMP WITH TIME ZONE NOT NULL,
  expected_harvest_date TIMESTAMP WITH TIME ZONE NOT NULL,
  actual_harvest_date TIMESTAMP WITH TIME ZONE,
  area DECIMAL(15, 2) NOT NULL,
  expected_yield DECIMAL(15, 2) NOT NULL,
  actual_yield DECIMAL(15, 2),
  yield_unit TEXT NOT NULL,
  budgeted_cost DECIMAL(15, 2) DEFAULT 0,
  actual_cost DECIMAL(15, 2) DEFAULT 0,
  budgeted_revenue DECIMAL(15, 2) DEFAULT 0,
  actual_revenue DECIMAL(15, 2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'planning',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 30. SEASON COSTS (Custos por Safra)
-- =====================================================
CREATE TABLE IF NOT EXISTS season_costs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  season_id UUID REFERENCES seasons(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  budgeted DECIMAL(15, 2) DEFAULT 0,
  actual DECIMAL(15, 2) DEFAULT 0,
  date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 31. BARTER CONTRACTS (Contratos de Troca)
-- =====================================================
CREATE TABLE IF NOT EXISTS barter_contracts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  supplier_id UUID REFERENCES suppliers(id),
  client_id UUID REFERENCES clients(id),
  operation_id UUID REFERENCES operations(id),
  input_product TEXT NOT NULL,
  input_quantity DECIMAL(15, 2) NOT NULL,
  input_unit TEXT NOT NULL,
  input_unit_value DECIMAL(15, 2) NOT NULL,
  output_product TEXT NOT NULL,
  output_quantity DECIMAL(15, 2) NOT NULL,
  output_unit TEXT NOT NULL,
  output_unit_value DECIMAL(15, 2) NOT NULL,
  exchange_rate DECIMAL(15, 6) NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  settlement_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  settled_input_quantity DECIMAL(15, 2) DEFAULT 0,
  settled_output_quantity DECIMAL(15, 2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 32. LEASE CONTRACTS (Contratos de Arrendamento)
-- =====================================================
CREATE TABLE IF NOT EXISTS lease_contracts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  lessor_name TEXT NOT NULL,
  lessor_cpf_cnpj TEXT NOT NULL,
  field_id UUID REFERENCES fields(id),
  area DECIMAL(15, 2) NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  payment_type TEXT NOT NULL,
  fixed_cash_value DECIMAL(15, 2),
  fixed_product_quantity DECIMAL(15, 2),
  fixed_product_unit TEXT,
  percentage_value DECIMAL(5, 2),
  partnership_share DECIMAL(5, 2),
  payment_frequency TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 33. LEASE PAYMENTS (Pagamentos de Arrendamento)
-- =====================================================
CREATE TABLE IF NOT EXISTS lease_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  lease_id UUID REFERENCES lease_contracts(id) ON DELETE CASCADE,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  paid_date TIMESTAMP WITH TIME ZONE,
  value DECIMAL(15, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 34. FORECASTS (Projeções Financeiras)
-- =====================================================
CREATE TABLE IF NOT EXISTS forecasts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  projected_revenue DECIMAL(15, 2) DEFAULT 0,
  projected_expenses DECIMAL(15, 2) DEFAULT 0,
  projected_cash_flow JSONB,
  assumptions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 35. FINANCIAL STATEMENTS (Demonstrativos Financeiros)
-- =====================================================
CREATE TABLE IF NOT EXISTS financial_statements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  operation_id UUID REFERENCES operations(id),
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 36. ASSET DEPRECIATIONS (Depreciação de Ativos)
-- =====================================================
CREATE TABLE IF NOT EXISTS asset_depreciations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
  method TEXT NOT NULL,
  useful_life INTEGER NOT NULL,
  residual_value DECIMAL(15, 2) DEFAULT 0,
  depreciation_rate DECIMAL(5, 2) NOT NULL,
  monthly_depreciation DECIMAL(15, 2) NOT NULL,
  accumulated_depreciation DECIMAL(15, 2) DEFAULT 0,
  current_book_value DECIMAL(15, 2) NOT NULL,
  last_calculation_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 37. USER SUBSCRIPTIONS (Assinaturas - do Custo Operacional)
-- =====================================================
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  plan_id TEXT NOT NULL DEFAULT 'free',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- =====================================================
ALTER TABLE farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE sectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenues ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE fiscal_issuers ENABLE ROW LEVEL SECURITY;
ALTER TABLE fiscal_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE fiscal_operation_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE fiscal_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE nfes ENABLE ROW LEVEL SECURITY;
ALTER TABLE mdfes ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE divergences ENABLE ROW LEVEL SECURITY;
ALTER TABLE month_closings ENABLE ROW LEVEL SECURITY;
ALTER TABLE fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE season_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE barter_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE lease_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE lease_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_statements ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_depreciations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLÍTICAS DE SEGURANÇA (Baseadas em user_id)
-- Cada usuário só acessa seus próprios dados
-- =====================================================

-- Farms
CREATE POLICY "Users can view own farms" ON farms FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own farms" ON farms FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own farms" ON farms FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own farms" ON farms FOR DELETE USING (auth.uid() = user_id);

-- Sectors
CREATE POLICY "Users can view own sectors" ON sectors FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sectors" ON sectors FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sectors" ON sectors FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own sectors" ON sectors FOR DELETE USING (auth.uid() = user_id);

-- Operations
CREATE POLICY "Users can view own operations" ON operations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own operations" ON operations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own operations" ON operations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own operations" ON operations FOR DELETE USING (auth.uid() = user_id);

-- Suppliers
CREATE POLICY "Users can view own suppliers" ON suppliers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own suppliers" ON suppliers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own suppliers" ON suppliers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own suppliers" ON suppliers FOR DELETE USING (auth.uid() = user_id);

-- Clients
CREATE POLICY "Users can view own clients" ON clients FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own clients" ON clients FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own clients" ON clients FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own clients" ON clients FOR DELETE USING (auth.uid() = user_id);

-- Categories
CREATE POLICY "Users can view own categories" ON categories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own categories" ON categories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own categories" ON categories FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own categories" ON categories FOR DELETE USING (auth.uid() = user_id);

-- Cost Centers
CREATE POLICY "Users can view own cost_centers" ON cost_centers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own cost_centers" ON cost_centers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own cost_centers" ON cost_centers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own cost_centers" ON cost_centers FOR DELETE USING (auth.uid() = user_id);

-- Expenses
CREATE POLICY "Users can view own expenses" ON expenses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own expenses" ON expenses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own expenses" ON expenses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own expenses" ON expenses FOR DELETE USING (auth.uid() = user_id);

-- Revenues
CREATE POLICY "Users can view own revenues" ON revenues FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own revenues" ON revenues FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own revenues" ON revenues FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own revenues" ON revenues FOR DELETE USING (auth.uid() = user_id);

-- Contracts
CREATE POLICY "Users can view own contracts" ON contracts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own contracts" ON contracts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own contracts" ON contracts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own contracts" ON contracts FOR DELETE USING (auth.uid() = user_id);

-- Stock Items
CREATE POLICY "Users can view own stock_items" ON stock_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own stock_items" ON stock_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own stock_items" ON stock_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own stock_items" ON stock_items FOR DELETE USING (auth.uid() = user_id);

-- Stock Movements
CREATE POLICY "Users can view own stock_movements" ON stock_movements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own stock_movements" ON stock_movements FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own stock_movements" ON stock_movements FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own stock_movements" ON stock_movements FOR DELETE USING (auth.uid() = user_id);

-- Purchase Orders
CREATE POLICY "Users can view own purchase_orders" ON purchase_orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own purchase_orders" ON purchase_orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own purchase_orders" ON purchase_orders FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own purchase_orders" ON purchase_orders FOR DELETE USING (auth.uid() = user_id);

-- Purchase Order Items
CREATE POLICY "Users can view own purchase_order_items" ON purchase_order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM purchase_orders WHERE purchase_orders.id = purchase_order_items.purchase_order_id AND purchase_orders.user_id = auth.uid())
);
CREATE POLICY "Users can insert own purchase_order_items" ON purchase_order_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM purchase_orders WHERE purchase_orders.id = purchase_order_items.purchase_order_id AND purchase_orders.user_id = auth.uid())
);
CREATE POLICY "Users can update own purchase_order_items" ON purchase_order_items FOR UPDATE USING (
  EXISTS (SELECT 1 FROM purchase_orders WHERE purchase_orders.id = purchase_order_items.purchase_order_id AND purchase_orders.user_id = auth.uid())
);
CREATE POLICY "Users can delete own purchase_order_items" ON purchase_order_items FOR DELETE USING (
  EXISTS (SELECT 1 FROM purchase_orders WHERE purchase_orders.id = purchase_order_items.purchase_order_id AND purchase_orders.user_id = auth.uid())
);

-- Assets
CREATE POLICY "Users can view own assets" ON assets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own assets" ON assets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own assets" ON assets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own assets" ON assets FOR DELETE USING (auth.uid() = user_id);

-- Bank Accounts
CREATE POLICY "Users can view own bank_accounts" ON bank_accounts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own bank_accounts" ON bank_accounts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own bank_accounts" ON bank_accounts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own bank_accounts" ON bank_accounts FOR DELETE USING (auth.uid() = user_id);

-- Team Members
CREATE POLICY "Users can view own team_members" ON team_members FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own team_members" ON team_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own team_members" ON team_members FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own team_members" ON team_members FOR DELETE USING (auth.uid() = user_id);

-- Fiscal Issuers
CREATE POLICY "Users can view own fiscal_issuers" ON fiscal_issuers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own fiscal_issuers" ON fiscal_issuers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own fiscal_issuers" ON fiscal_issuers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own fiscal_issuers" ON fiscal_issuers FOR DELETE USING (auth.uid() = user_id);

-- Fiscal Recipients
CREATE POLICY "Users can view own fiscal_recipients" ON fiscal_recipients FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own fiscal_recipients" ON fiscal_recipients FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own fiscal_recipients" ON fiscal_recipients FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own fiscal_recipients" ON fiscal_recipients FOR DELETE USING (auth.uid() = user_id);

-- Fiscal Operation Templates
CREATE POLICY "Users can view own fiscal_operation_templates" ON fiscal_operation_templates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own fiscal_operation_templates" ON fiscal_operation_templates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own fiscal_operation_templates" ON fiscal_operation_templates FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own fiscal_operation_templates" ON fiscal_operation_templates FOR DELETE USING (auth.uid() = user_id);

-- Fiscal Products
CREATE POLICY "Users can view own fiscal_products" ON fiscal_products FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own fiscal_products" ON fiscal_products FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own fiscal_products" ON fiscal_products FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own fiscal_products" ON fiscal_products FOR DELETE USING (auth.uid() = user_id);

-- NFes
CREATE POLICY "Users can view own nfes" ON nfes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own nfes" ON nfes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own nfes" ON nfes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own nfes" ON nfes FOR DELETE USING (auth.uid() = user_id);

-- MDFes
CREATE POLICY "Users can view own mdfes" ON mdfes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own mdfes" ON mdfes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own mdfes" ON mdfes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own mdfes" ON mdfes FOR DELETE USING (auth.uid() = user_id);

-- Attachments
CREATE POLICY "Users can view own attachments" ON attachments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own attachments" ON attachments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own attachments" ON attachments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own attachments" ON attachments FOR DELETE USING (auth.uid() = user_id);

-- Divergences
CREATE POLICY "Users can view own divergences" ON divergences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own divergences" ON divergences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own divergences" ON divergences FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own divergences" ON divergences FOR DELETE USING (auth.uid() = user_id);

-- Month Closings
CREATE POLICY "Users can view own month_closings" ON month_closings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own month_closings" ON month_closings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own month_closings" ON month_closings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own month_closings" ON month_closings FOR DELETE USING (auth.uid() = user_id);

-- Fields
CREATE POLICY "Users can view own fields" ON fields FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own fields" ON fields FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own fields" ON fields FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own fields" ON fields FOR DELETE USING (auth.uid() = user_id);

-- Seasons
CREATE POLICY "Users can view own seasons" ON seasons FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own seasons" ON seasons FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own seasons" ON seasons FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own seasons" ON seasons FOR DELETE USING (auth.uid() = user_id);

-- Season Costs
CREATE POLICY "Users can view own season_costs" ON season_costs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own season_costs" ON season_costs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own season_costs" ON season_costs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own season_costs" ON season_costs FOR DELETE USING (auth.uid() = user_id);

-- Barter Contracts
CREATE POLICY "Users can view own barter_contracts" ON barter_contracts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own barter_contracts" ON barter_contracts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own barter_contracts" ON barter_contracts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own barter_contracts" ON barter_contracts FOR DELETE USING (auth.uid() = user_id);

-- Lease Contracts
CREATE POLICY "Users can view own lease_contracts" ON lease_contracts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own lease_contracts" ON lease_contracts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own lease_contracts" ON lease_contracts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own lease_contracts" ON lease_contracts FOR DELETE USING (auth.uid() = user_id);

-- Lease Payments
CREATE POLICY "Users can view own lease_payments" ON lease_payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own lease_payments" ON lease_payments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own lease_payments" ON lease_payments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own lease_payments" ON lease_payments FOR DELETE USING (auth.uid() = user_id);

-- Forecasts
CREATE POLICY "Users can view own forecasts" ON forecasts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own forecasts" ON forecasts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own forecasts" ON forecasts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own forecasts" ON forecasts FOR DELETE USING (auth.uid() = user_id);

-- Financial Statements
CREATE POLICY "Users can view own financial_statements" ON financial_statements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own financial_statements" ON financial_statements FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own financial_statements" ON financial_statements FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own financial_statements" ON financial_statements FOR DELETE USING (auth.uid() = user_id);

-- Asset Depreciations
CREATE POLICY "Users can view own asset_depreciations" ON asset_depreciations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own asset_depreciations" ON asset_depreciations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own asset_depreciations" ON asset_depreciations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own asset_depreciations" ON asset_depreciations FOR DELETE USING (auth.uid() = user_id);

-- User Subscriptions
CREATE POLICY "Users can view own subscription" ON user_subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own subscription" ON user_subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own subscription" ON user_subscriptions FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- CREATE INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX idx_farms_user_id ON farms(user_id);
CREATE INDEX idx_sectors_user_id ON sectors(user_id);
CREATE INDEX idx_sectors_farm_id ON sectors(farm_id);
CREATE INDEX idx_operations_user_id ON operations(user_id);
CREATE INDEX idx_operations_farm_id ON operations(farm_id);
CREATE INDEX idx_operations_sector_id ON operations(sector_id);
CREATE INDEX idx_suppliers_user_id ON suppliers(user_id);
CREATE INDEX idx_clients_user_id ON clients(user_id);
CREATE INDEX idx_categories_user_id ON categories(user_id);
CREATE INDEX idx_cost_centers_user_id ON cost_centers(user_id);
CREATE INDEX idx_expenses_user_id ON expenses(user_id);
CREATE INDEX idx_expenses_operation_id ON expenses(operation_id);
CREATE INDEX idx_expenses_supplier_id ON expenses(supplier_id);
CREATE INDEX idx_expenses_status ON expenses(status);
CREATE INDEX idx_expenses_due_date ON expenses(due_date);
CREATE INDEX idx_revenues_user_id ON revenues(user_id);
CREATE INDEX idx_revenues_client_id ON revenues(client_id);
CREATE INDEX idx_revenues_operation_id ON revenues(operation_id);
CREATE INDEX idx_revenues_status ON revenues(status);
CREATE INDEX idx_contracts_user_id ON contracts(user_id);
CREATE INDEX idx_stock_items_user_id ON stock_items(user_id);
CREATE INDEX idx_stock_movements_user_id ON stock_movements(user_id);
CREATE INDEX idx_stock_movements_item_id ON stock_movements(item_id);
CREATE INDEX idx_purchase_orders_user_id ON purchase_orders(user_id);
CREATE INDEX idx_assets_user_id ON assets(user_id);
CREATE INDEX idx_bank_accounts_user_id ON bank_accounts(user_id);
CREATE INDEX idx_team_members_user_id ON team_members(user_id);
CREATE INDEX idx_nfes_user_id ON nfes(user_id);
CREATE INDEX idx_nfes_issuer_id ON nfes(issuer_id);
CREATE INDEX idx_nfes_status ON nfes(status);
CREATE INDEX idx_attachments_user_id ON attachments(user_id);
CREATE INDEX idx_attachments_related ON attachments(related_id, related_type);
CREATE INDEX idx_fields_user_id ON fields(user_id);
CREATE INDEX idx_fields_farm_id ON fields(farm_id);
CREATE INDEX idx_seasons_user_id ON seasons(user_id);
CREATE INDEX idx_seasons_field_id ON seasons(field_id);
CREATE INDEX idx_seasons_status ON seasons(status);
CREATE INDEX idx_season_costs_user_id ON season_costs(user_id);
CREATE INDEX idx_season_costs_season_id ON season_costs(season_id);
CREATE INDEX idx_barter_contracts_user_id ON barter_contracts(user_id);
CREATE INDEX idx_barter_contracts_status ON barter_contracts(status);
CREATE INDEX idx_lease_contracts_user_id ON lease_contracts(user_id);
CREATE INDEX idx_lease_contracts_field_id ON lease_contracts(field_id);
CREATE INDEX idx_lease_contracts_status ON lease_contracts(status);
CREATE INDEX idx_lease_payments_user_id ON lease_payments(user_id);
CREATE INDEX idx_lease_payments_lease_id ON lease_payments(lease_id);
CREATE INDEX idx_forecasts_user_id ON forecasts(user_id);
CREATE INDEX idx_financial_statements_user_id ON financial_statements(user_id);
CREATE INDEX idx_asset_depreciations_user_id ON asset_depreciations(user_id);
CREATE INDEX idx_asset_depreciations_asset_id ON asset_depreciations(asset_id);
CREATE INDEX idx_user_subscriptions_user_id ON user_subscriptions(user_id);

-- =====================================================
-- FUNÇÕES E TRIGGERS
-- =====================================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_farms_updated_at BEFORE UPDATE ON farms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sectors_updated_at BEFORE UPDATE ON sectors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_operations_updated_at BEFORE UPDATE ON operations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_revenues_updated_at BEFORE UPDATE ON revenues FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON contracts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_stock_items_updated_at BEFORE UPDATE ON stock_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_purchase_orders_updated_at BEFORE UPDATE ON purchase_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON assets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bank_accounts_updated_at BEFORE UPDATE ON bank_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_team_members_updated_at BEFORE UPDATE ON team_members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_fiscal_issuers_updated_at BEFORE UPDATE ON fiscal_issuers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_fiscal_recipients_updated_at BEFORE UPDATE ON fiscal_recipients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_fiscal_products_updated_at BEFORE UPDATE ON fiscal_products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_nfes_updated_at BEFORE UPDATE ON nfes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mdfes_updated_at BEFORE UPDATE ON mdfes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_month_closings_updated_at BEFORE UPDATE ON month_closings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_fields_updated_at BEFORE UPDATE ON fields FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_seasons_updated_at BEFORE UPDATE ON seasons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_barter_contracts_updated_at BEFORE UPDATE ON barter_contracts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lease_contracts_updated_at BEFORE UPDATE ON lease_contracts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_forecasts_updated_at BEFORE UPDATE ON forecasts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_asset_depreciations_updated_at BEFORE UPDATE ON asset_depreciations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_subscriptions_updated_at BEFORE UPDATE ON user_subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
