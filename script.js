navigator.mediaDevices.getUserMedia({ audio: true }).catch(() => {});

// ----- Screen References -----
const welcomeScreen=document.getElementById("welcomeScreen");
const modeScreen=document.getElementById("modeScreen");
const guidelineScreen=document.getElementById("guidelineScreen");
const testScreen=document.getElementById("testScreen");
const colorTestScreen=document.getElementById("colorTestScreen");
const extraTestsScreen=document.getElementById("extraTestsScreen");
const astigmatismScreen=document.getElementById("astigmatismScreen");
const contrastScreen=document.getElementById("contrastScreen");
const visualFieldScreen=document.getElementById("visualFieldScreen");
const extraSummaryScreen=document.getElementById("extraSummaryScreen");

function hideAll(){
welcomeScreen.style.display="none";
modeScreen.style.display="none";
guidelineScreen.style.display="none";
testScreen.style.display="none";
colorTestScreen.style.display="none";
extraTestsScreen.style.display="none";
astigmatismScreen.style.display="none";
contrastScreen.style.display="none";
visualFieldScreen.style.display="none";
extraSummaryScreen.style.display="none";
}

function goToModeSelect(){ hideAll(); modeScreen.style.display="block"; }
function showGuidelines(){ hideAll(); guidelineScreen.style.display="block"; }
function startVisionTest(){ hideAll(); testScreen.style.display="block"; }
function showColorTest(){ hideAll(); colorTestScreen.style.display="block"; }
function showExtraTests(){ hideAll(); extraTestsScreen.style.display="block"; }

// ----- Vision Test (UNCHANGED LOGIC) -----
const letters=[..."ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"];
const letterSizes={1:90,2:72,3:58,4:46,5:36,6:26,7:18};
let level=1, correctCount=0, attemptsLeft=5;
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
level=1; correctCount=0; attemptsLeft=5;
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
if(val === letterElement.textContent){ correctCount++; } else { attemptsLeft--; }
if(correctCount >= 5){ level++; correctCount=0; attemptsLeft=5; }
if(attemptsLeft <= 0 || level > 7){ finishEyeTest(); return; }
showLetter();
}

function finishEyeTest(){
let result =
level <= 2 ? "Severely Reduced Vision" :
level == 3 ? "Weak Vision" :
level == 4 ? "Slightly Weak" :
level == 5 ? "Normal Vision (≈ 6/6)" :
level == 6 ? "Better Than Normal" :
             "Excellent Vision";

if(testing==="right"){
rightEyeResult=result;
testing="left";
instruction.textContent="Now cover RIGHT eye";
startEyeTest();
} else {
leftEyeResult=result;
showFinalReport();
}
}

function showFinalReport(){
letterElement.style.display="none";
input.style.display="none";
resultBox.style.display="block";
resultBox.innerHTML=
`<h2>Final Report</h2>
Right Eye: ${rightEyeResult}<br>
Left Eye: ${leftEyeResult}<br><br>
Recommendation: ${(rightEyeResult.includes("Normal") && leftEyeResult.includes("Normal")) ? "Your vision appears fine." : "Consult an ophthalmologist."}`;
downloadBtn.style.display="block";
}

downloadBtn.onclick=()=>{
const { jsPDF } = window.jspdf;
const doc = new jsPDF();
doc.text("VisionMeter Report",20,20);
doc.text(`Right Eye: ${rightEyeResult}`,20,50);
doc.text(`Left Eye: ${leftEyeResult}`,20,65);
doc.save("VisionMeter_Report.pdf");
};

// ----- Voice Recognition (unchanged) -----
const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
if(SR){
const rec=new SR(); rec.lang="en-US"; rec.continuous=true;
let listening=false;
voiceBtn.onclick=()=>{ listening=!listening; listening?rec.start():rec.stop(); voiceBtn.textContent=listening?"🎤 Listening...":"🎤 Speak Letter"; };
rec.onend=()=>listening&&rec.start();
rec.onresult=e=>{
let t=e.results[e.results.length-1][0].transcript.toUpperCase().trim();
const fix={"SEE":"C","DEE":"D","EE":"E","WHY":"Y","ZED":"Z"};
checkAnswer(fix[t]||t);
};
}

// ----- Color Vision Test (UNCHANGED LOGIC) -----
const colorGrid=document.getElementById("colorTestGrid");
const startColorBtn=document.getElementById("startColorBtn");
let round=1, score=0, wrong=0;
const R=(a,b)=>Math.floor(Math.random()*(b-a)+a);

startColorBtn.onclick=()=>{ round=1; score=0; wrong=0; startColorRound(); };

function startColorRound(){
colorGrid.innerHTML="";
let size=Math.min(3+Math.floor(round/2),6);
colorGrid.style.gridTemplateColumns=`repeat(${size},55px)`;
let r=R(50,200), g=R(50,200), b=R(50,200);
let base=`rgb(${r},${g},${b})`, diff=15-Math.floor(round/2), odd=`rgb(${r+diff},${g-diff},${b})`;
let total=size*size, oddIndex=Math.floor(Math.random()*total);

for(let i=0;i<total;i++){
let c=document.createElement("div");
c.className="bubble";
c.style.background=(i===oddIndex?odd:base);
c.onclick=()=>{
if(i===oddIndex){ score++; } else { wrong++; }
round++;
if(round>10){ finishColorTest(); return; }
startColorRound();
};
colorGrid.appendChild(c);
}
}

function finishColorTest(){
let result;
if(score >= 7 && wrong <= 2){
result="Normal Color Vision ✅";
} else if(score >= 4){
result="Mild Color Sensitivity 🟡";
} else {
result="Possible Color Blindness ⚠️";
}
colorGrid.innerHTML = `<p class="handwriting">${result}</p><p class="handwriting">Correct: ${score} | Incorrect: ${wrong}</p>`;
}

// ----- EXTRA TEST RESULT VARIABLES -----
let astigmatismResult = "Not Tested";
let contrastResult = "Not Tested";
let visualFieldResult = "Not Tested";

// ----- Extra Tests -----
function startAstigmatismTest(){ hideAll(); astigmatismScreen.style.display="block"; }
function startContrastTest(){ hideAll(); contrastScreen.style.display="block"; }
function startVisualFieldTest(){ hideAll(); visualFieldScreen.style.display="block"; startVisualDots(); }

function startVisualDots(){
const area=document.getElementById("vfArea");
area.innerHTML="";
function dot(){
let d=document.createElement("div");
d.style.width="12px"; d.style.height="12px"; d.style.borderRadius="50%";
d.style.background="red"; d.style.position="absolute";
d.style.top=(Math.random()*260)+"px"; d.style.left=(Math.random()*260)+"px";
d.onclick=()=>{ d.remove(); setTimeout(dot,600); };
area.appendChild(d);
}
dot();
}

function finishVisualField(){
visualFieldResult = "Completed";
showExtraTests();
}

// ----- Combined Summary -----
function showExtraTestSummary(){
hideAll();
extraSummaryScreen.style.display="block";

const overall =
(astigmatismResult.includes("Normal") &&
 contrastResult.includes("Normal") &&
 visualFieldResult.includes("Completed"))
? "Your visual functions appear generally normal ✅"
: "Some visual functions show signs of stress. Consider consulting an ophthalmologist ⚠️";

document.getElementById("extraSummaryText").innerHTML = `
🤓 Astigmatism Test: <b>${astigmatismResult}</b><br><br>
🐼 Contrast Sensitivity: <b>${contrastResult}</b><br><br>
🦊 Visual Field Response: <b>${visualFieldResult}</b><br><br>
<b>${overall}</b>
`;
}
