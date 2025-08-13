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
    closeVoteOptions: (rowIndex: number, colIndex: number) => void;
    /** Callback when a player's vote is selected */
    handleVoteSelect: (clue: string, CO: GridCellCO) => void;
    playerVotes: { CO: (GridCellCO | null), clue: string }[];
    playerVote: string;
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
    closeVoteOptions,
    handleVoteSelect,
    playerVotes,
    playerVote,
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
    const [voteOptionsClue, setVoteOptionClue] = useState<string>(''); // The text infront of the vote options
    const [clueColor, setClueColor] = useState<{ clue: string, color: string, index: number }[]>([])

    // const [votedByThisPlayer, setvotedByThisPlayer] = useState(thisPlayerVotes?.some((vote) => vote.CO?.rowIndex === rowIndex && vote.CO?.colIndex === colIndex));
    // const [votedByOtherPlayers, setvotedByOtherPlayers] = useState(otherPlayerVotes?.some((vote) => vote.CO?.rowIndex === rowIndex && vote.CO?.colIndex === colIndex));

    // const [playerVoted, setPlayerVoted] = useState(clueCellContent.findIndex((content) => content !== "?" && ));

    // const handleVoteSelect = (playerIndex: number) => {
    //     setPlayerVoted(playerIndex);
    // };

    useEffect(() => {
        // setVoteOptionClue(playerVotes[playerOnThisDevice].clue)
        if (playerVotes[playerOnThisDevice].CO == null) {
            setIsPieVisible(false);
        }

        // if (playerVotes[playerOnThisDevice].CO?.rowIndex === rowIndex && playerVotes[playerOnThisDevice].CO?.colIndex === colIndex) {
        //     setIsPieVisible(true);
        // } 
    }, [playerVotes])


    const baseClasses = `flip-cross-clues-card 
        aspect-square flex items-center justify-center
        overflow-hidden text-center border border-4
        cursor-pointer`;

    const correctCardClasses = `border-[#10563F]`;
    const incorrectCardClasses = `border-[#C44104]`;
    const closeCardClasses = `border-[#F37332]`;

    const cardClickHandler = (clueIndex: number) => {
        // Don't flip if we're showing the voting UI
        // if (isVoted) return;


        openVoteOptions(rowIndex, colIndex, clueCell, clueIndex);
        setVoteOptionClue(clueCellContent[clueIndex]);
        if (frontContent.vote == null) {
            setIsPieVisible(true);
        }

        if (!clueCell) {
            // Set the border class after the flip animation starts
            setTimeout(() => {
                setClickEffectClass(correctCard === 'correct' ? correctCardClasses :
                    correctCard === 'incorrect' ? incorrectCardClasses :
                        correctCard === 'close' ? closeCardClasses : '');
            }, 1); // Small delay to ensure flip state is updated
        }
    };

    const handleInnerCircleClick = () => {
        handleVoteSelect(clueColor[clueColor.findIndex((c) => c.clue === voteOptionsClue)].clue, { rowIndex: rowIndex, colIndex: colIndex })
        
    }   

    useEffect(() => {
        const clueColor = clueCellContent
            .map((c, index) => (c !== "?" && index !== playerOnThisDevice) ? { clue: c, color: getPlayerColor(index), index } : null)
            .filter(Boolean) as { clue: string, color: string, index: number }[];

        setClueColor(clueColor)
    }, [clueCellContent]);

    // find all who have voted for this card


    // console.log("thisPlayerVotes", thisPlayerVotes)
    // console.log("otherPlayerVoted", otherPlayerVotes)

    const renderPieSlices = useCallback(() => {
        if (clueColor.length === 0) return null;

        const centerX = 50;
        const centerY = 50;
        const radius = 80; // Slightly larger than before but not too big
        const innerRadius = 40; // Size of the white center circle

        const slices = [];
        for (let i = 0; i < clueColor.length; i++) {
            const startAngle = (i / clueColor.length) * 2 * Math.PI - Math.PI / 2; // Start from top
            const endAngle = ((i + 1) / clueColor.length) * 2 * Math.PI - Math.PI / 2;

            // Outer arc points
            const startX = centerX + radius * Math.cos(startAngle);
            const startY = centerY + radius * Math.sin(startAngle);
            const endX = centerX + radius * Math.cos(endAngle);
            const endY = centerY + radius * Math.sin(endAngle);

            // Inner arc points (for the white circle cutout)
            const innerStartX = centerX + innerRadius * Math.cos(endAngle);
            const innerStartY = centerY + innerRadius * Math.sin(endAngle);
            const innerEndX = centerX + innerRadius * Math.cos(startAngle);
            const innerEndY = centerY + innerRadius * Math.sin(startAngle);

            const largeArcFlag = (endAngle - startAngle) <= Math.PI ? '0' : '1';

            const pathData = [
                `M ${centerX} ${centerY}`,
                `L ${startX} ${startY}`,
                `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`,
                'Z'
            ].join(' ');

            slices.push(
                <g key={i} role="button" tabIndex={0}
                    onClick={(e) => {
                        e.stopPropagation();
                        console.log('voteOptionsClue', voteOptionsClue)
                        console.log('clueColor[i].clue', clueColor[i].clue)

                        if (clueColor[i].clue == voteOptionsClue) {
                            
                            handleVoteSelect(clueCellContent[clueColor[i].index], { rowIndex: rowIndex, colIndex: colIndex })
                        } else {
                            cardClickHandler(clueColor[i].index)
                        }
                    }}
                    onMouseEnter={() => cardClickHandler(clueColor[i].index)}
                    onMouseLeave={() => cardClickHandler(clueColor[0].index)}
                    aria-label={`Vote for player ${clueColor[i].index}`}
                    className="outline-none"
                >
                    <path
                        d={pathData}
                        className={`fill-${clueColor[i].color} transition-opacity duration-200`}
                        role="presentation"
                    />
                </g>
            );
        }

        return (
            <div
                className="absolute inset-0 z-10 flex items-center justify-center"
                role="menu"
                aria-label="Vote for a player"
                onClick={(e) => {
                    e.stopPropagation();
                    handleVoteSelect(clueColor[0].clue, { rowIndex: rowIndex, colIndex: colIndex })
                    cardClickHandler(clueColor[0].index)
                }}
            >
                <div className="relative w-full h-full flex items-center justify-center">
                    <svg
                        viewBox="0 0 100 100"
                        className="w-full h-full touch-pinch-zoom overflow-visible"
                        role="presentation"
                    >
                        {clueColor.length === 1 // 2 player
                            ? <circle
                                cx={centerX}
                                cy={centerY}
                                r={innerRadius}
                                className={`fill-${clueColor[0].color} transition-opacity duration-200`}
                                role="presentation"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleVoteSelect(clueColor[clueColor.findIndex((c) => c.clue === voteOptionsClue)].clue, { rowIndex: rowIndex, colIndex: colIndex })
                                }}
                            /> : slices // Multi-slice pie chart for more than 1 player
                        }

                        {clueColor.length > 1 &&  
                        <circle
                            cx={centerX}
                            cy={centerY}
                            r={innerRadius}
                            className="fill-white"
                            role="presentation"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleVoteSelect(clueColor[clueColor.findIndex((c) => c.clue === voteOptionsClue)].clue, { rowIndex: rowIndex, colIndex: colIndex });
                            }}
                        />}
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none w-full h-full p-2">
                        <Textfit
                            mode="single"
                            forceSingleModeWidth={false}
                            className="text-gray-800 opacity-50 font-bold w-full h-full flex items-center justify-center p-2"
                            aria-hidden="true"
                        >
                            {voteOptionsClue}
                        </Textfit>
                    </div>
                </div>
            </div>
        );
    }, [clueCellContent, handleVoteSelect, playerOnThisDevice, voteOptionsClue, rowIndex, colIndex, cardClickHandler]);

    // Calculate dot size based on cell size and number of players
    const dotBaseSize = 0.15; // Base size as a fraction of available space
    const dotSize = `${dotBaseSize * 100}%`;
    const dotGap = `0.2rem`; // Responsive gap

    // Handle clicks outside pie slices to close them
    const handleOverlayClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        console.log('bg close')
        setIsPieVisible(false);
        closeVoteOptions(rowIndex, colIndex);

    }, [rowIndex, colIndex, handleVoteSelect]);

    // Check if pie slices are currently visible for this card
    const [isPieVisible, setIsPieVisible] = useState(false);

    // useEffect(() => {
    //     setIsPieVisible(playerVotes[playerOnThisDevice].clue != '' && playerVotes[playerOnThisDevice].CO?.rowIndex === rowIndex && playerVotes[playerOnThisDevice].CO?.colIndex === colIndex);

    // }, [playerVotes]);

    return (
        <div className="relative overflow-visible" style={{ maxWidth: cellSize, maxHeight: cellSize }}>
            {/* Dark overlay when pie slices are visible */}
            {isPieVisible && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-20"
                    onClick={handleOverlayClick}
                    style={{ pointerEvents: 'auto' }}
                />
            )}

            <button
                className={`w-full h-full ${baseClasses} ${isFlipped ? `flipped ${clueCell ? '' : clickEffectClass}` : `${highlightClass}`} ${isPieVisible ? 'z-30' : ''}`}
                onClick={frontContent.color != '' || clueColor.length === 0 ? undefined : () => cardClickHandler(clueColor[0].index)}
            >
                <div className="flip-cross-clues-card-inner">
                    <div className={`flip-cross-clues-card-front flex items-center justify-center ${frontClassName}`}>
                        <div className="w-full h-full p-1">
                            <Textfit
                                mode="single"
                                forceSingleModeWidth={false}
                                className={`w-full h-full flex items-center justify-center font-bold ${frontClassName}`}
                            >
                                {frontContent.content}
                            </Textfit>
                        </div>

                        {frontContent.playersVoted != null && frontContent.playersVoted.length > 0 && (
                            <div
                                className="absolute bottom-0 left-0 flex flex-row-reverse w-full h-fit pb-1.5 px-1 z-10"
                                style={{ gap: dotGap }}
                            >
                                {frontContent.playersVoted.map((playerVoted, index) => (
                                    <div
                                        key={index}
                                        className={`aspect-square rounded-full bg-${getPlayerColor(playerVoted)}Dark`}
                                        style={{
                                            width: dotSize,
                                            height: 'auto',
                                            minWidth: '0.25rem',
                                            minHeight: '0.25rem',
                                            maxWidth: '1rem',
                                            maxHeight: '1rem'
                                        }}
                                    />
                                ))}
                                {Array.from({ length: Math.max(0, clueCellContent.length - 2 - frontContent.playersVoted.length) }).map((_, index) => (
                                    <div
                                        key={index}
                                        className="aspect-square bg-gray-200 rounded-full"
                                        style={{
                                            width: dotSize,
                                            height: 'auto',
                                            minWidth: '0.25rem',
                                            minHeight: '0.25rem',
                                            maxWidth: '1rem',
                                            maxHeight: '1rem'
                                        }}
                                    />
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
            {isPieVisible && (
                <>
                    <div
                        className="fixed inset-0 bg-black bg-opacity-20 z-20"
                        onClick={handleOverlayClick}
                    />
                    <div
                        className="absolute inset-0 z-40"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {renderPieSlices()}
                    </div>
                </>
            )}
        </div>
    );
};

export default CCCard;
