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
// @ts-ignore
import SVGTeacherPoint from "./assets/Teacher1.svg?react";
// @ts-ignore
import SVGTeacherPoint1 from "./assets/Teacher2.svg?react";
// @ts-ignore
import SVGTeacherPoint2 from "./assets/Teacher3.svg?react";


import React, {useEffect, useRef, useState} from "react";
import {useSpring, animated} from 'react-spring';
import MainContent, {PlayerHandProps} from "./components/MainContent";
import LeaderBoard from "./components/LeaderBoard";
import {FaDumbbell} from "react-icons/fa6";
import ScrollableButtonContainer from "./components/ScrollableButtons";
import GameMenu from "./components/GameMenu";
import GameMenu1 from "./components/GameMenu1";
import Tutorial from "./components/Tutorial";
import TeacherAnimation from "./components/TeacherAnimation";
import SVGAnimator from "./components/SVGAnimator";
import SVGInterpolator from "./components/SVGAnimator";
import {CardProps, PlayingCard} from "./components/PlayingCard";
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
    const [TutorialState, setTutorialState] = useState<number>(0)

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setTimeout(() => setShowMessage(false), 500);
        }, 500); // Change text after 2 seconds
        return () => clearTimeout(timeoutId);
    }, [])

    useEffect(() => {
        console.log("TutorialState", TutorialState)
    }, [TutorialState])


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

    const neutralTeacher = () => {
        return (
            <SVGTeacher className="transform scale-[300%]"/>
        )
    }

    const pointingTeacher = () => {
        return (
            <SVGTeacherPoint className="transform scale-[300%]"/>
        )
    }
    const pointingTeacher1 = () => {
        return (
            <SVGTeacherPoint1 className="transform scale-[300%]"/>
        )
    }
    const pointingTeacher2 = () => {
        return (
            <SVGTeacherPoint2 className="transform scale-[300%]"/>
        )
    }


    const tutorialTeacher = [
        neutralTeacher(),
        neutralTeacher(),
        pointingTeacher(),
        pointingTeacher2(),
        pointingTeacher1(),
        pointingTeacher1(),
        pointingTeacher1(),
        pointingTeacher1(),
    ]

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
                            <MainContent changeScreenTo={changeScreen} trainingMode={false} setTutorialState={() => {
                            }} TutorialState={0}/>
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
                            <MainContent changeScreenTo={changeScreen} trainingMode={true} setTutorialState={() => {
                            }} TutorialState={0}/>
                        </div>
                        <div className="flex flex-1 justify-center items-center">
                            <SVGTrain className="max-w-sm max-h-sm"/>
                        </div>
                    </div>
                </>

            case 'LEARN' :
                return <>
                    <div className="flex flex-1 justify-center items-center overflow-hidden">
                        {/*<div*/}
                        {/*    className="absolute z-50 flex flex-row items-center justify-start w-[65%] max-w-[400px] bottom-0">*/}
                        {/*    /!*<SVGAnimator svgPaths={svgUrls}/>*!/*/}
                        {/*    /!*<TeacherAnimation/>*!/*/}
                        {/*    /!*  <SVGInterpolator filePaths={svgFilePaths} duration={2000} />,/!**!/*!/*/}

                        {/*    <SVGTeacher className="transform scale-[300%]"/>*/}
                        {/*</div>*/}
                        <div
                            className="absolute inset-0 flex items-center pb-20 justify-center h-screen w-screen overflow-hidden"
                        >
                            <MainContent changeScreenTo={changeScreen} trainingMode={false}
                                         TutorialState={TutorialState} setTutorialState={setTutorialState}/>
                        </div>
                        {/*<div*/}
                        {/*    // className="absolute flex items-end justify-center pb-12 h-screen w-screen overflow-hidden"*/}
                        {/*    className="absolute flex items-end justify-center bottom-[40px] h-screen w-screen overflow-hidden"*/}
                        {/*>*/}
                        {/*    /!*<Tutorial changeScreenTo={changeScreen} setTutorialState={setTutorialState}*!/*/}
                        {/*    /!*          TutorialState={TutorialState} playerHand={PlayerHandState} dealerHand={DealerHandState}/>*!/*/}
                        {/*</div>*/}
                        <div className={`flex flex-1 justify-center items-center`}>
                            <SVGTwo className="max-w-sm max-h-sm"/>
                        </div>
                        <div
                            className="absolute flex items-center justify-center h-screen w-screen overflow-hidden">
                            <div
                                className={`absolute ${[2,].includes(TutorialState) ? "z-50" : "z-30"} flex flex-row items-center justify-start h-20 w-[65%] max-w-[350px] min-w-[280px] -mb-[770px]`}>
                                {tutorialTeacher[TutorialState]}
                            </div>
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
