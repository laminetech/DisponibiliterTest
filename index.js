const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 5000;

// Secure token from environment variable
const SECURE_TOKEN = process.env.SECURE_TOKEN || "98bf8612dc1ac4fa3c9ee72d06b16949"; // Par sécurité, tu peux garder ça dans Render secrets

// Middleware
app.use(bodyParser.text({ type: "text/plain" }));

// Vérifie le token Authorization
const checkToken = (req, res, next) => {
  const token = req.headers.authorization;
  if (token === SECURE_TOKEN) {
    next();
  } else {
    res.status(401).json({ error: "Unauthorized" });
  }
};

// Endpoint /execute
app.post("/execute", checkToken, (req, res) => {
  const code = req.body;
  if (!code) {
    return res.status(400).json({ error: "No code provided" });
  }

  try {
    const result = eval(code);
    res.json({ result });
  } catch (error) {
    res.status(500).json({ error: error.message, trace: error.stack });
  }
});

// Démarrer le serveur sur le port dynamique
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
