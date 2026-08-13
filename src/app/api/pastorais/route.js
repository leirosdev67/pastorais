import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'src', 'data', 'pastorais.json');
const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');

// Helper to read database
async function readDb() {
  try {
    const data = await fs.readFile(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

// Helper to write database
async function writeDb(data) {
  await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

// GET - List all pastorals
export async function GET() {
  const pastorais = await readDb();
  return NextResponse.json(pastorais);
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
    const imageFile = formData.get('image'); // Can be File object or existing string path
    const logoFile = formData.get('logo'); // Can be File or existing string path

    if (!name) {
      return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 });
    }

    let imageUrl = '';
    
    // Check if a new cover image file was uploaded
    if (imageFile && typeof imageFile !== 'string' && imageFile.name) {
      // Ensure uploads directory exists
      await fs.mkdir(UPLOADS_DIR, { recursive: true });
      
      const fileExtension = path.extname(imageFile.name);
      const fileName = `${Date.now()}_img_${Math.random().toString(36).substring(2, 9)}${fileExtension}`;
      const filePath = path.join(UPLOADS_DIR, fileName);
      
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      await fs.writeFile(filePath, buffer);
      
      imageUrl = `/uploads/${fileName}`;
    } else if (typeof imageFile === 'string') {
      // Keep existing image URL
      imageUrl = imageFile;
    }

    let logoUrl = '';
    
    // Check if a new logo file was uploaded
    if (logoFile && typeof logoFile !== 'string' && logoFile.name) {
      // Ensure uploads directory exists
      await fs.mkdir(UPLOADS_DIR, { recursive: true });
      
      const fileExtension = path.extname(logoFile.name);
      const fileName = `${Date.now()}_logo_${Math.random().toString(36).substring(2, 9)}${fileExtension}`;
      const filePath = path.join(UPLOADS_DIR, fileName);
      
      const buffer = Buffer.from(await logoFile.arrayBuffer());
      await fs.writeFile(filePath, buffer);
      
      logoUrl = `/uploads/${fileName}`;
    } else if (typeof logoFile === 'string') {
      // Keep existing logo URL
      logoUrl = logoFile;
    }

    const pastorais = await readDb();

    if (id) {
      // Edit mode
      const index = pastorais.findIndex(p => p.id === id);
      if (index === -1) {
        return NextResponse.json({ error: 'Pastoral não encontrada' }, { status: 404 });
      }
      
      // Update entry
      pastorais[index] = {
        ...pastorais[index],
        name,
        category: category || 'Geral',
        description: description || '',
        coordinators: coordinators || '',
        contact: contact || '',
        image: imageUrl || pastorais[index].image,
        logo: logoUrl !== undefined ? logoUrl : pastorais[index].logo
      };
      
      await writeDb(pastorais);
      return NextResponse.json({ success: true, pastoral: pastorais[index] });
    } else {
      // Create mode
      const newPastoral = {
        id: Date.now().toString(),
        name,
        category: category || 'Geral',
        description: description || '',
        coordinators: coordinators || '',
        contact: contact || '',
        image: imageUrl || '/images/default.png', // fallback placeholder if empty
        logo: logoUrl || ''
      };
      
      pastorais.push(newPastoral);
      await writeDb(pastorais);
      return NextResponse.json({ success: true, pastoral: newPastoral });
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

    let pastorais = await readDb();
    const pastoral = pastorais.find(p => p.id === id);
    
    if (!pastoral) {
      return NextResponse.json({ error: 'Pastoral não encontrada' }, { status: 404 });
    }

    // Delete physical uploaded image file if it's in /uploads/
    if (pastoral.image && pastoral.image.startsWith('/uploads/')) {
      const filePath = path.join(process.cwd(), 'public', pastoral.image);
      try {
        await fs.unlink(filePath);
      } catch (err) {
        console.warn(`Could not delete image file: ${filePath}`, err);
      }
    }

    // Delete physical uploaded logo file if it's in /uploads/
    if (pastoral.logo && pastoral.logo.startsWith('/uploads/')) {
      const filePath = path.join(process.cwd(), 'public', pastoral.logo);
      try {
        await fs.unlink(filePath);
      } catch (err) {
        console.warn(`Could not delete logo file: ${filePath}`, err);
      }
    }

    pastorais = pastorais.filter(p => p.id !== id);
    await writeDb(pastorais);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro no servidor: ' + error.message }, { status: 500 });
  }
}
