import React, { useState, useEffect } from "react";
import { Container, Typography, Button, Radio, RadioGroup, FormControlLabel, FormControl, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";

function Quiz() {
  const navigate = useNavigate();
  const [quizData, setQuizData] = useState(null);
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    fetch("http://localhost:3000/quiz")
      .then((res) => res.json())
      .then((data) => {
        setQuizData(data.sections);
        const initialAnswers = {};
        Object.keys(data.sections).forEach((section) => {
          initialAnswers[section] = new Array(data.sections[section].length).fill("a"); // Default all to "a"
        });
        setAnswers(initialAnswers);
      });
  }, []);

  const handleChange = (section, index, value) => {
    setAnswers((prev) => {
      const newAnswers = { ...prev };
      newAnswers[section][index] = value;
      return newAnswers;
    });
  };

  const handleSubmit = () => {
    navigate("/results", { state: { answers } }); // Navigate to results page with answers
  };

  return (
    <Container maxWidth="sm" style={{ marginTop: "20px" }}>
      <Paper style={{ padding: "20px", backgroundColor: "#FFF3E0" }}>
        <Typography variant="h4" align="center" gutterBottom>
          Quiz App
        </Typography>
        {quizData &&
          Object.keys(quizData).map((section) => (
            <div key={section} style={{ marginBottom: "20px" }}>
              <Typography variant="h5" align="left" gutterBottom>
                {section}
              </Typography>
              {quizData[section].map((question, index) => (
                <FormControl component="fieldset" key={index} style={{ marginBottom: "10px" }}>
                  <Typography variant="h6">{question}</Typography>
                  <RadioGroup
                    value={answers[section][index]}
                    onChange={(e) => handleChange(section, index, e.target.value)}
                  >
                    <FormControlLabel value="a" control={<Radio color="primary" />} label="A" />
                    <FormControlLabel value="b" control={<Radio color="secondary" />} label="B" />
                    <FormControlLabel value="c" control={<Radio color="primary" />} label="C" />
                  </RadioGroup>
                </FormControl>
              ))}
            </div>
          ))}
        <Button variant="contained" color="primary" onClick={handleSubmit} fullWidth>
          Submit
        </Button>
      </Paper>
    </Container>
  );
}

export default Quiz;
