import './Blackjack.css'
import '../components/MainContent'
// @ts-ignore
import SVGOne from '../assets/Dealer1.svg?react';
// @ts-ignore
import SVGTwo from "../assets/Dealer3.svg?react";
// @ts-ignore
import SVGTrain from "../assets/TRAIN.svg?react";
// @ts-ignore
import SVGTeacher from "../assets/Teacher.svg?react";
// @ts-ignore
import SVGTeacherPoint from "../assets/Teacher1.svg?react";
// @ts-ignore
import SVGTeacherPoint1 from "../assets/Teacher2.svg?react";
// @ts-ignore
import SVGTeacherPoint2 from "../assets/Teacher3.svg?react";
// @ts-ignore
import Arrow1 from "../assets/arrow1.svg?react";


import React, {useEffect, useRef, useState, Suspense} from "react";
import {useSpring, animated} from 'react-spring';
const MainContent = React.lazy(() => import("../components/MainContent"));
const LeaderBoard = React.lazy(() => import("../components/LeaderBoard"));
const GameMenu = React.lazy(() => import("../components/GameMenu"));
const Tutorial = React.lazy(() => import("../components/Tutorial"));
import type {PlayerHandProps} from "../components/MainContent";
import type {GameLogDataEntries, LeaderboardRow} from "../components/LeaderBoard";
import {FaDumbbell} from "react-icons/fa6";
import ScrollableButtonContainer from "../components/ScrollableButtons";
import TeacherAnimation from "../components/TeacherAnimation";
import SVGAnimator from "../components/SVGAnimator";
import SVGInterpolator from "../components/SVGAnimator";
import {CardProps, PlayingCard} from "../components/PlayingCard";
import SwipeablePager from "../components/SwipeablePager";
import {fetchLeaderboardData} from "../services/leaderboardService";
import CameraRecorder from "../components/CameraRecorder";

export type Screens =
    "START"
    | "PLAY"
    | "TRAIN"
    | "LEADER BOARD"
    | "LEARN"

