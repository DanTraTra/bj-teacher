import React, {useState} from 'react';
import './playingCard.css';
import {GiClubs, GiDiamonds, GiHearts, GiSpades} from "react-icons/gi";
import {FaCircle} from "react-icons/fa";
import {FaDiamond} from "react-icons/fa6";

export interface CardProps {
    suit: Suit;
    value: number;
    display: string;
    visible: boolean;
}

type Suit = 'clubs' | 'spades' | 'diamonds' | 'hearts'

const suitIcons = {
    clubs: <GiClubs color={"#76A9FA"} size="11px"/>,
    spades: <GiSpades color={"#76A9FA"} size="11px"/>,
    hearts: <GiHearts color="#F98080" size="9px"/>,
    diamonds: <FaDiamond color="#F98080" size="9px"/>,
    circle: <FaCircle color="#F7CE97" size="4px"/>,
};

const suitIconsFront = {
    clubs: <GiClubs color="black"/>,
    spades: <GiSpades color="black"/>,
    hearts: <GiHearts color="#red"/>,
    diamonds: <FaDiamond color="#red"/>,
};

const blue_class = "flex justify-center items-center space-x-1 text-10px"
const red_class = "flex justify-center items-center space-x-[5px] text-red-400 text-10px"
export const PlayingCard = ({value, suit, display, visible}: CardProps) => {

    const icon = suitIconsFront[suit]; // Get the icon based on suit
    const color = (suit === 'spades') || (suit === 'clubs') ? 'text-black' : 'text-red-400';

    return (
        <div className="flip-card -mx-4">
            <div className={`w-14 h-20 rounded-lg flip-card-inner shadow ${visible ? '' : 'is-flipped'}`}>
                <div className="flip-card-front">
                    <div
                        className="relative w-14 h-20 bg-white rounded-lg flex items-center justify-center shadow-xl overflow-hidden">

                        <div className={"absolute top-0 left-0.5 p-1 font-tech " + color}>{display}</div>
                        <div className={"absolute text-3xl " + color}>{icon}</div>
                        <div className={"absolute bottom-0 right-0.5 p-1 font-tech " + color}>{display}</div>

                    </div>
                </div>
                <div className="flip-card-back bg-white overflow-hidden rounded-lg shadow-lg">
                    <div className="flex justify-center flex-col text-xs space-y-0.5">
                        <div className={blue_class}>
                            <div>{suitIcons['clubs']}</div>
                            <div>{suitIcons['circle']}</div>
                            <div>{suitIcons['clubs']}</div>
                            <div>{suitIcons['circle']}</div>
                            <div>{suitIcons['clubs']}</div>
                            <div>{suitIcons['circle']}</div>
                            <div>{suitIcons['clubs']}</div>
                        </div>
                        <div className={red_class}>
                            <div>{suitIcons['hearts']}</div>
                            <div>{suitIcons['circle']}</div>
                            <div>{suitIcons['hearts']}</div>
                            <div>{suitIcons['circle']}</div>
                            <div>{suitIcons['hearts']}</div>
                        </div>
                        <div className={blue_class}>
                            <div>{suitIcons['spades']}</div>
                            <div>{suitIcons['circle']}</div>
                            <div>{suitIcons['spades']}</div>
                            <div>{suitIcons['circle']}</div>
                            <div>{suitIcons['spades']}</div>
                            <div>{suitIcons['circle']}</div>
                            <div>{suitIcons['spades']}</div>
                        </div>
                        <div className={red_class}>
                            <div>{suitIcons['diamonds']}</div>
                            <div>{suitIcons['circle']}</div>
                            <div>{suitIcons['diamonds']}</div>
                            <div>{suitIcons['circle']}</div>
                            <div>{suitIcons['diamonds']}</div>
                        </div>
                        <div className={blue_class}>
                            <div>{suitIcons['clubs']}</div>
                            <div>{suitIcons['circle']}</div>
                            <div>{suitIcons['clubs']}</div>
                            <div>{suitIcons['circle']}</div>
                            <div>{suitIcons['clubs']}</div>
                            <div>{suitIcons['circle']}</div>
                            <div>{suitIcons['clubs']}</div>
                        </div>
                        <div className={red_class}>
                            <div>{suitIcons['hearts']}</div>
                            <div>{suitIcons['circle']}</div>
                            <div>{suitIcons['hearts']}</div>
                            <div>{suitIcons['circle']}</div>
                            <div>{suitIcons['hearts']}</div>
                        </div>
                        <div className={blue_class}>
                            <div>{suitIcons['spades']}</div>
                            <div>{suitIcons['circle']}</div>
                            <div>{suitIcons['spades']}</div>
                            <div>{suitIcons['circle']}</div>
                            <div>{suitIcons['spades']}</div>
                            <div>{suitIcons['circle']}</div>
                            <div>{suitIcons['spades']}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

