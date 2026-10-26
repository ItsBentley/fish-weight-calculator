/* ==========================================================
   units.js - weight conversion and display formatting
   Every weight inside the app is stored in pounds (a decimal
   number). It is only converted when shown on screen.
   ========================================================== */

const KG_PER_LB = 0.45359237;

/* Pounds -> kilograms */
function lbToKg(lb) {
  return lb * KG_PER_LB;
}

/* Kilograms -> pounds */
function kgToLb(kg) {
  return kg / KG_PER_LB;
}

/* Turns a pounds value into text like "3 lb 4.5 oz".
   Rounds to the nearest tenth of an ounce and carries 16 oz over into 1 lb. */
function formatLbOz(lb) {
  const totalOz = Math.round(lb * 16 * 10) / 10;
  let pounds = Math.floor(totalOz / 16 + 1e-9);
  let ounces = Math.round((totalOz - pounds * 16) * 10) / 10;
  if (ounces >= 16) { pounds += 1; ounces = 0; }
  return pounds + ' lb ' + ounces + ' oz';
}

/* Formats a pounds value in whichever unit is selected ('lb' or 'kg') */
function formatWeight(lb, unit) {
  return unit === 'kg' ? lbToKg(lb).toFixed(3) + ' kg' : formatLbOz(lb);
}