function Blackjack() {


    const [showMessage, setShowMessage] = useState(true)
    const [showBigTable, setShowBigTable] = useState(false)
    const [showButton, setShowButton] = useState(true)
    const [ScreenState, setScreenState] = useState<Screens>("START")
    const [TutorialState, setTutorialState] = useState<number>(-1)
    const [Loading, setLoading] = useState(true);
    const [LeaderboardData, setLeaderboardData] = useState<GameLogDataEntries[]>([]);
    const [SortedLeaderboard, setSortedLeaderboard] = useState<LeaderboardRow[]>([]);

    const fetchData = async () => {
        setLoading(true);
        const data = await fetchLeaderboardData();
        setLeaderboardData(data);
        setLoading(false);
    };

    useEffect(() => {

        const timeoutId = setTimeout(() => {
            setTimeout(() => setShowMessage(false), 500);
        }, 500); // Change text after 2 seconds
        fetchData();

        return () => clearTimeout(timeoutId);
    }, [])

    useEffect(() => {
        // // // // console.log("LeaderboardData", LeaderboardData)
        let updatedBoard: LeaderboardRow[] = LeaderboardData.map((d, index) => ({
            rank: 1,
            player: d.username,
            cashOut: d.game_log_data[d.game_log_data.length - 1].EndingBalance,
            hands: d.game_log_data.length,
            win: parseFloat(((d.game_log_data.filter(game => game.PlayerCards.some(hand => hand.winMultiplier > 1)).length / d.game_log_data.length) * 100).toFixed(0)),
            db_index: index,
            game_log_data: d.game_log_data,
        }));

        updatedBoard.sort((a, b) => b.cashOut - a.cashOut).forEach((row, index) => {
            row.rank = index + 1;
        });

        updatedBoard = updatedBoard.splice(0, 20)

        setSortedLeaderboard(updatedBoard);
        // // // // console.log("sortedLeaderBoard")

    }, [LeaderboardData])

    useEffect(() => {
        // // // // console.log("TutorialState", TutorialState)
    }, [TutorialState])

    useEffect(() => {
        // if (ScreenState == "LEARN") {
        //     // // // console.log("setting to learn")
        //     setTutorialState(0)
        // }
        // // // // console.log("ScreenState", ScreenState)
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
        pointingTeacher1(),
        pointingTeacher2(),
        pointingTeacher1(),
        pointingTeacher1(),
        pointingTeacher2(),
        pointingTeacher1(),
        pointingTeacher1(),
    ]

    function renderScreen() {
        ////// // // console.log("ScreenState", ScreenState)
        const changeScreen = (screen: Screens) => {
            setScreenState(screen)
        }

        switch (ScreenState) {
            case 'START':
                return <div className="flex flex-col w-full h-full overflow-x-hidden items-center space-y-8 pt-[25vh] pb-32">

                    {/*<div className="flex flex-col space-y-2 pb-6">*/}
                    {/*    <button className="btn font-tech px-5 text-lg" onClick={handlePlay}>Play</button>*/}
                    {/*    <button className="btn font-tech px-5 text-lg" onClick={handlePlay}><FaDumbbell size={18} fill="gray-800" />Train</button>*/}
                    {/*</div>*/}
                    {/*<ScrollableButtonContainer button1={()=>handlePlay()} button2={()=>handleTrain()}/>*/}
                    <GameMenu changeScreenTo={changeScreen} setTutorialState={setTutorialState}/>
                    {/*<GameMenu1/>*/}
                    {/*<SVGOne/>*/}
                    {/*<button className="btn" onClick={handleShowLeaderboard}>See Leader Board</button>*/}
                    <LeaderBoard LeaderboardData={SortedLeaderboard} Loading={Loading}/>
                </div>

            case 'PLAY':
                return <>
                    <div className="flex flex-1 justify-center overflow-hidden">
                        <div
                            className="absolute inset-0 flex items-center pb-20 justify-center h-screen w-screen overflow-hidden"
                        >
                            <MainContent changeScreenTo={changeScreen} leaderboardStats={SortedLeaderboard}
                                         trainingMode={false} setTutorialState={() => {
                            }} TutorialState={TutorialState}/>
                        </div>
                        <div className="flex flex-1 justify-center items-center pb-[60px]">
                            <SVGTwo className="max-w-sm max-h-sm"/>
                        </div>
                        {/*<div className="absolute top-0 right-0 left-0 bottom-0 z-0">*/}
                        {/*    /!*<CameraRecorder/>*!/*/}
                        {/*</div>*/}
                    </div>
                </>
            case 'TRAIN':
                return <>
                    <div className="flex flex-1 justify-center overflow-hidden">
                        <div
                            className="absolute inset-0 flex items-center pb-20 justify-center h-screen w-screen overflow-hidden"
                        >
                            <MainContent changeScreenTo={changeScreen} leaderboardStats={SortedLeaderboard}
                                         trainingMode={true} setTutorialState={() => {
                            }} TutorialState={TutorialState}/>
                        </div>
                        <div className="flex flex-1 justify-center items-center pb-12">
                            <SVGTrain className="max-w-sm max-h-sm"/>
                        </div>
                    </div>
                </>

            case 'LEARN' :
                return <>
                    <div className="flex flex-1 justify-center items-center overflow-hidden">
                        <div
                            className="absolute inset-0 flex items-center pb-20 justify-center h-screen w-screen overflow-hidden"
                        >
                            <MainContent changeScreenTo={changeScreen} leaderboardStats={SortedLeaderboard}
                                         trainingMode={false}
                                // TutorialState={7}
                                         TutorialState={TutorialState}
                                         setTutorialState={setTutorialState}/>
                        </div>
                        <div className={`flex flex-1 justify-center items-center`}>
                            <SVGTwo className="max-w-sm max-h-sm"/>
                        </div>
                        <div
                            className="absolute flex items-center justify-center">
                            <div id={`tutorialTeacher`}
                                 className={`absolute ${[14].includes(TutorialState) ? "z-50" : "z-30"} flex flex-row items-center justify-start h-20 w-[65%] max-w-[350px] min-w-[280px] -mb-[770px]`}>
                                {tutorialTeacher[TutorialState]}
                            </div>
                        </div>
                        {/*<div*/}
                        {/*    className={`absolute z-30 flex items-center justify-center h-screen w-screen overflow-hidden`}>*/}
                        {/*    <div className={`absolute flex flex-row justify-end items-start top-20 right-32`}>*/}
                        {/*        <Arrow1 className="size-12 max-w-sm max-h-sm -rotate-[10deg]"/>*/}
                        {/*    </div>*/}
                        {/*    <div className={`absolute text-sm text-white font-bold flex flex-row justify-end items-start top-32 right-32`}>*/}
                        {/*        Your balance*/}
                        {/*    </div>*/}

                        {/*</div>*/}

                    </div>
                </>


        }
    }

    return (
        <>
            <div
                className="flex flex-col flex-start items-center absolute top-0 bottom-0 right-0 left-0 overflow-y-hidden overflow-x-hidden bg-pastelBlue">

                {renderScreen()}

            </div>
        </>)

}

export default Blackjack
