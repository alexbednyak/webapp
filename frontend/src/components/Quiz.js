import React, { useState, useEffect, useCallback } from "react";
import { Container, Typography, Button, Radio, RadioGroup, FormControlLabel, FormControl, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";

const Quiz = () => {
  const navigate = useNavigate();
  const [quizData, setQuizData] = useState([]);
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const instaName = localStorage.getItem("instaName") || "";

  useEffect(() => {
    const fetchQuizData = async () => {
      console.log("Fetching quiz data");
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/quiz`);
        const data = await res.json();
        console.log("Quiz data fetched", data);
        setQuizData(data.sections || []);
        const initialAnswers = data.sections.reduce((acc, section) => {
          acc[section.section_name] = section.questions.map(() => null);
          return acc;
        }, {});
        setAnswers(initialAnswers);
      } catch (error) {
        console.error("Error fetching quiz data:", error);
      }
    };

    fetchQuizData();
  }, []);

  const handleChange = (section, index, value) => {
    setAnswers((prev) => ({
      ...prev,
      [section]: prev[section].map((ans, i) => (i === index ? value : ans)),
    }));
  };

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    console.log("handleSubmit called");
    if (isSubmitting) return;
    setIsSubmitting(true);

    if (!instaName) {
      alert("Instagram name not found. Please restart the quiz.");
      navigate("/");
      setIsSubmitting(false);
      return;
    }

    const payload = { instaName, answers };
    console.log("Payload:", JSON.stringify(payload));

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const results = await response.json();
        navigate("/results", { state: { answers, results } });
      } else {
        console.error("Failed to submit quiz");
      }
    } catch (error) {
      console.error("Error submitting quiz:", error);
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, instaName, navigate, answers]);

  return (
    <Container maxWidth="md" style={{ marginTop: "40px" }}>
      <Paper style={{ padding: "30px", backgroundColor: "#f0f4f8" }}>
        <Typography variant="h3" align="center">Quiz App</Typography>

        {quizData.map((section) => (
          <div key={section.section_name} style={{ marginBottom: "30px" }}>
            <Typography variant="h4">{section.section_name}</Typography>
            {section.questions.map((question, index) => (
              <FormControl key={index} style={{ marginBottom: "20px" }}>
                <Typography variant="h6">{question.question}</Typography>
                <RadioGroup
                  value={answers[section.section_name]?.[index] || ""}
                  onChange={(e) => handleChange(section.section_name, index, e.target.value)}
                >
                  {question.answers.map((answer) => (
                    <FormControlLabel
                      key={answer.answer}
                      value={answer.answer}
                      control={<Radio />}
                      label={answer.answer}
                    />
                  ))}
                </RadioGroup>
              </FormControl>
            ))}
          </div>
        ))}

        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          fullWidth
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Submit"}
        </Button>
      </Paper>
    </Container>
  );
};

export default Quiz;