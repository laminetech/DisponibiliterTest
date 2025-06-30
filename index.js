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

  console.log("PHRASE REÇUE :", phrase);

  if (!phrase || typeof phrase !== "string") {
    return res.status(400).json({ error: "No phrase provided or invalid format" });
  }

  try {
    const parsedDate = chrono.parseDate(phrase, new Date(), { forwardDate: true });

    if (!parsedDate) {
      return res.status(400).json({ error: "Unable to parse date" });
    }

    const startDate = new Date(parsedDate);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // +1h

    // ✅ Attention ici : on renvoie un vrai objet JSON imbriqué (PAS une string)
    res.json({
      result: {
        starttime: startDate.toISOString().slice(0, 19),
        endtime: endDate.toISOString().slice(0, 19)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
