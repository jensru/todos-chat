/**
 * Einfacher Markdown-Parser für Chat-Nachrichten
 * Unterstützt: Bold, Italic, Bullet Points, Absätze
 * Headlines werden explizit NICHT unterstützt (zu aufdringlich)
 */

export function parseMarkdown(text: string): string {
  if (!text) return '';

  let html = text;

  // Bold: **text** oder __text__ (semi-bold)
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight: 600;">$1</strong>');
  html = html.replace(/__(.*?)__/g, '<strong style="font-weight: 600;">$1</strong>');

  // Italic: *text* oder _text_
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  html = html.replace(/_(.*?)_/g, '<em>$1</em>');

  // Bullet Points: - item oder * item
  html = html.replace(/^[\s]*[-*]\s+(.+)$/gm, '<li>$1</li>');
  
  // Wrap consecutive <li> elements in <ul>
  html = html.replace(/(<li>.*<\/li>)(\s*<li>.*<\/li>)*/g, (match) => {
    return `<ul>${match}</ul>`;
  });

  // Absätze: Doppelte Zeilenumbrüche werden zu <p>
  html = html.replace(/\n\n/g, '</p><p>');
  
  // Einzelne Zeilenumbrüche werden zu <br>
  html = html.replace(/\n/g, '<br>');

  // Wrap in <p> tags if not already wrapped
  if (!html.startsWith('<') && !html.startsWith('</p>')) {
    html = `<p>${html}</p>`;
  }

  // Clean up empty paragraphs
  html = html.replace(/<p><\/p>/g, '');
  html = html.replace(/<p>\s*<\/p>/g, '');

  return html;
}

/**
 * Sanitize HTML to prevent XSS attacks
 */
export function sanitizeHtml(html: string): string {
  // Erlaube nur bestimmte Tags
  const allowedTags = ['p', 'br', 'strong', 'em', 'ul', 'li'];
  
  // Einfache Sanitization - entferne alle anderen HTML-Tags
  let sanitized = html;
  
  // Finde alle HTML-Tags
  const tagRegex = /<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^<>]*>/g;
  
  sanitized = sanitized.replace(tagRegex, (match, tagName) => {
    if (allowedTags.includes(tagName.toLowerCase())) {
      return match;
    }
    return ''; // Entferne nicht erlaubte Tags
  });
  
  return sanitized;
}

/**
 * Kombinierte Funktion: Parse Markdown und sanitize
 */
export function parseAndSanitizeMarkdown(text: string): string {
  const parsed = parseMarkdown(text);
  return sanitizeHtml(parsed);
}
