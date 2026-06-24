// Ce code reste caché sur votre serveur, personne ne peut le voir sur internet !
app.post("/creer-partie", async (req, res) => {
  const { numPlayers, numUndercover, includeMrWhite, names } = req.body;

  // 1. Le serveur choisit la paire de mots secrète (ex: Batman / Iron Man)
  const pair = pickDynamicWordPair(); 

  // 2. Le serveur mélange les rôles secrètement
  let roles = genererEtMelangerRoles(numPlayers, numUndercover, includeMrWhite);

  // 3. Le serveur crée la liste des joueurs avec leurs mots
  const listJoueurs = names.map((name, i) => ({
    id: i,
    name: name,
    role: roles[i],
    // Le serveur sait qui est quoi, mais il garde ça en mémoire chez lui !
    word: roles[i] === "civil" ? pair.civil : pair.undercover 
  }));

  // 4. IMPORTANT : On enregistre cette partie dans la mémoire du serveur avec un ID unique
  const idPartie = sauvegarderPartieDansServeur(listJoueurs, pair);

  // 5. On renvoie au créateur uniquement la liste des joueurs SANS les rôles ni les mots !
  res.json({
    idPartie: idPartie,
    players: listJoueurs.map(p => ({ id: p.id, name: p.name, alive: true })) // Les rôles et mots sont masqués !
  });
});