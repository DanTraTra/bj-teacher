import React, {useEffect, useState} from 'react';
import './PlayingCard'
import 'tailwindcss/tailwind.css'
import {Simulate} from "react-dom/test-utils";
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

const buttonClass = "btn btn-sm btn-circle text-white size-8 w-12 h-12"
const chipClass = "flex flex-col p-0 m-0 w-14 h-14 hover:bg-transparent hover:border-transparent bg-transparent border-transparent transition duration-100 ease-in-out hover:brightness-125"
type Suit = "hearts" | "diamonds" | "spades" | "clubs";
const animationTime = 600;
const dealerAnimationTime = animationTime + 300

interface UserNameProps {
    onSave: (UserName: string) => Promise<{ success: boolean }>;
}

interface MainContentProps {
    onChange: (screen: Screens) => void;
}

// Card type with specific allowable card values
// type Card = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

type PlayerHand = { cards: CardProps[], sum: number, bet: number, winMultiplier: number, doubleDown: boolean }

// Interface for a set of player and dealer cards
export interface GameLog {
    PlayerCards: PlayerHand[]; // multiple hands per player for when implementing splitting
    DealerCards: CardProps[];
    DealerHandSum: number;
    EndingBalance: number;
    DateTime: Date;
}

const MainContent: React.FC<MainContentProps> = ({onChange}) => {
    type GameOutComeType =
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

    const initialBalance = 20


    // const [UserName, setUserName] = useState('');

    const [BalanceAmount, setBalanceAmount] = useState<number>(initialBalance);
    const [DeckCount, setDeckCount] = useState(6)

    const [GameState, setGameState] = useState<GameOutComeType>("PLACING BET");
    const [GameCount, setGameCount] = useState(0);

    const [GameLog, setGameLog] = useState<GameLog[]>([])
    const [MaxBet, setMaxBet] = useState(0)

    const [WinMultiplier, setWinMultiplier] = useState(1)
    const [BetAmount, setBetAmount] = useState(0)
    const [BetAnimationChange, setBetAnimationChange] = useState(0)
    const [WinAmount, setWinAmount] = useState(0)

    const [DealerHand, setDealerHand] = useState<CardProps[]>([]);
    const [PlayerHand, setPlayerHand] = useState<CardProps[]>([]);

    const [DealerHandSumState, setDealerHandSumState] = useState<number>(0);
    const [PlayerHandSumState, setPlayerHandSumState] = useState<number>(0);

    const [PlayerStand, setPlayerStand] = useState<boolean>(false);
    const [DealerHit, setDealerHit] = useState<boolean>(false);
    const [DealerTurnOver, setDealerTurnEnded] = useState<boolean>(false);


    const [DealerBlackJackState, setDealerBlackJackState] = useState<boolean>(false);
    const [PlayerBlackJackState, setPlayerBlackJackState] = useState<boolean>(false);

    const [HouseWins, setHouseWins] = useState(0);
    const [PlayerWins, setPlayerWins] = useState(0);

    const [Count, setCount] = useState(0);
    const [CountLog, setCountLog] = useState([{value: '', change: 0, countNow: 0}]);


    const initializeDeck = (deck_count: number): CardProps[] => {
        const suits: Suit[] = ["hearts", "diamonds", "spades", "clubs"];
        const picture_card = ['J', 'Q', 'K']
        const deck: CardProps[] = []

        for (let d = 0; d < deck_count; d++) {
            for (let s of suits) {
                for (let i = 1; i <= 13; i++) {
                    const card: CardProps = {
                        suit: s,
                        value: i > 10 ? 10 : i,
                        display: `${i > 10 ? picture_card[i % 10 - 1] : i}`,
                        visible: false,
                    }
                    if (i === 1) {
                        card.display = 'A'
                    }
                    deck.push(card)
                }
            }

        }

        return deck
    }

    const initializeFakeDeck = (deck_count: number): CardProps[] => {
        const suits: Suit[] = ["hearts", "diamonds", "spades", "clubs"];
        const picture_card = ['J', 'Q', 'K']
        const deck: CardProps[] = []

        for (let s of suits) {
            for (let i = 1; i <= 13; i++) {
                const card: CardProps = {
                    suit: s,
                    value: i > 10 ? 1 : i,
                    display: `${i > 10 ? 'A' : i}`,
                    visible: false,
                }
                if (i === 1) {
                    card.display = 'A'
                }
                deck.push(card)
            }
        }

        return deck
    }
    const [GlobalDeck, setGlobalDeck] = useState<CardProps[]>(initializeDeck(DeckCount));

    const getRandomCard = (visible: boolean): CardProps => {

        const indices = Object.keys(GlobalDeck)
        if (indices.length === 0) {
            throw new Error("The deck is empty");
        }

        const randomIndex = Math.floor(Math.random() * indices.length)
        const randomCard = GlobalDeck[randomIndex];
        randomCard.visible = visible;

        GlobalDeck.splice(randomIndex, 1)

        setGlobalDeck(GlobalDeck)

        return randomCard;
    }

    const addRandomCardToDealerHand = () => {
        const newCard = getRandomCard(false);
        const newDealerHand = [...DealerHand, newCard];
        console.log("Adding card to Dealer Hand")

        setDealerHand(newDealerHand)
        setTimeout(() => {
            setDealerHand(currentHand => {
                return currentHand.map(card => ({
                    ...card, visible: true
                }));
            })
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
        const playerCards: PlayerHand = {
            cards: PlayerHand,
            sum: PlayerHandSumState,
            winMultiplier: WinMultiplier,
            bet: BetAmount,
            doubleDown: false
        }

        const thisGameLog: GameLog = {
            PlayerCards: [playerCards],
            DealerCards: DealerHand,
            DealerHandSum: DealerHandSumState,
            EndingBalance: (BalanceAmount + BetAmount),
            DateTime: new Date()
        }

        setGameLog(currentLog => {
            return [...currentLog, thisGameLog]
        })
    }

    const [isHitDisabled, setIsHitDisabled] = useState(false);
    const handleClickHit = () => {
        console.log("CLICKED HIT")
        setIsHitDisabled(true)
        const random_card = getRandomCard(false)
        setPlayerHand(currentHand => [...currentHand, random_card]);
        setTimeout(() => {
            updateCount(random_card)
        }, animationTime)
        setTimeout(() => {
            setIsHitDisabled(false)
        }, animationTime + 100)
    }

    const [isStandDisabled, setIsStandDisabled] = useState(false);
    const handleClickStand = () => {
        console.log("CLICKED STAND")
        setIsStandDisabled(true)
        setPlayerStand(true)
        //Dealer gets "card dealt" animation toggles off and then the game outcome gets revealed while the player stand continues until next game
        // setDealerHit(true);

        //    Animation logic:
        //    1. handClickStand just flips the second card
        //    2. useEffect [DealerHand] -> checks all cards are visible -> sums and sets a DealerHit flag for the next card to be dealt or for the outcome to be decided
        //    2a. useEffect [DealerHit] -> adds another card to DealersHand

        // Flip the dealers hidden card
        const dealHandCopy = [...DealerHand]
        dealHandCopy[1] = {...dealHandCopy[1], visible: true}
        setDealerHand(dealHandCopy)
    }

    const handleClickStartOver = () => {
        updateGameLog()
        const newDeck = initializeDeck(6)
        setGlobalDeck(newDeck)
        setUpGame()
        setBalanceAmount(initialBalance)
        setGameCount(0)
        setGameLog([])
    }

    const handleClickKeepGoing = () => {
        updateGameLog()
        setUpGame()
        setGameCount(prevState => prevState + 1)
    }

    useEffect(() => {
        console.log("GameLog", GameLog)
    }, [GameLog])

    const handleClickCashOut = () => {
        updateGameLog()
        setGameState("SAVING GAME")
        setBalanceAmount(currentBalance => currentBalance + BetAmount)
        setBetAmount(0)
    }

    const handleChipClick = (amount: number) => {
        console.log(`Chip Clicked - added ${amount} to BetAmountState`)
        if (amount <= BalanceAmount) {
            setBetAmount(currentAmount => currentAmount + amount)
            setBalanceAmount(currentValue => currentValue - amount)
        }

    }

    const handleBabyChipClick = (amount: number) => {
        console.log(`Baby Chip Clicked - removed ${amount} from BetAmountState`)
        setBetAmount(currentAmount => currentAmount - amount)
        setBalanceAmount(currentValue => currentValue + amount)


    }

    const handlePlaceBet = () => {
        console.log("Pressed place bet")
        setGameState('IN PLAY')
    }

    const handleResetBet = () => {
        setBalanceAmount(currentBalance => currentBalance + BetAmount)
        setBetAmount(0)
    }

    const handleResetCount = () => {
        setCount(0)
        setCountLog([{value: 'Reset', countNow: 0, change: 0}])
        DealerHand.map((card) => {
            if (card.visible) {
                updateCount(card)
            }
        })
        PlayerHand.map(card => {
            if (card.visible) {
                updateCount(card)
            }
        })
    }

    const revealPlayerCards = () => {
        if (GameState == 'IN PLAY') {
            setTimeout(() => {
                setPlayerHand(currentHand => currentHand.map((card, index) => {
                            return {...card, visible: true}
                        }
                    )
                )
            }, 0);
        }
    }

    const revealDealerCard = () => {
        if (GameState == 'IN PLAY') {
            setTimeout(() => {
                setDealerHand(currentHand =>
                    currentHand.map((card, index) => {
                            if (index == 0) {
                                return {...card, visible: true}
                            } else {
                                return {...card}
                            }
                        }
                    )
                )
            }, 0);
        }
    }


    const setUpGame = () => {
        setGameState("PLACING BET");
        setPlayerStand(false);
        setDealerHit(false);
        setIsStandDisabled(false);

        // setGlobalDeck(initializeDeck(1));
        const random_player_card_1 = getRandomCard(false);
        const random_dealer_card_1 = getRandomCard(false);
        const random_player_card_2 = getRandomCard(false);
        const random_dealer_card_2 = getRandomCard(false);
        // Create an addToDeck function
        setPlayerHand([random_player_card_1]);
        updateCount(random_player_card_1)
        setPlayerHand(currentHand => [...currentHand, random_player_card_2]);
        updateCount(random_player_card_2)

        setDealerHandSumState(random_dealer_card_1.value)
        setDealerHand([random_dealer_card_1, random_dealer_card_2])
        updateCount(random_dealer_card_1)

    }

    useEffect(() => {
        setUpGame()
        // revealPlayerCards()
    }, [GameCount])

    useEffect(() => {
        revealPlayerCards()
        // Player bust with A even is it's less than 21
        setTimeout(() => {
            if (PlayerHandSumState > 21) {
                setGameState("PLAYER BUST")
                setHouseWins(currentAmount => currentAmount + 1)

            }
            // else if (PlayerHandSumState === 21 && PlayerHand.length == 2 && DealerHandSumState != 21) {
            //     // The dealer must also not have blackjack
            //     setPlayerBlackJackState(true)
            //     setGameState("PLAYER BLACKJACK")
            //     setPlayerWins(currentAmount => currentAmount + 1)
            //
            // }

        }, 0)
        // console.log("PlayerHandSumState", PlayerHandSumState)
    }, [PlayerHandSumState])

    useEffect(() => {
        const PlayerHand_copy = [...PlayerHand]
        let playerHandSum = PlayerHand_copy.reduce((acc, currentCard) => {
            return acc + (currentCard.display === 'A' ? 1 : Number(currentCard.value))
        }, 0)
        // Adjust sum based on if there are Aces
        if (PlayerHand_copy.some((card) => card.display === 'A')) {
            // Loop through only the Aces and adjust to 11 if players hand wouldn't bust
            for (let [index, card] of PlayerHand_copy.entries()) {
                if (card.display === "A" && (playerHandSum + 10 <= 21)) {
                    PlayerHand_copy[index].value = 11;
                    playerHandSum = PlayerHand_copy.reduce((acc, currentCard) => {
                        return acc + Number(currentCard.value)
                    }, 0)
                }
            }
        }

        if (PlayerHand.some(card => !card.visible)) {
            revealPlayerCards()
        }

        if (GameState == "IN PLAY") {
            setTimeout(() => {
                setPlayerHandSumState(playerHandSum)
            }, animationTime + 150)
        }

    }, [PlayerHand])

    useEffect(() => {

        setTimeout(() => {
            let dealerHandSum = DealerHand.reduce((acc, card) => acc + card.value, 0);
            setDealerHandSumState(dealerHandSum);

        }, 0)

    }, [DealerHand])

    useEffect(() => {
        const DealerHand_copy = [...DealerHand]
        let dealerHandSum = DealerHand_copy.reduce((acc, currentCard) => {
            return acc + (currentCard.display === 'A' ? 1 : Number(currentCard.value))
        }, 0)
        // Adjust sum based on if there are Aces
        if (DealerHand_copy.some((card) => card.display === 'A')) {
            // Loop through only the Aces and adjust to 11 if players hand wouldn't bust
            for (let [index, card] of DealerHand_copy.entries()) {
                if (card.display === "A" && (dealerHandSum + 10 <= 21)) {
                    DealerHand_copy[index].value = 11;
                    dealerHandSum = DealerHand_copy.reduce((acc, currentCard) => {
                        return acc + Number(currentCard.value)
                    }, 0)
                }
            }
        }

        // setTimeout(() => {
        //     setDealerHandSumState(dealerHandSum)
        // }, animationTime + 700)
    }, [DealerHand, DealerHandSumState])

    useEffect(() => {
        // console.log("inside useEffect dep [DealerHit, DealerHandSumState]")
        // console.log("PlayerStand - DD", PlayerStand)
        // console.log("DealerHit - DD", DealerTurnOver)
        if (PlayerStand && DealerTurnOver) {

            setTimeout(() => {
                // console.log("DealerHandSumState - DD", DealerHandSumState)
                // console.log("PlayerHandSumState - DD", PlayerHandSumState)

                if (DealerHandSumState > 21) {
                    console.log("Setting GameState: DEALER BUST")

                    setGameState("DEALER BUST")
                    setPlayerWins(currentAmount => currentAmount + 1)

                } else {
                    if (DealerHandSumState == PlayerHandSumState) {
                        console.log("Setting GameState: PUSH")
                        setGameState("PUSH")

                    } else if (PlayerHandSumState === 21 && PlayerHand.length == 2 && DealerHandSumState != 21) {
                        // The dealer must also not have blackjack
                        setPlayerBlackJackState(true)
                        setGameState("PLAYER BLACKJACK")
                        setPlayerWins(currentAmount => currentAmount + 1)

                    } else if (DealerHandSumState > PlayerHandSumState) {
                        console.log("Setting GameState: HOUSE WINS")

                        setGameState("HOUSE WINS")
                        setHouseWins(currentAmount => currentAmount + 1)

                    } else if (DealerHandSumState < PlayerHandSumState) {
                        console.log("Setting GameState: YOU WIN")

                        setGameState("YOU WIN")
                        setPlayerWins(currentAmount => currentAmount + 1)

                    }
                }

                // if (DealerHandSumState === 21 && PlayerHand.some((card) => card.value === 1)) {
                //     setDealerBlackJackState(true)
                // }

            }, dealerAnimationTime + 100)

        }

    }, [DealerTurnOver])

    useEffect(() => {
        // console.log("DealerHit", DealerHit)
        // console.log("DealerHand", DealerHand.map(card => card.visible))
        if (DealerHit && DealerHand.every(card => card.visible)) {
            //    Animation logic:
            //    1. handClickStand flips the second card and sets PlayerStand flag
            //    2. useEffect [DealerHit, DealerHandSumState] -> checks all cards are visible -> sums and sets a DealerHit flag for dealer hit (sum < 17) OR for the outcome to be decided
            //    2a. useEffect [DealerHit] -> adds another card to DealersHand
            console.log("Getting another card - DD")

            setTimeout(() => {
                addRandomCardToDealerHand()
            }, dealerAnimationTime)
        }
    }, [DealerHit, DealerHand])

    useEffect(() => {
            // console.log("inside useEffect dep [PlayerStand, DealerHandSumState]")
            // console.log("DealerHandSumState - PD", DealerHandSumState)
            // console.log("PlayerHandSumState - PD", PlayerHandSumState)

            if (PlayerStand) {

                if (DealerHandSumState < 17) {
                    console.log("Setting Dealer Hit True")
                    setDealerHit(true);
                } else {
                    console.log("Setting Dealer Hit False")
                    setDealerHit(false);

                    console.log("Setting DealerTurnEnded True")
                    setDealerTurnEnded(true);
                }

            } else {
                console.log("Setting Dealer Hit False")
                setDealerHit(false);
                console.log("Setting DealerTurnEnded False")
                setDealerTurnEnded(false);

            }

        }, [PlayerStand, DealerHandSumState, DealerHand]
    )

    useEffect(() => {

        if (GameState == 'PLAYER BUST' || GameState == 'PLAYER BLACKJACK') {
            //Reveal dealers card if isn't turned over
            setDealerHand(currentHand =>
                currentHand.map(card => {
                    return {...card, visible: true}
                })
            )
        } else if (GameState == 'IN PLAY') {
            revealPlayerCards()
            revealDealerCard()
        }

        BetAmount >= 20 ? setBetAnimationChange(Math.round(BetAmount / 20)) : setBetAnimationChange(1)
        GameState == "PLAYER BLACKJACK" ? setWinAmount(BetAmount * 2.5) : setWinAmount(BetAmount * 2)
        if (GameState == "PLAYER BLACKJACK") {
            setWinMultiplier(2.5)
        } else if (WIN.includes(GameState)) {
            setWinMultiplier(2)
        } else if (LOSE.includes(GameState)) {
            setWinMultiplier(0)
        } else if (GameState == "PUSH") {
            setWinMultiplier(1)
        }

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
        // console.log("in userEffect [BetAmount, GameState]")
        // console.log("GameState", GameState)
        // console.log("BetAmount", BetAmount)
        // console.log("WinAmount", WinAmount)
        // console.log("BetChange", BetChange)


        if (BetAmount > 0) {

            if (LOSE.includes(GameState)) {
                const timer = setTimeout(() => {
                    if (BetAmount >= BetAnimationChange) {
                        setBetAmount(BetAmount - BetAnimationChange)
                    } else {
                        setBetAmount(0)
                    }
                }, 50);
                return () => clearTimeout(timer);

            } else if (WIN.includes(GameState)) {
                const timer = setTimeout(() => {
                    if (WinAmount - BetAmount >= BetAnimationChange) {
                        setBetAmount(BetAmount + BetAnimationChange)
                    } else {
                        setBetAmount(WinAmount)
                    }
                }, 50);
                return () => clearTimeout(timer);

            }
        }

    }, [BetAmount, GameState]);

    useEffect(() => {
        if (BalanceAmount + BetAmount <= 0) {
            setGameState("GAME OVER")
        }
    }, [BalanceAmount, BetAmount])

    const PlaceBets = () => {
        return <div className="flex flex-row space-x-2">
            <button className={chipClass} onClick={() => handleChipClick(1)}>
                <C1 className="w-full h-full transform"/>
            </button>
            <button className={chipClass} onClick={() => handleChipClick(5)}>
                <C5 className="w-full h-full transform"/>
            </button>
            <button className={chipClass} onClick={() => handleChipClick(10)}>
                <C10 className="w-full h-full transform"/>
            </button>
            <button className={chipClass} onClick={() => handleChipClick(25)}>
                <C25 className="w-full h-full transform"/>
            </button>
            <button className={chipClass} onClick={() => handleChipClick(50)}>
                <C50 className="w-full h-full transform"/>
            </button>
            <button className={chipClass} onClick={() => handleChipClick(100)}>
                <C100 className="w-full h-full transform"/>
            </button>
        </div>
    }

    const ActionButtons = () => {
        return <div className="flex flex-row space-x-4">
            {/*<div className="flex flex-col items-center space-y-2">*/}
            {/*    <div className={buttonClass + " btn-warning"}>*/}
            {/*        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"*/}
            {/*             className="w-6 h-6">*/}
            {/*            <path*/}
            {/*                d="M16.5 6a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3v7.5a3 3 0 0 0 3 3v-6A4.5 4.5 0 0 1 10.5 6h6Z"/>*/}
            {/*            <path*/}
            {/*                d="M18 7.5a3 3 0 0 1 3 3V18a3 3 0 0 1-3 3h-7.5a3 3 0 0 1-3-3v-7.5a3 3 0 0 1 3-3H18Z"/>*/}
            {/*        </svg>*/}
            {/*    </div>*/}
            {/*    <div className="text-xs">Double</div>*/}
            {/*</div>*/}
            <div className="flex flex-col items-center space-y-2">
                <button className={buttonClass + " btn-success"} onClick={handleClickHit}
                        disabled={isHitDisabled}>
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
                <button className={buttonClass + " btn-error"} onClick={handleClickStand}
                        disabled={isStandDisabled}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
                         className="w-6 h-6">
                        <path fillRule="evenodd"
                              d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm3 10.5a.75.75 0 0 0 0-1.5H9a.75.75 0 0 0 0 1.5h6Z"
                              clipRule="evenodd"/>
                    </svg>
                </button>
                <div className="text-xs">Stand</div>
            </div>
            {/*<div className="flex flex-col items-center space-y-2">*/}
            {/*    <div className={buttonClass + " btn-neutral"}>*/}
            {/*        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"*/}
            {/*             className="w-6 h-6">*/}
            {/*            <path fillRule="evenodd"*/}
            {/*                  d="M15.97 2.47a.75.75 0 0 1 1.06 0l4.5 4.5a.75.75 0 0 1 0 1.06l-4.5 4.5a.75.75 0 1 1-1.06-1.06l3.22-3.22H7.5a.75.75 0 0 1 0-1.5h11.69l-3.22-3.22a.75.75 0 0 1 0-1.06Zm-7.94 9a.75.75 0 0 1 0 1.06l-3.22 3.22H16.5a.75.75 0 0 1 0 1.5H4.81l3.22 3.22a.75.75 0 1 1-1.06 1.06l-4.5-4.5a.75.75 0 0 1 0-1.06l4.5-4.5a.75.75 0 0 1 1.06 0Z"*/}
            {/*                  clipRule="evenodd"/>*/}
            {/*        </svg>*/}

            {/*    </div>*/}
            {/*    <div className="text-xs">Split</div>*/}
            {/*</div>*/}
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
            return <div className="flex-col items-center justify-center mx-auto space-y-2 py-4">
                <div className="flex items-center justify-center text-white">{GameState}</div>
                <div className="flex flex-row items-center justify-center space-x-2">
                    {/*bet amount here is after the money has been taken away i.e. player lost*/}
                    {
                        // Just won a hand
                        BetAmount > 0 ? (
                            <>
                                <button className="btn btn-sm items-center justify-center w-28 animate-none"
                                        onClick={handleClickKeepGoing}>Keep Going
                                </button>
                                <button
                                    className="btn btn-sm items-center justify-center w-28 animate-none btn-success text-white"
                                    onClick={handleClickCashOut}>Cash Out!
                                </button>
                            </>

                        ) : (
                            //Just lost a hand
                            BalanceAmount > 0 ? (
                                // Has money left to bet
                                <>
                                    <button className="btn btn-sm items-center justify-center w-28 animate-none"
                                            onClick={handleClickKeepGoing}>Keep Going
                                    </button>
                                    <button
                                        className="btn btn-sm items-center justify-center w-28 animate-none btn-success text-white"
                                        onClick={handleClickCashOut}>Cash Out!
                                    </button>
                                </>
                            ) : (
                                // Has NO money left to bet
                                <>
                                    <button className="btn btn-sm items-center justify-center w-28 animate-none"
                                            onClick={handleClickStartOver}>Start Over?
                                    </button>
                                    <button
                                        className="btn btn-sm items-center justify-center w-28 animate-none"
                                        onClick={() => onChange('START')}>Leaderboard
                                    </button>
                                </>
                            )
                        )
                    }

                </div>

            </div>
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
            <form onSubmit={handleSubmit} className="flex flex-col w-70 space-y-2">
                <div className="flex flex-row items-center justify-center text-center text-sm font-tech">Nice! You
                    turned $10 to ${BalanceAmount}
                </div>
                <div className="flex flex-row space-x-2">
                    <label className="">
                        <input type="text"
                               placeholder="Name"
                               value={UserName}
                               onChange={(e) => setUserName(e.target.value)}
                               required
                               className="flex flex-row h-8 text-black rounded-lg px-2 font-tech items-center"
                        />
                    </label>
                    <button className="btn btn-sm mt-auto rounded-lg font-tech" type="submit">Save</button>
                </div>

            </form>
        )
    }

    const saveScore = async (username: string): Promise<{ success: boolean }> => {
        try {
            const response = await fetch("http://bj-teacher-server-env-1.eba-n9at9mkt.ap-southeast-2.elasticbeanstalk.com/api/add-score",
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({username: username, game_log_data: JSON.stringify(GameLog)})
                },
            ).then(response => response.json())
                .then(data => console.log(data))
                .catch(error => console.error('Error:', error));

            // if (!response.ok) throw new Error('Failed to save score');
            return {success: true}
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


    // @ts-ignore
    return (
        // <div className="flex flex-col items-center space-y-auto text-white h-screen overflow-hidden w-screen">
        <>
            <div className="absolute top-8 right-8">
                <div
                    className="flex flex-row justify-center items-center space-x-2 bg-grey pl-1.5 pr-3 py-1 rounded-badge">
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
            </div>

            <div className="flex flex-col pt-4 space-y-0 overflow-auto">
                <div className="flex flex-col justify-center space-y-4">
                    <div className="flex flex-row justify-center items-center pt-44">

                        {
                            DealerHand.map((card, index) =>
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
                        {!(GameState == 'IN PLAY' || GameState == 'PLACING BET') &&
                        <div className="pl-6 pt-14 text-white">{DealerHandSumState}</div>
                        }
                    </div>

                    <div className="flex flex-row justify-center">
                        <div className="flex w-24 h-24 bg-gradient-to-r from-transparent to-info-content/50"/>
                        <div
                            className="flex w-auto h-24 justify-center items-center text-white bg-info-content/50">
                            {renderDisplayBar(GameState)}
                        </div>
                        <div className="flex w-24 h-24 bg-gradient-to-l to-info-content/50 from-transparent"/>
                    </div>

                    <div className="flex flex-col items-center pt-0 space-y-4">
                        <div className="flex flex-row h-1">
                            {renderBabyChips(getBetBabyChips(BetAmount))}
                        </div>
                        <div className="flex flex-col items-center h-5 text-white">{`$${BetAmount}`}</div>
                    </div>

                    <div className="flex flex-row h-24 justify-center">
                        {GameState == 'PLACING BET' ? (
                            <div className="absolute flex flex-row items-center justify-center space-x-2">
                                <button className="flex btn btn-sm disabled:bg-red-600 disabled:text-white disabled:opacity-90"
                                        onClick={handlePlaceBet}
                                        disabled={BetAmount <= 0}
                                    // disabled={BetAmount == 0}
                                >
                                    {BetAmount <= 0 ? 'Select Amount':'Place Bet'}
                                </button>
                                <button className="btn btn-sm flex items-center justify-center size-8 px-2 m-0 border-0"
                                        onClick={handleResetBet}>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                         stroke-width="1.5" stroke="currentColor"
                                         className="flex items-center justify-center h-full w-full">
                                        <path stroke-linecap="round" stroke-linejoin="round"
                                              d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"/>
                                    </svg>

                                </button>
                            </div>) : (
                            <div className="flex flex-row justify-center">

                                {
                                    PlayerHand.map((card, index) =>
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
                                {(PlayerStand || !(GameState == 'IN PLAY')) &&
                                <div
                                    className="flex flex-row pl-6 text-white">{PlayerHandSumState}</div>}
                            </div>
                        )}

                    </div>
                </div>
                {/*<div className="flex flex-row text-black">*/}
                {/*    <div>Card Count: ({GameState == "IN PLAY" ? Count : "?"}) - Deck*/}
                {/*        Count: {DeckCount} ({Math.round((GlobalDeck.length / (DeckCount * 52)) * 100)}%)*/}
                {/*    </div>*/}
                {/*</div>*/}
            </div>
        </>);
};

export default MainContent;
