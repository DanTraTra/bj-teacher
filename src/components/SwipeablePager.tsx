import React, {forwardRef, useEffect, useRef, useState} from 'react';
import {useSwipeable} from 'react-swipeable';
import 'tailwindcss/tailwind.css';
import CheatSheet, {action2iconDict, cheatSheetDataLogic, CheatSheetProps, getTableIndex} from "./CheatSheet";
import {AiOutlineClose, AiOutlineUp} from "react-icons/ai";
import {CardProps, PlayingCard} from "./PlayingCard";
import {animationTime, GameOutComeType, initializeCard, initializeSpecificHand, PlayerHandProps} from "./MainContent";
import {Simulate} from "react-dom/test-utils";
import doubleClick = Simulate.doubleClick;
import {BiChevronUp} from "react-icons/bi";
// @ts-ignore
import HIGH from "/src/assets/HIGH.svg?react"
// @ts-ignore
import MID from "/src/assets/MID.svg?react"
// @ts-ignore
import LOW from "/src/assets/LOW.svg?react"

type Action = "HIT" | "DD" | "SPLIT" | "STAND";

export interface SwipeablePagerProps {
    playerHand: CardProps[] | null;
    dealerHand: CardProps | null;
    split_available: boolean;
    dd_available: boolean;
    peaking: boolean;
    onOpen: () => void;
    GameState: GameOutComeType;
}

