import React, { useState } from 'react';
import axios from 'axios';

const BACKEND_URL = 'https://jewelry-website-backend-mt8c.onrender.com/api/auth';

function TwoFactorLoginForm({ onLoginSuccess }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [step, setStep] = useState(1);
    const [code, setCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async () => {
        setIsLoading(true);
        setError('');
        try {
            console.log('Attempting login with:', { email, password });
            const res = await axios.post(`${BACKEND_URL}/login`, {
                email: email.trim(),
                password: password.trim()
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log('Login response:', res.data);
            
            if (res.data.message === "Verification code sent") {
                alert("Verification code sent to your email.");
                setStep(2);
            } else {
                setError(res.data.error || "Login failed");
            }
        } catch (error) {
            console.error('Login error:', {
                response: error.response?.data,
                status: error.response?.status
            });
            
            setError(
                error.response?.data?.error || 
                error.response?.data?.message || 
                "Login failed. Please check your credentials."
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyCode = async () => {
        setIsLoading(true);
        try {
            const res = await axios.post(`${BACKEND_URL}/verify-code`, {
                email: email.trim(),
                code: code.trim()
            });
            
            localStorage.setItem('token', res.data.token);
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
            {error && (
                <div style={{ color: 'red', marginBottom: '1rem' }}>
                    {error}
                </div>
            )}

            {step === 1 ? (
                <>
                    <h2>Login</h2>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        style={{ display: 'block', margin: '1rem 0', width: '100%', padding: '8px' }}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        style={{ display: 'block', margin: '1rem 0', width: '100%', padding: '8px' }}
                    />
                    <button 
                        onClick={handleLogin}
                        disabled={isLoading}
                        style={{ 
                            padding: '8px 16px', 
                            backgroundColor: isLoading ? '#ccc' : '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        {isLoading ? 'Sending...' : 'Send Code'}
                    </button>
                </>
            ) : (
                <>
                    <h2>Enter Verification Code</h2>
                    <p style={{ marginBottom: '1rem' }}>Check your email at {email} for the code</p>
                    <input
                        type="text"
                        placeholder="6-digit code"
                        value={code}
                        onChange={e => {
                            // Only allow numbers and limit to 6 digits
                            const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                            setCode(value);
                        }}
                        style={{ display: 'block', margin: '1rem 0', width: '100%', padding: '8px' }}
                    />
                    <button 
                        onClick={handleVerifyCode}
                        disabled={isLoading || code.length !== 6}
                        style={{ 
                            padding: '8px 16px', 
                            backgroundColor: isLoading ? '#ccc' : (code.length === 6 ? '#28a745' : '#6c757d'),
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: code.length === 6 ? 'pointer' : 'not-allowed'
                        }}
                    >
                        {isLoading ? 'Verifying...' : 'Verify'}
                    </button>
                </>
            )}
        </div>
    );
}

export default TwoFactorLoginForm;
