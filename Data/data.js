import filmsData from "./film.js";

const objectMapping = {
  "Stranger Things": "demogorgon",
  "Bird Box": "blindfold",
  "Wednesday": "hand",
  "Frankenstein": "monster",
  "Scary Stories to Tell in the Dark": "book",
  "Army of the Dead": "safe",  
  "Troll": "troll",
  "Under Paris": "fin",
  "Anaconda": "snake",
  "The Meg": "shark_tooth",
  "The Silence": "vesp",
  "Day Shift": "vampire",
  "The Ritual": "moder",
  "A Quiet Place": "silence",
  "Nobody Sleeps in the Woods Tonight": "twins",
  "In the Tall Grass": "grass",
  "Monster": "mask",
  "No One Gets Out Alive": "stonebox",
  "Viking Wolf": "bite",
  "Sweet Home": "vial"
};

const formattedFilms = { evident: [], facile: [], moyen: [], difficile: [] };

filmsData.forEach((f, index) => {
  const filmObj = {
    id: `film-${index}`,
    title: f.title,
    hint: f.description,
    answers: [f.title],
    points: f.points,
    object: objectMapping[f.title] || "book"
  };

  if (f.difficulty.includes("Évident")) formattedFilms.evident.push(filmObj);
  else if (f.difficulty.includes("Facile")) formattedFilms.facile.push(filmObj);
  else if (f.difficulty.includes("Moyen")) formattedFilms.moyen.push(filmObj);
  else if (f.difficulty.includes("Difficile")) formattedFilms.difficile.push(filmObj);
});

export default formattedFilms;