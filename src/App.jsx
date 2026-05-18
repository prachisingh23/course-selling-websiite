import React, {
  Suspense,
  lazy,
  startTransition,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { Toaster } from './components/ui/toaster';
import { AuthProvider } from './contexts/SupabaseAuthContext';
import { useAuth } from './contexts/useAuth';
import { DonationNotificationProvider } from './contexts/DonationNotificationContext';
import { UserNav } from './components/UserNav';
import { AlertTriangle, Loader2, Menu, X } from 'lucide-react';
import { Button } from './components/ui/button';
import Navbar from './components/Navbar';
import MobileBottomNav from './components/MobileBottomNav';
import GoogleAd from './components/GoogleAd';
import {
  getMobileMenuGroups,
  getPageLabel,
  getPrimaryNavigation,
  isNavigationItemActive,
} from './lib/navigation';
import { resilientImport } from './lib/resilientImport';
import { logClientError } from './lib/errorLogger';
import { shouldEnableEnhancedVisuals } from './utils/performance';
import HomePage from './pages/HomePage';

const lazyPage = (factory, cacheKey) => {
  const loadPage = () => resilientImport(factory, cacheKey || factory.toString());
  const Component = lazy(loadPage);
  Component.preload = loadPage;
  return Component;
};

const LoginPage = lazyPage(() => import('./pages/LoginPage'), 'LoginPage');
const SignupPage = lazyPage(() => import('./pages/SignupPage'), 'SignupPage');
const CoursesPage = lazyPage(() => import('./pages/CoursesPage'), 'CoursesPage');
const PaymentPage = lazyPage(() => import('./pages/PaymentPage'), 'PaymentPage');
const EnrolledCoursesPage = lazyPage(() => import('./pages/EnrolledCoursesPage'), 'EnrolledCoursesPage');
const CourseDetailPage = lazyPage(() => import('./pages/CourseDetailPage'), 'CourseDetailPage');
const LandingPage = lazyPage(() => import('./pages/LandingPage'), 'LandingPage');
const AboutPage = lazyPage(() => import('./pages/AboutPage'), 'AboutPage');
const FeaturePage = lazyPage(() => import('./pages/FeaturePage'), 'FeaturePage');
const BlogPage = lazyPage(() => import('./pages/BlogPage'), 'BlogPage');
const BlogPostPage = lazyPage(() => import('./pages/BlogPostPage'), 'BlogPostPage');
const ForgotPasswordPage = lazyPage(() => import('./pages/ForgotPasswordPage'), 'ForgotPasswordPage');
const ResetPasswordPage = lazyPage(() => import('./pages/ResetPasswordPage'), 'ResetPasswordPage');
const ChangePasswordPage = lazyPage(() => import('./pages/ChangePasswordPage'), 'ChangePasswordPage');
const HelpPage = lazyPage(() => import('./pages/HelpPage'), 'HelpPage');
const AiVideoToolsPage = lazyPage(() => import('./pages/AiVideoToolsPage'), 'AiVideoToolsPage');
const AdminLayout = lazyPage(() => import('./pages/admin/AdminLayout'), 'AdminLayout');
const GalleryPage = lazyPage(() => import('./pages/GalleryPage'), 'GalleryPage');
const VideosPage = lazyPage(() => import('./pages/VideosPage'), 'VideosPage');
const DonationPage = lazyPage(() => import('./pages/DonationPage'), 'DonationPage');
const DonorsWallPage = lazyPage(() => import('./pages/DonorsWallPage'), 'DonorsWallPage');
const SearchResultsPage = lazyPage(() => import('./pages/SearchResultsPage'), 'SearchResultsPage');
const MediaDetailPage = lazyPage(() => import('./pages/MediaDetailPage'), 'MediaDetailPage');
const FavoritesPage = lazyPage(() => import('./pages/FavoritesPage'), 'FavoritesPage');
const MyLibraryPage = lazyPage(() => import('./pages/MyLibraryPage'), 'MyLibraryPage');
const AmbientSiteScene = lazy(() => import('./components/AmbientSiteScene'));
const FloatingDonationWidget = lazy(() => import('./components/FloatingDonationWidget'));
const DonationNotificationSystem = lazy(() => import('./components/DonationNotificationSystem'));
const LiveDonationFeed = lazy(() => import('./components/LiveDonationFeed'));

const scheduleIdleTask = (callback, timeout = 900) => {
  if (typeof window === 'undefined') {
    return null;
  }

  if ('requestIdleCallback' in window) {
    return window.requestIdleCallback(callback, { timeout });
  }

  return window.setTimeout(callback, timeout);
};

const cancelIdleTask = (id) => {
  if (typeof window === 'undefined' || id == null) {
    return;
  }

  if ('cancelIdleCallback' in window) {
    window.cancelIdleCallback(id);
    return;
  }

  window.clearTimeout(id);
};

const AUTH_BLOCKED_PAGES = new Set([
  'enrolled-courses',
  'course',
  'change-password',
]);

const isRecoverableStartupError = (error) => {
  const message = error?.message || '';

  return (
    message.includes('Failed to fetch dynamically imported module') ||
    message.includes('Loading chunk') ||
    message.includes('ChunkLoadError') ||
    message.includes('Importing a module script failed') ||
    message.includes('Failed to load module script') ||
    message.includes('error loading dynamically imported module')
  );
};

const resolvePageStateFromLocation = () => {
  if (typeof window === 'undefined') {
    return { page: 'home', params: {} };
  }

  const path = window.location.pathname.split('/').filter((segment) => segment);
  const hash = window.location.hash;
  const pageParams = {};

  if (hash.includes('access_token') && hash.includes('type=recovery')) {
    return {
      page: 'reset-password',
      params: {},
    };
  }

  let page = path[0] || 'home';

  if (page === 'admin') {
    page = `admin/${path[1] || 'dashboard'}`;
    if (path[2] && path[3]) {
      page = `admin/${path[1]}/${path[2]}`;
      pageParams.id = path[3];
    }
  } else if (page === 'course' && path[1]) {
    page = 'course';
    pageParams.id = path[1];
  } else if (page === 'blog' && path[1]) {
    page = 'blog-post';
    pageParams.id = path[1];
  } else if (page === 'search' && path[1]) {
    page = 'search';
    pageParams.query = decodeURIComponent(path[1]);
  } else if (page === 'media' && path[1] && path[2]) {
    page = 'media';
    pageParams.type = path[1];
    pageParams.id = path[2];
  } else if (path.length > 1) {
    pageParams.id = path[1];
  }

  return { page, params: pageParams };
};

const PageLoader = ({ admin = false, message = 'Loading...' }) => {
  if (admin) {
    return (
      <div className="auth-shell text-white">
        <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-5 py-3 backdrop-blur-xl">
          <Loader2 className="h-5 w-5 animate-spin text-cyan-100" />
          <span className="text-sm font-medium text-white/76">{message}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="media-shell flex min-h-screen items-center justify-center px-4 pt-28 text-white">
      <div className="media-panel-soft flex items-center gap-3 px-5 py-4">
        <Loader2 className="h-5 w-5 animate-spin text-cyan-100" />
        <span className="text-sm font-medium text-white/76">{message}</span>
      </div>
    </div>
  );
};

const TopErrorMessage = ({ title, description, actions = null }) => (
  <div className="px-4 pt-28 lg:pt-32">
    <div className="mx-auto max-w-7xl">
      <div
        role="alert"
        className="media-panel-soft border border-amber-300/24 bg-amber-300/10 p-4 md:p-5"
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl border border-amber-200/20 bg-amber-300/18 p-2.5 text-amber-100">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div>
              <p className="text-lg font-semibold text-white">{title}</p>
              <p className="mt-1 text-sm text-white/74">{description}</p>
            </div>
          </div>
          {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
        </div>
      </div>
    </div>
  </div>
);

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidUpdate(prevProps) {
    if (this.props.resetKey !== prevProps.resetKey && this.state.hasError) {
      this.setState({ hasError: false, error: null });
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  componentDidCatch(error, errorInfo) {
    logClientError({
      source: this.props.scope || 'react-boundary',
      error,
      metadata: {
        componentStack: errorInfo?.componentStack,
        page: this.props.page,
        path: typeof window !== 'undefined' ? window.location.pathname : 'unknown',
        recoverableStartupError: isRecoverableStartupError(error),
      },
    });

    if (typeof this.props.onError === 'function') {
      this.props.onError(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      if (typeof this.props.fallbackRender === 'function') {
        return this.props.fallbackRender({
          error: this.state.error,
          reset: this.handleReset,
        });
      }

      return (
        <TopErrorMessage
          title="Something went wrong"
          description="We hit an unexpected issue. Try again without refreshing."
          actions={(
            <Button
              onClick={this.handleReset}
              className="rounded-full bg-cyan-300 text-[#041b26] hover:bg-cyan-200"
            >
              Try Again
            </Button>
          )}
        />
      );
    }

    return this.props.children;
  }
}

function AppContent() {
  const [currentPage, setCurrentPage] = useState(() => resolvePageStateFromLocation().page);
  const { user, loading } = useAuth();
  const [params, setParams] = useState(() => resolvePageStateFromLocation().params);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [enableEnhancements, setEnableEnhancements] = useState(false);
  const [pageCrashNonce, setPageCrashNonce] = useState(0);

  const navigate = useCallback((page, navParams = {}) => {
    let path = `/${page === 'home' ? '' : page}`;
    if (page === 'course' && navParams.id) {
      path = `/course/${navParams.id}`;
    } else if (page === 'blog' && navParams.id) {
      path = `/blog/${navParams.id}`;
    } else if (page === 'search' && navParams.query) {
      path = `/search/${encodeURIComponent(navParams.query)}`;
    } else if (page === 'media' && navParams.type && navParams.id) {
      path = `/media/${navParams.type}/${navParams.id}`;
    } else if (page.startsWith('admin')) {
      const adminPathParts = page.split('/');
      path = `/admin/${adminPathParts.length > 1 ? adminPathParts[1] : ''}`;
      if (adminPathParts[2]) path += `/${adminPathParts[2]}`;
      if (navParams.id) path += `/${navParams.id}`;
    }

    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }

    startTransition(() => {
      setCurrentPage(page);
      setParams(navParams);
      setIsMenuOpen(false);
      setPageCrashNonce(0);
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const navigateToSection = useCallback((sectionId) => {
    const scrollToTarget = () => {
      window.location.hash = sectionId;
      const target = document.getElementById(sectionId);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };

    if (currentPage !== 'home' && currentPage !== 'discover') {
      navigate('home');
      window.location.hash = sectionId;
      window.setTimeout(scrollToTarget, 120);
      return;
    }

    scrollToTarget();
    setIsMenuOpen(false);
  }, [currentPage, navigate]);

  useEffect(() => {
    const handleUrlChange = () => {
      const nextState = resolvePageStateFromLocation();

      if (nextState.page === 'reset-password' && window.location.hash.includes('access_token')) {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }

      startTransition(() => {
        setCurrentPage(nextState.page);
        setParams(nextState.params);
        setIsMenuOpen(false);
        setPageCrashNonce(0);
      });
    };

    window.addEventListener('popstate', handleUrlChange);
    handleUrlChange();

    return () => window.removeEventListener('popstate', handleUrlChange);
  }, [navigate]);

  useEffect(() => {
    if (loading || !shouldEnableEnhancedVisuals()) {
      return undefined;
    }

    const idleId = scheduleIdleTask(() => {
      setEnableEnhancements(true);
    }, 2800);

    return () => cancelIdleTask(idleId);
  }, [loading]);

  useEffect(() => {
    if (loading || !user) {
      return;
    }

    if (currentPage === 'login' || currentPage === 'signup') {
      navigate('courses');
    }
  }, [currentPage, loading, navigate, user]);

  const MobileNav = () => {
    const { user: mobileUser } = useAuth();
    const menuGroups = getMobileMenuGroups(Boolean(mobileUser));
    const currentLabel = getPageLabel(currentPage);

    return (
      <div className="fixed left-4 right-4 top-[84px] z-[70] max-h-[calc(100vh-108px)] overflow-y-auto rounded-[30px] border border-white/12 bg-[rgba(5,10,20,0.94)] p-4 pb-24 shadow-[0_26px_70px_rgba(0,0,0,0.45)] backdrop-blur-xl md:hidden">
        <div className="section-frame p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-cyan-100/72">
            Quick Navigation
          </p>
          <h2 className="mt-3 text-2xl text-white">{currentLabel}</h2>
          <p className="mt-2 text-sm leading-6 text-white/56">
            Main pages stay one tap away. Use these groups to jump faster without hunting through the site.
          </p>
        </div>

        <div className="mt-4 space-y-4">
          {menuGroups.map((group) => (
            <section key={group.title}>
              <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/38">
                {group.title}
              </p>
              <div className="grid gap-2">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = isNavigationItemActive(currentPage, item);

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        if (item.section) {
                          navigateToSection(item.section);
                          return;
                        }

                        navigate(item.page);
                      }}
                      className={`rounded-[24px] border px-4 py-4 text-left transition-all ${
                        isActive
                          ? 'border-cyan-300/24 bg-cyan-300/10'
                          : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.05]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="rounded-2xl border border-white/10 bg-black/20 p-3 text-cyan-100">
                          <Icon className="h-4 w-4" />
                        </div>
                        {isActive ? (
                          <span className="rounded-full border border-cyan-200/20 bg-cyan-300/12 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-cyan-100">
                            Here
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-4 text-base font-semibold text-white">{item.label}</p>
                      <p className="mt-1 text-sm leading-6 text-white/54">{item.description}</p>
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
    );
  };

  const renderPage = () => {
    if (currentPage.startsWith('admin')) {
      if (loading) {
        return <PageLoader admin message="Checking session..." />;
      }

      return <AdminLayout page={currentPage} onNavigate={navigate} params={params} />;
    }

    if (loading && AUTH_BLOCKED_PAGES.has(currentPage)) {
      return <PageLoader message="Checking session..." />;
    }

    const pageMap = {
      home: <HomePage onNavigate={navigate} />,
      discover: <HomePage onNavigate={navigate} />,
      landing: <LandingPage onNavigate={navigate} />,
      about: <AboutPage onNavigate={navigate} />,
      features: <FeaturePage onNavigate={navigate} />,
      blog: <BlogPage onNavigate={navigate} />,
      'blog-post': <BlogPostPage onNavigate={navigate} postId={params.id} />,
      help: <HelpPage onNavigate={navigate} />,
      login: <LoginPage onNavigate={navigate} />,
      signup: <SignupPage onNavigate={navigate} />,
      courses: <CoursesPage onNavigate={navigate} />,
      payment: <PaymentPage onNavigate={navigate} courseData={window.selectedCourse} />,
      'enrolled-courses': user ? <EnrolledCoursesPage onNavigate={navigate} /> : <LoginPage onNavigate={navigate} />,
      course: user ? <CourseDetailPage onNavigate={navigate} courseId={params.id} /> : <LoginPage onNavigate={navigate} />,
      'forgot-password': <ForgotPasswordPage onNavigate={navigate} />,
      'reset-password': <ResetPasswordPage onNavigate={navigate} />,
      'change-password': user ? <ChangePasswordPage onNavigate={navigate} /> : <LoginPage onNavigate={navigate} />,
      'ai-video-generation-tools': <AiVideoToolsPage onNavigate={navigate} />,
      photos: <GalleryPage onNavigate={navigate} />,
      gallery: <GalleryPage onNavigate={navigate} />,
      videos: <VideosPage onNavigate={navigate} />,
      search: <SearchResultsPage onNavigate={navigate} initialQuery={params.query || ''} />,
      media: <MediaDetailPage onNavigate={navigate} mediaType={params.type} mediaId={params.id} />,
      favorites: <FavoritesPage onNavigate={navigate} />,
      library: <MyLibraryPage onNavigate={navigate} />,
      donate: <DonationPage onNavigate={navigate} />,
      'donors-wall': <DonorsWallPage onNavigate={navigate} />,
    };

    if (pageMap[currentPage]) {
      if (user && (currentPage === 'login' || currentPage === 'signup')) {
        return <CoursesPage onNavigate={navigate} />;
      }

      return pageMap[currentPage];
    }

    return <HomePage onNavigate={navigate} />;
  };

  const noHeaderPages = [
    'login',
    'signup',
    'forgot-password',
    'reset-password',
    'admin/login',
  ];

  const isAdminRoute = currentPage.startsWith('admin/');
  const isNoHeaderPage = noHeaderPages.includes(currentPage) || isAdminRoute;
  const showHeader = !isNoHeaderPage;
  const showFloatingWidget =
    !isAdminRoute &&
    currentPage !== 'donate' &&
    currentPage !== 'login' &&
    currentPage !== 'signup';
  const authActions = loading ? (
    <div
      aria-hidden
      className="site-header-shell hidden h-11 w-[176px] animate-pulse rounded-full bg-white/[0.04] md:block"
    />
  ) : user ? (
    <UserNav onNavigate={navigate} />
  ) : (
    <>
      <Button
        onClick={() => navigate('login')}
        variant="ghost"
        className="site-header-shell hidden rounded-full px-5 text-white/74 hover:bg-white/[0.06] hover:text-white md:inline-flex"
      >
        Login
      </Button>
      <Button
        onClick={() => navigate('signup')}
        className="rounded-full bg-cyan-300 px-5 text-[#041b26] shadow-[0_14px_40px_rgba(34,211,238,0.16)] hover:bg-cyan-200"
      >
        Get Started
      </Button>
    </>
  );
  const mobilePrimaryItems = getPrimaryNavigation(Boolean(user))
    .slice(0, 4)
    .map((item) => ({
      id: item.id,
      label: item.label,
      icon: item.icon,
      active: isNavigationItemActive(currentPage, item),
      onClick: () => navigate(item.page),
    }));

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {!isAdminRoute ? (
        <>
          <div
            aria-hidden
            className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[radial-gradient(circle_at_18%_12%,rgba(125,211,252,0.08),transparent_20%),radial-gradient(circle_at_82%_14%,rgba(251,191,36,0.07),transparent_18%),radial-gradient(circle_at_50%_105%,rgba(34,197,94,0.05),transparent_22%)]"
          />
          {enableEnhancements ? (
            <Suspense fallback={null}>
              <AmbientSiteScene subtle={isNoHeaderPage} />
            </Suspense>
          ) : null}
        </>
      ) : null}

      <div className="relative z-10">
        {showHeader && isMenuOpen ? (
          <button
            type="button"
            aria-label="Close mobile menu"
            className="fixed inset-0 z-[55] bg-[rgba(0,0,0,0.48)] backdrop-blur-[2px] md:hidden"
            onClick={() => setIsMenuOpen(false)}
          />
        ) : null}

        {showHeader && (
          <header className="fixed top-0 left-0 right-0 z-[60] bg-[linear-gradient(180deg,rgba(4,10,15,0.92),rgba(4,10,15,0.78),rgba(4,10,15,0.18),rgba(4,10,15,0))] backdrop-blur-md transition-all duration-300">
            <Helmet>
              <title>Lifelapss - AI Video Generation, Tools & Creator Content</title>
              <meta name="description" content="Create, learn, and earn with AI video generation. Explore AI tools, read articles, and buy digital products from creators." />
            </Helmet>

            <div className="mx-auto mt-4 flex max-w-7xl items-center gap-3 px-4">
              <div className="md:hidden">
                <Button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  variant="ghost"
                  size="icon"
                  className="site-header-shell h-12 w-12 rounded-full text-white hover:bg-white/[0.06]"
                >
                  {isMenuOpen ? <X /> : <Menu />}
                </Button>
              </div>

              <button
                type="button"
                onClick={() => navigate('home')}
                className="site-header-shell flex items-center gap-3 px-3 py-2 md:hidden"
              >
                <img
                  className="h-9 w-9 rounded-full border border-white/10 object-cover"
                  alt="Lifelapss logo"
                  src="https://horizons-cdn.hostinger.com/528a3c0e-01fd-4f14-89f9-123543f56514/825abd5a547aafaa83312712ad85799f.jpg"
                />
                <div className="text-left">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-cyan-100/66">
                    Curated Media
                  </p>
                  <p className="text-base font-semibold text-white">Lifelapss</p>
                </div>
              </button>

              <Navbar onNavigate={navigate} currentPage={currentPage} />

              <div className="ml-auto flex items-center gap-2">
                {authActions}
              </div>
            </div>

            {isMenuOpen && <MobileNav />}
          </header>
        )}

        <ErrorBoundary
          scope="route-content"
          page={currentPage}
          resetKey={`${currentPage}:${params?.id || ''}:${params?.query || ''}:${pageCrashNonce}`}
          fallbackRender={({ reset }) => (
            <TopErrorMessage
              title="We hit a page rendering issue"
              description="This section failed to load, but the rest of the app is still running."
              actions={(
                <>
                  <Button
                    className="rounded-full bg-cyan-300 text-[#041b26] hover:bg-cyan-200"
                    onClick={() => {
                      setPageCrashNonce((value) => value + 1);
                      reset();
                    }}
                  >
                    Retry Page
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-full border-white/10 bg-white/5 hover:bg-white/10"
                    onClick={() => navigate('home')}
                  >
                    Go Home
                  </Button>
                </>
              )}
            />
          )}
        >
          <Suspense fallback={<PageLoader admin={isAdminRoute} message="Loading page..." />}>
            {renderPage()}
          </Suspense>
        </ErrorBoundary>

        <ErrorBoundary scope="ad-slot" page={currentPage} fallbackRender={() => null}>
          <Suspense fallback={null}>
            <div className={isAdminRoute ? 'px-4 pb-8' : 'px-4 pb-24'}>
              <div className="mx-auto max-w-7xl">
                <GoogleAd className="mt-0" />
              </div>
            </div>
          </Suspense>
        </ErrorBoundary>

        {showHeader ? (
          <MobileBottomNav
            items={mobilePrimaryItems}
            isMenuOpen={isMenuOpen}
            onToggleMenu={() => setIsMenuOpen((open) => !open)}
          />
        ) : null}

        {enableEnhancements ? (
          <ErrorBoundary scope="enhancement-widgets" page={currentPage} fallbackRender={() => null}>
            <Suspense fallback={null}>
              <DonationNotificationProvider>
                <DonationNotificationSystem />
                {showFloatingWidget ? <FloatingDonationWidget onNavigate={navigate} /> : null}
              </DonationNotificationProvider>
              {currentPage === 'home' ? <LiveDonationFeed /> : null}
            </Suspense>
          </ErrorBoundary>
        ) : null}
      </div>
    </div>
  );
}

function App() {
  const boundaryResetKey =
    typeof window === 'undefined'
      ? 'ssr'
      : `${window.location.pathname}${window.location.search}`;

  return (
    <ErrorBoundary
      scope="app-root"
      resetKey={boundaryResetKey}
      fallbackRender={({ reset }) => (
        <TopErrorMessage
          title="Something went wrong"
          description="A global rendering issue occurred. You can retry this view or return home."
          actions={(
            <>
              <Button
                className="rounded-full bg-cyan-300 text-[#041b26] hover:bg-cyan-200"
                onClick={reset}
              >
                Retry
              </Button>
              <Button
                variant="outline"
                className="rounded-full border-white/10 bg-white/5 hover:bg-white/10"
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.history.replaceState({}, '', '/');
                    window.location.reload();
                  }
                }}
              >
                Go Home
              </Button>
            </>
          )}
        />
      )}
    >
      <HelmetProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
        <Toaster />
      </HelmetProvider>
    </ErrorBoundary>
  );
}

export default App;
