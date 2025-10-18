import { extractTextFromPDF } from './pdf';
import { extractTextFromDOCX } from './docx';
import { extractTextFromPPTX } from './pptx';
import { extractTextFromImage } from './ocr';

export async function extractTextFromFile(
  file: File,
  onProgress?: (progress: number) => void
): Promise<string> {
  const fileType = file.type;
  const fileName = file.name.toLowerCase();

  try {
    // PDF files
    if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
      return await extractTextFromPDF(file);
    }

    // DOCX files
    if (
      fileType ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      fileName.endsWith('.docx')
    ) {
      return await extractTextFromDOCX(file);
    }

    // PPTX files
    if (
      fileType ===
        'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
      fileName.endsWith('.pptx')
    ) {
      return await extractTextFromPPTX(file);
    }

    // Image files
    if (fileType.startsWith('image/')) {
      return await extractTextFromImage(file, onProgress);
    }

    // Plain text files
    if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
      return await file.text();
    }

    throw new Error('Unsupported file type');
  } catch (error) {
    console.error('Error extracting text:', error);
    throw error;
  }
}

export function getFileType(file: File): string {
  const fileName = file.name.toLowerCase();

  if (file.type === 'application/pdf' || fileName.endsWith('.pdf')) {
    return 'pdf';
  }
  if (
    file.type ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    fileName.endsWith('.docx')
  ) {
    return 'docx';
  }
  if (
    file.type ===
      'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
    fileName.endsWith('.pptx')
  ) {
    return 'pptx';
  }
  if (file.type.startsWith('image/')) {
    return 'image';
  }
  if (file.type === 'text/plain' || fileName.endsWith('.txt')) {
    return 'text';
  }

  return 'unknown';
}

export function isFileTypeSupported(file: File): boolean {
  const fileType = getFileType(file);
  return ['pdf', 'docx', 'pptx', 'image', 'text'].includes(fileType);
}
