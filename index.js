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

function nettoyerTexte(input) {
  return input
    .trim()
    .replace(/[.?!]+$/g, "")          // Supprime les ponctuations de fin
    .replace(/\s+/g, " ")             // Réduit les espaces multiples
    .normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // Supprime les accents
}

app.post("/execute", checkToken, (req, res) => {
  const phraseBrute = req.body;

  console.log("📥 PHRASE REÇUE :", phraseBrute);

  if (!phraseBrute || typeof phraseBrute !== "string") {
    return res.status(400).json({ error: "Aucune phrase reçue." });
  }

  const phraseNettoyee = nettoyerTexte(phraseBrute);
  console.log("🧹 PHRASE NETTOYÉE :", phraseNettoyee);

  try {
    const parsedDate = chrono.parseDate(phraseNettoyee, new Date(), { forwardDate: true });

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
    console.error("❌ ERREUR PARSING :", error);
    res.status(500).json({ error: "Erreur interne du serveur." });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
