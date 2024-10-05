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
// @ts-ignore
import Arrow1 from "/src/assets/arrow1.svg?react";
// @ts-ignore
import Arrow2 from "/src/assets/arrow2.svg?react";
// @ts-ignore
import Arrow3 from "/src/assets/arrow3.svg?react";

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
        // // console.log("peaking", peaking)
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
            // console.log("currentPage, PrevPage", currentPage, PrevPage)
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
                    className="flex flex-col items-center justify-center w-[95%] h-ful max-w-[400px] bg-[#57A351] rounded px-6 pt-8 pb-10 tracking-tighter">
                    <div className="flex flex-row items-center text-center text-white text-2xl font-bold pb-3">How to
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
                    className="flex flex-col items-center justify-between w-[95%] h-[350px] max-w-[400px] bg-[#57A351] rounded px-6 py-8">
                    <div className="flex flex-col h-full justify-between items-center tracking-tighter">
                        <div className="flex flex-row items-center text-center text-white font-bold text-2xl pb-1">Card
                            Values
                        </div>
                        <div className="flex flex-col items-center text-black text-l pb-1 space-y-2">
                            {/*<div className="flex flex-row text-sm text-white font-bold">*/}
                            {/*    Number cards are worth face value*/}
                            {/*</div>*/}
                            <div className="flex flex-row">
                                <div
                                    className="flex flex-row scale-75 transform">{[2, 3, 4, 5, 6, 7, 8, 9, 10].map((number, index) => (
                                    <PlayingCard key={index} suit={'spades'} value={number} display={`${number}`}
                                                 visible={true}/>))}</div>
                                <div
                                    className="flex flex-row items-center w-28 text-sm text-white py-2 -ml-1">Number
                                    cards <br/> are worth <br/> face value
                                </div>
                            </div>

                            <div className="flex flex-row">
                                <div
                                    className="flex flex-row scale-75 transform">{[11, 12, 13].map((number, index) => (
                                    <PlayingCard key={index + 10} suit={'spades'} value={number}
                                                 display={`${pictureCards[number % 11]}`}
                                                 visible={true}/>))}</div>
                                <div
                                    className="flex flex-row items-center w-24 text-sm text-white py-2 pl-3 ">Picture
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

        interface tutorialPage {
            header: React.ReactNode;
            text: React.ReactNode;
            spaceHeight: number;
        }
        const pages: tutorialPage[] = [
            {
                header: "",
                text: "",
                spaceHeight: 210,
            },
            {
                header: "",
                text: "",
                spaceHeight: 210,
            },
            {   //2
                header: "Place $10 to bet",
                text: "You start with $20 in your balance, so lets start with betting half of it",
                spaceHeight: 210,
            },
            {   //3
                header: <>Press <span className="text-black">&nbsp;Place Bet</span> </>,
                text: "You start with $20 in your balance, so lets start with betting half of it",
                spaceHeight: 210
            },
            {   //4
                header: "Card Dealing",
                text: <span> Your hand totals 11. <span className="text-black">Hit</span> to draw another card and get closer to 21.</span>,
                spaceHeight: 310,
            },
            {   //5
                header: "Almost at 21",
                text: <span>You have 20. Press <span className="text-black">Stand</span> to end your turn and see what the dealer has</span>,
                spaceHeight: 310,
            },
            {   //6
                header: "Dealer's turn",
                text: <span>The dealer will keep drawing cards until their total is <span className="text-black"> at least 17</span></span>,
                spaceHeight: 310,
            },
            {   //7
                header: "Place another bet",
                text: '',
                spaceHeight: 310,
            },
            {   //8
                header: "Blackjack!",
                text: <span>Blackjack is when you have 21 with two cards. <span className="text-black">You win 2.5x your bet</span> (unless the dealer gets Blackjack too)</span>,
                spaceHeight: 310,
            },
            {   //9
                header: "Select $15 to bet",
                text: <span>Remember, you can <span className="text-black">Reset</span> the bet amount</span>,
                spaceHeight: 310,
            },
            {   //10
                header: "Double Down",
                text: "Doubling down will end your turn but with double your bet",
                spaceHeight: 310,
            },
            {   //11
                header: "Push (Tie Game)",
                text: "If your hand and the dealer's hand are the same, you don’t win or lose",
                spaceHeight: 310,
            },
            {   //12
                header: "Bet strategically",
                text: "Save enough in your balance to split or double down on your next hand",
                spaceHeight: 310,
            },
            {   //13
                header: "Splitting Pairs",
                text: <span>With two identical cards, you can <span className="text-black">Split</span> them into 2 hands and double your bet</span>,
                spaceHeight: 310,
            },
            {   //14
                header: "Split Hands",
                text: "Each hand is played separately. Splitting can sometimes help you win!",
                spaceHeight: 310,
            },

        ]

        const selectBet = () => {
            return (
                <div className="flex flex-col w-full h-full justify-end items-center">
                    <div
                        className="flex flex-col w-full justify-start items-center bg-[#57A351] text-white rounded px-6 py-8">

                        <div
                            className="flex flex-row w-full items-center justify-center text-center text-2xl font-bold pb-1 tracking-tighter">
                            {pages[TutorialState].header}
                        </div>
                        <div
                            className="flex flex-row w-full justify-center items-start text-center text-sm font-semibold pb-2">
                            {pages[TutorialState].text}
                        </div>
                        <div className={`h-[${pages[TutorialState].spaceHeight}px]`}/>
                    </div>
                </div>
            )
        }

        const annotations = () => {
            let content;

            switch (TutorialState) {
                case 2:
                    // case 2:
                    content =
                        // <div className="flex flex-col h-full items-center justify-start w-[95%] h-[350px] bg-[#57A351] text-white rounded px-6 py-8">
                        <>
                            <div className={`absolute flex flex-row justify-end items-start top-16 right-32 text-white`}>
                                <Arrow1 className="size-12 max-w-sm max-h-sm -rotate-[10deg]"/>
                            </div>
                            <div
                                className={`absolute text-xs text-white font-bold flex flex-row justify-end items-start top-[115px] right-[140px] font-tech`}>
                                Your balance
                            </div>
                        </>
                    break
                case 4:
                    // case 2:
                    content =
                        // <div className="flex flex-col h-full items-center justify-start w-[95%] h-[350px] bg-[#57A351] text-white rounded px-6 py-8">
                        // <div className="w-[350px] h-[500px] -mt-[20px] z-50">
                        <div className="z-50">
                            <div className={`absolute flex flex-row justify-end items-start ml-[50px] mt-[80px]`}>
                                <Arrow1 className="size-12 max-w-sm max-h-sm -rotate-[190deg]"/>
                            </div>
                            <div
                                className={`absolute text-xs text-black font-bold flex flex-row justify-end items-center ml-[70px] mt-[60px] font-tech`}>
                                Your hand
                            </div>
                            <div className={`absolute flex flex-row justify-end items-start ml-[55px] -mt-[115px]`}>
                                <Arrow2 className="size-14 max-w-sm max-h-sm"/>
                            </div>
                            <div
                                className={`absolute text-xs text-black font-bold flex flex-row justify-end items-center ml-[70px] -mt-[70px] font-tech`}>
                                Dealer's hand
                            </div>
                        </div>
                    break
                default:
                    content =
                        <></>
                    break
            }

            return (
                content
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
                    className="absolute flex items-center justify-center h-screen w-screen overflow-hidden"
                    // className={`flex flex-col justify-center items-center -mb-[80px] left-0 right-0 z-10 space-y-4 transition-transform duration-500 ease-in-out z-10 ${isExpanded ? 'transform -translate-y-[10vh]' : 'transform translate-y-full'}`}
                >
                    {annotations()}
                    <div
                        className="absolute flex flex-col space-y-4 items-center justify-center h-screen w-screen overflow-hidden">
                        <div
                            className="relative w-[350px] overflow-hidden flex flex-col justify-center items-center">
                            <div className="w-full h-full flex transition-transform items-end duration-500 space-x-4"
                                 style={{transform: `translateX(calc(-1 * (${TutorialState <= 2 ? (TutorialState * 104.5) : (2 * 104.5)}%)))`}}>
                                {Array.from({length: tutorialPages.length}, (_, index) => (
                                    <div key={index}
                                         className="w-full h-[500px] flex-shrink-0 flex justify-center items-end font-tech">
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
                                    // onClick={() => setCurrentPage(index)}
                                />
                            ))}
                        </div>
                        <div className="flex flex-row justify-end w-[350px] h-[90px] px-2 z-50">
                            {(nextButtonText[TutorialState] === "Next" || nextButtonText[TutorialState] === "Back") &&
                            <button
                                onClick={() => {
                                    // console.log("next clicked")
                                    nextButtonText[TutorialState] === "Next" ? setTutorialState(TutorialState + 1) : setTutorialState(TutorialState - 1)
                                }}
                                className="btn btn-sm text-base font-tech font-bold z-20 rounded">{nextButtonText[TutorialState]}
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