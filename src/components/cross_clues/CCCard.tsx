import React, { useState, useCallback } from 'react';
import { Textfit } from '@ataverascrespo/react18-ts-textfit';
import { FrontCellContent, getPlayerColor, GridCellCO } from './RandomImageGridWrapper';

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
    /** Whether the card is currently voted */
    isVoted: boolean;
    /** Callback when the card is flipped */
    handleCardFlip: (rowIndex: number, colIndex: number, clueCell: boolean) => void;
    /** Callback when a player's vote is selected */
    handleVoteSelect: (clue: string, CO: GridCellCO | null) => void;
    playerVotes: { [key: string]: { CO: (GridCellCO | null)[] } };
    // thisPlayerVotes: { clue: string, CO: GridCellCO | null }[];
    // otherPlayerVotes: { clue: string, CO: GridCellCO | null }[];
    // recentlyVotedCards: { CO: GridCellCO | null, clue: string, colour: string }[];
    rowIndex: number;
    colIndex: number;
    resetFlippedCardState: () => void;
    setViewingClue: (boolean: boolean) => void;
    highlightClass: string;
    clueCellContent: string[];
    playerOnThisDevice: number;
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
    // isVoted,
    handleCardFlip,
    handleVoteSelect,
    playerVotes,
    // otherPlayerVotes,
    // thisPlayerVotes,
    // recentlyVotedCards,
    rowIndex,
    colIndex,
    resetFlippedCardState,
    setViewingClue,
    highlightClass,
    clueCellContent,
    playerOnThisDevice,
}) => {
    const [clickEffectClass, setClickEffectClass] = useState('');
    const [hoveredSlice, setHoveredSlice] = useState<number | null>(null);
    // const [votedByThisPlayer, setvotedByThisPlayer] = useState(thisPlayerVotes?.some((vote) => vote.CO?.rowIndex === rowIndex && vote.CO?.colIndex === colIndex));
    // const [votedByOtherPlayers, setvotedByOtherPlayers] = useState(otherPlayerVotes?.some((vote) => vote.CO?.rowIndex === rowIndex && vote.CO?.colIndex === colIndex));

    // const [playerVoted, setPlayerVoted] = useState(clueCellContent.findIndex((content) => content !== "?" && ));

    // const handleVoteSelect = (playerIndex: number) => {
    //     setPlayerVoted(playerIndex);
    // };

    const baseClasses = `flip-cross-clues-card 
        aspect-square flex items-center justify-center
        overflow-hidden text-center border border-4
        cursor-pointer`;

    const correctCardClasses = `border-[#10563F]`;
    const incorrectCardClasses = `border-[#C44104]`;
    const closeCardClasses = `border-[#F37332]`;

    const cardClickHandler = () => {
        // Don't flip if we're showing the voting UI
        // if (isVoted) return;

        handleCardFlip(rowIndex, colIndex, clueCell);

        if (!clueCell) {
            // Set the border class after the flip animation starts
            setTimeout(() => {
                setClickEffectClass(correctCard === 'correct' ? correctCardClasses :
                    correctCard === 'incorrect' ? incorrectCardClasses :
                        correctCard === 'close' ? closeCardClasses : '');
            }, 1); // Small delay to ensure flip state is updated
        }
    };

    // console.log("thisPlayerVotes", thisPlayerVotes)
    // console.log("otherPlayerVoted", otherPlayerVotes)

    const renderPieSlices = useCallback(() => {

        // const players = clueCellContent.filter((player, index) => player !== "?" && index != playerOnThisDevice ? index : null);
        console.log("playerOnThisDevice", playerOnThisDevice)
        console.log("clueCellContent", clueCellContent)
        const clueColor = clueCellContent
            .map((c, index) => (c !== "?" && index !== playerOnThisDevice) ? { clue: c, color: getPlayerColor(index) } : null)
            .filter(Boolean) as { clue: string, color: string }[];

        console.log("clueColor", clueColor)
        if (clueColor.length === 0) return null;

        const slices = [];
        const centerX = 50;
        const centerY = 50;
        // const radius = 70.71; // Slightly larger than the card to cover corners
        const radius = 80; // Slightly larger than the card to cover corners

        // Generate SVG path for each player's slice
        // Start at the top (12 o'clock position) and go clockwise
        for (let i = 0; i < clueColor.length; i++) {
            // if (clueCellContent[i] === "?") return null;
            // Angle calculations - starting from top (3 o'clock is 0 in SVG, so we add Math.PI/2 to start from top)
            const startAngle = (i / clueColor.length) * 2 * Math.PI + (3 * Math.PI) / 6;
            const endAngle = ((i + 1) / clueColor.length) * 2 * Math.PI + (3 * Math.PI) / 6;

            // Calculate start and end points for the arc
            const startX = centerX + radius * Math.cos(startAngle);
            const startY = centerY + radius * Math.sin(startAngle);
            const endX = centerX + radius * Math.cos(endAngle);
            const endY = centerY + radius * Math.sin(endAngle);

            // Large arc flag (1 for angles > 180 degrees, 0 otherwise)
            const largeArcFlag = (endAngle - startAngle) <= Math.PI ? '0' : '1';

            // Create the path data
            const pathData = [
                `M ${centerX} ${centerY}`,
                `L ${startX} ${startY}`,
                `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`,
                'Z'
            ].join(' ');

            const playerColor = clueColor[i].color;
            slices.push(
                <g key={i} role="button" tabIndex={0}
                    onClick={(e) => {
                        e.stopPropagation();
                        handleVoteSelect(clueColor[i].clue, { rowIndex: rowIndex, colIndex: colIndex });
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            e.stopPropagation();
                            handleVoteSelect(clueColor[i].clue, { rowIndex: rowIndex, colIndex: colIndex });
                        }
                    }}
                    aria-label={`Vote for player ${i}`}
                    className={`outline-none`}
                >
                    <path
                        d={pathData}
                        className={`fill-${playerColor} transition-opacity duration-200`}
                        role="presentation"
                    />
                    {/* <title>Vote for player {i + 1}</title> */}
                </g>
            );
        }

        return (
            <div
                className="absolute inset-0 z-10 flex items-center justify-center overflow-hidden"
                role="menu"
                aria-label="Vote for a player"
            >
                <svg
                    viewBox="0 0 100 100"
                    className={`w-full h-full touch-pinch-zoom border-4 border-gray-100`}
                    role="presentation"
                >
                    {slices}
                </svg>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none w-full h-full p-2">
                    <Textfit
                        mode="single"
                        forceSingleModeWidth={false}
                        className="text-gray-800 opacity-50 font-bold w-full h-full flex items-center justify-center"
                        aria-hidden="true"
                    >
                        {clueColor[0].clue}
                    </Textfit>
                </div>
            </div>
        );
    }, [clueCellContent, handleVoteSelect]);

    return (
        <div className="relative" style={{ maxWidth: cellSize, maxHeight: cellSize }}>
            <button
                className={`w-full h-full ${baseClasses} ${isFlipped ? `flipped ${clueCell ? '' : clickEffectClass}` : `${highlightClass}`}`}
                onClick={frontContent.color != '' ? undefined : () => cardClickHandler()}
            >
                <div className="flip-cross-clues-card-inner">
                    <div className={`flip-cross-clues-card-front flex items-center justify-center ${frontClassName}`}>
                        <div className="w-full h-full p-1">
                            <Textfit
                                mode="single"
                                forceSingleModeWidth={false}
                                className={`w-full h-full flex items-center justify-center font-bold ${frontClassName}`}
                            >
                                {!clueCellContent?.some((clue) => playerVotes[clue]?.CO.find((vote, index) => vote?.rowIndex === rowIndex && vote?.colIndex === colIndex && index === playerOnThisDevice)) && frontContent.content}
                            
                            </Textfit>
                        </div>
                    </div>
                    <div className={`flip-cross-clues-card-back bg-white flex items-center justify-center ${backClassName}`}>
                        <div className="w-full h-full p-1">
                            {backContent && (
                                <Textfit
                                    mode="single"
                                    forceSingleModeWidth={false}
                                    className="w-full h-full flex items-center justify-center font-bold"
                                >
                                    {backContent}
                                </Textfit>
                            )}
                        </div>
                    </div>
                </div>
            </button>
            {clueCellContent?.some((clue) => playerVotes[clue]?.CO?.find((vote, index) => vote?.rowIndex === rowIndex && vote?.colIndex === colIndex && index === playerOnThisDevice)) && (
                <div className="absolute inset-0 z-10">
                    {renderPieSlices()}
                </div>
            )}
        </div>
    );
};

export default CCCard;
