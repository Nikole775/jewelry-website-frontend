import React, { useState } from 'react';
import axios from 'axios';

const BACKEND_URL = 'https://jewelry-website-backend-mt8c.onrender.com/api/auth';

function TwoFactorLoginForm({ onLoginSuccess }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [step, setStep] = useState(1);
    const [code, setCode] = useState('');

    const handleLogin = async () => {
        try {
            const res = await axios.post(`${BACKEND_URL}/login`, {
                email: username,
                password
            });
            alert("Verification code sent to your email.");
            setStep(2);
        } catch (error) {
            console.error(error);
            alert("Login failed. Please check your credentials.");
        }
    };

    const handleVerifyCode = async () => {
        try {
            const res = await axios.post(`${BACKEND_URL}/verify-code`, {
                username,
                code
            });
            localStorage.setItem('token', res.data.token); // optional
            localStorage.setItem('username', username);
            alert("Login successful!");
            onLoginSuccess();
        } catch (error) {
            console.error(error);
            alert("Invalid verification code.");
        }
    };

    return (
        <div style={{ padding: "2rem", maxWidth: "400px", margin: "auto" }}>
            {step === 1 ? (
                <>
                    <h2>Login</h2>
                    <input
                        type="text"
                        placeholder="Email"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        style={{ display: 'block', margin: '1rem 0', width: '100%' }}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        style={{ display: 'block', margin: '1rem 0', width: '100%' }}
                    />
                    <button onClick={handleLogin}>Send Code</button>
                </>
            ) : (
                <>
                    <h2>Enter Verification Code</h2>
                    <input
                        type="text"
                        placeholder="Enter code"
                        value={code}
                        onChange={e => setCode(e.target.value)}
                        style={{ display: 'block', margin: '1rem 0', width: '100%' }}
                    />
                    <button onClick={handleVerifyCode}>Verify</button>
                </>
            )}
        </div>
    );
}

export default TwoFactorLoginForm;
