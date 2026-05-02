const STORAGE_KEY = "monster_library_score";

const defaultState = {
  score: 0,
  completed: [],   
  failed: [],    
  unlocked: ["evident"],
};

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...defaultState, ...JSON.parse(raw) } : { ...defaultState };
  } catch {
    return { ...defaultState };
  }
}

function save(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function reset() {
  localStorage.removeItem(STORAGE_KEY);
  return { ...defaultState };
}

function addScore(state, points) {
  state.score += points;
  save(state);
  return state;
}

function markCompleted(state, id, level) {
  if (!state.completed.includes(id)) {
    state.completed.push(id);
  }
  const levelOrder = ["evident", "facile", "moyen", "difficile"];
  const nextLevel = levelOrder[levelOrder.indexOf(level) + 1];
  if (nextLevel && !state.unlocked.includes(nextLevel)) {

    state.unlocked.push(nextLevel);
  }
  save(state);
  return state;
}

function markFailed(state, id) {
  if (!state.failed.includes(id)) {
    state.failed.push(id);
  }
  save(state);
  return state;
}

export default { load, save, reset, addScore, markCompleted, markFailed };
