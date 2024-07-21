import React, {useState, useEffect} from 'react';
import {GameLog, initializeDeck, initializeCard} from './MainContent';
import supabase from '../services/supabaseClient';
import {Accordion} from 'flowbite';
import type {AccordionOptions, AccordionItem, AccordionInterface} from 'flowbite';
import PerformanceGraph from "./PerformanceGraph";
import {AiFillCaretLeft, AiOutlineDown, AiOutlineUp, AiOutlineLineChart, AiOutlineLeft} from 'react-icons/ai'; // Import icons
import {CardProps} from './PlayingCard';
import {PlayerHandProps} from "./MainContent";
import {Simulate} from "react-dom/test-utils";
import doubleClick = Simulate.doubleClick;


type Action = 'HIT' | 'STAND' | 'SPLIT/HIT' | 'SPLIT/STAND' | 'DD/HIT' | 'DD/STAND';
const icon_size = 'size-4 ';
const td_class = "p-0 flex justify-center items-center text-gray-700 whitespace-nowrap";
export const action2iconDict: Record<Action, JSX.Element> = {
    'HIT': (
        <td className={td_class}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className={icon_size}>
            <path
                fillRule="evenodd"
                d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 9a.75.75 0 0 0-1.5 0v2.25H9a.75.75 0 0 0 0 1.5h2.25V15a.75.75 0 0 0 1.5 0v-2.25H15a.75.75 0 0 0 0-1.5h-2.25V9Z"
                clipRule="evenodd"
            />
        </svg>
        </td>
    ),
    'STAND': (
        <td className={td_class}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className={icon_size}>
            <path
                fillRule="evenodd"
                d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm3 10.5a.75.75 0 0 0 0-1.5H9a.75.75 0 0 0 0 1.5h6Z"
                clipRule="evenodd"
            />
        </svg>
        </td>
    ),
    'SPLIT/HIT': (
        <td className={td_class}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className={icon_size}>
            <path
                fillRule="evenodd"
                d="M15.97 2.47a.75.75 0 0 1 1.06 0l4.5 4.5a.75.75 0 0 1 0 1.06l-4.5 4.5a.75.75 0 1 1-1.06-1.06l3.22-3.22H7.5a.75.75 0 0 1 0-1.5h11.69l-3.22-3.22a.75.75 0 0 1 0-1.06Zm-7.94 9a.75.75 0 0 1 0 1.06l-3.22 3.22H16.5a.75.75 0 0 1 0 1.5H4.81l3.22 3.22a.75.75 0 1 1-1.06 1.06l-4.5-4.5a.75.75 0 0 1 0-1.06l4.5-4.5a.75.75 0 0 1 1.06 0Z"
                clipRule="evenodd"
            />
        </svg>
        </td>
    ),
    'SPLIT/STAND': (
        <td className={td_class}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className={icon_size}>
            <path
                fillRule="evenodd"
                d="M15.97 2.47a.75.75 0 0 1 1.06 0l4.5 4.5a.75.75 0 0 1 0 1.06l-4.5 4.5a.75.75 0 1 1-1.06-1.06l3.22-3.22H7.5a.75.75 0 0 1 0-1.5h11.69l-3.22-3.22a.75.75 0 0 1 0-1.06Zm-7.94 9a.75.75 0 0 1 0 1.06l-3.22 3.22H16.5a.75.75 0 0 1 0 1.5H4.81l3.22 3.22a.75.75 0 1 1-1.06 1.06l-4.5-4.5a.75.75 0 0 1 0-1.06l4.5-4.5a.75.75 0 0 1 1.06 0Z"
                clipRule="evenodd"
            />
        </svg>
        </td>
    ),
    'DD/HIT': (
        <td className={td_class}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className={icon_size}>
            <path
                d="M16.5 6a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3v7.5a3 3 0 0 0 3 3v-6A4.5 4.5 0 0 1 10.5 6h6Z"
            />
            <path
                d="M18 7.5a3 3 0 0 1 3 3V18a3 3 0 0 1-3 3h-7.5a3 3 0 0 1-3-3v-7.5a3 3 0 0 1 3-3H18Z"
            />
        </svg>
        </td>
    ),
    'DD/STAND': (
        <td className={td_class}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className={icon_size}>
            <path
                d="M16.5 6a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3v7.5a3 3 0 0 0 3 3v-6A4.5 4.5 0 0 1 10.5 6h6Z"
            />
            <path
                d="M18 7.5a3 3 0 0 1 3 3V18a3 3 0 0 1-3 3h-7.5a3 3 0 0 1-3-3v-7.5a3 3 0 0 1 3-3H18Z"
            />
        </svg>
        </td>
    )
};

