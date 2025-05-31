import React, { useState } from 'react';
import axios from 'axios';

const BACKEND_URL = 'https://jewelry-website-backend-mt8c.onrender.com/api/auth';

function TwoFactorLoginForm({ onLoginSuccess }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [step, setStep] = useState(1);
    const [cod, setCod] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async () => {
    try {
        const res = await axios.post(`${BACKEND_URL}/login`, {
            email: username,
            password
        });

        if (res.data.success) {
            // Store email for verification step
            localStorage.setItem('pendingVerificationEmail', username);
            alert("Verification code sent to your email.");
            setStep(2); // Transition to code verification
        } else {
            alert(res.data.error || "Login failed");
        }
    } catch (error) {
        console.error('Login error:', error.response?.data);
        alert(error.response?.data?.error || "Login failed");
    }
};

    const handleVerifyCode = async () => {
        setIsLoading(true);
        try {
            const res = await axios.post(`${BACKEND_URL}/verify-code`, {
                email,
                cod
            });
            localStorage.setItem('token', res.data.token); // optional
            localStorage.setItem('email', email);
            alert("Login successful!");
            onLoginSuccess();
        } catch (error) {
            console.error('Verification error:', error.response?.data);
            alert(error.response?.data?.error || "Invalid verification code.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ padding: "2rem", maxWidth: "400px", margin: "auto" }}>
            {step === 1 ? (
                <>
                    <h2>Login</h2>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
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
                        value={cod}
                        onChange={e => setCod(e.target.value)}
                        style={{ display: 'block', margin: '1rem 0', width: '100%' }}
                    />
                    <button onClick={handleVerifyCode}>Verify</button>
                </>
            )}
        </div>
    );
}

export default TwoFactorLoginForm;
