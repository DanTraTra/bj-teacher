import React, {useEffect} from 'react';
import {animationTime, dealerAnimationTime, GameLog, GameOutComeType, PlayerHandProps} from "./MainContent";
import PerformanceGraph from "./PerformanceGraph";
import {Screens} from "../App";

interface Props {
    PlayerHand: PlayerHandProps[];
    PlayerHandIndex: number;
    ChipAnimationOver: boolean;
    TrainingMode: boolean;
    TutorialState: number;
    GameState: GameOutComeType;
    // TotalWinnings: number;
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
                                      GameState,
                                      BalanceAmount,
                                      // TotalWinnings,
                                      KeepGoingDisabled,
                                      CashOutDisabled,
                                      GameLog,
                                      handleClickKeepGoing,
                                      handleClickCashOut,
                                      handleClickTutorialEnd,
                                      handleClickStartOver,
                                      onChange
                                  }) => {

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

    const totalBet = PlayerHand.reduce((acc, hand) => (hand.maxBet * hand.winMultiplier) + acc, 0);
    const totalWinnings = totalBet - PlayerHand.reduce((acc, hand) => (hand.maxBet) + acc, 0);
    console.log("totalBet", totalBet)
    console.log("totalWinnings", totalWinnings)
    return (
        <div className="flex flex-col items-center justify-center mx-auto space-y-2">

            <div
                className="flex items-center justify-center text-white font-bold w-72 text-3xl text-center font-tech">{`${GameState} ${ totalWinnings > 0 ? (`\$${totalWinnings}`) : ""}`}</div>
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
