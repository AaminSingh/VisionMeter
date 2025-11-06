// ---------- SCREEN REFERENCES ----------
const welcomeScreen = document.getElementById("welcomeScreen");
const guidelineScreen = document.getElementById("guidelineScreen");
const testScreen = document.getElementById("testScreen");

// ---------- SCREEN NAVIGATION ----------
function showGuidelines() {
  welcomeScreen.style.display = "none";
  guidelineScreen.style.display = "block";
}

function startTest() {
  guidelineScreen.style.display = "none";
  testScreen.style.display = "block";
  beginTest(); // ✅ auto-starts test
}

// ---------- TEST VARIABLES ----------
const letters = ["E", "F", "P", "T", "O", "Z", "L", "C", "A", "D"];
let level = 1, correctCount = 0, testing = "right";
let rightEyeResult = "", leftEyeResult = "";

// ---------- LETTER SIZE LEVELS ----------const letterSizes = { 
 const letterSizes = { 
  1: 70,   // Easy
  2: 55,   // Still readable
  3: 40,   // Medium
  4: 28,   // Normal clarity threshold (≈ 6/6)
  5: 22,   // Below average eyesight will struggle here
  6: 18,   // Excellent eyesight required
  7: 14    // Extreme clarity (final challenge)
};



// ---------- ELEMENTS ----------
const letterElement = document.getElementById("letter");
const input = document.getElementById("input");
const instruction = document.getElementById("instruction");
const startBtn = document.getElementById("startBtn");
const downloadBtn = document.getElementById("downloadBtn");

// ---------- SOUNDS ----------
const correctSound = new Audio("correct.mp3");
const wrongSound = new Audio("wrong.mp3");

// ---------- START TEST ----------
startBtn.addEventListener("click", () => {
  startBtn.style.display = "none";
  letterElement.style.display = "block";
  input.style.display = "block";
  beginTest();
});

function beginTest() { level = 1; correctCount = 0; showLetter(); }

// ---------- SHOW LETTER ----------
function showLetter() {
  letterElement.style.fontSize = letterSizes[level] + "px";
  letterElement.textContent = letters[Math.floor(Math.random() * letters.length)];
}

// ---------- CHECK USER INPUT ----------
input.addEventListener("keydown", function(event) {
  if (event.key === "Enter") {
    const val = input.value.toUpperCase(); input.value = "";

    if (val === letterElement.textContent) {
      correctSound.play();
      letterElement.classList.add("correct-anim");
      setTimeout(() => letterElement.classList.remove("correct-anim"), 300);
      correctCount++;
    } else {
      wrongSound.play();
      letterElement.classList.add("wrong-anim");
      setTimeout(() => letterElement.classList.remove("wrong-anim"), 350);
    }

    if (correctCount >= 3) { level++; correctCount = 0; if (level > 7) { finishEyeTest(); return; } }
    showLetter();
  }
});

// ---------- EYE SWITCH ----------
function finishEyeTest() {
  let result = "";
  if (level <= 2) result = "Weak Vision (≈ 6/18 - 6/12)";
  else if (level === 3) result = "Slightly Weak (≈ 6/9)";
  else if (level === 4) result = "Normal Vision (≈ 6/6)";
  else if (level === 5) result = "Better Than Normal (≈ 6/5)";
  else if (level === 6) result = "Excellent Vision (≈ 6/4)";
  else result = "High Visual Acuity (≈ 6/3)";

  if (testing === "right") {
    rightEyeResult = result;
    instruction.innerHTML = "✅ Right Eye Done.<br>Now cover your <b>RIGHT eye</b> to test LEFT eye.";
    testing = "left"; beginTest();
  } else {
    leftEyeResult = result; showFinalResults();
  }
}

// ---------- FINAL RESULT ----------
function showFinalResults() {
  letterElement.style.fontSize = "28px";
  letterElement.innerHTML = `
    👁 <b>Final Eye Report</b><br><br>
    Right Eye: ${rightEyeResult}<br>
    Left Eye: ${leftEyeResult}<br><br>
    <b>Recommendation:</b> If any result is below 6/6, consult an eye specialist.
  `;
  input.style.display = "none";
  downloadBtn.style.display = "block";
}

// ---------- PDF REPORT ----------
downloadBtn.addEventListener("click", () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const date = new Date().toLocaleDateString();

  doc.setFontSize(20); doc.text("VisionMeter Report", 20, 20);
  doc.setFontSize(12); doc.text(`Date: ${date}`, 20, 35);
  doc.setFontSize(14); doc.text("Results:", 20, 55);
  doc.setFontSize(12);
  doc.text(`Right Eye: ${rightEyeResult}`, 20, 70);
  doc.text(`Left Eye: ${leftEyeResult}`, 20, 85);
  doc.save("VisionMeter_Report.pdf");
});
