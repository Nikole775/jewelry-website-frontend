
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './pages/App.js';
import './index.css';

const root = createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);

