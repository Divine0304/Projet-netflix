import score from "./libraryScore.js";

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

    function handleSubmit() {
      const userAnswer = normalize(input.value);
      const isCorrect = film.answers.some(a => normalize(a) === userAnswer);

      if (isCorrect) {
        state = score.addScore(state, pointsForThis);
        state = score.markCompleted(state, film.id, level);
        feedback.textContent = "✅ Bravo ! C'est bien " + film.title;
        feedback.className = "quiz-feedback success";
        submitBtn.disabled = true;
        hintBtn.disabled = true;
        setTimeout(() => { closeQuiz(overlay, onClose, "success"); }, 1800);
      } else {
        triesLeft--;
        updateTries();
        pointsForThis = Math.max(0, pointsForThis - Math.floor(film.points * 0.2));
        document.getElementById("quiz-points").textContent = `+${pointsForThis} pts possibles`;

        if (triesLeft === 0) {
          state = score.markFailed(state, film.id);
          feedback.textContent = `❌ C'était : ${film.title}`;
          feedback.className = "quiz-feedback fail";
          submitBtn.disabled = true;
          hintBtn.disabled = true;
          setTimeout(() => { closeQuiz(overlay, onClose, "fail"); }, 2200);
        } else {
          feedback.textContent = `Mauvaise réponse... ${triesLeft} essai${triesLeft > 1 ? 's' : ''} restant${triesLeft > 1 ? 's' : ''}`;
          feedback.className = "quiz-feedback wrong";
          input.value = "";
          input.focus();
        }
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
