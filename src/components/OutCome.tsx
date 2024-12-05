import React, {useEffect} from 'react';
import {animationTime, dealerAnimationTime, GameLog, GameOutComeType, PlayerHandProps} from "./MainContent";
import PerformanceGraph from "./PerformanceGraph";
import {Screens} from "../pages/Blackjack";
import {GameLogDataEntries, LeaderboardRow} from "./LeaderBoard";

interface Props {
    PlayerHand: PlayerHandProps[];
    PlayerHandIndex: number;
    ChipAnimationOver: boolean;
    TrainingMode: boolean;
    TutorialState: number;
    DealerTurnEnded: boolean;
    GameState: GameOutComeType;
    leaderboardStats: LeaderboardRow[];
    BalanceAmount: number;
    KeepGoingDisabled: boolean;
    CashOutDisabled: boolean;
    GameLog: GameLog[];
    handleClickKeepGoing: () => void;
    handleClickCashOut: () => void;
    handleClickTutorialEnd: () => void;
    handleClickStartOver: () => void;
    onChange: (action: Screens) => void;
}

const OutCome: React.FC<Props> = ({
                                      PlayerHand,
                                      PlayerHandIndex,
                                      ChipAnimationOver,
                                      TrainingMode,
                                      TutorialState,
                                      DealerTurnEnded,
                                      GameState,
                                      BalanceAmount,
                                      leaderboardStats,
                                      KeepGoingDisabled,
                                      CashOutDisabled,
                                      GameLog,
                                      handleClickKeepGoing,
                                      handleClickCashOut,
                                      handleClickTutorialEnd,
                                      handleClickStartOver,
                                      onChange
                                  }) => {

    function getRanking(leaderboardStats: LeaderboardRow[], BalanceAmount: number) {
        // Determine where your EndingBalance would fit in the sorted leaderboard
        let yourRank = leaderboardStats.findIndex(player => {
            const playerEndingBalance = player.game_log_data[player.game_log_data.length - 1].EndingBalance;
            return playerEndingBalance <= BalanceAmount; // Find the first balance lower or equal to yours
        });

        // If your EndingBalance is higher than all existing ones, it should be rank 1
        if (yourRank === -1) {
            yourRank = leaderboardStats.length; // You would be placed at the last rank
        }

        // Return 1-based rank
        return yourRank + 1;
    }

    const renderOutcomeButtons = (
        button1Text: string,
        button1Action: () => void,
        button2Text: string,
        button2Action: () => void,
        showLeaderboard: boolean = false,
        TutorialState: number,
    ) => (
        <div className="flex flex-row items-center justify-center space-x-2">
            {showLeaderboard ? (
                <div className="flex flex-col space-y-2">
                    <PerformanceGraph game_log_data={GameLog} dark_bg={true}/>
                    <div className="flex flex-row justify-center items-center space-x-4">
                        <button
                            className="btn btn-sm items-center justify-center px-4 animate-none font-tech"
                            onClick={button2Action}
                        >
                            {button2Text}
                        </button>
                        <button
                            className="btn btn-sm items-center justify-center px-4 animate-none btn-success text-white font-tech"
                            onClick={button1Action}
                            disabled={button1Text === "Keep Going" ? KeepGoingDisabled : false}
                        >
                            {button1Text}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex flex-row justify-center w-64 items-center space-x-4">
                    {![6, 8, 11].includes(TutorialState) &&
                    <button
                        className="flex-1 btn btn-sm items-center justify-center animate-none font-tech"
                        onClick={button2Action}
                        disabled={button2Text === "Cash Out!" ? CashOutDisabled : false}
                    >
                        {button2Text}
                    </button>
                    }
                    {TutorialState < 13 &&
                    <button
                        className="flex-1 btn btn-sm items-center justify-center animate-none btn-success text-white font-tech"
                        onClick={button1Action}
                        disabled={button1Text === "Keep Going" ? KeepGoingDisabled : false}
                    >
                        {button1Text}
                    </button>
                    }
                </div>
            )}
        </div>
    );

    const isGameOver = ["GAME OVER", "HOUSE WINS"].includes(GameState) && BalanceAmount + PlayerHand.reduce((acc, hand) => (hand.maxBet * hand.winMultiplier) + acc, 0) === 0;

    useEffect(() => {
        if (TrainingMode && ChipAnimationOver) {
            setTimeout(handleClickKeepGoing, animationTime / 2);
        }
    }, [ChipAnimationOver]);

    // let totalWinnings = 0
    // useEffect(() => {
    //     totalWinnings = totalBet - PlayerHand.reduce((acc, hand) => ((hand.maxBet * hand.winMultiplier) - hand.maxBet) + acc, 0);
    // }, [DealerTurnEnded])

    const totalBet = PlayerHand.reduce((acc, hand) => (hand.maxBet * hand.winMultiplier) + acc, 0);
    // console.log("PlayerHand[0].betDisplay, PlayerHand[0].maxBet", PlayerHand[0].betDisplay, PlayerHand[0].maxBet)
    const totalWinnings = PlayerHand.reduce((acc, hand) => ((-1 * hand.maxBet) + hand.betDisplay) + acc, 0);

    const ranking = getRanking(leaderboardStats, totalBet + BalanceAmount)
    // // // console.log("GameLog", GameLog)
    const maxBalance = GameLog.length >= 2 ? GameLog.reduce((prev, current) => {
        return prev.EndingBalance > current.EndingBalance ? prev : current;
    }).EndingBalance : GameLog.length ? GameLog[0].EndingBalance : 0

    const maxRanking = getRanking(leaderboardStats, maxBalance)

    // // // console.log("totalBet", totalBet)
    // // // console.log("totalWinnings", totalWinnings)
    return (
        <div className="flex flex-col items-center justify-center mx-auto space-y-2 py-2">

            <div
                className="flex flex-col items-center justify-center text-white font-bold w-72 text-3xl text-center font-tech">{`${GameState} ${totalWinnings > 0 ? (`\$${totalWinnings}`) : ""}`}

                <div
                    className="flex space-x-1.5 items-center justify-center text-xs text-center font-tech">
                    {/*<span className="text-gray-400">Currently</span>*/}

                    {(() => {
                        if (!TrainingMode && TutorialState < 0) {
                            if ((BalanceAmount > 0 && PlayerHand[PlayerHandIndex].betDisplay === totalBet && PlayerHandIndex === 0) ||
                                (PlayerHand[PlayerHandIndex].betDisplay > 0 && PlayerHand[PlayerHandIndex].betDisplay === totalBet && PlayerHandIndex === 0)) {
                                if (ranking <= 20) {
                                    return <>
                                        <span className="text-gray-300">Currently</span>
                                        <span className="text-white">{ranking}th </span>
                                        <span className="text-gray-300">on the leaderboard</span>
                                    </>
                                } else {
                                    return <>
                                        <span className="text-gray-300">Win</span>
                                        <span
                                            className="text-white">${leaderboardStats[leaderboardStats.length - 1].cashOut - totalBet + BalanceAmount} more</span>
                                        <span className="text-gray-300">to get on the leaderboard</span>
                                    </>
                                }

                            } else if (BalanceAmount <= 0 && PlayerHandIndex === 0 && totalBet <= 0 && maxRanking <= 20) {
                                return <>
                                    <span className="text-gray-300">Could've came</span>
                                    <span className="text-white">{maxRanking}th </span>
                                    <span className="text-gray-300">on the leaderboard</span>
                                </>
                            }
                        }
                    })()}
                </div>
            </div>
            {(() => {
                if (!TrainingMode) {
                    if (BalanceAmount > 0 && PlayerHand[PlayerHandIndex].betDisplay === totalBet && PlayerHandIndex === 0) {
                        return renderOutcomeButtons("Keep Going", handleClickKeepGoing, [14].includes(TutorialState) ? "Tutorial Complete!" : "Cash Out!", [14].includes(TutorialState) ? handleClickTutorialEnd : handleClickCashOut, false, TutorialState);
                    } else if (PlayerHand[PlayerHandIndex].betDisplay > 0 && PlayerHand[PlayerHandIndex].betDisplay === totalBet && PlayerHandIndex === 0) {
                        return renderOutcomeButtons("Keep Going", handleClickKeepGoing, [14].includes(TutorialState) ? "Tutorial Complete!" : "Cash Out!", [14].includes(TutorialState) ? handleClickTutorialEnd : handleClickCashOut, false, TutorialState);
                    } else if (BalanceAmount <= 0 && PlayerHandIndex === 0 && totalBet <= 0) {
                        return renderOutcomeButtons("Start over?", handleClickStartOver, "Leaderboard", () => onChange('START'), true, TutorialState);
                    }
                }
            })()}

        </div>
    );
};

export default OutCome;
