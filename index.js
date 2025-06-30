const express = require("express");
const bodyParser = require("body-parser");
const chrono = require("chrono-node");
const { DateTime } = require("luxon");

const app = express();
const PORT = process.env.PORT || 10000;
const SECURE_TOKEN = process.env.SECURE_TOKEN || "98bf8612dc1ac4fa3c9ee72d06b16949";

app.use(bodyParser.text({ type: "*/*" }));

// 🔐 Authentification
const checkToken = (req, res, next) => {
  const token = req.headers.authorization;
  if (token === SECURE_TOKEN) {
    next();
  } else {
    res.status(401).json({ error: "Unauthorized" });
  }
};

app.post("/execute", checkToken, (req, res) => {
  let phrase = req.body?.toLowerCase().trim();

  if (!phrase || typeof phrase !== "string") {
    return res.status(400).json({ error: "Aucune phrase valide reçue." });
  }

  // 🧹 Nettoyage intelligent
  phrase = phrase
    .replace(/(précises?|approximativement|environ|vers|autour de|entre\s.+)$/gi, "")
    .replace(/\s+/, " ")
    .replace(/\b1 juillet\b/, "1er juillet") // Corriger le 1 juillet vers 1er juillet
    .trim();

  // 🧠 Ajout automatique de "le" devant le jour si manquant
  const jours = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"];
  for (const jour of jours) {
    const regex = new RegExp(`^${jour}\\b`, "i");
    if (regex.test(phrase)) {
      phrase = "le " + phrase;
      break;
    }
  }

  try {
    const parsedDate = chrono.parseDate(phrase, new Date(), { forwardDate: true });

    if (!parsedDate) {
      return res.status(400).json({ error: "Impossible d'interpréter la date. Reformulez SVP." });
    }

    const start = DateTime.fromJSDate(parsedDate).setZone("America/Montreal");
    const end = start.plus({ hours: 1 });

    return res.json({
      result: {
        starttime: start.toISO({ suppressMilliseconds: true }),
        endtime: end.toISO({ suppressMilliseconds: true })
      }
    });
  } catch (err) {
    return res.status(500).json({ error: "Erreur interne : " + err.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Serveur lancé sur le port ${PORT}`);
});
