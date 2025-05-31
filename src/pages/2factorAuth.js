import React, { useState } from 'react';
import axios from 'axios';

const BACKEND_URL = 'https://jewelry-website-backend-mt8c.onrender.com/api/auth';

function TwoFactorLoginForm({ onLoginSuccess }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
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
            
            // If we have a token, login was successful
            if (res.data.token) {
                localStorage.setItem('token', res.data.token);
                localStorage.setItem('email', email);
                setSuccessMessage("Login successful!");
                
                // Short delay to show success message before redirecting
                setTimeout(() => {
                    onLoginSuccess();
                }, 1000);
            } else {
                setError("Login failed");
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

    return (
        <div style={styles.container}>
            <div style={styles.formCard}>
                {/* Error Message */}
                {error && <div style={styles.errorMessage}>{error}</div>}
                
                {/* Success Message */}
                {successMessage && <div style={styles.successMessage}>{successMessage}</div>}

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
                    {isLoading ? 'Logging in...' : 'Login'}
                </button>
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
