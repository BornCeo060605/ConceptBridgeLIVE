const GEMINI_API_KEY = "AIzaSyAuMox7iF5MymdG3cfc6xKiiNFFSepN-gI";
// ---- Fetch YouTube Transcript ----
async function getTranscriptText() {
  try {
    const videoId = new URLSearchParams(window.location.search).get("v");
    const response = await fetch(`https://yt.lemnoslife.com/videos?part=transcript&id=${videoId}`);
    const data = await response.json();

    if (data.items && data.items[0]?.transcript) {
      const transcript = data.items[0].transcript.map(t => t.text).join(" ");
      console.log("Transcript fetched successfully!");
      return transcript;
    } else {
      console.warn("No transcript found for this video.");
      return "No transcript available.";
    }
  } catch (error) {
    console.error("Error fetching transcript:", error);
    return "Transcript fetch failed.";
  }
}
// ---- Generate Quiz Using Gemini AI ----
async function generateQuizFromAI() {
  const transcript = await getTranscriptText();
  console.log("Transcript ready for Gemini quiz...");

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({hidhuhcujjyjgcdhihd
        contents: [
          {
            parts: [
              {
                text: `
                Create 5 short multiple-choice quiz questions in JSON format based on this transcript.
                Format: [{"q":"question","options":["opt1","opt2","opt3","opt4"],"correct":0}]
                Make questions simple and relevant for quick learning.
                Transcript: ${transcript}
                `
              }
            ]
          }
        ]
      })
    });

    const data = await res.json();
    let text = data.candidates?.[0]?.content?.parts?.[0]?.text || "[]";

    // Cleanup if AI returns markdown
    text = text.replace(/```json|```/g, "").trim();

    const questions = JSON.parse(text);
    console.log("AI Quiz Generated:", questions);
    showAIQuiz(questions);

  } catch (error) {
    console.error("Gemini quiz generation failed:", error);
    showAIQuiz([
      { q: "AI generation failed. Try again later!", options: ["Okay"], correct: 0 }
    ]);
  }
}

function startQuiz() {
  const video = document.querySelector('video');
  if (video) video.pause();

  setMotivationalOverlay("🔥 Quiz Time! Get ready to test your focus!");
  generateQuizFromAI();
}
// ---- Show Quiz UI ----
function showAIQuiz(questions) {
  const modal = document.createElement("div");
  modal.id = "cb-quiz";
  modal.style = `
    position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
    width: 420px; background: #ffffff; color: #222; padding: 20px;
    border-radius: 16px; box-shadow: 0 0 25px rgba(0,0,0,0.3);
    font-family: 'Poppins', sans-serif; text-align:center; z-index:99999;
    overflow-y:auto; max-height:80vh;
  `;

  modal.innerHTML = `<h3>🎯 ConceptBridge AI Quiz</h3><div id="quizArea"></div><button id="submitQuiz">Submit Answers</button>`;
  document.body.appendChild(modal);

  const quizArea = document.getElementById("quizArea");

  questions.forEach((q, i) => {
    const block = document.createElement("div");
    block.innerHTML = `
      <p><b>Q${i + 1}.</b> ${q.q}</p>
      ${q.options.map((opt, j) => `
        <label><input type="radio" name="q${i}" value="${j}"> ${opt}</label><br>
      `).join("")}
      <hr>
    `;
    quizArea.appendChild(block);
  });

  document.getElementById("submitQuiz").onclick = () => showAIQuizResults(questions);
}
function showAIQuizResults(questions) {
  let score = 0;
  questions.forEach((q, i) => {
    const selected = document.querySelector(`input[name="q${i}"]:checked`);
    if (selected && parseInt(selected.value) === q.correct) score++;
  });

  const modal = document.getElementById("cb-quiz");
  modal.innerHTML = `
    <h2>🏁 Quiz Complete!</h2>
    <p>Your Score: <b>${score}/${questions.length}</b></p>
    <p>${score >= 3 ? "🔥 Awesome! You're improving fast!" : "💪 Keep trying, progress takes practice!"}</p>
    <button id="retryBtn">Try New Quiz</button>
  `;

  document.getElementById("retryBtn").onclick = () => {
    modal.remove();
    generateQuizFromAI();
  };
}
function setMotivationalOverlay(message) {
  const overlay = document.createElement("div");
  overlay.innerHTML = `<div style="
    position: fixed; top: 10%; left: 50%; transform: translateX(-50%);
    background: linear-gradient(135deg, #6EE7B7, #3B82F6);
    color: white; padding: 15px 25px; border-radius: 20px;
    font-size: 18px; font-family: Poppins; z-index:99999;">
    ${message}
  </div>`;
  document.body.appendChild(overlay);
  setTimeout(() => overlay.remove(), 4000);
}

