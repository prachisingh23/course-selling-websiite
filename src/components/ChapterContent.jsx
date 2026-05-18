import React, { useState, useEffect } from 'react';
import { AlertTriangle, Award, BookOpen, CheckCircle, Clock, ExternalLink, FileText } from 'lucide-react';
import { getSubchapters } from '../services/courseService';
import { getYouTubeId } from '../services/mediaService';

const ChapterContent = ({ chapter, resource, onMarkComplete, courseId }) => {
  const [subchapters, setSubchapters] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    if (!chapter || !courseId) {
      setSubchapters([]);
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    getSubchapters(courseId, chapter.id)
      .then((data) => {
        if (cancelled) {
          return;
        }

        setSubchapters(data);
        setLoading(false);
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }

        console.error('Error loading subchapters:', error);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [chapter, courseId]);

  if (!chapter && !resource) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-white/48">
        Select a chapter to begin learning.
      </div>
    );
  }

  if (resource) {
    const resourceEmbedUrl = resource.embedUrl || '';
    const resourceExternalUrl = resource.externalUrl || resourceEmbedUrl;

    return (
      <div className="space-y-6">
        <div className="media-panel overflow-hidden rounded-[30px]">
          <div className="relative w-full bg-black pb-[56.25%]">
            {resourceEmbedUrl ? (
              <iframe
                className="absolute left-0 top-0 h-full w-full"
                src={resourceEmbedUrl}
                title={resource.title}
                frameBorder="0"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center p-6">
                <div className="max-w-lg rounded-[28px] border border-white/10 bg-[#08131c]/92 p-6 text-center">
                  <AlertTriangle className="mx-auto h-10 w-10 text-amber-200" />
                  <h3 className="mt-4 text-xl font-semibold text-white">
                    PDF preview is not available in the website player
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-white/60">
                    Open this resource directly in a new browser tab instead.
                  </p>
                  {resourceExternalUrl ? (
                    <a
                      href={resourceExternalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-5 inline-flex items-center rounded-full bg-cyan-300 px-5 py-3 text-sm font-semibold text-[#041b26] transition-colors hover:bg-cyan-200"
                    >
                      Open PDF
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  ) : null}
                </div>
              </div>
            )}
          </div>

          {resourceExternalUrl ? (
            <div className="border-t border-white/10 bg-white/[0.03] px-4 py-3">
              <div className="flex flex-col gap-3 text-sm text-white/58 sm:flex-row sm:items-center sm:justify-between">
                <p>If the PDF does not load in the embedded preview, open it directly in a new tab.</p>
                <a
                  href={resourceExternalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center font-semibold text-cyan-100 hover:text-cyan-50"
                >
                  Open PDF
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </div>
            </div>
          ) : null}
        </div>

        <div className="media-panel-soft p-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="media-kicker">Reference Material</p>
              <h2 className="mt-3 text-3xl text-white">{resource.title}</h2>
              <p className="mt-2 text-sm uppercase tracking-[0.22em] text-white/38">
                PDF resource
              </p>
            </div>
            {resourceExternalUrl ? (
              <a
                href={resourceExternalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-full bg-cyan-300 px-5 py-3 text-sm font-semibold text-[#041b26] transition-colors hover:bg-cyan-200"
              >
                Open PDF in New Tab
                <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            ) : null}
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="media-panel-soft p-4">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-cyan-100" />
                <div>
                  <p className="text-sm font-medium text-white">PDF</p>
                  <p className="text-xs uppercase tracking-[0.22em] text-white/36">Format</p>
                </div>
              </div>
            </div>
            <div className="media-panel-soft p-4">
              <div className="flex items-center gap-3">
                <BookOpen className="h-5 w-5 text-cyan-100" />
                <div>
                  <p className="text-sm font-medium text-white">Reference guide</p>
                  <p className="text-xs uppercase tracking-[0.22em] text-white/36">Type</p>
                </div>
              </div>
            </div>
            <div className="media-panel-soft p-4">
              <div className="flex items-center gap-3">
                <ExternalLink className="h-5 w-5 text-amber-200" />
                <div>
                  <p className="text-sm font-medium text-white">
                    {resourceExternalUrl ? 'Available' : 'Unavailable'}
                  </p>
                  <p className="text-xs uppercase tracking-[0.22em] text-white/36">Open in Browser</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-xl text-white">Description</h3>
            <p className="media-copy mt-3">
              {resource.description || 'Course reference material for this lesson.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const youtubeId = getYouTubeId(chapter.videoUrl || '');
  const youtubeEmbedUrl = youtubeId
    ? `https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=0&rel=0&modestbranding=1&playsinline=1`
    : '';
  const youtubeWatchUrl = youtubeId
    ? `https://www.youtube.com/watch?v=${youtubeId}`
    : chapter.videoUrl || '';
  const conceptLabel = loading
    ? 'Loading...'
    : subchapters.length > 0
      ? `${subchapters.length} key concepts`
      : 'Concepts will be added soon';

  return (
    <div className="space-y-6">
      <div className="media-panel overflow-hidden rounded-[30px]">
        <div className="relative w-full bg-black pb-[56.25%]">
          {youtubeEmbedUrl ? (
            <iframe
              className="absolute left-0 top-0 h-full w-full"
              src={youtubeEmbedUrl}
              title={chapter.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center p-6">
              <div className="max-w-lg rounded-[28px] border border-white/10 bg-[#08131c]/92 p-6 text-center">
                <AlertTriangle className="mx-auto h-10 w-10 text-amber-200" />
                <h3 className="mt-4 text-xl font-semibold text-white">
                  Video could not be loaded in the website player
                </h3>
                <p className="mt-3 text-sm leading-6 text-white/60">
                  This chapter does not have a valid embeddable YouTube link right now.
                </p>
                {youtubeWatchUrl ? (
                  <a
                    href={youtubeWatchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 inline-flex items-center rounded-full bg-cyan-300 px-5 py-3 text-sm font-semibold text-[#041b26] transition-colors hover:bg-cyan-200"
                  >
                    Open on YouTube
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                ) : null}
              </div>
            </div>
          )}
        </div>

        {youtubeWatchUrl ? (
          <div className="border-t border-white/10 bg-white/[0.03] px-4 py-3">
            <div className="flex flex-col gap-3 text-sm text-white/58 sm:flex-row sm:items-center sm:justify-between">
              <p>If the video does not load in the embedded player, open it directly on YouTube.</p>
              <a
                href={youtubeWatchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center font-semibold text-cyan-100 hover:text-cyan-50"
              >
                Open on YouTube
                <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </div>
          </div>
        ) : null}
      </div>

      <div className="media-panel-soft p-6">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="media-kicker">Chapter Detail</p>
            <h2 className="mt-3 text-3xl text-white">{chapter.title}</h2>
            <p className="mt-2 text-sm uppercase tracking-[0.22em] text-white/38">
              {chapter.duration} · Chapter {chapter.id.replace('ch', '')}
            </p>
          </div>
          <div>
            {chapter.completed ? (
              <span className="inline-flex items-center rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-100">
                <CheckCircle className="mr-2 h-4 w-4" />
                Completed
              </span>
            ) : (
              <button
                type="button"
                onClick={() => onMarkComplete(chapter.id)}
                className="inline-flex items-center rounded-full bg-cyan-300 px-5 py-3 text-sm font-semibold text-[#041b26] transition-colors hover:bg-cyan-200"
              >
                <Award className="mr-2 h-4 w-4" />
                Mark as Complete
              </button>
            )}
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="media-panel-soft p-4">
            <div className="flex items-center gap-3">
              <BookOpen className="h-5 w-5 text-cyan-100" />
              <div>
                <p className="text-sm font-medium text-white">{conceptLabel}</p>
                <p className="text-xs uppercase tracking-[0.22em] text-white/36">Concepts</p>
              </div>
            </div>
          </div>
          <div className="media-panel-soft p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-cyan-100" />
              <div>
                <p className="text-sm font-medium text-white">{chapter.duration}</p>
                <p className="text-xs uppercase tracking-[0.22em] text-white/36">Duration</p>
              </div>
            </div>
          </div>
          <div className="media-panel-soft p-4">
            <div className="flex items-center gap-3">
              <Award className="h-5 w-5 text-amber-200" />
              <div>
                <p className="text-sm font-medium text-white">{chapter.completed ? 'Completed' : 'In Progress'}</p>
                <p className="text-xs uppercase tracking-[0.22em] text-white/36">Status</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-xl text-white">Description</h3>
          <p className="media-copy mt-3">{chapter.description}</p>
        </div>
      </div>
    </div>
  );
};

export default ChapterContent;
