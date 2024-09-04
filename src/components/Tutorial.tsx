import React, {useEffect, useRef, useState} from "react";
// @ts-ignore
import SVGTeacher from "*.svg?react";
import MainContent, {initializeSpecificHand} from "./MainContent";
import {Screens} from "../App";
import {useSwipeable} from "react-swipeable";
import CheatSheet, {action2iconDict, cheatSheetDataLogic} from "./CheatSheet";
import {PlayingCard} from "./PlayingCard";
import {AiOutlineClose, AiOutlineUp} from "react-icons/ai";
import {GiClubs, GiDiamonds, GiHearts, GiSpades} from "react-icons/gi";
import {FaDiamond} from "react-icons/fa6";

interface TutorialProps {
    changeScreenTo: (screen: Screens) => void;
}

const pictureCards = ['K', 'Q', 'J']

const Tutorial: React.FC<TutorialProps> = ({changeScreenTo}) => {
        // console.log("peaking", peaking)
        const cheatSheetBGRef = useRef<HTMLDivElement>(null);
        const [currentPage, setCurrentPage] = useState(0);
        // const [isPeaking, setIsPeaking] = useState(peaking)
        const [isExpanded, setIsExpanded] = useState(true)

        const handleHeaderClick = () => {
            setIsExpanded(!isExpanded);
        };

        const handleCheatSheet = (event: MouseEvent) => {
            if (cheatSheetBGRef.current && cheatSheetBGRef.current.contains(event.target as Node)) {
                setIsExpanded(false);
            }
        };

        useEffect(() => {
            document.addEventListener('mousedown', handleCheatSheet);

            return () => {
                document.removeEventListener('mousedown', handleCheatSheet);

            };
        }, []);

        const howToPlay = () => {
            return (
                <div className="flex flex-col items-center justify-center w-[95%] h-[75%] max-w-[400px] bg-[#57A351] rounded px-6 py-8">
                    <div className="flex flex-row items-center text-center text-white text-xl font-bold pb-3">How to
                        Play
                        Blackjack
                    </div>
                    <div className="flex flex-row pb-0 text-white text-l font-semibold pb-1 space-x-2">
                        <div>Objective:</div>
                        <div><span className="text-black">Without going over,</span> get your hand adding up closer
                            to 21 than the dealer
                        </div>
                    </div>
                </div>
            )
        }

        const cardValues = () => {
            return (
                <div
                    className="flex flex-col items-center justify-center w-[95%] h-[75%] max-w-[400px] bg-[#57A351] rounded px-6 py-8">
                    <div className="flex flex-col items-center space-y-2">
                        <div className="flex flex-row items-center text-center text-white text-xl font-bold pb-1">Adding up
                            your hand
                        </div>
                        <div className="flex flex-col items-center text-black text-l font-semibold pb-1 space-y-0">
                            {/*<div className="flex flex-row text-sm text-white font-bold">*/}
                            {/*    Number cards are worth face value*/}
                            {/*</div>*/}
                            <div className="flex flex-row">
                                <div
                                    className="flex flex-row scale-75 transform">{[2, 3, 4, 5, 6, 7, 8, 9, 10].map((number, index) => (
                                    <PlayingCard suit={'spades'} value={number} display={`${number}`}
                                                 visible={true}/>))}</div>
                                <div
                                    className="flex flex-row items-center w-28 text-sm text-white font-bold py-2 -ml-1">Number
                                    cards are worth face value
                                </div>
                            </div>

                            <div className="flex flex-row">
                                <div
                                    className="flex flex-row scale-75 transform">{[11, 12, 13].map((number, index) => (
                                    <PlayingCard suit={'spades'} value={number}
                                                 display={`${pictureCards[number % 11]}`}
                                                 visible={true}/>))}</div>
                                <div
                                    className="flex flex-row items-center w-24 text-sm text-white font-bold py-2 pl-3 ">Picture
                                    Cards are
                                    worth 10
                                </div>
                                <div
                                    className="flex flex-row scale-75 transform">{
                                    <PlayingCard suit={'spades'} value={11}
                                                 display={`A`}
                                                 visible={true}/>}</div>
                                <div
                                    className="flex flex-row items-center w-22 text-sm text-white font-bold py-2 pl-5">Aces <br/> are
                                    worth <br/> 1 or 11
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col items-center text-sm font-bold">
                            <div className="flex flex-row text-sm text-white font-bold">
                                Suits are Ignored
                            </div>
                            <div className="flex flex-row space-x-2 py-2">
                                <GiSpades size="24px"/><GiHearts color="red" size="24px"/><GiClubs size="24px"/><FaDiamond
                                color="red" size="22px"/>
                            </div>
                        </div>
                    </div>
                </div>
            )
        }

        const placingBet = () => {
            return (
                <div className="flex flex-col items-center justify-start">

                </div>
            )
        }

        const tutorialPages = [
            howToPlay(),
            cardValues(),
            placingBet()
        ];

        const handlers = useSwipeable({
            onSwipedUp: () => setIsExpanded(true),
            onSwipedDown: () => setIsExpanded(false),
            onSwipedLeft: () => setCurrentPage((prev) => (prev + 1) % tutorialPages.length),
            onSwipedRight: () => setCurrentPage((prev) => (prev - 1 + tutorialPages.length) % tutorialPages.length),
        });
        return (
            <>
                <div
                    className={`fixed inset-0 bg-black transition-opacity duration-500 ${isExpanded ? 'opacity-80' : 'opacity-0 pointer-events-none'}`}
                />
                <div
                    className={`fixed bottom-[140px] left-0 right-0 transition-transform duration-500 ease-in-out ${isExpanded ? 'transform -translate-y-[10vh]' : 'transform translate-y-full'} flex flex-col items-center`}
                    {...handlers}
                >
                    <div
                        className="relative w-[350px] overflow-hidden flex justify-center items-center">
                        <div className="w-full h-full flex transition-transform items-end duration-500 space-x-4"
                             style={{transform: `translateX(calc(-1 * (${currentPage * 104.5}%)))`}}>
                            {Array.from({length: tutorialPages.length}, (_, index) => (
                                <div key={index}
                                     className="w-full h-full flex-shrink-0 flex justify-center items-center">
                                    {/*<div*/}
                                    {/*    className="flex flex-col items-center justify-center w-[95%] h-[75%] max-w-[400px] bg-[#57A351] rounded px-6 py-8">*/}
                                    {/*    {tutorialPages[index]}*/}
                                    {/*</div>*/}
                                    {tutorialPages[index]}
                                </div>
                            ))}

                        </div>
                    </div>
                    <div className="flex flex-row w-[350px] justify-end mt-4 pr-4">
                        {Array.from({length: tutorialPages.length}, (_, index) => (
                            <div
                                key={index}
                                className={`h-2 w-2 mx-1 rounded-full ${currentPage === index ? 'bg-white' : 'bg-gray-400'}`}
                                onClick={() => setCurrentPage(index)}
                            />
                        ))}
                    </div>
                    <div className="flex flex-row justify-end w-[350px] h-[100%] pt-4 px-2">
                        <button
                            className="btn btn-sm text-base font-bold z-20 rounded">Next
                        </button>
                    </div>
                </div>
            </>
        );
    }
;
export default Tutorial