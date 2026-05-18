const HASHTAG_MATCHER = /#([a-zA-Z0-9_-]+)/g;
const HASHTAG_METADATA_MATCHER = /\n{2,}hashtags?:\s*((?:#[a-zA-Z0-9_-]+\s*)+)$/i;

export const normalizeHashtag = (value = '') => String(value)
  .trim()
  .toLowerCase()
  .replace(/^#+/, '')
  .replace(/[^a-z0-9_-]+/g, '-')
  .replace(/-+/g, '-')
  .replace(/^-|-$/g, '');

export const uniqueHashtags = (values = []) => [...new Set(values.filter(Boolean))];

export const parseHashtagInput = (input = '') => {
  if (Array.isArray(input)) {
    return uniqueHashtags(input.map(normalizeHashtag));
  }

  return uniqueHashtags(
    String(input)
      .split(/[\s,\n]+/)
      .map(normalizeHashtag),
  );
};

export const extractHashtagsFromText = (input = '') => uniqueHashtags(
  [...String(input).matchAll(HASHTAG_MATCHER)].map((match) => normalizeHashtag(match[1])),
);

export const coerceHashtagArray = (input = '') => {
  if (Array.isArray(input)) {
    return uniqueHashtags(input.map(normalizeHashtag));
  }

  return input.includes?.('#')
    ? uniqueHashtags([
        ...extractHashtagsFromText(input),
        ...parseHashtagInput(input.replace(HASHTAG_MATCHER, ' ')),
      ])
    : parseHashtagInput(input);
};

export const buildHashtagSearch = (query = '') => {
  const rawQuery = String(query || '').trim().toLowerCase();
  const hashtagTerms = extractHashtagsFromText(rawQuery);
  const plainText = rawQuery.replace(HASHTAG_MATCHER, ' ').replace(/\s+/g, ' ').trim();

  return {
    hashtagTerms,
    plainText,
    rawQuery,
  };
};

export const formatHashtagLabel = (tag = '') => {
  const normalized = normalizeHashtag(tag);
  return normalized ? `#${normalized}` : '';
};

export const stringifyHashtags = (input = []) => coerceHashtagArray(input)
  .map(formatHashtagLabel)
  .filter(Boolean)
  .join(' ');

export const splitHashtagMetadata = (input = '') => {
  const source = String(input || '');
  const match = source.match(HASHTAG_METADATA_MATCHER);

  if (!match) {
    return {
      text: source.trim(),
      tags: [],
    };
  }

  return {
    text: source.slice(0, match.index).trim(),
    tags: extractHashtagsFromText(match[1]),
  };
};

export const mergeHashtagMetadata = (text = '', tags = []) => {
  const normalizedText = splitHashtagMetadata(text).text;
  const normalizedTags = coerceHashtagArray(tags);

  if (normalizedTags.length === 0) {
    return normalizedText;
  }

  return [normalizedText, `Hashtags: ${stringifyHashtags(normalizedTags)}`]
    .filter(Boolean)
    .join('\n\n');
};
