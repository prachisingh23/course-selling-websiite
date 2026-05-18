import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  ExternalLink,
  ArrowLeft,
  Bookmark,
  Download,
  Loader2,
  Lock,
  PlayCircle,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/useAuth';
import { supabase } from '@/lib/customSupabaseClient';
import { fetchMediaItemById, fetchRelatedMedia, getYouTubeId } from '@/services/mediaService';
import { getFavoriteKey, getFavorites, isFavorite, toggleFavorite } from '@/services/favoritesService';
import MediaCard from '@/components/media/MediaCard';
import PaymentComponent from '@/components/PaymentComponent';

const saleItemType = (type) => (type === 'photo' ? 'image' : 'video');

const MediaDetailPage = ({ onNavigate, mediaType, mediaId }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [item, setItem] = useState(null);
  const [relatedItems, setRelatedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [isPurchased, setIsPurchased] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [favoriteKeys, setFavoriteKeys] = useState(new Set());
  const [showInlineVideo, setShowInlineVideo] = useState(false);
  const [isInlineVideoLoaded, setIsInlineVideoLoaded] = useState(false);
  const [didInlineVideoFail, setDidInlineVideoFail] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const mediaItem = await fetchMediaItemById(mediaType, mediaId);
        setItem(mediaItem);
        setIsSaved(isFavorite(mediaItem.type, mediaItem.id));
        setFavoriteKeys(new Set(getFavorites().map((favorite) => getFavoriteKey(favorite.type, favorite.id))));
        const related = await fetchRelatedMedia(mediaItem);
        setRelatedItems(related);
      } catch (error) {
        console.error('Failed to load media detail:', error);
        setItem(null);
      } finally {
        setLoading(false);
      }
    };

    if (mediaType && mediaId) {
      load();
    }
  }, [mediaType, mediaId]);

  useEffect(() => {
    const checkPurchase = async () => {
      if (!user || !item || item.isFree) {
        setIsPurchased(Boolean(item?.isFree));
        return;
      }

      const { data, error } = await supabase
        .from('sales')
        .select('id')
        .eq('buyer_id', user.id)
        .eq('item_id', item.id)
        .eq('item_type', saleItemType(item.type))
        .maybeSingle();

      if (error) {
        console.error('Failed to check purchase:', error);
        return;
      }

      setIsPurchased(Boolean(data));
    };

    checkPurchase();
  }, [item, user]);

  const canDownload = useMemo(() => Boolean(item && (item.isFree || isPurchased)), [item, isPurchased]);
  const youtubeId = item?.youtubeId || getYouTubeId(item?.originalUrl || '');
  const sourceType = item?.type === 'video' && youtubeId ? 'youtube' : 'image';
  const isYouTubeVideo = item?.type === 'video' && sourceType === 'youtube';
  const showHostedVideoPlayer = item?.type === 'video' && sourceType !== 'youtube' && canDownload;
  const videoPosterUrl =
    item?.previewUrl ||
    item?.thumbnailUrl ||
    (youtubeId ? `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg` : '');
  const youtubeEmbedUrl = youtubeId
    ? `https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1&playsinline=1&origin=${encodeURIComponent(window.location.origin)}`
    : '';
  const externalVideoUrl = item?.originalUrl || item?.downloadUrl || '';

  useEffect(() => {
    setShowInlineVideo(false);
    setIsInlineVideoLoaded(false);
    setDidInlineVideoFail(false);
  }, [youtubeEmbedUrl, mediaId]);

  useEffect(() => {
    if (!showInlineVideo || isInlineVideoLoaded || !isYouTubeVideo) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setDidInlineVideoFail(true);
    }, 4500);

    return () => window.clearTimeout(timeoutId);
  }, [isInlineVideoLoaded, isYouTubeVideo, showInlineVideo]);

  const handleToggleFavorite = () => {
    if (!item) return;
    const updated = toggleFavorite(item);
    const updatedKeys = new Set(updated.map((favorite) => getFavoriteKey(favorite.type, favorite.id)));
    setFavoriteKeys(updatedKeys);
    setIsSaved(updatedKeys.has(getFavoriteKey(item.type, item.id)));
  };

  const handleRelatedFavorite = (relatedItem) => {
    const updated = toggleFavorite(relatedItem);
    const updatedKeys = new Set(updated.map((favorite) => getFavoriteKey(favorite.type, favorite.id)));
    setFavoriteKeys(updatedKeys);
    if (item) {
      setIsSaved(updatedKeys.has(getFavoriteKey(item.type, item.id)));
    }
  };

  const handleDownload = () => {
    if (!item) return;

    if (isYouTubeVideo) {
      window.open(externalVideoUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    if (!canDownload) {
      if (!user) {
        toast({ title: 'Login Required', description: 'Please login to unlock premium assets.' });
        onNavigate('login');
        return;
      }

      setIsPaymentOpen(true);
      return;
    }

    window.open(item.downloadUrl, '_blank', 'noopener,noreferrer');
  };

  const handlePaymentSuccess = async (paymentDetails) => {
    if (!item || !user) return;

    try {
      const payload = {
        buyer_id: user.id,
        creator_id: item.creatorId,
        amount: item.price,
        item_id: item.id,
        item_type: saleItemType(item.type),
        razorpay_payment_id: paymentDetails.razorpay_payment_id || null,
      };

      const { error } = await supabase.from('sales').insert(payload);

      if (error && error.code !== '23505') throw error;

      setIsPurchased(true);
      setIsPaymentOpen(false);
      toast({ title: 'Purchase complete', description: 'This asset is now in your library.' });
    } catch (error) {
      console.error('Failed to save sale:', error);
      toast({
        variant: 'destructive',
        title: 'Purchase recorded with issue',
        description: error.message || 'Please contact support if access does not unlock.',
      });
    }
  };

  if (loading) {
    return (
      <div className="media-shell flex min-h-screen items-center justify-center text-white">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-200" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="media-shell flex min-h-screen flex-col items-center justify-center px-4 text-center text-white">
        <h1 className="text-3xl text-white">Media item not found</h1>
        <p className="media-copy mt-3 max-w-lg">
          The asset may have been removed, is still pending approval, or the link is invalid.
        </p>
        <Button
          className="mt-6 rounded-full bg-cyan-300 text-[#041b26] hover:bg-cyan-200"
          onClick={() => onNavigate('home')}
        >
          Back to Discover
        </Button>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{item.title} - Lifelapss Media</title>
        <meta name="description" content={item.description} />
      </Helmet>

      <div className="media-shell px-4 pb-20 pt-28 text-white lg:pt-32">
        <div className="mx-auto max-w-7xl space-y-10">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <Button
              variant="ghost"
              className="w-fit rounded-full border border-white/10 bg-white/5 pl-4 pr-5 text-white/72 hover:bg-white/10 hover:text-white"
              onClick={() => onNavigate(item.type === 'photo' ? 'photos' : 'videos')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to {item.type === 'photo' ? 'Photos' : 'Videos'}
            </Button>
            <div className="flex flex-wrap gap-3">
              <span className="media-chip">{item.category}</span>
              <span className="media-chip">{item.resolution}</span>
              <span className="media-chip">{item.type === 'video' ? 'Video Asset' : 'Photo Asset'}</span>
            </div>
          </div>

          <section className="media-panel relative overflow-hidden p-4 md:p-6">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(103,232,249,0.12),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(245,158,11,0.12),transparent_26%)]" />

            <div className="relative grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
              <div className="overflow-hidden rounded-[30px] border border-white/10 bg-black/35">
                <div className="relative aspect-[16/10] overflow-hidden bg-black">
                  {item.type === 'video' && sourceType === 'youtube' ? (
                    showInlineVideo ? (
                      <>
                        {videoPosterUrl ? (
                          <img
                            src={videoPosterUrl}
                            alt={item.title}
                            className="absolute inset-0 h-full w-full object-cover"
                          />
                        ) : null}
                        <iframe
                          className="relative z-10 h-full w-full"
                          src={youtubeEmbedUrl}
                          title={item.title}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                          referrerPolicy="strict-origin-when-cross-origin"
                          onLoad={() => {
                            setIsInlineVideoLoaded(true);
                            setDidInlineVideoFail(false);
                          }}
                        />
                        {didInlineVideoFail ? (
                          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 p-6 backdrop-blur-sm">
                            <div className="max-w-md rounded-[28px] border border-white/10 bg-[#08131c]/94 p-6 text-center">
                              <p className="text-lg font-semibold text-white">
                                Inline YouTube playback is being blocked
                              </p>
                              <p className="mt-3 text-sm leading-6 text-white/62">
                                This usually happens because the source video has embed restrictions or the browser blocks the player.
                              </p>
                              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-center">
                                <Button
                                  className="rounded-full bg-cyan-300 text-[#041b26] hover:bg-cyan-200"
                                  onClick={() =>
                                    window.open(externalVideoUrl, '_blank', 'noopener,noreferrer')
                                  }
                                >
                                  Open on YouTube
                                </Button>
                                <Button
                                  variant="outline"
                                  className="rounded-full border-white/10 bg-white/5 hover:bg-white/10"
                                  onClick={() => {
                                    setDidInlineVideoFail(false);
                                    setIsInlineVideoLoaded(false);
                                    setShowInlineVideo(false);
                                  }}
                                >
                                  Back to thumbnail
                                </Button>
                              </div>
                            </div>
                          </div>
                        ) : null}
                        {!isInlineVideoLoaded ? (
                          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                            <div className="flex items-center gap-3 rounded-full border border-white/10 bg-[#08131c]/90 px-5 py-3 text-white">
                              <Loader2 className="h-4 w-4 animate-spin text-cyan-100" />
                              <span className="text-sm font-medium">Loading video...</span>
                            </div>
                          </div>
                        ) : null}
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowInlineVideo(true)}
                        className="group relative h-full w-full"
                      >
                        <img
                          src={videoPosterUrl}
                          alt={item.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center">
                          <div className="flex h-[84px] w-[84px] items-center justify-center rounded-full border border-white/15 bg-black/45 text-white backdrop-blur-md transition-transform group-hover:scale-105">
                            <PlayCircle className="h-10 w-10" />
                          </div>
                          <div>
                            <p className="text-lg font-semibold text-white">Play video in website</p>
                            <p className="mt-2 text-sm text-white/68">
                              If the embedded player still fails, use the YouTube button on the right.
                            </p>
                          </div>
                        </div>
                      </button>
                    )
                  ) : showHostedVideoPlayer ? (
                    <video
                      className="h-full w-full object-cover"
                      src={item.downloadUrl}
                      poster={item.thumbnailUrl || item.previewUrl || undefined}
                      controls
                      playsInline
                      preload="metadata"
                    />
                  ) : (
                    <img src={item.previewUrl} alt={item.title} className="h-full w-full object-cover" />
                  )}

                  {item.type === 'video' && sourceType !== 'youtube' && !showHostedVideoPlayer ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full border border-white/15 bg-black/40 text-white backdrop-blur-md">
                        <PlayCircle className="h-9 w-9" />
                      </div>
                    </div>
                  ) : null}
                </div>
                {isYouTubeVideo ? (
                  <div className="border-t border-white/10 bg-white/[0.03] px-4 py-3">
                    <div className="flex flex-col gap-3 text-sm text-white/58 sm:flex-row sm:items-center sm:justify-between">
                      <p>
                        This video uses YouTube. If inline playback is blocked by the source video or browser,
                        open it directly on YouTube.
                      </p>
                      <button
                        type="button"
                        onClick={() => window.open(externalVideoUrl, '_blank', 'noopener,noreferrer')}
                        className="inline-flex items-center font-semibold text-cyan-100 hover:text-cyan-50"
                      >
                        Open on YouTube
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>

              <aside className="flex flex-col gap-6">
                <div>
                  <p className="media-kicker">Asset Detail</p>
                  <h1 className="mt-4 text-4xl text-white md:text-5xl">{item.title}</h1>
                  <p className="media-copy mt-4">{item.description}</p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="media-panel-soft p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/42">
                      Creator
                    </p>
                    <p className="mt-3 text-xl font-semibold text-white">{item.creatorName}</p>
                  </div>
                  <div className="media-panel-soft p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/42">
                      License
                    </p>
                    <p className="mt-3 text-xl font-semibold text-white">Royalty-free</p>
                  </div>
                  <div className="media-panel-soft p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/42">
                      Access
                    </p>
                    <p className="mt-3 text-xl font-semibold text-white">
                      {item.isFree ? 'Free download' : isPurchased ? 'Owned' : 'Premium unlock'}
                    </p>
                  </div>
                  <div className="media-panel-soft p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/42">
                      Format
                    </p>
                    <p className="mt-3 text-xl font-semibold text-white">
                      {item.type === 'video' ? 'Motion clip' : 'Still image'}
                    </p>
                  </div>
                </div>

                <div className="media-panel-soft p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/42">
                        Access Price
                      </p>
                      <h2 className="mt-3 text-4xl text-white">
                        {item.isFree ? 'Free' : isPurchased ? 'Owned' : `$${item.price.toFixed(2)}`}
                      </h2>
                    </div>
                    <div className="rounded-full border border-cyan-300/20 bg-cyan-400/10 p-3 text-cyan-100">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                  </div>

                  <div className="mt-5 flex flex-col gap-3">
                    <Button
                      className="rounded-full bg-cyan-300 text-[#041b26] hover:bg-cyan-200"
                      onClick={handleDownload}
                    >
                      {isYouTubeVideo ? (
                        <PlayCircle className="mr-2 h-4 w-4" />
                      ) : canDownload ? (
                        <Download className="mr-2 h-4 w-4" />
                      ) : (
                        <Lock className="mr-2 h-4 w-4" />
                      )}
                      {isYouTubeVideo ? 'Watch on YouTube' : canDownload ? 'Download Asset' : 'Unlock & Download'}
                    </Button>
                    {isYouTubeVideo ? (
                      <Button
                        variant="outline"
                        className="rounded-full border-white/10 bg-white/5 hover:bg-white/10"
                        onClick={() => window.open(externalVideoUrl, '_blank', 'noopener,noreferrer')}
                      >
                        Open Source Link
                      </Button>
                    ) : null}
                    <Button
                      variant="outline"
                      className="rounded-full border-white/10 bg-white/5 hover:bg-white/10"
                      onClick={handleToggleFavorite}
                    >
                      <Bookmark className={`mr-2 h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
                      {isSaved ? 'Saved to Favorites' : 'Save to Favorites'}
                    </Button>
                  </div>
                </div>

                <div className="rounded-[28px] border border-amber-200/12 bg-amber-200/[0.05] p-5">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full border border-amber-200/20 bg-amber-200/10 p-2 text-amber-100">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">Admin-curated release</p>
                      <p className="mt-1 text-sm leading-6 text-white/58">
                        {isYouTubeVideo
                          ? 'This video is sourced from YouTube. If the embedded player is restricted by YouTube, use the direct watch button above.'
                          : 'This asset is published from the admin panel, which keeps the public catalog more consistent and trustworthy.'}
                      </p>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </section>

          <section className="space-y-4">
            <div>
              <p className="media-kicker">Related Assets</p>
              <h2 className="mt-3 text-3xl text-white">More from this visual lane</h2>
            </div>

            {relatedItems.length === 0 ? (
              <div className="media-panel-soft p-8 text-white/55">
                Related assets will appear here when more items match this category.
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
                {relatedItems.map((related) => (
                  <MediaCard
                    key={getFavoriteKey(related.type, related.id)}
                    item={related}
                    saved={favoriteKeys.has(getFavoriteKey(related.type, related.id))}
                    onToggleSave={handleRelatedFavorite}
                    onDownload={(mediaItem) => onNavigate('media', { type: mediaItem.type, id: mediaItem.id })}
                    onTagSelect={(tag) => onNavigate('search', { query: `#${tag}` })}
                    onPreview={(mediaItem) => onNavigate('media', { type: mediaItem.type, id: mediaItem.id })}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      {item ? (
        <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Unlock "{item.title}"</DialogTitle>
            </DialogHeader>
            <PaymentComponent
              amount={item.price}
              itemName={item.title}
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentError={(error) =>
                toast({
                  variant: 'destructive',
                  title: 'Payment Failed',
                  description: error.description || error.message || 'Could not complete payment.',
                })
              }
            />
          </DialogContent>
        </Dialog>
      ) : null}
    </>
  );
};

export default MediaDetailPage;
