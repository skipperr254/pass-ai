import JSZip from 'jszip';

export async function extractTextFromPPTX(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);

    let fullText = '';

    // PPTX files contain slide XML files in ppt/slides/
    const slideFiles = Object.keys(zip.files).filter(
      (filename) =>
        filename.startsWith('ppt/slides/slide') && filename.endsWith('.xml')
    );

    for (const slideFile of slideFiles) {
      const content = await zip.files[slideFile].async('text');

      // Extract text between <a:t> tags (text content in PPTX)
      const textMatches = content.match(/<a:t[^>]*>(.*?)<\/a:t>/g);

      if (textMatches) {
        const slideText = textMatches
          .map((match) => match.replace(/<\/?a:t[^>]*>/g, ''))
          .join(' ');
        fullText += slideText + '\n\n';
      }
    }

    return fullText.trim();
  } catch (error) {
    console.error('Error extracting text from PPTX:', error);
    throw new Error('Failed to extract text from PPTX');
  }
}
