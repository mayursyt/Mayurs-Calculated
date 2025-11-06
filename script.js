const display = document.getElementById('display');
const flirty = document.getElementById('flirty');
const historyPanel = document.getElementById('historyPanel');
const historyList = document.getElementById('historyList');
const notesOverlay = document.getElementById('notesOverlay');
const noteArea = document.getElementById('noteArea');

// --- Persistent data ---
let historyArr = JSON.parse(localStorage.getItem('calcHistory') || '[]');
let notes = JSON.parse(localStorage.getItem('calculatorNotes') || '[]');
let notesPIN = localStorage.getItem('notesPIN') || '';

// --- Lock notes if PIN set ---
function promptPIN(){
  if(!notesPIN) return true; 
  const entry = prompt("Enter Notes PIN 🔒");
  return entry === notesPIN;
}

function setPIN(){
  const newPin = prompt("Set or Change a 4-digit PIN for Notes 🔒");
  if(newPin && newPin.length===4) { notesPIN = newPin; localStorage.setItem('notesPIN', notesPIN); alert("PIN saved ✅"); }
}

// --- Calculator functions ---
window.press = function(n){ display.value += n; if(display.value.endsWith('0000')) openNotes(); }
window.clearDisplay = function(){ display.value = ''; }
window.backspace = function(){ display.value = display.value.slice(0,-1); }

window.calculate = function(){
  try{
    let expression = display.value;
    expression = expression.replace(/[^0-9+\-*/.]/g,'');
    if(!expression) return;
    const result = eval(expression);
    display.value = result;
    showFlirty();
    addHistory(expression, result);
  }catch(e){ display.value='Error'; console.error(e); }
}

window.toggleHistory = function(){ historyPanel.classList.toggle('show'); }

function showFlirty(){
  const lines = [
    "Baby you're smart 🤍", "Perfect like you 💕", "Your brain is shining 😘", "You calculate like a legend ✨",
    "Baby, you’re smarter than any formula 💖", "Your brain is my favorite equation 😘", "You + Me = Perfect 💕",
    "Baby, your calculations are 🔥", "Your smile adds more than numbers ✨"
  ];
  flirty.textContent = lines[Math.floor(Math.random()*lines.length)];
  flirty.style.opacity=1;
  setTimeout(()=>{flirty.style.opacity=0;},3500);
}

function addHistory(expression,result){
  historyArr.unshift({expression,result,timestamp:new Date().toLocaleString()});
  if(historyArr.length>20) historyArr.pop();
  localStorage.setItem('calcHistory', JSON.stringify(historyArr));
  renderHistory();
}

function renderHistory(){
  historyList.innerHTML = historyArr.map(e=>`<div class="history-entry"><div style="font-weight:600;">${e.expression} = ${e.result}</div><small style="opacity:0.8;">${e.timestamp}</small></div>`).join('');
}

// --- Notes ---
function openNotes(){ if(!promptPIN()) return; notesOverlay.classList.add('show'); renderNotes(); }
window.closeNotes = function(){ notesOverlay.classList.remove('show'); }

window.saveNote = function(){
  const text = noteArea.value.trim();
  if(!text) return;
  notes.unshift({text,timestamp:new Date().toLocaleString(), pinned:false});
  localStorage.setItem('calculatorNotes', JSON.stringify(notes));
  noteArea.value=''; renderNotes();
}

window.clearNotes = function(){ notes=[]; localStorage.setItem('calculatorNotes', JSON.stringify(notes)); renderNotes(); }

function deleteNote(i){ notes.splice(i,1); localStorage.setItem('calculatorNotes', JSON.stringify(notes)); renderNotes(); }

function pinNote(i){ notes[i].pinned = !notes[i].pinned; localStorage.setItem('calculatorNotes', JSON.stringify(notes)); renderNotes(); }

function pinAllNotes(){ notes.sort((a,b)=>b.pinned-a.pinned); renderNotes(); }

function renderNotes(){
  const list=document.getElementById('notesList');
  const sortedNotes = [...notes].sort((a,b)=>b.pinned-a.pinned);
  list.innerHTML = sortedNotes.map((n,i)=>`
    <div class="note-item">
      <div>${n.text}<br><small style="opacity:0.8;">${n.timestamp}</small></div>
      <div>
        <button class="pin-note" onclick="pinNote(${i})">${n.pinned?'📌':'📍'}</button>
        <button class="delete-note" onclick="deleteNote(${i})">×</button>
      </div>
    </div>
  `).join('');
}

// --- Voice Input (numbers only) ---
const micBtn = document.getElementById('micBtn');
if('webkitSpeechRecognition' in window || 'SpeechRecognition' in window){
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  recognition.lang='en-US'; recognition.interimResults=false; recognition.maxAlternatives=1;
  micBtn.addEventListener('click',()=>{ recognition.start(); micBtn.style.background='rgba(255,255,255,0.9)'; });
  recognition.onresult=(event)=>{
    const transcript=event.results[0][0].transcript;
    const filtered = transcript.replace(/[^0-9+\-*/.]/g,'');
    if(filtered) display.value+=filtered;
    micBtn.style.background='rgba(255,255,255,0.6)';
  }
  recognition.onerror=(event)=>{ console.error(event.error); micBtn.style.background='rgba(255,255,255,0.6)'; }
  recognition.onend=()=>{ micBtn.style.background='rgba(255,255,255,0.6)'; }
}else{ micBtn.disabled=true; micBtn.title="Voice input not supported"; }

renderHistory();
renderNotes();
