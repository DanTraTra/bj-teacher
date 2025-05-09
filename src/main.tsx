// import React from 'react'
// import ReactDOM from 'react-dom/client'
// import Blackjack from './pages/Blackjack'
// import './index.css'
// import 'tailwindcss/tailwind.css'
//
// ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
//     <React.StrictMode>
//         <Blackjack/>
//     </React.StrictMode>,
// )
import React from 'react';
import ReactDOM from 'react-dom/client';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import Blackjack from './pages/Blackjack'; // Your existing Blackjack component
import Orangagrams from './pages/Orangagrams'; // Your existing Blackjack component
import SinglePLayer from './pages/O_SinglePlayer'; // Your existing Blackjack component
import CrossClues from './pages/CrossClues'; // Your existing Blackjack component
import Portfolio from './pages/Portfolio'; // New profile page
import './index.css';
import 'tailwindcss/tailwind.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <Router>
            <Routes>
                {/* Route for Profile Menu at daaaaan.com */}
                <Route path="/" element={<Portfolio/>}/>
                <Route path="/blackjack" element={<Blackjack/>}/>
                <Route path="/orangagrams" element={<Orangagrams/>}/>
                <Route path="/crossclues" element={<CrossClues/>}/>
                <Route path="/orangagrams/single-player" element={<SinglePLayer/>}/>
            </Routes>
        </Router>
    </React.StrictMode>,
);
