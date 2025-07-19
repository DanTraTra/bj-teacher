// import React from 'react'
// import ReactDOM from 'react-dom/client'
// import Blackjack from './pages/Blackjack'
// import './index.css'
// import 'tailwindcss/tailwind.css'
//
// ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
//     <React.StrictMode>
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
const Blackjack = React.lazy(() => import('./pages/Blackjack'));
const Orangagrams = React.lazy(() => import('./pages/Orangagrams'));
const SinglePLayer = React.lazy(() => import('./pages/O_SinglePlayer'));
const ImageLink = React.lazy(() => import('./pages/CrossClues'));
const Portfolio = React.lazy(() => import('./pages/Portfolio'));


import './index.css';
import 'tailwindcss/tailwind.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <Router>
            <React.Suspense fallback={<div>Loading...</div>}>
                <Routes>
                    {/* Route for Profile Menu at daaaaan.com */}
                    <Route path="/" element={<Portfolio />} />
                    <Route path="/blackjack" element={<Blackjack />} />
                    <Route path="/orangagrams" element={<Orangagrams />} />
                    <Route path="/image_link" element={<ImageLink />} />
                    <Route path="/image_link/:id" element={<ImageLink />} />
                    <Route path="/orangagrams/single-player" element={<SinglePLayer />} />
                    {/* <Route path="/playtester" element={<PlayTester/>}/> */}
                </Routes>
            </React.Suspense>
        </Router>
    </React.StrictMode>,
);
