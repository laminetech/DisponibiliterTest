const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 10000;

const SECURE_TOKEN = process.env.SECURE_TOKEN || "98bf8612dc1ac4fa3c9ee72d06b16949";

app.use(bodyParser.text({ type: "*/*" })); // accepte tout type MIME

const checkToken = (req, res, next) => {
  const token = req.headers.authorization;
  if (token === SECURE_TOKEN) {
    next();
  } else {
    res.status(401).json({ error: "Unauthorized" });
  }
};

app.post("/execute", checkToken, (req, res) => {
  const code = req.body;

  console.log("CODE REÇU :", code); // pour debug dans Render

  if (!code || typeof code !== "string") {
    return res.status(400).json({ error: "No code provided or invalid format" });
  }

  try {
    const result = eval(code);
    res.json({ result });
  } catch (error) {
    res.status(500).json({ error: error.message, trace: error.stack });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
