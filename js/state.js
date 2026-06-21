/**
 * state.js
 * Single source of truth for calibration + test results.
 * Nothing in here touches the DOM — other modules read/write this object
 * and re-render themselves.
 */

const AppState = {
  calibration: {
    isCalibrated: false,
    pxPerMM: null,        // physical pixels per millimetre on this screen
    viewingDistanceMM: null,
    method: null          // "manual" | "webcam"
  },

  results: {
    acuity: {
      right: null,        // { snellen: "6/12", label: "Slightly Weak" }
      left: null
    },
    color: {
      label: "Not Tested",
      correct: 0,
      incorrect: 0
    },
    astigmatism: "Not Tested",
    contrast: "Not Tested",
    visualField: {
      label: "Not Tested",
      missed: 0,
      total: 0,
      avgReactionMs: null
    },
    timestamp: null
  },

  reset() {
    this.results.acuity = { right: null, left: null };
    this.results.color = { label: "Not Tested", correct: 0, incorrect: 0 };
    this.results.astigmatism = "Not Tested";
    this.results.contrast = "Not Tested";
    this.results.visualField = { label: "Not Tested", missed: 0, total: 0, avgReactionMs: null };
    this.results.timestamp = null;
  },

  stamp() {
    this.results.timestamp = new Date().toISOString();
  }
};

// Expose globally — the project has no build step / bundler.
window.AppState = AppState;
