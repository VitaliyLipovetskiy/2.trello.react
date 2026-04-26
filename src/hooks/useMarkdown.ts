const HTTP_URL_RE = /^https?:\/\//i;
const AUTO_URL_RE = /\bhttps?:\/\/[^\s<>"']+/gi;
const MD_LINK_RE = /\[([^\]]*)\]\(([^)]+)\)/g;
const PLACEHOLDER_MARKER = '\x00';
// eslint-disable-next-line no-control-regex
const PLACEHOLDER_RE = /\x00(\d+)\x00/g;
// eslint-disable-next-line no-control-regex
const CONTROL_CHAR_RE = /[\x00-\x1f\x7f]/;

const escapeHtml = (s: string): string =>
  s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

const encodeUrlUnsafe = (s: string): string =>
  s.replaceAll('"', '%22').replaceAll("'", '%27').replaceAll('<', '%3C').replaceAll('>', '%3E');

const sanitizeHref = (url: string): string | null => {
  const trimmed = url.trim();
  if (!HTTP_URL_RE.test(trimmed)) return null;
  if (CONTROL_CHAR_RE.test(trimmed)) return null;
  return encodeUrlUnsafe(trimmed);
};

const applyInline = (text: string): string =>
  text
    .replaceAll(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replaceAll(/__(.+?)__/g, '<strong>$1</strong>')
    .replaceAll(/\*(.+?)\*/g, '<em>$1</em>')
    .replaceAll(/_(.+?)_/g, '<em>$1</em>')
    .replaceAll(/~~(.+?)~~/g, '<del>$1</del>')
    .replaceAll(/`(.+?)`/g, '<code>$1</code>');

const transformMarkdown = (value: string | null | undefined): string => {
  if (!value) return '';

  let text = value.replaceAll(PLACEHOLDER_MARKER, '');

  const tokens: string[] = [];
  const pushToken = (html: string): string => {
    const idx = tokens.push(html) - 1;
    return `${PLACEHOLDER_MARKER}${idx}${PLACEHOLDER_MARKER}`;
  };

  text = text.replaceAll(MD_LINK_RE, (_, linkText: string, url: string) => {
    const safeUrl = sanitizeHref(url);
    if (!safeUrl) return linkText;
    const inner = applyInline(escapeHtml(linkText));
    return pushToken(`<a href="${safeUrl}" target="_blank" rel="noopener noreferrer">${inner}</a>`);
  });

  text = text.replaceAll(AUTO_URL_RE, (match) => {
    const safeUrl = sanitizeHref(match);
    if (!safeUrl) return match;
    return pushToken(`<a href="${safeUrl}" target="_blank" rel="noopener noreferrer">${escapeHtml(match)}</a>`);
  });

  text = escapeHtml(text);
  text = applyInline(text);

  text = text
    .replaceAll(/^### (.+)$/gm, '<h3>$1</h3>')
    .replaceAll(/^## (.+)$/gm, '<h2>$1</h2>')
    .replaceAll(/^# (.+)$/gm, '<h1>$1</h1>');

  text = text.replaceAll('\n', '<br>');

  text = text.replaceAll(PLACEHOLDER_RE, (_, idx: string) => tokens[Number(idx)] ?? '');

  return text;
};

export default transformMarkdown;
