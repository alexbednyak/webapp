import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Start from "./components/Start";
import Quiz from "./components/Quiz";
import Results from "./components/Results";
import Builder from "./components/Builder";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Start />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/results" element={<Results />} />
        <Route path="/builder" element={<Builder />} />
      </Routes>
    </Router>
  );
};

export default App;
