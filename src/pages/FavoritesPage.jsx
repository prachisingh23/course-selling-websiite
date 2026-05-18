import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Bookmark, Loader2 } from 'lucide-react';
import { fetchMediaItems } from '@/services/mediaService';
import { getFavorites, getFavoriteKey, toggleFavorite } from '@/services/favoritesService';
import MediaCard from '@/components/media/MediaCard';
import MediaPageHeader from '@/components/media/MediaPageHeader';
import { Button } from '@/components/ui/button';

const FavoritesPage = ({ onNavigate }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState(() => getFavorites());

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const media = await fetchMediaItems({ sort: 'Trending' });
        const favoriteSet = new Set(getFavorites().map((item) => getFavoriteKey(item.type, item.id)));
        setItems(media.filter((item) => favoriteSet.has(getFavoriteKey(item.type, item.id))));
      } catch (error) {
        console.error('Failed to load favorites:', error);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const favoriteSet = useMemo(
    () => new Set(favorites.map((item) => getFavoriteKey(item.type, item.id))),
    [favorites]
  );

  const headerStats = useMemo(() => {
    const photoCount = items.filter((item) => item.type === 'photo').length;
    const videoCount = items.filter((item) => item.type === 'video').length;

    return [
      { label: 'Saved Assets', value: items.length },
      { label: 'Photos', value: photoCount },
      { label: 'Videos', value: videoCount },
      { label: 'Ready to Revisit', value: items.length },
    ];
  }, [items]);

  const handleFavorite = (item) => {
    const updated = toggleFavorite(item);
    setFavorites(updated);
    const updatedSet = new Set(updated.map((favorite) => getFavoriteKey(favorite.type, favorite.id)));
    setItems((current) => current.filter((currentItem) => updatedSet.has(getFavoriteKey(currentItem.type, currentItem.id))));
  };

  const handleDownload = (item) => {
    if (!item.isFree) {
      onNavigate('media', { type: item.type, id: item.id });
      return;
    }

    window.open(item.downloadUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      <Helmet>
        <title>Favorites - Lifelapss Media</title>
      </Helmet>

      <div className="media-shell px-4 pb-20 pt-28 text-white lg:pt-32">
        <div className="mx-auto max-w-7xl space-y-8">
          <MediaPageHeader
            eyebrow="Favorites"
            title="Your saved shortlist of assets worth revisiting"
            description="Keep the best photos and videos close, then return later to preview, unlock, or download them from one cleaner saved view."
            imageUrl={items[0]?.previewUrl}
            stats={headerStats}
            actions={
              <>
                <Button
                  className="rounded-full bg-cyan-300 text-[#041b26] hover:bg-cyan-200"
                  onClick={() => onNavigate('library')}
                >
                  Open My Library
                </Button>
                <Button
                  variant="outline"
                  className="rounded-full border-white/10 bg-white/5 hover:bg-white/10"
                  onClick={() => onNavigate('home')}
                >
                  Back to Discover
                </Button>
              </>
            }
          />

          {loading ? (
            <div className="media-panel flex min-h-[320px] items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-cyan-200" />
            </div>
          ) : items.length === 0 ? (
            <div className="media-panel flex min-h-[340px] flex-col items-center justify-center text-center">
              <Bookmark className="mb-4 h-10 w-10 text-cyan-100/45" />
              <h2 className="text-2xl text-white">No favorites saved yet</h2>
              <p className="media-copy mt-2 max-w-xl">
                Save items from Discover, Photos, Videos, or a media detail page and they will appear here.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {items.map((item) => (
                <MediaCard
                  key={`${item.type}-${item.id}`}
                  item={item}
                  saved={favoriteSet.has(getFavoriteKey(item.type, item.id))}
                  onToggleSave={handleFavorite}
                  onDownload={handleDownload}
                  onTagSelect={(tag) => onNavigate('search', { query: `#${tag}` })}
                  onPreview={(mediaItem) => onNavigate('media', { type: mediaItem.type, id: mediaItem.id })}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default FavoritesPage;
