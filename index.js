const express = require("express");
const bodyParser = require("body-parser");
const chrono = require("chrono-node");

const app = express();
const PORT = process.env.PORT || 10000;
const SECURE_TOKEN = process.env.SECURE_TOKEN || "98bf8612dc1ac4fa3c9ee72d06b16949";

app.use(bodyParser.text({ type: "*/*" }));

const isAmbiguous = (phrase) => {
  const ambigues = [
    "vers", "environ", "autour", "entre", "tôt", "tard", "peut-être", "plus ou moins",
    "ou", "si possible", "comme tu veux"
  ];
  return ambigues.some(mot => phrase.toLowerCase().includes(mot));
};

const checkToken = (req, res, next) => {
  const token = req.headers.authorization;
  if (token === SECURE_TOKEN) {
    next();
  } else {
    res.status(401).json({ error: "Unauthorized" });
  }
};

app.post("/execute", checkToken, (req, res) => {
  const phrase = req.body?.trim();

  if (!phrase || typeof phrase !== "string") {
    return res.status(400).json({ error: "Requête invalide" });
  }

  console.log("PHRASE :", phrase);

  // 🔴 Rejeter si la phrase contient des mots ambigus
  if (isAmbiguous(phrase)) {
    return res.status(400).json({ error: "Formulation trop vague. Merci d'indiquer une date + heure précise comme : 'Demain à 15h'." });
  }

  const results = chrono.parse(phrase, new Date(), { forwardDate: true });

  if (!results.length || !results[0].start) {
    return res.status(400).json({ error: "Impossible d'interpréter la date. Reformulez SVP." });
  }

  const start = results[0].start;

  // 🔴 Rejeter si l’heure n’est pas certaine
  if (!start.isCertain("hour") || !start.isCertain("minute")) {
    return res.status(400).json({ error: "Merci de préciser l'heure exacte, ex : 'demain à 15h00'" });
  }

  // 🔴 Rejeter si une plage est détectée ("entre 14h et 16h")
  if (results[0].end) {
    return res.status(400).json({ error: "Merci d’indiquer un seul créneau, ex : 'lundi à 10h'" });
  }

  const startDate = start.date();
  const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // créneau de 1h

  res.json({
    result: {
      starttime: startDate.toISOString().slice(0, 19),
      endtime: endDate.toISOString().slice(0, 19)
    }
  });
});

app.listen(PORT, () => {
  console.log(`✅ Serveur sécurisé démarré sur le port ${PORT}`);
});
