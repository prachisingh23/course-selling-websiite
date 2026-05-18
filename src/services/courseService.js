const createDrivePdfResource = ({ id, title, description }) => ({
  id: `pdf-${id}`,
  type: 'pdf',
  title,
  description,
  embedUrl: `https://drive.google.com/file/d/${id}/preview`,
  externalUrl: `https://drive.google.com/file/d/${id}/view`,
});

const SELECTED_COURSE_STORAGE_KEY = 'lifelapss_selected_course_id';

const courses = [
  {
    id: '1',
    title: 'How to Create Viral Cinematic Videos Using AI',
    instructor: 'Kapil & Ethan Brooks',
    price: '$34.99',
    originalPrice: '$99.99',
    pricing: {
      usd: { current: 34.99, original: 99.99 },
      inr: { current: 3080, original: 8800 },
    },
    students: '12k+',
    rating: 4.9,
    category: 'Cinematic AI',
    level: 'Beginner to Advanced',
    format: 'Video + PDF',
    duration: '4 core lessons',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1400&q=80',
    description: 'Learn a story-first AI video workflow, from writing prompts to editing the final cinematic result.',
    highlights: [
      'Prompt systems for story, shot, and motion direction',
      'Image-to-video workflow using creator-ready AI tools',
      'Editing, voiceover, and packaging for Reels and YouTube',
    ],
    outcomes: [
      'Write stronger prompts with visual intent',
      'Control pacing, camera feel, and scene continuity',
      'Turn experiments into polished publishable videos',
    ],
    resources: [
      createDrivePdfResource({
        id: '1h1173hdL3fZdELM8-_zZ8STeiWlUayFC',
        title: 'Cinematic Video Full Guide',
        description: 'A complete PDF guide covering the cinematic AI video workflow from idea to final export.',
      }),
      createDrivePdfResource({
        id: '1YravIPI6qlXas4V69FMOL-Ruim-uI0oO',
        title: 'Script to Prompt',
        description: 'Reference notes for turning scripts into stronger visual prompts and clearer scene breakdowns.',
      }),
      createDrivePdfResource({
        id: '1UyBurhoP42twXXABnRSohpGS0zRS4Fc7',
        title: 'Image Prompting Toolkit',
        description: 'A reusable toolkit for writing better image prompts, composition cues, and style directions.',
      }),
      createDrivePdfResource({
        id: '1atTNcgpTEM0OOIy9bPGucFTKyn7yXBiq',
        title: '25+ AI Prompts',
        description: 'A prompt pack with ready-to-use ideas to help you iterate faster and create content more efficiently.',
      }),
    ],
    chapters: [
      {
        id: 'ch1',
        title: 'Script to Prompt',
        description: 'Learn how to turn story ideas into cinematic prompts with clear scenes, emotions, and camera direction.',
        videoUrl: 'https://youtu.be/AJkkkTU24-I',
        duration: '4:58',
        completed: false,
      },
      {
        id: 'ch2',
        title: 'Prompt to Image',
        description: 'Create stronger source images with better composition, style consistency, and visual storytelling.',
        videoUrl: 'https://youtu.be/McL4hsAL_5A',
        duration: '2:42',
        completed: false,
      },
      {
        id: 'ch3',
        title: 'Image to Video',
        description: 'Animate still images into cinematic video while maintaining camera movement, timing, and emotional continuity.',
        videoUrl: 'https://youtu.be/bFfqZR2mBX4',
        duration: '2:26',
        completed: false,
      },
      {
        id: 'ch4',
        title: 'How to Edit',
        description: 'Edit the final video with music, pacing, transitions, and color choices that make the visuals feel polished and professional.',
        videoUrl: 'https://youtu.be/g1CEcztxjcE',
        duration: '8:09',
        completed: false,
      },
    ],
  },
];

export const getAllCourses = () =>
  new Promise((resolve) => {
    window.setTimeout(() => {
      resolve(courses);
    }, 500);
  });

export const getCourseById = (courseId) =>
  new Promise((resolve, reject) => {
    window.setTimeout(() => {
      const course = courses.find((item) => String(item.id) === String(courseId));

      if (course) {
        resolve(course);
        return;
      }

      console.error(
        `Course with ID ${courseId} not found. Available IDs:`,
        courses.map((item) => item.id)
      );
      reject(new Error(`Course with ID ${courseId} not found`));
    }, 500);
  });

export const storeSelectedCourseId = (courseId) => {
  if (typeof window === 'undefined' || !courseId) {
    return;
  }

  window.sessionStorage.setItem(SELECTED_COURSE_STORAGE_KEY, String(courseId));
};

export const getStoredSelectedCourseId = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.sessionStorage.getItem(SELECTED_COURSE_STORAGE_KEY);
};

export const clearStoredSelectedCourseId = () => {
  if (typeof window === 'undefined') {
    return;
  }

  window.sessionStorage.removeItem(SELECTED_COURSE_STORAGE_KEY);
};

export const getEnrolledCourses = (userId) =>
  new Promise((resolve) => {
    window.setTimeout(() => {
      const stored = localStorage.getItem(`enrolled_${userId}`);

      if (stored) {
        const enrolledIds = JSON.parse(stored).map((id) => String(id));
        const enrolledCourses = courses.filter((course) =>
          enrolledIds.includes(String(course.id))
        );

        resolve(enrolledCourses);
        return;
      }

      resolve([]);
    }, 500);
  });

export const updateChapterStatus = (userId, courseId, chapterId, completed) =>
  new Promise((resolve) => {
    window.setTimeout(() => {
      const key = `course_progress_${userId}_${courseId}`;
      const progress = JSON.parse(localStorage.getItem(key) || '{}');
      progress[chapterId] = completed;
      localStorage.setItem(key, JSON.stringify(progress));
      resolve({ success: true });
    }, 300);
  });

export const getCourseProgress = (userId, courseId) =>
  new Promise((resolve) => {
    window.setTimeout(() => {
      const key = `course_progress_${userId}_${courseId}`;
      const progress = JSON.parse(localStorage.getItem(key) || '{}');
      resolve(progress);
    }, 300);
  });

export const getSubchapters = (courseId, chapterId) =>
  new Promise((resolve, reject) => {
    window.setTimeout(() => {
      const course = courses.find((item) => String(item.id) === String(courseId));

      if (!course) {
        reject(new Error(`Course with ID ${courseId} not found`));
        return;
      }

      const chapter = course.chapters.find((item) => item.id === chapterId);

      if (!chapter) {
        reject(new Error(`Chapter with ID ${chapterId} not found in course ${courseId}`));
        return;
      }

      resolve(chapter.subchapters || []);
    }, 300);
  });
