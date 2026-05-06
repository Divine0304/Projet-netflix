import libraryScore from "./libraryScore.js";

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

  const alreadyDone = state.completed.includes(film.id) || state.failed.includes(film.id);

  const overlay = document.createElement("div");
  overlay.id = "quiz-overlay";

overlay.innerHTML = `
  <div class="alchemist-panel">
    <div class="main-candle">
      <div class="flame-green"></div>
      <div class="candle-stick-black"></div>
    </div>

    <h2 class="ancient-title">Reconnais-tu ce symbole ?</h2>
    <p class="ancient-instruction">Quel film se cache derrière cet objet ?</p>

    ${alreadyDone ? `
      <div class="quiz-already">
        ${state.completed.includes(film.id)
          ? `<span class="quiz-success-msg">✅ Découvert !</span>`
          : `<span class="quiz-fail-msg">❌ C'était : <strong>${film.title}</strong></span>`}
      </div>
      <button class="iron-btn" id="quiz-close">FERMER</button>
    ` : `
      <div class="candle-row" id="quiz-tries">
        <div class="small-candle ${triesLeft >= 1 ? 'active' : ''}"></div>
        <div class="small-candle ${triesLeft >= 2 ? 'active' : ''}"></div>
        <div class="small-candle ${triesLeft >= 3 ? 'active' : ''}"></div>
        <div class="small-candle ${triesLeft >= 4 ? 'active' : ''}"></div>
      </div>
      <div class="ancient-points" id="quiz-points">+${pointsForThis} pts possibles</div>

      <div class="alchemy-input-wrap">
        <input
          type="text"
          id="quiz-input"
          class="parchment-input"
          placeholder="Tape le nom du film..."
          autocomplete="off"
        />
        <button class="iron-btn" id="quiz-submit">VALIDER</button>
      </div>
      
      <button class="brass-btn" id="quiz-hint">
        <i class="fa-solid fa-key"></i> Indice (-3 pts)
      </button>
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
  //
  async function handleSubmit() { 
    const userAnswer = normalize(input.value);
    const isCorrect = film.answers.some(a => normalize(a) === userAnswer);

    if (isCorrect) {
        // AJOUT : On marque le film comme réussi ET on ajoute le score
        libraryScore.markCompleted(state, film.id, film.level); 
        libraryScore.addScore(state, pointsForThis);

        const urlAffiche = await fetchPoster(film.title); 
        feedback.innerHTML = `Bravo ! +${pointsForThis} points.<br><img src="${urlAffiche}" style="width:100px; margin-top:10px; border-radius:4px;">`;
        feedback.className = "quiz-feedback success";

        setTimeout(() => closeQuiz(overlay, onClose, "success"), 2000);

    } else {

        triesLeft--;
        pointsForThis = Math.round(pointsForThis * 0.8);
        document.getElementById("quiz-points").textContent = `+${pointsForThis} pts possibles`;

        updateTries();

        if (triesLeft <= 0) {
            libraryScore.markFailed(state, film.id);
            feedback.innerHTML = `<span class="quiz-fail-msg">Échec ! C'était : <strong>${film.title}</strong></span>`;
            feedback.className = "quiz-feedback error";
            setTimeout(() => closeQuiz(overlay, onClose, "fail"), 2000);
        } else {
            feedback.textContent = "Mauvaise réponse... La flamme faiblit.";
            feedback.className = "quiz-feedback error";
            
            // AJOUT ICI : Vide le champ et remet le focus pour la tentative suivante
            input.value = ""; 
            input.focus();
        }
    }
}

    submitBtn.addEventListener("click", handleSubmit);
    input.addEventListener("keydown", (e) => { if (e.key === "Enter") handleSubmit(); });

    hintBtn.addEventListener("click", () => {
      pointsForThis = Math.max(0, pointsForThis - 2);
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
  const candles = document.querySelectorAll(".small-candle");
  candles.forEach((el, i) => {
    if (i < triesLeft) {
      el.classList.add("active");
    } else {
      el.classList.remove("active");
    }
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
