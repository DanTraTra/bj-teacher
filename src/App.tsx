import './App.css'
import './components/MainContent'
// @ts-ignore
import SVGOne from './assets/Dealer1.svg?react';
// @ts-ignore
import SVGTwo from "./assets/Dealer2.svg?react";
import {useEffect, useState} from "react";
import {useSpring, animated} from 'react-spring';
import MainContent from "./components/MainContent";
import setUpGame from "./components/MainContent";

function App() {
    const [showMessage, setShowMessage] = useState(true)
    const [showBigTable, setShowBigTable] = useState(false)
    const [showButton, setShowButton] = useState(true)

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setTimeout(() => setShowMessage(false), 500);
        }, 500); // Change text after 2 seconds
        return () => clearTimeout(timeoutId);
    }, [])

    const clickHandler = () => {
        setShowBigTable(true);
        setShowButton(false);
    }

    return (
        <>
            <div className="flex flex-col items-center justify-center h-screen pb-20 overflow-hidden">
                <div className={showButton ? ("py-8") : ("py-8 fade-out")}>
                    {showMessage ? (
                        <div className="btn">Welcome</div>
                    ) : (
                        <button className="btn" onClick={clickHandler}>Let's Begin</button>
                    )}
                </div>

                {/*<img src='/src/assets/Dealer1.svg' alt="Dealer SVG"/>*/}
                <div className="svg-container">
                    {showButton ? (
                        <div>
                            <SVGOne/>
                        </div>
                    ) : (
                        <div>
                            <div className="absolute inset-0 flex justify-center items-center pt-28">
                                <MainContent/>
                            </div>
                            <SVGTwo/>
                        </div>

                    )}
                </div>

            </div>
        </>)

}

export default App
