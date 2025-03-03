import React, { useEffect, useState } from "react";
import { Container, Typography, Paper, Button } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [results, setResults] = useState(null);

  useEffect(() => {
    if (!location.state || !location.state.answers) {
      navigate("/");
      return;
    }

    setResults(location.state.results);
  }, [location, navigate]);

  return (
    <Container maxWidth="sm" style={{ marginTop: "20px" }}>
      <Paper style={{ padding: "20px", backgroundColor: "#E1BEE7" }}>
        <Typography variant="h4" align="center" gutterBottom>
          Results
        </Typography>
        {results ? (
          <>
            <Typography variant="h6" align="center">
              {results.feedback}
            </Typography>
            <Typography variant="body1" align="center">
              Your Score: {results.totalScore} / {results.maxScore}
            </Typography>
          </>
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
};

export default Results;
