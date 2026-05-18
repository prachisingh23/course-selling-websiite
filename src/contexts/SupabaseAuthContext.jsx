import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { getSupabase } from '@/lib/loadSupabaseClient';
import { toast } from '@/components/ui/use-toast';
import SITE_URL from '@/config';
import { isAllowedAdminEmail } from '@/config/adminAccess';
import { AuthContext } from './authContext';
import { logClientError } from '@/lib/errorLogger';

const PROFILE_SELECT = 'id, role, full_name, created_at, updated_at';
const AUTH_PRIORITY_PATH_PREFIXES = [
  '/admin',
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/change-password',
  '/course',
  '/payment',
  '/enrolled-courses',
  '/favorites',
  '/library',
];

const shouldPrioritizeAuth = () => {
  if (typeof window === 'undefined') {
    return true;
  }

  return AUTH_PRIORITY_PATH_PREFIXES.some((prefix) => window.location.pathname.startsWith(prefix));
};

const scheduleAuthBoot = (callback) => {
  if (typeof window === 'undefined' || shouldPrioritizeAuth()) {
    callback();
    return null;
  }

  if ('requestIdleCallback' in window) {
    return window.requestIdleCallback(callback, { timeout: 2400 });
  }

  return window.setTimeout(callback, 1800);
};

const cancelAuthBoot = (handle) => {
  if (typeof window === 'undefined' || handle == null) {
    return;
  }

  if ('cancelIdleCallback' in window) {
    window.cancelIdleCallback(handle);
    return;
  }

  window.clearTimeout(handle);
};

