import React, { useState, useEffect } from 'react';
import { CheckCircle, ChevronDown, ChevronUp, FileText, Play } from 'lucide-react';

const ChapterList = ({
  chapters = [],
  resources = [],
  activeItem,
  onChapterSelect,
  onResourceSelect,
}) => {
  const [expandedChapters, setExpandedChapters] = useState({});

  useEffect(() => {
    if (activeItem?.type === 'chapter' && activeItem.id) {
      setExpandedChapters((previous) => ({
        ...previous,
        [activeItem.id]: true,
      }));
    }
  }, [activeItem]);

  if ((!chapters || chapters.length === 0) && resources.length === 0) {
    return <div className="p-4 text-center text-white/48">No course content is available right now.</div>;
  }

  const toggleChapterExpand = (chapterId, event) => {
    event.stopPropagation();
    setExpandedChapters((previous) => ({
      ...previous,
      [chapterId]: !previous[chapterId],
    }));
  };

  const lessonCount = chapters.reduce(
    (total, chapter) => total + Math.max(chapter.subchapters?.length || 0, 1),
    0
  );
  const totalItems = lessonCount + resources.length;

  return (
    <div className="space-y-3 p-4">
      <div className="media-panel-soft p-4">
        <h2 className="text-lg text-white">Course Content</h2>
        <p className="mt-2 text-sm text-white/46">
          {chapters.length} chapters · {totalItems} items
        </p>
      </div>

      <div className="space-y-4">
        {chapters.length > 0 ? (
          <div>
            <p className="px-1 text-xs uppercase tracking-[0.24em] text-white/30">Lessons</p>
            <ul className="mt-3 space-y-3">
              {chapters.map((chapter, index) => {
                const hasSubchapters = Array.isArray(chapter.subchapters) && chapter.subchapters.length > 0;
                const isActive = activeItem?.type === 'chapter' && activeItem.id === chapter.id;

                return (
                  <li key={chapter.id} className="media-panel-soft overflow-hidden">
                    <div
                      className={`cursor-pointer p-4 transition-colors ${
                        isActive ? 'bg-cyan-300/10' : 'hover:bg-white/[0.03]'
                      }`}
                      onClick={() => onChapterSelect(chapter.id)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 flex-1 items-start gap-3">
                          {chapter.completed ? (
                            <CheckCircle className="mt-0.5 h-5 w-5 text-cyan-100" />
                          ) : (
                            <div className="mt-0.5 h-5 w-5 rounded-full border border-white/18" />
                          )}
                          <div className="min-w-0">
                            <h3 className={`font-medium ${chapter.completed ? 'text-cyan-100' : 'text-white'}`}>
                              Video {index + 1} · {chapter.title}
                            </h3>
                            <p className="mt-1 text-xs uppercase tracking-[0.22em] text-white/38">
                              {chapter.completed ? 'Completed' : 'Click to watch'}
                            </p>
                          </div>
                        </div>

                        {hasSubchapters ? (
                          <button
                            type="button"
                            onClick={(event) => toggleChapterExpand(chapter.id, event)}
                            className="rounded-full border border-white/10 bg-white/5 p-2 text-white/52 transition-colors hover:bg-white/10 hover:text-white"
                          >
                            {expandedChapters[chapter.id] ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </button>
                        ) : (
                          <Play className="mt-0.5 h-4 w-4 text-cyan-100/60" />
                        )}
                      </div>
                    </div>

                    {expandedChapters[chapter.id] && hasSubchapters ? (
                      <ul className="border-t border-white/8 bg-black/12 px-4 pb-3">
                        {chapter.subchapters.map((subchapter, subIndex) => (
                          <li
                            key={subchapter.id}
                            className="mt-3 cursor-pointer rounded-[18px] border border-white/8 bg-white/[0.02] px-4 py-3 transition-colors hover:bg-white/[0.04]"
                            onClick={() => onChapterSelect(chapter.id)}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <Play className="h-4 w-4 text-cyan-100/76" />
                                <p className="text-sm text-white/72">
                                  Video {index + 1}.{subIndex + 1} · {subchapter.title}
                                </p>
                              </div>
                              <span className="text-xs uppercase tracking-[0.22em] text-white/34">
                                Ready
                              </span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}

        {resources.length > 0 ? (
          <div>
            <p className="px-1 text-xs uppercase tracking-[0.24em] text-white/30">Reference PDFs</p>
            <ul className="mt-3 space-y-3">
              {resources.map((resource, index) => {
                const isActive = activeItem?.type === 'resource' && activeItem.id === resource.id;

                return (
                  <li key={resource.id} className="media-panel-soft overflow-hidden">
                    <button
                      type="button"
                      className={`flex w-full items-center gap-3 p-4 text-left transition-colors ${
                        isActive ? 'bg-cyan-300/10' : 'hover:bg-white/[0.03]'
                      }`}
                      onClick={() => onResourceSelect?.(resource.id)}
                    >
                      <FileText className="h-5 w-5 text-cyan-100/76" />
                      <div>
                        <h3 className="font-medium text-white">
                          PDF {index + 1} · {resource.title}
                        </h3>
                        <p className="mt-1 text-xs uppercase tracking-[0.22em] text-white/34">
                          Click to open
                        </p>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ChapterList;
