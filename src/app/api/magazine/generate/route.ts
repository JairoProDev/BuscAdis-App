import { NextResponse } from 'next/server';
import { Publication } from '@/types/publications';
import { groupPublicationsByCategory } from '@/features/magazine/services/magazine.service';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { generatePdfMagazine } from '@/features/magazine/services/pdf-generator.service';

export async function POST(request: Request) {
  try {
    const { publications } = await request.json();

    if (!publications || !Array.isArray(publications) || publications.length === 0) {
      return NextResponse.json(
        { message: 'No hay publicaciones disponibles para generar la revista' },
        { status: 400 }
      );
    }

    // Group publications by category for better organization
    const groupedPublications = groupPublicationsByCategory(publications);

    // Generate PDF
    const pdfBuffer = await generatePdfMagazine(groupedPublications);
    
    // Create a unique filename
    const timestamp = format(new Date(), 'yyyyMMdd-HHmmss');
    const filename = `buscadis-revista-${timestamp}.pdf`;
    
    // Upload to storage
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('magazines')
      .upload(filename, pdfBuffer, {
        contentType: 'application/pdf',
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Error uploading PDF:', uploadError);
      return NextResponse.json(
        { message: 'Error al guardar la revista generada' },
        { status: 500 }
      );
    }

    // Get the public URL
    const { data: publicUrlData } = supabase
      .storage
      .from('magazines')
      .getPublicUrl(filename);

    if (!publicUrlData || !publicUrlData.publicUrl) {
      return NextResponse.json(
        { message: 'Error al obtener la URL pública de la revista' },
        { status: 500 }
      );
    }

    const pdfUrl = publicUrlData.publicUrl;

    // Save magazine record in the database
    const { data: magazineData, error: magazineError } = await supabase
      .from('magazines')
      .insert([
        {
          pdf_url: pdfUrl,
          filename: filename,
          publication_count: publications.length,
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (magazineError) {
      console.error('Error saving magazine record:', magazineError);
      // Not returning error here as the PDF was already generated and uploaded
    }

    return NextResponse.json({
      success: true,
      pdfUrl,
      publicationCount: publications.length,
      magazineId: magazineData?.id || null
    });
  } catch (error) {
    console.error('Error generating magazine:', error);
    return NextResponse.json(
      { message: 'Error al generar la revista', error: (error as Error).message },
      { status: 500 }
    );
  }
} 