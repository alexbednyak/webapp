const express = require("express");
const cors = require("cors");
const fs = require("fs");
const app = express();

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const questionsFilePath = "questions.json";
const feedbackFilePath = "feedback.json";
const filePath = "instaNames.txt";
let resultsHistory = [];

// Load questions.json
const loadQuestions = () => {
    try {
        const data = fs.readFileSync(questionsFilePath, "utf8");
        return JSON.parse(data);
    } catch (err) {
        console.error("Error reading questions.json:", err);
        return { sections: [] }; // Return an empty structure if the file fails to load
    }
};

// Load feedback.json
const loadFeedback = () => {
    try {
        const data = fs.readFileSync(feedbackFilePath, "utf8");
        return JSON.parse(data);
    } catch (err) {
        console.error("Error reading feedback.json:", err);
        return { feedback: [] }; // Return empty feedback if the file fails to load
    }
};

// Endpoint to get quiz data
app.get("/quiz", (req, res) => {
    const quizData = loadQuestions();
    res.json(quizData);
});

// Endpoint to submit quiz results
app.post("/submit", (req, res) => {
  const answers = req.body;
  const quizData = loadQuestions();
  const feedbackData = loadFeedback();

  console.log("Received Answers:", JSON.stringify(answers, null, 2));
  console.log("Quiz Data:", JSON.stringify(quizData, null, 2));
  console.log("Feedback Data:", JSON.stringify(feedbackData, null, 2));

  let results = {};

  quizData.sections.forEach((section) => {
      let totalScore = 0;

      section.questions.forEach((question, qIndex) => {
          const userAnswers = answers[section.section_name] || [];
          const userAnswer = userAnswers[qIndex];

          console.log(`Processing question ${qIndex} in section ${section.section_name}:`, userAnswer);

          if (userAnswer) {
              const selectedAnswer = question.answers.find(a => a.answer === userAnswer);

              console.log("Selected Answer:", selectedAnswer);

              if (selectedAnswer) {
                  totalScore += selectedAnswer.score;
              } else {
                  console.warn(`Answer '${userAnswer}' not found for question '${question.question}'. Available answers:`, question.answers.map(a => a.answer));
              }
          } else {
              console.warn(`No answer provided for question '${question.question}' in section '${section.section_name}'`);
          }
      });

      // Determine feedback based on total score
      let feedbackText = "No feedback available";
      if (Array.isArray(feedbackData)) {
          feedbackText = feedbackData.find(fb => totalScore >= fb.range[0] && totalScore <= fb.range[1])?.text || feedbackText;
      }

      console.log("Feedback Text:", feedbackText);

      results[section.section_name] = { score: totalScore, feedback: feedbackText };
  });

  // Save results history
  resultsHistory.push(results);

  res.json(results);
});









// Endpoint to get previous quiz results
app.get("/results", (req, res) => {
    res.json(resultsHistory);
});

// Endpoint to start quiz and save Instagram name
app.post("/start_quiz", (req, res) => {
    const instaName = req.body.instaName;

    if (!instaName) {
        return res.status(400).send("Instagram name is required.");
    }

    fs.appendFile(filePath, instaName + '\n', (err) => {
        if (err) {
            console.error('Error writing to file:', err);
            return res.status(500).send('Error writing to file');
        }
        res.status(200).send('Instagram name added');
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
