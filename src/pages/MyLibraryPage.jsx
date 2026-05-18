import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { BookOpen, Bookmark, Download, FolderHeart, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/useAuth';
import { getAllCourses } from '@/services/courseService';
import { fetchMediaItems } from '@/services/mediaService';
import { getFavorites, getFavoriteKey, toggleFavorite } from '@/services/favoritesService';
import { Button } from '@/components/ui/button';
import MediaCard from '@/components/media/MediaCard';
import MediaPageHeader from '@/components/media/MediaPageHeader';

const saleTypeToMediaType = (itemType) => (itemType === 'image' ? 'photo' : 'video');

const MyLibraryPage = ({ onNavigate }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [purchasedItems, setPurchasedItems] = useState([]);
  const [favoriteItems, setFavoriteItems] = useState([]);
  const [favoriteKeys, setFavoriteKeys] = useState(new Set());

  useEffect(() => {
    const load = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const [courses, enrollmentsResult, salesResult, media] = await Promise.all([
          getAllCourses(),
          supabase.from('enrollments').select('course_id').eq('user_id', user.id),
          supabase.from('sales').select('item_id, item_type').eq('buyer_id', user.id),
          fetchMediaItems({ sort: 'Newest' }),
        ]);

        if (enrollmentsResult.error) throw enrollmentsResult.error;
        if (salesResult.error) throw salesResult.error;

        const enrolledIds = new Set((enrollmentsResult.data || []).map((item) => String(item.course_id)));
        setEnrolledCourses(courses.filter((course) => enrolledIds.has(String(course.id))));

        const purchasedKeys = new Set(
          (salesResult.data || []).map((sale) => getFavoriteKey(saleTypeToMediaType(sale.item_type), sale.item_id))
        );
        setPurchasedItems(media.filter((item) => purchasedKeys.has(getFavoriteKey(item.type, item.id))));

        const favorites = getFavorites();
        const favoriteKeySet = new Set(favorites.map((item) => getFavoriteKey(item.type, item.id)));
        setFavoriteKeys(favoriteKeySet);
        setFavoriteItems(media.filter((item) => favoriteKeySet.has(getFavoriteKey(item.type, item.id))));
      } catch (error) {
        console.error('Failed to load library:', error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user]);

  const headerStats = useMemo(() => {
    return [
      { label: 'Courses', value: enrolledCourses.length },
      { label: 'Owned Media', value: purchasedItems.length },
      { label: 'Favorites', value: favoriteItems.length },
      { label: 'Total Library', value: enrolledCourses.length + purchasedItems.length + favoriteItems.length },
    ];
  }, [enrolledCourses.length, favoriteItems.length, purchasedItems.length]);

  const handleFavoriteToggle = (item) => {
    const updated = toggleFavorite(item);
    const updatedKeys = new Set(updated.map((favorite) => getFavoriteKey(favorite.type, favorite.id)));
    setFavoriteKeys(updatedKeys);
    setFavoriteItems((current) =>
      current.filter((favoriteItem) => updatedKeys.has(getFavoriteKey(favoriteItem.type, favoriteItem.id)))
    );
  };

  const handleFavoriteSectionDownload = (item) => {
    if (!item.isFree) {
      onNavigate('media', { type: item.type, id: item.id });
      return;
    }

    window.open(item.downloadUrl, '_blank', 'noopener,noreferrer');
  };

  const handleOwnedDownload = (item) => {
    window.open(item.downloadUrl, '_blank', 'noopener,noreferrer');
  };

  if (!user) {
    return (
      <>
        <Helmet>
          <title>My Library - Lifelapss Media</title>
        </Helmet>

        <div className="media-shell px-4 pb-20 pt-28 text-white lg:pt-32">
          <div className="mx-auto max-w-4xl">
            <div className="media-panel flex flex-col items-center px-8 py-16 text-center">
              <FolderHeart className="mb-6 h-12 w-12 text-cyan-200" />
              <h1 className="text-4xl text-white">Your saved courses and owned media live here</h1>
              <p className="media-copy mt-4 max-w-2xl">
                Login to manage enrolled courses, purchased media, and favorites from one cleaner account view.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button className="rounded-full bg-cyan-300 text-[#041b26] hover:bg-cyan-200" onClick={() => onNavigate('login')}>
                  Login
                </Button>
                <Button
                  variant="outline"
                  className="rounded-full border-white/10 bg-white/5 hover:bg-white/10"
                  onClick={() => onNavigate('signup')}
                >
                  Create Account
                </Button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  const renderMediaSection = (title, items, icon, emptyText, owned = false) => (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="rounded-full border border-cyan-300/20 bg-cyan-400/10 p-2 text-cyan-100">
          {icon}
        </div>
        <div>
          <h2 className="text-2xl text-white">{title}</h2>
          <p className="text-sm text-white/50">{items.length} item{items.length === 1 ? '' : 's'}</p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="media-panel-soft p-8 text-white/55">{emptyText}</div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <MediaCard
              key={`${item.type}-${item.id}`}
              item={item}
              owned={owned}
              saved={favoriteKeys.has(getFavoriteKey(item.type, item.id))}
              onToggleSave={handleFavoriteToggle}
              onDownload={owned ? handleOwnedDownload : handleFavoriteSectionDownload}
              onTagSelect={(tag) => onNavigate('search', { query: `#${tag}` })}
              onPreview={(mediaItem) => onNavigate('media', { type: mediaItem.type, id: mediaItem.id })}
            />
          ))}
        </div>
      )}
    </section>
  );

  return (
    <>
      <Helmet>
        <title>My Library - Lifelapss Media</title>
      </Helmet>

      <div className="media-shell px-4 pb-20 pt-28 text-white lg:pt-32">
        <div className="mx-auto max-w-7xl space-y-10">
          <MediaPageHeader
            eyebrow="My Library"
            title="Courses, owned assets, and saved picks in one place"
            description="The library now feels cleaner: your learning content, purchased media, and favorites stay together without changing the existing course or payment logic."
            imageUrl={purchasedItems[0]?.previewUrl || favoriteItems[0]?.previewUrl}
            stats={headerStats}
            actions={
              <>
                <Button
                  className="rounded-full bg-cyan-300 text-[#041b26] hover:bg-cyan-200"
                  onClick={() => onNavigate('favorites')}
                >
                  <Bookmark className="mr-2 h-4 w-4" />
                  Open Favorites
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
            <div className="media-panel flex min-h-[280px] items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-cyan-200" />
            </div>
          ) : (
            <>
              <section className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-full border border-cyan-300/20 bg-cyan-400/10 p-2 text-cyan-100">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-2xl text-white">My Courses</h2>
                    <p className="text-sm text-white/50">{enrolledCourses.length} enrolled</p>
                  </div>
                </div>

                {enrolledCourses.length === 0 ? (
                  <div className="media-panel-soft p-8 text-white/55">
                    No enrolled courses yet.
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {enrolledCourses.map((course) => (
                      <article key={course.id} className="media-panel-soft p-6">
                        <p className="media-kicker">{course.category}</p>
                        <h3 className="mt-3 text-3xl text-white">{course.title}</h3>
                        <p className="media-copy mt-3">{course.description}</p>
                        <Button
                          className="mt-6 rounded-full bg-cyan-300 text-[#041b26] hover:bg-cyan-200"
                          onClick={() => onNavigate('course', { id: course.id })}
                        >
                          Continue Course
                        </Button>
                      </article>
                    ))}
                  </div>
                )}
              </section>

              {renderMediaSection('Purchased Media', purchasedItems, <Download className="h-5 w-5" />, 'No purchased media yet.', true)}
              {renderMediaSection('Favorites', favoriteItems, <Bookmark className="h-5 w-5" />, 'Save assets while browsing and they will appear here.')}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default MyLibraryPage;
