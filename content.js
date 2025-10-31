// ConceptBridge LIVE – Auto 3-Minute Demo Mode
console.log("ConceptBridge LIVE content script loaded ✅");

// -----------------------------
// 🌟 UI CREATION
// -----------------------------
function initPomodoroUI() {
  if (document.getElementById("cbBoxInner")) return; // Avoid duplicates

  const box = document.createElement("div");
  box.id = "cbBox";
  box.innerHTML = `
    <div id="cbBoxInner">
      <div id="motivText">💪 Ready to Focus?</div>
      <div id="timerDisplay">03:00</div>
      <button id="startFocus">Start 25-Min Session</button>
      <button id="testFocus">🧪 Demo 3-Min Mode</button>
    </div>
  `;
  document.body.appendChild(box);
  setupButtonHandlers();
}

// -----------------------------
// ⏱️ VARIABLES
// -----------------------------
let focusDuration = 3 * 60; // default 3-minute demo
let timer = null;
let running = false;
let videoElement = null;
let adCheckInterval = null;

const motivationalQuotes = [
  "🚀 Stay focused — greatness is near!",
  "🌱 Every second you learn, you grow.",
  "🔥 Keep going — consistency wins!",
  "💡 Small steps = Big results."
];
let quoteIndex = 0;

const audio = new Audio(
  "https://cdn.pixabay.com/download/audio/2023/03/28/audio_37b3c8a1b8.mp3?filename=soft-focus-music-14074.mp3"
);
audio.volume = 0.15;
audio.loop = true;

// -----------------------------
// ⏱️ TIMER LOGIC
// -----------------------------
function startFocusTimer(customDuration = 3 * 60) {
  if (running) return;
  running = true;
  focusDuration = customDuration;
  document.getElementById("motivText").innerText = "🚀 Focus Mode: ON!";
  try { audio.play(); } catch (e) { console.log("Audio blocked by Chrome"); }

  timer = setInterval(() => {
    focusDuration--;
    const min = Math.floor(focusDuration / 60);
    const sec = focusDuration % 60;
    document.getElementById("timerDisplay").innerText =
      `${min}:${sec < 10 ? "0" + sec : sec}`;

    if (focusDuration % 60 === 0 && focusDuration > 0) {
      quoteIndex = (quoteIndex + 1) % motivationalQuotes.length;
      document.getElementById("motivText").innerText =
        motivationalQuotes[quoteIndex];
    }

    if (focusDuration <= 0) {
      clearInterval(timer);
      running = false;
      document.getElementById("motivText").innerText = "🎉 Session Complete!";
      document.getElementById("timerDisplay").innerText = "03:00";
      try { videoElement?.pause(); audio.pause(); } catch {}
      alert("Pomodoro complete! 🎯 Take a short break or start quiz!");
    }
  }, 1000);
}

function pauseFocusTimer(reason = "Paused") {
  if (running) {
    clearInterval(timer);
    running = false;
    try { audio.pause(); } catch {}
    document.getElementById("motivText").innerText = `⏸️ ${reason}`;
  }
}

// -----------------------------
// 🎬 VIDEO & AD DETECTION
// -----------------------------
function handleVideo(video) {
  videoElement = video;

  if (adCheckInterval) clearInterval(adCheckInterval);

  adCheckInterval = setInterval(() => {
    const adPlaying = !!document.querySelector(".ad-showing");
    if (adPlaying && running) pauseFocusTimer("Ad playing... relax!");
    else if (!adPlaying && !running && !video.paused && focusDuration < 180)
      startFocusTimer(3 * 60);
  }, 1000);

  video.addEventListener("play", () => {
    const isAd = document.querySelector(".ad-showing");
    if (!isAd && !running) {
      console.log("▶️ Auto Demo Mode Started (3 min)");
      startFocusTimer(3 * 60);
    } else if (isAd) console.log("🚫 Ad detected — waiting to start.");
  });

  video.addEventListener("pause", () => pauseFocusTimer("Video paused"));
}

// -----------------------------
// 🔍 AUTO-DETECT NEW VIDEOS
// -----------------------------
function observeForVideos() {
  const observer = new MutationObserver(() => {
    const vid = document.querySelector("video");
    if (vid && vid !== videoElement) handleVideo(vid);
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

// -----------------------------
// 🎯 BUTTON HANDLERS
// -----------------------------
function setupButtonHandlers() {
  const startBtn = document.getElementById("startFocus");
  const testBtn = document.getElementById("testFocus");

  if (startBtn)
    startBtn.addEventListener("click", () => {
      const vid = document.querySelector("video");
      if (!vid) return alert("Please play a video first!");
      videoElement = vid;
      startFocusTimer(25 * 60);
    });

  if (testBtn)
    testBtn.addEventListener("click", () => {
      const vid = document.querySelector("video");
      if (!vid) return alert("Please play a video first!");
      videoElement = vid;
      startFocusTimer(3 * 60);
    });
}

// -----------------------------
// 🚀 INIT
// -----------------------------
function initializeExtension() {
  initPomodoroUI();
  observeForVideos();
}

window.addEventListener("load", () => setTimeout(initializeExtension, 1500));
