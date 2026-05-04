const filmsData = [
    {
        "title": "Army of the Dead",
        "description": "After a zombie outbreak in Las Vegas, a group of mercenaries takes the ultimate gamble by venturing into the quarantine zone for the greatest heist ever.",
        "release_year": 2021,
        "difficulty": "Facile/accessible",
        "points": 10
    },
    {
        "title": "Monster",
        "description": "A talented teen implicated in a robbery-turned-murder fights for his innocence and integrity against a criminal justice system that’s already judged him.",
        "release_year": 2021,
        "difficulty": "Difficile/expert",
        "points": 30
    },
    {
        "title": "Nobody Sleeps in the Woods Tonight",
        "description": "Addicted to technology, a group of teens attends a rehabilitation camp in the forest, but a sinister force there intends to take them offline forever.",
        "release_year": 2020,
        "difficulty": "Moyen/technique",
        "points": 20
    },
    {
        "title": "In the Tall Grass",
        "description": "After hearing a boy's cry for help, a pregnant woman and her brother wade into a vast field of grass, only to discover there may be no way out.",
        "release_year": 2019,
        "difficulty": "Difficile/expert",
        "points": 30
    },
    {
        "title": "Stranger Things",
        "description": "When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces and one strange little girl.",
        "release_year": 2019,
        "difficulty": "Évident/culte",
        "points": 5
    },
    {
        "title": "The Silence",
        "description": "With the world under attack by deadly creatures who hunt by sound, a teen and her family seek refuge outside the city and encounter a mysterious cult.",
        "release_year": 2019,
        "difficulty": "Moyen/technique",
        "points": 20
    },
    {
        "title": "Bird Box",
        "description": "Five years after an ominous unseen presence drives most of society to suicide, a survivor and her two children make a desperate bid to reach safety.",
        "release_year": 2018,
        "difficulty": "Évident/culte",
        "points": 5
    },
    {
        "title": "The Ritual",
        "description": "Four friends with a long-standing – but strained – connection take a hiking trip into the Swedish wilderness, from which they may never return.",
        "release_year": 2018,
        "difficulty": "Moyen/technique",
        "points": 20
    },
    {
        "title": "Scary Stories to Tell in the Dark",
        "description": "Un groupe d'adolescents doivent affronter leurs peurs afin de survivre.",
        "release_year": 2019,
        "difficulty": "Évident/culte",
        "points": 5
    },
    {
        "title": "Wednesday",
        "description": "Mercredi Addams tente de maîtriser ses capacités psychiques et de résoudre le mystère qui a impliqué ses parents.",
        "release_year": 2022,
        "difficulty": "Évident/culte",
        "points": 5
    },
    {
        "title": "Frankenstein",
        "description": "Victor Frankenstein donne vie à une créature lors d'une expérience interdite.",
        "release_year": 2025,
        "difficulty": "Évident/culte",
        "points": 5
    },
    {
        "title": "Troll",
        "description": "Une créature gigantesque se réveille après mille ans et détruit tout sur son passage vers Oslo.",
        "release_year": 2022,
        "difficulty": "Facile/accessible",
        "points": 10
    },
    {
        "title": "Under Paris",
        "description": "Une scientifique doit faire face à son passé pour sauver Paris d'un requin géant dans la Seine.",
        "release_year": 2024,
        "difficulty": "Facile/accessible",
        "points": 10
    },
    {
        "title": "Anaconda",
        "description": "Deux amis d'enfance voyagent au cœur de l'Amazonie pour tourner le remake de leur film préféré.",
        "release_year": 2025,
        "difficulty": "Facile/accessible",
        "points": 10
    },
    {
        "title": "The Meg",
        "description": "Jonas Taylor doit surmonter ses peurs pour secourir des personnes prisonnières d'un requin de 23 mètres de long.",
        "release_year": 2018,
        "difficulty": "Facile/accessible",
        "points": 10
    },
    {
        "title": "A Quiet Place",
        "description": "Une famille est forcée de vivre en silence pour se protéger de monstres à l'ouïe ultra-sensible.",
        "release_year": 2018,
        "difficulty": "Moyen/technique",
        "points": 20
    },
    {
        "title": "Day Shift",
        "description": "Un père utilise son travail de nettoyage de piscine comme façade pour chasser et tuer des vampires.",
        "release_year": 2022,
        "difficulty": "Moyen/technique",
        "points": 20
    },
    {
        "title": "No One Gets Out Alive",
        "description": "Une immigrante se retrouve prisonnière d'un cauchemar sans issue dans une pension.",
        "release_year": 2021,
        "difficulty": "Difficile/expert",
        "points": 30
    },
    {
        "title": "Viking Wolf",
        "description": "Thale, 17 ans, vient d'emménager dans une petite ville après que sa mère a trouvé un nouveau boulot dans la police locale.",
        "release_year": 2022,
        "difficulty": "Difficile/expert",
        "points": 30
    },
    {
        "title": "Sweet Home",
        "description": "Hyunsoo, un lycéen solitaire, emménage dans un ancien immeuble alors que des humains se transforment en monstres.",
        "release_year": 2020,
        "difficulty": "Difficile/expert",
        "points": 30
    }
];

// Logique de jeu
function getFilmById(id) {
    if (id >= 0 && id < filmsData.length) {
        return filmsData[id];
    }
    return null;
}

function checkAnswer(id, userInput) {
    const film = getFilmById(id);
    if (!film) return false;
    const trueTitle = film.title.toLowerCase().trim();
    const playerAttempt = userInput.toLowerCase().trim();
    return trueTitle === playerAttempt;
}