import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { BookOpen, Star, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/useAuth';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import MediaPageHeader from '@/components/media/MediaPageHeader';
import { getAllCourses } from '@/services/courseService';

const EnrolledCoursesPage = ({ onNavigate }) => {
  const { user } = useAuth();
  const [courseData, setCourseData] = useState([]);

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      if (user) {
        try {
          const [{ data: enrolled, error }, catalog] = await Promise.all([
            supabase.from('enrollments').select('course_id').eq('user_id', user.id),
            getAllCourses(),
          ]);

          if (error) throw error;

          const enrolledIds = enrolled.map((item) => item.course_id.toString());
          const userCourses = catalog.filter((course) =>
            enrolledIds.includes(String(course.id))
          );
          setCourseData(userCourses);
        } catch (error) {
          console.error('Error loading enrolled courses:', error);
          toast({
            title: 'Error',
            description: 'Failed to load enrolled courses.',
            variant: 'destructive',
          });
        }
      }
    };

    fetchEnrolledCourses();
  }, [user]);

  const stats = useMemo(
    () => [
      { label: 'Enrolled Courses', value: courseData.length },
      { label: 'Access', value: 'Lifetime' },
      { label: 'Format', value: 'Video + PDF' },
      { label: 'Library Sync', value: 'Active' },
    ],
    [courseData.length]
  );

  return (
    <>
      <Helmet>
        <title>My Enrolled Courses - Lifelapss</title>
        <meta name="description" content="View your enrolled courses and continue learning." />
      </Helmet>

      <div className="media-shell px-4 pb-20 pt-28 text-white lg:pt-32">
        <div className="mx-auto max-w-7xl space-y-8">
          <MediaPageHeader
            eyebrow="My Courses"
            title="Continue your learning from one cleaner library view"
            description="Your enrolled course area now matches the rest of the site and stays connected to the same account experience."
            imageUrl={courseData[0]?.image}
            stats={stats}
            actions={
              <>
                <Button
                  variant="outline"
                  className="rounded-full border-white/10 bg-white/5 hover:bg-white/10"
                  onClick={() => onNavigate('courses')}
                >
                  Browse All Courses
                </Button>
                <Button
                  className="rounded-full bg-cyan-300 text-[#041b26] hover:bg-cyan-200"
                  onClick={() => onNavigate('library')}
                >
                  Open My Library
                </Button>
              </>
            }
          />

          {courseData.length === 0 ? (
            <div className="media-panel flex min-h-[320px] flex-col items-center justify-center text-center">
              <h3 className="text-2xl text-white">You have not enrolled in any courses yet</h3>
              <p className="media-copy mt-3 max-w-xl">
                Explore the course catalog and start your learning journey when you are ready.
              </p>
              <Button
                onClick={() => onNavigate('courses')}
                className="mt-6 rounded-full bg-cyan-300 text-[#041b26] hover:bg-cyan-200"
              >
                Browse Courses
              </Button>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
              {courseData.map((course) => (
                <motion.article
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="media-panel overflow-hidden"
                >
                  <div className="h-48 overflow-hidden">
                    <img src={course.image} alt={course.title} className="h-full w-full object-cover" />
                  </div>
                  <div className="p-6">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <span className="media-chip">{course.category}</span>
                      <div className="flex items-center gap-2 text-white/58">
                        <Star className="h-4 w-4 text-amber-200" />
                        <span>{course.rating}</span>
                      </div>
                    </div>

                    <h3 className="text-2xl text-white">{course.title}</h3>
                    <p className="media-copy mt-3">Continue your current progress, PDFs, and course videos from here.</p>

                    <div className="mt-5 flex items-center gap-4 text-sm text-white/52">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-cyan-100" />
                        <span>{course.students}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-cyan-100" />
                        <span>{course.instructor}</span>
                      </div>
                    </div>

                    <Button
                      className="mt-6 w-full rounded-full bg-cyan-300 text-[#041b26] hover:bg-cyan-200"
                      onClick={() => onNavigate('course', { id: course.id })}
                    >
                      Continue Learning
                    </Button>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default EnrolledCoursesPage;
