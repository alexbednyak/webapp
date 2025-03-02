const express = require("express");
const cors = require("cors");
const app = express();

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const sections = {
  Section1: ["Question1", "Question2", "Question3"],
  Section2: ["Question1", "Question2", "Question3"],
  Section3: ["Question1", "Question2", "Question3"]
};

const scoring = { a: 10, b: 7, c: 3 };
const feedback = [
  { range: [23, 30], text: "Feedback A" },
  { range: [15, 22], text: "Feedback B" },
  { range: [0, 14], text: "Feedback C" }
];

// Store quiz results
let resultsHistory = [];

app.get("/quiz", (req, res) => {
  res.json({ sections, scoring, feedback });
});

app.post("/submit", (req, res) => {
  const answers = req.body;
  let results = {};

  for (const section in answers) {
    const totalScore = answers[section].reduce((sum, choice) => sum + (scoring[choice] || 0), 0);
    const feedbackText = feedback.find(({ range }) => totalScore >= range[0] && totalScore <= range[1]).text;
    results[section] = { score: totalScore, feedback: feedbackText };
  }

  // Save results history
  resultsHistory.push(results);

  res.json(results);
});

// NEW: Get previous quiz results
app.get("/results", (req, res) => {
  res.json(resultsHistory);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
