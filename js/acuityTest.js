/**
 * acuityTest.js
 * Letter-identification visual acuity test.
 *
 * Each "line" corresponds to a Snellen-style denominator (6/60 down to
 * 6/4.5). Given the calibration data (px per mm, viewing distance), we
 * compute the exact letter height in pixels that subtends the correct
 * visual angle for that line, instead of picking pixel sizes by feel.
 *
 * Standard reference: a 6/6 optotype subtends 5 arcminutes overall height
 * at the test distance. Other lines scale proportionally with denominator.
 */

const AcuityTest = (() => {
  const LINES = [
    { snellen: "6/60", label: "Severely Reduced Vision" },
    { snellen: "6/36", label: "Significantly Reduced Vision" },
    { snellen: "6/24", label: "Weak Vision" },
    { snellen: "6/18", label: "Slightly Weak Vision" },
    { snellen: "6/12", label: "Mildly Reduced Vision" },
    { snellen: "6/9",  label: "Near-Normal Vision" },
    { snellen: "6/6",  label: "Normal Vision (6/6)" },
    { snellen: "6/4.5", label: "Better Than Normal" }
  ];
  const letters = [..."ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"];

  let levelIdx, correctCount, attemptsLeft, testing, rightEyeResult, leftEyeResult;

  let letterElement, input, instruction, startBtn, downloadBtn, resultBox, calNoticeEl;

  function init() {
    letterElement = document.getElementById("letter");
    input = document.getElementById("input");
    instruction = document.getElementById("instruction");
    startBtn = document.getElementById("startBtn");
    downloadBtn = document.getElementById("downloadBtn");
    resultBox = document.getElementById("resultBox");
    calNoticeEl = document.getElementById("calNotice");

    if (!startBtn) return;
    startBtn.onclick = startEyeTest;
    input.onkeydown = e => {
      if (e.key === "Enter") {
        checkAnswer(input.value.toUpperCase().trim());
        input.value = "";
      }
    };
  }

  // denominator X of "6/X" -> required letter height in pixels at the
  // calibrated viewing distance.
  function pxHeightForLine(denominatorStr) {
    const denom = parseFloat(denominatorStr.split("/")[1]);
    const angleArcMin = 5 * (denom / 6);
    const angleRad = (angleArcMin / 60) * (Math.PI / 180);
    const distanceMM = AppState.calibration.viewingDistanceMM;
    const heightMM = 2 * distanceMM * Math.tan(angleRad / 2);
    return heightMM * AppState.calibration.pxPerMM;
  }

  function startEyeTest() {
    levelIdx = 0; correctCount = 0; attemptsLeft = 5;
    testing = testing || "right";
    resultBox.style.display = "none";
    if (calNoticeEl) {
      const c = AppState.calibration;
      calNoticeEl.textContent = c.isCalibrated
        ? `Calibrated · ${c.pxPerMM.toFixed(1)} px/mm · viewing distance ${(c.viewingDistanceMM/10).toFixed(0)} cm`
        : "Not calibrated — results are relative estimates only.";
    }
    showLetter();
  }

  function showLetter() {
    letterElement.style.display = "block";
    input.style.display = "block";
    input.focus();
    const px = AppState.calibration.isCalibrated
      ? pxHeightForLine(LINES[levelIdx].snellen)
      : [90,72,58,46,36,26,18,14][levelIdx]; // fallback if user skipped calibration
    letterElement.style.fontSize = Math.max(6, px) + "px";
    letterElement.textContent = letters[Math.floor(Math.random() * letters.length)];
  }

  function checkAnswer(val) {
    if (val === letterElement.textContent) correctCount++;
    else attemptsLeft--;

    if (correctCount >= 5) { levelIdx++; correctCount = 0; attemptsLeft = 5; }
    if (attemptsLeft <= 0 || levelIdx >= LINES.length) { finishEyeTest(); return; }
    showLetter();
  }

  function finishEyeTest() {
    // levelIdx may have overshot the array on a perfect run — clamp it.
    const reachedIdx = Math.min(levelIdx, LINES.length - 1);
    const result = LINES[reachedIdx];

    if (testing === "right") {
      rightEyeResult = result;
      testing = "left";
      instruction.textContent = "Now cover RIGHT eye";
      startEyeTest();
    } else {
      leftEyeResult = result;
      showFinalReport();
    }
  }

  function showFinalReport() {
    letterElement.style.display = "none";
    input.style.display = "none";
    resultBox.style.display = "block";

    AppState.results.acuity.right = rightEyeResult;
    AppState.results.acuity.left = leftEyeResult;

    const bothNormalOrBetter = [rightEyeResult, leftEyeResult]
      .every(r => ["6/6", "6/4.5"].includes(r.snellen));

    resultBox.innerHTML = `
      <h2>Final Report</h2>
      Right Eye: <b>${rightEyeResult.snellen} — ${rightEyeResult.label}</b><br>
      Left Eye: <b>${leftEyeResult.snellen} — ${leftEyeResult.label}</b><br><br>
      Recommendation: ${bothNormalOrBetter
        ? "Your screen-based acuity estimate looks within the normal range."
        : "Your estimate suggests reduced clarity in at least one eye — consider an in-person eye exam."}
      <p style="margin-top:14px; font-size:13px; color:var(--text-dim);">
        This is a screen-based estimate${AppState.calibration.isCalibrated ? " using your calibration data" : " (uncalibrated)"} —
        not a substitute for a clinical refraction.
      </p>`;
    downloadBtn.style.display = "block";

    // reset for next run
    testing = "right";
    if (window.History) window.History.saveSession();
  }

  return { init };
})();

window.AcuityTest = AcuityTest;
document.addEventListener("DOMContentLoaded", AcuityTest.init);
