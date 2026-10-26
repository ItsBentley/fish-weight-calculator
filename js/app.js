/* ==========================================================
   app.js - the app's logic and button wiring
   Sections: 1 State  2 Calculations  3 Redraw  4 Actions
             5 Button wiring  6 Start-up
   ========================================================== */

/* ---------- 1. State: everything the app remembers ---------- */
const state = {
  unit: 'lb',                          // 'lb' (lb & oz) or 'kg'
  sel: 'custom',                       // 'custom' or the id of the chosen saved sling
  slings: [],                          // saved slings: { id, name, lb }  (weight kept in pounds)
  custom: { lb: '', oz: '', kg: '' }   // what was typed in the custom sling boxes
};

/* Last time Save sling ran (stops a single tap saving twice) */
let lastSaveTime = 0;


/* ---------- 2. Calculations ---------- */

/* Scale reading (fish + sling) in pounds */
function getScaleLb() {
  return state.unit === 'kg'
    ? kgToLb(readNumber('gkg'))
    : readNumber('glb') + readNumber('goz') / 16;
}

/* Weight of the sling currently chosen, in pounds */
function getSlingLb() {
  if (state.sel === 'custom') {
    return state.unit === 'kg'
      ? kgToLb(readNumber('skg'))
      : readNumber('slb') + readNumber('soz') / 16;
  }
  const found = state.slings.find((s) => s.id === state.sel);
  return found ? found.lb : 0;
}

/* Works out fish weight = scale reading - sling, and shows it */
function updateResult() {
  const hasReading = state.unit === 'lb'
    ? (hasValue('glb') || hasValue('goz'))
    : hasValue('gkg');

  if (!hasReading) {
    showResult('\u2013', 'Enter the scale reading to see the result.');
    return;
  }

  let fishLb = getScaleLb() - getSlingLb();

  if (fishLb < -1e-9) {   // sling heavier than the reading: probably a typo
    showResult('Check numbers', 'The sling weighs more than the scale reading.');
    return;
  }
  if (fishLb < 0) fishLb = 0;   // ignore tiny rounding error

  if (state.unit === 'lb') {
    const decimalLb = Math.round(fishLb * 100) / 100;
    const kg = Math.round(lbToKg(fishLb) * 1000) / 1000;
    showResult(formatLbOz(fishLb), decimalLb + ' lb  \u2022  ' + kg + ' kg');
  } else {
    showResult(lbToKg(fishLb).toFixed(3) + ' kg', formatLbOz(fishLb));
  }
}


/* ---------- 3. Redraw the screen from the current state ---------- */
function render() {
  renderUnits(state);
  renderChips(state, selectSling);
  renderSlingPanel(state, getSlingLb());
  renderSlingList(state, deleteSling);
}

/* Save, redraw and recalculate: used after anything changes */
function refresh() {
  saveState(state);
  render();
  updateResult();
}


/* ---------- 4. Actions ---------- */

function setUnit(unit) {
  state.unit = unit;
  refresh();
}

function selectSling(id) {
  state.sel = id;
  refresh();
}

function deleteSling(id) {
  state.slings = state.slings.filter((s) => s.id !== id);
  if (state.sel === id) state.sel = 'custom';   // fall back if the chosen sling was deleted
  refresh();
}

/* Adds a new named sling from the "add a sling" form */
function addSling() {
  const name = $('aname').value.trim();
  const lb = state.unit === 'kg'
    ? kgToLb(readNumber('akg'))
    : readNumber('alb') + readNumber('aoz') / 16;

  if (!name) { showMessage('Enter a name for the sling.', true); return; }
  if (lb <= 0) { showMessage('Enter the sling weight.', true); return; }

  const id = 's' + Date.now();
  state.slings.push({ id, name, lb });
  state.sel = id;   // use the new sling straight away

  ['aname', 'alb', 'aoz', 'akg'].forEach((field) => { $(field).value = ''; });
  showMessage('Saved ' + name + '.', false);
  refresh();

  // Close the phone keyboard
  try { if (document.activeElement) document.activeElement.blur(); } catch (e) {}
}

/* Runs addSling, ignoring a second trigger within 0.7s (a tap can fire two events) */
function trySaveSling() {
  const now = Date.now();
  if (now - lastSaveTime < 700) return;
  lastSaveTime = now;
  addSling();
}

/* Empties the scale reading boxes, ready for the next fish */
function clearReading() {
  ['glb', 'goz', 'gkg'].forEach((id) => { $(id).value = ''; });
  updateResult();
  (state.unit === 'lb' ? $('glb') : $('gkg')).focus();
}

/* Remembers what was typed in the custom sling boxes */
function onCustomSlingInput() {
  state.custom = { lb: $('slb').value, oz: $('soz').value, kg: $('skg').value };
  saveState(state);
  updateResult();
}


/* ---------- 5. Button wiring ---------- */
function wireEvents() {
  $('u-lb').onclick = () => setUnit('lb');
  $('u-kg').onclick = () => setUnit('kg');
  $('manage').onclick = toggleManager;
  $('clear').onclick = clearReading;

  // Recalculate whenever the scale reading changes
  ['glb', 'goz', 'gkg'].forEach((id) => $(id).addEventListener('input', updateResult));

  // Remember and recalculate whenever the custom sling boxes change
  ['slb', 'soz', 'skg'].forEach((id) => $(id).addEventListener('input', onCustomSlingInput));

  // Save sling button. pointerdown stops the iPhone keyboard closing first
  // (which can make the tap miss); pointerup and click both save, guarded against doubles.
  $('save').addEventListener('pointerdown', (e) => e.preventDefault());
  $('save').addEventListener('pointerup', trySaveSling);
  $('save').addEventListener('click', trySaveSling);
}


/* ---------- 6. Start-up ---------- */
loadState(state);                     // bring back saved slings and settings
$('slb').value = state.custom.lb || '';   // refill the custom sling boxes
$('soz').value = state.custom.oz || '';
$('skg').value = state.custom.kg || '';
wireEvents();
render();
updateResult();
