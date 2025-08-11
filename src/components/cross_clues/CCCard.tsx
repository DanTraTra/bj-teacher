import React, { useState, useCallback, useEffect } from 'react';
import { Textfit } from '@ataverascrespo/react18-ts-textfit';
import { FrontCellContent, getPlayerColor, GridCellCO } from './RandomImageGridWrapper';
import { div } from '@tensorflow/tfjs';

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
    openVoteOptions: (rowIndex: number, colIndex: number, clueCell: boolean, clueIndex: number) => void;
    /** Callback when a player's vote is selected */
    handleVoteSelect: (clue: string, CO: GridCellCO) => void;
    playerVotes: { CO: (GridCellCO | null), clue: string }[];
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
    openVoteOptions,
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
    // const [clue, setClue] = useState<string | null>(Object.entries(playerVotes).find(([key, value]) => {
    //     return value[playerOnThisDevice]?.CO?.rowIndex === rowIndex && value[playerOnThisDevice]?.CO?.colIndex === colIndex
    // })?.[0] ?? null);

    const [voteOptionsClue, setVoteOptionClue] = useState<string | null>(clueCellContent.find((content) => content !== "?") ?? null);


    // const [votedByThisPlayer, setvotedByThisPlayer] = useState(thisPlayerVotes?.some((vote) => vote.CO?.rowIndex === rowIndex && vote.CO?.colIndex === colIndex));
    // const [votedByOtherPlayers, setvotedByOtherPlayers] = useState(otherPlayerVotes?.some((vote) => vote.CO?.rowIndex === rowIndex && vote.CO?.colIndex === colIndex));

    // const [playerVoted, setPlayerVoted] = useState(clueCellContent.findIndex((content) => content !== "?" && ));

    // const handleVoteSelect = (playerIndex: number) => {
    //     setPlayerVoted(playerIndex);
    // };

    useEffect(() => {
        // setVoteOptionClue(playerVotes[playerOnThisDevice].clue)

    }, [playerVotes])


    const baseClasses = `flip-cross-clues-card 
        aspect-square flex items-center justify-center
        overflow-hidden text-center border border-4
        cursor-pointer`;

    const correctCardClasses = `border-[#10563F]`;
    const incorrectCardClasses = `border-[#C44104]`;
    const closeCardClasses = `border-[#F37332]`;

    const cardClickHandler = (clueIndex = 0) => {
        // Don't flip if we're showing the voting UI
        // if (isVoted) return;

        if (voteOptionsClue) {

        }

        openVoteOptions(rowIndex, colIndex, clueCell, clueIndex);
        setVoteOptionClue(clueCellContent[clueIndex]);

        if (!clueCell) {
            // Set the border class after the flip animation starts
            setTimeout(() => {
                setClickEffectClass(correctCard === 'correct' ? correctCardClasses :
                    correctCard === 'incorrect' ? incorrectCardClasses :
                        correctCard === 'close' ? closeCardClasses : '');
            }, 1); // Small delay to ensure flip state is updated
        }
    };

    // find all who have voted for this card


    // console.log("thisPlayerVotes", thisPlayerVotes)
    // console.log("otherPlayerVoted", otherPlayerVotes)

    const renderPieSlices = useCallback(() => {
        const clueColor = clueCellContent
            .map((c, index) => (c !== "?" && index !== playerOnThisDevice) ? { clue: c, color: getPlayerColor(index), index } : null)
            .filter(Boolean) as { clue: string, color: string, index: number }[];

        console.log("clueColor", clueColor)
        if (clueColor.length === 0) return null;

        const centerX = 50;
        const centerY = 50;
        const radius = 90;
        const slices = [];

        // Handle single slice case - full circle button
        if (clueColor.length === 1) {
            const playerColor = clueColor[0].color;
            return (
                <div
                    className="absolute inset-0 z-10 flex items-center justify-center overflow-hidden rounded-full m-2"
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                        e.stopPropagation();
                        console.log("handleVoteSelect 2")
                        handleVoteSelect(clueColor[0].clue, { rowIndex: rowIndex, colIndex: colIndex })
                    }}
                    onMouseEnter={() => cardClickHandler(clueColor[0].index)}
                    onMouseLeave={() => cardClickHandler(0)}
                    aria-label={`Vote for clue`}
                >
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                        <circle
                            cx={centerX}
                            cy={centerY}
                            r={radius/2}
                            className={`fill-${playerColor} transition-opacity duration-200`}
                            role="presentation"
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none w-full h-full p-2">
                        <Textfit
                            mode="single"
                            forceSingleModeWidth={false}
                            className="text-gray-800 opacity-50 font-bold w-full h-full flex items-center justify-center"
                            aria-hidden="true"
                        >
                            {voteOptionsClue}
                        </Textfit>
                    </div>
                </div>
            );
        }

        // Original multi-slice pie chart code
        for (let i = 0; i < clueColor.length; i++) {
            const startAngle = (i / clueColor.length) * 2 * Math.PI + (3 * Math.PI) / 6;
            const endAngle = ((i + 1) / clueColor.length) * 2 * Math.PI + (3 * Math.PI) / 6;
            const startX = centerX + radius * Math.cos(startAngle);
            const startY = centerY + radius * Math.sin(startAngle);
            const endX = centerX + radius * Math.cos(endAngle);
            const endY = centerY + radius * Math.sin(endAngle);
            const largeArcFlag = (endAngle - startAngle) <= Math.PI ? '0' : '1';

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
                        // console.log("clueColor[i].clue", clueColor[i].clue)
                        console.log("clueColor[i].index", clueColor[i].index)    
                        console.log("voteOptionsClue", voteOptionsClue)
                    
                        clueColor[i].clue == voteOptionsClue ?
                        
                            handleVoteSelect(clueCellContent[clueColor[i].index], { rowIndex: rowIndex, colIndex: colIndex }) :
                            cardClickHandler(clueColor[i].index);
                    }}
                    onMouseEnter={() => cardClickHandler(clueColor[i].index)}
                    onMouseLeave={() => cardClickHandler(0)}
                    aria-label={`Vote for player ${clueColor[i].index}`}
                    className="outline-none"
                >
                    <path
                        d={pathData}
                        className={`fill-${playerColor} transition-opacity duration-200`}
                        role="presentation"
                    />
                </g>
            );
        }

        return (
            <div
                className="absolute inset-0 z-10 flex items-center justify-center overflow-hidden rounded-full m-2"
                role="menu"
                aria-label="Vote for a player"
            >
                <svg
                    viewBox="0 0 100 100"
                    className="w-full h-full touch-pinch-zoom"
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
                        {voteOptionsClue}
                    </Textfit>
                </div>
            </div>
        );
    }, [clueCellContent, handleVoteSelect, playerOnThisDevice, voteOptionsClue, rowIndex, colIndex, cardClickHandler]);

    // console.log("frontContent", frontContent.playersVoted)
    // console.log("clueCellContent.length", clueCellContent.length)

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
                                {!playerVotes.find((vote, index) => vote?.CO?.rowIndex === rowIndex && vote?.CO?.colIndex === colIndex && index === playerOnThisDevice) && frontContent.content}

                            </Textfit>
                        </div>

                        {frontContent.playersVoted != null && frontContent.playersVoted.length > 0 && (
                            <div className="absolute bottom-0 left-0 flex flex-row-reverse w-full h-fit pb-1.5 px-2 gap-1 z-10">
                                {frontContent.playersVoted.map((playerVoted, index) => (
                                    <div key={index} className={`w-2.5 h-2.5 rounded-full bg-${getPlayerColor(playerVoted)}Dark`}></div>
                                ))}
                                {Array.from({ length: clueCellContent.length - 2 - frontContent.playersVoted.length }).map((_, index) => (
                                    <div key={index} className={`w-2.5 h-2.5 rounded-full bg-gray-200`}></div>
                                ))}
                            </div>
                        )}

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
            {playerVotes.find((vote, index) => vote.CO?.rowIndex === rowIndex && vote.CO?.colIndex === colIndex && index === playerOnThisDevice) && (
                <div className="absolute inset-0 z-10">
                    {renderPieSlices()}
                </div>
            )}
        </div>
    );
};

export default CCCard;
