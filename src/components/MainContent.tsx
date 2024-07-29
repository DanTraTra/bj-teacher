import React, {useEffect, useRef, useState} from 'react';
import supabase from '../services/supabaseClient';
import './PlayingCard'
import 'tailwindcss/tailwind.css'
import {CardProps, PlayingCard} from "./PlayingCard"
import {Screens} from "../App"
// @ts-ignore
import C1 from "/src/assets/C1.svg?react"
// @ts-ignore
import C5 from "/src/assets/C5.svg?react"
// @ts-ignore
import C10 from "/src/assets/C10.svg?react"
// @ts-ignore
import C25 from "/src/assets/C25.svg?react"
// @ts-ignore
import C50 from "/src/assets/C50.svg?react"
// @ts-ignore
import C100 from "/src/assets/C100.svg?react"
// @ts-ignore
import C1_ from "/src/assets/c1_.svg?react"
// @ts-ignore
import C5_ from "/src/assets/c5_.svg?react"
// @ts-ignore
import C10_ from "/src/assets/c10_.svg?react"
// @ts-ignore
import C25_ from "/src/assets/c25_.svg?react"
// @ts-ignore
import C50_ from "/src/assets/c50_.svg?react"
// @ts-ignore
import C100_ from "/src/assets/c100_.svg?react"
import PerformanceGraph from "./PerformanceGraph";
import CheatSheet, {Action, cheatSheetDataLogic} from "./CheatSheet";
import SwipeablePager from "./SwipeablePager";
import {
    AiFillCalculator,
    AiOutlineCalculator, AiOutlineCheck,
    AiOutlineMenu,
    AiOutlineMore,
    AiOutlineQuestionCircle
} from "react-icons/ai";
import {BiDotsVerticalRounded} from "react-icons/bi";
import {FaDumbbell} from "react-icons/fa6";
import {FaCheck} from "react-icons/fa6";
import {PiMathOperationsFill} from "react-icons/pi";
import {IoArrowBack, IoStatsChart} from "react-icons/io5";
import MenuTopRight from "./MenuTopRight";
import * as Console from "console";
import {IoIosCloseCircleOutline} from "react-icons/io";
import {checkGameState, pressButtonAndCheckBalanceState, pressButtonAndCheckGameState} from "../tests/gameLogicTests";

const buttonClass = "btn btn-sm btn-circle text-white size-8 w-12 h-12"
const chipClass = "flex flex-col p-0 m-0 size-16 hover:bg-transparent hover:border-transparent bg-transparent border-transparent transition duration-100 ease-in-out hover:brightness-125"
type Suit = "hearts" | "diamonds" | "spades" | "clubs";
export const animationTime = 600;
export const dealerAnimationTime = animationTime + 300

interface UserNameProps {
    onSave: (UserName: string) => Promise<{ success: boolean }>;
}

interface MainContentProps {
    onChange: (screen: Screens) => void;
}

export type GameOutComeType =
    "PLACING BET"
    | "IN PLAY"
    | "PLAYER BUST"
    | "PUSH"
    | "DEALER BUST"
    | "HOUSE WINS"
    | "YOU WIN"
    | "PLAYER BLACKJACK"
    | "GAME OVER"
    | "SAVING GAME"

export type PlayerHandProps = { cards: CardProps[], sum: number, maxBet: number, betDisplay: number, winMultiplier: number, doubleDown: boolean }

// Interface for a set of player and dealer cards
export interface GameLog {
    PlayerCards: PlayerHandProps[]; // multiple hands per player for when implementing splitting
    DealerCards: CardProps[];
    DealerHandSum: number;
    EndingBalance: number;
    DateTime: Date;
}

export const initializeCard = (value: number, suit: Suit, display: boolean): CardProps => {
    const picture_card = ['J', 'Q', 'K']
    return value === 1 ? {
        suit: suit,
        value: 11,
        display: `A`,
        visible: display,
    } : {
        suit: suit,
        value: value > 10 ? 10 : value,
        display: `${value > 10 ? picture_card[value % 10 - 1] : value}`,
        visible: display,
    }

}


export const initializeDeck = (deck_count: number): CardProps[] => {
    const suits: Suit[] = ["hearts", "diamonds", "spades", "clubs"];
    const deck: CardProps[] = []

    for (let d = 0; d < deck_count; d++) {
        for (let s of suits) {
            for (let i = 1; i <= 13; i++) {
                deck.push(initializeCard(i, s, false))
            }
        }

    }

    return deck
}


