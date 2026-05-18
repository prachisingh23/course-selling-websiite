import React, { useState, useEffect } from 'react';
import ChapterList from '../components/ChapterList';
import ChapterContent from '../components/ChapterContent';
import { useAuth } from '@/contexts/useAuth';
import { getCourseById, getCourseProgress, updateChapterStatus } from '../services/courseService';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CourseDetailPage = ({ onNavigate, courseId }) => {
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setLoading(true);

        if (!courseId) {
          setError('Course ID is missing. Please try again.');
          setLoading(false);
          return;
        }

        const courseData = await getCourseById(courseId.toString());

        if (user) {
          const progress = await getCourseProgress(user.id, courseId.toString());

          const updatedChapters = courseData.chapters.map((chapter) => ({
            ...chapter,
            completed: progress[chapter.id] || false,
          }));

          const enrichedCourseData = {
            ...courseData,
            chapters: updatedChapters,
          };
          setCourse(enrichedCourseData);

          if (enrichedCourseData.chapters?.length > 0) {
            setSelectedItem({ type: 'chapter', id: enrichedCourseData.chapters[0].id });
          } else if (enrichedCourseData.resources?.length > 0) {
            setSelectedItem({ type: 'resource', id: enrichedCourseData.resources[0].id });
          }
        } else {
          setCourse(courseData);
          if (courseData.chapters?.length > 0) {
            setSelectedItem({ type: 'chapter', id: courseData.chapters[0].id });
          } else if (courseData.resources?.length > 0) {
            setSelectedItem({ type: 'resource', id: courseData.resources[0].id });
          }
        }

        setLoading(false);
      } catch (error) {
        console.error('Error loading course:', error);
        setError('Failed to load course data. Please try again.');
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId, user]);

  const activeChapter = selectedItem?.type === 'chapter'
    ? course?.chapters?.find((chapter) => chapter.id === selectedItem.id) || null
    : null;

  const activeResource = selectedItem?.type === 'resource'
    ? course?.resources?.find((resource) => resource.id === selectedItem.id) || null
    : null;

  const handleChapterSelect = (chapterId) => {
    setSelectedItem({ type: 'chapter', id: chapterId });
  };

  const handleResourceSelect = (resourceId) => {
    setSelectedItem({ type: 'resource', id: resourceId });
  };

  const handleMarkComplete = async (chapterId) => {
    if (!course || !user) return;

    try {
      await updateChapterStatus(user.id, courseId, chapterId, true);

      const updatedChapters = course.chapters.map((chapter) =>
        chapter.id === chapterId ? { ...chapter, completed: true } : chapter
      );

      setCourse({
        ...course,
        chapters: updatedChapters,
      });
    } catch (error) {
      console.error('Failed to update chapter status:', error);
    }
  };

  if (loading) {
    return (
      <div className="media-shell flex min-h-screen items-center justify-center text-white">
        <div className="text-xl font-semibold">Loading course content...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="media-shell flex min-h-screen flex-col items-center justify-center text-white">
        <div className="text-xl font-semibold text-red-300">{error}</div>
        <Button
          onClick={() => onNavigate('enrolled-courses')}
          className="mt-4 rounded-full bg-cyan-300 text-[#041b26] hover:bg-cyan-200"
        >
          Back to My Courses
        </Button>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="media-shell flex min-h-screen flex-col items-center justify-center text-white">
        <div className="text-xl font-semibold">Course not found</div>
        <Button
          onClick={() => onNavigate('enrolled-courses')}
          className="mt-4 rounded-full bg-cyan-300 text-[#041b26] hover:bg-cyan-200"
        >
          Back to My Courses
        </Button>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{course.title} - Lifelapss</title>
        <meta name="description" content={`Start learning ${course.title}. Access videos, PDFs, and track your progress.`} />
      </Helmet>

      <div className="media-shell min-h-screen px-4 pb-12 pt-28 text-white lg:pt-32">
        <div className="mx-auto max-w-7xl space-y-6">
          <Button
            variant="ghost"
            onClick={() => onNavigate('enrolled-courses')}
            className="rounded-full border border-white/10 bg-white/5 pl-4 pr-5 text-white/72 hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to My Courses
          </Button>

          <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
            <aside className="media-panel overflow-hidden">
              <div className="border-b border-white/10 p-5">
                <p className="media-kicker">Learning Path</p>
                <h1 className="mt-3 text-2xl text-white">{course.title}</h1>
              </div>
              <ChapterList
                chapters={course.chapters}
                resources={course.resources}
                activeItem={selectedItem}
                onChapterSelect={handleChapterSelect}
                onResourceSelect={handleResourceSelect}
              />
            </aside>

            <main>
              <ChapterContent
                chapter={activeChapter}
                resource={activeResource}
                onMarkComplete={handleMarkComplete}
                courseId={courseId}
              />
            </main>
          </div>
        </div>
      </div>
    </>
  );
};

export default CourseDetailPage;
