import React, {useState, useEffect} from 'react';
import {GameLog} from './MainContent'
import supabase from '../services/supabaseClient'
import {Accordion} from 'flowbite';
import type {AccordionOptions, AccordionItem, AccordionInterface} from 'flowbite';
import PerformanceGraph from "./PerformanceGraph";
import {AiFillCaretLeft, AiOutlineDown, AiOutlineUp, AiOutlineLineChart, AiOutlineLeft} from 'react-icons/ai'; // Import icons

const accordionEl = document.querySelector('#accordion-example') as HTMLElement | null;

if (accordionEl) {
    const accordionItems: AccordionItem[] = [
        {
            id: 'accordion-example-heading-1',
            triggerEl: document.querySelector('#accordion-example-heading-1 button') as HTMLElement,
            targetEl: document.querySelector('#accordion-example-body-1') as HTMLElement,
            active: true,
        },
        {
            id: 'accordion-example-heading-2',
            triggerEl: document.querySelector('#accordion-example-heading-2 button') as HTMLElement,
            targetEl: document.querySelector('#accordion-example-body-2') as HTMLElement,
            active: false,
        },
    ];

    // Filter out items where triggerEl or targetEl is null
    const validAccordionItems: AccordionItem[] = accordionItems.filter(
        (item) => item.triggerEl !== null && item.targetEl !== null
    ) as AccordionItem[];

    const options: AccordionOptions = {
        alwaysOpen: true,
        activeClasses: 'text-gray-500 dark:text-gray-400',
        inactiveClasses: 'text-gray-500 dark:text-gray-400',
        onOpen: (item) => {
            console.log('accordion item has been shown');
            console.log(item);
        },
        onClose: (item) => {
            console.log('accordion item has been hidden');
            console.log(item);
        },
        onToggle: (item) => {
            console.log('accordion item has been toggled');
            console.log(item);
        },
    };

    const accordion: AccordionInterface = new Accordion(accordionEl, validAccordionItems, options);

    // Optionally, manipulate the accordion (e.g., open, close)
    accordion.open('accordion-example-heading-2');
} else {
    console.error('Accordion element not found');
}


export interface GameLogDataEntries {
    id: number;
    username: string;
    game_log_data: GameLog[];
    database_index: number;
    // Add more properties as needed
}

interface LeaderboardRow {
    rank: number;
    player: string;
    cashOut: number;
    win: number;
    hands: number;
    db_index: number;
}

function LeaderBoard() {

    const [Leaderboard, setLeaderboard] = useState<LeaderboardRow[]>([]);
    const [LeaderboardData, setLeaderboardData] = useState<GameLogDataEntries[]>([]);

    const [Loading, setLoading] = useState(true);

    const [ExpandedRowIndex, setExpandedRowIndex] = useState<number | null>(null)

    const toggleRow = (index: number) => {
        setExpandedRowIndex(ExpandedRowIndex === index ? null : index);
    }
    useEffect(() => {

        const fetchData = async () => {
            try {

                setLoading(false);

                const {data, error} = await supabase
                    .from('userscore') // Replace 'your_table_name' with the actual table name
                    .select('*');

                if (error) {
                    throw new Error(`SupaBase error: ${error.message}`);
                }

                console.log("data", data)
                setLeaderboardData(data)

                let entry: LeaderboardRow = {rank: 0, player: "", cashOut: 0, win: 0, hands: 0, db_index: 0}
                const updatedBoard: LeaderboardRow[] = []

                data.map((d: GameLogDataEntries, index) => {
                    entry = {
                        rank: 1,
                        player: d.username,
                        cashOut: d.game_log_data[d.game_log_data.length - 1].EndingBalance,
                        hands: d.game_log_data.length,
                        win: parseFloat(((d.game_log_data.filter(game => game.PlayerCards.filter(hand => hand.winMultiplier > 1).length).length / d.game_log_data.length) * 100).toFixed(0)),
                        db_index: index,
                    }
                    updatedBoard.push(entry)
                })

                updatedBoard.sort((a, b) => b.cashOut - a.cashOut)
                    .forEach((row, index) => {
                            row.rank = index + 1;  // +1 because array indexes start at 0, but ranks should start at 1
                        }
                    )

                setLeaderboard(updatedBoard);
                setLoading(false)

            } catch (error) {
                console.error('Error fetching Leaderboard:', error)
                setLoading(false)
            }
        };

        fetchData();

        if (Leaderboard.length) {
            console.log("Leaderboard", Leaderboard)
        }
    }, [])

    useEffect(() => {
            if (Leaderboard.length) {
                console.log("Leaderboard", Leaderboard)
            }

        }, [Leaderboard]
    )

    useEffect(() => {
    }, [LeaderboardData])

    return (
        <div className="flex flex-col items-center mb-18">
            <h1 className="font-tech text-lg pt-20 px-4 border-b border-black border-b-[2px]">BJ Leader Board</h1>
            <h3 className="font-tech text-sm pt-5">How far can you get with $20?</h3>
            <div className="flex flex-col font-tech pt-2">
                {Loading ? (
                    <p>Loading...</p>
                ) : (
                    <>

                        <div className="container mx-auto">
                            <table className="min-w-[60vw] max-w-[70vw] table-auto bg-white rounded-lg shadow-md">
                                <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-4 py-2 text-center text-sm font-medium text-black rounded-tl-lg">Rank</th>
                                    <th className="px-4 py-2 text-center text-sm font-medium text-black">Player</th>
                                    <th className="px-4 py-2 text-center text-sm font-medium text-black">Win % (total)
                                    </th>
                                    <th className="pl-4 py-2 text-center text-sm font-medium text-black rounded-tr-lg border-l border-accent-content/30">Cash
                                        Out
                                        ($)
                                    </th>
                                    <th className="pr-4 py-2 text-center font-medium text-black rounded-tr-lg">
                                        <AiOutlineLineChart/>
                                    </th>

                                </tr>
                                </thead>
                                <tbody>
                                {Leaderboard.map((row, index) => (
                                    <React.Fragment key={index}>
                                        <tr key={index} className="border-t cursor-pointer"
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
                                                className="px-4 py-2 text-sm text-center text-gray-700 whitespace-nowrap">{row.rank}</td>
                                            <td
                                                className="px-4 py-2 text-sm text-center text-gray-700 whitespace-nowrap">{row.player}</td>
                                            <td className="px-4 py-2 text-sm text-center text-gray-700 whitespace-nowrap">{`${row.win}(${row.hands})`}</td>
                                            <td className="pl-4 py-2 text-sm text-center text-gray-700 whitespace-nowrap border-l border-accent-content/30">{row.cashOut}</td>
                                            <td className="pr-4 py-2 text-sm text-center text-gray-700 whitespace-nowrap">
                                                {ExpandedRowIndex === index ? <AiOutlineLeft/> : <AiOutlineDown/>}
                                            </td>
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
                                                        game_log_data={LeaderboardData[row.db_index].game_log_data}
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