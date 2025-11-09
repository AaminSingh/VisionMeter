navigator.mediaDevices.getUserMedia({ audio: true }).catch(() => {});

const welcomeScreen=document.getElementById("welcomeScreen");
const modeScreen=document.getElementById("modeScreen");
const guidelineScreen=document.getElementById("guidelineScreen");
const testScreen=document.getElementById("testScreen");
const colorTestScreen=document.getElementById("colorTestScreen");

function applyFade(s){ s.classList.remove("fade-in"); void s.offsetWidth; s.classList.add("fade-in"); }
function goToModeSelect(){ welcomeScreen.style.display="none"; modeScreen.style.display="block"; applyFade(modeScreen);}
function showGuidelines(){ modeScreen.style.display="none"; guidelineScreen.style.display="block"; applyFade(guidelineScreen);}
function startVisionTest(){ guidelineScreen.style.display="none"; testScreen.style.display="block"; applyFade(testScreen);}
function showColorTest(){ modeScreen.style.display="none"; colorTestScreen.style.display="block"; applyFade(colorTestScreen); }

const letters=[..."ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"];
const letterSizes={1:90,2:72,3:58,4:46,5:36,6:26,7:18};

let level=1;
let correctCount=0;
let attemptsLeft=5;
let testing="right", rightEyeResult="", leftEyeResult="";

const letterElement=document.getElementById("letter");
const input=document.getElementById("input");
const instruction=document.getElementById("instruction");
const startBtn=document.getElementById("startBtn");
const voiceBtn=document.getElementById("voiceBtn");
const downloadBtn=document.getElementById("downloadBtn");
const resultBox=document.getElementById("resultBox");

startBtn.onclick=()=>{ startEyeTest(); };

function startEyeTest(){
  level=1;
  correctCount=0;
  attemptsLeft=5;
  showLetter();
}

function showLetter(){
  letterElement.style.display="block";
  input.style.display="block";
  letterElement.style.fontSize=letterSizes[level]+"px";
  letterElement.textContent = letters[Math.floor(Math.random()*letters.length)];
}

input.onkeydown=e=>{ if(e.key==="Enter"){ checkAnswer(input.value.toUpperCase().trim()); input.value=""; }};

function checkAnswer(val){
  if(val === letterElement.textContent){
    correctCount++;
  } else {
    attemptsLeft--;
  }

  // If 5 correct → go to next size
  if(correctCount >= 5){
    level++;
    correctCount = 0;
    attemptsLeft = 5;
  }

  // If user fails before reaching 5 correct → stop this eye immediately
  if(attemptsLeft <= 0){
    finishEyeTest(); 
    return;
  }

  // If reached smallest size → stop this eye
  if(level > 7){
    finishEyeTest();
    return;
  }

  showLetter();
}

function finishEyeTest(){

  let result =
    level <= 2 ? "Severely Reduced Vision (≈ 6/18 or below)" :
    level == 3 ? "Weak Vision (≈ 6/12)" :
    level == 4 ? "Slightly Weak (≈ 6/9)" :
    level == 5 ? "Normal Vision (≈ 6/6)" :
    level == 6 ? "Better Than Normal (≈ 6/5)" :
                 "Excellent Clarity (≈ 6/4)";

  if(testing==="right"){
    rightEyeResult = result;
    testing="left";
    instruction.textContent="Now cover RIGHT eye";
    startEyeTest();
  }
  else{
    leftEyeResult = result;
    showFinalReport();
  }
}

function showFinalReport(){
  letterElement.style.display="none";
  input.style.display="none";

  let recommendation = 
    (rightEyeResult.includes("Normal") && leftEyeResult.includes("Normal")) ?
    "Your vision appears generally normal." :
    "A difference or weakness is detected. Please consult an ophthalmologist.";

  resultBox.style.display="block";
  resultBox.innerHTML=`
    <h2>Final Vision Report 👁</h2>
    <p><b>Right Eye:</b> ${rightEyeResult}</p>
    <p><b>Left Eye:</b> ${leftEyeResult}</p>
    <br>
    <p><b>Recommendation:</b><br>${recommendation}</p>
  `;

  downloadBtn.style.display="block";
}

downloadBtn.onclick=()=>{
  const {jsPDF}=window.jspdf; const doc=new jsPDF();
  doc.text("VisionMeter Report",20,20);
  doc.text(`Right Eye: ${rightEyeResult}`,20,50);
  doc.text(`Left Eye: ${leftEyeResult}`,20,65);
  doc.save("VisionMeter_Report.pdf");
};

// --- Color Test stays same ---
