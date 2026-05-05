import score from "./libraryScore.js";

const TMDB_API_KEY = "73e823d4f7cd625d37846e831c2360b2"; 
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

async function fetchPoster(title) {
  try {
    const resp = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(title)}`);
    const data = await resp.json();
    return data.results?.[0]?.poster_path ? `${IMAGE_BASE_URL}${data.results[0].poster_path}` : null;
  } catch (err) {
    return null;
  }
}

let state = null;
let currentFilm = null;
let triesLeft = 3;
let pointsForThis = 0;

function normalize(str) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .trim();
}

function init(scoreState) {
  state = scoreState;
}

function openQuiz(film, level, onClose) {
  currentFilm = film;
  triesLeft = 3;
  pointsForThis = film.points;

  // Vérifie si déjà joué
  const alreadyDone = state.completed.includes(film.id) || state.failed.includes(film.id);

  const overlay = document.createElement("div");
  overlay.id = "quiz-overlay";
  overlay.innerHTML = `
    <div class="quiz-panel">
      <div class="quiz-candle">🕯️</div>
      <h2 class="quiz-title">Reconnais-tu ce symbole ?</h2>
      <p class="quiz-hint-label">Quel film se cache derrière cet objet ?</p>

      ${alreadyDone ? `
        <div class="quiz-already">
          ${state.completed.includes(film.id)
            ? `<span class="quiz-success-msg">✅ Tu as déjà trouvé ce film !</span>`
            : `<span class="quiz-fail-msg">❌ Film raté : <strong>${film.title}</strong></span>`}
        </div>
        <button class="quiz-btn-close" id="quiz-close">Fermer</button>
      ` : `
        <div class="quiz-tries" id="quiz-tries">
          <span class="try ${triesLeft >= 1 ? 'active' : ''}">🕯️</span>
          <span class="try ${triesLeft >= 2 ? 'active' : ''}">🕯️</span>
          <span class="try ${triesLeft >= 3 ? 'active' : ''}">🕯️</span>
        </div>
        <div class="quiz-points" id="quiz-points">+${pointsForThis} pts possibles</div>
        <div class="quiz-input-wrap">
          <input
            type="text"
            id="quiz-input"
            class="quiz-input"
            placeholder="Tape le nom du film..."
            autocomplete="off"
            spellcheck="false"
          />
          <button class="quiz-btn-submit" id="quiz-submit">Valider</button>
        </div>
        <button class="quiz-btn-hint" id="quiz-hint">💡 Indice (-50 pts)</button>
        <div class="quiz-feedback" id="quiz-feedback"></div>
      `}
    </div>
  `;

  document.body.appendChild(overlay);

  if (!alreadyDone) {
    const input = document.getElementById("quiz-input");
    const submitBtn = document.getElementById("quiz-submit");
    const hintBtn = document.getElementById("quiz-hint");
    const feedback = document.getElementById("quiz-feedback");

    input.focus();

  // Dans libraryQuiz.js
  async function handleSubmit() { 
    const userAnswer = normalize(input.value);
    const isCorrect = film.answers.some(a => normalize(a) === userAnswer);
    if (isCorrect) {
      const urlAffiche = await fetchPoster(film.title); 
      
      let message = `Bravo ! +${film.points} points.`;
      
      if (urlAffiche) {
          message += `<br>[API EXTERNE] : Affiche trouvée sur TMDB !`;
      }
      
      feedback.innerHTML = `${message}<br><img src="${urlAffiche}" style="width:100px; margin-top:10px; border-radius:4px; border:1px solid #2a5a2a;">`;
      feedback.className = "quiz-feedback success";
      
      // N'oublie pas de marquer le film comme réussi dans le scoreState ici
    }
  }

    submitBtn.addEventListener("click", handleSubmit);
    input.addEventListener("keydown", (e) => { if (e.key === "Enter") handleSubmit(); });

    hintBtn.addEventListener("click", () => {
      pointsForThis = Math.max(0, pointsForThis - 50);
      document.getElementById("quiz-points").textContent = `+${pointsForThis} pts possibles`;
      feedback.textContent = `💡 ${film.hint}`;
      feedback.className = "quiz-feedback hint";
      hintBtn.disabled = true;
    });
  } else {
    document.getElementById("quiz-close").addEventListener("click", () => {
      closeQuiz(overlay, onClose, "skip");
    });
  }
}

function updateTries() {
  const tries = document.querySelectorAll("#quiz-tries .try");
  tries.forEach((el, i) => {
    el.className = "try" + (i < triesLeft ? " active" : " used");
  });
}

function closeQuiz(overlay, onClose, result) {
  overlay.classList.add("fade-out");
  setTimeout(() => {
    overlay.remove();
    if (onClose) onClose(result, state);
  }, 400);
}

export default { init, openQuiz };
