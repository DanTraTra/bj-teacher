import React from 'react';
import {GameLog, GameOutComeType, PlayerHandProps} from "./MainContent";
import PerformanceGraph from "./PerformanceGraph";
import {Screens} from "../App";

// Assuming these types are defined somewhere in your project

interface Props {
    PlayerHand: PlayerHandProps[];
    PlayerHandIndex: number;
    GameState: GameOutComeType;
    BalanceAmount: number;
    KeepGoingDisabled: boolean;
    CashOutDisabled: boolean;
    GameLog: GameLog[]; // Define more specific type based on your usage
    handleClickKeepGoing: () => void;
    handleClickCashOut: () => void;
    handleClickStartOver: () => void;
    onChange: (action: Screens) => void;
}

class OutCome extends React.Component<Props> {
    renderOutcomeButtons = (button1Text: string, button1Action: () => void, button2Text: string, button2Action: () => void, showLeaderboard: boolean = false) => (
        // <div className={`flex-col items-center justify-center mx-auto space-y-2 ${this.isGameOver && "flex pt-5 px-0 bg-info-content/80 rounded-lg pb-5"}`}>
        <div className="flex flex-row items-center justify-center space-x-2">
            {showLeaderboard ? (
                <div className="flex flex-col space-y-2">
                    <PerformanceGraph game_log_data={this.props.GameLog} dark_bg={true}/>
                    <div className="flex flex-row justify-center items-center space-x-4">
                        <button className="btn btn-sm items-center justify-center w-28 animate-none"
                                onClick={button1Action}
                                disabled={button1Text === "Keep Going" ? this.props.KeepGoingDisabled : false}>
                            {button1Text}
                        </button>
                        <button className="btn btn-sm items-center justify-center w-28 animate-none"
                                onClick={button2Action}>{button2Text}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex flex-row justify-center items-center space-x-4">
                    <button className="btn btn-sm items-center justify-center w-28 animate-none"
                            onClick={button1Action}
                            disabled={button1Text === "Keep Going" ? this.props.KeepGoingDisabled : false}>
                        {button1Text}
                    </button>
                    <button className="btn btn-sm items-center justify-center w-28 animate-none btn-success text-white"
                            onClick={button2Action}
                            disabled={button2Text === "Cash Out!" ? this.props.CashOutDisabled : false}>
                        {button2Text}
                    </button>
                </div>
            )}
        </div>
        // </div>
    );

    get isGameOver(): boolean {
        return ["GAME OVER", "HOUSE WINS"].includes(this.props.GameState) && this.props.BalanceAmount + this.props.PlayerHand.reduce((acc, hand) => (hand.maxBet * hand.winMultiplier) + acc, 0) == 0;
    }

    render() {
        const {PlayerHand, PlayerHandIndex} = this.props;
        const totalBet = PlayerHand.reduce((acc, hand) => (hand.maxBet * hand.winMultiplier) + acc, 0);
        //console.log("totalBet", totalBet)
        //console.log("PlayerHand", PlayerHand)
        //console.log("PlayerHandIndex", PlayerHandIndex)

        if (this.props.BalanceAmount > 0 && PlayerHand[PlayerHandIndex].betDisplay === totalBet && PlayerHandIndex == 0) {
            //console.log("Option2")
            return (
                <div
                    className={`flex-col items-center justify-center mx-auto space-y-2`}>
                    <div className="flex items-center justify-center text-white font-bold">{this.props.GameState}</div>

                    {this.renderOutcomeButtons("Keep Going", this.props.handleClickKeepGoing, "Cash Out!", this.props.handleClickCashOut)}
                </div>
            );
        } else if (PlayerHand[PlayerHandIndex].betDisplay > 0 && PlayerHand[PlayerHandIndex].betDisplay === totalBet && PlayerHandIndex == 0) {
            //console.log("Option1")
            return (
                <div
                    className={`flex-col items-center justify-center mx-auto space-y-2`}>
                    <div
                        className="flex items-center justify-center text-white font-bold">{this.props.GameState}</div>

                    {this.renderOutcomeButtons("Keep Going", this.props.handleClickKeepGoing, "Cash Out!", this.props.handleClickCashOut)}
                </div>
            );

        } else if (this.props.BalanceAmount <= 0 && PlayerHandIndex == 0 && totalBet <= 0) {
            //console.log("Option3")
            return (
                <div
                    className={`flex-col items-center justify-center mx-auto space-y-2 ${this.isGameOver && "flex pt-5 px-0 bg-info-content/80 rounded-lg pb-5"}`}>
                    <div className="flex items-center justify-center text-white font-bold">{this.props.GameState}</div>

                    {this.renderOutcomeButtons("Start Over?", this.props.handleClickStartOver, "Leaderboard", () => this.props.onChange('START'), true)}
                </div>
            );
        } else {
            //console.log("Option4", this.props.GameState)
            return (
                <div
                    className={`flex-col items-center justify-center mx-auto space-y-2`}>
                    <div className="flex items-center justify-center text-white font-bold">{this.props.GameState}</div>
                </div>
            );
        }
    }
}

export default OutCome;
