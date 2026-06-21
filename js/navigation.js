/**
 * navigation.js
 * Owns the screen stack. Every "screen" is a .screen element in index.html;
 * this module is the only thing allowed to toggle their visibility.
 */

const Nav = (() => {
  const screenIds = [
    "welcomeScreen", "modeScreen", "calibrationScreen", "guidelineScreen",
    "testScreen", "colorTestScreen", "extraTestsScreen", "astigmatismScreen",
    "contrastScreen", "visualFieldScreen", "extraSummaryScreen", "historyScreen"
  ];

  function hideAll() {
    screenIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = "none";
    });
  }

  function show(id) {
    hideAll();
    const el = document.getElementById(id);
    if (el) {
      el.style.display = "block";
      el.classList.remove("fade-in");
      // restart the entrance animation
      requestAnimationFrame(() => el.classList.add("fade-in"));
    }
  }

  function goToModeSelect() { show("modeScreen"); }

  function goToVisionEntry() {
    // Acuity test needs calibration first. If not calibrated yet, route there.
    if (!AppState.calibration.isCalibrated) {
      show("calibrationScreen");
    } else {
      show("guidelineScreen");
    }
  }

  function showGuidelines() { show("guidelineScreen"); }
  function showColorTest() { show("colorTestScreen"); }
  function showExtraTests() { show("extraTestsScreen"); }
  function showHistory() {
    show("historyScreen");
    if (window.History && window.History.renderList) window.History.renderList();
  }

  return {
    show, hideAll, goToModeSelect, goToVisionEntry,
    showGuidelines, showColorTest, showExtraTests, showHistory
  };
})();

window.Nav = Nav;

// Keep the old global function names so inline onclick="" handlers in the
// HTML keep working without edits.
function goToModeSelect() { Nav.goToModeSelect(); }
function showGuidelines() { Nav.goToVisionEntry(); }
function showColorTest() { Nav.showColorTest(); }
function showExtraTests() { Nav.showExtraTests(); }
function showHistory() { Nav.showHistory(); }
