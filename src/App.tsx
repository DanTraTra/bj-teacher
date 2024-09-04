import './App.css'
import './components/MainContent'
// @ts-ignore
import SVGOne from './assets/Dealer1.svg?react';
// @ts-ignore
import SVGTwo from "./assets/Dealer3.svg?react";
// @ts-ignore
import SVGTrain from "./assets/TRAIN.svg?react";
// @ts-ignore
import SVGTeacher from "./assets/Teacher.svg?react";


import React, {useEffect, useRef, useState} from "react";
import {useSpring, animated} from 'react-spring';
import MainContent from "./components/MainContent";
import LeaderBoard from "./components/LeaderBoard";
import {FaDumbbell} from "react-icons/fa6";
import ScrollableButtonContainer from "./components/ScrollableButtons";
import GameMenu from "./components/GameMenu";
import GameMenu1 from "./components/GameMenu1";
import Tutorial from "./components/Tutorial";
import TeacherAnimation from "./components/TeacherAnimation";
import SVGAnimator from "./components/SVGAnimator";
import SVGInterpolator from "./components/SVGAnimator";
import {PlayingCard} from "./components/PlayingCard";
import SwipeablePager from "./components/SwipeablePager";

export type Screens =
    "START"
    | "PLAY"
    | "TRAIN"
    | "LEADER BOARD"
    | "LEARN"

