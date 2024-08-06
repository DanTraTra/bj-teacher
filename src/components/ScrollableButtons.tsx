import React, {useState} from "react";
import {FaDumbbell} from "react-icons/fa6";
import {MdChevronLeft, MdChevronRight} from "react-icons/md";

export interface SwipeableButtonsProps {
    button1: () => void;
    button2: () => void;
}

const SwipeableButtonContainer: React.FC<SwipeableButtonsProps> = ({button1, button2}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const buttons = [
        {content: "Play", action: button1},
        {content: "Train", action: button2},
        // Add more buttons as needed
    ];

    const pageLeft = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    const pageRight = () => {
        if (currentIndex < buttons.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    return (
        <div className="relative flex flex-row w-72 items-center">
            <button
                className="relative left-8 p-3 z-10"
                onClick={pageLeft}
                aria-label="Page Left"
                disabled={currentIndex === 0}
            >
                <MdChevronLeft size={24} fill={currentIndex === 0 ? "#b0d9e5" : "grey"}/>
            </button>
            <div className="overflow-hidden w-full px-10">
                <div
                    className="flex py-1 space-x-3 transition-transform duration-300 ease-in-out"
                    style={{transform: `translateX(-${currentIndex * 110}%)`}}
                >
                    {buttons.map((button, index) => (
                        <button
                            key={index}
                            className="btn btn-sm font-tech text-lg border-0 w-full flex-shrink-0"
                            onClick={button.action}
                        >
                            {button.content}
                        </button>
                    ))}
                </div>
            </div>
            <div
                className="absolute left-[40px] top-0 h-full w-12 bg-gradient-to-r from-pastelBlue via-pastelBlue to-transparent pointer-events-none"
            />
            <div
                className="absolute right-[40px] top-0 h-full w-12 bg-gradient-to-l from-pastelBlue via-pastelBlue to-transparent pointer-events-none"
            />
            {<button
                className="relative right-8 p-3 z-10"
                onClick={pageRight}
                aria-label="Page Right"
                disabled={currentIndex === buttons.length - 1}
            >
                <MdChevronRight size={24} fill={currentIndex === buttons.length - 1 ? "#b0d9e5" : "grey"}/>
            </button>}
        </div>
    );
};

export default SwipeableButtonContainer;
