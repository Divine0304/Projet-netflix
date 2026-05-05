import { getFilmById, checkAnswer } from "./Data/films.js";
import firstScene from "./scenes/firstScene.js";
import secondScene from "./scenes/secondScene.js";
import animationScene from "./scenes/animation.js";
import controlsScene from "./scenes/controls.js";
import animationLookAt from "./scenes/animationLookAt.js";
import raycaster from "./scenes/raycaster.js";
import lights from "./scenes/lights.js";
import navigation from "./scenes/navigation.js";
import importObject from "./scenes/importObject.js";
import lightsAndTextures from "./scenes/lightsAndTextures.js";
import importModel from "./scenes/importModel.js";
import performance from "./scenes/performance.js";
import loading from "./scenes/loading.js";

const TMDB_API_KEY = "73e823d4f7cd625d37846e831c2360b2"; 
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500"

let score = 0;
let lives = 3;

async function recupererAffiche(titreFilm) {
    try {
        const response = await fetch(`${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(titreFilm)}`);
        const data = await response.json();
        if (data.results && data.results.length > 0) {
            return `${IMAGE_BASE_URL}${data.results[0].poster_path}`;
        }
    } catch (error) {
        console.error("Erreur API TMDB:", error);
    }
    return null;
}

/**
 * Logique de clic sur un monstre
 * @param {number} id - L'index du film dans filmsData
 */
window.auClicSurMonstre = async function(id) {
    const film = getFilmById(id);
    if (!film) return;

    
    let reponse = prompt(`INDICE : ${film.description}\n\nQuel est le nom original en anglais ?`);
    
    if (reponse === null) return; 

    if (checkAnswer(id, reponse)) {
        score += film.points;
        const urlAffiche = await recupererAffiche(film.title);

let message = `Bravo ! +${film.points} points.\nScore total : ${score}`;
if (urlAffiche) {
    message += `\n\n[API EXTERNE] : Affiche trouvée sur TMDB !`;
    console.log("Lien de l'image :", urlAffiche);
}
alert(message);
        
    } else {
        lives--;
        if (lives <= 0) {
            alert("GAME OVER ! Vous avez perdu toutes vos vies.");
            location.reload(); // Recommencer le jeu
        } else {
            alert(`Faux ! Il vous reste ${lives} vies.`);
        }
    }
};


/**
 * Keep only one scene call active at a time.
 * Imports alone do not run a scene: only the function call does.
 */
// --- Cours 1 scenes ---
// firstScene();
// secondScene();
// animationScene();
// controlsScene();
// animationLookAt();
// raycaster();
// lights();
// navigation();
// importObject();

// --- Cours 3 scenes ---
// lightsAndTextures();
// importModel();

// --- Cours 4 scenes ---
// performance();
// Active scene for this demo:
loading();
