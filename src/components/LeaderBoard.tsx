import React, {useState, useEffect} from 'react';
import {Client} from 'pg';
import {GameLog} from './MainContent'

interface GameLogDataEntries {
    id: number
    username: string;
    game_log_data: GameLog[];
    // Add more properties as needed
}

interface LeaderboardRow {
    rank: number;
    player: string;
    cashOut: number;
    win: number;
    hands: number;
}

function LeaderBoard() {

    const [Leaderboard, setLeaderboard] = useState<LeaderboardRow[]>([]);
    const [LeaderboardData, setLeaderboardData] = useState<GameLogDataEntries[]>([]);

    const [Loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch("https://api.daaaaan.com/api/data",
                    {
                        method: 'GET',
                        headers: {'Content-Type': 'application/json'}
                    });

                if (!response.ok) {
                    throw new Error(`HTTPS error! Status: ${response.status}`)
                }

                const data = await response.json();
                console.log("data", data)

                let entry: LeaderboardRow = {rank: 0, player: "", cashOut: 0, win: 0, hands: 0}
                const updatedBoard: LeaderboardRow[] = []

                data.map((d: GameLogDataEntries) => {
                    entry = {
                        rank: 1,
                        player: d.username,
                        cashOut: d.game_log_data[d.game_log_data.length - 1].EndingBalance,
                        hands: d.game_log_data.length,
                        win: parseFloat((d.game_log_data.filter(game => game.PlayerCards.filter(hand => hand.winMultiplier > 1).length).length / d.game_log_data.length).toFixed(2)) * 100

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
            <h1 className="font-tech text-lg pt-20 underline decoration-solid decoration-2">BJ Leader Board</h1>
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
                                    <th className="px-4 py-2 text-center text-sm font-medium text-black">Win %</th>
                                    <th className="px-4 py-2 text-center text-sm font-medium text-black">Hands Played
                                    </th>
                                    <th className="px-4 py-2 text-center text-sm font-medium text-black rounded-tr-lg">Cash Out
                                        ($)
                                    </th>
                                </tr>
                                </thead>
                                <tbody>
                                {Leaderboard.map((row, index) => (
                                    <tr key={index} className="border-b">
                                        <td
                                            className="px-4 py-2 text-sm text-center text-gray-700 whitespace-nowrap">{row.rank}</td>
                                        <td
                                            className="px-4 py-2 text-sm text-center text-gray-700 whitespace-nowrap">{row.player}</td>
                                        <td className="px-4 py-2 text-sm text-center text-gray-700 whitespace-nowrap">{row.win}</td>
                                        <td className="px-4 py-2 text-sm text-center text-gray-700 whitespace-nowrap">{row.hands}</td>
                                        <td className="px-4 py-2 text-sm text-center text-gray-700 whitespace-nowrap">{row.cashOut}</td>

                                    </tr>
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