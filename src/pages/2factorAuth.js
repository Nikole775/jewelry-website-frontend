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
    const [successMessage, setSuccessMessage] = useState('');

    const handleLogin = async () => {
        if (!email || !password) {
            setError('Please fill in all fields');
            return;
        }

        setIsLoading(true);
        setError('');
        setSuccessMessage('');
        
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
            if (res.data.success) {
                setSuccessMessage("Verification code has been sent to your email!");
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
        if (!cod) {
            setError('Please enter the verification code');
            return;
        }

        setIsLoading(true);
        setError('');
        try {
            const res = await axios.post(`${BACKEND_URL}/verify-code`, {
                email,
                cod
            });
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('email', email);
            setSuccessMessage("Login successful!");
            setTimeout(() => {
                onLoginSuccess();
            }, 1000);
        } catch (error) {
            console.error('Verification error:', error.response?.data);
            setError(error.response?.data?.error || "Invalid verification code.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.formCard}>
                {/* Error Message */}
                {error && <div style={styles.errorMessage}>{error}</div>}
                
                {/* Success Message */}
                {successMessage && <div style={styles.successMessage}>{successMessage}</div>}

                {step === 1 ? (
                    <>
                        <h2 style={styles.title}>Login</h2>
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            style={styles.input}
                            disabled={isLoading}
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            style={styles.input}
                            disabled={isLoading}
                        />
                        <button 
                            onClick={handleLogin} 
                            style={styles.button}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Sending...' : 'Send Code'}
                        </button>
                    </>
                ) : (
                    <>
                        <h2 style={styles.title}>Enter Verification Code</h2>
                        <p style={styles.subtitle}>Please check your email for the verification code</p>
                        <input
                            type="text"
                            placeholder="Enter code"
                            value={cod}
                            onChange={e => setCod(e.target.value)}
                            style={styles.input}
                            disabled={isLoading}
                        />
                        <button 
                            onClick={handleVerifyCode} 
                            style={styles.button}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Verifying...' : 'Verify'}
                        </button>
                        <button 
                            onClick={() => {
                                setStep(1);
                                setCod('');
                                setError('');
                                setSuccessMessage('');
                            }} 
                            style={styles.backButton}
                        >
                            Back to Login
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        padding: '20px'
    },
    formCard: {
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '400px'
    },
    title: {
        textAlign: 'center',
        marginBottom: '1.5rem',
        color: '#333'
    },
    subtitle: {
        textAlign: 'center',
        marginBottom: '1rem',
        color: '#666',
        fontSize: '0.9rem'
    },
    input: {
        display: 'block',
        width: '100%',
        padding: '0.75rem',
        marginBottom: '1rem',
        borderRadius: '4px',
        border: '1px solid #ddd',
        fontSize: '1rem'
    },
    button: {
        display: 'block',
        width: '100%',
        padding: '0.75rem',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        fontSize: '1rem',
        cursor: 'pointer',
        marginBottom: '0.5rem'
    },
    backButton: {
        display: 'block',
        width: '100%',
        padding: '0.75rem',
        backgroundColor: 'transparent',
        color: '#666',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '1rem',
        cursor: 'pointer',
        marginTop: '1rem'
    },
    errorMessage: {
        backgroundColor: '#ffebee',
        color: '#c62828',
        padding: '0.75rem',
        borderRadius: '4px',
        marginBottom: '1rem',
        textAlign: 'center'
    },
    successMessage: {
        backgroundColor: '#e8f5e9',
        color: '#2e7d32',
        padding: '0.75rem',
        borderRadius: '4px',
        marginBottom: '1rem',
        textAlign: 'center'
    }
};

export default TwoFactorLoginForm;
