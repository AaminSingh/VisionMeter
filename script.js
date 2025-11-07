// Screens
const welcomeScreen = document.getElementById("welcomeScreen");
const guidelineScreen = document.getElementById("guidelineScreen");
const testScreen = document.getElementById("testScreen");

function showGuidelines() {
  welcomeScreen.style.display = "none";
  guidelineScreen.style.display = "block";
}

function startTest() {
  guidelineScreen.style.display = "none";
  testScreen.style.display = "block";
}

// Letters + Numbers
const letters = [
  "A","B","C","D","E","F","G","H","I","J",
  "K","L","M","N","O","P","Q","R","S","T",
  "U","V","W","X","Y","Z",
  "0","1","2","3","4","5","6","7","8","9"
];

let level = 1, correctCount = 0, testing = "right";
let rightEyeResult = "", leftEyeResult = "";

const letterSizes = { 1:70, 2:55, 3:40, 4:28, 5:22, 6:18, 7:14 };

// Elements
const letterElement = document.getElementById("letter");
const input = document.getElementById("input");
const instruction = document.getElementById("instruction");
const startBtn = document.getElementById("startBtn");
const downloadBtn = document.getElementById("downloadBtn");
const voiceBtn = document.getElementById("voiceBtn");

// Sounds
const correctSound = new Audio("correct.mp3");
const wrongSound = new Audio("wrong.mp3");

// Start Test
startBtn.addEventListener("click", () => {
  startBtn.style.display = "none";
  letterElement.style.display = "block";
  input.style.display = "block";
  beginTest();
});

function beginTest() { level = 1; correctCount = 0; showLetter(); }

function showLetter() {
  letterElement.style.fontSize = letterSizes[level] + "px";
  letterElement.textContent = letters[Math.floor(Math.random() * letters.length)];
}

// ✅ Handle Answer
function handleAnswer(value) {
  if (value === letterElement.textContent) {
    correctSound.play();
    letterElement.classList.add("correct-anim");
    setTimeout(()=>letterElement.classList.remove("correct-anim"),300);
    correctCount++;
  } else {
    wrongSound.play();
    letterElement.classList.add("wrong-anim");
    setTimeout(()=>letterElement.classList.remove("wrong-anim"),350);
  }

  if (correctCount >= 3) { level++; correctCount = 0; if (level > 7) return finishEyeTest(); }
  showLetter();
}

// Typed Input
input.addEventListener("keydown", e => {
  if (e.key === "Enter") handleAnswer(input.value.toUpperCase().trim());
  input.value = "";
});

// ✅ Voice Recognition (Continuous)
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.lang = "en-US";
recognition.interimResults = false;
recognition.continuous = true;

let listening = false;
voiceBtn.addEventListener("click", () => {
  listening = !listening;
  listening ? recognition.start() : recognition.stop();
  voiceBtn.textContent = listening ? "🎤 Listening..." : "🎤 Speak Letter";
});
recognition.onend = () => listening && recognition.start();

recognition.onresult = (event) => {
  let spoken = event.results[event.results.length - 1][0].transcript.toUpperCase().trim();

  const map = {
    "SEE":"C","CEE":"C","DEE":"D","EE":"E","PEE":"P","TEE":"T","VEE":"V","WHY":"Y","ZEE":"Z","ZED":"Z",
    "ZERO":"0","ONE":"1","TWO":"2","TOO":"2","TO":"2","THREE":"3","FOUR":"4","FOR":"4","FIVE":"5","SIX":"6","SEVEN":"7","EIGHT":"8","ATE":"8","NINE":"9"
  };

  handleAnswer(map[spoken] || spoken);
};

// Eye Switching
function finishEyeTest() {
  const levelText = ["Weak (6/18-6/12)","Slightly Weak (6/9)","Normal (6/6)","Better (6/5)","Excellent (6/4)","High Clarity (6/3)"];
  let result = levelText[Math.min(level-1, levelText.length-1)];

  if (testing === "right") {
    rightEyeResult = result;
    instruction.innerHTML = "✅ Right Eye Done. Now cover your <b>RIGHT</b> eye.";
    testing = "left";
    beginTest();
  } else {
    leftEyeResult = result;
    showReport();
  }
}

// Show Final Report
function showReport() {
  letterElement.style.fontSize = "26px";
  letterElement.innerHTML = `👁 <b>Final Report</b><br><br>Right Eye: ${rightEyeResult}<br>Left Eye: ${leftEyeResult}`;
  input.style.display = "none";
  downloadBtn.style.display = "block";
}

// PDF
downloadBtn.addEventListener("click", () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.text("VisionMeter Report", 20, 20);
  doc.text(`Right Eye: ${rightEyeResult}`, 20, 50);
  doc.text(`Left Eye: ${leftEyeResult}`, 20, 65);
  doc.save("VisionMeter_Report.pdf");
});
