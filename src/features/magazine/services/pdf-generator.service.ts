"use server";

import { Publication } from '@/types/publications';
import { Buffer } from 'buffer';
import { CategoryGroup } from './magazine.service';

/**
 * Generate a PDF magazine from grouped publications
 */
export async function generatePdfMagazine(
  groupedPublications: Record<string, Publication[]>
): Promise<Buffer> {
  // We need to import jsPDF dynamically because it's a client-side library
  // but we're using it in a server component
  const { jsPDF } = await import('jspdf');
  const autoTable = (await import('jspdf-autotable')).default;
  
  // Create a new PDF document (A4 format)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });
  
  // Add cover page
  createCoverPage(doc);
  
  // Add table of contents
  createTableOfContents(doc, groupedPublications);
  
  // Process each category and its publications
  let categoryIndex = 1;
  for (const [category, publications] of Object.entries(groupedPublications)) {
    if (publications.length === 0) continue;
    
    // Add section divider page for each category
    createCategoryDivider(doc, categoryIndex, getCategoryName(category), publications.length);
    categoryIndex++;
    
    // Add publications for this category
    addPublicationsSection(doc, publications);
  }
  
  // Add footer to all pages
  addFooters(doc);
  
  // Create PDF buffer
  const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
  return pdfBuffer;
}

/**
 * Create the cover page of the magazine
 */
function createCoverPage(doc: any): void {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Background color
  doc.setFillColor(25, 118, 210); // Primary blue color
  doc.rect(0, 0, pageWidth, pageHeight, 'F');
  
  // Add date
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.text(`Edición: ${formattedDate}`, pageWidth / 2, 30, { align: 'center' });
  
  // Title
  doc.setFontSize(40);
  doc.setFont('helvetica', 'bold');
  doc.text('REVISTA', pageWidth / 2, pageHeight / 2 - 20, { align: 'center' });
  doc.text('DIGITAL', pageWidth / 2, pageHeight / 2 + 10, { align: 'center' });
  
  // Subtitle
  doc.setFontSize(24);
  doc.setFont('helvetica', 'normal');
  doc.text('Clasificados Buscadis', pageWidth / 2, pageHeight / 2 + 40, { align: 'center' });
  
  // Footer
  doc.setFontSize(10);
  doc.text('www.buscadis.com', pageWidth / 2, pageHeight - 20, { align: 'center' });
  
  // Add new page
  doc.addPage();
}

/**
 * Create the table of contents page
 */
function createTableOfContents(doc: any, groupedPublications: Record<string, Publication[]>): void {
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Title
  doc.setTextColor(25, 118, 210);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('CONTENIDO', pageWidth / 2, 30, { align: 'center' });
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  
  let yPos = 50;
  let categoryIndex = 1;
  
  // For each category, add an entry
  for (const [category, publications] of Object.entries(groupedPublications)) {
    if (publications.length === 0) continue;
    
    const categoryName = getCategoryName(category);
    doc.setFont('helvetica', 'bold');
    doc.text(`${categoryIndex}. ${categoryName} (${publications.length})`, 20, yPos);
    doc.setFont('helvetica', 'normal');
    yPos += 10;
    
    categoryIndex++;
  }
  
  // Add new page
  doc.addPage();
}

/**
 * Create a category divider page
 */
function createCategoryDivider(doc: any, index: number, categoryName: string, count: number): void {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Background color
  doc.setFillColor(240, 240, 240); // Light gray
  doc.rect(0, 0, pageWidth, pageHeight, 'F');
  
  // Category index and name
  doc.setTextColor(25, 118, 210);
  doc.setFontSize(40);
  doc.setFont('helvetica', 'bold');
  doc.text(`${index}`, pageWidth / 2, pageHeight / 2 - 30, { align: 'center' });
  
  doc.setFontSize(30);
  doc.text(categoryName.toUpperCase(), pageWidth / 2, pageHeight / 2, { align: 'center' });
  
  // Count
  doc.setFontSize(16);
  doc.setFont('helvetica', 'normal');
  doc.text(`${count} anuncios`, pageWidth / 2, pageHeight / 2 + 20, { align: 'center' });
  
  // Add new page
  doc.addPage();
}

/**
 * Add a section of publications for a category
 */
function addPublicationsSection(doc: any, publications: Publication[]): void {
  for (const publication of publications) {
    addPublicationPage(doc, publication);
  }
}

/**
 * Add a single publication page
 */
