/* ==========================================================
   storage.js - saving and loading on this device
   Uses the browser's localStorage. Everything is wrapped in
   try/catch because storage can be blocked (e.g. private mode).
   ========================================================== */

const STORAGE_KEY = 'fishweights';   // where the app's data is kept
const OLD_STORAGE_KEY = 'sling';     // key used by the very first version (still read once)
let storageWarningShown = false;

function warnStorage(message, error) {
  if (storageWarningShown) return;
  storageWarningShown = true;
  console.warn(message, error);
}

/* Saves the whole app state */
function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    warnStorage('Unable to save calculator settings in this browser.', error);
  }
}

/* Loads saved data into the given state object (changes it in place) */
function loadState(state) {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (saved) {
      state.unit = saved.unit === 'kg' ? 'kg' : 'lb';
      state.sel = saved.sel || 'custom';
      state.slings = Array.isArray(saved.slings) ? saved.slings : [];
      state.custom = saved.custom || saved.c || state.custom;   // "c" = name used in earlier versions
      return;
    }

    // No new-style data: fall back to the first version's custom sling weight
    const old = JSON.parse(localStorage.getItem(OLD_STORAGE_KEY) || 'null');
    if (old) {
      state.unit = old.unit === 'kg' ? 'kg' : 'lb';
      state.custom = { lb: old.slb || '', oz: old.soz || '', kg: old.skg || '' };
    }
  } catch (error) {
    warnStorage('Unable to load saved calculator settings; starting with defaults.', error);
  }
}
