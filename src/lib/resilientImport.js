import { logClientError } from './errorLogger';

const IMPORT_RELOAD_SESSION_PREFIX = 'lifelapss-import-reload';

const isChunkLoadError = (error) => {
  const message = error?.message || '';

  return (
    message.includes('Failed to fetch dynamically imported module') ||
    message.includes('error loading dynamically imported module') ||
    message.includes('Importing a module script failed') ||
    message.includes('ChunkLoadError') ||
    message.includes('Loading chunk') ||
    message.includes('Failed to load module script')
  );
};

export const resilientImport = async (loader, cacheKey = 'default') => {
  try {
    const loadedModule = await loader();

    if (typeof window !== 'undefined') {
      try {
        window.sessionStorage.removeItem(`${IMPORT_RELOAD_SESSION_PREFIX}:${cacheKey}`);
      } catch (e) {
        // Ignore sessionStorage exceptions in strict privacy modes
      }
    }

    return loadedModule;
  } catch (error) {
    logClientError({
      source: 'resilient-import',
      error,
      metadata: { cacheKey },
    });

    if (typeof window !== 'undefined' && isChunkLoadError(error)) {
      const sessionKey = `${IMPORT_RELOAD_SESSION_PREFIX}:${cacheKey}`;
      let hasReloaded = false;
      
      try {
        hasReloaded = window.sessionStorage.getItem(sessionKey) === '1';
      } catch (e) {
        // Ignore sessionStorage exceptions
        hasReloaded = true; // Prevent infinite reload loop in incognito
      }

      if (!hasReloaded) {
        try {
          window.sessionStorage.setItem(sessionKey, '1');
        } catch (e) {
          // Ignore
        }

        // Retry once in-process instead of forcing a full-page refresh.
        return loader();
      }

      try {
        window.sessionStorage.removeItem(sessionKey);
      } catch (e) {
        // Ignore
      }
    }

    throw error;
  }
};