export interface CheatSheetProps {
    playerHand: CardProps[] | null,
    dealerHand: CardProps | null,
    dd_available: boolean,
    split_available: boolean,
    table_number: number;
}

interface TableIndex {
    playerHandIndex: number;
    dealerHandIndex: number;
    tableIndex: number;
}

export const getTableIndex = (playerCards: CardProps[], dealerCard: CardProps, DD: boolean, split: boolean): TableIndex => {

    const playerHandSum = playerCards.reduce((acc, card) => acc + card.value, 0);
    let index: TableIndex = {
        playerHandIndex: 0,
        dealerHandIndex: 0,
        tableIndex: 0,
    }

    index["dealerHandIndex"] = dealerCard.display === 'A' ? 0 : dealerCard.value - 1

    if (playerCards.length == 2) {
        if (playerCards[0].display === playerCards[1].display) {
            //    Doubles
            index["tableIndex"] = 1
            if (playerCards[0].display === 'A') {
                index["playerHandIndex"] = 0
            } else {
                index["playerHandIndex"] = playerCards[0].value > 10 ? 9 : playerCards[0].value - 1
            }
            return index

        } else if (playerCards[0].display === 'A' || playerCards[1].display == 'A') {
            //    Ace in hand
            index["tableIndex"] = 2
            index["playerHandIndex"] = playerCards[0].display == 'A' ? playerCards[1].value - 2 : playerCards[0].value - 2
            index["playerHandIndex"] = index["playerHandIndex"] > 6 ? 6 : index["playerHandIndex"]
            return index
        }
    }

    if (playerHandSum < 8) {
        index["playerHandIndex"] = 0
    } else if (playerHandSum > 17) {
        index["playerHandIndex"] = 9
    } else {
        index["playerHandIndex"] = playerHandSum - 8
    }
    index["tableIndex"] = 0
    return index
}

