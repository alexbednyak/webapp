const express = require("express");
const cors = require("cors");
const fs = require("fs"); // Import the fs module
const path = require("path");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
const db = require('./database'); // Import the database module
const app = express();

const PORT = process.env.PORT || 3000;
const SEC_CODE = "##12&&&2$DI3_________dgUSwdhwh#!#3981&#!@#()!@"; // Add your secure code here

app.use(express.json());
app.use(cors({ origin: "*" }));

const questionsFilePath = path.join(__dirname, "questions.json");
const feedbackFilePath = path.join(__dirname, "feedback.json");
const activeSubmissions = new Set();
const botToken = process.env.BOT_TOKEN;
const chatId = process.env.CHAT_ID;

// Middleware to check X-Sec-Code header
const checkSecCode = (req, res, next) => {
  const secCode = req.headers["x-sec-code"];
  if (secCode !== SEC_CODE) {
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
};

// ✅ Endpoint to get questions.json
app.get("/questions.json", (req, res) => {
  res.sendFile(questionsFilePath);
});

// ✅ Endpoint to get feedback.json
app.get("/feedback.json", (req, res) => {
  res.sendFile(feedbackFilePath);
});

// ✅ Endpoint to save questions.json
app.post("/save/questions", checkSecCode, (req, res) => {
  fs.writeFile(
    questionsFilePath,
    JSON.stringify(req.body, null, 2),
    (err) => {
      if (err) {
        return res.status(500).json({ message: "Error saving questions.json" });
      }
      res.json({ message: "Questions saved successfully!" });
    }
  );
});

// ✅ Endpoint to save feedback.json
app.post("/save/feedback", checkSecCode, (req, res) => {
  fs.writeFile(
    feedbackFilePath,
    JSON.stringify(req.body, null, 2),
    (err) => {
      if (err) {
        return res.status(500).json({ message: "Error saving feedback.json" });
      }
      res.json({ message: "Feedback saved successfully!" });
    }
  );
});

// Load quiz questions
const loadQuestions = () => {
  try {
    return JSON.parse(fs.readFileSync(questionsFilePath, "utf8"));
  } catch (err) {
    console.error("Error reading questions.json:", err);
    return { sections: [] };
  }
};

// Endpoint to get quiz data
app.get("/quiz", (req, res) => {
  const quizData = loadQuestions();
  res.json(quizData);
});

// Load feedback
const loadFeedback = () => {
  try {
    return JSON.parse(fs.readFileSync(feedbackFilePath, "utf8")).thresholds;
  } catch (err) {
    console.error("Error reading feedback.json:", err);
    return [];
  }
};

// Send a message to Telegram
const sendMessage = async (message) => {
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  const payload = { chat_id: chatId, text: message };

  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    console.log("Message sent successfully");
  } catch (error) {
    console.error("Error sending message:", error);
  }
};

// ✅ Start quiz - logs only Instagram name & date with ID
app.post("/start_quiz", (req, res) => {
  const { instaName } = req.body;

  if (!instaName) {
    return res.status(400).send("Instagram name is required.");
  }

  const date = new Date().toISOString().split("T")[0];
  db.run(`INSERT INTO results (date, instagram) VALUES (?, ?)`, [date, instaName], function(err) {
    if (err) {
      return res.status(500).send("Error starting quiz.");
    }
    res.status(200).send("Quiz started successfully.");
  });
});

// ✅ Submit quiz - maps answers to questions dynamically using questions.json
app.post("/submit", async (req, res) => {
  const { instaName, answers } = req.body;

  if (!instaName) {
    return res.status(400).send("Instagram name is required.");
  }

  if (activeSubmissions.has(instaName)) {
    return res
      .status(429)
      .json({ error: "Submission is already in progress. Please wait." });
  }

  activeSubmissions.add(instaName);

  try {
    const quizData = loadQuestions();
    const feedbackData = loadFeedback();

    let totalScore = 0;
    let totalQuestions = 0;

    // Map answers to their questions
    const mappedResults = [];
    quizData.sections.forEach((section) => {
      section.questions.forEach((question, qIndex) => {
        const userAnswers = answers[section.section_name] || [];
        const userAnswerText = userAnswers[qIndex];

        if (userAnswerText) {
          const matchingAnswer = question.answers.find(
            (a) => a.answer === userAnswerText
          );
          if (matchingAnswer) {
            mappedResults.push({
              question: question.question,
              answer: matchingAnswer.answer,
            });
            totalScore += matchingAnswer.score;
          }
        }

        totalQuestions++;
      });
    });

    const maxScore = totalQuestions * 10;
    const scorePercentage = totalScore / maxScore;

    let feedbackText = "No feedback available";
    for (const fb of feedbackData) {
      if (scorePercentage >= fb.range[0] && scorePercentage <= fb.range[1]) {
        feedbackText = fb.text;
        break;
      }
    }

    const mappedAnswersString = JSON.stringify(mappedResults);

    db.run(`UPDATE results SET score = ?, nonNullAnswers = ? WHERE instagram = ? AND score IS NULL`, [totalScore, mappedAnswersString, instaName], function(err) {
      if (err) {
        return res.status(500).send("Error submitting quiz.");
      }
      if (this.changes === 0) {
        const date = new Date().toISOString().split("T")[0];
        db.run(`INSERT INTO results (date, instagram, score, nonNullAnswers) VALUES (?, ?, ?, ?)`, [date, instaName, totalScore, mappedAnswersString], function(err) {
          if (err) {
            return res.status(500).send("Error submitting quiz.");
          }
          res.json({
            instaName,
            totalScore,
            maxScore,
            feedback: feedbackText,
            mappedAnswers: mappedResults,
          });
        });
      } else {
        res.json({
          instaName,
          totalScore,
          maxScore,
          feedback: feedbackText,
          mappedAnswers: mappedResults,
        });
      }
    });

    // Send a Telegram notification
    const message = `New quiz submission:\nInstagram: ${instaName}\nScore: ${totalScore}/${maxScore}\nFeedback: ${feedbackText}`;
    await sendMessage(message);
  } catch (error) {
    console.error("Error processing submission:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    activeSubmissions.delete(instaName);
  }
});

// ✅ Endpoint to get results content
app.get("/results", checkSecCode, (req, res) => {
  db.all(`SELECT * FROM results`, [], (err, rows) => {
    if (err) {
      return res.status(500).send("Error fetching results.");
    }
    res.json(rows);
  });
});

// Start the server and listen on all interfaces
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});