import React, {useState} from 'react';
import './playingCard.css';

export interface CardProps {
    suit: Suit;
    value: number;
    display: string;
    visible: boolean;
}

type Suit = 'clubs' | 'spades' | 'diamonds' | 'hearts'

const suitIcons = {
    clubs: '♣️',    // Unicode for clubs
    spades: '♠️',   // Unicode for spades
    hearts: '♥️',   // Unicode for hearts
    diamonds: '♦️'  // Unicode for diamonds
};


export const PlayingCard = ({value, suit, display, visible}: CardProps) => {

    const icon = suitIcons[suit]; // Get the icon based on suit
    const color = (suit === 'spades') || (suit === 'clubs') ? 'text-black' : 'text-red-400';

    return (
        <div className="flip-card -mx-4">
            <div className={`w-14 h-20 rounded-lg flip-card-inner ${visible ? '' :  'is-flipped' }`}>
                <div className="flip-card-front">
                    <div
                        className="relative w-14 h-20 bg-white rounded-lg flex items-center justify-center shadow-xl overflow-hidden">

                        <div className={"absolute top-0 left-0.5 p-1 " + color}>{display}</div>
                        <div className={"absolute text-3xl " + color}>{icon}</div>
                        <div className={"absolute bottom-0 right-0.5 p-1 " + color}>{display}</div>

                    </div>
                </div>
                <div className="flip-card-back bg-white overflow-hidden rounded-lg shadow-lg">
                    <div className="flex justify-center flex-col text-xs">
                        <div className="flex justify-center space-x-1 text-blue-400">
                            <div>{suitIcons['spades']}</div>
                            <div>{suitIcons['spades']}</div>
                            <div>{suitIcons['spades']}</div>
                            <div>{suitIcons['spades']}</div>
                            <div>{suitIcons['spades']}</div>
                        </div>
                        <div className="flex justify-center space-x-1 text-red-400">
                            <div>{suitIcons['diamonds']}</div>
                            <div>{suitIcons['diamonds']}</div>
                            <div>{suitIcons['diamonds']}</div>
                            <div>{suitIcons['diamonds']}</div>
                        </div>
                        <div className="flex justify-center space-x-1 text-blue-400">
                            <div>{suitIcons['clubs']}</div>
                            <div>{suitIcons['clubs']}</div>
                            <div>{suitIcons['clubs']}</div>
                            <div>{suitIcons['clubs']}</div>
                            <div>{suitIcons['clubs']}</div>
                        </div>
                        <div className="flex justify-center space-x-1 text-red-400">
                            <div>{suitIcons['hearts']}</div>
                            <div>{suitIcons['hearts']}</div>
                            <div>{suitIcons['hearts']}</div>
                            <div>{suitIcons['hearts']}</div>
                        </div>
                        <div className="flex justify-center space-x-1 text-blue-400">
                            <div>{suitIcons['spades']}</div>
                            <div>{suitIcons['spades']}</div>
                            <div>{suitIcons['spades']}</div>
                            <div>{suitIcons['spades']}</div>
                            <div>{suitIcons['spades']}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

