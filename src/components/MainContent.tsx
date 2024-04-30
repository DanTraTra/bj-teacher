import React, {useEffect, useState} from 'react';
import './PlayingCard'
import 'tailwindcss/tailwind.css'
import {Simulate} from "react-dom/test-utils";
import {CardProps, PlayingCard} from "./PlayingCard"


const buttonClass = "btn btn-sm btn-circle text-white size-8 w-12 h-12"
type Suit = "hearts" | "diamonds" | "spades" | "clubs";
const animationTime = 600;
const dealerAnimationTime = animationTime + 300
// interface  {
//     suit: Suit;
//     value: number;
//     display: string;
//     visible: boolean;
// }

// interface Deck {
//     cards: CardsWithAmount[];
// }

// const randomNumber = getRandomCard();

function MainContent() {
    type GameOutComeType =
        "IN PLAY"
        | "PLAYER BUST"
        | "PUSH"
        | "DEALER BUST"
        | "HOUSE WINS"
        | "YOU WIN"
        | "PLAYER BLACKJACK"

    const [GameState, setGameState] = useState<GameOutComeType>("IN PLAY");
    const [GameCount, setGameCount] = useState(0);

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
    const [GlobalDeck, setGlobalDeck] = useState<CardProps[]>(initializeDeck(1));

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
            console.log("count +1 because", card.value)
        } else if (card.value >= 10 || card.value === 1) {
            change = -1;
            console.log("count -1 because", card.value)
        } else {
            console.log("count unchanged because", card.value)
        }
        setCount(currentCount => {

            setCountLog(prevState => {
                return [...prevState, {value: card.display, change: change, countNow: currentCount + change}]
            })

            return (currentCount + change)
        })
    }

    const handleClickHit = () => {
        console.log("CLICKED HIT")
        const random_card = getRandomCard(false)
        setPlayerHand(currentHand => [...currentHand, random_card]);
        setTimeout(() => {
            updateCount(random_card)
        }, animationTime)
    }

    const handleClickStand = () => {
        console.log("CLICKED STAND")
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

    const handClickPlayAgain = () => {
        const newDeck = initializeDeck(1)
        setGlobalDeck(newDeck)
        setGameCount(prevState => prevState + 1)
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

        setTimeout(() => {
            setPlayerHand(currentHand => currentHand.map((card, index) => {
                        return {...card, visible: true}
                    }
                )
            )
        }, animationTime);
    }

    const setUpGame = () => {
        setGameState("IN PLAY");
        setPlayerStand(false);
        setDealerHit(false);

        // setGlobalDeck(initializeDeck(1));
        const random_player_card_1 = getRandomCard(false);
        const random_dealer_card_1 = getRandomCard(true);
        const random_player_card_2 = getRandomCard(false);
        const random_dealer_card_2 = getRandomCard(false);
        // Create an addToDeck function
        setPlayerHand([random_player_card_1]);
        updateCount(random_player_card_1)
        // revealPlayerCards(100)
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

            } else if (PlayerHandSumState === 21 && PlayerHand.length == 2 && DealerHandSumState != 21) {
                // The dealer must also not have blackjack
                setPlayerBlackJackState(true)
                setGameState("PLAYER BLACKJACK")
                setPlayerWins(currentAmount => currentAmount + 1)

            }

        }, animationTime)
        console.log("PlayerHandSumState", PlayerHandSumState)
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

        setTimeout(() => {
            setPlayerHandSumState(playerHandSum)
        }, animationTime + 150)

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
        console.log("inside useEffect dep [DealerHit, DealerHandSumState]")
        console.log("PlayerStand - DD", PlayerStand)
        console.log("DealerHit - DD", DealerTurnOver)
        if (PlayerStand && DealerTurnOver) {

            setTimeout(() => {
                console.log("DealerHandSumState - DD", DealerHandSumState)
                console.log("PlayerHandSumState - DD", PlayerHandSumState)

                if (DealerHandSumState > 21) {
                    console.log("Setting GameState: DEALER BUST")

                    setGameState("DEALER BUST")
                    setPlayerWins(currentAmount => currentAmount + 1)
                } else {
                    if (DealerHandSumState == PlayerHandSumState) {
                        console.log("Setting GameState: PUSH")

                        setGameState("PUSH")
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

                if (DealerHandSumState === 21 && PlayerHand.some((card) => card.value === 1)) {
                    setDealerBlackJackState(true)
                }
            }, dealerAnimationTime + 300)

        }

    }, [DealerTurnOver])

    useEffect(() => {
        console.log("DealerHit", DealerHit)
        console.log("DealerHand", DealerHand.map(card => card.visible))
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
            console.log("inside useEffect dep [PlayerStand, DealerHandSumState]")
            console.log("DealerHandSumState - PD", DealerHandSumState)
            console.log("PlayerHandSumState - PD", PlayerHandSumState)

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
        }
    }, [GameState])

    return (

        <div className="flex flex-col items-center text-white h-screen overflow-hidden w-screen">
            <div className="flex flex-row text-black">
                <div>House: {HouseWins} - Player: {PlayerWins} - Count: {Count} </div>
                {/*<div className="absolute top-16 right-16"> Count Log:*/}
                {/*    <div> Card &gt; Change &gt; Count </div>*/}
                {/*    {*/}
                {/*        CountLog.map((record, i) => i ? (*/}
                {/*                <div>*/}
                {/*                    <div key={i}> Saw a {record.value} &gt; {record.change} &gt; {record.countNow} </div>*/}
                {/*                </div>*/}
                {/*            ) : (<div></div>)*/}
                {/*        )*/}
                {/*    }</div>*/}
            </div>
            <div className="absolute top-32 space-y-6">
                <div className="flex flex-row justify-center items-center pt-64">

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
                    {(GameState != 'IN PLAY') &&
                    <div className="pl-6 pt-14">{DealerHandSumState}</div>
                    }
                </div>
                <div>
                    <div
                        className="flex w-80 h-24 justify-center items-center bg-info-content/50">
                        {GameState != "IN PLAY" ? (
                            <div className="flex-col items-center justify-center mx-auto space-y-2 py-4">
                                <div className="flex items-center justify-center">{GameState}</div>
                                <div className="flex items-center justify-center">
                                    <button className="btn btn-sm items-center justify-center"
                                            onClick={handClickPlayAgain}>Play
                                        Again?
                                    </button>
                                </div>

                            </div>
                        ) : (
                            <div className="flex flex-row space-x-4">
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
                                    <div className={buttonClass + " btn-success"} onClick={handleClickHit}>
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
                                             className="w-6 h-6">
                                            <path fillRule="evenodd"
                                                  d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 9a.75.75 0 0 0-1.5 0v2.25H9a.75.75 0 0 0 0 1.5h2.25V15a.75.75 0 0 0 1.5 0v-2.25H15a.75.75 0 0 0 0-1.5h-2.25V9Z"
                                                  clipRule="evenodd"/>
                                        </svg>
                                    </div>
                                    <div className="text-xs">Hit</div>
                                </div>
                                <div className="flex flex-col items-center space-y-2">
                                    <div className={buttonClass + " btn-error"} onClick={handleClickStand}>
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
                                             className="w-6 h-6">
                                            <path fillRule="evenodd"
                                                  d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm3 10.5a.75.75 0 0 0 0-1.5H9a.75.75 0 0 0 0 1.5h6Z"
                                                  clipRule="evenodd"/>
                                        </svg>
                                    </div>
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
                        )}
                    </div>


                </div>
                <div className="flex flex-col">
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
                        {(PlayerStand || GameState != 'IN PLAY') &&
                        <div className="flex justify-center items-center pl-6 pt-14">{PlayerHandSumState}</div>}

                    </div>
                </div>
            </div>
        </div>
    );
}
;

export default MainContent;
