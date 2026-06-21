/**
 * main.js
 * Thin entry point. Anything that isn't owned by a specific test module
 * (calibration, acuity, color, specialty, speech, history, report) lives
 * here: welcome screen, recalibrate trigger, eye-health fact ticker.
 */

document.addEventListener("DOMContentLoaded", () => {
  // Recalibrate button (Settings-style action available from the mode screen)
  const recalBtn = document.getElementById("recalibrateBtn");
  if (recalBtn) {
    recalBtn.onclick = () => {
      AppState.calibration.isCalibrated = false;
      Nav.show("calibrationScreen");
    };
  }

  // Rotating eye-health facts in the sidebar
  const facts = [
    "The human eye can distinguish about 10 million different colors.",
    "Eyes blink around 15–20 times per minute — roughly 28,000 times a day.",
    "The cornea is the only tissue in the human body without blood vessels.",
    "Visual acuity testing dates back to Snellen's 1862 eye chart."
  ];
  const factEl = document.querySelector(".fact-text");
  if (factEl) {
    let i = 0;
    factEl.textContent = facts[0];
    setInterval(() => {
      i = (i + 1) % facts.length;
      factEl.style.opacity = 0;
      setTimeout(() => { factEl.textContent = facts[i]; factEl.style.opacity = 1; }, 300);
    }, 6000);
  }
});