const attachUserEmailToProfile = (profileData, currentUser) => {
  if (!profileData) {
    return profileData;
  }

  return {
    ...profileData,
    email: currentUser?.email || null,
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authEvent, setAuthEvent] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCreator, setIsCreator] = useState(false);

  const buildAllowedAdminProfile = useCallback((currentUser, existingProfile = null) => ({
    id: currentUser.id,
    full_name:
      existingProfile?.full_name ||
      currentUser.user_metadata?.full_name ||
      currentUser.email?.split('@')[0] ||
      'Admin',
    role: 'admin',
  }), []);

  const syncAllowedAdminProfile = useCallback(async (currentUser, existingProfile = null, { force = false } = {}) => {
    if (!currentUser || !isAllowedAdminEmail(currentUser.email)) {
      return { data: existingProfile, error: null };
    }

    const adminProfilePayload = buildAllowedAdminProfile(currentUser, existingProfile);

    if (
      !force &&
      existingProfile?.role === 'admin' &&
      existingProfile?.full_name === adminProfilePayload.full_name
    ) {
      return {
        data: attachUserEmailToProfile({
          id: currentUser.id,
          ...existingProfile,
        }, currentUser),
        error: null,
      };
    }

    let latestError = null;
    const supabase = await getSupabase();

    if (existingProfile) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .update({
            full_name: adminProfilePayload.full_name,
            role: adminProfilePayload.role,
          })
          .eq('id', currentUser.id)
          .select(PROFILE_SELECT)
          .maybeSingle();

        if (!error && data) {
          return { data: attachUserEmailToProfile(data, currentUser), error: null };
        }

        if (error) {
          latestError = error;
          console.error('Failed to update admin profile:', error);
        }
      } catch (error) {
        latestError = error;
        console.error('Unexpected error while updating admin profile:', error);
      }
    }

    const insertPayload = {
      id: currentUser.id,
      full_name: adminProfilePayload.full_name,
      role: 'admin',
    };

    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert(insertPayload)
        .select(PROFILE_SELECT)
        .maybeSingle();

      if (error) {
        latestError = error;
        console.error('Failed to insert admin profile:', error);
      } else if (data) {
        return { data: attachUserEmailToProfile(data, currentUser), error: null };
      }
    } catch (error) {
      latestError = error;
      console.error('Unexpected error while inserting admin profile:', error);
    }

    return {
      data: {
        id: currentUser.id,
        full_name: insertPayload.full_name,
        role: 'admin',
        email: currentUser.email,
      },
      error: latestError,
    };
  }, [buildAllowedAdminProfile]);

  const ensureAdminProfileAccess = useCallback(async ({ force = false } = {}) => {
    if (!user || !isAllowedAdminEmail(user.email)) {
      return { data: profile, error: null };
    }

    let latestProfile = profile;

    if (force) {
      const supabase = await getSupabase();
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select(PROFILE_SELECT)
          .eq('id', user.id)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          console.error('Failed to fetch current admin profile before sync:', error);
        } else {
          latestProfile = data;
        }
      } catch (error) {
        console.error('Unexpected error while refreshing admin profile before sync:', error);
      }
    }

    const result = await syncAllowedAdminProfile(user, latestProfile, { force });

    if (result.data) {
      setProfile(attachUserEmailToProfile(result.data, user));
      setIsAdmin(true);
      setIsCreator(false);
    }

    return result;
  }, [profile, syncAllowedAdminProfile, user]);

  const fetchProfile = useCallback(async (user) => {
    if (!user) {
      setProfile(null);
      setIsAdmin(false);
      setIsCreator(false);
      return;
    }

    const hasAdminEmailAccess = isAllowedAdminEmail(user.email);
    const supabase = await getSupabase();

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(PROFILE_SELECT)
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        if (error.code !== 'PGRST116') {
           console.error("Error fetching profile:", error);
        }
      }

      if (hasAdminEmailAccess) {
        const { data: syncedProfile } = await syncAllowedAdminProfile(user, data, {
          force: !data || data.role !== 'admin',
        });
        setProfile(attachUserEmailToProfile(syncedProfile, user));
        setIsAdmin(true);
        setIsCreator(false);
      } else if (data) {
        setProfile(attachUserEmailToProfile(data, user));
        setIsAdmin(false);
        setIsCreator(data.role === 'creator');
      } else {
        setProfile(null);
        setIsAdmin(false);
        setIsCreator(false);
      }
    } catch (e) {
        console.error("An unexpected error occurred while fetching the profile:", e);
        logClientError({
          source: 'auth.fetchProfile',
          error: e,
          metadata: {
            userId: user?.id,
            email: user?.email,
          },
        });
        setProfile(null);
        setIsAdmin(false);
        setIsCreator(false);
    }
  }, [syncAllowedAdminProfile]);

  const handleSession = useCallback(async (currentSession, event = null) => {
    setSession(currentSession);
    const currentUser = currentSession?.user ?? null;
    setUser(currentUser);
    
    if (currentUser) {
        await fetchProfile(currentUser);
    } else {
        // Clear profile if no user
        setProfile(null);
        setIsAdmin(false);
        setIsCreator(false);
    }

    if (event) {
      setAuthEvent(event);
    }
    setLoading(false);
  }, [fetchProfile]);

  // Initial Session Check
  useEffect(() => {
    let mounted = true;
    let authInitHandle = null;
    let authListenerHandle = null;

    const initializeAuth = async () => {
      try {
        const supabase = await getSupabase();
        // Check for existing session
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
            // Handle specific refresh token errors
            if (error.message && (error.message.includes('refresh_token_not_found') || error.message.includes('Invalid Refresh Token'))) {
                console.warn("Refresh token invalid or missing. Clearing session.");
                await supabase.auth.signOut();
                if (mounted) {
                    handleSession(null, 'SIGNED_OUT');
                }
                return;
            }
            throw error;
        }

        if (mounted) {
            await handleSession(initialSession);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        logClientError({
          source: 'auth.initialize',
          error,
        });
        if (mounted) {
            handleSession(null);
        }
      } finally {
        if (mounted) {
            setLoading(false);
        }
      }
    };

    authInitHandle = scheduleAuthBoot(() => {
      initializeAuth();
    });

    // Listen for auth changes
    let subscription = null;
    const attachAuthListener = async () => {
      const supabase = await getSupabase();

      if (!mounted) {
        return;
      }

      const result = supabase.auth.onAuthStateChange(
        async (event, currentSession) => {
          if (event === 'TOKEN_REFRESHED') {
              console.log('Token refreshed successfully');
          }
          
          if (event === 'SIGNED_OUT') {
              // Clear state immediately on sign out
              if (mounted) {
                  setSession(null);
                  setUser(null);
                  setProfile(null);
                  setIsAdmin(false);
                  setIsCreator(false);
                  setLoading(false);
              }
          } else {
              if (mounted) {
                  await handleSession(currentSession, event);
              }
          }
        }
      );

      subscription = result.data.subscription;
    };

    if (shouldPrioritizeAuth()) {
      attachAuthListener();
    } else {
      authListenerHandle = scheduleAuthBoot(() => {
        attachAuthListener();
      });
    }

    return () => {
      mounted = false;
      cancelAuthBoot(authInitHandle);
      cancelAuthBoot(authListenerHandle);
      subscription?.unsubscribe();
    };
  }, [handleSession]);

  const signUp = useCallback(async (email, password, options) => {
    const supabase = await getSupabase();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        ...options,
        data: {
            full_name: options.fullName
        }
      },
    });

    if (error) {
      if (error.message.includes("User already registered")) {
         return { error: { message: "Account already created. Please log in instead." } };
      }
      toast({
        variant: "destructive",
        title: "Sign up Failed",
        description: error.message || "Something went wrong",
      });
    }

    return { data, error };
  }, []);

  const signIn = useCallback(async (email, password) => {
    const supabase = await getSupabase();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Sign in Failed",
        description: error.message || "Something went wrong",
      });
    }

    return { error };
  }, []);

  const signOut = useCallback(async () => {
    const supabase = await getSupabase();
    const { error } = await supabase.auth.signOut();
    // State clearing is handled by onAuthStateChange listener
    if (error) {
      toast({
        variant: "destructive",
        title: "Sign out Failed",
        description: error.message || "Something went wrong",
      });
    }

    return { error };
  }, []);
  
  const resetPasswordForEmail = useCallback(async (email) => {
    const supabase = await getSupabase();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${SITE_URL}`,
    });

    if (error) {
        toast({
            variant: 'destructive',
            title: 'Error sending reset link',
            description: error.message,
        });
        return { error };
    }
    toast({
        title: 'Password Reset Email Sent',
        description: 'Check your email for a password reset link.',
    });
    return { error: null };
  }, []);

  const updateUserPassword = useCallback(async (newPassword) => {
    const supabase = await getSupabase();
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
        toast({
            variant: 'destructive',
            title: 'Error updating password',
            description: error.message,
        });
        return { error };
    }
    return { error: null };
  }, []);

  const value = useMemo(() => ({
    user,
    profile,
    session,
    loading,
    isAdmin,
    isCreator,
    authEvent,
    signUp,
    signIn,
    signOut,
    ensureAdminProfileAccess,
    resetPasswordForEmail,
    updateUserPassword
  }), [user, profile, session, loading, isAdmin, isCreator, authEvent, signUp, signIn, signOut, ensureAdminProfileAccess, resetPasswordForEmail, updateUserPassword]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