const CheatSheet: React.FC<CheatSheetProps> = ({
                                                   playerHand,
                                                   dealerHand,
                                                   dd_available,
                                                   split_available,
                                                   table_number
                                               }) => {
    const deck = initializeDeck(1);
    deck.splice(10);
    // console.log("deck", deck);

    const rowHeader: string[] = [];
    // Generate all possible player hands
    const allPossiblePlayerHands: CardProps[][] = [];

    switch (table_number) {
        case 0:
            for (let i = 2; i <= 5; i++) {
                allPossiblePlayerHands.push([initializeCard(6, 'spades', false), initializeCard(i, 'spades', false)]);
                rowHeader.push(`${6 + i}`);
            }
            rowHeader[0] = '5-8';
            for (let i = 3; i <= 8; i++) {
                allPossiblePlayerHands.push([initializeCard(9, 'spades', false), initializeCard(i, 'spades', false)]);
                rowHeader.push(`${9 + i}`);
            }
            rowHeader[allPossiblePlayerHands.length - 1] = '17+';
            break
        case 1:
            for (let i = 1; i <= 10; i++) {
                allPossiblePlayerHands.push([initializeCard(i, 'spades', false), initializeCard(i, 'spades', false)]);
                rowHeader.push(`${i},${i}`);
            }
            rowHeader[allPossiblePlayerHands.length - 10] = 'A,A';
            break
        case 2:
            for (let i = 2; i <= 8; i++) {
                allPossiblePlayerHands.push([initializeCard(1, 'spades', false), initializeCard(i, 'spades', false)]);
                rowHeader.push(`A,${i}`);
            }
            rowHeader[allPossiblePlayerHands.length - 1] = 'A,8-9';
            break
    }
    const allPossibleDealerHands: CardProps[] = [];

    for (let i = 2; i <= 11; i++) {
        allPossibleDealerHands.push(initializeCard(i, 'spades', false));
    }

    // console.log('card', initializeCard(11 > 10 ? 11 % 10 : 0, 'spades', false));
    //
    // console.log("allPossiblePlayerHands", allPossiblePlayerHands);
    // console.log("allPossibleDealerHands", allPossibleDealerHands);

    const cheatSheetDataLogic = (playerCards: CardProps[], dealerCard: CardProps, DD: boolean, split: boolean): Action => {
        const playerHandSum = playerCards.reduce((acc, card) => acc + card.value, 0);

        if (playerCards.length == 2) {
            if (playerCards[0].display == playerCards[1].display) {
                //    Doubles
                switch (playerHandSum) {
                    case 4:
                        return split && dealerCard.value >= 2 && dealerCard.value <= 7 ? 'SPLIT/HIT' : 'HIT';
                    case 6:
                        return split && dealerCard.value >= 2 && dealerCard.value <= 7 ? 'SPLIT/HIT' : 'HIT';
                    case 8:
                        return 'HIT';
                    case 10:
                        return DD && dealerCard.value >= 2 && dealerCard.value <= 9 ? 'DD/HIT' : 'HIT';
                    case 12:
                        return split && dealerCard.value == 1 ? 'HIT' :
                            split && dealerCard.value >= 3 && dealerCard.value <= 3 ? 'SPLIT/HIT' :
                                split && dealerCard.value >= 4 && dealerCard.value <= 6 ? 'SPLIT/STAND' :
                                    'HIT';
                    case 14:
                        return split && dealerCard.value == 1 ? 'HIT' :
                            split && dealerCard.value >= 2 && dealerCard.value <= 6 ? ('SPLIT/STAND') :
                                split && dealerCard.value == 7 ? 'SPLIT/HIT'
                                    : 'HIT';
                    case 16:
                        return split && dealerCard.value == 1 ? 'HIT' :
                            split && dealerCard.value >= 2 && dealerCard.value <= 6 ? 'SPLIT/STAND'
                                : 'SPLIT/HIT';

                    case 18:
                        return split && dealerCard.value >= 2 && dealerCard.value <= 6 ? ('SPLIT/STAND') :
                            split && dealerCard.value == 7 ? 'STAND' :
                                split && dealerCard.value >= 8 && dealerCard.value <= 9 ? ('SPLIT/STAND') : 'STAND';
                    case 20:
                        return 'STAND';
                    case 22:
                        return split && dealerCard.value >= 4 && dealerCard.value <= 6 ? 'SPLIT/STAND' : 'SPLIT/HIT';
                    default:
                        break;
                }
            } else if (playerCards[0].display == 'A' || playerCards[1].display == 'A') {
                //    Ace in hand
                switch (playerHandSum) {
                    case 13:
                        return DD && dealerCard.value >= 5 && dealerCard.value <= 6 ? 'DD/HIT' : 'HIT';
                    case 14:
                        return DD && dealerCard.value >= 5 && dealerCard.value <= 6 ? 'DD/HIT' : 'HIT';
                    case 15:
                        return DD && dealerCard.value >= 4 && dealerCard.value <= 6 ? 'DD/HIT' : 'HIT';
                    case 16:
                        return DD && dealerCard.value >= 4 && dealerCard.value <= 6 ? 'DD/HIT' : 'HIT';
                    case 17:
                        return DD && dealerCard.value >= 3 && dealerCard.value <= 6 ? 'DD/HIT' : 'HIT';
                    case 18:
                        return dealerCard.value >= 2 && dealerCard.value <= 8 ? DD && dealerCard.value >= 3 && dealerCard.value <= 6 ? 'DD/STAND' : 'STAND' : 'HIT';
                    case 19:
                        return 'STAND';
                    case 20:
                        return 'STAND';
                    default:
                        break;
                }
            }
        }

        switch (playerHandSum) {
            case 3:
                return 'HIT';
            case 4:
                return 'HIT';
            case 5:
                return 'HIT';
            case 6:
                return 'HIT';
            case 7:
                return 'HIT';
            case 8:
                return 'HIT';
            case 9:
                return DD && dealerCard.value >= 3 && dealerCard.value <= 6 ? 'DD/HIT' : 'HIT';
            case 10:
                return DD && dealerCard.value >= 2 && dealerCard.value <= 9 ? 'DD/HIT' : 'HIT';
            case 11:
                return DD ? 'DD/HIT' : 'HIT';
            case 12:
                return dealerCard.value >= 4 && dealerCard.value <= 6 ? 'STAND' : 'HIT';
            case 13:
                return dealerCard.value >= 2 && dealerCard.value <= 6 ? 'STAND' : 'HIT';
            case 14:
                return dealerCard.value >= 2 && dealerCard.value <= 6 ? 'STAND' : 'HIT';
            case 15:
                return dealerCard.value >= 2 && dealerCard.value <= 6 ? 'STAND' : 'HIT';
            case 16:
                return dealerCard.value >= 2 && dealerCard.value <= 6 ? 'STAND' : 'HIT';
            case 17:
                return 'STAND';
            case 18:
                return 'STAND';
            case 19:
                return 'STAND';
            default:
                return 'STAND';
        }
        // Default return if no conditions are met
        return 'STAND';
    };

    let highlightIndex: TableIndex = {playerHandIndex: 0, dealerHandIndex: 0, tableIndex: 0}

    if (playerHand && dealerHand) {
        highlightIndex = getTableIndex(playerHand, dealerHand, dd_available, split_available)
        console.log("tableIndex", getTableIndex(playerHand, dealerHand, dd_available, split_available))
    }
    console.log("highlightIndex", highlightIndex)
    console.log("dealerHand && playerHand", !!(dealerHand && playerHand))

    const rowClass = "px-2 py-1 w-sm text-center text-sm font-sm font-tech bg-gray-100 border-l border-t border-accent-content/30 ";
    return (
        <div className="font-tech">
            <table className="table-auto table-xs font-tech w-[350px]">
                <thead>
                <tr>
                    <th className="bg-transparent"/>
                    <th className="bg-transparent"/>
                    <th className="text-sm pt-2 pb-1 bg-gray-100" colSpan={10}>Dealer's Card</th>
                </tr>
                </thead>
                <thead>
                <tr>
                    <th className="pb-0 bg-transparent"/>
                    <th className="pb-0 bg-transparent"/>
                    {allPossibleDealerHands.map((card, index) => (
                        <th key={index}
                            className={`${rowClass} ${playerHand && dealerHand && table_number == highlightIndex["tableIndex"] ? index == highlightIndex["dealerHandIndex"] ? "text-white bg-gray-400" : "text-gray-300" : "text-gray-700"}`}>{card.display}</th>
                    ))}
                </tr>
                </thead>
                <tbody className="bg-white">
                {allPossiblePlayerHands.map((hand, rowIndex) => (

                    <tr key={rowIndex} className={"cursor-pointer " + (rowIndex === 0 ? "" : "border-t")}>
                        {rowIndex === 0 ? <td className="text-sm pl-1 justify-center bg-white"
                                              rowSpan={allPossiblePlayerHands.length}
                                              style={{writingMode: 'vertical-rl', transform: 'rotate(180deg)'}}>
                            <th className="text-sm p-0 h-full w-full flex items-center justify-center">{table_number === 0 ? "Your hand total" : table_number === 1 ? "Your hand with pairs" : table_number === 2 ? "Your hand with an ace" : ""}</th>
                        </td> : <></>}
                        <td className={`py - 1 px-1 text-sm flex justify-center items-center bg-white border-l ${playerHand && dealerHand && table_number == highlightIndex["tableIndex"] ? rowIndex == highlightIndex["playerHandIndex"] ? "text-white bg-gray-400" : "text-gray-300" : "text-gray-700"}`}>
                            {rowHeader[rowIndex]}
                        </td>
                        {allPossibleDealerHands.map((card, col_index) => {
                                const actionIcon: Action = cheatSheetDataLogic(hand, card, dd_available, split_available)
                                const action: Action = cheatSheetDataLogic(hand, card, true, true)
                                let bg_color: string;
                                let dd_bg_class: string;
                                let bg_style: React.CSSProperties = {};

                                switch (action) {
                                    case "HIT":
                                        bg_color = "#22935E"
                                        break;
                                    case "DD/HIT":
                                        bg_color = `radial-gradient(circle, #FBBE00 50%, #22935E 50%)`;
                                        bg_style = {
                                            background: `radial-gradient(circle, #FBBE00 50%, #22935E 50%)`,
                                        } as React.CSSProperties
                                        break;
                                    case "DD/STAND":
                                        bg_color = `radial-gradient(circle, #FBBE00 50%, #EE4C53 50%)`;
                                        bg_style = {
                                            background: `radial-gradient(circle, #FBBE00 50%, #EE4C53 50%)`,
                                        } as React.CSSProperties
                                        break;
                                    case "SPLIT/HIT":
                                        bg_color = `radial-gradient(circle, #70ACC7 50%, #22935E 50%)`;
                                        bg_style = {
                                            background: `radial-gradient(circle, #70ACC7 50%, #22935E 50%)`,
                                        } as React.CSSProperties
                                        break;
                                    case "SPLIT/STAND":
                                        bg_color = `radial-gradient(circle, #70ACC7 50%, #EE4C53 50%)`;
                                        bg_style = {
                                            background: `radial-gradient(circle, #70ACC7 50%, #EE4C53 50%)`,
                                        } as React.CSSProperties
                                        break;

                                    case "STAND":
                                        bg_color = "#EE4C53";
                                        break
                                }
                                const bg_style_dim = {...bg_style};
                                bg_style_dim.opacity = 50

                                return <td key={col_index}
                                           className={
                                               `text-xs text-gray-700 border-l p-1`
                                           } style={{
                                    background: bg_color,
                                    opacity: dealerHand && playerHand
                                        ? (((rowIndex <= highlightIndex["playerHandIndex"] && col_index == highlightIndex["dealerHandIndex"]) ||
                                                (rowIndex == highlightIndex["playerHandIndex"] && col_index <= highlightIndex["dealerHandIndex"]))
                                            && table_number == highlightIndex["tableIndex"])
                                            ? "100%"
                                            : "50%"
                                        : "100%",
                                    border: dealerHand && playerHand
                                        ? (((rowIndex <= highlightIndex["playerHandIndex"] && col_index == highlightIndex["dealerHandIndex"]) &&
                                                (rowIndex == highlightIndex["playerHandIndex"] && col_index <= highlightIndex["dealerHandIndex"]))
                                            && table_number == highlightIndex["tableIndex"])
                                            ? "2px solid black"
                                            : ""
                                        : "",

                                }}>

                                    <div className={"p-0"}>
                                        {dealerHand && playerHand && (rowIndex == highlightIndex["playerHandIndex"] &&
                                            col_index == highlightIndex["dealerHandIndex"] &&
                                            table_number == highlightIndex["tableIndex"] && action2iconDict[action])}
                                    </div>
                                </td>
                            }
                        )}
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}

export default CheatSheet;
