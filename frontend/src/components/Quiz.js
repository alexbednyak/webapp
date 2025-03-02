import React, { useState, useEffect } from "react";
import { Container, Typography, Button, Radio, RadioGroup, FormControlLabel, FormControl, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";

function Quiz() {
  const navigate = useNavigate();
  const [quizData, setQuizData] = useState([]);
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    fetch("http://localhost:3000/quiz")
      .then((res) => res.json())
      .then((data) => {
        setQuizData(data.sections || []); // Ensure we store sections as an array
        const initialAnswers = {};

        data.sections.forEach((section) => {
          initialAnswers[section.section_name] = section.questions.map(() => null); // Initialize with null values
        });

        setAnswers(initialAnswers);
      });
  }, []);

  const handleChange = (section, index, value) => {
    setAnswers((prev) => ({
      ...prev,
      [section]: prev[section].map((ans, i) => (i === index ? value : ans)), // Update answer at the correct index
    }));
  };

  const handleSubmit = () => {
    navigate("/results", { state: { answers } }); // Navigate to results page with answers
  };

  return (
    <Container maxWidth="md" style={{ marginTop: "40px" }}>
      <Paper style={{ padding: "30px", backgroundColor: "#f0f4f8" }}>
        <Typography variant="h3" align="center" gutterBottom>
          Quiz App
        </Typography>

        {quizData.map((section) => (
          <div key={section.section_name} style={{ marginBottom: "30px" }}>
            <Typography variant="h4" align="left" gutterBottom>
              {section.section_name}
            </Typography>

            {section.questions.map((question, index) => (
              <FormControl component="fieldset" key={index} style={{ marginBottom: "20px" }}>
                <Typography variant="h6" style={{ fontWeight: "bold", marginBottom: "10px" }}>
                  {question.question}
                </Typography>

                <RadioGroup
                  value={answers[section.section_name]?.[index] || ""}
                  onChange={(e) => handleChange(section.section_name, index, e.target.value)}
                  style={{ display: "flex", flexDirection: "column" }} // Ensure options are in column format
                >
                  {question.answers.map((answer) => (
                    <FormControlLabel
                      key={answer.answer}
                      value={answer.answer}
                      control={<Radio color="primary" />}
                      label={answer.answer}
                    />
                  ))}
                </RadioGroup>
              </FormControl>
            ))}
          </div>
        ))}

        <Button variant="contained" color="primary" onClick={handleSubmit} fullWidth style={{ padding: "15px 0" }}>
          Submit
        </Button>
      </Paper>
    </Container>
  );
}

export default Quiz;
