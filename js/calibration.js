/**
 * calibration.js
 * Fixes the core honesty problem in the original app: letter size in CSS
 * pixels means nothing without knowing (a) how many physical mm a pixel is
 * on THIS screen, and (b) how far the eye is from the screen.
 *
 * Method:
 *  1. User drags a slider until an on-screen bar matches a real object
 *     they're holding against the screen (credit card width = 85.60mm,
 *     the most universally available reference object).
 *  2. User enters viewing distance (cm) — with a measuring tip — or tries
 *     the experimental webcam face-width estimate where supported.
 *  3. pxPerMM and viewingDistanceMM are stored in AppState and reused by
 *     acuityTest.js to size letters by visual angle, not guesswork.
 */

const Calibration = (() => {
  const CARD_WIDTH_MM = 85.60; // ISO/IEC 7810 ID-1 card (credit card) width
  const AVG_FACE_WIDTH_MM = 140; // average bitemporal face width, used only
                                  // as a rough fallback for webcam distance

  let sliderPxWidth = 300; // starting width of the calibration bar in CSS px

  function init() {
    const bar = document.getElementById("calBar");
    const slider = document.getElementById("calSlider");
    const pxLabel = document.getElementById("calPxLabel");
    const distInput = document.getElementById("calDistance");
    const confirmBtn = document.getElementById("calConfirmBtn");
    const webcamBtn = document.getElementById("calWebcamBtn");
    const statusEl = document.getElementById("calStatus");

    if (!bar || !slider) return;

    slider.value = sliderPxWidth;
    bar.style.width = sliderPxWidth + "px";

    slider.oninput = () => {
      sliderPxWidth = Number(slider.value);
      bar.style.width = sliderPxWidth + "px";
      pxLabel.textContent = sliderPxWidth + " px";
    };

    confirmBtn.onclick = () => {
      const distanceCM = parseFloat(distInput.value);
      if (!distanceCM || distanceCM < 10 || distanceCM > 200) {
        statusEl.textContent = "Enter a realistic viewing distance between 10 and 200 cm.";
        statusEl.style.color = "var(--danger)";
        return;
      }
      const pxPerMM = sliderPxWidth / CARD_WIDTH_MM;
      AppState.calibration = {
        isCalibrated: true,
        pxPerMM,
        viewingDistanceMM: distanceCM * 10,
        method: "manual"
      };
      statusEl.style.color = "var(--accent-cyan)";
      statusEl.textContent = `Calibrated: ${pxPerMM.toFixed(2)} px/mm at ${distanceCM} cm. You can recalibrate any time from Settings.`;
      setTimeout(() => Nav.show("guidelineScreen"), 900);
    };

    if (webcamBtn) {
      const supported = "mediaDevices" in navigator && "FaceDetector" in window;
      webcamBtn.style.display = supported ? "inline-flex" : "none";
      webcamBtn.onclick = () => estimateDistanceViaWebcam(distInput, statusEl);
    }
  }

  // Experimental: estimate viewing distance from the apparent width of the
  // detected face in the webcam frame. Only runs in browsers that expose the
  // FaceDetector API (Chrome, behind a flag/origin trial in some versions).
  // This is intentionally a rough estimate, not a clinical measurement.
  async function estimateDistanceViaWebcam(distInput, statusEl) {
    statusEl.style.color = "var(--text-dim)";
    statusEl.textContent = "Requesting camera access…";
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.createElement("video");
      video.srcObject = stream;
      await video.play();

      const detector = new window.FaceDetector();
      const faces = await detector.detect(video);
      stream.getTracks().forEach(t => t.stop());

      if (!faces.length) {
        statusEl.textContent = "No face detected — enter distance manually instead.";
        statusEl.style.color = "var(--danger)";
        return;
      }

      const faceWidthPx = faces[0].boundingBox.width;
      const videoWidthPx = video.videoWidth;
      // Rough pinhole-camera estimate: assumes a roughly 60° horizontal FOV
      // webcam. This is a ballpark, flagged as experimental in the UI.
      const assumedFovDeg = 60;
      const fovRad = (assumedFovDeg * Math.PI) / 180;
      const sensorWidthAtDistance = 2 * Math.tan(fovRad / 2);
      const fractionOfFrame = faceWidthPx / videoWidthPx;
      const estimatedDistanceMM =
        AVG_FACE_WIDTH_MM / (fractionOfFrame * sensorWidthAtDistance);
      const estimatedCM = Math.round(estimatedDistanceMM / 10);

      distInput.value = estimatedCM;
      statusEl.style.color = "var(--accent-amber)";
      statusEl.textContent = `Experimental estimate: ~${estimatedCM} cm. Adjust if it looks wrong, then confirm.`;
    } catch (err) {
      statusEl.style.color = "var(--danger)";
      statusEl.textContent = "Camera estimate unavailable — enter distance manually.";
    }
  }

  return { init, CARD_WIDTH_MM };
})();

window.Calibration = Calibration;
document.addEventListener("DOMContentLoaded", Calibration.init);
