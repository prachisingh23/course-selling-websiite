import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, CheckCircle2, Flame, RefreshCw, Sparkles, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CHALLENGE_HISTORY_KEY = 'lifelapss_daily_challenge_history';

const challengePool = [
  {
    id: 'story-frame',
    label: 'Story Frame',
    title: 'Build a 3-asset narrative arc',
    copy: 'Find one opener, one detail, and one finishing frame that could become a short cinematic sequence.',
    query: '#cinematic #storytelling',
    tags: ['cinematic', 'storytelling', 'sequence'],
    tasks: ['Open 3 related assets', 'Save your strongest pick', 'Collect one motion clip'],
  },
  {
    id: 'night-edit',
    label: 'Night Edit',
    title: 'Create a late-night visual lane',
    copy: 'Pull together city lights, reflections, and one atmospheric texture that could power a mood board or reel.',
    query: '#citylights #night #urban',
    tags: ['citylights', 'night', 'urban'],
    tasks: ['Search a city hashtag', 'Preview 2 motion assets', 'Save 1 texture or still'],
  },
  {
    id: 'luxury-board',
    label: 'Luxury Board',
    title: 'Assemble a premium brand mood board',
    copy: 'Mix editorial portraits, clean product space, and one polished detail shot for a premium feel.',
    query: '#lifestyle #portrait #minimal',
    tags: ['lifestyle', 'portrait', 'minimal'],
    tasks: ['Open a portrait', 'Open a minimal still', 'Save your favorite premium-looking frame'],
  },
  {
    id: 'travel-loop',
    label: 'Travel Loop',
    title: 'Find a travel set with scale and motion',
    copy: 'Use landscapes, drone movement, and a quiet establishing still to make one destination feel bigger.',
    query: '#travel #nature #drone',
    tags: ['travel', 'nature', 'drone'],
    tasks: ['Browse a drone asset', 'Save one landscape', 'Open one free asset'],
  },
  {
    id: 'texture-hunt',
    label: 'Texture Hunt',
    title: 'Collect product-ready surfaces and backgrounds',
    copy: 'Look for clean textures, materials, and abstract frames that could support a campaign or product render.',
    query: '#textures #minimal #product',
    tags: ['textures', 'minimal', 'product'],
    tasks: ['Open 3 texture-related assets', 'Save your best background', 'Try one hashtag search'],
  },
];

const buildDateKey = (date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getDayOfYear = (date) => {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date - start + (start.getTimezoneOffset() - date.getTimezoneOffset()) * 60000;
  return Math.floor(diff / 86400000);
};

const getChallengeForDate = (date) => {
  const index = Math.max(0, (getDayOfYear(date) - 1) % challengePool.length);
  return challengePool[index];
};

const readChallengeHistory = () => {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const stored = window.localStorage.getItem(CHALLENGE_HISTORY_KEY);
    const parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? parsed.filter((entry) => typeof entry === 'string') : [];
  } catch {
    return [];
  }
};

const writeChallengeHistory = (history) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(CHALLENGE_HISTORY_KEY, JSON.stringify(history));
};

const formatRefreshCountdown = (date) => {
  const nextRefresh = new Date(date);
  nextRefresh.setHours(24, 0, 0, 0);

  const remaining = Math.max(0, nextRefresh.getTime() - date.getTime());
  const hours = Math.floor(remaining / (1000 * 60 * 60));
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));

  return `${hours}h ${minutes}m`;
};

