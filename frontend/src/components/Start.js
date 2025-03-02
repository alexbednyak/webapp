import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, TextField, Button, Typography } from "@mui/material";

const Start = () => {
  const [instaName, setInstaName] = useState("");
  const navigate = useNavigate();

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
        onClick={() => navigate("/quiz")}
      >
        Start Quiz
      </Button>
    </Container>
  );
};

export default Start;
