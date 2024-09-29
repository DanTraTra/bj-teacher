import React, {useState, useEffect} from 'react';
import {GameLog} from './MainContent'
import supabase from '../services/supabaseClient'
import {Accordion} from 'flowbite';
import type {AccordionOptions, AccordionItem, AccordionInterface} from 'flowbite';
import PerformanceGraph from "./PerformanceGraph";
import {AiFillCaretLeft, AiOutlineDown, AiOutlineUp, AiOutlineLineChart, AiOutlineLeft} from 'react-icons/ai'; // Import icons
import {fetchLeaderboardData} from '../services/leaderboardService';


export interface GameLogDataEntries {
    id: number;
    username: string;
    game_log_data: GameLog[];
    database_index: number;
    // Add more properties as needed
}

export interface LeaderboardRow {
    rank: number;
    player: string;
    cashOut: number;
    win: number;
    hands: number;
    db_index: number;
    game_log_data: GameLog[];
}

interface LeaderBoardProps {
    LeaderboardData: LeaderboardRow[];
    Loading: boolean;
}

const LeaderBoard: React.FC<LeaderBoardProps> = ({LeaderboardData, Loading}) => {

    const [ExpandedRowIndex, setExpandedRowIndex] = useState<number | null>(null)

    const toggleRow = (index: number) => {
        setExpandedRowIndex(ExpandedRowIndex === index ? null : index);
    }
    //
    // const [Leaderboard, setLeaderboard] = useState<LeaderboardRow[]>([]);
    // const [LeaderboardData, setLeaderboardData] = useState<GameLogDataEntries[]>([]);
    //
    useEffect(() => {

        // let updatedBoard: LeaderboardRow[] = LeaderboardData.map((d, index) => ({
        //     rank: 1,
        //     player: d.username,
        //     cashOut: d.game_log_data[d.game_log_data.length - 1].EndingBalance,
        //     hands: d.game_log_data.length,
        //     win: parseFloat(((d.game_log_data.filter(game => game.PlayerCards.some(hand => hand.winMultiplier > 1)).length / d.game_log_data.length) * 100).toFixed(0)),
        //     db_index: index,
        // }));
        //
        // updatedBoard.sort((a, b) => b.cashOut - a.cashOut).forEach((row, index) => {
        //     row.rank = index + 1;
        // });
        //
        // updatedBoard = updatedBoard.splice(0, 20)
        //
        // setLeaderboard(updatedBoard);
        //
        // if (Leaderboard.length) {
        //     ////console.log("Leaderboard", Leaderboard)
        // }
    }, [LeaderboardData, Loading])

    return (
        <div className="flex flex-col items-center mb-18">
            <h1 className="font-tech text-2xl pt-20 mb-2 px-4 border-b border-black">Top 20 Leaderboard</h1>
            {/*<h3 className="font-tech text-sm pt-5">How far can you get with $20?</h3>*/}
            <div className="flex flex-col font-tech pt-2">
                {Loading ? (
                    <p>Loading...</p>
                ) : (
                    <>
                        <div className="container mx-auto">
                            <table className="min-w-[60vw] max-w-[70vw] table-auto bg-white rounded-lg shadow-md">
                                <thead className="bg-gray-100">
                                <tr>
                                    <th className="pl-5 pb-2 pt-4 text-center text-sm font-medium text-black rounded-tl-lg">Rank</th>
                                    <th className="pl-4 pb-2 pt-4 text-center text-sm font-medium text-black">Player</th>
                                    <th className="px-4 pb-2 pt-4 text-center text-sm font-medium text-black">Win % (total)
                                    </th>
                                    <th className="px-4 pb-2 pt-4 text-center text-sm font-medium text-black border-l border-accent-content/30 rounded-tr-lg">
                                        <div className="flex flex-row justify-center items-center">
                                            Cash Out($)
                                        </div>
                                    </th>
                                    {/*<th className="pr-4 py-2 text-center font-medium text-black rounded-tr-lg">*/}
                                    {/*    <AiOutlineLineChart/>*/}
                                    {/*</th>*/}

                                </tr>
                                </thead>
                                <tbody>
                                {LeaderboardData.map((row, index) => (
                                    <React.Fragment key={index}>
                                        <tr key={index} className={`border-t cursor-pointer`}
                                            style={{
                                                backgroundColor: `${index === 0
                                                    ? "#e8e8e8"
                                                    : index === 1
                                                        ? "#f2f2f2"
                                                        : index === 2
                                                            ? "#f7f7f7"
                                                            : ""}`
                                            }}
                                            onClick={() => toggleRow(index)}>
                                            <td
                                                className={`pl-5 py-2 text-sm text-center text-gray-700 whitespace-nowrap ${index == LeaderboardData.length - 1 ? "pb-4" : ""}`}>{row.rank}</td>
                                            <td
                                                className={`pl-4 py-2 text-sm text-center text-gray-700 whitespace-nowrap ${index == LeaderboardData.length - 1 ? "pb-4" : ""}`}>{row.player}</td>
                                            <td className={`px-4 py-2 text-sm text-center text-gray-700 whitespace-nowrap ${index == LeaderboardData.length - 1 ? "pb-4" : ""}`}>{`${row.win}%(${row.hands})`}</td>
                                            <td className={`px-4 py-2 text-sm text-center text-gray-700 whitespace-nowrap border-l border-accent-content/30 ${index == LeaderboardData.length - 1 ? "pb-4" : ""}`}>
                                                <div className={`flex flex-row justify-between items-center space-x-1`}>
                                                    <div
                                                        className="flex flex-row w-full justify-center items-center space-x-1">{row.cashOut}</div>
                                                    <div className="flex relative right-0">
                                                        {ExpandedRowIndex === index ? <AiOutlineLeft/> :
                                                            <AiOutlineDown/>}
                                                    </div>
                                                </div>
                                            </td>
                                            {/*<td className="pr-4 py-2 text-sm text-center text-gray-700 whitespace-nowrap">*/}
                                            {/*    {ExpandedRowIndex === index ? <AiOutlineLeft/> : <AiOutlineDown/>}*/}
                                            {/*</td>*/}
                                        </tr>
                                        {ExpandedRowIndex === index && (
                                            <tr className=""
                                                style={{
                                                    backgroundColor: `${index === 0
                                                        ? "#e8e8e8"
                                                        : index === 1
                                                            ? "#f2f2f2"
                                                            : index === 2
                                                                ? "#f7f7f7"
                                                                : ""}`
                                                }}>
                                                <td colSpan={5} className="">
                                                    <PerformanceGraph
                                                        game_log_data={row.game_log_data}
                                                        dark_bg={false}/>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>

                                ))}
                                </tbody>
                            </table>
                        </div>
                    </>

                )}
            </div>

        </div>)
}

export default LeaderBoard;