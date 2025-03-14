import React, { useState } from "react";

const Login = ({ onLogin }) => {
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [attempts, setAttempts] = useState(0);

    const correctPassword = process.env.REACT_APP_PASSWORD;
    const maxAttempts = 3;

    const handleLogin = () => {
        if (attempts >= maxAttempts) {
            setError("Maximum login attempts exceeded. Please try again later.");
            return;
        }

        if (password === correctPassword) {
            onLogin(true);
        } else {
            setError("Incorrect password. Please try again.");
            setAttempts(attempts + 1);
        }
    };

    return (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
            <h2>Protected</h2>
            <input
                type="password"
                placeholder="Enter Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ padding: "8px", width: "200px", marginBottom: "10px" }}
                disabled={attempts >= maxAttempts}
            />
            <br />
            <button
                onClick={handleLogin}
                style={{ padding: "10px 20px" }}
                disabled={attempts >= maxAttempts}
            >
                Login
            </button>
            {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
    );
};

export default Login;