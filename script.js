const letters = ["E", "F", "P", "T", "O", "Z", "L", "C", "A", "D"];

let level = 1;
let correctCount = 0;
let testing = "right"; 

let rightEyeResult = "";
let leftEyeResult = "";

// ✅ Added new level 7 → 24px
const letterSizes = {
  1: 120, // 6/18
  2: 90,  // 6/12
  3: 70,  // 6/9
  4: 50,  // 6/6 (normal)
  5: 40,  // 6/5 (better than normal)
  6: 32,  // 6/4 (excellent clarity)
  7: 24   // 6/3 (your requested level)
};

const letterElement = document.getElementById("letter");
const input = document.getElementById("input");
const instruction = document.getElementById("instruction");
const startBtn = document.getElementById("startBtn");
const downloadBtn = document.getElementById("downloadBtn");

// ✅ Sound Effects
const correctSound = new Audio("correct.mp3");
const wrongSound = new Audio("wrong.mp3");

startBtn.addEventListener("click", () => {
  startBtn.style.display = "none";
  letterElement.style.display = "block";
  input.style.display = "block";
  beginTest();
});

function beginTest() {
  level = 1;
  correctCount = 0;
  showLetter();
}

function showLetter() {
  letterElement.style.fontSize = letterSizes[level] + "px";
  letterElement.textContent = letters[Math.floor(Math.random() * letters.length)];
}

input.addEventListener("keydown", function(event) {
  if (event.key === "Enter") {
    const val = input.value.toUpperCase();
    input.value = "";

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

    if (correctCount >= 3) {
      level++;
      correctCount = 0;

      // ✅ Stop after Level 7 now
      if (level > 7) {
        finishEyeTest();
        return;
      }
    }

    showLetter();
  }
});

function finishEyeTest() {
  let result = "";

  if (level <= 2) result = "Weak Vision (≈ 6/18 - 6/12)";
  else if (level === 3) result = "Slightly Weak (≈ 6/9)";
  else if (level === 4) result = "Normal Vision (≈ 6/6)";
  else if (level === 5) result = "Better than Normal Vision (≈ 6/5)";
  else if (level === 6) result = "Excellent Vision (≈ 6/4)";
  else if (level >= 7) result = "High Visual Acuity (≈ 6/3)";

  if (testing === "right") {
    rightEyeResult = result;
    instruction.innerHTML = "✅ Right Eye Done.<br>Now cover your <b>RIGHT eye</b> to test LEFT eye.";
    testing = "left";
    beginTest();
  } else {
    leftEyeResult = result;
    showFinalResults();
  }
}

function showFinalResults() {
  letterElement.style.fontSize = "28px";
  letterElement.innerHTML = `
    👁 <b>Final Eye Report</b><br><br>
    Right Eye: ${rightEyeResult}<br>
    Left Eye: ${leftEyeResult}<br><br>
    <b>Recommendation:</b><br>
    If any result is weaker than 6/6, consider getting a full eye exam.
  `;
  input.style.display = "none";
  downloadBtn.style.display = "block";
}

// ✅ PDF Download Button
downloadBtn.addEventListener("click", () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const date = new Date().toLocaleDateString();

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(20);
  doc.text("Eye Vision Screening Report", 20, 20);

  doc.setFontSize(12);
  doc.text(`Date: ${date}`, 20, 35);

  doc.setFontSize(14);
  doc.text("Results:", 20, 55);

  doc.setFont("Helvetica", "normal");
  doc.text(`Right Eye: ${rightEyeResult}`, 20, 70);
  doc.text(`Left Eye: ${leftEyeResult}`, 20, 85);

  doc.setFont("Helvetica", "bold");
  doc.text("Recommendation:", 20, 110);

  doc.setFont("Helvetica", "normal");
  doc.text("If either eye is weaker than 6/6, a professional eye exam is recommended.", 20, 125, { maxWidth: 170 });

  doc.save("Eye_Vision_Report.pdf");
});
