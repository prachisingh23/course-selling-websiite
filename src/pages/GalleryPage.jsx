import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Camera, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MediaCard from '@/components/media/MediaCard';
import MediaFilters from '@/components/media/MediaFilters';
import MediaPageHeader from '@/components/media/MediaPageHeader';
import { fetchMediaItems, RESOLUTION_OPTIONS, SORT_OPTIONS } from '@/services/mediaService';
import { getFavorites, getFavoriteKey, toggleFavorite } from '@/services/favoritesService';

const photoCategories = ['All', 'Photos', 'Portraits', 'Nature Shots', 'Architecture', 'City Lights', 'Ocean Waves', 'Textures', 'Minimalism'];

const GalleryPage = ({ onNavigate }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [resolution, setResolution] = useState('All');
  const [sort, setSort] = useState('Trending');
  const [favorites, setFavorites] = useState(() => getFavorites());

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const media = await fetchMediaItems({
          type: 'photos',
          search,
          category,
          resolution,
          sort,
        });
        setItems(media);
      } catch (error) {
        console.error('Failed to load photos:', error);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [search, category, resolution, sort]);

  const favoriteSet = useMemo(
    () => new Set(favorites.map((item) => getFavoriteKey(item.type, item.id))),
    [favorites]
  );

  const headerStats = useMemo(() => {
    const freeCount = items.filter((item) => item.isFree).length;
    const ultraCount = items.filter((item) => item.resolution === '4K').length;

    return [
      { label: 'Photo Assets', value: items.length },
      { label: 'Free Downloads', value: freeCount },
      { label: '4K Ready', value: ultraCount },
      { label: 'Saved Picks', value: favorites.length },
    ];
  }, [favorites.length, items]);

  const handleFavorite = (item) => setFavorites(toggleFavorite(item));

  const handleDownload = (item) => {
    if (!item.isFree) {
      onNavigate('media', { type: item.type, id: item.id });
      return;
    }

    window.open(item.downloadUrl, '_blank', 'noopener,noreferrer');
  };

  const resetFilters = () => {
    setSearch('');
    setCategory('All');
    setResolution('All');
    setSort('Trending');
  };

  return (
    <>
      <Helmet>
        <title>Photos - Lifelapss Media</title>
        <meta name="description" content="Browse premium royalty-free photos, textures, portraits, and architecture stills." />
      </Helmet>

      <div className="media-shell px-4 pb-20 pt-28 text-white lg:pt-32">
        <div className="mx-auto max-w-7xl space-y-8">
          <MediaPageHeader
            eyebrow="Photos"
            title="Royalty-free stills with a cleaner editorial browsing flow"
            description="Browse textures, portraits, landscapes, architecture, and polished still assets with better hierarchy for preview, save, and download actions."
            imageUrl={items[0]?.previewUrl}
            stats={headerStats}
            actions={
              <>
                <Button
                  className="rounded-full bg-cyan-300 text-[#041b26] hover:bg-cyan-200"
                  onClick={() => onNavigate('favorites')}
                >
                  View Favorites
                </Button>
                <Button
                  variant="outline"
                  className="rounded-full border-white/10 bg-white/5 hover:bg-white/10"
                  onClick={() => onNavigate('videos')}
                >
                  Browse Videos
                </Button>
              </>
            }
          />

          <MediaFilters
            search={search}
            onSearchChange={setSearch}
            category={category}
            onCategoryChange={setCategory}
            resolution={resolution}
            onResolutionChange={setResolution}
            sort={sort}
            onSortChange={setSort}
            categories={photoCategories}
            resolutions={RESOLUTION_OPTIONS}
            sorts={SORT_OPTIONS}
            searchPlaceholder="Search photos or hashtags like #sunset..."
            resultCount={items.length}
            title="Refine the photo catalog"
            description="Search visual mood, resolution, and category from one cleaner control bar."
            onReset={resetFilters}
          />

          {loading ? (
            <div className="media-panel flex min-h-[320px] items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-cyan-200" />
            </div>
          ) : items.length === 0 ? (
            <div className="media-panel flex min-h-[340px] flex-col items-center justify-center text-center">
              <Camera className="mb-4 h-10 w-10 text-cyan-100/45" />
              <h2 className="text-2xl text-white">No photos matched those filters</h2>
              <p className="media-copy mt-2 max-w-xl">
                Try a broader keyword or reset the filters to surface more curator-approved still assets.
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

export default GalleryPage;