const SwipeablePopup: React.FC<SwipeablePagerProps> = ({
                                                           playerHand,
                                                           dealerHand,
                                                           split_available,
                                                           dd_available,
                                                           peaking,
                                                           onOpen,
                                                           GameState
                                                       }) => {
        let {
            playerHandIndex,
            dealerHandIndex,
            tableIndex
        } = playerHand && dealerHand ? getTableIndex(playerHand, dealerHand, dd_available, split_available) : {
            playerHandIndex: 0,
            dealerHandIndex: 0,
            tableIndex: 0
        }
        // // console.log("peaking", peaking)
        const cheatSheetBGRef = useRef<HTMLDivElement>(null);

        const [currentPage, setCurrentPage] = useState(tableIndex);
        // const [isPeaking, setIsPeaking] = useState(peaking)
        const [isExpanded, setIsExpanded] = useState(false)
        const handlers = useSwipeable({
            onSwipedUp: () => setIsExpanded(true),
            onSwipedDown: () => setIsExpanded(false),
            onSwipedLeft: () => setCurrentPage((prev) => (prev + 1) % 4),
            onSwipedRight: () => setCurrentPage((prev) => (prev - 1 + 4) % 4),
        });

        const handleHeaderClick = () => {
            setIsExpanded(!isExpanded);
            onOpen()
        };

        const handleCheatSheet = (event: MouseEvent) => {
            if (cheatSheetBGRef.current && cheatSheetBGRef.current.contains(event.target as Node)) {
                setIsExpanded(false);
            }
        };

        const action2Button: Record<string, React.ReactElement> = {
            'STAND': <div className="flex flex-row text-white btn btn-xs btn-error -space-x-1 pl-1">
                <div>{action2iconDict['STAND']}</div>
                <span>Stand</span>
            </div>,
            'HIT': <div className="flex flex-row text-white btn btn-xs btn-success -space-x-1 pl-1">
                <div>{action2iconDict['HIT']}</div>
                <span>Hit</span>
            </div>,
            'DD/STAND': <div className="flex flex-row text-white btn btn-xs btn-warning -space-x-1 pl-1">
                <div>{action2iconDict['DD/STAND']}</div>
                <span>Double Down</span>
            </div>,
            'SPLIT/HIT': <div className="flex flex-row text-white btn btn-xs btn-neutral -space-x-1 pl-1">
                <div>{action2iconDict['SPLIT/HIT']}</div>
                <span>Split</span>
            </div>,
            'DD': <div className="flex flex-row text-white btn btn-xs btn-warning -space-x-1 pl-1">
                <div>{action2iconDict['DD/STAND']}</div>
                <span>Double Down</span>
            </div>,
            'SPLIT': <div className="flex flex-row text-white btn btn-xs btn-neutral -space-x-1 pl-1">
                <div>{action2iconDict['SPLIT/HIT']}</div>
                <span>Split</span>
            </div>
        }

        useEffect(() => {
            document.addEventListener('mousedown', handleCheatSheet);

            return () => {
                document.removeEventListener('mousedown', handleCheatSheet);

            };
        }, []);

        useEffect(() => {
            setCurrentPage(tableIndex + 1)
        }, [tableIndex])

        useEffect(() => {
            if (["CARD COUNT QUIZ", "PLACING BET"].includes(GameState)) {
                setCurrentPage(0)
            } else {
                setCurrentPage(tableIndex + 1)
            }
        }, [GameState])

        function CardCountingInfo() {
            const lowCards = initializeSpecificHand([2, 3, 4, 5, 6])
            const midCards = initializeSpecificHand([7, 8, 9])
            const highCards = initializeSpecificHand([10, 11, 12, 13, 1])

            return <div
                className="w-[100%] h-full flex-shrink-0 flex flex-col justify-center items-start px-6 bg-[#57A351] py-4 mt-2">

                <div className="text-white text-xl font-semibold pb-1">How to Count Cards:</div>
                <div className="text-white text-sm pb-1">Begin count at 0 when the game starts or the deck is shuffled.
                    Adjust bets accordingly
                </div>
                {/*<div className="bg-white h-0.5 w-full rounded my-1"/>*/}
                <div className="flex flex-row w-full justify-between pt-2 space-x-4">
                    <div className="flex flex-col items-start pt-2 pb-1 px-3 rounded bg-accent/20">
                        <div className="text-white text-sm font-semibold">Low Cards</div>
                        <div className="flex flex-row inline-flex justify-center scale-75 -ml-0.5 -my-2 ">
                            {lowCards.map((card, index) =>
                                (
                                    <PlayingCard
                                        key={`${card.suit}-${card.value}-${index}`}
                                        value={card.value}
                                        display={card.display}
                                        suit={card.suit}
                                        visible={true}
                                    />
                                )
                            )
                            }
                        </div>
                        <div className="flex flex-row text-white font-semibold pt-1">
                            <div className="text-[24pt]">+1</div>
                            <div className="text-sm leading-none pt-2.5 pl-2">to the <br/>count</div>
                        </div>
                    </div>
                    <div className="flex flex-col items-start pt-2 pb-1 px-3 rounded bg-accent/20">
                        <div className="text-white text-sm font-semibold">High Cards</div>
                        <div className="flex flex-row inline-flex justify-center scale-75 -ml-0.5 -my-2 ">
                            {highCards.map((card, index) =>
                                (
                                    <PlayingCard
                                        key={`${card.suit}-${card.value}-${index}`}
                                        value={card.value}
                                        display={card.display}
                                        suit={card.suit}
                                        visible={true}
                                    />
                                )
                            )
                            }
                        </div>
                        <div className="flex flex-row text-white font-semibold pt-1">
                            <div className="text-[24pt]">-1</div>
                            <div className="text-sm leading-none pt-2.5 pl-2">from the <br/>count</div>
                        </div>
                    </div>
                </div>
                <div className="text-sm text-white pt-4 leading-none">When the count is:</div>
                <div className="flex flex-row w-full justify-between pt-2">
                    <div className="flex flex-col py-2 px-3 bg-gray-900/30 rounded">
                        <div className="flex flex-col">
                            <div className="text-white text-sm font-semibold">0 or less</div>
                        </div>
                        <div className="flex flex-row justify-center space-x-1 pt-1">
                            <div className="flex flex-col justify-center">
                                <LOW className="w-full h-full transform"/>
                            </div>
                            <div className="flex flex-col justify-center text-white text-sm leading-none pl-1">Bet <br/>Low
                            </div>

                        </div>
                    </div>
                    <div className="flex flex-col py-2 px-3 bg-gray-900/30 rounded">
                        <div className="flex flex-col">
                            <div className="text-white text-sm font-semibold">1 or 2</div>
                        </div>
                        <div className="flex flex-row justify-center space-x-1 pt-1">
                            <div className="flex flex-col justify-center">
                                <MID className="w-full h-full transform"/>
                            </div>
                            <div className="flex flex-col justify-center text-white text-sm leading-none pl-1">Bet <br/>Mid
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col py-2 px-3 bg-gray-900/30 rounded">
                        <div className="flex flex-col">
                            <div className="text-white text-sm font-semibold">3 or more</div>
                        </div>
                        <div className="flex flex-row justify-center space-x-1 pt-1">
                            <div className="flex flex-col justify-center">
                                <HIGH className="w-full h-full transform"/>
                            </div>
                            <div className="flex flex-col justify-center text-white text-sm leading-none pl-1">Bet <br/>High
                            </div>
                        </div>
                    </div>
                </div>
            </div>;
        }

        function getActionButtonLegend() {
            return <>
                <div className="flex flex-row text-white btn btn-xs btn-error -space-x-1 pl-1">
                    <div>{action2iconDict['STAND']}</div>
                    <span>Stand</span>
                </div>
                <div className="flex flex-row text-white btn btn-xs btn-success -space-x-1 pl-1">
                    <div>{action2iconDict['HIT']}</div>
                    <span>Hit</span>
                </div>
                <div className="flex flex-row text-white btn btn-xs btn-warning -space-x-1 pl-1">
                    <div>{action2iconDict['DD/STAND']}</div>
                    <span>Double Down</span>
                </div>
                <div className="flex flex-row text-white btn btn-xs btn-neutral -space-x-1 pl-1">
                    <div>{action2iconDict['SPLIT/HIT']}</div>
                    <span>Split</span>
                </div>
            </>;
        }

        return (
            <>
                <div ref={cheatSheetBGRef}
                     className={`fixed inset-0 bg-black transition-opacity duration-500 ${isExpanded ? 'opacity-80' : peaking ? 'opacity-80' : 'opacity-0 pointer-events-none'}`}
                />
                <div
                    className={`fixed bottom-[40px] left-0 right-0 transition-transform duration-500 ease-in-out ${isExpanded ? 'transform -translate-y-[10vh]' : 'transform translate-y-full'} flex flex-col items-center`}
                    {...handlers}
                >
                    <div
                        className={` transition-transform duration-500 ease-in-out ${peaking ? 'transform -translate-y-[10vh]' : ''}`}>
                        <div
                            className="w-[350px] flex flex-row items-center justify-between bg-white px-4 pt-2 pb-1 rounded-t-lg font-tech relative"
                            onClick={handleHeaderClick}>
                            <div/>
                            <span className="text-lg font-bold">Cheat Sheet</span>
                            {isExpanded ? <AiOutlineClose onClick={() => setIsExpanded(false)}/> :
                                <AiOutlineUp onClick={() => setIsExpanded(true)}/>}
                        </div>
                        {dealerHand && playerHand && currentPage != 0 &&
                        <div
                            className={`w-[350px] flex flex-row items-center justify-center bg-white px-4 py-2 font-tech relative`}
                        >
                    <span
                        className="text-sm">{`${playerHand.reduce((acc, card) => card.value + acc, 0)} plays ${dealerHand.display == 'A' || dealerHand.display == '8' ? "an" : "a"} ${dealerHand.display == "A" ? "Ace" : dealerHand.display == "J" ? "Jack" : dealerHand.display == "K" ? "King" : dealerHand.display == "Q" ? "Queen" : dealerHand.display} you should:`}</span>
                            <div
                                className="flex flex-row space-x-2 px-2">{action2Button[cheatSheetDataLogic(playerHand, dealerHand, dd_available, split_available).split('/')[0]]}</div>
                        </div>
                        }
                    </div>
                    <div
                        className="relative w-[350px] overflow-hidden flex justify-center items-center">
                        <div className="w-full h-full flex transition-transform items-center duration-500 space-x-4"
                             style={{transform: `translateX(calc(-1 * (${currentPage * 104.5}%)))`}}>
                            {CardCountingInfo()}
                            {Array.from({length: 3}, (_, index) => (
                                <div key={index}
                                     className="w-[100%] h-full flex-shrink-0 flex justify-center items-center">
                                    <CheatSheet playerHand={playerHand} dealerHand={dealerHand}
                                                dd_available={dd_available}
                                                split_available={split_available} table_number={index}/>
                                </div>
                            ))}
                            {CardCountingInfo()}
                        </div>
                    </div>
                    <div
                        className="flex flex-row w-[350px] justify-center bg-white p-2 rounded-b-lg mt-2 space-x-2 overflow-x-auto">
                        {currentPage == 0 ?
                            <div className="flex flex-row justify-center px-4 w-full">
                                <div
                                    className="flex flex-row w-full h-6 justify-between items-center text-gray-800 bg-white p-0 text-xs font-bold">
                                    When casinos use multiple decks: <div className="flex flex-col justify-center -my-2">
                                    <span className="text-[10px] text-center">count </span>
                                    <div className="bg-gray-800 w-full h-[1.5px]"/>
                                    <span className="text-[10px] text-center">number of decks</span></div>
                                </div>

                                {/*<div className="text-whi*/}
                                {/*te btn btn-xs bg-gray-200 px-3">*/}
                                {/*    {"# Decks: 1"}*/}
                                {/*</div>*/}
                                {/*<div className="text-white btn btn-xs bg-success/70 px-2">*/}
                                {/*    {"Count > 3+: Bet High"}*/}
                                {/*</div>*/}
                            </div>
                            :
                            getActionButtonLegend()}
                    </div>

                    <div className="flex justify-center mt-4">
                        {Array.from({length: 4}, (_, index) => (
                            <div
                                key={index}
                                className={`h-2 w-2 mx-1 rounded-full ${currentPage === index ? 'bg-white' : 'bg-gray-400'}`}
                                onClick={() => setCurrentPage(index)}
                            />
                        ))}
                    </div>

                </div>
            </>
        );
    }
;

export default SwipeablePopup;
