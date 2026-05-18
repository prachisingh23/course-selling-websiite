const slugify = (value = '') =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const toTitleCase = (value = '') =>
  value
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');

const dedupe = (items = []) => [...new Set(items.filter(Boolean))];

const deriveTags = (topic = '') => {
  const baseWords = topic
    .toLowerCase()
    .split(/[^a-z0-9]+/i)
    .filter((word) => word.length > 2)
    .slice(0, 5);

  return dedupe(['ai', 'content', ...baseWords]);
};

const splitTopic = (topic = '') => {
  const cleanTopic = topic.trim() || 'AI content strategy';
  const title = toTitleCase(cleanTopic);

  return {
    cleanTopic,
    title,
    slug: slugify(cleanTopic) || 'ai-content-strategy',
    tags: deriveTags(cleanTopic),
  };
};

export const createFallbackArticle = (topic = '') => {
  const { cleanTopic, title, tags } = splitTopic(topic);

  return {
    title: `${title}: Complete Guide for Modern Creators`,
    meta_title: `${title} | Lifelapss AI Guide`,
    meta_description: `Learn how ${cleanTopic.toLowerCase()} works, where it fits into modern workflows, and how creators can apply it effectively.`,
    short_description: `A practical breakdown of ${cleanTopic.toLowerCase()} for creators, marketers, and media teams.`,
    tags,
    body: [
      `## Why ${title} Matters`,
      `${title} is becoming more relevant for creators who need faster production, cleaner workflows, and more consistent output. The goal is not just to automate tasks, but to build a repeatable system that improves quality and saves time.`,
      `## Where It Fits in a Real Workflow`,
      `Start by defining the use case clearly. Decide whether you need ${cleanTopic.toLowerCase()} for research, ideation, scripting, editing, publishing, or analysis. The strongest results usually come from using AI as part of a larger workflow instead of expecting one tool to do everything.`,
      `## Best Practices`,
      `Be specific with inputs, keep the output aligned to one audience, and review the result before publishing. Strong prompts, clear examples, and a consistent content structure usually lead to better performance.`,
      `## Common Mistakes`,
      `The biggest mistakes are vague prompts, no editorial review, and publishing generic copy that does not match the brand voice. Treat AI output like a first draft, not the final deliverable.`,
      `## Practical Next Step`,
      `Choose one production task this week and use ${cleanTopic.toLowerCase()} to reduce manual work. Measure the quality, speed, and consistency so you can decide whether it deserves a permanent place in your process.`,
    ].join('\n\n'),
  };
};

export const normalizeGeneratedArticle = (payload, topic = '') => {
  const fallback = createFallbackArticle(topic);
  const source =
    typeof payload === 'string'
      ? (() => {
          try {
            return JSON.parse(payload);
          } catch {
            return { body: payload };
          }
        })()
      : payload || {};

  const mergedTags = Array.isArray(source.tags)
    ? source.tags
    : typeof source.tags === 'string'
      ? source.tags.split(',').map((tag) => tag.trim())
      : fallback.tags;

  return {
    title: source.title || fallback.title,
    meta_title: source.meta_title || source.title || fallback.meta_title,
    meta_description: source.meta_description || source.description || fallback.meta_description,
    short_description: source.short_description || source.summary || fallback.short_description,
    tags: dedupe(mergedTags.length ? mergedTags : fallback.tags),
    featured_image_url: source.featured_image_url || '',
    body: typeof source.body === 'string' && source.body.trim() ? source.body : fallback.body,
  };
};

export const articleBodyToPreviewHtml = (body = '') => {
  const escaped = String(body)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  return escaped
    .replace(/^### (.*)$/gm, '<h3>$1</h3>')
    .replace(/^## (.*)$/gm, '<h2>$1</h2>')
    .replace(/^# (.*)$/gm, '<h1>$1</h1>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br />')
    .replace(/^(?!<h\d>)(.+)$/gm, '<p>$1</p>')
    .replace(/<p><\/p>/g, '');
};