const calculateStreak = (history, date) => {
  const completedDates = new Set(history);
  const cursor = new Date(date);

  if (!completedDates.has(buildDateKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }

  let streak = 0;

  while (completedDates.has(buildDateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
};

const DailyChallengeBoard = ({ onOpenSearch }) => {
  const [now, setNow] = useState(() => new Date());
  const [history, setHistory] = useState(() => readChallengeHistory());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 60000);

    return () => window.clearInterval(timer);
  }, []);

  const todayKey = useMemo(() => buildDateKey(now), [now]);
  const challenge = useMemo(() => getChallengeForDate(now), [now]);
  const refreshIn = useMemo(() => formatRefreshCountdown(now), [now]);
  const streak = useMemo(() => calculateStreak(history, now), [history, now]);
  const isCompleted = history.includes(todayKey);

  const handleToggleComplete = () => {
    setHistory((currentHistory) => {
      const nextHistory = currentHistory.includes(todayKey)
        ? currentHistory.filter((entry) => entry !== todayKey)
        : [...currentHistory, todayKey];

      writeChallengeHistory(nextHistory);
      return nextHistory;
    });
  };

  return (
    <section className="media-panel relative overflow-hidden rounded-[34px] p-6 md:p-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(125,211,252,0.16),transparent_28%),radial-gradient(circle_at_85%_18%,rgba(251,191,36,0.12),transparent_24%)]" />

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative z-10"
      >
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="media-kicker">Daily Challenge</p>
            <h2 className="mt-3 text-4xl text-white">Give people a reason to come back tomorrow.</h2>
            <p className="media-copy mt-4 max-w-2xl">
              A fresh prompt adds repeatable energy. Visitors can treat the archive like a creative game instead of a one-time search.
            </p>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-black/20 p-4 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-full border border-white/10 bg-white/5 p-2 text-cyan-100">
                <CalendarDays className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/42">Refreshes In</p>
                <p className="mt-1 text-lg font-semibold text-white">{refreshIn}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <div className="rounded-[24px] border border-white/10 bg-black/20 p-4 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-full border border-white/10 bg-white/5 p-2 text-cyan-100">
                <Flame className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/42">Challenge Streak</p>
                <p className="mt-1 text-2xl text-white">{streak}</p>
              </div>
            </div>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-black/20 p-4 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-full border border-white/10 bg-white/5 p-2 text-amber-100">
                <Target className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/42">Status</p>
                <p className="mt-1 text-lg font-semibold text-white">
                  {isCompleted ? 'Completed today' : 'Ready to start'}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-black/20 p-4 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-full border border-white/10 bg-white/5 p-2 text-cyan-100">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/42">Route</p>
                <p className="mt-1 text-lg font-semibold text-white">{challenge.label}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-[30px] border border-white/10 bg-white/[0.04] p-5 md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="max-w-2xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-100/72">
                Today&apos;s Prompt
              </p>
              <h3 className="mt-3 text-3xl text-white">{challenge.title}</h3>
              <p className="mt-4 text-sm leading-7 text-white/60">{challenge.copy}</p>
            </div>
            <Button
              variant="outline"
              className="rounded-full border-white/10 bg-white/5 hover:bg-white/10"
              onClick={handleToggleComplete}
            >
              {isCompleted ? (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Mark as Open
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Mark Complete
                </>
              )}
            </Button>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {challenge.tags.map((tag) => (
              <button
                key={`${challenge.id}-${tag}`}
                type="button"
                onClick={() => onOpenSearch?.(`#${tag}`)}
                className="media-chip border-cyan-300/20 bg-[#0c1a24]/72 text-cyan-100 transition-all hover:-translate-y-0.5 hover:border-cyan-300/35"
              >
                #{tag}
              </button>
            ))}
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {challenge.tasks.map((task) => (
              <div key={task} className="rounded-[22px] border border-white/10 bg-black/20 p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-full border border-white/10 bg-white/5 p-2 text-cyan-100">
                    <Target className="h-3.5 w-3.5" />
                  </div>
                  <p className="text-sm leading-6 text-white/70">{task}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              className="rounded-full bg-cyan-300 text-[#041b26] hover:bg-cyan-200"
              onClick={() => onOpenSearch?.(challenge.query)}
            >
              Start Challenge
            </Button>
            <Button
              variant="outline"
              className="rounded-full border-white/10 bg-white/5 hover:bg-white/10"
              onClick={() => onOpenSearch?.('#cinematic')}
            >
              Explore More Prompts
              <RefreshCw className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default DailyChallengeBoard;
