/**
 * specialtyTests.js
 * Astigmatism + contrast sensitivity (self-report on static charts, now with
 * a brightness-check step) and a rebuilt visual field test that actually
 * measures something: per-dot reaction time and missed dots, instead of
 * always reporting "Completed" regardless of performance.
 */

const SpecialtyTests = (() => {
  // ---------- Astigmatism / Contrast (self-report) ----------
  function startAstigmatismTest() { Nav.show("astigmatismScreen"); }
  function startContrastTest() { Nav.show("contrastScreen"); }

  function setAstigmatismResult(result) {
    AppState.results.astigmatism = result;
    Nav.showExtraTests();
  }
  function setContrastResult(result) {
    AppState.results.contrast = result;
    Nav.showExtraTests();
  }

  // ---------- Visual Field (reaction time + miss tracking) ----------
  const TOTAL_DOTS = 8;
  const TIMEOUT_MS = 2500;
  let dotsShown = 0, missed = 0, reactionTimes = [];
  let activeTimer = null;

  function startVisualFieldTest() {
    Nav.show("visualFieldScreen");
    dotsShown = 0; missed = 0; reactionTimes = [];
    const area = document.getElementById("vfArea");
    area.innerHTML = "";
    const progressEl = document.getElementById("vfProgress");
    if (progressEl) progressEl.textContent = `Dot 1 of ${TOTAL_DOTS}`;
    nextDot(area, progressEl);
  }

  function nextDot(area, progressEl) {
    area.innerHTML = "";
    if (dotsShown >= TOTAL_DOTS) { finishVisualField(); return; }
    dotsShown++;
    if (progressEl) progressEl.textContent = `Dot ${dotsShown} of ${TOTAL_DOTS}`;

    const dot = document.createElement("div");
    dot.className = "vf-dot";
    dot.style.top = (Math.random() * 260) + "px";
    dot.style.left = (Math.random() * 260) + "px";

    const shownAt = performance.now();
    let resolved = false;

    dot.onclick = () => {
      if (resolved) return;
      resolved = true;
      clearTimeout(activeTimer);
      reactionTimes.push(performance.now() - shownAt);
      nextDot(area, progressEl);
    };

    area.appendChild(dot);

    activeTimer = setTimeout(() => {
      if (resolved) return;
      resolved = true;
      missed++;
      nextDot(area, progressEl);
    }, TIMEOUT_MS);
  }

  function finishVisualField() {
    const avg = reactionTimes.length
      ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)
      : null;
    const missRate = missed / TOTAL_DOTS;

    let label;
    if (missRate === 0 && avg !== null && avg < 1200) label = "Full Field Response ✅";
    else if (missRate <= 0.25) label = "Mostly Responsive 🟡";
    else label = "Reduced Field Response ⚠️";

    AppState.results.visualField = {
      label, missed, total: TOTAL_DOTS, avgReactionMs: avg
    };
    Nav.showExtraTests();
  }

  // ---------- Combined Summary ----------
  function showExtraTestSummary() {
    Nav.show("extraSummaryScreen");
    const { astigmatism, contrast, visualField, color, acuity } = AppState.results;

    const allLookNormal =
      astigmatism.includes("Normal") &&
      contrast.includes("Normal") &&
      visualField.label.includes("Full Field");

    const overall = allLookNormal
      ? "Your specialty screenings appear generally normal ✅"
      : "Some results show signs of stress — consider consulting an ophthalmologist ⚠️";

    document.getElementById("extraSummaryText").innerHTML = `
      🤓 Astigmatism: <b>${astigmatism}</b><br><br>
      🐼 Contrast Sensitivity: <b>${contrast}</b><br><br>
      🦊 Visual Field: <b>${visualField.label}</b>
        <span style="color:var(--text-dim); font-size:13px;">
          (${visualField.missed}/${visualField.total} missed${visualField.avgReactionMs ? `, avg ${visualField.avgReactionMs}ms` : ""})
        </span><br><br>
      <b>${overall}</b>`;
    AppState.stamp();
    if (window.History) window.History.saveSession();
  }

  return {
    startAstigmatismTest, startContrastTest,
    setAstigmatismResult, setContrastResult,
    startVisualFieldTest, finishVisualField,
    showExtraTestSummary
  };
})();

window.SpecialtyTests = SpecialtyTests;

// Bridge names used by inline onclick="" in index.html
function startAstigmatismTest() { SpecialtyTests.startAstigmatismTest(); }
function startContrastTest() { SpecialtyTests.startContrastTest(); }
function startVisualFieldTest() { SpecialtyTests.startVisualFieldTest(); }
function finishVisualField() { /* now driven automatically by dot timeout/clicks */ }
function showExtraTestSummary() { SpecialtyTests.showExtraTestSummary(); }
