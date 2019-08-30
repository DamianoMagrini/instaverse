/**
 * @module environment-metadata
 */

const can_use_dom = !(
  typeof window === 'undefined' ||
  !window.document ||
  !window.document.createElement ||
  // This is quite clever
  window._ssr
);

const environment_metadata = {
  canUseDOM: can_use_dom,
  canUseWorkers: typeof Worker !== 'undefined',
  canUseEventListeners:
    can_use_dom && ('addEventListener' in window || 'attachEvent' in window),
  canUseViewport: can_use_dom && Boolean(window.screen),
  isInWorker: !can_use_dom
};

export default environment_metadata;
