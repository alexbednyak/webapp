import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Start from "./components/Start";
import Quiz from "./components/Quiz";
import Results from "./components/Results";
import Builder from "./components/Builder";
import Login from "./components/Login";

const App = () => {
  const [authenticated, setAuthenticated] = useState(false);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Start />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/results" element={<Results />} />
        <Route path="/builder" element={authenticated ? <Builder /> : <Login onLogin={setAuthenticated} />} />
      </Routes>
    </Router>
  );
};

export default App;