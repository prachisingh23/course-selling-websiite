const FAVORITES_KEY = 'lifelapss-media-favorites';

const readFavorites = () => {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(FAVORITES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error('Failed to read favorites:', error);
    return [];
  }
};

const writeFavorites = (favorites) => {
  if (typeof window === 'undefined') {
    return favorites;
  }

  window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  return favorites;
};

export const getFavoriteKey = (type, id) => `${type}:${id}`;

export const getFavorites = () => readFavorites();

export const isFavorite = (type, id) =>
  readFavorites().some((item) => getFavoriteKey(item.type, item.id) === getFavoriteKey(type, id));

export const toggleFavorite = (item) => {
  const favorites = readFavorites();
  const itemKey = getFavoriteKey(item.type, item.id);
  const existing = favorites.find((favorite) => getFavoriteKey(favorite.type, favorite.id) === itemKey);

  if (existing) {
    return writeFavorites(
      favorites.filter((favorite) => getFavoriteKey(favorite.type, favorite.id) !== itemKey)
    );
  }

  const nextFavorite = {
    id: item.id,
    type: item.type,
    title: item.title,
    thumbnailUrl: item.thumbnailUrl,
    savedAt: new Date().toISOString(),
  };

  return writeFavorites([nextFavorite, ...favorites]);
};

export const clearFavorites = () => writeFavorites([]);
