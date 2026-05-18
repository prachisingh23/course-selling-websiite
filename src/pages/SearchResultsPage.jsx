import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Loader2, Search } from 'lucide-react';
import { fetchMediaItems, MEDIA_CATEGORIES, RESOLUTION_OPTIONS, SORT_OPTIONS } from '@/services/mediaService';
import { getFavorites, getFavoriteKey, toggleFavorite } from '@/services/favoritesService';
import MediaCard from '@/components/media/MediaCard';
import MediaFilters from '@/components/media/MediaFilters';
import MediaPageHeader from '@/components/media/MediaPageHeader';
import { Button } from '@/components/ui/button';

const SearchResultsPage = ({ onNavigate, initialQuery = '' }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(initialQuery);
  const [category, setCategory] = useState('All');
  const [resolution, setResolution] = useState('All');
  const [sort, setSort] = useState('Trending');
  const [favorites, setFavorites] = useState(() => getFavorites());

  useEffect(() => {
    setSearch(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchMediaItems({ search, category, resolution, sort });
        setItems(data);
      } catch (error) {
        console.error('Failed to search media:', error);
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
    const photoCount = items.filter((item) => item.type === 'photo').length;
    const videoCount = items.filter((item) => item.type === 'video').length;

    return [
      { label: 'Matched Assets', value: items.length },
      { label: 'Photos', value: photoCount },
      { label: 'Videos', value: videoCount },
      { label: 'Saved Picks', value: favorites.length },
    ];
  }, [favorites.length, items]);

  const handleFavorite = (item) => {
    setFavorites(toggleFavorite(item));
  };

  const handleDownload = (item) => {
    if (!item.isFree) {
      onNavigate('media', { type: item.type, id: item.id });
      return;
    }

    window.open(item.downloadUrl, '_blank', 'noopener,noreferrer');
  };

  const resetFilters = () => {
    setSearch(initialQuery || '');
    setCategory('All');
    setResolution('All');
    setSort('Trending');
  };

  const handleTagSelect = (tag) => {
    setSearch(`#${tag}`);
    setCategory('All');
    setResolution('All');
    setSort('Trending');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <Helmet>
        <title>Search Results - Lifelapss Media</title>
        <meta name="description" content={`Search results for ${search || 'royalty-free media'} on Lifelapss.`} />
      </Helmet>

      <div className="media-shell px-4 pb-20 pt-28 text-white lg:pt-32">
        <div className="mx-auto max-w-7xl space-y-8">
          <MediaPageHeader
            eyebrow="Search Results"
            title={`Results for ${search || 'everything'}`}
            description="Search videos, photos, textures, and footage from one cleaner results view, then open any asset for a full preview."
            imageUrl={items[0]?.previewUrl}
            stats={headerStats}
            actions={
              <Button
                variant="outline"
                className="rounded-full border-white/10 bg-white/5 hover:bg-white/10"
                onClick={() => onNavigate('home')}
              >
                Back to Discover
              </Button>
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
            categories={MEDIA_CATEGORIES}
            resolutions={RESOLUTION_OPTIONS}
            sorts={SORT_OPTIONS}
            searchPlaceholder="Search media or hashtags like #travel #night..."
            resultCount={items.length}
            title="Refine search results"
            description="Narrow by media type, resolution, and ranking without leaving the results flow."
            onReset={resetFilters}
          />

          {loading ? (
            <div className="media-panel flex min-h-[320px] items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-cyan-200" />
            </div>
          ) : items.length === 0 ? (
            <div className="media-panel flex min-h-[340px] flex-col items-center justify-center text-center">
              <Search className="mb-4 h-10 w-10 text-cyan-100/45" />
              <h2 className="text-2xl text-white">No assets matched that search</h2>
              <p className="media-copy mt-2 max-w-xl">
                Try another keyword, switch the category, or reset the filters to widen the results.
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
                  onTagSelect={handleTagSelect}
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

export default SearchResultsPage;
