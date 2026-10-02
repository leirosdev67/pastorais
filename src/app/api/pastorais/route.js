import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

// Helper: upload file to Supabase Storage and return public URL
async function uploadToStorage(file, prefix = 'img') {
  const fileExtension = file.name.split('.').pop();
  const fileName = `${Date.now()}_${prefix}_${Math.random().toString(36).substring(2, 9)}.${fileExtension}`;

  const buffer = Buffer.from(await file.arrayBuffer());

  const { data, error } = await supabase.storage
    .from('pastorais-images')
    .upload(fileName, buffer, {
      contentType: file.type || 'image/jpeg',
      upsert: false,
    });

  if (error) {
    console.error('Storage upload error:', error);
    if (error.message && (error.message.includes('not found') || error.message.includes('Bucket'))) {
      throw new Error('O bucket "pastorais-images" não foi criado no Supabase Storage. Crie o bucket público "pastorais-images" no painel do Supabase.');
    }
    throw new Error('Erro ao fazer upload da imagem: ' + error.message);
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('pastorais-images')
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}

// Helper: delete file from Supabase Storage
async function deleteFromStorage(publicUrl) {
  if (!publicUrl) return;

  try {
    // Extract the file path from the public URL
    // URL format: https://<project>.supabase.co/storage/v1/object/public/pastorais-images/<filename>
    const urlParts = publicUrl.split('/pastorais-images/');
    if (urlParts.length < 2) return;

    const filePath = urlParts[1];
    await supabase.storage.from('pastorais-images').remove([filePath]);
  } catch (err) {
    console.warn('Could not delete file from storage:', err);
  }
}

// GET - List all pastorals
export async function GET() {
  const { data, error } = await supabase
    .from('pastorais')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('DB read error:', error);
    return NextResponse.json({ error: 'Erro ao buscar pastorais' }, { status: 500 });
  }

  return NextResponse.json(data || []);
}

// POST - Create or Update pastoral
export async function POST(request) {
  try {
    const formData = await request.formData();
    const id = formData.get('id');
    const name = formData.get('name');
    const category = formData.get('category');
    const description = formData.get('description');
    const coordinators = formData.get('coordinators');
    const contact = formData.get('contact');
    const imageFile = formData.get('image');
    const logoFile = formData.get('logo');

    if (!name) {
      return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 });
    }

    // Handle cover image
    let imageUrl = '';
    if (imageFile && typeof imageFile !== 'string' && imageFile.name && imageFile.size > 0) {
      imageUrl = await uploadToStorage(imageFile, 'img');
    } else if (typeof imageFile === 'string') {
      imageUrl = imageFile;
    }

    // Handle logo
    let logoUrl = '';
    if (logoFile && typeof logoFile !== 'string' && logoFile.name && logoFile.size > 0) {
      logoUrl = await uploadToStorage(logoFile, 'logo');
    } else if (typeof logoFile === 'string') {
      logoUrl = logoFile;
    }

    if (id) {
      // --- EDIT MODE ---
      // Fetch existing record to preserve unchanged fields
      const { data: existing, error: fetchError } = await supabase
        .from('pastorais')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError || !existing) {
        return NextResponse.json({ error: 'Pastoral não encontrada' }, { status: 404 });
      }

      const updateData = {
        name,
        category: category || 'Geral',
        description: description || '',
        coordinators: coordinators || '',
        contact: contact || '',
        image: imageUrl || existing.image,
        logo: logoUrl !== undefined ? logoUrl : existing.logo,
      };

      const { data: updated, error: updateError } = await supabase
        .from('pastorais')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        console.error('DB update error:', updateError);
        return NextResponse.json({ error: 'Erro ao atualizar pastoral' }, { status: 500 });
      }

      return NextResponse.json({ success: true, pastoral: updated });
    } else {
      // --- CREATE MODE ---
      const newPastoral = {
        id: Date.now().toString(),
        name,
        category: category || 'Geral',
        description: description || '',
        coordinators: coordinators || '',
        contact: contact || '',
        image: imageUrl || '',
        logo: logoUrl || '',
      };

      const { data: inserted, error: insertError } = await supabase
        .from('pastorais')
        .insert(newPastoral)
        .select()
        .single();

      if (insertError) {
        console.error('DB insert error:', insertError);
        return NextResponse.json({ error: 'Erro ao cadastrar pastoral' }, { status: 500 });
      }

      return NextResponse.json({ success: true, pastoral: inserted });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro no servidor: ' + error.message }, { status: 500 });
  }
}

// DELETE - Remove a pastoral
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 });
    }

    // Fetch pastoral to get image URLs before deleting
    const { data: pastoral, error: fetchError } = await supabase
      .from('pastorais')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !pastoral) {
      return NextResponse.json({ error: 'Pastoral não encontrada' }, { status: 404 });
    }

    // Delete images from storage (only if they are Supabase Storage URLs)
    if (pastoral.image && pastoral.image.includes('supabase')) {
      await deleteFromStorage(pastoral.image);
    }
    if (pastoral.logo && pastoral.logo.includes('supabase')) {
      await deleteFromStorage(pastoral.logo);
    }

    // Delete the database record
    const { error: deleteError } = await supabase
      .from('pastorais')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('DB delete error:', deleteError);
      return NextResponse.json({ error: 'Erro ao excluir pastoral' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro no servidor: ' + error.message }, { status: 500 });
  }
}