const MainContent: React.FC<MainContentProps> = ({onChange}) => {

    const initialBalance = 20

    // const [UserName, setUserName] = useState('');
    const testHasRun = useRef(false); // Ref to track if the test has run

    const [BalanceAmount, setBalanceAmount] = useState<number>(initialBalance);
    const BalanceAmountRef = useRef(BalanceAmount)
    useEffect(() => {
        BalanceAmountRef.current = BalanceAmount
    }, [BalanceAmount])

    const [DeckCount, setDeckCount] = useState(16)

    const [GameState, setGameState] = useState<GameOutComeType>("PLACING BET");
    const GameStateRef = useRef(GameState)
    useEffect(() => {
        GameStateRef.current = GameState
    }, [GameState])

    const [GameCount, setGameCount] = useState(0);

    const [GameLog, setGameLog] = useState<GameLog[]>([])
    const [MaxBet, setMaxBet] = useState(0)

    const [DealerHand, setDealerHand] = useState<CardProps[]>([]);
    const DealerHandRef = useRef(DealerHand)
    useEffect(() => {
        DealerHandRef.current = DealerHand
    }, [DealerHand])


    const [PlayerHand, setPlayerHand] = useState<PlayerHandProps[]>([{
        cards: [],
        sum: 0,
        maxBet: 0,
        betDisplay: 0,
        winMultiplier: 1,
        doubleDown: false,
    }]);
    const PlayerHandRef = useRef(PlayerHand)
    useEffect(() => {
        PlayerHandRef.current = PlayerHand
        console.log("--inside useEffect Playerhand :", PlayerHand)
    }, [PlayerHand])

    const [PlayerHandIndex, setPlayerHandIndex] = useState<number>(0);

    const [DealerHandSumState, setDealerHandSumState] = useState<number>(0);
    // const [PlayerHandSumState, setPlayerHandSumState] = useState<number[]>([]);

    const [PlayerStand, setPlayerStand] = useState<boolean>(false);
    const [DealerHit, setDealerHit] = useState<number>(0); // DealerHit increments once the dealer begins to deal himself cards since setting to true from being already true won't cause the dealer to actually draw a card
    const [DealerTurnEnded, setDealerTurnEnded] = useState<boolean>(false);

    const [DealerBlackJackState, setDealerBlackJackState] = useState<boolean>(false);
    const [PlayerBlackJackState, setPlayerBlackJackState] = useState<boolean>(false);

    const [HouseWins, setHouseWins] = useState(0);
    const [PlayerWins, setPlayerWins] = useState(0);

    const [Count, setCount] = useState(0);
    const [CountLog, setCountLog] = useState([{value: '', change: 0, countNow: 0}]);

    const [isShaking, setIsShaking] = useState(false);

    const [CheatSheetOpen, setCheatSheetOpen] = useState(false);
    const [MenuOpen, setMenuOpen] = useState<boolean>(false);

    const [GameStatsOpen, setGameStatsOpen] = useState<boolean>(true);
    const [CheatSheetVisible, setCheatSheetVisible] = useState<boolean>(true);
    const [TrainingMode, setTrainingMode] = useState<boolean>(false);
    const [CardCountingMode, setCardCountingMode] = useState<boolean>(false);

    //Training states
    const [CorrectAction, setCorrectAction] = useState<Action | null>(null);
    const [DDButtonPressed, setDDButtonPressed] = useState<boolean>(false);
    const [SplitButtonPressed, setSplitButtonPressed] = useState<boolean>(false);
    const [StandButtonPressed, setStandButtonPressed] = useState<boolean>(false);
    const [HitButtonPressed, setHitButtonPressed] = useState<boolean>(false);


    const menuRef = useRef<HTMLDivElement>(null);
    const cheatSheetRef = useRef<HTMLDivElement>(null);

    const handleCloseMenu = (event: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
            setMenuOpen(false);
        }
    };


    useEffect(() => {
        document.addEventListener('mousedown', handleCloseMenu);

        return () => {
            document.removeEventListener('mousedown', handleCloseMenu);

        };
    }, []);

    const allTestCases: TestDeck[] = [
        {
            PlayerHand: [1, 10],
            DealerHand: [1, 10],
            Deck: null,
            Outcome: "PUSH",
        }
        , {
            PlayerHand: [1, 10],
            DealerHand: [10, 10],
            Deck: null,
            Outcome: "PLAYER BLACKJACK",
        }
        , {
            PlayerHand: [10, 10, 10],
            DealerHand: [10, 10],
            Deck: null,
            Outcome: "PLAYER BUST",
        }
        , {
            PlayerHand: [10, 10],
            DealerHand: [10, 1],
            Deck: [10, 10],
            Outcome: "PLAYER BLACKJACK",
        }
        , {
            PlayerHand: [1, 1],
            DealerHand: [10, 10],
            Deck: [10, 10],
            Outcome: "PLAYER BLACKJACK",
        }
        , {
            PlayerHand: [1, 1],
            DealerHand: [4, 2],
            Deck: null,
            Outcome: "IN PLAY",
        }
        , {
            PlayerHand: [5, 6],
            DealerHand: [4, 2],
            Deck: null,
            Outcome: "IN PLAY",
        }
    ]
    const randomOn = false
    //
    // useEffect(() => {
    //     const runTest = async () => {
    //         console.log("-----------------RUNNING TESTS------------------")
    //         try {
    //             setBalanceAmount(10000)
    //             for (const [index, test] of TestCases.slice(0, TestCases.length - 1).entries()) {
    //                 console.log("Test", test)
    //                 const mockEvent = {
    //                     preventDefault: () => {
    //                     }
    //                 } as React.MouseEvent<HTMLButtonElement>;
    //
    //                 await handleClickChip(1)
    //                 await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 milliseconds
    //                 await pressButtonAndCheckGameState(() => handleClickPlaceBet(mockEvent), "IN PLAY", () => GameStateRef.current);
    //                 await new Promise(resolve => setTimeout(resolve, dealerAnimationTime + 1000)); // Wait for 300 milliseconds
    //                 await checkGameState(test.Outcome, () => GameStateRef.current);
    //                 await new Promise(resolve => setTimeout(resolve, dealerAnimationTime + 1000)); // Wait for 1 milliseconds
    //                 await pressButtonAndCheckGameState(() => handleClickKeepGoing(), "PLACING BET", () => GameStateRef.current);
    //                 await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 milliseconds
    //
    //             }
    //
    //         } catch (error) {
    //             console.error("Test failed:", error);
    //         }
    //     };
    //
    //     if (!testHasRun.current) {
    //         // runTest();
    //         testHasRun.current = true; // Mark the test as run
    //     }
    // }, []);

    type TestDeck = { PlayerHand: number[], DealerHand: number[], Deck: number[] | null, Outcome: GameOutComeType }

    const initializeSpecificHand = (testCards: number[]): CardProps[] => {
        const deck: CardProps[] = []


        const suits: Suit[] = ["spades", "hearts", "clubs", "diamonds"]

        let index = 0;

        while (index < testCards.length) {

            if (index < testCards.length) {
                deck.push(initializeCard(testCards[index], suits[index % 4], false));
                index++;
            }
        }

        // console.log("TestDeck: ",deck)

        return deck
    }

    const [deckUpdated, setDeckUpdated] = useState(false)
    const [GlobalDeck, setGlobalDeck] = useState<CardProps[]>(initializeDeck(DeckCount));
    const deckRef = useRef(GlobalDeck);

    useEffect(() => {
        deckRef.current = GlobalDeck;
    }, [GlobalDeck]);

    const getCardFromDeck = (visible: boolean, random: boolean): CardProps => {
        let currentDeck = deckRef.current;
        const indices = Object.keys(currentDeck);
        if (indices.length === 0) {
            throw new Error("The deck is empty");
        }

        const index = random ? Math.floor(Math.random() * indices.length) : 0;
        const card = {...currentDeck[index], visible};

        currentDeck = currentDeck.filter((_, i) => i !== index);
        deckRef.current = currentDeck;
        setGlobalDeck(currentDeck);

        console.log("remaining deck", currentDeck);
        console.log("got card", card);

        return card;
    };

    const addRandomCardToDealerHand = () => {
        const newCard = getCardFromDeck(false, randomOn);
        const newDealerHand = [...DealerHand, newCard];
        console.log("Adding card to Dealer Hand")

        setDealerHand(newDealerHand)
        // const updatedHand = DealerHand.map(card => ({
        //     ...card, visible: true
        // }));

        setTimeout(() => {
            revealDealerCard(newDealerHand.length - 1)
        }, animationTime)
    }

    const updateCount = (card: CardProps) => {
        let change = 0;
        if (2 <= card.value && card.value <= 6) {
            change = 1
            // acount +1 because", card.value)
        } else if (card.value >= 10 || card.value === 1) {
            change = -1;
            // console.log("count -1 because", card.value)
        } else {
            // console.log("count unchanged because", card.value)
        }
        setCount(currentCount => {

            setCountLog(prevState => {
                return [...prevState, {value: card.display, change: change, countNow: currentCount + change}]
            })

            return (currentCount + change)
        })
    }

    const updateGameLog = () => {
        //WIN AMOUNT NEEDS TO CHANGE WHEN IMPLEMENTING SPLITTING
        // const playerCards: PlayerHandProps = {
        //     cards: PlayerHand,
        //     sum: PlayerHandSumState,
        //     winMultiplier: WinMultiplier,
        //     bet: BetAmount,
        //     doubleDown: false
        // }

        const thisGameLog: GameLog = {
            // PlayerCards: [playerCards],
            PlayerCards: PlayerHand,
            DealerCards: DealerHand,
            DealerHandSum: DealerHandSumState,
            EndingBalance: (BalanceAmount + PlayerHand.reduce((acc, currentHand) => {
                return acc + (currentHand.maxBet * currentHand.winMultiplier)
            }, 0)),
            DateTime: new Date()
        }

        setGameLog(currentLog => {
            return [...currentLog, thisGameLog]
        })
    }

    const [ExtraCardCount, setExtraCardCount] = useState(0)
    const [HitDisabled, setHitDisabled] = useState(false);
    const handleClickHit = () => {
        console.log("CLICKED HIT")
        setHitButtonPressed(true)
        setTimeout(() => {
            setHitButtonPressed(false)
        }, 82 * 5)

        if (!TrainingMode || (CorrectAction == "HIT" || CorrectAction == "SPLIT/HIT" || CorrectAction == "DD/HIT")) {
            setExtraCardCount(ExtraCardCount + 1)
            setHitDisabled(true)
            setStandDisabled(true)
            setDoubleDownDisabled(true);
            setSplitDisabled(true);
            const random_card = getCardFromDeck(false, randomOn)
            // const random_card: CardProps = {
            //     suit: 'clubs',
            //     value: 11,
            //     display: 'A',
            //     visible: false
            // }

            // setPlayerHand(currentHand => [...currentHand, random_card]);
            const updatedHitHand = [...PlayerHand]
            updatedHitHand[PlayerHandIndex].cards = [...updatedHitHand[PlayerHandIndex].cards, random_card]
            setPlayerHand(updatedHitHand);
            // revealPlayerCards()

            setTimeout(() => {
                revealPlayerCards()
                updateCount(random_card)
            }, animationTime)

            setTimeout(() => {
                if (PlayerHand[PlayerHandIndex].sum <= 21) {
                    setHitDisabled(false)
                    setStandDisabled(false)
                }
            }, animationTime + 300)
        }

    }

    const [standDisabled, setStandDisabled] = useState(false);
    const handleClickStand = () => {
        setStandButtonPressed(true)
        console.log("CLICKED STAND")
        setTimeout(() => {
            setStandButtonPressed(false)
        }, 82 * 5)
        if (!TrainingMode || (CorrectAction == "STAND" || CorrectAction == "SPLIT/STAND" || CorrectAction == "DD/STAND")) {
            setStandDisabled(true)
            setHitDisabled(true)
            setDoubleDownDisabled(true)
            setSplitDisabled(true)
            if (PlayerHandIndex == PlayerHand.length - 1) {
                setPlayerStand(true)
            }


            //Dealer gets "card dealt" animation toggles off and then the game outcome gets revealed while the player stand continues until next game
            // setDealerHit(true);

            //    Animation logic:
            //    1. handClickStand just flips the second card
            //    2. useEffect [DealerHand] -> checks all cards are visible -> sums and sets a DealerHit flag for the next card to be dealt or for the outcome to be decided
            //    2a. useEffect [DealerHit] -> adds another card to DealersHand

            // Flip the dealers hidden card
            if (PlayerHand.length > 1 && PlayerHandIndex != PlayerHand.length - 1) {
                setPlayerHandIndex(PlayerHandIndex + 1)
                const updatedList = [...CardShift]
                updatedList.push((PlayerHandIndex * 128) + (ExtraCardCount * 24))
                setCardShift(updatedList)
            } else {
                const dealHandCopy = [...DealerHand]
                dealHandCopy[1] = {...dealHandCopy[1], visible: true}
                setDealerHand(dealHandCopy)
            }
        }

    }

    const [splitDisabled, setSplitDisabled] = useState(false);
    const handleClickSplit = () => {
        setSplitButtonPressed(true)
        setTimeout(() => {
            setSplitButtonPressed(false)
        }, 82 * 5)
        console.log("CLICKED SPLIT")

        if (!TrainingMode || (CorrectAction == "SPLIT/HIT" || CorrectAction == "SPLIT/STAND")) {
            setSplitDisabled(true)

            const splitHand = [...PlayerHand]
            console.log("currentHand", splitHand)

            const latterCard: CardProps = splitHand[PlayerHandIndex].cards.pop() || getCardFromDeck(true, true)
            splitHand[PlayerHandIndex].cards = [splitHand[PlayerHandIndex].cards[0], getCardFromDeck(false, randomOn)]

            splitHand.splice(PlayerHandIndex + 1, 0, {
                cards: [latterCard, getCardFromDeck(false, randomOn)],
                sum: latterCard.value,
                maxBet: splitHand[PlayerHandIndex].maxBet,
                betDisplay: splitHand[PlayerHandIndex].betDisplay,
                winMultiplier: 1,
                doubleDown: false,
            })

            console.log("post-split", splitHand)

            setPlayerHand(splitHand)
            setBalanceAmount(BalanceAmount - splitHand[PlayerHandIndex].betDisplay)

            setTimeout(() => {
                splitHand[PlayerHandIndex].cards = splitHand[PlayerHandIndex].cards.map(card => {
                    return {...card, visible: true}
                })
                setPlayerHand(splitHand)
                PlayerHand[PlayerHandIndex].betDisplay <= BalanceAmount - splitHand[PlayerHandIndex].betDisplay
                && PlayerHand[PlayerHandIndex].cards.length
                && (PlayerHand[PlayerHandIndex].cards[0].display == PlayerHand[PlayerHandIndex].cards[1].display) ? (setSplitDisabled(false)) : (setSplitDisabled(true))

            }, animationTime + 100)
        }
    }

    const [doubleDownDisabled, setDoubleDownDisabled] = useState(false);
    const handleClickDoubleDown = () => {
        setDDButtonPressed(true)
        console.log("CLICKED DOUBLE DOWN")
        setTimeout(() => {
            setDDButtonPressed(false)
        }, 82 * 5)

        if (!TrainingMode || (CorrectAction == "DD/STAND" || CorrectAction == "DD/HIT")) {
            setDoubleDownDisabled(true)
            // const currentBetAmount = [...BetAmount]
            // currentBetAmount[PlayerHandIndex] = currentBetAmount[PlayerHandIndex] * 2
            // setBetAmount(currentBetAmount)
            console.log('BalanceAmount', BalanceAmount)
            console.log('PlayerHand[PlayerHandIndex].bet', PlayerHand[PlayerHandIndex].betDisplay)
            const updatedBalanceDD = BalanceAmount - PlayerHand[PlayerHandIndex].betDisplay
            setBalanceAmount(updatedBalanceDD)

            if (BalanceAmount >= PlayerHand[PlayerHandIndex].betDisplay) {
                const updatedDoubleDownHand = [...PlayerHand];
                updatedDoubleDownHand[PlayerHandIndex].betDisplay = updatedDoubleDownHand[PlayerHandIndex].betDisplay * 2;
                updatedDoubleDownHand[PlayerHandIndex].doubleDown = true;
                setPlayerHand(updatedDoubleDownHand);
            }

        }
    }

    const [StartOverDisabled, setStartOverDisabled] = useState(false);
    const handleClickStartOver = () => {
        // updateGameLog()
        setUpGame()
    }

    const [KeepGoingDisabled, setKeepGoingDisabled] = useState(false);
    const handleClickKeepGoing = () => {
        // If there are multiple hands, combine into first hand
        console.log("CLICKED KEEP GOING")
        const finalHand = [...PlayerHand]
        finalHand[0].betDisplay = finalHand.reduce((acc, hand) => {
            return hand.betDisplay + acc
        }, 0)
        // updateGameLog()
        // setUpGame()
        setGameCount(prevState => prevState + 1)
    }

    useEffect(() => {
        console.log("GameLog changing to:", GameLog)
    }, [GameLog])

    useEffect(() => {
        console.log("BalanceAmount", BalanceAmount)
        console.log("BetAmount + BetDisplay", BalanceAmount + PlayerHand.reduce((acc, hand) => hand.betDisplay + acc, 0))
        if (BalanceAmount + PlayerHand.reduce((acc, hand) => hand.betDisplay + acc, 0) < 1 && GameState == "IN PLAY") {
            setBalanceAmount(0) // When balance is less than 1
            // updateGameLog()
            setGameState("GAME OVER")
        }
    }, [BalanceAmount])


    const handleClickCashOutEarly = () => {
        console.log("CLICKED CashOutEarly")

        if (GameState == "PLACING BET") {
            handleClickCashOut()
            setMenuOpen(false)
        }
    }
    const [CashOutDisabled, setCashOutDisabled] = useState(false);
    const handleClickCashOut = () => {
        console.log("CLICKED CashOut")
        // setBalanceAmount(currentBalance => currentBalance + PlayerHand.reduce((acc, currentHand) => {
        //     return acc + (currentHand.betDisplay)
        // }, 0))

        // updateGameLog()
        setGameState("SAVING GAME")
    }

    const handleClickBack = () => {
        console.log("CLICKED BACK")
        if (GameState == "SAVING GAME") {
            setGameCount(GameCount + 1) //pressed back
            setPlayerStand(false)
        }
        setGameState("PLACING BET")
    }

    const handleClickTestCase = async (index: number) => {
        // Update the deck
        const updatedChipClickPlayerHand = [...PlayerHand];
        updatedChipClickPlayerHand[PlayerHandIndex].betDisplay += 1;
        updatedChipClickPlayerHand[PlayerHandIndex].cards = initializeSpecificHand(allTestCases[index].PlayerHand);
        const updatedChipClickDealerHand = initializeSpecificHand(allTestCases[index].DealerHand);
        const updatedChipClickDeckCards = allTestCases[index].Deck ? initializeSpecificHand(allTestCases[index].Deck!) : initializeDeck(DeckCount);
        updatedChipClickDeckCards.push(...GlobalDeck)

        setDealerHand(updatedChipClickDealerHand);
        setPlayerHand(updatedChipClickPlayerHand);
        setGlobalDeck(updatedChipClickDeckCards)

        const mockEvent = {
            preventDefault: () => {
            }
        } as React.MouseEvent<HTMLButtonElement>;

        handleClickPlaceBet(mockEvent).then(() => {
            setDeckUpdated(false); // Reset the flag
        });
        setDeckUpdated(true); // Set the flag to indicate deck is updated
    };

    useEffect(() => {
        if (deckUpdated) {
            const mockEvent = {
                preventDefault: () => {
                }
            } as React.MouseEvent<HTMLButtonElement>;

            handleClickPlaceBet(mockEvent).then(() => {
                setDeckUpdated(false); // Reset the flag
            });
        }
    }, [deckUpdated]);

    const handleClickChip = (amount: number) => {
        console.log(`Chip Clicked - added ${amount} to BetAmountState`)
        if (amount <= BalanceAmount) {

            const updatedChipClickPlayerHand = [...PlayerHand]
            updatedChipClickPlayerHand[PlayerHandIndex].betDisplay += amount
            setPlayerHand(updatedChipClickPlayerHand)
            setBalanceAmount(currentValue => currentValue - amount) //Chip click increase
        } else if (BalanceAmount + PlayerHand.reduce((acc, hand) => hand.betDisplay + acc, 0) < 1) {
            const updatedChipClickPlayerHand = [...PlayerHand]
            updatedChipClickPlayerHand[PlayerHandIndex].betDisplay += 1
            setPlayerHand(updatedChipClickPlayerHand)
            setBalanceAmount(0)  //Chip click decrease
        }

    }

    const handleBabyChipClick = (amount: number) => {
        console.log(`Baby Chip Clicked - removed ${amount} from BetAmountState`)

        const updatedBabyChipClickPlayerHand = [...PlayerHand]
        updatedBabyChipClickPlayerHand[PlayerHandIndex].betDisplay = updatedBabyChipClickPlayerHand[PlayerHandIndex].betDisplay - amount
        setPlayerHand(updatedBabyChipClickPlayerHand)
        setBalanceAmount(currentValue => currentValue + amount) //baby chip click decrease


    }

    const handleClickPlaceBet = async (event: React.MouseEvent<HTMLButtonElement> | React.TouchEvent<HTMLButtonElement>) => {
        event.preventDefault();
        console.log("Pressed place bet")
        setGameState('IN PLAY')
    }

    const handleClickResetBet = () => {
        if (PlayerHand[PlayerHandIndex].betDisplay == 0 && GameState == "PLACING BET") {
            setIsShaking(true);
            setTimeout(() => {
                setIsShaking(false);
            }, 820); // Duration of the shake animation
        }

        setBalanceAmount(BalanceAmount + PlayerHand[PlayerHandIndex].betDisplay); //reset bet
        const updatedResetPlayerHand = [...PlayerHand];
        updatedResetPlayerHand[PlayerHandIndex].betDisplay = 0;
        setPlayerHand(updatedResetPlayerHand)

    }

    const handleResetCount = () => {
        setCount(0)
        setCountLog([{value: 'Reset', countNow: 0, change: 0}])
        DealerHand.map((card) => {
            if (card.visible) {
                updateCount(card)
            }
        })
        PlayerHand[PlayerHandIndex].cards.map(card => {
            if (card.visible) {
                updateCount(card)
            }
        })
    }

    const revealPlayerCards = () => {
        if (GameState == 'IN PLAY') {
            setTimeout(() => {
                const updatedRevealHand = [...PlayerHand]
                console.log("updatedHand before", updatedRevealHand)

                updatedRevealHand[PlayerHandIndex].cards = updatedRevealHand[PlayerHandIndex].cards.map(card => {
                    return {...card, visible: true}
                })

                console.log("updatedHand after", updatedRevealHand)
                setPlayerHand(updatedRevealHand)

            }, 0);
        }
    }

    const revealDealerCard = (indexToReveal: number) => {

        setDealerHand(prevDealerHand => {
            const updatedHand = prevDealerHand.map((card, index) => {
                    console.log("index", index)
                    console.log("indexToReveal", indexToReveal)

                    return index == indexToReveal ? {...card, visible: true} : {...card}
                }
            )
            console.log('updatedDealerHand', updatedHand)
            return updatedHand
        })

    }


    const setUpGame = () => {
        // AUTO CALLED WHEN GAMECOUNT CHANGES DON'T CALL
        // TODO: Make chips reset to zero after winning a hand
        // TODO: Animate coins going to balance
        console.log("Setting Up Game")
        setGameState("PLACING BET");
        setPlayerStand(false);
        setDealerHit(0);
        setStandDisabled(false);
        setHitDisabled(false);
        setCardShift([]);
        setExtraCardCount(0);
        setDealerTurnEnded(false)
        setPlayerBlackJackState(false)
        const newDeck = initializeDeck(6)
        setGlobalDeck(newDeck)
        setBalanceAmount(initialBalance)
        setGameCount(0)
        setGameLog([])
        setStandButtonPressed(false)
        setSplitButtonPressed(false)
        setDDButtonPressed(false)
        setHitButtonPressed(false)

        if (PlayerHand[PlayerHandIndex].betDisplay > BalanceAmount) {
            setDoubleDownDisabled(true);
        } else {
            setDoubleDownDisabled(false);
        }

        if (PlayerHand[PlayerHandIndex].cards.length
            && (PlayerHand[PlayerHandIndex].cards[0].display == PlayerHand[PlayerHandIndex].cards[1].display)
            && BalanceAmount < PlayerHand[PlayerHandIndex].betDisplay) {
            setSplitDisabled(false)
        } else {
            setSplitDisabled(true)
        }

        // const [random_player_card_1, random_dealer_card_1, random_player_card_2, random_dealer_card_2] = drawInitialCards(4, false, randomOn);

        const random_player_card_1 = getCardFromDeck(false, randomOn)
        const random_dealer_card_1 = getCardFromDeck(false, randomOn)
        const random_player_card_2 = getCardFromDeck(false, randomOn)
        const random_dealer_card_2 = getCardFromDeck(false, randomOn)

        console.log("random_player_card_1", random_player_card_1);
        console.log("random_dealer_card_1", random_dealer_card_1);
        console.log("random_player_card_2", random_player_card_2);
        console.log("random_dealer_card_2", random_dealer_card_2);

        // Create an addToDeck function
        const firstHand: PlayerHandProps = {
            cards: [random_player_card_1],
            sum: random_player_card_1.value,
            maxBet: PlayerHand[PlayerHandIndex].maxBet,
            betDisplay: PlayerHand[PlayerHandIndex].betDisplay,
            winMultiplier: 1,
            doubleDown: false,
        }
        setPlayerHand([firstHand]);
        updateCount(random_player_card_1)

        const updatedFirstHand = {
            ...firstHand,
            cards: [random_player_card_1, random_player_card_2],
            sum: random_player_card_1.value + random_player_card_2.value
        }
        setPlayerHand([updatedFirstHand]);
        updateCount(random_player_card_2)

        setDealerHandSumState(random_dealer_card_1.value)
        setDealerHand([random_dealer_card_1, random_dealer_card_2])
        updateCount(random_dealer_card_1)

    }

    useEffect(() => {
        setUpGame()
        console.log("----------- Game count changing to:", GameCount)
    }, [GameCount])

    useEffect(() => {
        // revealPlayerCards()
        // Player bust with A even is it's less than 21

        console.log("----------- inside useEffect dep [PlayerHand[PlayerHandIndex].sum, GameState]")
        console.log(`PlayerHand[${PlayerHandIndex}].sum`, PlayerHand[PlayerHandIndex].sum)
        console.log(`PlayerHand[${PlayerHandIndex}].cards.length`, PlayerHand[PlayerHandIndex].cards.length)
        console.log("GameState", GameState)
        setTimeout(() => {
            if (GameState == 'IN PLAY') {
                const action = cheatSheetDataLogic(PlayerHand[PlayerHandIndex].cards, DealerHand[0], !doubleDownDisabled, !splitDisabled)
                setCorrectAction(action)
                console.log(action)
                if (PlayerHand[PlayerHandIndex].sum > 21 || (PlayerHand[PlayerHandIndex].sum == 21 && PlayerHand[PlayerHandIndex].cards.length == 2)) {
                    //If player's current hand busts or hits blackjack
                    if (PlayerHandIndex == PlayerHand.length - 1) {
                        // Last Hand
                        setKeepGoingDisabled(true)
                        setCashOutDisabled(true)
                        setStartOverDisabled(true)
                        //
                        // console.log("Setting Dealer Hit False")
                        // setDealerHit(0);

                        console.log("Setting PlayerStand && DealerTurnEnded True")
                        setPlayerStand(true)
                        setDealerTurnEnded(true);


                    } else if (PlayerHand.length > 1) {
                        setPlayerHandIndex(PlayerHandIndex + 1)
                        const updatedList = [...CardShift]
                        updatedList.push((PlayerHandIndex * 128) + (ExtraCardCount * 24))
                        setCardShift(updatedList)
                    }

                }

            }

        }, animationTime)

    }, [PlayerHand[PlayerHandIndex].sum, GameState])

    useEffect(() => {
        console.log("PlayerHand being updated to:", PlayerHand)
        console.log("PlayerHandIndex being updated to:", PlayerHandIndex)
    }, [PlayerHand])

    useEffect(() => {
        // console.log("PlayerHand", PlayerHand)
        // console.log("PlayerHand", PlayerHandIndex)
        if (PlayerStand) {
            setDoubleDownDisabled(true)
            setSplitDisabled(true)
            setStandDisabled(true)
            setHitDisabled(true)
        } else {
            setDoubleDownDisabled(false)
            setSplitDisabled(false)
            setStandDisabled(false)
            setHitDisabled(false)
        }

    }, [PlayerStand])

    useEffect(() => {
        console.log("----------- inside useEffect dep [PlayerHand[PlayerHandIndex].cards]")
        let playerHandSums = PlayerHand.map(hand => hand.cards.reduce((acc, card) => acc + card.value, 0));
        console.log("playerHandSum", playerHandSums)
        console.log("PlayerHand", PlayerHand)
        // console.log("setDealerHandSumState1", dealerHandSum)
        // setDealerHandSumState(dealerHandSum);
        // If dealerHandSum > 21, go through all As and reduce to one 1 until the hand is <=21 or when all As are 1
        PlayerHand.map(hand => {
            if ((playerHandSums[PlayerHandIndex] > 21 && hand.cards.some(card => card.value == 11)) || (playerHandSums[PlayerHandIndex] <= 11 && hand.cards.some(card => card.value == 1))) {
                const hand_copy = [...hand.cards]
                console.log("in conditional", ((hand.sum > 21 && hand.cards.some(card => card.value == 11)) || (hand.sum <= 11 && hand.cards.some(card => card.value == 1))))
                for (let [index, card] of hand_copy.entries()) {
                    // console.log(`playerHandSum index ${index} -`, playerHandSums)
                    if (card.display === 'A' && card.value === 11 && playerHandSums[PlayerHandIndex] > 21) {
                        hand_copy[index].value = 1
                        console.log("changing A from 11 to 1")
                    } else if (card.display === 'A' && card.value === 1 && playerHandSums[PlayerHandIndex] <= 21) {
                        hand_copy[index].value = 11
                        console.log("changing A from 1 to 11")
                    }
                    playerHandSums[PlayerHandIndex] = hand_copy.reduce((acc, card) => acc + card.value, 0);

                }

                // console.log("hand_copy", hand_copy)

                if (hand.cards.every(card => card.visible)) {
                    // setPlayerHand(currentHand => {
                    //     return hand_copy
                    // })
                    // const updatedHand = [...PlayerHand]
                    // updatedHand[PlayerHandIndex].cards = hand_copy
                    // console.log("setPlayerHand2", updatedHand[PlayerHandIndex])
                    // setPlayerHand(updatedHand)

                    setPlayerHand(currentHand => {
                        const updatedHand = [...currentHand]
                        updatedHand[PlayerHandIndex].cards = hand_copy
                        updatedHand[PlayerHandIndex].sum = playerHandSums[PlayerHandIndex]
                        // console.log("setPlayerHand1", playerHandSums[PlayerHandIndex])
                        return updatedHand
                    })

                    // setPlayerHandSumState(playerHandSum);

                }
            }
        })

        setPlayerHand(currentHand => {
            const updatedHand = [...currentHand]
            updatedHand[PlayerHandIndex].sum = playerHandSums[PlayerHandIndex]
            // console.log("setPlayerHand2", updatedHand[PlayerHandIndex])
            return updatedHand
        })


    }, [PlayerHand[PlayerHandIndex].cards])


    useEffect(() => {
        console.log("-------inside useEffect dep [DealerTurnEnded]")
        console.log("PlayerStand - DD", PlayerStand)
        console.log("DealerHit - DD", DealerTurnEnded)
        console.log("DealerHandSumState", DealerHandSumState)
        setPlayerBlackJackState(false)
        if (PlayerStand && DealerTurnEnded) {
            const updatedPlayerHandWinMultiplier = [...PlayerHand]
            updatedPlayerHandWinMultiplier.map(hand => {
                if (PlayerHandIndex == PlayerHand.length - 1) {
                    hand.maxBet = hand.betDisplay
                }

                if ((hand.sum == 21 && hand.cards.length == 2) && !(DealerHandSumState == 21 && DealerHand.length == 2)) {
                    //    Hand = BlackJack
                    hand.winMultiplier = 2.5;
                    if (PlayerHand.length == 1) {
                        setPlayerBlackJackState(true)
                    }

                } else if (hand.sum > 21) {
                    // If player bust bust
                    hand.winMultiplier = 0;
                } else {
                    // If player doesn't bust
                    if (DealerHandSumState > 21) {
                        // Dealer busts
                        hand.winMultiplier = 2;
                    } else if (DealerHandSumState < hand.sum) {
                        // Dealer hand is less than the Player's
                        hand.winMultiplier = 2;
                    } else if (DealerHandSumState == hand.sum) {
                        // Dealer hand is equal to the Player's
                        hand.winMultiplier = 1;
                    } else if (DealerHandSumState > hand.sum) {
                        hand.winMultiplier = 0;
                    }
                }

            })

            setPlayerHand(updatedPlayerHandWinMultiplier)
            setTimeout(() => {
                setKeepGoingDisabled(false)
                setCashOutDisabled(false)
                setStartOverDisabled(false)

                switch (PlayerHand[PlayerHandIndex].winMultiplier) {
                    case 2:
                        setGameState("YOU WIN")
                        break
                    case 1:
                        setGameState("PUSH")
                        break
                    case 2.5:
                        setGameState("PLAYER BLACKJACK")
                        break
                    case 0:
                        setGameState("HOUSE WINS")
                        break
                    default:
                        setGameState("IN PLAY")
                }
            }, PlayerHandIndex == PlayerHand.length - 1 ? (dealerAnimationTime) : (0))

            if (PlayerHandIndex == PlayerHand.length - 1) {
                updateGameLog()
            }

        }

    }, [DealerTurnEnded, PlayerHandIndex])

    useEffect(() => {
        console.log("--------inside useEffect dep [PlayerStand, GameState, DealerHand.every((card) => card.visible)]")
        // console.log("DealerHand.length", DealerHand.length)
        // console.log("DealerHand.every((card) => card.visible)", DealerHand.every((card) => card.visible))
        // console.log("DealerHandSumState - PD", DealerHandSumState)
        console.log("PlayerStand - PD", PlayerStand)
        // console.log("DealerHand", DealerHand)
        // console.log("PlayerHand", PlayerHand)
        if (GameState == "SAVING GAME") {
            return
        }

        if (PlayerStand
            // && (GameState == "PLAYER BUST" || GameState == "HOUSE WINS" || GameState == "PLAYER BLACKJACK" || GameState == "PUSH")
        ) {
            setTimeout(() => {
                    revealDealerCard(1) //When the player loses
                }, dealerAnimationTime
            )
        }
        let dealerHandSum = DealerHand.reduce((acc, card) => acc + card.value, 0);

        // console.log("setDealerHandSumState1", dealerHandSum)
        // setDealerHandSumState(dealerHandSum);

        // If dealerHandSum > 21, go through all As and reduce to one 1 until the hand is <=21 or whan all As are 1
        if (dealerHandSum > 21 && DealerHand.some(card => card.value == 11)) {
            const hand_copy = [...DealerHand]

            for (let [index, card] of hand_copy.entries()) {
                console.log(`dealerHandSum index ${index} -`, dealerHandSum)
                if (card.display == 'A' && card.value == 11 && dealerHandSum > 21) {
                    hand_copy[index] = {...card, value: 1}
                    console.log("card", card)
                }
                dealerHandSum = hand_copy.reduce((acc, card) => acc + card.value, 0);

            }

            // console.log("hand_copy", hand_copy)
            if (DealerHand.every(card => card.visible)) {
                setDealerHand(currentHand => {
                    return hand_copy
                })

                console.log("setDealerHandSumState2", dealerHandSum)
                setDealerHandSumState(dealerHandSum);

            }
        }

        console.log("setDealerHandSumState1", dealerHandSum)
        setDealerHandSumState(dealerHandSum);
        // console.log("setDealerHandSumState2", dealerHandSum)
        // setDealerHandSumState(dealerHandSum);

        if (PlayerStand || GameState == 'PLAYER BUST' || (PlayerHand.length > 1 && LOSE.includes(GameState))) {

            if (dealerHandSum < 17 && PlayerHand[PlayerHandIndex].sum <= 21 && !PlayerBlackJackState && !PlayerHand.every(hand => hand.winMultiplier == 0)) {

                if (DealerHand.every((card) => card.visible)) {
                    setTimeout(() => {
                        console.log("Getting another card - DD")
                        addRandomCardToDealerHand() // when the player stands or when the dealers hand is below 17
                        // addFakeRandomCardToDealerHand()
                    }, dealerAnimationTime)

                    // console.log("Setting DealerTurnEnded False")
                    setDealerTurnEnded(false);

                }

            } else {

                // console.log("Setting Dealer Hit False")
                setDealerHit(0);

                // console.log("Setting DealerTurnEnded True")
                setDealerTurnEnded(true);
            }

        } else {
            // console.log("Setting Dealer Hit False")
            setDealerHit(0);
            // console.log("Setting DealerTurnEnded False")
            setDealerTurnEnded(false);

        }
    }, [PlayerStand, GameState, DealerHand.every((card) => card.visible)])

    useEffect(() => {

        if ((GameState == 'PLAYER BUST' || GameState == 'PLAYER BLACKJACK') && (PlayerHandIndex == PlayerHand.length - 1)) {
            //Reveal dealers card if isn't turned over
            revealDealerCard(1)

        } else if (GameState == 'IN PLAY') {
            revealPlayerCards()
            revealDealerCard(0)
            if (BalanceAmount < PlayerHand[PlayerHandIndex].betDisplay) {
                setDoubleDownDisabled(true)
            } else {
                setDoubleDownDisabled(false)
            }

            if (PlayerHand[PlayerHandIndex].cards.length
                && (PlayerHand[PlayerHandIndex].cards[0].display == PlayerHand[PlayerHandIndex].cards[1].display)
                && BalanceAmount >= PlayerHand[PlayerHandIndex].betDisplay) {
                setSplitDisabled(false)
            } else {
                setSplitDisabled(true)
            }
        } else if (GameState == 'SAVING GAME') {
            console.log("Resetting the bet display and totalling into balance")
            setBalanceAmount(BalanceAmount + PlayerHand.reduce((acc, currentHand) => {
                return acc + (currentHand.betDisplay)
            }, 0))

            const updatedCashOutPlayerHand = [...PlayerHand];
            updatedCashOutPlayerHand[PlayerHandIndex].betDisplay = 0;
            setPlayerHand(updatedCashOutPlayerHand)
        }
        console.log("GlobalDeck", GlobalDeck)
        console.log("GlobalDeck.length", GlobalDeck.length)
    }, [GameState])

    // type GameOutComeType =
    //     "PLACING BET"
    //     | "IN PLAY"
    //     | "PLAYER BUST"
    //     | "PUSH"
    //     | "DEALER BUST"
    //     | "HOUSE WINS"
    //     | "YOU WIN"
    //     | "PLAYER BLACKJACK"
    const WIN: GameOutComeType[] = ['PLAYER BLACKJACK', 'YOU WIN', "DEALER BUST"]
    const LOSE: GameOutComeType[] = ['HOUSE WINS', 'PLAYER BUST']

    useEffect(() => {
        // USED FOR ANIMATING CHIPS
        console.log("----------- inside useEffect dep [PlayerHand[PlayerHandIndex].betDisplay, GameState, DealerTurnEnded, PlayerHandIndex]")
        // console.log("in userEffect [BetAmount, GameState]")
        // console.log("GameState", GameState)
        // console.log("BetAmount", BetAmount)
        // console.log("WinAmount", WinAmount)
        // console.log("BetChange", BetChange)

        //TODO: fix when user busts in the last hand after splitting - probably need to implement hand checking before flipping dealer cards in case all hands are busts
        console.log("GameState", GameState)
        console.log("DealerTurnEnded", DealerTurnEnded)
        if (GameState != 'IN PLAY' && GameState != 'PLACING BET' && GameState != 'SAVING GAME' && DealerTurnEnded) {
            // console.log("BetAmount", PlayerHand[PlayerHandIndex].maxBet)
            setTimeout(() => {
                let winAmount = PlayerHand[PlayerHandIndex].maxBet * PlayerHand[PlayerHandIndex].winMultiplier
                if (PlayerHandIndex == 0) {
                    winAmount = PlayerHand.reduce((acc, hand) => (hand.maxBet * hand.winMultiplier) + acc, 0)
                    const updatedPlayerHandBetDisplay = [...PlayerHand]
                    updatedPlayerHandBetDisplay.map((hand, index) => index == 0 ? (hand) : (hand.betDisplay = 0))
                    setPlayerHand(updatedPlayerHandBetDisplay)
                }
                // console.log("PlayerHand", PlayerHand)
                // console.log("winAmount", winAmount)
                // console.log("PlayerHandIndex", PlayerHandIndex)

                const betAnimationChange = PlayerHand[PlayerHandIndex].maxBet >= 10 ? Math.round(PlayerHand[PlayerHandIndex].maxBet / 10) : (1)
                // console.log("WinAmount", WinAmount)
                // console.log("betAnimationChange", betAnimationChange)
                let betAmountChangeTime = 50

                if (PlayerHand[PlayerHandIndex].betDisplay != winAmount) {
                    const timer = setTimeout(() => {
                        // if you lose || you win
                        if (LOSE.includes(GameState) && PlayerHand[PlayerHandIndex].betDisplay >= betAnimationChange) {
                            //// decrement bet display by the calculated difference for animation purposes
                            const updatedPlayerHandBetDisplay = [...PlayerHand]
                            updatedPlayerHandBetDisplay[PlayerHandIndex].betDisplay = PlayerHand[PlayerHandIndex].betDisplay - betAnimationChange
                            setPlayerHand(updatedPlayerHandBetDisplay)
                        } else if (WIN.includes(GameState) && winAmount - PlayerHand[PlayerHandIndex].betDisplay >= betAnimationChange) {
                            //// increment bet display by the calculated difference for animation purposes
                            const updatedPlayerHandBetDisplay = [...PlayerHand]
                            updatedPlayerHandBetDisplay[PlayerHandIndex].betDisplay = PlayerHand[PlayerHandIndex].betDisplay + betAnimationChange
                            setPlayerHand(updatedPlayerHandBetDisplay)
                        } else {
                            const updatedPlayerHandBetDisplay = [...PlayerHand]
                            updatedPlayerHandBetDisplay[PlayerHandIndex].betDisplay = winAmount
                            setPlayerHand(updatedPlayerHandBetDisplay)
                        }
                    }, 50);
                    return () => clearTimeout(timer);

                } else if (PlayerHandIndex > 0) {
                    const pauseTime = Math.abs((winAmount - PlayerHand[PlayerHandIndex].maxBet) / betAmountChangeTime) * 50 + 700
                    console.log("Time given for each hand", pauseTime)
                    const timer = setTimeout(() => {
                        setPlayerHandIndex(PlayerHandIndex - 1)
                    }, pauseTime)

                    const timer1 = setTimeout(() => {
                    }, 300)

                    return () => {
                        clearTimeout(timer)
                        clearTimeout(timer1);
                    };
                }
            }, 0)

        }

    }, [PlayerHand[PlayerHandIndex].betDisplay, GameState, DealerTurnEnded, PlayerHandIndex]);

    useEffect(() => {
        if (PlayerHandIndex == 0 && DealerTurnEnded && (BalanceAmount + PlayerHand.reduce((acc, hand) => (hand.maxBet * hand.winMultiplier) + acc, 0) <= 0)) {
            // if (PlayerHand.length > GameLog.length) {
            //     updateGameLog()
            // }
            // updateGameLog()

            setGameState("GAME OVER")
        }

        if (BalanceAmount < PlayerHand[PlayerHandIndex].betDisplay) {
            setSplitDisabled(true)
            setDoubleDownDisabled(true)
        }


    }, [BalanceAmount, PlayerHand[PlayerHandIndex].betDisplay])

    const splitCardsContainer = useRef<HTMLDivElement>(null);
    const [CardShift, setCardShift] = useState<number[]>([])

    const scrollToCurrentHand = (scrollAmount: number) => {

        console.log("scrollAmount", scrollAmount)
        if (splitCardsContainer.current) {
            splitCardsContainer.current.scrollTo({
                left: scrollAmount, // Adjust this value to scroll to a specific position
                behavior: 'smooth'
            });
        }
    };

    useEffect(() => {
        console.log("CardShiftState", CardShift)
    }, [CardShift])

    useEffect(() => {
        console.log("PlayerHandIndex", PlayerHandIndex)
        if (GameState == 'IN PLAY') {
            console.log("Scrolling from calcs PlayerHandIndex", PlayerHandIndex)
            scrollToCurrentHand((PlayerHandIndex * 128) + (+(!!PlayerHandIndex)) * (ExtraCardCount * 24))
            const updatedList = [...CardShift]
            updatedList[PlayerHandIndex] = (PlayerHandIndex * 128) + (+(!!PlayerHandIndex)) * (ExtraCardCount * 24)
            updatedList[0] = 0;
            setCardShift(updatedList)
            console.log("Updating stored CardShift", (PlayerHandIndex * 128) + (+(!!PlayerHandIndex)) * (ExtraCardCount * 24))

        } else {
            console.log("Scrolling from stored CardShift", CardShift, CardShift[PlayerHandIndex])
            scrollToCurrentHand(CardShift[PlayerHandIndex])
        }
        revealPlayerCards()
        setHitDisabled(false)
        setStandDisabled(false)

        if (PlayerHand[PlayerHandIndex].cards.length
            && (PlayerHand[PlayerHandIndex].cards[0].display == PlayerHand[PlayerHandIndex].cards[1].display)
            && BalanceAmount >= PlayerHand[PlayerHandIndex].betDisplay) {
            setSplitDisabled(false)
        } else {
            setSplitDisabled(true)
        }

        if (PlayerHand[PlayerHandIndex].betDisplay > BalanceAmount) {
            setDoubleDownDisabled(true)
        } else {
            setDoubleDownDisabled(false)
        }

    }, [PlayerHandIndex])

    const [IsDragging, setIsDragging] = useState(false)

    const handleTouchStart = () => {
        setIsDragging(true);
        console.log("setIsDragging", true)
    }

    const handleTouchEnd = () => {
        setIsDragging(false);
        console.log("setIsDragging", false)
        if (splitCardsContainer.current) {
            scrollToCurrentHand((PlayerHandIndex * 128) + (+(!!PlayerHandIndex)) * (ExtraCardCount * 24))
        }
    }


    const snapBackTimeout = useRef<NodeJS.Timeout | null>(null);
    const handleWheel = (e: WheelEvent) => {

        // console.log("e.deltaX", e.deltaX)
        if (splitCardsContainer.current) {
            splitCardsContainer.current.scrollLeft += e.deltaX;
        }

        if (snapBackTimeout.current) {
            clearTimeout(snapBackTimeout.current);
        }
        snapBackTimeout.current = setTimeout(() => {
            if (splitCardsContainer.current) {
                console.log("Wheel scroll PI, Extracardcount", PlayerHandIndex, ExtraCardCount)
                scrollToCurrentHand((PlayerHandIndex * 128) + (+(!!PlayerHandIndex)) * (ExtraCardCount * 24))
            }
        }, 150)
    };

    useEffect(() => {
        const container = splitCardsContainer.current;
        if (container) {
            container.addEventListener('wheel', handleWheel);
            return () => {
                container.removeEventListener('wheel', handleWheel);
            };
        }
    }, [handleWheel]);

    const PlaceBets = () => {
        return (
            <div className="flex flex-row px-auto space-x-2 z-20">
                <button className={chipClass} onClick={() => handleClickChip(1)}>
                    <C1 className="w-full h-full transform"/>
                </button>
                <button className={chipClass} onClick={() => handleClickChip(5)}>
                    <C5 className="w-full h-full transform"/>
                </button>
                <button className={chipClass} onClick={() => handleClickChip(10)}>
                    <C10 className="w-full h-full transform"/>
                </button>
                <button className={chipClass} onClick={() => handleClickChip(25)}>
                    <C25 className="w-full h-full transform"/>
                </button>
                <button className={chipClass} onClick={() => handleClickChip(50)}>
                    <C50 className="w-full h-full transform"/>
                </button>
                <button className={chipClass} onClick={() => handleClickChip(100)}>
                    <C100 className="w-full h-full transform"/>
                </button>
                {!randomOn &&
                <>
                    {allTestCases.map((testCase, index) => {
                        return (
                            <button key={index} className={`${chipClass} bg-white justify-center items-center text-sm`}
                                    onClick={() => handleClickTestCase(index)}>
                                {`D: ${testCase.DealerHand.join(', ')}`} <br/>{`P: ${testCase.PlayerHand.join(', ')}`}
                            </button>)
                    })}
                </>}
            </div>)
    }


    const ActionButtons = () => {
        return <div className="flex flex-row space-x-4 text-white">
            <div className="flex flex-col items-center space-y-2">
                <button
                    className={`${buttonClass} btn-warning ${!["DD/HIT", "DD/STAND"].includes(CorrectAction!) && DDButtonPressed ? 'animate-shake' : ''}`}
                    onClick={handleClickDoubleDown}
                    disabled={doubleDownDisabled}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
                         className="w-6 h-6">
                        <path
                            d="M16.5 6a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3v7.5a3 3 0 0 0 3 3v-6A4.5 4.5 0 0 1 10.5 6h6Z"/>
                        <path
                            d="M18 7.5a3 3 0 0 1 3 3V18a3 3 0 0 1-3 3h-7.5a3 3 0 0 1-3-3v-7.5a3 3 0 0 1 3-3H18Z"/>
                    </svg>
                </button>
                <div className="text-xs">Double</div>
            </div>
            <div className="flex flex-col items-center space-y-2">
                <button
                    className={`${buttonClass} btn-success ${!["HIT", "SPLIT/HIT", "DD/HIT"].includes(CorrectAction!) && HitButtonPressed ? 'animate-shake' : ''}`}
                    onClick={handleClickHit}
                    disabled={HitDisabled}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
                         className="w-6 h-6">
                        <path fillRule="evenodd"
                              d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 9a.75.75 0 0 0-1.5 0v2.25H9a.75.75 0 0 0 0 1.5h2.25V15a.75.75 0 0 0 1.5 0v-2.25H15a.75.75 0 0 0 0-1.5h-2.25V9Z"
                              clipRule="evenodd"/>
                    </svg>
                </button>
                <div className="text-xs">Hit</div>
            </div>
            <div className="flex flex-col items-center space-y-2">
                <button
                    className={`${buttonClass} btn-error ${!["STAND", "SPLIT/STAND", "DD/STAND"].includes(CorrectAction!) && StandButtonPressed ? 'animate-shake' : ''}`}
                    onClick={handleClickStand}
                    disabled={standDisabled}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
                         className="w-6 h-6">
                        <path fillRule="evenodd"
                              d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm3 10.5a.75.75 0 0 0 0-1.5H9a.75.75 0 0 0 0 1.5h6Z"
                              clipRule="evenodd"/>
                    </svg>
                </button>
                <div className="text-xs">Stand</div>
            </div>
            <div className="flex flex-col items-center space-y-2">
                <button
                    className={`${buttonClass} btn-neutral ${!["SPLIT/HIT", "SPLIT/STAND"].includes(CorrectAction!) && SplitButtonPressed ? 'animate-shake' : ''}`}
                    onClick={handleClickSplit}
                    disabled={splitDisabled}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
                         className="w-6 h-6">
                        <path fillRule="evenodd"
                              d="M15.97 2.47a.75.75 0 0 1 1.06 0l4.5 4.5a.75.75 0 0 1 0 1.06l-4.5 4.5a.75.75 0 1 1-1.06-1.06l3.22-3.22H7.5a.75.75 0 0 1 0-1.5h11.69l-3.22-3.22a.75.75 0 0 1 0-1.06Zm-7.94 9a.75.75 0 0 1 0 1.06l-3.22 3.22H16.5a.75.75 0 0 1 0 1.5H4.81l3.22 3.22a.75.75 0 1 1-1.06 1.06l-4.5-4.5a.75.75 0 0 1 0-1.06l4.5-4.5a.75.75 0 0 1 1.06 0Z"
                              clipRule="evenodd"/>
                    </svg>

                </button>
                <div className="text-xs">Split</div>
            </div>
            {/*<div className="flex flex-col items-center space-y-2">*/}
            {/*    <div className={buttonClass + " btn-neutral"} onClick={handleResetCount}>*/}
            {/*        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"*/}
            {/*             className="w-6 h-6">*/}
            {/*            <path fillRule="evenodd"*/}
            {/*                  d="M15.97 2.47a.75.75 0 0 1 1.06 0l4.5 4.5a.75.75 0 0 1 0 1.06l-4.5 4.5a.75.75 0 1 1-1.06-1.06l3.22-3.22H7.5a.75.75 0 0 1 0-1.5h11.69l-3.22-3.22a.75.75 0 0 1 0-1.06Zm-7.94 9a.75.75 0 0 1 0 1.06l-3.22 3.22H16.5a.75.75 0 0 1 0 1.5H4.81l3.22 3.22a.75.75 0 1 1-1.06 1.06l-4.5-4.5a.75.75 0 0 1 0-1.06l4.5-4.5a.75.75 0 0 1 1.06 0Z"*/}
            {/*                  clipRule="evenodd"/>*/}
            {/*        </svg>*/}

            {/*    </div>*/}
            {/*    <div className="text-xs">ResetCount</div>*/}
            {/*</div>*/}
        </div>
    }

    class OutCome extends React.Component {
        render() {

            const totalBet = PlayerHand.reduce((acc, hand) => (hand.maxBet * hand.winMultiplier) + acc, 0);
            const isGameOver = GameState === "GAME OVER";

            return (
                <div>
                    {PlayerHand[PlayerHandIndex].betDisplay > 0 ? (
                        // Just won a hand
                        PlayerHand[PlayerHandIndex].betDisplay === totalBet && (
                            <div
                                className={`flex-col items-center justify-center mx-auto space-y-2 ${isGameOver && "flex pt-5 px-0 bg-info-content/80 rounded-lg pb-5"}`}>
                                <div className="flex items-center justify-center text-white font-bold">{GameState}</div>
                                <div className="flex flex-row items-center justify-center space-x-2">
                                    <button className="btn btn-sm items-center justify-center w-28 animate-none"
                                            onClick={handleClickKeepGoing} disabled={KeepGoingDisabled}>Keep Going
                                    </button>
                                    <button
                                        className="btn btn-sm items-center justify-center w-28 animate-none btn-success text-white"
                                        onClick={handleClickCashOut} disabled={CashOutDisabled}>Cash Out!
                                    </button>
                                </div>
                            </div>
                        )
                    ) : (
                        // Just lost a hand
                        BalanceAmount > 0 ? (
                            // Has money left to bet
                            PlayerHand[PlayerHandIndex].betDisplay === totalBet && (
                                <div
                                    className={`flex-col items-center justify-center mx-auto space-y-2 ${isGameOver && "flex pt-5 px-0 bg-info-content/80 rounded-lg pb-5"}`}>
                                    <div
                                        className="flex items-center justify-center text-white font-bold">{GameState}</div>
                                    <div className="flex flex-row items-center justify-center space-x-2">
                                        <button className="btn btn-sm items-center justify-center w-28 animate-none"
                                                onClick={handleClickKeepGoing}>Keep Going
                                        </button>
                                        <button
                                            className="btn btn-sm items-center justify-center w-28 animate-none btn-success text-white"
                                            onClick={handleClickCashOut}>Cash Out!
                                        </button>
                                    </div>
                                </div>
                            )
                        ) : (
                            // Has NO money left to bet
                            <div
                                className={`flex-col items-center justify-center mx-auto space-y-2 ${isGameOver && "flex pt-5 px-0 bg-info-content/80 rounded-lg pb-5"}`}>
                                <div className="flex items-center justify-center text-white font-bold">{GameState}</div>
                                <div className="flex flex-row items-center justify-center space-x-2">
                                    <div className="flex flex-col space-y-2">
                                        <PerformanceGraph game_log_data={GameLog} dark_bg={true}/>
                                        <div className="flex flex-row justify-center items-center space-x-4">
                                            <button className="btn btn-sm items-center justify-center w-28 animate-none"
                                                    onClick={handleClickStartOver}>Start Over?
                                            </button>
                                            <button className="btn btn-sm items-center justify-center w-28 animate-none"
                                                    onClick={() => onChange('START')}>Leaderboard
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    )}
                </div>
            );
        }
    }


    const RenderSaveUserNameForm: React.FC<UserNameProps> = ({onSave}) => {
        const [UserName, setUserName] = useState<string>('');

        const handleSubmit = async (event: React.FormEvent) => {
            event.preventDefault();

            if (!UserName) {
                alert('You need a username to save your score');
                return
            }

            const result = await onSave(UserName);
            if (result.success) {
                setUserName('')
                onChange('START')
            } else {
                alert('Failed to save score')
            }
        };

        return (
            <div className="flex flex-col pt-5 px-0 bg-info-content/80 rounded-lg pb-5">
                <form onSubmit={handleSubmit} className="flex flex-col w-70 space-y-6 py-2 text-white">
                    <div className="space-y-2">
                        <div className="flex flex-row items-center justify-center text-center text-lg font-tech">
                            Join the Leaderboard!
                        </div>

                        <div className="flex flex-row w-full items-center space-x-2 border-gray-100 px-6">
                            <label className="w-full">
                                <input type="text"
                                       placeholder="Name"
                                       value={UserName}
                                       onChange={(e) => setUserName(e.target.value)}
                                       required
                                       className="flex flex-row w-full h-8 text-black rounded-lg px-3 font-tech items-center"
                                />
                            </label>
                            <button className="btn btn-sm mt-auto rounded-lg font-tech" type="submit">Save</button>

                        </div>
                    </div>

                    <PerformanceGraph game_log_data={GameLog} dark_bg={true}/>

                    <div className="flex flex-row items-center justify-center text-center text-xs font-tech">{
                        BalanceAmount > 20 ? (`Nice!`) : (`Yikes...`)} You turned $20 into ${BalanceAmount}
                    </div>
                </form>
                <div className="flex justify-end pr-6 text-white font-tech space-x-1 items-center">
                    <div className="flex justify-end text-white font-tech space-x-1 items-center"
                         onClick={handleClickBack}>
                        <IoArrowBack fill="white" size="18"/>
                        <span>Back</span>
                    </div>
                </div>
            </div>
        )
    }

    const saveScore = async (username: string): Promise<{ success: boolean }> => {
        try {
            const {data, error} = await supabase
                .from('userscore')
                .insert([
                    {
                        username: username,
                        game_log_data: GameLog  // Ensure GameLog is defined and correct
                    }
                ]);

            if (error) {
                throw new Error(error.message);
            }

            console.log('Data inserted:', data);
            return {success: true};
        } catch (error) {
            console.error('Failed to save score:', error);
            return {success: false};
        }
    };

    function renderDisplayBar(GameState: GameOutComeType) {
        switch (GameState) {
            case 'PLACING BET':
                return <PlaceBets/>
            case 'IN PLAY' :
                return <ActionButtons/>
            case 'SAVING GAME':
                return <RenderSaveUserNameForm onSave={saveScore}/>
            default:
                return <OutCome/>
        }
    }

    interface BabyChipAmount {
        [key: number]: number;
    }

    function getBetBabyChips(amount: number): BabyChipAmount {
        //e.g. 107
        const denominations = [100, 50, 25, 10, 5, 1];
        const baby_chips: BabyChipAmount = [];
        for (let d of denominations) {
            if (amount >= d) {
                baby_chips[d] = Math.round(amount / d)
                amount = amount % d
            }
        }
        return baby_chips
    }


    const renderBabyChips = (baby_chips: BabyChipAmount) => {

        const baby_chip_class = "flex flex-col w-5 -mb-3"
        return (
            Object.entries(baby_chips).map(([chip_type, amount]) => {
                    const chip_type_n = parseInt(chip_type, 10);
                    switch (chip_type_n) {
                        case 1:
                            return <button className="flex flex-col-reverse" onClick={() => handleBabyChipClick(1)}
                                           key={chip_type}>
                                {
                                    Array.from({length: amount}, (_, index) => (
                                        <div className={baby_chip_class}
                                             key={chip_type + '-' + index}
                                             style={{zIndex: index + 1}}>
                                            <C1_ className="w-full h-full transform"/>
                                        </div>))
                                }
                            </button>
                        case 5:
                            return <button className="flex flex-col-reverse" onClick={() => handleBabyChipClick(5)}
                                           key={chip_type}>
                                {
                                    Array.from({length: amount}, (_, index) => (
                                        <div className={baby_chip_class}
                                             key={chip_type + '-' + index}
                                             style={{zIndex: index + 1}}>
                                            <C5_ className="w-full h-full transform"/>
                                        </div>))
                                }
                            </button>
                        case 10:
                            return <button className="flex flex-col-reverse" onClick={() => handleBabyChipClick(10)}
                                           key={chip_type}>
                                {
                                    Array.from({length: amount}, (_, index) => (
                                        <div className={baby_chip_class}
                                             key={chip_type + '-' + index}
                                             style={{zIndex: index + 1}}>
                                            <C10_ className="w-full h-full transform"/>
                                        </div>))
                                }
                            </button>
                        case 25:
                            return <button className="flex flex-col-reverse" onClick={() => handleBabyChipClick(25)}
                                           key={chip_type}>
                                {
                                    Array.from({length: amount}, (_, index) => (
                                        <div className={baby_chip_class}
                                             key={chip_type + '-' + index}
                                             style={{zIndex: index + 1}}>
                                            <C25_ className="w-full h-full transform"/>
                                        </div>))
                                }
                            </button>
                        case 50:
                            return <button className="flex flex-col-reverse" onClick={() => handleBabyChipClick(50)}
                                           key={chip_type}>
                                {
                                    Array.from({length: amount}, (_, index) => (
                                        <div className={baby_chip_class}
                                             key={chip_type + '-' + index}
                                             style={{zIndex: index + 1}}>
                                            <C50_ className="w-full h-full transform"/>
                                        </div>))
                                }
                            </button>
                        case 100:
                            return <button className="flex flex-col-reverse" onClick={() => handleBabyChipClick(100)}
                                           key={chip_type}>
                                {
                                    Array.from({length: amount}, (_, index) => (
                                        <div className={baby_chip_class}
                                             key={chip_type + '-' + index}
                                             style={{zIndex: index + 1}}>
                                            <C100_ className="w-full h-full transform"/>
                                        </div>))
                                }
                            </button>
                    }
                }
            )
        )

    }
    return (
        // <div className="flex flex-col items-center space-y-auto text-white h-screen overflow-hidden w-screen">
        <>
            <div ref={menuRef} className="absolute top-8 right-4 items-end z-20">
                <div className="flex flex-row justify-end space-x-3">
                    <div
                        className="flex flex-row justify-center items-center space-x-2 bg-grey pl-2.5 pr-4 py-1 rounded-badge">
                        <svg width="22" height="22" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M31.5203 19.8728C33.6592 11.3011 28.4444 2.61853 19.8728 0.479663C11.3011 -1.6592 2.61853 3.5556 0.479663 12.1272C-1.6592 20.6989 3.5556 29.3815 12.1272 31.5203C20.6989 33.6592 29.3815 28.4444 31.5203 19.8728Z"
                                fill="#FDC95A"/>
                            <path
                                d="M28.6295 19.1523C30.3698 12.1775 26.1266 5.11254 19.1518 3.37215C12.1771 1.63176 5.11208 5.87503 3.37169 12.8498C1.6313 19.8245 5.87457 26.8895 12.8493 28.6299C19.824 30.3703 26.8891 26.127 28.6295 19.1523Z"
                                fill="#E9AD41"/>
                            <path
                                d="M21.0505 8.53891C20.5561 7.87569 19.9792 7.30427 19.2403 6.91393C18.755 6.65758 18.2462 6.49634 17.7176 6.4056C17.6995 6.10793 17.6814 5.81028 17.6634 5.51262C17.6572 5.41131 17.6511 5.31004 17.645 5.20875C17.6229 4.8457 17.4912 4.49543 17.2229 4.23981C16.986 4.01412 16.6009 3.84664 16.2687 3.86484C15.9122 3.88441 15.5414 4.00961 15.2997 4.28687C15.0733 4.54669 14.9033 4.8868 14.9248 5.24114C14.9525 5.69864 14.9803 6.15613 15.0081 6.61363C14.4468 6.79799 13.8946 7.06067 13.4155 7.4033C13.1101 7.62167 12.8114 7.86007 12.546 8.12665C12.2848 8.38895 12.0639 8.68743 11.8545 8.9918C11.7075 9.20531 11.5815 9.43332 11.4818 9.67264C11.3399 10.0133 11.2065 10.3567 11.1436 10.7214C11.0138 11.474 11.0336 12.2398 11.2612 12.9739C11.5196 13.8077 11.988 14.6425 12.6308 15.2401C13.2583 15.8234 14.0657 16.1974 14.9065 16.3442C15.6432 16.4728 16.3868 16.4836 17.1303 16.5341C17.229 16.5408 17.3273 16.5512 17.4257 16.5608C17.6537 16.5952 17.8788 16.6447 18.0979 16.7164C18.1866 16.7583 18.2728 16.8047 18.3562 16.8561C18.4631 16.9475 18.5622 17.0469 18.6556 17.1522C18.7825 17.3262 18.8945 17.5097 18.9901 17.7026C19.0503 17.868 19.0975 18.0373 19.1319 18.21C19.1467 18.3831 19.1486 18.5565 19.1377 18.7298C19.1052 18.9215 19.0582 19.1099 18.9967 19.2943C18.9015 19.5092 18.7883 19.715 18.6586 19.9109C18.4761 20.1408 18.2723 20.3518 18.0501 20.5437C17.8425 20.6964 17.6235 20.8319 17.3924 20.9459C17.1381 21.0412 16.876 21.1119 16.6088 21.1609C16.2753 21.1962 15.9399 21.1994 15.6056 21.1718C15.2921 21.1238 14.9842 21.0482 14.6847 20.9437C14.4576 20.8437 14.2396 20.7257 14.0328 20.5886C13.8853 20.4685 13.7479 20.3372 13.621 20.1953C13.5302 20.0659 13.4497 19.9302 13.3786 19.7891C13.3637 19.7479 13.3491 19.7067 13.3357 19.6649C13.2252 19.3209 13 19.013 12.6786 18.8372C12.3919 18.6803 11.976 18.6163 11.6601 18.7199C11.3208 18.8312 10.9946 19.0471 10.8323 19.377C10.6792 19.6881 10.606 20.0561 10.715 20.3955C10.9887 21.2478 11.4971 22.0465 12.2072 22.6011C12.561 22.8774 12.928 23.1305 13.3382 23.3146C13.7493 23.4991 14.1789 23.6579 14.6201 23.7537C14.946 23.8244 15.2802 23.8709 15.6171 23.8938C15.6407 24.2822 15.6643 24.6707 15.6878 25.0592C15.694 25.1605 15.7001 25.2618 15.7062 25.3631C15.7283 25.7262 15.86 26.0764 16.1283 26.3321C16.3652 26.5578 16.7503 26.7253 17.0825 26.707C17.439 26.6875 17.8098 26.5623 18.0515 26.285C18.278 26.0252 18.448 25.6851 18.4265 25.3307C18.3894 24.7205 18.3524 24.1103 18.3154 23.5C18.7258 23.3379 19.1164 23.1268 19.4739 22.8606C20.1897 22.3276 20.8025 21.6983 21.2339 20.9089C21.6333 20.1779 21.8565 19.3486 21.8665 18.5151C21.8768 17.6674 21.6316 16.8123 21.2064 16.0818C20.9812 15.6948 20.6914 15.3281 20.3741 15.0134C20.2457 14.886 20.1029 14.7815 19.9571 14.675C19.8116 14.5688 19.669 14.465 19.5094 14.3811C18.403 13.7995 17.1569 13.8391 15.946 13.7497C15.8743 13.7444 15.8029 13.7365 15.7314 13.7297C15.4655 13.691 15.203 13.6336 14.9482 13.5481C14.8358 13.4954 14.7268 13.4359 14.6218 13.3696C14.5205 13.2847 14.4251 13.1933 14.3359 13.0957C14.1918 12.8961 14.066 12.6831 13.9588 12.4614C13.8864 12.2686 13.8293 12.0709 13.7897 11.8688C13.776 11.7077 13.7736 11.5462 13.7834 11.3849C13.8118 11.2205 13.852 11.0587 13.9041 10.9003C13.9877 10.7134 14.0865 10.534 14.1991 10.3629C14.3663 10.1529 14.5526 9.95938 14.7551 9.78297C15.0051 9.59848 15.2719 9.43869 15.5522 9.3048C15.8305 9.19762 16.1177 9.11623 16.4111 9.0628C16.653 9.03905 16.8962 9.03569 17.1387 9.05355C17.3364 9.08665 17.5309 9.13504 17.721 9.19861C17.8964 9.27747 18.0652 9.36945 18.2262 9.47451C18.4092 9.62179 18.5782 9.78477 18.7328 9.96159C18.8219 10.1148 18.94 10.2377 19.089 10.3283C19.2228 10.4446 19.3783 10.5214 19.5554 10.5587C19.879 10.6395 20.3023 10.5925 20.5848 10.4051C20.8783 10.2105 21.1315 9.92362 21.2041 9.56849C21.2723 9.23527 21.2626 8.82342 21.0505 8.53891Z"
                                fill="#FFDA77"/>
                        </svg>
                        <div
                            className="flex flex-col h-full justify-center items-center font-bold text-18px">{BalanceAmount}</div>
                    </div>
                    <BiDotsVerticalRounded className="fill-gray-800 size-8"
                                           onClick={() => setMenuOpen(currentState => !currentState)}
                    />
                </div>
                <div>
                    {MenuOpen && <MenuTopRight isChecked={[TrainingMode, CheatSheetVisible, CardCountingMode]}
                                               onClickGame_Stats={() => setGameStatsOpen(true)}
                                               onClickTraining_Mode={() => setTrainingMode(currentState => !currentState)}
                                               onClickCheat_Sheet={() => setCheatSheetVisible(currentState => !currentState)}
                                               onClickCard_Counting={() => setCardCountingMode(currentState => !currentState)}
                                               onClickCash_Out={() => handleClickCashOutEarly()}
                    />}
                </div>
            </div>

            <div className="flex flex-col pt-4 space-y-0 overflow-y-auto w-full">
                <div className="flex flex-col pt-44 justify-center space-y-4 w-full">
                    {/*{GameState != 'SAVING GAME' &&*/}
                    {/*<div className="flex flex-row justify-center items-center pt-44">*/}

                    {/*    {*/}
                    {/*        DealerHand.map((card, index) =>*/}
                    {/*            (*/}
                    {/*                <PlayingCard*/}
                    {/*                    key={`${card.suit}-${card.value}-${index}`}*/}
                    {/*                    value={card.value}*/}
                    {/*                    display={card.display}*/}
                    {/*                    suit={card.suit}*/}
                    {/*                    visible={card.visible}*/}
                    {/*                />*/}
                    {/*            )*/}
                    {/*        )*/}
                    {/*    }*/}
                    {/*    {!(GameState == 'IN PLAY' || GameState == 'PLACING BET') &&*/}
                    {/*    <div className="pl-6 pt-14 text-white">{DealerHandSumState}</div>*/}
                    {/*    }*/}
                    {/*</div>}*/}

                    {GameState != 'SAVING GAME' &&
                    <div
                        className={`flex h-[6rem] space-x-8 mx-auto`}
                        ref={splitCardsContainer}
                        onTouchStart={handleTouchStart}
                        onTouchEnd={handleTouchEnd}
                    >

                        <div className={'inline-flex px-auto transition-transform transform'}>
                            {[DealerHand].map((hand, index) =>
                                (
                                    <div key={index}
                                         className={'flex justify-center'}
                                    >
                                        <div className="flex flex-col space-y-4">
                                            <div className="flex flex-row items-end h-24 justify-center">

                                                <div className="relative flex flex-col items-end mx-2 ">
                                                    <div
                                                        className={`flex flex-row inline-flex justify-center px-4 ring-accent-content rounded-lg`}>
                                                        {
                                                            hand.map((card, index) =>
                                                                (
                                                                    <PlayingCard
                                                                        key={`${card.suit}-${card.value}-${index}`}
                                                                        value={card.value}
                                                                        display={card.display}
                                                                        suit={card.suit}
                                                                        visible={card.visible}
                                                                    />
                                                                )
                                                            )
                                                        }
                                                    </div>

                                                </div>
                                                {(PlayerStand || (!(GameState == 'IN PLAY') && !(GameState == 'PLACING BET'))) &&
                                                <div
                                                    className="absolute flex ml-1 size-6 bottom-0 -right-5 rounded-lg items-center justify-center bg-info-content/60 text-white text-sm">{DealerHandSumState}</div>
                                                }
                                            </div>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                    }
                    <div className="flex items-center justify-center">
                        <div className="relative w-full max-w-[480px] overflow-hidden">
                            <div
                                className={`absolute inset-y-0 left-0 w-24 ${!["SAVING GAME", "GAME OVER"].includes(GameState) && "bg-gradient-to-r to-info-content/80 from-transparent"}`}/>
                            <div
                                className={`absolute inset-y-0 left-24 right-24 w-auto ${!["SAVING GAME", "GAME OVER"].includes(GameState) && "bg-info-content/80"}`}/>
                            <div
                                className={`absolute inset-y-0 right-0 w-24 ${!["SAVING GAME", "GAME OVER"].includes(GameState) && "bg-gradient-to-l to-info-content/80 from-transparent"}`}/>
                            <div
                                className="flex h-full min-h-[100px] justify-center overflow-x-auto py-4 px-2 z-10"
                                // ref={scrollContainerRef}
                            >
                                <div className="flex px-auto z-20">
                                    {renderDisplayBar(GameState)}
                                </div>
                            </div>
                        </div>
                    </div>
                    {GameState != 'SAVING GAME' &&
                    <div
                        className={`flex h-[10rem] ${GameState == 'PLACING BET' ? ("space-x-8 mx-auto") : ("w-full overflow-x-scroll")}`}
                        ref={splitCardsContainer}
                        onTouchStart={handleTouchStart}
                        onTouchEnd={handleTouchEnd}
                    >

                        <div className={'inline-flex px-auto transition-transform transform'}
                             style={{
                                 position: `${GameState == 'PLACING BET' ? ("inherit") : ("relative")}`,
                                 // This moves the cards once the player stands or stops hitting
                                 // left: `${GameState == 'PLACING BET' ? ("inherit") : (`calc(50vw - ${64 + 12 * (PlayerHand[PlayerHandIndex].cards.length - 2)}px)`)}`,
                                 // transform: `translateX(-${GameState == 'PLACING BET' ? (0) : (CardShift)}px)`,
                                 margin: `0 ${GameState == 'PLACING BET' ? ("0") : (`calc(50vw - ${64 + 12 * (PlayerHand[PlayerHandIndex].cards.length - 2)}px)`)}`
                                 // transform: `${PlayerHandIndex ? ("translateX(calc(-${56 + 12 * (PlayerHand[PlayerHandIndex].cards.length - 2)}px))") : ("")}`

                             }}>
                            {PlayerHand.map((hand, index) =>
                                (
                                    <div key={index}
                                         className={`${GameState == 'PLACING BET' ? ('flex justify-center') : (`flex-shrink-0 mx-4 transition-transform transform`)}`}
                                        // style={{transform: `translateX(-${GameState == 'PLACING BET' ? (0) : (CardShift)}px)`}}
                                    >
                                        <div className="flex flex-col space-y-4">
                                            {GameState != 'GAME OVER' &&
                                            <div className="flex flex-col items-center pt-0 space-y-4">
                                                <div className="flex flex-row h-1">
                                                    {renderBabyChips(getBetBabyChips(hand.betDisplay))}
                                                </div>
                                                <div
                                                    className="flex flex-col items-center h-5 text-white">{`$${hand.betDisplay}`}</div>
                                            </div>}

                                            <div className="flex flex-row h-24 justify-center">
                                                {GameState == 'PLACING BET' ? (
                                                    <div
                                                        className="absolute flex flex-row items-center justify-center space-x-2">
                                                        <button
                                                            className="flex btn btn-sm disabled:bg-red-600 disabled:text-white disabled:opacity-90"
                                                            onClick={handleClickPlaceBet}
                                                            onTouchStart={handleClickPlaceBet}
                                                            disabled={hand.betDisplay <= 0}
                                                            // disabled={BetAmount == 0}
                                                        >
                                                            {hand.betDisplay <= 0 ? 'Select Amount' : 'Place Bet'}
                                                        </button>
                                                        <button
                                                            className={`btn btn-sm flex items-center justify-center h-8 px-3 m-0 border-0 ${isShaking ? 'animate-shake' : ''}`}
                                                            onClick={handleClickResetBet}> Reset
                                                            {/*<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"*/}
                                                            {/*     stroke-width="1.5" stroke="currentColor"*/}
                                                            {/*     className="flex items-center justify-center h-full w-full">*/}
                                                            {/*    <path stroke-linecap="round" stroke-linejoin="round"*/}
                                                            {/*          d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"/>*/}
                                                            {/*</svg>*/}

                                                        </button>
                                                    </div>) : (
                                                    <>
                                                        <div className="relative flex-col items-center mx-2 py-1">
                                                            <div
                                                                className={`${index == PlayerHandIndex ? (`ring-2 `) : ("")}` + `flex flex-row inline-flex justify-center px-4 ring-accent-content rounded-lg`}>
                                                                {
                                                                    hand.cards.map((card, index) =>
                                                                        (
                                                                            <PlayingCard
                                                                                key={`${card.suit}-${card.value}-${index}`}
                                                                                value={card.value}
                                                                                display={card.display}
                                                                                suit={card.suit}
                                                                                visible={card.visible}
                                                                            />
                                                                        )
                                                                    )
                                                                }
                                                            </div>

                                                        </div>
                                                        {(PlayerStand || !(GameState == 'IN PLAY')) &&
                                                        <div
                                                            className="absolute -right-5 flex size-6 bottom-[76px] -right-6 rounded-lg items-center justify-center bg-info-content/60 text-white text-sm">{hand.sum}</div>}
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                    }
                </div>
                {/*<div className="flex flex-row text-black">*/}
                {/*    <div>Card Count: ({GameState == "IN PLAY" ? Count : "?"}) - Deck*/}
                {/*        Count: {DeckCount} ({Math.round((GlobalDeck.length / (DeckCount * 52)) * 100)}%)*/}
                {/*    </div>*/}
                {/*</div>*/}
            </div>

            {CheatSheetVisible &&
            <div className="absolute z-20">
                <div className="flex flex-row">
                    <SwipeablePager split_available={!splitDisabled} dd_available={!doubleDownDisabled}
                                    playerHand={PlayerHand[PlayerHandIndex].cards.every(card => card.visible) ? PlayerHand[PlayerHandIndex].cards : null}
                                    dealerHand={(DealerHand && DealerHand[0] ? DealerHand[0] : null)}
                                    onClose={() => setCheatSheetOpen(false)}/>
                </div>
            </div>}

        </>);
};

export default MainContent;
