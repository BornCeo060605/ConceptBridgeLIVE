// content.js - ConceptBridge LIVE (Pomodoro Timer MVP)
// 1) Creates an overlay with Start / Pause / Reset
// 2) Auto-starts on video play (only once per fresh session)
// 3) Pauses video at session end and triggers startQuizModal() (placeholder)
// 4) Includes Demo Mode button for quick demo

console.log("ConceptBridge LIVE: content script loaded");

// ---- CONFIG ----
const POMODORO_SECONDS = 25 * 60; // change during dev to 60 for quick demo
const DEMO_SECONDS = 60; // if demo mode toggled

// ---- STATE ----
let focusSeconds = POMODORO_SECONDS;
let timerInterval = null;
let isRunning = false;
let sessionStartedByAuto = false; // to avoid auto-start loops

// ---- UI CREATION ----
function createOverlay() {
  if (document.getElementById("cb-overlay")) return; // don't create multiple times

  const overlay = document.createElement("div");
  overlay.id = "cb-overlay";
  overlay.innerHTML = `
    <h4 id="cb-title">Focus Mode: OFF</h4>
    <div id="cb-timer">${formatTime(focusSeconds)}</div>
    <div id="cb-controls">
      <button class="cb-btn" id="cb-start">Start</button>
      <button class="cb-btn" id="cb-pause">Pause</button>
      <button class="cb-btn" id="cb-reset">Reset</button>
      <button class="cb-btn" id="cb-demo">Demo</button>
    </div>
    <div id="cb-motivate" class="pulse">Stay focused — small consistent steps 🚀</div>
  `;
  document.body.appendChild(overlay);

  document.getElementById("cb-start").addEventListener("click", () => startFocusTimer(false));
  document.getElementById("cb-pause").addEventListener("click", pauseFocusTimer);
  document.getElementById("cb-reset").addEventListener("click", resetFocusTimer);
  document.getElementById("cb-demo").addEventListener("click", () => startFocusTimer(true));
}

// ---- UTILS ----
function formatTime(totalSec) {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s < 10 ? "0" + s : s}`;
}

function updateTimerDisplay() {
  const el = document.getElementById("cb-timer");
  if (el) el.textContent = formatTime(focusSeconds);
}

// ---- TIMER CONTROL ----
function startFocusTimer(isDemo = false) {
  if (isRunning) return;
  if (isDemo) focusSeconds = DEMO_SECONDS;
  else if (focusSeconds <= 0) focusSeconds = POMODORO_SECONDS;

  isRunning = true;
  document.getElementById("cb-title").innerText = "Focus Mode: ON 🚀";

  timerInterval = setInterval(() => {
    focusSeconds--;
    updateTimerDisplay();

    // motivational messages
    if (focusSeconds === 10 * 60) setMotivation("10 minutes left — keep it up! 🌟");
    if (focusSeconds === 5 * 60) setMotivation("5 minutes — you're almost there! 💪");

    if (focusSeconds <= 0) {
      clearInterval(timerInterval);
      isRunning = false;
      setMotivation("Session complete! Starting quiz...");
      // pause the YouTube video if present
      const vid = document.querySelector("video");
      if (vid) {
        try { vid.pause(); } catch (e) { console.warn("Could not pause video", e); }
      }
      // placeholder - real quiz starts here later
      startQuizModal();
    }
  }, 1000);
}

function pauseFocusTimer() {
  if (!isRunning) return;
  clearInterval(timerInterval);
  timerInterval = null;
  isRunning = false;
  setMotivation("Paused ⏸️");
}

function resetFocusTimer() {
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = null;
  isRunning = false;
  focusSeconds = POMODORO_SECONDS;
  updateTimerDisplay();
  document.getElementById("cb-title").innerText = "Focus Mode: OFF";
  setMotivation("Reset. Ready when you are ✨");
}

function setMotivation(text) {
  const el = document.getElementById("cb-motivate");
  if (el) el.innerText = text;
}

// ---- AUTO-START ON VIDEO PLAY ----
function attachAutoStart() {
  // YouTube loads dynamically, so we try to attach periodically until found
  const tryAttach = () => {
    const video = document.querySelector("video");
    if (!video) {
      // try again shortly
      setTimeout(tryAttach, 1200);
      return;
    }

    // listen for play event
    video.addEventListener("play", () => {
      // if user manually paused or started earlier, avoid auto-start
      if (!isRunning && focusSeconds === POMODORO_SECONDS) {
        sessionStartedByAuto = true;
        startFocusTimer(false);
      }
    });
  };
  tryAttach();
}

// ---- QUIZ PLACEHOLDER ----
function startQuizModal() {
  // replace this with the real quiz UI later.
  // For now show a simple modal with score placeholder and "Retry" button
  const existing = document.getElementById("cb-quiz");
  if (existing) existing.remove();

  const modal = document.createElement("div");
  modal.id = "cb-quiz";
  modal.style = `
    position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
    width: 420px; background: #fff; color: #111; padding: 18px;
    border-radius: 12px; box-shadow: 0 12px 32px rgba(0,0,0,0.3); z-index: 2147483647; font-family: Arial;`;

  modal.innerHTML = `
    <h3 style="margin:0 0 8px 0;">Quick Quiz</h3>
    <p style="margin:0 0 12px 0;">(Quiz UI will come here) — demo placeholder</p>
    <div style="display:flex;gap:8px;justify-content:flex-end;">
      <button id="cb-quiz-retry" style="padding:8px 10px;border-radius:8px;border:none;background:#3182CE;color:#fff;cursor:pointer;">Retry Focus</button>
      <button id="cb-quiz-close" style="padding:8px 10px;border-radius:8px;border:1px solid #ddd;background:#fff;cursor:pointer;">Close</button>
    </div>
  `;
  document.body.appendChild(modal);

  document.getElementById("cb-quiz-retry").addEventListener("click", () => {
    modal.remove();
    focusSeconds = POMODORO_SECONDS;
    updateTimerDisplay();
    startFocusTimer(false);
    document.querySelector("video")?.play();
  });
  document.getElementById("cb-quiz-close").addEventListener("click", () => modal.remove());
}

// ---- INIT ----
(function init() {
  createOverlay();
  updateTimerDisplay();
  attachAutoStart();

  // ensure overlay doesn't block important page events accidentally
  const overlay = document.getElementById("cb-overlay");
  overlay.style.pointerEvents = "auto";
})();
