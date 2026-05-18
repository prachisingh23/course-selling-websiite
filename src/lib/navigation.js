import {
  BookOpen,
  Clapperboard,
  Coins,
  Gift,
  HelpCircle,
  Heart,
  Home,
  Image,
  Info,
  LayoutGrid,
  Library,
  LogIn,
  Search,
  Sparkles,
  UserPlus,
} from 'lucide-react';

export const getPrimaryNavigation = (hasUser) => [
  {
    id: 'home',
    label: 'Home',
    page: 'home',
    icon: Home,
    activePages: ['home', 'discover', 'landing'],
  },
  {
    id: 'about',
    label: 'About',
    page: 'about',
    icon: Info,
    activePages: ['about'],
  },
  {
    id: 'courses',
    label: 'Courses',
    page: 'courses',
    icon: BookOpen,
    activePages: ['courses', 'course', 'enrolled-courses', 'payment'],
  },
  {
    id: 'videos',
    label: 'Videos',
    page: 'videos',
    icon: Clapperboard,
    activePages: ['videos'],
  },
  {
    id: 'photos',
    label: 'Photos',
    page: 'photos',
    icon: Image,
    activePages: ['photos', 'gallery'],
  },
  {
    id: 'search',
    label: 'Search',
    page: 'search',
    icon: Search,
    activePages: ['search'],
  },
  hasUser
    ? {
        id: 'saved',
        label: 'Saved',
        page: 'library',
        icon: Library,
        activePages: ['library', 'favorites'],
      }
    : {
        id: 'help',
        label: 'Help',
        page: 'help',
        icon: HelpCircle,
        activePages: ['help'],
      },
];

export const getHomeShortcutItems = () => [
  {
    id: 'discover',
    label: 'Top of Home',
    description: 'Jump back to the first section.',
    section: 'discover',
    icon: Sparkles,
  },
  {
    id: 'free-assets',
    label: 'Free Assets',
    description: 'Go straight to the free downloads.',
    section: 'free-assets',
    icon: Gift,
  },
  {
    id: 'collections',
    label: 'Collections',
    description: 'Browse mood-based groups faster.',
    section: 'collections',
    icon: LayoutGrid,
  },
  {
    id: 'pricing',
    label: 'Pricing',
    description: 'Open the simple pricing section.',
    section: 'pricing',
    icon: Coins,
  },
];

export const getMobileMenuGroups = (hasUser) => [
  {
    title: 'Main pages',
    items: [
      {
        id: 'home',
        label: 'Home',
        description: 'Return to the main browse page.',
        page: 'home',
        icon: Home,
        activePages: ['home', 'discover', 'landing'],
      },
      {
        id: 'about',
        label: 'About',
        description: 'See the brand story and social channels.',
        page: 'about',
        icon: Info,
        activePages: ['about'],
      },
      {
        id: 'courses',
        label: 'Courses',
        description: 'Open the full learning catalog.',
        page: 'courses',
        icon: BookOpen,
        activePages: ['courses', 'course', 'enrolled-courses', 'payment'],
      },
      {
        id: 'videos',
        label: 'Videos',
        description: 'Open the video library.',
        page: 'videos',
        icon: Clapperboard,
        activePages: ['videos'],
      },
      {
        id: 'photos',
        label: 'Photos',
        description: 'Open the photo library.',
        page: 'photos',
        icon: Image,
        activePages: ['photos', 'gallery'],
      },
      {
        id: 'search',
        label: 'Search',
        description: 'Search everything from one page.',
        page: 'search',
        icon: Search,
        activePages: ['search'],
      },
    ],
  },
  {
    title: 'Home shortcuts',
    items: getHomeShortcutItems(),
  },
  hasUser
    ? {
        title: 'Your account',
        items: [
          {
            id: 'enrolled-courses',
            label: 'My Courses',
            description: 'Continue your enrolled lessons.',
            page: 'enrolled-courses',
            icon: BookOpen,
            activePages: ['enrolled-courses', 'course', 'payment'],
          },
          {
            id: 'library',
            label: 'My Library',
            description: 'Open your saved purchases and downloads.',
            page: 'library',
            icon: Library,
            activePages: ['library'],
          },
          {
            id: 'favorites',
            label: 'Favorites',
            description: 'See the assets you starred.',
            page: 'favorites',
            icon: Heart,
            activePages: ['favorites'],
          },
        ],
      }
    : {
        title: 'Get started',
        items: [
          {
            id: 'login',
            label: 'Login',
            description: 'Sign in to access your library.',
            page: 'login',
            icon: LogIn,
            activePages: ['login'],
          },
          {
            id: 'signup',
            label: 'Create Account',
            description: 'Make an account for saved picks.',
            page: 'signup',
            icon: UserPlus,
            activePages: ['signup'],
          },
        ],
      },
  {
    title: 'Support',
    items: [
      {
        id: 'help',
        label: 'Help',
        description: 'Open the support and FAQ page.',
        page: 'help',
        icon: HelpCircle,
        activePages: ['help'],
      },
      {
        id: 'donate',
        label: 'Support Platform',
        description: 'Support the platform directly.',
        page: 'donate',
        icon: Heart,
        activePages: ['donate'],
      },
    ],
  },
];

export const isNavigationItemActive = (currentPage, item) =>
  item.activePages?.includes(currentPage) || false;

export const getPageLabel = (currentPage) => {
  if (!currentPage) {
    return 'Home';
  }

  if (currentPage.startsWith('admin/')) {
    return 'Admin';
  }

  const pageLabels = {
    home: 'Home',
    discover: 'Home',
    landing: 'Home',
    videos: 'Videos',
    courses: 'Courses',
    photos: 'Photos',
    gallery: 'Photos',
    search: 'Search',
    media: 'Preview',
    favorites: 'Favorites',
    library: 'Saved',
    donate: 'Support',
    help: 'Help',
    login: 'Login',
    signup: 'Create Account',
    about: 'About',
    blog: 'Blog',
    'blog-post': 'Blog Post',
    features: 'Features',
    course: 'Course',
    payment: 'Checkout',
    'enrolled-courses': 'My Courses',
    'forgot-password': 'Reset Access',
    'reset-password': 'Reset Password',
    'change-password': 'Change Password',
    'ai-video-generation-tools': 'AI Tools',
    'donors-wall': 'Donors Wall',
  };

  return pageLabels[currentPage] || 'Explore';
};
