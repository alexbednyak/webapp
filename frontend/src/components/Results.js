import React, { useEffect, useState } from "react";
import { Container, Typography, Paper, Button } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";

function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  const [results, setResults] = useState(null);

  useEffect(() => {
    if (!location.state || !location.state.answers) {
      navigate("/");
      return;
    }

    fetch("http://localhost:3000/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(location.state.answers),
    })
      .then((res) => res.json())
      .then((data) => setResults(data));
  }, [location, navigate]);

  return (
    <Container maxWidth="sm" style={{ marginTop: "20px" }}>
      <Paper style={{ padding: "20px", backgroundColor: "#E1BEE7" }}>
        <Typography variant="h4" align="center" gutterBottom>
          Results
        </Typography>
        {results ? (
          Object.keys(results).map((section) => (
            <Typography key={section} variant="body1">
              {section}: {results[section].feedback} (Score: {results[section].score})
            </Typography>
          ))
        ) : (
          <Typography variant="h6" align="center">
            Loading results...
          </Typography>
        )}
        <Button variant="contained" color="primary" onClick={() => navigate("/")} fullWidth>
          Take Quiz Again
        </Button>
      </Paper>
    </Container>
  );
}

export default Results;
