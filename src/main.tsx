import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import 'tailwindcss/tailwind.css'
import MainContent from "./components/MainContent";

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <App/>
    </React.StrictMode>,
)
