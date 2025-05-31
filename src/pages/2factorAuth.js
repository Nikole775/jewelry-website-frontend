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

    export async function login(req, res) {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'email and password required',
                                    received: req.body});
    }

    try {
        const user = await userModel.findByEmail(email);
        if (!user) {
            console.log('Login attempt for non-existent email:', email);
            return res.status(401).json({ error: 'Invalid credentials' ,
                                        suggestion: 'No user found with this email'});
        }
        if (password !== user.passwordHash) {
            console.log('Password mismatch for user:', email);
            return res.status(401).json({ error: 'Invalid credentials',
                                        suggestion: 'Check your password'});
        }

        const cod = Math.floor(100000 + Math.random()* 900000).toString();
        await sendVerificationEmail(user.email, cod);
        
        const token = jwt.sign({ id: user.id, roleId: user.roleId }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

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
