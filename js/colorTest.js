/**
 * colorTest.js
 * Procedurally generated color-discrimination test: a grid of bubbles,
 * one with a subtly shifted RGB value the user must tap.
 *
 * Fix applied: the original `diff = 15 - Math.floor(round/2)` could reach
 * 0 or go negative at higher rounds, making the "odd" bubble indistinguishable
 * even for someone with normal color vision. Clamped to a sane minimum.
 */

const ColorTest = (() => {
  const MIN_DIFF = 6; // smallest RGB delta we'll ever ask someone to spot
  const R = (a, b) => Math.floor(Math.random() * (b - a) + a);

  let round, score, wrong;
  let colorGrid, startColorBtn;

  function init() {
    colorGrid = document.getElementById("colorTestGrid");
    startColorBtn = document.getElementById("startColorBtn");
    if (!startColorBtn) return;
    startColorBtn.onclick = () => { round = 1; score = 0; wrong = 0; startRound(); };
  }

  function startRound() {
    colorGrid.innerHTML = "";
    const size = Math.min(3 + Math.floor(round / 2), 6);
    colorGrid.style.gridTemplateColumns = `repeat(${size},55px)`;

    const r = R(50, 200), g = R(50, 200), b = R(50, 200);
    const base = `rgb(${r},${g},${b})`;
    const diff = Math.max(MIN_DIFF, 15 - Math.floor(round / 2));
    const odd = `rgb(${r + diff},${g - diff},${b})`;

    const total = size * size;
    const oddIndex = Math.floor(Math.random() * total);

    for (let i = 0; i < total; i++) {
      const bubble = document.createElement("div");
      bubble.className = "bubble";
      bubble.style.background = (i === oddIndex ? odd : base);
      bubble.onclick = () => {
        if (i === oddIndex) score++; else wrong++;
        round++;
        if (round > 10) { finish(); return; }
        startRound();
      };
      colorGrid.appendChild(bubble);
    }
  }

  function finish() {
    let label;
    if (score >= 7 && wrong <= 2) label = "Normal Color Vision ✅";
    else if (score >= 4) label = "Mild Color Sensitivity 🟡";
    else label = "Possible Color Vision Deficiency ⚠️";

    AppState.results.color = { label, correct: score, incorrect: wrong };

    colorGrid.innerHTML = `
      <p class="handwriting">${label}</p>
      <p class="handwriting">Correct: ${score} | Incorrect: ${wrong}</p>
      <p style="font-size:13px; color:var(--text-dim);">
        A subtle red-green shift was used here. This is a screening cue, not a diagnosis —
        a clinical color vision test (e.g. Ishihara plates) is needed to confirm any deficiency.
      </p>`;
    if (window.History) window.History.saveSession();
  }

  return { init };
})();

window.ColorTest = ColorTest;
document.addEventListener("DOMContentLoaded", ColorTest.init);
