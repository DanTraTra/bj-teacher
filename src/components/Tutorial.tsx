import React, {useEffect, useRef, useState} from "react";
// @ts-ignore
import SVGTeacher from "/src/assets/Teacher.svg?react";
// @ts-ignore
import SVGTeacherPoint from "/src/assets/Teacher5.svg?react";
import MainContent, {initializeSpecificHand, PlayerHandProps} from "./MainContent";
import {Screens} from "../App";
import {useSwipeable} from "react-swipeable";
import CheatSheet, {action2iconDict, cheatSheetDataLogic} from "./CheatSheet";
import {CardProps, PlayingCard} from "./PlayingCard";
import {AiOutlineClose, AiOutlineUp} from "react-icons/ai";
import {GiClubs, GiDiamonds, GiHearts, GiSpades} from "react-icons/gi";
import {FaDiamond} from "react-icons/fa6";

interface TutorialProps {
    changeScreenTo: (screen: Screens) => void;
    setTutorialState: (arg0: number) => void;
    TutorialState: number;
    PlayerHandSum: number;
    DealerHandSum: number;
}

const pictureCards = ['K', 'Q', 'J']

const Tutorial: React.FC<TutorialProps> = ({
                                               changeScreenTo,
                                               setTutorialState,
                                               TutorialState,
                                               PlayerHandSum,
                                               DealerHandSum,
                                           }) => {
        // console.log("peaking", peaking)
        const cheatSheetBGRef = useRef<HTMLDivElement>(null);
        const [currentPage, setCurrentPage] = useState(0);
        const [CurrentTeacher, setCurrentTeacher] = useState(0);

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

        const [PrevPage, setPrevPage] = useState<number>(0);

        // This effect will trigger the timer logic based on whether the number has increased or decreased
        useEffect(() => {
            let delay: number;
            console.log("currentPage, PrevPage", currentPage, PrevPage)
            setTutorialState(currentPage)

            if (currentPage > PrevPage) {
                delay = 300; // Delay when the number increases (e.g., 1 second)
            } else {
                delay = 0; // No timer if number hasn't changed
            }

            // Call useTimer when the number changes
            setTimeout(() => {
                setCurrentTeacher(currentPage)
                setPrevPage(currentPage); // Update the previous number after every change
            }, delay)

        }, [currentPage, PrevPage]);

        const howToPlay = () => {
            return (
                <div
                    className="flex flex-col items-center justify-center w-[95%] h-ful max-w-[400px] bg-[#57A351] rounded px-6 pt-8 pb-10">
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
                    className="flex flex-col items-center justify-center w-[95%] h-full max-w-[400px] bg-[#57A351] rounded px-6 py-8">
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

        const selectBet = () => {
            let content;

            switch (TutorialState) {
                case 2:
                    content =
                        <div
                            className="flex flex-col h-full items-center justify-start w-[95%] h-[336px] bg-[#57A351] text-white rounded px-6 py-8">
                            <div
                                className="flex flex-row w-full items-center justify-center text-center text-xl font-bold pb-1">
                                Select your bet amount
                            </div>
                            <div
                                className="flex flex-row w-full justify-center text-center items-start text-sm font-bold h-36">
                                You start with $20 in your balance, so lets start with betting $10
                            </div>
                        </div>
                    break
                case 3:
                    content =
                        <div
                            className="flex flex-col h-full items-center justify-start w-[95%] h-[336px] bg-[#57A351] text-white rounded px-6 py-8">
                            <div
                                className="flex flex-row w-full items-center justify-center text-center text-xl font-bold pb-1">
                                Press <span className="text-black">&nbsp;Place Bet</span>
                            </div>
                            <div
                                className="flex flex-row w-full justify-center items-start text-center text-sm font-bold h-20">
                                If you change your mind, you can press reset.
                            </div>
                        </div>
                    break
                case 4:
                    content =
                        <div className="flex flex-col w-full h-[336px] justify-center items-center">
                            <div
                                className="flex flex-col h-full items-center justify-start w-[95%] bg-[#57A351] text-white rounded px-6 py-8">
                                <div
                                    className="flex flex-row w-full items-center justify-center text-center text-xl font-bold pb-1">
                                    Your hand adds up to 11
                                </div>
                                <div
                                    className="flex flex-row w-full justify-center items-start text-center text-sm font-bold h-20">
                                    Still far from 21. Draw another card by pressing "Hit"
                                </div>
                            </div>
                        </div>
                    break
                case 5:
                    content =
                        <div
                            className="flex flex-col h-full items-center justify-start w-[95%] h-[336px] bg-[#57A351] text-white rounded px-6 py-8">
                            <div
                                className="flex flex-row w-full items-center justify-center text-center text-xl font-bold pb-1">
                                20 is pretty close to 21
                            </div>
                            <div
                                className="flex flex-row w-full justify-center items-start text-center text-sm font-semibold h-20">
                                Press "Stand" to see what the dealer has
                            </div>
                        </div>
                    break
                case 6:
                    content =
                        <div
                            className="flex flex-col h-full items-center justify-start w-[95%] h-[440px] bg-[#57A351] text-white rounded px-6 py-8">
                            <div
                                className="flex flex-row w-full items-center justify-center text-center text-xl font-bold pb-1">
                                {`${(DealerHandSum > 16 && DealerHandSum > PlayerHandSum) ? "Oh no!" : ""} Dealer hand adds to ${DealerHandSum}`}
                            </div>
                            <div
                                className="flex flex-row w-full justify-center items-start text-center text-sm font-semibold h-20">
                                The dealer will draw cards until their hand adds to 17 or above
                            </div>
                        </div>
                    break
                case 7:
                    content =
                        <div
                            className="flex flex-col h-full items-center justify-start w-[95%] h-[440px] bg-[#57A351] text-white rounded px-6 py-8">
                            <div
                                className="flex flex-row w-full items-center justify-center text-center text-xl font-bold pb-1">
                                Select $15 to bet this time
                            </div>
                            <div
                                className="flex flex-row w-full justify-center items-start text-center text-sm font-semibold h-20">
                                Remember, you can Reset the bet amount
                            </div>
                        </div>
                    break
            }

            return (
                <div className="flex flex-col w-full h-full justify-center items-center">
                    {content}
                </div>
            )
        }

        const tutorialPages = [
            howToPlay(),
            cardValues(),
            selectBet(),
        ];

        const nextButtonText = [
            "Next",
            "Next",
            "Back",
        ]

        const handlers = useSwipeable({
            onSwipedUp: () => setIsExpanded(true),
            onSwipedDown: () => setIsExpanded(false),
            onSwipedLeft: () => {
                setTutorialState((TutorialState + 1) % tutorialPages.length)

                // setTutorialState((TutorialState + 1) % tutorialPages.length)
            },
            onSwipedRight: () => {
                setTutorialState((TutorialState - 1 + tutorialPages.length) % tutorialPages.length)
            },
        });
        return (
            <>
                <div
                    className={`fixed inset-0 bg-black transition-opacity duration-500 ${isExpanded ? 'opacity-80' : 'opacity-0 pointer-events-none'}`}
                />
                <div
                    // className={`fixed bottom-[140px] left-0 right-0 transition-transform duration-500 ease-in-out ${isExpanded ? 'transform -translate-y-[10vh]' : 'transform translate-y-full'} flex flex-col items-center`}
                    // className={`flex flex-col justify-center items-center bottom-0 left-0 right-0 z-10 space-y-4 transition-transform duration-500 ease-in-out z-10 ${isExpanded ? 'transform -translate-y-[150px]' : 'transform translate-y-full'}`}
                    className="absolute flex items-center justify-center h-screen w-screen overflow-hidden pt-[150px]"
                    // className={`flex flex-col justify-center items-center -mb-[80px] left-0 right-0 z-10 space-y-4 transition-transform duration-500 ease-in-out z-10 ${isExpanded ? 'transform -translate-y-[10vh]' : 'transform translate-y-full'}`}
                    {...handlers}
                >
                    <div className="absolute flex flex-col space-y-4 items-center justify-center h-screen w-screen overflow-hidden">
                        <div
                            className="relative w-[350px] overflow-hidden flex flex-col justify-center items-center">
                            <div className="w-full h-full flex transition-transform items-end duration-500 space-x-4"
                                 style={{transform: `translateX(calc(-1 * (${TutorialState <= 2 ? (TutorialState * 104.5) : (2 * 104.5)}%)))`}}>
                                {Array.from({length: tutorialPages.length}, (_, index) => (
                                    <div key={index}
                                         className="w-full h-full flex-shrink-0 flex justify-center items-end">
                                        {/*<div*/}
                                        {/*    className="flex flex-col items-center justify-center w-[95%] h-[75%] max-w-[400px] bg-[#57A351] rounded px-6 py-8">*/}
                                        {/*    {tutorialPages[index]}*/}
                                        {/*</div>*/}
                                        {tutorialPages[index]}
                                    </div>
                                ))}

                            </div>
                        </div>
                        <div className="flex flex-row w-[350px] justify-end pr-4">
                            {Array.from({length: tutorialPages.length}, (_, index) => (
                                <div
                                    key={index}
                                    className={`h-2 w-2 mx-1 rounded-full ${TutorialState <= 2 ? TutorialState === index ? 'bg-white' : 'bg-gray-400' : index === 2 ? 'bg-white' : 'bg-gray-400'}`}
                                    onClick={() => setCurrentPage(index)}
                                />
                            ))}
                        </div>
                        <div className="flex flex-row justify-end w-[350px] h-[62px] px-2 z-50">
                            {(nextButtonText[TutorialState] === "Next" || nextButtonText[TutorialState] === "Back") &&
                            <button
                                onClick={() => {
                                    console.log("next clicked")
                                    nextButtonText[TutorialState] === "Next" ? setTutorialState((TutorialState + 1) % tutorialPages.length) : setTutorialState((TutorialState - 1 + tutorialPages.length) % tutorialPages.length)
                                }}
                                className="btn btn-sm text-base font-bold z-20 rounded">{nextButtonText[TutorialState]}
                            </button>}
                        </div>
                        {/*{tutorialTeacher[CurrentTeacher]}*/}
                    </div>
                </div>
            </>
        );
    }
;
export default Tutorial