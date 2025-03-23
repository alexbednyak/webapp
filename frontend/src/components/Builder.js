import React, { useState, useEffect } from "react";
import { Button, Paper, Container, Typography, TextField, IconButton } from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';

const Builder = () => {
    const [questions, setQuestions] = useState([]);
    const [feedback, setFeedback] = useState([]);
    const [loading, setLoading] = useState(true);
    const [quizData, setQuizData] = useState(null);
    const [editing, setEditing] = useState({});
    const [questionsText, setQuestionsText] = useState("");
    const [feedbackText, setFeedbackText] = useState("");

    // Backend API URL
    const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

    // Function to validate JSON
    const isValidJson = (data) => {
        try {
            JSON.parse(data);
            return true;
        } catch (error) {
            return false;
        }
    };

    // Fetch JSON files from backend
    useEffect(() => {
        const fetchData = async () => {
            try {
                const questionsRes = await fetch(`${API_URL}/questions.json`);
                const feedbackRes = await fetch(`${API_URL}/feedback.json`);

                const questionsData = await questionsRes.json();
                const feedbackData = await feedbackRes.json();

                setQuestions(questionsData);
                setFeedback(feedbackData);
                setQuestionsText(JSON.stringify(questionsData, null, 2));
                setFeedbackText(JSON.stringify(feedbackData, null, 2));
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [API_URL]);

    // Save JSON data back to backend with security code
    const saveJsonData = async (fileType, data) => {
        if (!isValidJson(JSON.stringify(data))) {
            alert(`Invalid JSON format for ${fileType}. Please check your input.`);
            return;
        }

        try {
            const response = await fetch(`${API_URL}/save/${fileType}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Sec-Code": "##12&&&2$DI3_________dgUSwdhwh#!#3981&#!@#()!@" // Updated security code
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();
            if (fileType === "feedback") {
                alert(result.message);
            }
        } catch (error) {
            console.error("Error saving JSON data:", error);
            alert("Failed to save data.");
        }
    };

    // Handle Save for Questions
    const handleSaveQuestions = () => {
        if (isValidJson(questionsText)) {
            const updatedQuestions = JSON.parse(questionsText);
            setQuestions(updatedQuestions);
            saveJsonData("questions", updatedQuestions);
            setQuestionsText(JSON.stringify(updatedQuestions, null, 2)); // Update Questions JSON content in the UI
        } else {
            alert("Invalid JSON format for questions. Please check your input.");
        }
    };

    // Handle Save for Feedback
    const handleSaveFeedback = () => {
        if (isValidJson(feedbackText)) {
            const updatedFeedback = JSON.parse(feedbackText);
            setFeedback(updatedFeedback);
            saveJsonData("feedback", updatedFeedback);
        } else {
            alert("Invalid JSON format for feedback. Please check your input.");
        }
    };

    // Fetch quiz data for preview
    const handlePreviewQuiz = async () => {
        try {
            const res = await fetch(`${API_URL}/quiz`);
            const data = await res.json();
            setQuizData(data.sections || []);
        } catch (error) {
            console.error("Error fetching quiz data:", error);
        }
    };

    // Handle edit mode
    const handleEdit = (sectionIndex, questionIndex, field, value) => {
        setEditing((prev) => ({
            ...prev,
            [`${sectionIndex}-${questionIndex}-${field}`]: value,
        }));
    };

    // Save edited field with security code and refresh preview
    const handleSaveEdit = async (sectionIndex, questionIndex, field, answerIndex = null) => {
        const updatedQuestions = { ...questions };
        if (answerIndex !== null) {
            updatedQuestions.sections[sectionIndex].questions[questionIndex].answers[answerIndex].answer = editing[`${sectionIndex}-${questionIndex}-${answerIndex}-answer`];
        } else {
            updatedQuestions.sections[sectionIndex].questions[questionIndex][field] = editing[`${sectionIndex}-${questionIndex}-${field}`];
        }
        setQuestions(updatedQuestions);
        await saveJsonData("questions", updatedQuestions);
        setEditing((prev) => ({
            ...prev,
            [`${sectionIndex}-${questionIndex}-${field}`]: undefined,
            [`${sectionIndex}-${questionIndex}-${answerIndex}-answer`]: undefined,
        }));
        handlePreviewQuiz(); // Refresh the updated item
        setQuestionsText(JSON.stringify(updatedQuestions, null, 2)); // Update Questions JSON content in the UI
    };

    // Handle edit mode for section_name
    const handleEditSectionName = (sectionIndex, value) => {
        setEditing((prev) => ({
            ...prev,
            [`${sectionIndex}-section_name`]: value,
        }));
    };

    // Save edited section_name
    const handleSaveSectionName = async (sectionIndex) => {
        const updatedQuestions = { ...questions };
        updatedQuestions.sections[sectionIndex].section_name = editing[`${sectionIndex}-section_name`];
        setQuestions(updatedQuestions);
        await saveJsonData("questions", updatedQuestions);
        setEditing((prev) => ({
            ...prev,
            [`${sectionIndex}-section_name`]: undefined,
        }));
        handlePreviewQuiz(); // Refresh the updated item
        setQuestionsText(JSON.stringify(updatedQuestions, null, 2)); // Update Questions JSON content in the UI
    };

    if (loading) return <p>Loading...</p>;

    return (
        <Container>
            <Paper style={{ padding: "16px", marginBottom: "16px" }}>
                <h2>Builder Page</h2>

                <h3>Questions JSON</h3>
                <textarea
                    value={questionsText}
                    onChange={(e) => setQuestionsText(e.target.value)}
                    rows={10}
                    cols={50}
                    style={{ width: "100%", marginBottom: "16px" }}
                />
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSaveQuestions}
                    fullWidth
                    style={{ marginBottom: "16px" }}
                >
                    Save Questions
                </Button>

                <Button
                    variant="contained"
                    color="primary"
                    onClick={handlePreviewQuiz}
                    fullWidth
                    style={{ marginBottom: "16px" }}
                >
                    Preview Quiz
                </Button>
            </Paper>

            <Paper style={{ padding: "16px", marginBottom: "16px" }}>
                <h3>Feedback JSON</h3>
                <textarea
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
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

            {quizData && (
                <Paper style={{ padding: "16px", marginBottom: "16px" }}>
                    <Typography variant="h4">Quiz Preview</Typography>
                    {quizData.map((section, sectionIndex) => (
                        <div key={section.section_name} style={{ marginBottom: "30px" }}>
                            <Typography variant="h5">
                                {editing[`${sectionIndex}-section_name`] !== undefined ? (
                                    <TextField
                                        value={editing[`${sectionIndex}-section_name`]}
                                        onChange={(e) => handleEditSectionName(sectionIndex, e.target.value)}
                                        fullWidth
                                        style={{ backgroundColor: 'white' }} // Set background color to white
                                    />
                                ) : (
                                    section.section_name
                                )}
                                <IconButton onClick={() => handleEditSectionName(sectionIndex, section.section_name)}>
                                    <EditIcon />
                                </IconButton>
                                {editing[`${sectionIndex}-section_name`] !== undefined && (
                                    <IconButton onClick={() => handleSaveSectionName(sectionIndex)}>
                                        <SaveIcon />
                                    </IconButton>
                                )}
                            </Typography>
                            {section.questions.map((question, questionIndex) => (
                                <div key={questionIndex} style={{ marginBottom: "20px" }}>
                                    <Typography variant="h6">
                                        {editing[`${sectionIndex}-${questionIndex}-question`] !== undefined ? (
                                            <TextField
                                                value={editing[`${sectionIndex}-${questionIndex}-question`]}
                                                onChange={(e) => handleEdit(sectionIndex, questionIndex, 'question', e.target.value)}
                                                fullWidth
                                                style={{ backgroundColor: 'white' }} // Set background color to white
                                            />
                                        ) : (
                                            question.question
                                        )}
                                        <IconButton onClick={() => handleEdit(sectionIndex, questionIndex, 'question', question.question)}>
                                            <EditIcon />
                                        </IconButton>
                                        {editing[`${sectionIndex}-${questionIndex}-question`] !== undefined && (
                                            <IconButton onClick={() => handleSaveEdit(sectionIndex, questionIndex, 'question')}>
                                                <SaveIcon />
                                            </IconButton>
                                        )}
                                    </Typography>
                                    {question.answers.map((answer, answerIndex) => (
                                        <div key={answerIndex} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                                            {editing[`${sectionIndex}-${questionIndex}-${answerIndex}-answer`] !== undefined ? (
                                                <TextField
                                                    value={editing[`${sectionIndex}-${questionIndex}-${answerIndex}-answer`]}
                                                    onChange={(e) => handleEdit(sectionIndex, questionIndex, `${answerIndex}-answer`, e.target.value)}
                                                    fullWidth
                                                    style={{ backgroundColor: 'white' }} // Set background color to white
                                                />
                                            ) : (
                                                <Typography>{answer.answer}</Typography>
                                            )}
                                            <IconButton onClick={() => handleEdit(sectionIndex, questionIndex, `${answerIndex}-answer`, answer.answer)}>
                                                <EditIcon />
                                            </IconButton>
                                            {editing[`${sectionIndex}-${questionIndex}-${answerIndex}-answer`] !== undefined && (
                                                <IconButton onClick={() => handleSaveEdit(sectionIndex, questionIndex, 'answer', answerIndex)}>
                                                    <SaveIcon />
                                                </IconButton>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    ))}
                </Paper>
            )}
        </Container>
    );
};

export default Builder;
