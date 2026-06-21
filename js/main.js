/**
 * main.js
 * Thin entry point. Anything that isn't owned by a specific test module
 * (calibration, acuity, color, specialty, speech, history, report, auth,
 * eyeTips) lives here: recalibrate trigger, eye-health fact ticker, and the
 * mobile sidebar drawer (hamburger menu) used on narrow screens.
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

  // ---------- Rotating eye-health facts ----------
  const facts = [
    "The human eye can distinguish about 10 million different colors.",
    "Eyes blink around 15–20 times per minute — roughly 28,000 times a day.",
    "The cornea is the only tissue in the human body without blood vessels.",
    "Visual acuity testing dates back to Snellen's 1862 eye chart.",
    "Each eye has a blind spot where the optic nerve connects — the brain fills it in.",
    "The eye can process the equivalent of about 36,000 bits of information per hour.",
    "Newborns see only in shades of grey for the first few weeks of life.",
    "Eye muscles are among the fastest and most active muscles in the body.",
    "About 1 in 12 men and 1 in 200 women have some form of color vision deficiency.",
    "Tears contain an antibacterial enzyme called lysozyme that helps protect the eye.",
    "The human eye can detect a single candle flame from about 30 miles away on a clear, dark night.",
    "Screen use can reduce blink rate by up to half, which is why eyes feel dry after long sessions."
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

  // ---------- Mobile sidebar drawer ----------
  const sidebar = document.querySelector(".sidebar");
  const menuBtn = document.getElementById("mobileMenuBtn");
  const backdrop = document.getElementById("sidebarBackdrop");

  function openSidebar() {
    sidebar?.classList.add("open");
    backdrop?.classList.add("visible");
  }
  function closeSidebar() {
    sidebar?.classList.remove("open");
    backdrop?.classList.remove("visible");
  }

  if (menuBtn) menuBtn.onclick = () => sidebar?.classList.contains("open") ? closeSidebar() : openSidebar();
  if (backdrop) backdrop.onclick = closeSidebar;

  // navigation.js calls this after every screen change so the drawer
  // doesn't stay open over the new screen on mobile.
  window.closeMobileSidebar = closeSidebar;
});
