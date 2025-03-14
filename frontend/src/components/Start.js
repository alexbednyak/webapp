import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Container, TextField, Button, Typography } from "@mui/material";

const Start = () => {
  const [instaName, setInstaName] = useState("");
  const navigate = useNavigate();

  const startQuiz = async () => {
    if (!instaName.trim()) {
      alert("Please enter your Instagram name.");
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/start_quiz`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instaName }),
      });

      if (response.ok) {
        localStorage.setItem("instaName", instaName); // Save the name
        navigate("/quiz");
      } else {
        console.error("Failed to add Instagram name");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <Container maxWidth="sm" style={{ textAlign: "center", minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", backgroundColor: "#6a0dad", color: "white" }}>
      <img src="/logo.jpeg" alt="Logo" style={{ width: "150px", marginBottom: "20px", borderRadius: "10px" }} />
      <Typography variant="h4">Welcome to the Quiz App!</Typography>
      <Typography variant="body1">Enter your Instagram name and start the quiz.</Typography>
      <TextField variant="outlined" label="Instagram Name" value={instaName} onChange={(e) => setInstaName(e.target.value)} fullWidth style={{ backgroundColor: "white", borderRadius: "5px", margin: "10px 0" }} />
      <Button variant="contained" color="secondary" onClick={startQuiz}>Start Quiz</Button>
    </Container>
  );
};

export default Start;
