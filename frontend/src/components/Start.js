import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Container, TextField, Button, Typography } from "@mui/material";

const Start = () => {
  const [instaName, setInstaName] = useState("");
  const [quizData, setQuizData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:3000/quiz")
      .then((res) => res.json())
      .then((data) => {
        setQuizData(data.sections);
      })
      .catch((err) => console.error("Error fetching quiz data:", err));
  }, []);

  const startQuiz = async () => {
    try {
      const response = await fetch("http://localhost:3000/start_quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ instaName }),
      });

      if (response.ok) {
        navigate("/quiz");
      } else {
        console.error("Failed to add Instagram name");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <Container
      maxWidth="sm"
      style={{
        textAlign: "center",
        backgroundColor: "#6a0dad",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
      }}
    >
      <img
        src="/logo.jpeg"
        alt="Logo"
        style={{ width: "150px", marginBottom: "20px", borderRadius: "10px" }}
      />
      <Typography variant="h4" gutterBottom>
        Welcome to the Quiz App!
      </Typography>
      <Typography variant="body1" gutterBottom>
        Enter your Instagram name and start the quiz.
      </Typography>
      <TextField
        variant="outlined"
        label="Instagram Name"
        value={instaName}
        onChange={(e) => setInstaName(e.target.value)}
        fullWidth
        style={{ backgroundColor: "white", borderRadius: "5px", margin: "10px 0" }}
      />
      <Button
        variant="contained"
        color="secondary"
        onClick={startQuiz}
      >
        Start Quiz
      </Button>
    </Container>
  );
};

export default Start;