function addPublicationPage(doc: any, publication: Publication): void {
  const pageWidth = doc.internal.pageSize.getWidth();
  const margins = 15;
  
  // Title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(25, 118, 210);
  
  const title = publication.title.toUpperCase();
  const titleLines = doc.splitTextToSize(title, pageWidth - (margins * 2));
  doc.text(titleLines, margins, 25);
  
  let yPos = 25 + (titleLines.length * 8);
  
  // Price
  if (publication.amount) {
    doc.setFontSize(14);
    doc.setTextColor(76, 175, 80); // Green color
    const currencySymbol = publication.currency === 'USD' ? '$' : 'S/';
    const price = `${currencySymbol} ${publication.amount.toLocaleString('es-PE')}`;
    doc.text(price, margins, yPos);
    
    if (publication.negotiable) {
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text('(Negociable)', margins + doc.getTextWidth(price) + 5, yPos);
    }
    
    yPos += 10;
  }
  
  // Location
  if (publication.location && publication.location.district) {
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'italic');
    
    let locationText = `${publication.location.district}, ${publication.location.province}`;
    if (publication.location.address) {
      locationText = `${publication.location.address}, ${locationText}`;
    }
    
    doc.text(locationText, margins, yPos);
    yPos += 8;
  }
  
  // Description
  doc.setFontSize(12);
  doc.setTextColor(50, 50, 50);
  doc.setFont('helvetica', 'normal');
  
  const description = publication.description;
  const descriptionLines = doc.splitTextToSize(description, pageWidth - (margins * 2));
  doc.text(descriptionLines, margins, yPos + 8);
  
  yPos += 8 + (descriptionLines.length * 6);
  
  // Attributes (if available)
  if (publication.attributes && Object.keys(publication.attributes).length > 0) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Características:', margins, yPos + 8);
    yPos += 15;
    
    doc.setFont('helvetica', 'normal');
    
    const attributes = publication.attributes;
    const tableData = Object.entries(attributes).map(([key, value]) => {
      // Format the attribute name and value
      const formattedKey = formatAttributeName(key);
      const formattedValue = formatAttributeValue(value);
      return [formattedKey, formattedValue];
    });
    
    if (tableData.length > 0) {
      autoTable(doc, {
        startY: yPos,
        head: [['Característica', 'Valor']],
        body: tableData,
        theme: 'grid',
        headStyles: {
          fillColor: [25, 118, 210],
          textColor: [255, 255, 255]
        },
        margin: { left: margins, right: margins },
        styles: {
          fontSize: 10
        }
      });
      
      yPos = (doc as any).lastAutoTable.finalY + 10;
    }
  }
  
  // Contact information
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Contacto:', margins, yPos);
  yPos += 8;
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  
  if (publication.contact.name) {
    doc.text(`Nombre: ${publication.contact.name}`, margins, yPos);
    yPos += 6;
  }
  
  if (publication.contact.phones && publication.contact.phones.length > 0) {
    doc.text(`Teléfono: ${publication.contact.phones.join(' / ')}`, margins, yPos);
    yPos += 6;
  }
  
  if (publication.contact.email) {
    doc.text(`Email: ${publication.contact.email}`, margins, yPos);
  }
  
  // Add new page for next publication
  doc.addPage();
}

/**
 * Add footers to all pages
 */
function addFooters(doc: any): void {
  const pageCount = doc.internal.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    
    // Skip footer on cover page
    if (i === 1) continue;
    
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Buscadis.com - Revista Digital de Clasificados - Página ${i} de ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }
}

/**
 * Format attribute name to be more readable
 */
function formatAttributeName(key: string): string {
  return key
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Format attribute value based on its type
 */
function formatAttributeValue(value: any): string {
  if (value === null || value === undefined) {
    return '';
  }
  
  if (typeof value === 'boolean') {
    return value ? 'Sí' : 'No';
  }
  
  if (Array.isArray(value)) {
    return value.join(', ');
  }
  
  return String(value);
}

/**
 * Get the readable name of a category from its slug
 */
function getCategoryName(categorySlug: string): string {
  const categoryMap: Record<string, string> = {
    'inmuebles': 'Inmuebles',
    'vehiculos': 'Vehículos',
    'empleos': 'Empleos',
    'servicios': 'Servicios',
    'productos': 'Productos',
    'mascotas': 'Mascotas',
    'otros': 'Otros'
  };
  
  return categoryMap[categorySlug] || categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1);
} 