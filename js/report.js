/**
 * report.js
 * Builds one PDF covering every test the user has run, instead of the
 * original version which only ever wrote the acuity result.
 */

const Report = (() => {
  function init() {
    const downloadBtn = document.getElementById("downloadBtn");
    if (downloadBtn) downloadBtn.onclick = generate;
  }

  function generate() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const r = AppState.results;
    const c = AppState.calibration;
    let y = 20;

    const line = (text, size = 12, gap = 9) => {
      doc.setFontSize(size);
      doc.text(text, 20, y);
      y += gap;
    };

    line("VisionMeter Screening Report", 18, 14);
    line(`Generated: ${new Date().toLocaleString()}`, 10, 12);
    line(c.isCalibrated
      ? `Calibration: ${c.pxPerMM.toFixed(2)} px/mm, viewing distance ${(c.viewingDistanceMM/10).toFixed(0)} cm`
      : "Calibration: not performed (results are relative estimates only)", 10, 14);

    line("Visual Acuity", 14, 10);
    line(`Right eye: ${r.acuity.right ? `${r.acuity.right.snellen} — ${r.acuity.right.label}` : "Not tested"}`);
    line(`Left eye:  ${r.acuity.left ? `${r.acuity.left.snellen} — ${r.acuity.left.label}` : "Not tested"}`, 12, 14);

    line("Color Vision", 14, 10);
    line(`${r.color.label} (Correct: ${r.color.correct}, Incorrect: ${r.color.incorrect})`, 12, 14);

    line("Specialty Tests", 14, 10);
    line(`Astigmatism: ${r.astigmatism}`);
    line(`Contrast Sensitivity: ${r.contrast}`);
    line(`Visual Field: ${r.visualField.label} (${r.visualField.missed}/${r.visualField.total} missed${r.visualField.avgReactionMs ? `, avg ${r.visualField.avgReactionMs}ms` : ""})`, 12, 16);

    doc.setFontSize(10);
    doc.setTextColor(120);
    doc.text(
      "This report is a self-administered screening aid, not a clinical diagnosis.\nConsult a licensed eye care professional for a full examination.",
      20, y
    );

    doc.save("VisionMeter_Report.pdf");
  }

  return { init, generate };
})();

window.Report = Report;
document.addEventListener("DOMContentLoaded", Report.init);
