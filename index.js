const express = require("express");
const bodyParser = require("body-parser");
const chrono = require("chrono-node");

const app = express();
const PORT = process.env.PORT || 10000;

const SECURE_TOKEN = process.env.SECURE_TOKEN || "98bf8612dc1ac4fa3c9ee72d06b16949";

app.use(bodyParser.text({ type: "*/*" }));

const checkToken = (req, res, next) => {
  const token = req.headers.authorization;
  if (token === SECURE_TOKEN) {
    next();
  } else {
    res.status(401).json({ error: "Unauthorized" });
  }
};

app.post("/execute", checkToken, (req, res) => {
  const phrase = req.body;

  console.log("🟡 PHRASE REÇUE :", phrase);

  if (!phrase || typeof phrase !== "string") {
    return res.status(400).json({ error: "Aucune phrase reçue ou format invalide." });
  }

  try {
    // Nettoyage de la phrase pour éviter les erreurs de parsing
    const cleanedPhrase = phrase
      .toLowerCase()
      .replace(/\./g, "")                           // Supprimer les points
      .replace(/\s+à\s+/g, " ")                     // Enlever le "à"
      .replace(/(\d{1,2})h(\d{2})?/g, (_, h, m) => `${h}:${m || "00"}`); // Convertit 17h ou 17h30 → 17:00 ou 17:30

    const parsedDate = chrono.fr.parseDate(cleanedPhrase, new Date(), { forwardDate: true });

    if (!parsedDate) {
      return res.status(400).json({ error: "Impossible d'interpréter la date. Reformulez SVP." });
    }

    const startDate = new Date(parsedDate);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // +1h

    res.json({
      result: {
        starttime: startDate.toISOString().slice(0, 19),
        endtime: endDate.toISOString().slice(0, 19)
      }
    });
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur : " + error.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
