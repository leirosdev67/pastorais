/**
 * Script de Migração — PASTORAIS
 * 
 * Importa os dados existentes de `src/data/pastorais.json` e as imagens
 * de `public/images/` e `public/uploads/` para o Supabase (DB + Storage).
 * 
 * Uso:
 *   1. Preencha as variáveis em .env.local
 *   2. Execute o SQL de setup.sql no Supabase Dashboard
 *   3. Rode: node scripts/migrate.mjs
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

// --- Load .env.local manually (no dotenv dependency needed) ---
async function loadEnv() {
  try {
    const envContent = await fs.readFile(path.join(ROOT, '.env.local'), 'utf-8');
    const env = {};
    for (const line of envContent.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const [key, ...valueParts] = trimmed.split('=');
      env[key.trim()] = valueParts.join('=').trim();
    }
    return env;
  } catch {
    console.error('❌ Não encontrei o arquivo .env.local. Crie-o com as credenciais do Supabase.');
    process.exit(1);
  }
}

async function main() {
  console.log('🚀 Iniciando migração dos dados para o Supabase...\n');

  const env = await loadEnv();
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || supabaseUrl === 'SUA_URL_AQUI' || !supabaseKey || supabaseKey === 'SUA_ANON_KEY_AQUI') {
    console.error('❌ Configure as credenciais do Supabase no arquivo .env.local');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // 1. Read existing data
  const dataPath = path.join(ROOT, 'src', 'data', 'pastorais.json');
  let pastorais;
  try {
    const raw = await fs.readFile(dataPath, 'utf-8');
    pastorais = JSON.parse(raw);
    console.log(`📋 Encontradas ${pastorais.length} pastorais no arquivo JSON.\n`);
  } catch {
    console.error('❌ Não consegui ler src/data/pastorais.json');
    process.exit(1);
  }

  // 2. Upload images and build new records
  const migratedRecords = [];

  for (const pastoral of pastorais) {
    console.log(`📌 Processando: ${pastoral.name}`);

    let newImageUrl = pastoral.image || '';
    let newLogoUrl = pastoral.logo || '';

    // Upload cover image if it's a local path
    if (pastoral.image && (pastoral.image.startsWith('/images/') || pastoral.image.startsWith('/uploads/'))) {
      const localPath = path.join(ROOT, 'public', pastoral.image);
      try {
        const fileBuffer = await fs.readFile(localPath);
        const ext = path.extname(pastoral.image);
        const fileName = `migrated_img_${pastoral.id}${ext}`;

        const { data, error } = await supabase.storage
          .from('pastorais-images')
          .upload(fileName, fileBuffer, {
            contentType: ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg',
            upsert: true,
          });

        if (error) {
          console.warn(`  ⚠️  Erro no upload da imagem: ${error.message}`);
        } else {
          const { data: urlData } = supabase.storage
            .from('pastorais-images')
            .getPublicUrl(data.path);
          newImageUrl = urlData.publicUrl;
          console.log(`  ✅ Imagem enviada: ${fileName}`);
        }
      } catch (err) {
        console.warn(`  ⚠️  Imagem não encontrada localmente: ${pastoral.image}`);
      }
    }

    // Upload logo if it's a local path
    if (pastoral.logo && (pastoral.logo.startsWith('/images/') || pastoral.logo.startsWith('/uploads/'))) {
      const localPath = path.join(ROOT, 'public', pastoral.logo);
      try {
        const fileBuffer = await fs.readFile(localPath);
        const ext = path.extname(pastoral.logo);
        const fileName = `migrated_logo_${pastoral.id}${ext}`;

        const { data, error } = await supabase.storage
          .from('pastorais-images')
          .upload(fileName, fileBuffer, {
            contentType: ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg',
            upsert: true,
          });

        if (error) {
          console.warn(`  ⚠️  Erro no upload do logo: ${error.message}`);
        } else {
          const { data: urlData } = supabase.storage
            .from('pastorais-images')
            .getPublicUrl(data.path);
          newLogoUrl = urlData.publicUrl;
          console.log(`  ✅ Logo enviado: ${fileName}`);
        }
      } catch (err) {
        console.warn(`  ⚠️  Logo não encontrado localmente: ${pastoral.logo}`);
      }
    }

    migratedRecords.push({
      id: pastoral.id,
      name: pastoral.name,
      category: pastoral.category || 'Geral',
      description: pastoral.description || '',
      coordinators: pastoral.coordinators || '',
      contact: pastoral.contact || '',
      image: newImageUrl,
      logo: newLogoUrl,
    });
  }

  // 3. Insert records into the database
  console.log(`\n💾 Inserindo ${migratedRecords.length} registros no banco de dados...`);

  const { data: inserted, error: insertError } = await supabase
    .from('pastorais')
    .upsert(migratedRecords, { onConflict: 'id' })
    .select();

  if (insertError) {
    console.error('❌ Erro ao inserir no banco:', insertError.message);
    process.exit(1);
  }

  console.log(`✅ ${inserted.length} pastorais migradas com sucesso!\n`);
  console.log('🎉 Migração concluída! Verifique no Supabase Dashboard.');
}

main().catch((err) => {
  console.error('❌ Erro fatal:', err);
  process.exit(1);
});
