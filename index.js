const express = require("express");
const bodyParser = require("body-parser");
const chrono = require("chrono-node");
const { DateTime } = require("luxon");

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

  console.log("PHRASE REÇUE :", phrase);

  if (!phrase || typeof phrase !== "string") {
    return res.status(400).json({ error: "No phrase provided or invalid format" });
  }

  try {
    const parsedDate = chrono.parseDate(phrase, new Date(), { forwardDate: true });

    if (!parsedDate) {
      return res.status(400).json({ error: "Impossible d'interpréter la date. Reformulez SVP." });
    }

    // Convertit la date en fuseau horaire America/Montreal
    const start = DateTime.fromJSDate(parsedDate).setZone("America/Montreal");
    const end = start.plus({ hours: 1 });

    res.json({
      result: {
        starttime: start.toISO({ suppressMilliseconds: true }),
        endtime: end.toISO({ suppressMilliseconds: true })
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Serveur actif sur le port ${PORT}`);
});
