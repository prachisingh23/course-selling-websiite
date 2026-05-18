const ALLOWED_TAGS = new Set([
  'a',
  'blockquote',
  'br',
  'code',
  'em',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'hr',
  'img',
  'li',
  'ol',
  'p',
  'pre',
  'strong',
  'ul',
]);

const URL_ATTRS = new Set(['href', 'src']);
const GLOBAL_ATTRS = new Set(['class']);
const ALLOWED_ATTRS = {
  a: new Set(['href', 'title', 'target', 'rel']),
  img: new Set(['src', 'alt', 'title']),
};

const FORBIDDEN_TAGS = new Set(['script', 'style', 'iframe', 'object', 'embed', 'form', 'link', 'meta']);

const isSafeUrl = (value = '') => {
  const trimmed = String(value).trim();

  if (!trimmed) {
    return false;
  }

  if (
    trimmed.startsWith('/') ||
    trimmed.startsWith('#') ||
    trimmed.startsWith('./') ||
    trimmed.startsWith('../')
  ) {
    return true;
  }

  try {
    const parsed = new URL(trimmed, 'https://lifelapss.local');
    return ['http:', 'https:', 'mailto:', 'tel:'].includes(parsed.protocol);
  } catch {
    return false;
  }
};

const sanitizeElement = (element) => {
  Array.from(element.children).forEach((child) => sanitizeElement(child));

  const tagName = element.tagName.toLowerCase();

  if (FORBIDDEN_TAGS.has(tagName)) {
    element.remove();
    return;
  }

  if (!ALLOWED_TAGS.has(tagName)) {
    const parent = element.parentNode;
    if (!parent) {
      element.remove();
      return;
    }

    while (element.firstChild) {
      parent.insertBefore(element.firstChild, element);
    }

    parent.removeChild(element);
    return;
  }

  Array.from(element.attributes).forEach((attribute) => {
    const name = attribute.name.toLowerCase();
    const allowedForTag = ALLOWED_ATTRS[tagName] || new Set();
    const isAllowedAttr = GLOBAL_ATTRS.has(name) || allowedForTag.has(name);

    if (name.startsWith('on') || !isAllowedAttr) {
      element.removeAttribute(attribute.name);
      return;
    }

    if (URL_ATTRS.has(name) && !isSafeUrl(attribute.value)) {
      element.removeAttribute(attribute.name);
    }
  });

  if (tagName === 'a' && element.getAttribute('target') === '_blank') {
    element.setAttribute('rel', 'noopener noreferrer');
  }
};

const stripUnsafeHtml = (html = '') =>
  String(html)
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '')
    .replace(/\son\w+=(["']).*?\1/gi, '')
    .replace(/\s(href|src)\s*=\s*(["'])\s*javascript:[^"']*\2/gi, '');

export const sanitizeHtml = (html = '') => {
  const rawHtml = String(html || '');

  if (!rawHtml.trim()) {
    return '';
  }

  if (typeof window === 'undefined' || typeof DOMParser === 'undefined') {
    return stripUnsafeHtml(rawHtml);
  }

  const parser = new DOMParser();
  const document = parser.parseFromString(rawHtml, 'text/html');

  Array.from(document.body.children).forEach((element) => sanitizeElement(element));

  return document.body.innerHTML;
};

export default sanitizeHtml;
