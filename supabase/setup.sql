-- =====================================================
-- PASTORAIS — Setup do Banco de Dados no Supabase
-- =====================================================
-- Execute este SQL no SQL Editor do Supabase Dashboard
-- (https://supabase.com → seu projeto → SQL Editor)
-- =====================================================

-- 1. Criar a tabela de pastorais
CREATE TABLE IF NOT EXISTS pastorais (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  category TEXT DEFAULT 'Geral',
  description TEXT DEFAULT '',
  coordinators TEXT DEFAULT '',
  contact TEXT DEFAULT '',
  image TEXT DEFAULT '',
  logo TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Habilitar Row Level Security
ALTER TABLE pastorais ENABLE ROW LEVEL SECURITY;

-- 3. Política: leitura pública (qualquer um pode ver as pastorais)
CREATE POLICY "Leitura pública de pastorais"
  ON pastorais
  FOR SELECT
  USING (true);

-- 4. Política: escrita via anon key (para o painel admin funcionar sem autenticação)
-- NOTA: Em produção com autenticação, troque por `auth.role() = 'authenticated'`
CREATE POLICY "Escrita via anon key"
  ON pastorais
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Atualização via anon key"
  ON pastorais
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Exclusão via anon key"
  ON pastorais
  FOR DELETE
  USING (true);

-- =====================================================
-- STORAGE: Criar bucket para imagens
-- =====================================================
-- Faça isso manualmente no Supabase Dashboard:
-- 1. Vá em Storage → New Bucket
-- 2. Nome: "pastorais-images"
-- 3. Marque como "Public bucket"
--
-- Ou execute via SQL:
INSERT INTO storage.buckets (id, name, public)
VALUES ('pastorais-images', 'pastorais-images', true)
ON CONFLICT (id) DO NOTHING;

-- Política de leitura pública no bucket
CREATE POLICY "Leitura pública de imagens"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'pastorais-images');

-- Política de upload via anon key
CREATE POLICY "Upload de imagens"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'pastorais-images');

-- Política de exclusão de imagens
CREATE POLICY "Exclusão de imagens"
  ON storage.objects
  FOR DELETE
  USING (bucket_id = 'pastorais-images');
