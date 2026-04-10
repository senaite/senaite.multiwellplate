import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';


document.addEventListener('DOMContentLoaded', () => {
    createRoot(document.getElementById('senaite-multiwellplate-app')).render(
        <StrictMode>
            <App config={document?.multiwellplateConfig}/>
        </StrictMode>,
    )
});
