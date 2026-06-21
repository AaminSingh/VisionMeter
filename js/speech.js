/**
 * speech.js
 * Voice-based letter entry for the acuity test, via the Web Speech API.
 * Fix applied: the original version only worked if SpeechRecognition existed
 * and otherwise did nothing — the mic button stayed clickable but dead.
 * Now it explicitly disables itself and tells the user why.
 */

const SpeechInput = (() => {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  let recognizer = null;
  let listening = false;
  let voiceBtn;

  const correctionMap = { SEE: "C", DEE: "D", EE: "E", WHY: "Y", ZED: "Z", ZEE: "Z" };

  function init() {
    voiceBtn = document.getElementById("voiceBtn");
    if (!voiceBtn) return;

    if (!SR) {
      voiceBtn.disabled = true;
      voiceBtn.textContent = "🎤 Voice input not supported here";
      voiceBtn.title = "Your browser doesn't support the Web Speech API. Try Chrome on desktop or Android.";
      voiceBtn.style.opacity = "0.5";
      voiceBtn.style.cursor = "not-allowed";
      return;
    }

    // Best-effort mic permission probe — failures are caught and ignored;
    // the real permission prompt happens when recognition actually starts.
    navigator.mediaDevices?.getUserMedia?.({ audio: true })
      .then(stream => stream.getTracks().forEach(t => t.stop()))
      .catch(() => { /* user can still try the button; browser will prompt */ });

    recognizer = new SR();
    recognizer.lang = "en-US";
    recognizer.continuous = true;

    recognizer.onresult = e => {
      const transcript = e.results[e.results.length - 1][0].transcript.toUpperCase().trim();
      const confidence = e.results[e.results.length - 1][0].confidence;
      const resolved = correctionMap[transcript] || transcript;

      // Low-confidence single-letter guesses get flagged instead of silently
      // accepted, so a misheard letter doesn't quietly wreck the test.
      if (confidence !== undefined && confidence < 0.4) {
        const note = document.getElementById("voiceConfidenceNote");
        if (note) {
          note.textContent = `Heard "${transcript}" with low confidence — please repeat or type it.`;
          note.style.display = "block";
        }
        return;
      }
      if (window.AcuityTest && window.checkAnswerFromVoice) {
        window.checkAnswerFromVoice(resolved);
      }
    };

    recognizer.onend = () => { if (listening) recognizer.start(); };
    recognizer.onerror = () => {
      voiceBtn.textContent = "🎤 Speak Letter";
      listening = false;
    };

    voiceBtn.onclick = () => {
      listening = !listening;
      listening ? recognizer.start() : recognizer.stop();
      voiceBtn.textContent = listening ? "🎤 Listening…" : "🎤 Speak Letter";
    };
  }

  return { init };
})();

window.SpeechInput = SpeechInput;
document.addEventListener("DOMContentLoaded", SpeechInput.init);

// acuityTest.js owns checkAnswer(); expose a thin bridge so speech.js
// doesn't need to know its internals.
window.checkAnswerFromVoice = function (letter) {
  const input = document.getElementById("input");
  if (!input) return;
  input.value = letter;
  input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
};
