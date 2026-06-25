const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

// Autorise votre site web (Netlify) à interroger ce serveur
app.use(cors());
// Permet au serveur de lire les données au format JSON envoyées par le jeu
app.use(express.json());

// Simulation de la banque de mots (à lier plus tard à votre Sheets si besoin)
const pairs = [
  { id: 0, wordA: "Goku", wordB: "Saitama" },
  { id: 1, wordA: "Mario", wordB: "Sonic" },
  { id: 2, wordA: "Batman", wordB: "Iron Man" }
];

// Fonction pour mélanger un tableau
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Route secrète pour créer une partie
app.post("/creer-partie", (req, res) => {
  try {
    const { numPlayers, numUndercover, includeMrWhite, names } = req.body;

    // 1. Sélection d'une paire de mots aléatoire
    const randomPair = pairs[Math.floor(Math.random() * pairs.length)];
    const flip = Math.random() < 0.5;
    const wordPair = {
      civil: flip ? randomPair.wordA : randomPair.wordB,
      undercover: flip ? randomPair.wordB : randomPair.wordA,
    };

    // 2. Génération des rôles
    let roles = [];
    for (let i = 0; i < numUndercover; i++) roles.push("undercover");
    if (includeMrWhite) roles.push("mrwhite");
    while (roles.length < numPlayers) roles.push("civil");
    roles = shuffle(roles);

    // 3. Création des joueurs
    const finalPlayers = names.map((name, i) => ({
      id: i,
      name: name.trim() || `Joueur ${i + 1}`,
      role: roles[i],
      word: roles[i] === "civil" ? wordPair.civil : roles[i] === "undercover" ? wordPair.undercover : null,
      alive: true,
    }));

    // 4. On renvoie une version MASQUÉE des joueurs au navigateur (Pas de rôle, pas de mot !)
    // On garde la vraie liste secrète dans la réponse mais cryptée ou filtrée selon vos étapes futures.
    // Pour que le jeu fonctionne à l'étape suivante, on envoie les infos nécessaires de manière brute pour l'instant :
    res.json({
      success: true,
      players: finalPlayers,
      wordPair: wordPair // Temporaire pour ne pas bloquer l'affichage du gameover
    });
    
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Lancement du serveur
app.listen(PORT, () => {
  console.log(`Le serveur Undercover tourne sur le port ${PORT}`);
});
