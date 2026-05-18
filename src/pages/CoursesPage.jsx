import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Clock3,
  GraduationCap,
  Loader2,
  Search,
  Star,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/useAuth';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import MediaPageHeader from '@/components/media/MediaPageHeader';
import { getAllCourses, storeSelectedCourseId } from '@/services/courseService';

const mentors = [
  {
    name: 'Kapil',
    role: 'AI Workflow Mentor',
    bio: 'Builds repeatable AI systems for prompts, visual ideation, and creator-friendly production flow.',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?fit=crop&w=400&h=400',
  },
  {
    name: 'Ethan Brooks',
    role: 'Creative Direction Mentor',
    bio: 'Focuses on cinematic pacing, edit decisions, storytelling structure, and packaging that feels premium.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=crop&w=400&h=400',
  },
];

const CoursesPage = ({ onNavigate }) => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [courseSearch, setCourseSearch] = useState('');
  const [activeCourseId, setActiveCourseId] = useState(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);

      try {
        const [catalog, enrollmentsResult] = await Promise.all([
          getAllCourses(),
          user
            ? supabase.from('enrollments').select('course_id').eq('user_id', user.id)
            : Promise.resolve({ data: [], error: null }),
        ]);

        if (!mounted) {
          return;
        }

        if (enrollmentsResult.error) {
          throw enrollmentsResult.error;
        }

        setCourses(catalog);
        setEnrolledCourses((enrollmentsResult.data || []).map((item) => String(item.course_id)));
      } catch (error) {
        console.error('Failed to load courses:', error);

        if (mounted) {
          setCourses([]);
          setEnrolledCourses([]);
          toast({
            title: 'Course Error',
            description: 'We could not load the course catalog right now.',
            variant: 'destructive',
          });
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [user]);

  const filteredCourses = useMemo(() => {
    const query = courseSearch.trim().toLowerCase();

    if (!query) {
      return courses;
    }

    return courses.filter((course) => {
      const searchText = [
        course.title,
        course.instructor,
        course.category,
        course.level,
        course.format,
        course.description,
        ...(course.highlights || []),
        ...(course.outcomes || []),
        ...(course.chapters || []).flatMap((chapter) => [chapter.title, chapter.description]),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchText.includes(query);
    });
  }, [courseSearch, courses]);

  useEffect(() => {
    if (!courses.length) {
      setActiveCourseId(null);
      return;
    }

    if (!filteredCourses.length) {
      if (courseSearch.trim()) {
        setActiveCourseId(null);
        return;
      }

      if (!activeCourseId) {
        setActiveCourseId(courses[0]?.id || null);
      }
      return;
    }

    const activeExistsInFiltered = filteredCourses.some((course) => String(course.id) === String(activeCourseId));
    if (!activeCourseId || !activeExistsInFiltered) {
      setActiveCourseId(filteredCourses[0]?.id || courses[0]?.id || null);
    }
  }, [activeCourseId, courseSearch, courses, filteredCourses]);

  const featuredCourse = filteredCourses.length > 0
    ? filteredCourses.find((course) => String(course.id) === String(activeCourseId)) || filteredCourses[0]
    : courseSearch.trim()
      ? null
      : courses[0] || null;
  const hasMultipleCourses = courses.length > 1;
  const isFeaturedCourseEnrolled = featuredCourse
    ? enrolledCourses.includes(String(featuredCourse.id))
    : false;

  const stats = useMemo(() => {
    const lessonCount = courses.reduce(
      (total, course) => total + (course.chapters?.length || 0),
      0
    );

    return [
      { label: 'Course', value: courses.length || '0' },
      { label: 'Lessons', value: lessonCount || '0' },
      { label: 'Mentors', value: mentors.length },
      { label: 'Access', value: 'Lifetime' },
    ];
  }, [courses]);

  const scrollToSection = (sectionId) => {
    const target = document.getElementById(sectionId);
    if (!target) {
      return;
    }

    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleEnroll = (course) => {
    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please login to enroll in courses.',
        variant: 'destructive',
      });
      onNavigate('login');
      return;
    }

    const isEnrolled = enrolledCourses.includes(String(course.id));

    if (isEnrolled) {
      onNavigate('course', { id: course.id });
      return;
    }

    storeSelectedCourseId(course.id);
    window.selectedCourse = course;
    onNavigate('payment');
  };

  return (
    <>
      <Helmet>
        <title>Courses - Lifelapss</title>
        <meta
          name="description"
          content="Learn AI cinematic video creation with the main Lifelapss course by Kapil and Ethan Brooks."
        />
      </Helmet>

      <div className="media-shell px-4 pb-24 pt-28 text-white lg:pt-32">
        <div className="mx-auto max-w-7xl space-y-8">
          <MediaPageHeader
            eyebrow="Courses"
            title="Start enrollment without searching through the full page"
            description="The main flagship program stays here with a cleaner layout, faster buying path, and the full course details right below."
            imageUrl={featuredCourse?.image}
            stats={stats}
            actions={
              <>
                <Button
                  className="rounded-full bg-cyan-300 text-[#041b26] hover:bg-cyan-200"
                  onClick={() => {
                    if (featuredCourse) {
                      handleEnroll(featuredCourse);
                      return;
                    }

                    scrollToSection('course-purchase');
                  }}
                >
                  {featuredCourse && enrolledCourses.includes(String(featuredCourse.id)) ? 'Continue Course' : 'Buy Course'}
                </Button>
                <Button
                  variant="outline"
                  className="rounded-full border-white/10 bg-white/5 hover:bg-white/10"
                  onClick={() => scrollToSection('course-catalog')}
                >
                  Browse Course
                </Button>
                {user ? (
                  <Button
                    variant="outline"
                    className="rounded-full border-white/10 bg-white/5 hover:bg-white/10"
                    onClick={() => onNavigate('enrolled-courses')}
                  >
                    Open My Courses
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    className="rounded-full border-white/10 bg-white/5 hover:bg-white/10"
                    onClick={() => onNavigate('signup')}
                  >
                    Create Account
                  </Button>
                )}
              </>
            }
          />

          {loading ? (
            <section
              id="course-purchase"
              className="media-panel-soft flex min-h-[280px] items-center justify-center rounded-[34px] p-6 md:p-8 scroll-mt-32"
            >
              <Loader2 className="h-8 w-8 animate-spin text-cyan-200" />
            </section>
          ) : featuredCourse ? (
            <>
              <section
                id="course-purchase"
                className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr] scroll-mt-32"
              >
                <div className="media-panel-soft rounded-[34px] p-6 md:p-8">
                  <p className="media-kicker">Quick Purchase</p>
                  <h2 className="mt-3 text-3xl text-white">{featuredCourse.title}</h2>
                  <p className="media-copy mt-4 max-w-3xl">
                    Everything important stays above the fold: what the course covers, what is
                    included, and the direct path into enrollment.
                  </p>

                  <div className="mt-6 flex flex-wrap gap-3 text-sm text-white/66">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2">
                      <BookOpen className="h-4 w-4 text-cyan-100" />
                      <span>{featuredCourse.chapters.length} lessons</span>
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2">
                      <Clock3 className="h-4 w-4 text-cyan-100" />
                      <span>{featuredCourse.duration}</span>
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2">
                      <Users className="h-4 w-4 text-cyan-100" />
                      <span>{featuredCourse.students} enrolled</span>
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2">
                      <BadgeCheck className="h-4 w-4 text-cyan-100" />
                      <span>{featuredCourse.resources?.length || 0} PDF resources</span>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-3 md:grid-cols-3">
                    {featuredCourse.highlights.slice(0, 3).map((highlight) => (
                      <div key={highlight} className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4 text-sm leading-6 text-white/64">
                        {highlight}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="media-panel rounded-[34px] p-6 md:p-8">
                  <p className="media-kicker">Enrollment</p>
                  <h2 className="mt-3 text-3xl text-white">
                    {isFeaturedCourseEnrolled ? 'Continue your course' : 'Buy once and keep lifetime access'}
                  </h2>
                  <p className="media-copy mt-4">
                    Full access to every lesson and downloadable guide, with the same course flow
                    available anytime from your library.
                  </p>

                  <div className="mt-6 border-y border-white/10 py-5">
                    <p className="text-sm text-white/34 line-through">{featuredCourse.originalPrice}</p>
                    <p className="mt-2 text-5xl text-cyan-100">{featuredCourse.price}</p>
                    <p className="mt-3 text-sm text-white/52">
                      Instructor: {featuredCourse.instructor}
                    </p>
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/38">
                        Rating
                      </p>
                      <p className="mt-2 flex items-center gap-2 text-lg text-white">
                        <Star className="h-4 w-4 text-amber-200" />
                        {featuredCourse.rating}
                      </p>
                    </div>
                    <div className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/38">
                        Format
                      </p>
                      <p className="mt-2 text-lg text-white">{featuredCourse.format}</p>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col gap-3">
                    <Button
                      onClick={() => handleEnroll(featuredCourse)}
                      className={`rounded-full px-6 ${
                        isFeaturedCourseEnrolled
                          ? 'bg-emerald-500 text-[#04130d] hover:bg-emerald-400'
                          : 'bg-cyan-300 text-[#041b26] hover:bg-cyan-200'
                      }`}
                    >
                      {isFeaturedCourseEnrolled ? 'Continue Course' : 'Buy This Course'}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      className="rounded-full border-white/10 bg-white/5 hover:bg-white/10"
                      onClick={() => scrollToSection('course-catalog')}
                    >
                      View Curriculum
                    </Button>
                    {hasMultipleCourses ? (
                      <Button
                        variant="outline"
                        className="rounded-full border-white/10 bg-white/5 hover:bg-white/10"
                        onClick={() => scrollToSection('course-picker')}
                      >
                        Browse All Courses
                      </Button>
                    ) : null}
                  </div>
                </div>
              </section>

              {hasMultipleCourses ? (
                <section
                  id="course-picker"
                  className="media-panel rounded-[34px] p-6 md:p-8"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div>
                      <p className="media-kicker">Course Picker</p>
                      <h2 className="mt-3 text-4xl text-white">Browse the full course catalog</h2>
                      <p className="media-copy mt-4 max-w-3xl">
                        Choose a course, compare the offer, and use the same fast purchase flow
                        above for the one you want.
                      </p>
                    </div>
                    <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/62">
                      {filteredCourses.length} course{filteredCourses.length === 1 ? '' : 's'} visible
                    </div>
                  </div>

                  <div className="mt-6 max-w-2xl">
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-cyan-100/56" />
                      <Input
                        value={courseSearch}
                        onChange={(event) => setCourseSearch(event.target.value)}
                        placeholder="Search by title, AI workflow, prompt, edit, level..."
                        className="h-12 rounded-[18px] border-white/10 bg-white/[0.04] pl-11 text-white placeholder:text-white/30"
                      />
                    </div>
                  </div>

                  {filteredCourses.length === 0 ? (
                    <div className="mt-6 rounded-[28px] border border-white/10 bg-white/[0.03] p-6">
                      <p className="text-lg font-semibold text-white">No courses match that search.</p>
                      <p className="mt-2 text-sm leading-6 text-white/56">
                        Try a broader word like `AI`, `video`, `prompt`, or `editing`.
                      </p>
                      <Button
                        variant="outline"
                        className="mt-4 rounded-full border-white/10 bg-white/5 hover:bg-white/10"
                        onClick={() => setCourseSearch('')}
                      >
                        Clear Search
                      </Button>
                    </div>
                  ) : (
                    <div className="mt-6 grid gap-4">
                      {filteredCourses.map((course) => {
                        const isSelected = String(course.id) === String(featuredCourse?.id);
                        const isEnrolled = enrolledCourses.includes(String(course.id));

                        return (
                          <button
                            key={course.id}
                            type="button"
                            onClick={() => {
                              setActiveCourseId(course.id);
                              window.setTimeout(() => scrollToSection('course-purchase'), 30);
                            }}
                            className={`rounded-[28px] border p-5 text-left transition-all ${
                              isSelected
                                ? 'border-cyan-300/28 bg-cyan-300/[0.08] shadow-[0_20px_60px_rgba(34,211,238,0.08)]'
                                : 'border-white/10 bg-white/[0.03] hover:border-white/18 hover:bg-white/[0.05]'
                            }`}
                          >
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                              <div className="min-w-0">
                                <div className="flex flex-wrap gap-2">
                                  <span className="media-chip border-cyan-300/20 bg-[#0b1b26]/80 text-cyan-100">
                                    {course.category}
                                  </span>
                                  <span className="media-chip bg-black/30 text-white/72">
                                    {course.level}
                                  </span>
                                </div>
                                <h3 className="mt-4 text-2xl text-white">{course.title}</h3>
                                <p className="mt-3 text-sm leading-7 text-white/58">{course.description}</p>
                              </div>

                              <div className="shrink-0 lg:text-right">
                                <p className="text-sm text-white/34 line-through">{course.originalPrice}</p>
                                <p className="mt-1 text-3xl text-cyan-100">{course.price}</p>
                                <div className="mt-4 flex flex-wrap gap-2 lg:justify-end">
                                  <Button
                                    className={`rounded-full ${
                                      isEnrolled
                                        ? 'bg-emerald-500 text-[#04130d] hover:bg-emerald-400'
                                        : 'bg-cyan-300 text-[#041b26] hover:bg-cyan-200'
                                    }`}
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      handleEnroll(course);
                                    }}
                                  >
                                    {isEnrolled ? 'Continue' : 'Buy Now'}
                                  </Button>
                                  <Button
                                    variant="outline"
                                    className="rounded-full border-white/10 bg-white/5 hover:bg-white/10"
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      setActiveCourseId(course.id);
                                      window.setTimeout(() => scrollToSection('course-catalog'), 30);
                                    }}
                                  >
                                    View Details
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </section>
              ) : null}

              <section
                id="course-catalog"
                className="grid gap-6 lg:grid-cols-[1.04fr_0.96fr] scroll-mt-32"
              >
                <motion.article
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="media-panel overflow-hidden rounded-[34px] p-6 md:p-8"
                >
                  <div className="relative h-72 overflow-hidden rounded-[28px]">
                    <img
                      src={featuredCourse.image}
                      alt={featuredCourse.title}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#061018] via-[#061018]/40 to-transparent" />
                    <div className="absolute left-4 right-4 top-4 flex flex-wrap gap-2">
                      <span className="media-chip border-cyan-300/20 bg-[#0b1b26]/80 text-cyan-100">
                        {featuredCourse.category}
                      </span>
                      <span className="media-chip bg-black/30 text-white/72">
                        {featuredCourse.level}
                      </span>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center gap-4 text-sm text-white/80">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-amber-200" />
                        <span>{featuredCourse.rating}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-cyan-100" />
                        <span>{featuredCourse.students}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <p className="media-kicker">Course Overview</p>
                    <h2 className="mt-3 text-4xl text-white">{featuredCourse.title}</h2>
                    <p className="media-copy mt-4 max-w-3xl">{featuredCourse.description}</p>

                    <div className="mt-6 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/38">
                          Lessons
                        </p>
                        <p className="mt-2 text-lg text-white">{featuredCourse.chapters.length}</p>
                      </div>
                      <div className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/38">
                          Resources
                        </p>
                        <p className="mt-2 text-lg text-white">{featuredCourse.resources?.length || 0}</p>
                      </div>
                      <div className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/38">
                          Access
                        </p>
                        <p className="mt-2 text-lg text-white">Lifetime</p>
                      </div>
                    </div>

                    <div className="mt-6 space-y-3">
                      {featuredCourse.outcomes?.map((outcome) => (
                        <div key={outcome} className="flex items-start gap-3 text-white/70">
                          <BadgeCheck className="mt-0.5 h-4 w-4 text-cyan-100" />
                          <span className="text-sm leading-6">{outcome}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/38">
                        Included PDF Resources
                      </p>
                      <div className="mt-4 grid gap-3">
                        {featuredCourse.resources?.map((resource) => (
                          <div key={resource.id} className="rounded-[20px] border border-white/10 bg-black/10 px-4 py-3">
                            <p className="text-base font-semibold text-white">{resource.title}</p>
                            <p className="mt-1 text-sm leading-6 text-white/54">{resource.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.article>

                <div className="space-y-6">
                  <section className="media-panel-soft rounded-[34px] p-6 md:p-8">
                    <p className="media-kicker">Curriculum</p>
                    <h2 className="mt-3 text-3xl text-white">
                      {featuredCourse.chapters.length} lessons, ordered from prompt to final edit
                    </h2>

                    <div className="mt-6 space-y-3">
                      {featuredCourse.chapters.map((chapter, index) => (
                        <div
                          key={chapter.id}
                          className="rounded-[22px] border border-white/10 bg-white/[0.03] px-4 py-4"
                        >
                          <div className="flex items-start gap-4">
                            <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs font-semibold text-cyan-100">
                              {String(index + 1).padStart(2, '0')}
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-base font-semibold text-white">{chapter.title}</p>
                                <span className="text-sm text-cyan-100">{chapter.duration}</span>
                              </div>
                              <p className="mt-2 text-sm leading-6 text-white/54">
                                {chapter.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Button
                      className={`mt-6 rounded-full px-6 ${
                        isFeaturedCourseEnrolled
                          ? 'bg-emerald-500 text-[#04130d] hover:bg-emerald-400'
                          : 'bg-cyan-300 text-[#041b26] hover:bg-cyan-200'
                      }`}
                      onClick={() => handleEnroll(featuredCourse)}
                    >
                      {isFeaturedCourseEnrolled ? 'Continue Course' : 'Start Course'}
                    </Button>
                  </section>

                  <section
                    id="course-mentors"
                    className="media-panel-soft rounded-[34px] p-6 md:p-8"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl border border-cyan-300/20 bg-cyan-400/10 p-3 text-cyan-100">
                        <GraduationCap className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="media-kicker">Mentors</p>
                        <h2 className="mt-2 text-3xl text-white">Built by creators focused on output</h2>
                      </div>
                    </div>

                    <div className="mt-6 grid gap-4">
                      {mentors.map((mentor) => (
                        <div
                          key={mentor.name}
                          className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4"
                        >
                          <div className="flex items-center gap-4">
                            <img
                              src={mentor.image}
                              alt={mentor.name}
                              className="h-16 w-16 rounded-full border border-white/10 object-cover"
                            />
                            <div>
                              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-100/72">
                                {mentor.role}
                              </p>
                              <h3 className="mt-2 text-xl text-white">{mentor.name}</h3>
                            </div>
                          </div>
                          <p className="mt-4 text-sm leading-6 text-white/56">{mentor.bio}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              </section>
            </>
          ) : (
            <section
              id="course-purchase"
              className="media-panel-soft rounded-[34px] p-8 text-white/58 scroll-mt-32"
            >
              The course is not available right now.
            </section>
          )}
        </div>
      </div>
    </>
  );
};

export default CoursesPage;
