import DOMPurify from 'dompurify';

function sanitizeText(text: string): string {
  const decodedText = text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');

  return DOMPurify.sanitize(decodedText);
}

export default sanitizeText;