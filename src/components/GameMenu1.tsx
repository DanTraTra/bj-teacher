import React, { useState, useRef, useEffect } from "react";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";
// @ts-ignore
import SVGOne from '../assets/Dealer1.svg?react';

interface MenuItem {
    id: number;
    label: string;
    svg: JSX.Element;
}

const GameMenu: React.FC = () => {
    const menuItems: MenuItem[] = [
        { id: 0, label: 'Learn', svg: <SVGOne /> },
        { id: 1, label: 'Play', svg: <SVGOne /> },
        { id: 2, label: 'Train', svg: <SVGOne /> },
    ];

    const carouselRef = useRef<HTMLDivElement>(null);
    const [selectedIndex, setSelectedIndex] = useState(1);
    const [scrollPosition, setScrollPosition] = useState(0);
    const animationFrameRef = useRef<number | null>(null);

    const handleNext = () => {
        setSelectedIndex((prevIndex) => (prevIndex + 1) % menuItems.length);
    };

    const handlePrev = () => {
        setSelectedIndex((prevIndex) =>
            prevIndex === 0 ? menuItems.length - 1 : prevIndex - 1
        );
    };

    useEffect(() => {
        const carouselElement = carouselRef.current;

        const handleScroll = () => {
            if (animationFrameRef.current !== null) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            animationFrameRef.current = requestAnimationFrame(() => {
                if (carouselElement) {
                    setScrollPosition(carouselElement.scrollLeft);
                }
            });
        };

        if (carouselElement) {
            carouselElement.addEventListener('scroll', handleScroll);
            return () => {
                carouselElement.removeEventListener('scroll', handleScroll);
                if (animationFrameRef.current !== null) {
                    cancelAnimationFrame(animationFrameRef.current);
                }
            };
        }
    }, []);

    useEffect(() => {
        if (carouselRef.current) {
            const scrollLeft = scrollPosition;
            const itemWidth = carouselRef.current.offsetWidth;

            menuItems.forEach((_, index) => {
                const itemElement = carouselRef.current!.children[index] as HTMLElement;
                const itemCenter = itemElement.offsetLeft + itemElement.offsetWidth / 2;
                const distanceFromCenter = Math.abs(scrollLeft + itemWidth / 2 - itemCenter);

                const scale = Math.max(0.3,1 - (distanceFromCenter * 1.7) / itemWidth);
                const opacity = Math.max(0.5, 1 - distanceFromCenter / (itemWidth / 2));

                itemElement.style.transform = `scale(${scale})`;
                itemElement.style.opacity = `${opacity}`;
            });
        }
    }, [scrollPosition, menuItems.length]);

    useEffect(() => {
        if (carouselRef.current) {
            const selectedElement = carouselRef.current.children[selectedIndex] as HTMLElement;
            selectedElement.scrollIntoView({ behavior: 'smooth', inline: 'center' , block: 'nearest'},);
        }
    }, [selectedIndex]);

    return (
        <div className="flex flex-row items-center justify-center h-full w-full">
            <div className="relative flex items-center w-full">
                <button
                    className="absolute left-0 p-2 z-10"
                    onClick={handlePrev}
                >
                    <MdChevronLeft size={24} fill={selectedIndex === 0 ? "#b0d9e5" : "grey"} />
                </button>

                <div
                    ref={carouselRef}
                    className="flex overflow-y-hidden overflow-x-auto scroll-snap-type-x-mandatory scrollbar-hide px-24 mx-auto"
                >
                    {menuItems.map((item, index) => (
                        <div
                            key={item.id}
                            className="flex flex-col items-center justify-center space-y-8 transition-transform duration-300 -mx-6 scroll-snap-align-center"
                            style={{ transform: 'scale(0.5)', opacity: 0.5 }} // initial values
                        >
                            <button
                                onClick={() => setSelectedIndex(index)}
                                className={`btn btn-sm font-tech text-lg border-0 px-8 flex-shrink-0 transition-all`}
                            >
                                {item.label}
                            </button>
                            <div className="mt-2">
                                {item.svg}
                            </div>
                        </div>
                    ))}
                </div>

                <button
                    className="absolute right-0 p-2 z-10"
                    onClick={handleNext}
                >
                    <MdChevronRight size={24} fill={selectedIndex === menuItems.length - 1 ? "#b0d9e5" : "grey"} />
                </button>
            </div>
        </div>
    );
};

export default GameMenu;
