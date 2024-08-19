import React, {useEffect} from 'react';
import {animationTime, dealerAnimationTime, GameLog, GameOutComeType, PlayerHandProps} from "./MainContent";
import PerformanceGraph from "./PerformanceGraph";
import {Screens} from "../App";

interface Props {
    PlayerHand: PlayerHandProps[];
    PlayerHandIndex: number;
    TrainingMode: boolean;
    GameState: GameOutComeType;
    BalanceAmount: number;
    KeepGoingDisabled: boolean;
    CashOutDisabled: boolean;
    GameLog: GameLog[];
    handleClickKeepGoing: () => void;
    handleClickCashOut: () => void;
    handleClickStartOver: () => void;
    onChange: (action: Screens) => void;
}

const OutCome: React.FC<Props> = ({
                                      PlayerHand,
                                      PlayerHandIndex,
                                      TrainingMode,
                                      GameState,
                                      BalanceAmount,
                                      KeepGoingDisabled,
                                      CashOutDisabled,
                                      GameLog,
                                      handleClickKeepGoing,
                                      handleClickCashOut,
                                      handleClickStartOver,
                                      onChange
                                  }) => {

    const renderOutcomeButtons = (
        button1Text: string,
        button1Action: () => void,
        button2Text: string,
        button2Action: () => void,
        showLeaderboard: boolean = false
    ) => (
        <div className="flex flex-row items-center justify-center space-x-2">
            {showLeaderboard ? (
                <div className="flex flex-col space-y-2">
                    <PerformanceGraph game_log_data={GameLog} dark_bg={true}/>
                    <div className="flex flex-row justify-center items-center space-x-4">
                        <button
                            className="btn btn-sm items-center justify-center w-28 animate-none"
                            onClick={button1Action}
                            disabled={button1Text === "Keep Going" ? KeepGoingDisabled : false}
                        >
                            {button1Text}
                        </button>
                        <button
                            className="btn btn-sm items-center justify-center w-28 animate-none"
                            onClick={button2Action}
                        >
                            {button2Text}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex flex-row justify-center items-center space-x-4">
                    <button
                        className="btn btn-sm items-center justify-center w-28 animate-none"
                        onClick={button1Action}
                        disabled={button1Text === "Keep Going" ? KeepGoingDisabled : false}
                    >
                        {button1Text}
                    </button>
                    <button
                        className="btn btn-sm items-center justify-center w-28 animate-none btn-success text-white"
                        onClick={button2Action}
                        disabled={button2Text === "Cash Out!" ? CashOutDisabled : false}
                    >
                        {button2Text}
                    </button>
                </div>
            )}
        </div>
    );

    const isGameOver = ["GAME OVER", "HOUSE WINS"].includes(GameState) && BalanceAmount + PlayerHand.reduce((acc, hand) => (hand.maxBet * hand.winMultiplier) + acc, 0) === 0;

    useEffect(() => {
        if (TrainingMode && PlayerHandIndex === 0) {
            setTimeout(handleClickKeepGoing, dealerAnimationTime);
        }
    }, [TrainingMode, PlayerHandIndex]);

    const totalBet = PlayerHand.reduce((acc, hand) => (hand.maxBet * hand.winMultiplier) + acc, 0);

    return (
        <div className="flex-col items-center justify-center mx-auto space-y-2">

            <div className="flex items-center justify-center text-white font-bold w-64">{GameState}</div>
            {(() => {
                if (!TrainingMode) {
                    if (BalanceAmount > 0 && PlayerHand[PlayerHandIndex].betDisplay === totalBet && PlayerHandIndex === 0) {
                        return renderOutcomeButtons("Keep Going", handleClickKeepGoing, "Cash Out!", handleClickCashOut);
                    } else if (PlayerHand[PlayerHandIndex].betDisplay > 0 && PlayerHand[PlayerHandIndex].betDisplay === totalBet && PlayerHandIndex === 0) {
                        return renderOutcomeButtons("Keep Going", handleClickKeepGoing, "Cash Out!", handleClickCashOut);
                    } else if (BalanceAmount <= 0 && PlayerHandIndex === 0 && totalBet <= 0) {
                        return renderOutcomeButtons("Start Over?", handleClickStartOver, "Leaderboard", () => onChange('START'), true);
                    }
                }
            })()}

        </div>
    );
    //
    // if (TrainingMode) {
    //     return (
    //         <div className="flex-col items-center justify-center mx-auto space-y-2">
    //             <div className="flex items-center justify-center text-white font-bold w-72">{GameState}</div>
    //
    //         </div>
    //     );
    // } else if (BalanceAmount > 0 && PlayerHand[PlayerHandIndex].betDisplay === totalBet && PlayerHandIndex === 0) {
    //     return (
    //         <div className="flex-col items-center justify-center mx-auto space-y-2">
    //             <div className="flex items-center justify-center text-white font-bold w-72">{GameState}</div>
    //             {renderOutcomeButtons("Keep Going", handleClickKeepGoing, "Cash Out!", handleClickCashOut)}
    //         </div>
    //     );
    // } else if (PlayerHand[PlayerHandIndex].betDisplay > 0 && PlayerHand[PlayerHandIndex].betDisplay === totalBet && PlayerHandIndex === 0) {
    //     return (
    //         <div className="flex-col items-center justify-center mx-auto space-y-2">
    //             <div className="flex items-center justify-center text-white font-bold w-72">{GameState}</div>
    //             {renderOutcomeButtons("Keep Going", handleClickKeepGoing, "Cash Out!", handleClickCashOut)}
    //         </div>
    //     );
    // } else if (BalanceAmount <= 0 && PlayerHandIndex === 0 && totalBet <= 0) {
    //     return (
    //         <div className={`flex-col items-center justify-center mx-auto space-y-2 ${isGameOver && "flex pt-5 px-0 bg-info-content/80 rounded-lg pb-5"}`}>
    //             <div className="flex items-center justify-center text-white font-bold w-72">{GameState}</div>
    //             {renderOutcomeButtons("Start Over?", handleClickStartOver, "Leaderboard", () => onChange('START'), true)}
    //         </div>
    //     );
    // } else {
    //     return (
    //         <div className="flex-col items-center justify-center mx-auto space-y-2">
    //             <div className="flex items-center justify-center text-white font-bold w-72">{GameState}</div>
    //         </div>
    //     );
    // }
};

export default OutCome;
