export const shouldEnableEnhancedVisuals = ({ minWidth = 1024 } = {}) => {
  if (typeof window === 'undefined') {
    return false;
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return false;
  }

  if (typeof minWidth === 'number' && !window.matchMedia(`(min-width: ${minWidth}px)`).matches) {
    return false;
  }

  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

  if (connection?.saveData) {
    return false;
  }

  if (['slow-2g', '2g', '3g'].includes(connection?.effectiveType || '')) {
    return false;
  }

  if (typeof navigator.hardwareConcurrency === 'number' && navigator.hardwareConcurrency <= 4) {
    return false;
  }

  return true;
};