function App() {


    const [showMessage, setShowMessage] = useState(true)
    const [showBigTable, setShowBigTable] = useState(false)
    const [showButton, setShowButton] = useState(true)
    const [ScreenState, setScreenState] = useState<Screens>("LEARN")

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setTimeout(() => setShowMessage(false), 500);
        }, 500); // Change text after 2 seconds
        return () => clearTimeout(timeoutId);
    }, [])

    useEffect(() => {
        ////console.log("ScreenState", ScreenState)
    }, [ScreenState])

    const handlePlay = () => {
        setShowBigTable(true);
        setShowButton(false);
        setScreenState("PLAY");
    }

    const handleTrain = () => {
        setShowBigTable(true);
        setShowButton(false);
        setScreenState("TRAIN");
    }


    const handleShowLeaderboard = () => {
        setScreenState("LEADER BOARD");
    }

    const pictureCards = ['K', 'Q', 'J']

    function renderScreen() {
        const svgFilePaths = [
            "src/assets/Teacher.svg",
            "src/assets/Teacher1.svg",
            "src/assets/Teacher2.svg",
            "src/assets/Teacher3.svg",
            "src/assets/Teacher4.svg",
        ]
        ////console.log("ScreenState", ScreenState)
        const changeScreen = (screen: Screens) => {
            console.log(`Changing screens to ${screen}`)
            setScreenState(screen)
        }

        switch (ScreenState) {
            case 'START':
                return <div className="flex flex-col w-full overflow-x-hidden items-center space-y-8 pt-[25vh] pb-50">

                    {/*<div className="flex flex-col space-y-2 pb-6">*/}
                    {/*    <button className="btn font-tech px-5 text-lg" onClick={handlePlay}>Play</button>*/}
                    {/*    <button className="btn font-tech px-5 text-lg" onClick={handlePlay}><FaDumbbell size={18} fill="gray-800" />Train</button>*/}
                    {/*</div>*/}
                    {/*<ScrollableButtonContainer button1={()=>handlePlay()} button2={()=>handleTrain()}/>*/}
                    <GameMenu changeScreenTo={changeScreen}/>
                    {/*<GameMenu1/>*/}
                    {/*<SVGOne/>*/}
                    {/*<button className="btn" onClick={handleShowLeaderboard}>See Leader Board</button>*/}
                    <LeaderBoard/>
                </div>

            case 'PLAY':
                return <>
                    <div className="flex flex-1 justify-center overflow-hidden">
                        <div
                            className="absolute inset-0 flex items-center pb-20 justify-center h-screen w-screen overflow-hidden"
                        >
                            <MainContent changeScreenTo={changeScreen} trainingMode={false} tutorialMode={false}/>
                        </div>
                        <div className="flex flex-1 justify-center items-center">
                            <SVGTwo className="max-w-sm max-h-sm"/>
                        </div>
                    </div>
                </>
            case 'TRAIN':
                return <>
                    <div className="flex flex-1 justify-center overflow-hidden">
                        <div
                            className="absolute inset-0 flex items-center pb-20 justify-center h-screen w-screen overflow-hidden"
                        >
                            <MainContent changeScreenTo={changeScreen} trainingMode={true} tutorialMode={false}/>
                        </div>
                        <div className="flex flex-1 justify-center items-center">
                            <SVGTrain className="max-w-sm max-h-sm"/>
                        </div>
                    </div>
                </>

            case 'LEARN' :
                return <>
                    <div className="flex flex-1 justify-center overflow-hidden">

                    {/*    <div*/}
                    {/*        className={`fixed z-20 inset-0 bg-black transition-opacity duration-500 opacity-80`}*/}
                    {/*    />*/}
                    {/*    <div*/}
                    {/*        className={"fixed left-0 right-0 z-30 flex flex-col justify-center items-center inset-0 transition-opacity duration-500"}*/}
                    {/*    >*/}
                    {/*        <div*/}
                    {/*            className="flex flex-col items-center justify-center w-[85%] h-[75%] max-w-[400px] mb-20 bg-[#57A351] rounded px-12 py-10">*/}
                    {/*            <div className="flex flex-row text-white text-xl font-semibold pb-3">How to Play*/}
                    {/*                Blackjack*/}
                    {/*            </div>*/}
                    {/*            <div className="flex flex-row pb-10 text-white text-l font-semibold pb-1 space-x-2">*/}
                    {/*                <div>Objective:</div>*/}
                    {/*                <div><span className="text-red-700">Without going over,</span> get your hand closer*/}
                    {/*                    to 21 than the dealer*/}
                    {/*                </div>*/}
                    {/*            </div>*/}
                    {/*            <div className="flex flex-col items-center text-black text-l font-semibold pb-1">*/}

                    {/*                <div className="flex flex-row text-sm font-normal">Number Cards are worth their*/}
                    {/*                    number*/}
                    {/*                </div>*/}
                    {/*                <div*/}
                    {/*                    className="flex flex-row scale-75 transform">{[2, 3, 4, 5, 6, 7, 8, 9, 10].map((number, index) => (*/}
                    {/*                    <PlayingCard suit={'spades'} value={number} display={`${number}`}*/}
                    {/*                                 visible={true}/>))}</div>*/}



                    {/*                <div className="flex flex-row">*/}
                    {/*                    <div*/}
                    {/*                        className="flex flex-row scale-75 transform">{[11, 12, 13].map((number, index) => (*/}
                    {/*                        <PlayingCard suit={'spades'} value={number}*/}
                    {/*                                     display={`${pictureCards[number % 11]}`}*/}
                    {/*                                     visible={true}/>))}</div>*/}
                    {/*                    <div className="flex flex-row items-center w-24 text-sm font-normal py-2 pl-4">Picture Cards are*/}
                    {/*                        worth 10*/}
                    {/*                    </div>*/}

                    {/*                </div>*/}
                    {/*                <div className="flex flex-row">*/}
                    {/*                    <div*/}
                    {/*                        className="flex flex-row scale-75 transform">{*/}
                    {/*                        <PlayingCard suit={'spades'} value={11}*/}
                    {/*                                     display={`A`}*/}
                    {/*                                     visible={true}/>}</div>*/}
                    {/*                    <div className="flex flex-row items-center w-24 text-sm font-normal py-2 pl-4">Picture Cards are*/}
                    {/*                        worth 10*/}
                    {/*                    </div>*/}

                    {/*                </div>*/}

                    {/*            </div>*/}

                    {/*        </div>*/}
                    {/*        /!*<Tutorial changeScreenTo={changeScreen} trainingMode={false}/>*!/*/}

                    {/*    </div>*/}
                        <div
                            className="absolute z-50 flex flex-row items-center justify-start w-[65%] max-w-[400px] bottom-0">
                            {/*<SVGAnimator svgPaths={svgUrls}/>*/}
                            {/*<TeacherAnimation/>*/}
                            {/*  <SVGInterpolator filePaths={svgFilePaths} duration={2000} />,/!**!/*/}

                            <SVGTeacher className="transform scale-[300%]"/>
                        </div>
                        <div
                            className="absolute inset-0 flex items-center pb-20 justify-center h-screen w-screen overflow-hidden"
                        >
                            <MainContent changeScreenTo={changeScreen} trainingMode={false} tutorialMode={true}/>
                        </div>
                        <Tutorial changeScreenTo={changeScreen}/>
                        <div className="flex flex-1 justify-center items-center">
                            <SVGTwo className="max-w-sm max-h-sm"/>
                        </div>
                    </div>
                </>


        }
    }

    return (
        <>
            <div className="flex flex-col flex-start items-center h-[100vh] overflow-y-auto bg-pastelBlue">

                {renderScreen()}

            </div>
        </>)

}

export default App
