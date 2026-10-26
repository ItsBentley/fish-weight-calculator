/* ==========================================================
   ui.js - everything that draws on or reads from the screen
   These functions do not make decisions; app.js tells them
   what to show and what to do when buttons are pressed.
   ========================================================== */

/* Short helper: find an element by its id */
const $ = (id) => document.getElementById(id);

/* Reads a number box. Empty, negative or invalid input counts as 0 */
function readNumber(id) {
  const value = $(id).valueAsNumber;
  return Number.isFinite(value) && value > 0 ? value : 0;
}

/* True if the box has anything typed in it */
function hasValue(id) {
  return $(id).value.trim() !== '';
}

/* Updates the unit switch and shows the lb/oz or kg boxes to match */
function renderUnits(state) {
  $('u-lb').setAttribute('aria-pressed', state.unit === 'lb');
  $('u-kg').setAttribute('aria-pressed', state.unit === 'kg');
  document.querySelectorAll('.lb').forEach((el) => { el.hidden = state.unit !== 'lb'; });
  document.querySelectorAll('.kg').forEach((el) => { el.hidden = state.unit !== 'kg'; });
}

/* Draws the row of sling buttons: "Custom" plus each saved sling */
function renderChips(state, onSelect) {
  const box = $('chips');
  box.innerHTML = '';

  function addChip(id, label) {
    const b = document.createElement('button');
    b.className = 'chip';
    b.type = 'button';
    b.textContent = label;
    b.setAttribute('aria-pressed', state.sel === id);
    b.addEventListener('click', () => onSelect(id));
    box.appendChild(b);
  }

  addChip('custom', 'Custom');
  state.slings.forEach((s) => addChip(s.id, s.name));
}

/* Shows either the custom entry boxes or the chosen sling's weight */
function renderSlingPanel(state, slingLb) {
  const isCustom = state.sel === 'custom';
  $('custom').hidden = !isCustom;
  $('picked').hidden = isCustom;
  if (!isCustom) $('picked').textContent = formatWeight(slingLb, state.unit);
}

/* Draws the saved-slings list inside "Edit saved slings" */
function renderSlingList(state, onDelete) {
  const list = $('list');
  list.innerHTML = '';

  if (!state.slings.length) {
    const p = document.createElement('p');
    p.className = 'hint';
    p.textContent = 'No saved slings yet. Add one below.';
    list.appendChild(p);
  }

  state.slings.forEach((s) => {
    const row = document.createElement('div');
    row.className = 'item';

    const name = document.createElement('span');
    name.textContent = s.name;

    const weight = document.createElement('em');
    weight.textContent = formatWeight(s.lb, state.unit);

    const del = document.createElement('button');
    del.className = 'del';
    del.type = 'button';
    del.textContent = 'Delete';
    del.setAttribute('aria-label', 'Delete ' + s.name);
    del.addEventListener('click', () => onDelete(s.id));

    row.appendChild(name);
    row.appendChild(weight);
    row.appendChild(del);
    list.appendChild(row);
  });
}

/* Puts the answer in the result panel */
function showResult(mainText, altText) {
  $('out').textContent = mainText;
  $('alt').textContent = altText;
}

/* Shows a message under the Save sling button (isError makes it red) */
function showMessage(text, isError) {
  const msg = $('msg');
  msg.className = isError ? 'hint err' : 'hint';
  msg.textContent = text;
}

/* Opens or closes the "Edit saved slings" area */
function toggleManager() {
  const mgr = $('mgr');
  mgr.hidden = !mgr.hidden;
  $('manage').setAttribute('aria-expanded', !mgr.hidden);
  $('manage').textContent = mgr.hidden ? 'Edit saved slings' : 'Done editing';
}
