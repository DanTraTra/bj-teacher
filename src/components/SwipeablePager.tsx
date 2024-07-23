import React, {useEffect, useState} from 'react';
import {useSwipeable} from 'react-swipeable';
import 'tailwindcss/tailwind.css';
import CheatSheet, {action2iconDict, cheatSheetDataLogic, CheatSheetProps, getTableIndex} from "./CheatSheet";
import {AiOutlineClose, AiOutlineUp} from "react-icons/ai";
import {CardProps} from "./PlayingCard";
import {initializeCard, PlayerHandProps} from "./MainContent";
import {Simulate} from "react-dom/test-utils";
import doubleClick = Simulate.doubleClick;
import {BiChevronUp} from "react-icons/bi";

type Action = "HIT" | "DD" | "SPLIT" | "STAND";

export interface SwipeablePagerProps {
    playerHand: CardProps[] | null;
    dealerHand: CardProps | null;
    split_available: boolean;
    dd_available: boolean;
    onClose: () => void;
}

const SwipeablePopup: React.FC<SwipeablePagerProps> = ({
                                                           playerHand,
                                                           dealerHand,
                                                           split_available,
                                                           dd_available,
                                                           onClose
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

    const [currentPage, setCurrentPage] = useState(tableIndex);
    const [isExpanded, setIsExpanded] = useState(false)
    const handlers = useSwipeable({
        onSwipedUp: () => setIsExpanded(true),
        onSwipedDown: () => setIsExpanded(false),
        onSwipedLeft: () => setCurrentPage((prev) => (prev + 1) % 3),
        onSwipedRight: () => setCurrentPage((prev) => (prev - 1 + 3) % 3),
    });

    const handleHeaderClick = () => {
        setIsExpanded(!isExpanded);
    };

    useEffect(() => {
        // let index = playerHand && dealerHand ? getTableIndex(playerHand, dealerHand, dd_available, split_available) : {
        //     playerHandIndex: 0,
        //     dealerHandIndex: 0,
        //     tableIndex: 0
        // }
        // console.log("index", index)
        setCurrentPage(tableIndex)
    }, [tableIndex])

    return (
        <>
            <div
                className={`fixed inset-0 bg-black transition-opacity duration-500 ${isExpanded ? 'opacity-80' : 'opacity-0 pointer-events-none'}`}
            />
            <div
                className={`fixed bottom-[45px] left-0 right-0 transition-transform duration-500 ease-in-out ${isExpanded ? 'transform -translate-y-[10vh]' : 'transform translate-y-full'} flex flex-col items-center`}
                {...handlers}
            >
                <div
                    className="w-[350px] flex flex-row items-center justify-between bg-white px-4 pt-2 pb-1 rounded-t-lg font-tech relative"
                    onClick={handleHeaderClick}>
                    <div/>
                    <span className="text-lg font-bold">Cheat Sheet</span>
                    {isExpanded ? <AiOutlineClose onClick={() => onClose()}/> :
                        <AiOutlineUp onClick={() => setIsExpanded(true)}/>}
                </div>
                {dealerHand && playerHand &&
                <div
                    className="w-[350px] flex flex-row items-center justify-center bg-white px-4 pt-1 pb-2 mb-2 font-tech relative"
                >
                    <span
                        className="text-sm">{`${playerHand.reduce((acc, card) => card.value + acc, 0)} plays ${dealerHand.display == 'A' || dealerHand.display == '8' ? "an" : "a"} ${dealerHand.display == "A" ? "Ace" : dealerHand.display == "J" ? "Jack" : dealerHand.display == "K" ? "King" : dealerHand.display == "Q" ? "Queen" : dealerHand.display } - you should ${playerHand && dealerHand && (cheatSheetDataLogic(playerHand, dealerHand, dd_available, split_available).split('/').join(' then '))}`}</span>
                </div>
                }
                <div
                    className="relative w-[350px] overflow-hidden flex justify-center items-center mt-0">
                    <div className="w-full h-full flex transition-transform items-center duration-500 space-x-4"
                         style={{transform: `translateX(calc(-1 * (${currentPage * 104.5}%)))`}}>
                        {Array.from({length: 3}, (_, index) => (
                            <div key={index} className="w-[100%] h-full flex-shrink-0 flex justify-center items-center">
                                <CheatSheet playerHand={playerHand} dealerHand={dealerHand} dd_available={dd_available}
                                            split_available={split_available} table_number={index}/>
                            </div>
                        ))}
                    </div>
                </div>

                <div
                    className="flex flex-row w-[350px] justify-center bg-white p-2 rounded-b-lg mt-2 space-x-2 overflow-x-auto">
                    {/*<div className="flex space-x-2">*/}
                    <div className="flex flex-row text-white btn btn-xs btn-error -space-x-1 pl-1">
                        <div>{action2iconDict['STAND']}</div>
                        <span>Stand</span>
                    </div>
                    <div className="flex flex-row text-white btn btn-xs btn-success -space-x-1 pl-1">
                        <div>{action2iconDict['HIT']}</div>
                        <span>Hit</span>
                    </div>
                    {/*</div>*/}
                    {/*<div className="flex space-x-2">*/}
                    <div className="flex flex-row text-white btn btn-xs btn-warning -space-x-1 pl-1">
                        <div>{action2iconDict['DD/STAND']}</div>
                        <span>Double Down</span>
                    </div>
                    <div className="flex flex-row text-white btn btn-xs btn-neutral -space-x-1 pl-1">
                        <div>{action2iconDict['SPLIT/HIT']}</div>
                        <span>Split</span>
                    </div>
                    {/*</div>*/}
                </div>

                <div className="flex justify-center mt-4">
                    {Array.from({length: 3}, (_, index) => (
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
};

export default SwipeablePopup;
