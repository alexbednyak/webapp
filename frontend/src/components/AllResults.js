import React, { useState, useEffect } from "react";
import { Paper, Container, Typography, Table, TableBody, TableCell, TableHead, TableRow, Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const AllResults = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  // Backend API URL
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await fetch(`${API_URL}/results`, {
          headers: {
            "X-Sec-Code": "##12&&&2$DI3_________dgUSwdhwh#!#3981&#!@#()!@"
          }
        });
        const data = await response.json();
        setResults(data);
      } catch (error) {
        console.error("Error fetching results:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [API_URL]);

  if (loading) return <p>Loading...</p>;

  return (
    <Container>
      <Paper style={{ padding: "16px", marginBottom: "16px" }}>
        <Typography variant="h4">Quiz Results</Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Instagram Name</TableCell>
              <TableCell>Score</TableCell>
              <TableCell>Answers</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {results.map((result, index) => (
              <TableRow key={index}>
                <TableCell>{result.id}</TableCell>
                <TableCell>{result.date}</TableCell>
                <TableCell>{result.instagram}</TableCell>
                <TableCell>{result.score}</TableCell>
                <TableCell>
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography>View Answers</Typography>
                    </AccordionSummary>
                    <AccordionDetails style={{ backgroundColor: "white" }}>
                      {result.nonNullAnswers && JSON.parse(result.nonNullAnswers).map((qa, qaIndex) => (
                        <div key={qaIndex} style={{ marginBottom: "10px" }}>
                          <Typography variant="body1"><strong>Question:</strong> {qa.question}</Typography>
                          <Typography variant="body2"><strong>Answer:</strong> {qa.answer}</Typography>
                        </div>
                      ))}
                    </AccordionDetails>
                  </Accordion>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Container>
  );
};

export default AllResults;