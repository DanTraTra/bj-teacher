import React, { useState, useEffect, useRef } from 'react';
import { FrontCellContent } from './RandomImageGridWrapper';

interface CCCardProps {
    frontContent: FrontCellContent;
    backContent: string | null;
    beginsFlipped: boolean;
    /** Optional: Tailwind size class for the card (e.g., 'w-16', 'h-16') */
    cellSize?: string;
    /** Optional: Additional CSS classes */
    frontClassName?: string;
    backClassName?: string;
    clueCell?: boolean;
    correctCard?: 'correct' | 'incorrect';
    /** Optional: Callback when content is edited */
    onContentEdit?: (newContent: string) => void;
    /** Whether the card is currently flipped */
    isFlipped: boolean;
    /** Callback when the card is flipped */
    handleCardFlip: (rowIndex: number, colIndex: number, clueCell: boolean) => void;
    rowIndex: number;
    colIndex: number;
    resetFlippedCardState: () => void;
    setViewingClue: (boolean: boolean) => void;
    highlightClass: string;
}

const CCCard: React.FC<CCCardProps> = ({
    frontContent,
    backContent,
    beginsFlipped = false,
    cellSize = '',
    frontClassName = '',
    backClassName = '',
    clueCell = false,
    correctCard,
    onContentEdit,
    isFlipped,
    handleCardFlip,
    rowIndex,
    colIndex,
    resetFlippedCardState,
    setViewingClue,
    highlightClass,
}) => {
    const [clickEffectClass, setClickEffectClass] = useState('');
    const [frontTextSize, setFrontTextSize] = useState(54);
    const [frontTextColorClass, setfrontTextColorClass] = useState('');
    const [backTextSize, setBackTextSize] = useState(54);

    const frontContentRef = useRef<HTMLSpanElement>(null);
    const backContentRef = useRef<HTMLSpanElement>(null);
    const frontContainerRef = useRef<HTMLDivElement>(null);
    const backContainerRef = useRef<HTMLDivElement>(null);

    const calculateFrontTextSize = () => {
        if (frontContentRef.current && frontContainerRef.current) {
            const content = frontContentRef.current;
            const container = frontContainerRef.current;
            let currentSize = 54;
            content.style.fontSize = `${currentSize}px`;

            // Get the actual width of the container, accounting for padding
            const containerWidth = container.clientWidth - 18; // 20px for padding

            if (typeof frontContent.content === 'string' && !frontContent.content.match('^[A-E][1-5]$')) {
                while (content.scrollWidth > containerWidth && currentSize > 8) {
                    currentSize -= 2;
                    content.style.fontSize = `${currentSize}px`;
                }
                setFrontTextSize(currentSize);

            } else {
                content.style.fontSize = `${container.clientHeight * 0.5}px`;
                setFrontTextSize(container.clientHeight * 0.5);
            }
        }
    };

    const calculateBackTextSize = () => {
        if (backContentRef.current && backContainerRef.current) {
            const content = backContentRef.current;
            const container = backContainerRef.current;
            let currentSize = 54;
            content.style.fontSize = `${currentSize}px`;

            // Get the actual width of the container, accounting for padding
            const containerWidth = container.clientWidth - 20; // 20px for padding

            while (content.scrollWidth > containerWidth && currentSize > 8) {
                currentSize -= 2;
                content.style.fontSize = `${currentSize}px`;
            }
            setBackTextSize(currentSize);
        }
    };

    // Trigger text resizing when content changes
    useEffect(() => {
        // Use requestAnimationFrame to ensure DOM has updated
        const frameId = requestAnimationFrame(() => {
            calculateFrontTextSize();
        });
        return () => cancelAnimationFrame(frameId);
    }, [frontContent]);

    useEffect(() => {
        // Use requestAnimationFrame to ensure DOM has updated
        const frameId = requestAnimationFrame(() => {
            calculateBackTextSize();
        });
        return () => cancelAnimationFrame(frameId);
    }, [backContent]);

    // Also recalculate on mount and when refs become available
    useEffect(() => {
        if (frontContainerRef.current && frontContentRef.current) {
            calculateFrontTextSize();
        }
    }, [frontContainerRef.current, frontContentRef.current]);

    useEffect(() => {
        if (backContainerRef.current && backContentRef.current) {
            calculateBackTextSize();
        }
    }, [backContainerRef.current, backContentRef.current]);

    // Add ResizeObserver to monitor container size changes
    useEffect(() => {
        const frontContainer = frontContainerRef.current;
        if (!frontContainer) return;

        const resizeObserver = new ResizeObserver(() => {
            // Use requestAnimationFrame to ensure DOM has updated
            requestAnimationFrame(() => {
                calculateFrontTextSize();
            });
        });

        resizeObserver.observe(frontContainer);

        return () => {
            resizeObserver.disconnect();
        };
    }, [frontContainerRef.current]);

    useEffect(() => {
        const backContainer = backContainerRef.current;
        if (!backContainer) return;

        const resizeObserver = new ResizeObserver(() => {
            // Use requestAnimationFrame to ensure DOM has updated
            requestAnimationFrame(() => {
                calculateBackTextSize();
            });
        });

        resizeObserver.observe(backContainer);

        return () => {
            resizeObserver.disconnect();
        };
    }, [backContainerRef.current]);

    const baseClasses = `flip-cross-clues-card 
        aspect-square flex items-center justify-center
        overflow-hidden text-center border border-4
        cursor-pointer`;

    // const baseClasses = `flip-cross-clues-card 
    //     aspect-square flex items-center justify-center
    //     overflow-hidden text-center border border-4 ${cellSize} 
    //     cursor-pointer`;

    const correctCardClasses = `border-[#10563F]`;
    const incorrectCardClasses = `border-[#C44104]`;
    const closeCardClasses = `border-[#F37332]`;

    const cardClickHandler = () => {
        handleCardFlip(rowIndex, colIndex, clueCell);

        if (!clueCell) {
            // Set the border class after the flip animation starts
            setTimeout(() => {
                setClickEffectClass(correctCard === 'correct' ? correctCardClasses :
                    correctCard === 'incorrect' ? incorrectCardClasses :
                        correctCard === 'close' ? closeCardClasses : '');
            }, 1); // Small delay to ensure flip state is updated
        }
    }

    return (
        <div
            className={`${baseClasses} ${isFlipped ? `flipped ${clueCell ? '' : clickEffectClass}` : `${highlightClass}`}`}
            onClick={frontContent.content != '?' && clueCell ? undefined : () => cardClickHandler()}
            style={{ maxWidth: cellSize, maxHeight: cellSize}}
        >
            <div className="flip-cross-clues-card-inner">
                <div className={`flip-cross-clues-card-front flex items-center justify-center ${frontClassName}`}>
                    {/* {clueCell && <div className="absolute top-0 left-0 flex items-center justify-center p-2">
                        <span
                            className="max-md:hidden text-[8pt] text-gray-300 cursor-pointer !hover:text-gray-500 transition-colors duration-200"
                        >
                            {frontContent != '?' ? 'Your clue:' : 'Set clue'}
                        </span>
                    </div>} */}
                    <div ref={frontContainerRef} className="w-full h-full flex items-center justify-center p-2">
                        {(
                            <span
                                ref={frontContentRef}
                                style={{ fontSize: `${frontTextSize}px` }}
                                className={`
                                    ${frontClassName}
                                    w-[95%]
                                    whitespace-nowrap
                                    text-center
                                    overflow-hidden
                                    font-bold
                                `}
                            >
                                {frontContent.content}
                            </span>
                        )}
                    </div>
                </div>
                <div className={`flip-cross-clues-card-back bg-white flex items-center justify-center ${backClassName}`}>
                    <div ref={backContainerRef} className="w-full h-full flex items-center justify-center p-2">
                        <span
                            ref={backContentRef}
                            style={{ fontSize: `${backTextSize}px` }}
                            className='font-bold'
                        >
                            {backContent}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CCCard;
