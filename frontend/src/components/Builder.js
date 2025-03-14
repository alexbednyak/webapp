import React, { useState, useEffect } from "react";
import { Button, Paper, Container } from "@mui/material";

const Builder = () => {
    const [questions, setQuestions] = useState([]);
    const [feedback, setFeedback] = useState([]);
    const [loading, setLoading] = useState(true);

    // Backend API URL
    const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

    // ✅ Fetch JSON files from backend
    useEffect(() => {
        const fetchData = async () => {
            try {
                const questionsRes = await fetch(`${API_URL}/questions.json`);
                const feedbackRes = await fetch(`${API_URL}/feedback.json`);

                const questionsData = await questionsRes.json();
                const feedbackData = await feedbackRes.json();

                setQuestions(questionsData);
                setFeedback(feedbackData);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // ✅ Save JSON data back to backend
    const saveJsonData = async (fileType, data) => {
        try {
            const response = await fetch(`${API_URL}/save/${fileType}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const result = await response.json();
            alert(result.message);
        } catch (error) {
            console.error("Error saving JSON data:", error);
            alert("Failed to save data.");
        }
    };

    // ✅ Handle Save for Questions
    const handleSaveQuestions = () => {
        saveJsonData("questions", questions);
    };

    // ✅ Handle Save for Feedback
    const handleSaveFeedback = () => {
        saveJsonData("feedback", feedback);
    };

    if (loading) return <p>Loading...</p>;

    return (
        <Container>
            <Paper style={{ padding: "16px", marginBottom: "16px" }}>
                <h2>Builder Page</h2>

                <h3>Questions JSON</h3>
                <textarea
                    value={JSON.stringify(questions, null, 2)}
                    onChange={(e) => setQuestions(JSON.parse(e.target.value))}
                    rows={10}
                    cols={50}
                    style={{ width: "100%", marginBottom: "16px" }}
                />
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSaveQuestions}
                    fullWidth
                >
                    Save Questions
                </Button>
            </Paper>

            <Paper style={{ padding: "16px", marginBottom: "16px" }}>
                <h3>Feedback JSON</h3>
                <textarea
                    value={JSON.stringify(feedback, null, 2)}
                    onChange={(e) => setFeedback(JSON.parse(e.target.value))}
                    rows={10}
                    cols={50}
                    style={{ width: "100%", marginBottom: "16px" }}
                />
                <Button
                    variant="contained"
                    color="secondary"
                    onClick={handleSaveFeedback}
                    fullWidth
                >
                    Save Feedback
                </Button>
            </Paper>
        </Container>
    );
};

export default Builder;