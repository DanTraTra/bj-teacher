import React, { useState, useEffect, useRef } from 'react';

interface CCCardProps {
    frontContent: string;
    backContent: string | null;
    beginsFlipped: boolean;
    /** Optional: Tailwind size class for the card (e.g., 'w-16', 'h-16') */
    cellSize?: string;
    /** Optional: Additional CSS classes */
    frontClassName?: string;
    backClassName?: string;
    clueCell?: boolean;
    correctCard?: 'correct' | 'incorrect' | 'close';
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

    useEffect(() => {
        if (frontContentRef.current && frontContainerRef.current) {
            const content = frontContentRef.current;
            const container = frontContainerRef.current;
            let currentSize = 54;
            content.style.fontSize = `${currentSize}px`;

            // Get the actual width of the container, accounting for padding
            const containerWidth = container.clientWidth - 18; // 20px for padding
            // console.log("containerWidth", containerWidth, "container.clientWidth", container.clientWidth)
            // console.log("text_size", frontContent && !frontContent.match('^[A-E][1-5]$'))
            // console.log("content.scrollWidth", content.scrollWidth)
            
            if (frontContent && !frontContent.match('^[A-E][1-5]$')) {
                while (content.scrollWidth > containerWidth && currentSize > 8) {
                    currentSize -= 2;
                    content.style.fontSize = `${currentSize}px`;
                }
                setFrontTextSize(currentSize);

            } else {
                content.style.fontSize = `${container.clientHeight*0.5}px`;
                setFrontTextSize(container.clientHeight*0.5);
            }
        }
    }, [frontContent]);

    useEffect(() => {
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
    }, [backContent]);

    const baseClasses = `flip-cross-clues-card 
        aspect-square flex items-center justify-center
        overflow-hidden text-center border border-4 ${cellSize} 
        cursor-pointer`;

    const correctCardClasses = `border-correct`;
    const incorrectCardClasses = `border-wrong`;
    const closeCardClasses = `border-close`;

    const cardClickHandler = () => {
        if (!isFlipped && !clueCell) {
            setTimeout(() => {
                setClickEffectClass(correctCard == 'correct' ? correctCardClasses : correctCard == 'close' ? closeCardClasses : incorrectCardClasses);
            }, 0);
            
        }
        handleCardFlip(rowIndex, colIndex, clueCell);
    }

    return (
        <div
            className={`${baseClasses} ${highlightClass} ${isFlipped ? `flipped ${clueCell ? '' : clickEffectClass}` : ''}`}
            onClick={frontContent != '?' && clueCell ? undefined : () => cardClickHandler()}
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
                                {frontContent}
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
