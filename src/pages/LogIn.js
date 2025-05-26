// LoginPage.jsx
import { useState } from 'react';
import axios from 'axios';
//import { useNavigate } from 'react-router-dom';

export default function LoginPage({ onLoginSuccess }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    //const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:4000/api/auth/login', { email, password });
            localStorage.setItem('token', res.data.token);
            //navigate('/');
            onLoginSuccess();
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed');
        }
    };

    return (
        <form onSubmit={handleLogin}>
            <h2>Login</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <input type="email" placeholder="Email" onChange={e => setEmail(e.target.value)} required />
            <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} required />
            <button type="submit">Login</button>
        </form>
    );
}
