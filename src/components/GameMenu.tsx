import React, {useState, useEffect, useRef} from "react";
import {useSwipeable} from 'react-swipeable';

import {Transition} from "@headlessui/react";
// @ts-ignore
import SVGOne from '../assets/Option3.svg?react';
// @ts-ignore
import SVGTwo from '../assets/Option1.svg?react';
// @ts-ignore
import SVGThree from '../assets/Option2.svg?react';

import {FiArrowLeft, FiArrowRight} from 'react-icons/fi';
import {MdChevronLeft, MdChevronRight} from "react-icons/md";
import {Screens} from "../App";

interface MenuItem {
    id: number;
    label: Screens;
    svg: JSX.Element;
}

interface GameMenuProps {
    changeScreenTo: (screen: Screens) => void;
    setTutorialState: (arg0: number) => void;
}

const GameMenu: React.FC<GameMenuProps> = ({changeScreenTo, setTutorialState}) => {
    const menuItems: MenuItem[] = [
        {id: 0, label: 'LEARN', svg: <SVGOne/>},
        {id: 1, label: 'PLAY', svg: <SVGTwo/>},
        {id: 2, label: 'TRAIN', svg: <SVGThree/>},
    ];


    const [selectedIndex, setSelectedIndex] = useState(1);

    const handleNext = () => {
        console.log("clicked right")
        setSelectedIndex((prevIndex) => (prevIndex + 1) % menuItems.length);
    };

    const handlePrev = () => {
        console.log("clicked left")
        setSelectedIndex((prevIndex) =>
            prevIndex === 0 ? menuItems.length - 1 : prevIndex - 1
        );
    };

    const handlers = useSwipeable({
        onSwipedLeft: () => handleNext(),
        onSwipedRight: () => handlePrev(),
    });

    const handleSelect = (index: number) => {
        setSelectedIndex(index);
    };
    const translateX = `-${selectedIndex * 160}px`;


    const handleModeClick = (isSelected: boolean, label: Screens, index: number) => {
        if (isSelected) {
            changeScreenTo(label)
            if (label === "LEARN") {
                setTutorialState(0)
            }
        } else {
            handleSelect(index)
        }
    }

    return (
        <div className="flex flex-col items-center justify-center h-full w-full p-4" {...handlers}>
            <div className="relative flex items-center w-full max-w-xs px-20">
                <button
                    className="absolute left-0 bottom-0 p-2 z-20"
                    onClick={handlePrev}
                >
                    <MdChevronLeft size={24} fill={selectedIndex === 0 ? "#b0d9e5" : "grey"}/>
                </button>

                <div className="flex transition-transform duration-300 ease-in-out"
                     style={{transform: `translateX(${translateX})`}}
                >
                    {menuItems.map((item, index) => {
                        const isSelected = selectedIndex === index;
                        const transformOrigin = selectedIndex > index ? 'right' : 'left';

                        return (
                            <div
                                key={item.id}
                                className={`flex flex-col items-center justify-center space-y-8 transition-transform duration-300 -mx-6 ${
                                    isSelected ? 'scale-100 opacity-100' : `scale-50 opacity-50`
                                }`}
                            >
                                <button
                                    onClick={() => handleModeClick(isSelected, item.label, index)}
                                    className={`btn btn-sm font-tech text-lg border-0 px-8 flex-shrink-0 transition-all ${
                                        isSelected ? 'text-lg font-bold' : 'text-sm'
                                    }`}
                                >
                                    {item.label}
                                </button>
                                <div className="mt-2 transition-transform duration-300"
                                     onClick={() => handleModeClick(isSelected, item.label, index)}
                                     style={{
                                         // transformOrigin: `${transformOrigin} center`,
                                         transform: isSelected ? 'scale(1)' : 'scale(0.8)',
                                     }}>{item.svg}</div>
                            </div>
                        );
                    })}
                </div>

                <button
                    className="absolute right-0 bottom-0 p-2"
                    onClick={handleNext}
                >
                    <MdChevronRight size={24} fill={selectedIndex === menuItems.length - 1 ? "#b0d9e5" : "grey"}/>
                </button>
            </div>
        </div>
    );
};

export default GameMenu;