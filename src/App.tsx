import './App.css'
import './components/MainContent'
// @ts-ignore
import SVGOne from './assets/Dealer1.svg?react';
// @ts-ignore
import SVGTwo from "./assets/Dealer3.svg?react";
import React, {useEffect, useRef, useState} from "react";
import {useSpring, animated} from 'react-spring';
import MainContent from "./components/MainContent";
import LeaderBoard from "./components/LeaderBoard";

export type Screens =
    "START"
    | "PLAY"
    | "LEADER BOARD"

function App() {


    const [showMessage, setShowMessage] = useState(true)
    const [showBigTable, setShowBigTable] = useState(false)
    const [showButton, setShowButton] = useState(true)
    const [ScreenState, setScreenState] = useState<Screens>("START")

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setTimeout(() => setShowMessage(false), 500);
        }, 500); // Change text after 2 seconds
        return () => clearTimeout(timeoutId);
    }, [])

    useEffect(() => {
        console.log("ScreenState", ScreenState)
    }, [ScreenState])

    const handlePlay = () => {
        setShowBigTable(true);
        setShowButton(false);
        setScreenState("PLAY");
    }

    const handleShowLeaderboard = () => {
        setScreenState("LEADER BOARD");
    }

    function renderScreen() {
        console.log("ScreenState", ScreenState)
        const changeScreen = (screen: Screens) => {
            setScreenState(screen)
        }

        switch (ScreenState) {
            case 'START':
                return <div className="flex flex-col items-center space-y-2 pt-[25vh] pb-50">

                    <div className="space-x-2 pb-6">
                        <button className="btn font-tech text-lg" onClick={handlePlay}>Play</button>
                    </div>

                    <SVGOne/>
                    {/*<button className="btn" onClick={handleShowLeaderboard}>See Leader Board</button>*/}
                    <LeaderBoard/>
                </div>

            case 'PLAY':
                return <>
                    {/*<div*/}
                    {/*    className="absolute inset-0 flex flex-1 justify-center pt-24 h-screen w-screen overflow-hidden">*/}
                    {/*    <MainContent onChange={changeScreen}/>*/}
                    {/*</div>*/}
                    <div className="flex flex-1 justify-center">
                        <div
                            className="absolute inset-0 flex items-center pb-20 justify-center h-screen w-screen overflow-hidden"
                        >
                            <MainContent onChange={changeScreen}/>
                        </div>
                        <div className="flex flex-1 justify-center items-center">
                            <SVGTwo className="max-w-sm max-h-sm"/>
                        </div>
                    </div>
                </>

            case 'LEADER BOARD' :
                return <LeaderBoard/>

        }
    }

    return (
        <>
            <div className="flex flex-col flex-start items-center h-[100vh] overflow-y-auto bg-pastelBlue ">
                {/*<div className={showButton ? ("py-8") : ("py-8 fade-out")}>*/}
                {/*    {showMessage ? (*/}
                {/*        <div className="btn">Welcome</div>*/}
                {/*    ) : (*/}
                {/*        <div className="space-x-2">*/}
                {/*            <button className="btn" onClick={handlePlay}>Play</button>*/}
                {/*            <button className="btn" onClick={handleShowLeaderboard}>See Leader Board</button>*/}
                {/*        </div>*/}

                {/*    )}*/}
                {/*</div>*/}

                {/*<img src='/src/assets/Dealer1.svg' alt="Dealer SVG"/>*/}
                {renderScreen()}

            </div>
        </>)

}

export default App
