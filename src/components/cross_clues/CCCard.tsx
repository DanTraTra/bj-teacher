import React, { useState, useEffect, useRef } from 'react';

interface CCCardProps {
    frontContent: string;
    backContent: string;
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
}) => {
    const [isFlipped, setIsFlipped] = useState(beginsFlipped);
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(frontContent);
    const [isCorrect, setIsCorrect] = useState(correctCard);
    const [fontSize, setFontSize] = useState('text-2xl');
    const [clickEffectClass, setClickEffectClass] = useState('');
    const contentRef = useRef<HTMLSpanElement>(null);

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
            setIsFlipped(!isFlipped);
            if (!isFlipped) {
                setTimeout(() => {
                    setClickEffectClass(correctCard ? correctCardClasses : incorrectCardClasses);
                }, 350);
            } else {
                setClickEffectClass('');
            }
        }
    }

    const handleEditClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent card flip when clicking edit
        setIsEditing(true);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEditValue(e.target.value);
    };

    const handleInputBlur = () => {
        setIsEditing(false);
        if (onContentEdit && editValue !== frontContent) {
            onContentEdit(editValue);
        }
    };

    const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            setIsEditing(false);
            if (editValue.split(' ').length >= 2) {
                alert('Please enter a single word');
            }
            else if (onContentEdit && editValue !== frontContent && editValue !== '') {
                onContentEdit(editValue);
            }
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
                            className="text-[10pt] text-gray-300 cursor-pointer !hover:text-gray-500 transition-colors duration-200"
                            onClick={handleEditClick}
                        >
                            {frontContent != '?' ? 'Edit clue' : 'Give clue'}
                        </span>
                    </div>}
                    <div className="w-full h-full flex items-center justify-center p-2">
                        {isEditing ? (
                            <input
                                type="text"
                                value={editValue}
                                onChange={handleInputChange}
                                onBlur={handleInputBlur}
                                onKeyDown={handleInputKeyDown}
                                className="w-24 text-center text-2xl border border-gray-300 rounded px-2 py-1"
                                autoFocus
                            />
                        ) : (
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
                        <span
                            className={`text-[54px]`}
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
