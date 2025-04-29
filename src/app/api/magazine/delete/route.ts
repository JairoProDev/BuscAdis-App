import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function DELETE(request: Request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { message: 'URL es necesaria para eliminar la revista' },
        { status: 400 }
      );
    }

    // Get filename from URL
    const filename = url.split('/').pop();
    
    if (!filename) {
      return NextResponse.json(
        { message: 'No se pudo extraer el nombre del archivo de la URL' },
        { status: 400 }
      );
    }

    // Delete from storage
    const { error: storageError } = await supabase
      .storage
      .from('magazines')
      .remove([filename]);

    if (storageError) {
      console.error('Error deleting file from storage:', storageError);
      return NextResponse.json(
        { message: 'Error al eliminar el archivo de almacenamiento' },
        { status: 500 }
      );
    }

    // Delete magazine record from database
    const { error: dbError } = await supabase
      .from('magazines')
      .delete()
      .eq('pdf_url', url);

    if (dbError) {
      console.error('Error deleting magazine record:', dbError);
      return NextResponse.json(
        { message: 'Error al eliminar el registro de la revista de la base de datos' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Revista eliminada correctamente'
    });
  } catch (error) {
    console.error('Error deleting magazine:', error);
    return NextResponse.json(
      { message: 'Error al eliminar la revista', error: (error as Error).message },
      { status: 500 }
    );
  }
} 