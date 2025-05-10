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
    correctCard?: boolean;
    /** Optional: Callback when content is edited */
    onContentEdit?: (newContent: string) => void;
    /** Whether the card is currently flipped */
    isFlipped: boolean;
    /** Callback when the card is flipped */
    handleCardFlip: (rowIndex: number, colIndex: number, clueCell: boolean) => void;
    rowIndex: number;
    colIndex: number;
    resetFlippedCardState: () => void;
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
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(frontContent);
    const [isCorrect, setIsCorrect] = useState(correctCard);
    const [fontSize, setFontSize] = useState('text-2xl');
    const [clickEffectClass, setClickEffectClass] = useState('');
    const contentRef = useRef<HTMLSpanElement>(null);

    // Add effect to sync editValue with frontContent
    useEffect(() => {
        setEditValue(frontContent);
    }, [frontContent]);

    useEffect(() => {
        if (contentRef.current) {
            const content = contentRef.current;
            const parent = content.parentElement;
            if (parent) {
                // Start with a large font size and reduce until it fits
                let currentSize = 54;
                content.style.fontSize = `${currentSize}px`;

                while (content.scrollWidth > parent.clientWidth - 20 && currentSize > 4) {
                    currentSize -= 2;
                    content.style.fontSize = `${currentSize}px`;
                }
            }
        }
    }, [frontContent]);

    const baseClasses = `flip-card 
        aspect-square flex items-center justify-center
        overflow-hidden text-center border border-gray-100 border-4 ${cellSize} 
        cursor-pointer`;

    const correctCardClasses = `border-green-500`;
    const incorrectCardClasses = `border-red-500`;

    const cardClickHandler = () => {
        if (!isEditing) {
            if (!isFlipped && !clueCell) {
                setTimeout(() => {
                    setClickEffectClass(correctCard ? correctCardClasses : incorrectCardClasses);
                    if (correctCard) {
                        setEditValue('');
                    }
                }, 350);
                // Reset the edit value if the card is correct
            } else if (clueCell) {
                setIsEditing(true);
            } else {
                setClickEffectClass('');
            }
            handleCardFlip(rowIndex, colIndex, clueCell);
        }
    }

    const handleEditClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent card flip when clicking edit
        setIsEditing(true);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEditValue(e.target.value);
    };

    const saveClue = () => {
        setIsEditing(false);
        resetFlippedCardState();
        if (editValue.split(' ').length >= 2) {
            alert('Please enter a single word');
        }
        else if (onContentEdit && editValue !== '') {
            // resetFlippedCardState();
            onContentEdit(editValue);
        }
    }

    const handleInputBlur = () => {
        saveClue()
    };

    const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            saveClue()
        }
    };

    return (
        <div
            className={`${baseClasses} ${isFlipped ? `flipped ${clueCell ? '' : clickEffectClass}` : ''}`}
            onClick={() => cardClickHandler()}
        >
            <div className="flip-card-inner">
                <div className={`flip-card-front bg-white flex items-center justify-center ${frontClassName}`}>
                    {clueCell && <div className="absolute bottom-0 right-0 flex items-center justify-center p-2">
                        <span
                            className="text-[8pt] text-gray-300 cursor-pointer !hover:text-gray-500 transition-colors duration-200"
                            onClick={handleEditClick}
                        >
                            {frontContent != '?' ? 'Edit clue' : 'Give clue'}
                        </span>
                    </div>}
                    <div className="w-full h-full flex items-center justify-center p-2">
                        {(
                            <span
                                ref={contentRef}
                                className={`
                                    ${frontClassName}
                                    w-[95%]
                                    whitespace-nowrap
                                    text-center
                                    overflow-hidden
                                `}
                            >
                                {frontContent}
                            </span>
                        )}
                    </div>
                </div>
                <div className={`flip-card-back bg-white flex items-center justify-center ${backClassName}`}>
                    <div className="w-full h-full flex items-center justify-center p-2">
                        {isEditing ? (
                            <div className="w-full h-full flex flex-col items-center justify-between py-2">
                                <input
                                    type="text"
                                    value={editValue === '?' ? '' : editValue}
                                    placeholder="Give a clue for:"
                                    onChange={handleInputChange}
                                    onBlur={handleInputBlur}
                                    onKeyDown={handleInputKeyDown}
                                    className="w-24 text-center text-sm px-1 py-0 placeholder:text-gray-300 text-[9pt] pb-0 h-10
                                    focus:outline-none focus:ring-0 focus:ring-gray-100 focus:border-gray-100 focus:border-0 focus:border-b-2 focus:border-b-gray-100
                                    outline-none ring-0 ring-gray-100 border-gray-100 border-0 border-b-2 border-b-gray-100
                                    "
                                    autoFocus
                                />
                                <span className={`text-[40px] pb-0`}> {backContent} </span>

                            </div>
                        ) : (
                            <span className={`text-[54px]`}> {backContent} </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CCCard;
