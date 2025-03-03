const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors({ origin: "*" }));

const questionsFilePath = "questions.json";
const feedbackFilePath = "feedback.json";
const filePath = "instaNames.txt";
const resultsDirectory = "user_results"; // Directory to store user results
const activeSubmissions = new Set(); // Track active submissions
// Ensure the results directory exists
if (!fs.existsSync(resultsDirectory)) {
    fs.mkdirSync(resultsDirectory);
}

// Initialize results history
let resultsHistory = [];

// Load questions.json
const loadQuestions = () => {
    try {
        const data = fs.readFileSync(questionsFilePath, "utf8");
        return JSON.parse(data);
    } catch (err) {
        console.error("Error reading questions.json:", err);
        return { sections: [] };
    }
};

// Load feedback.json
const loadFeedback = () => {
    try {
        const data = fs.readFileSync(feedbackFilePath, "utf8");
        return JSON.parse(data).thresholds;
    } catch (err) {
        console.error("Error reading feedback.json:", err);
        return [];
    }
};

// Endpoint to get quiz data
app.get("/quiz", (req, res) => {
    const quizData = loadQuestions();
    res.json(quizData);
});

// Endpoint to submit quiz results
app.post("/submit", (req, res) => {
    const { instaName, answers } = req.body;

    if (!instaName) {
        return res.status(400).send("Instagram name is required.");
    }

    if (activeSubmissions.has(instaName)) {
        return res.status(429).json({ error: "Submission is already in progress. Please wait." });
    }

    activeSubmissions.add(instaName); // Mark submission as processing

    try {
        const quizData = loadQuestions();
        const feedbackData = loadFeedback();

        console.log("Received Answers:", JSON.stringify(answers, null, 2));

        let totalScore = 0;
        let totalQuestions = 0;

        quizData.sections.forEach((section) => {
            section.questions.forEach((question, qIndex) => {
                const userAnswers = answers[section.section_name] || [];
                const userAnswer = userAnswers[qIndex];

                if (userAnswer) {
                    const selectedAnswer = question.answers.find(a => a.answer === userAnswer);
                    if (selectedAnswer) {
                        totalScore += selectedAnswer.score;
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

        const results = { 
            instaName, 
            totalScore, 
            maxScore, 
            feedback: feedbackText, // ✅ Ensure feedback is returned
            answers 
        };

        resultsHistory.push(results);

        // Save user results to file
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const filename = `${timestamp}-${instaName}.txt`;
        const filePath = path.join(resultsDirectory, filename);

        fs.writeFileSync(filePath, JSON.stringify(results, null, 2));

        res.json(results);
    } catch (error) {
        console.error("Error processing submission:", error);
        res.status(500).json({ error: "Internal server error" });
    } finally {
        activeSubmissions.delete(instaName); // Remove from active submissions after processing
    }
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
        }
    });

    res.status(200).send('Instagram name added');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
