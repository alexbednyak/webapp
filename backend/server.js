const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors({ origin: "*" }));

const questionsFilePath = path.join(__dirname, "questions.json");
const feedbackFilePath = path.join(__dirname, "feedback.json");
const resultsFilePath = path.join(__dirname, "results.csv");
const activeSubmissions = new Set();
const botToken = "8058560672:AAGKDQ2Ia0Wu9h5VXz5kLtMjkbxW6EFj0lY";
const chatId = "523120392";

// Ensure CSV file exists with a header
if (!fs.existsSync(resultsFilePath)) {
  fs.writeFileSync(
    resultsFilePath,
    "Date,Instagram,Score,NonNullAnswers\n",
    "utf8"
  );
}

// ✅ Endpoint to get questions.json
app.get("/questions.json", (req, res) => {
  res.sendFile(questionsFilePath);
});

// ✅ Endpoint to get feedback.json
app.get("/feedback.json", (req, res) => {
  res.sendFile(feedbackFilePath);
});

// ✅ Endpoint to save questions.json
app.post("/save/questions", (req, res) => {
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
app.post("/save/feedback", (req, res) => {
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

// ✅ Start quiz - logs only Instagram name & date
app.post("/start_quiz", (req, res) => {
  const { instaName } = req.body;

  if (!instaName) {
    return res.status(400).send("Instagram name is required.");
  }

  // Append Instagram name with date to CSV (score left empty for now)
  const date = new Date().toISOString().split("T")[0];
  fs.appendFileSync(resultsFilePath, `${date},${instaName},\n`, "utf8");

  res.status(200).send("Quiz started successfully.");
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

    // Convert mapped results to JSON-like string for CSV
    const mappedAnswersString = JSON.stringify(mappedResults);

    // Update CSV file
    const fileContent = fs.readFileSync(resultsFilePath, "utf8").split("\n");
    const updatedContent = fileContent.map((line) => {
      const parts = line.split(",");
      if (parts[1] === instaName && parts[2] === "") {
        return `${parts[0]},${parts[1]},${totalScore},${mappedAnswersString}`;
      }
      return line;
    });

    fs.writeFileSync(resultsFilePath, updatedContent.join("\n"), "utf8");

    const results = {
      instaName,
      totalScore,
      maxScore,
      feedback: feedbackText,
      mappedAnswers: mappedResults,
    };

    res.json(results);

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

// Start the server and listen on all interfaces
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});