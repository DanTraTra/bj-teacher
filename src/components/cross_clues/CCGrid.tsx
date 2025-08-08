import React, { useEffect, useState, useRef } from 'react';
import CCCard from './CCCard';
import { FrontCellContent } from './RandomImageGridWrapper';
import { GridCellCO } from './RandomImageGridWrapper';
import { getPlayerColor } from './RandomImageGridWrapper';
// Define the types for header content
// React.ReactNode allows strings, numbers, JSX elements (like <img>), etc.
type HeaderContent = React.ReactNode;

// Define the props for the component
interface GridProps {
    playerOnThisDevice: number;
    /** Array of content for the row headers (e.g., ['1', '2', '3', '4', '5'] or image elements). Expecting 5 elements. */
    rowHeaders: HeaderContent[];
    /** Array of content for the column headers (e.g., ['A', 'B', 'C', 'D', 'E'] or image elements). Expecting 5 elements. */
    colHeaders: HeaderContent[];
    /** Optional: Additional CSS classes for the main grid container */
    className?: string;
    /** Optional: Inline styles for the main grid container */
    style?: React.CSSProperties;
    /** Optional: Tailwind size class for cells (e.g., 'w-16', 'h-16'). If not provided, relies purely on aspect-square and grid layout. */
    cellSize?: string; // Changed from 'size' to 'cellSize' for clarity
    givenRandomCO: { rowIndex: number, colIndex: number } | null;
    otherPlayersRandomCO: ({ rowIndex: number, colIndex: number } | null)[];
    numRows: number;
    numCols: number;
    clueCellContent: string[];
    handleClueCellEdit: (newContent: string) => void;
    flippedCard: { rowIndex: number, colIndex: number } | null;
    playerVotes: { [key: string]: { CO: (GridCellCO | null)[] } };
    resetFlippedCardState: () => void;
    frontCellContent: FrontCellContent[][];
    correctlyGuessedGrid: boolean[][];
    openVoteOptions: (rowIndex: number, colIndex: number, clueCell: boolean, clueIndex: number) => void;
    completedCards: string[];
    setViewingClue: (boolean: boolean) => void;
    viewingClue: boolean;
    handleHeaderClick: (header: React.ReactNode, CO: string) => void;
    cellColour: string;
    playerColours: string[];
    // recentlyVotedCards: ({ CO: GridCellCO | null, clue: string, colour: string })[];
    demoMode: boolean;
    hintCO: GridCellCO | null;
    bigImage: React.ReactNode | null;
    bigCO: string | null;
    currentBigImageIndex: number | null;
    handlePrevImage: () => void;
    handleNextImage: () => void;
    handleVoteSelect: (clue: string, CO: GridCellCO) => void;
}

const CCGrid: React.FC<GridProps> = ({
    playerOnThisDevice,
    rowHeaders,
    colHeaders,
    className = '',
    style = {},
    cellSize = '',
    givenRandomCO,
    otherPlayersRandomCO,
    numRows,
    numCols,
    clueCellContent,
    handleClueCellEdit,
    completedCards = [],
    flippedCard,
    playerVotes,
    resetFlippedCardState,
    frontCellContent,
    correctlyGuessedGrid,
    openVoteOptions,
    setViewingClue,
    viewingClue,
    handleHeaderClick,
    cellColour,
    playerColours,
    // recentlyVotedCards,
    demoMode,
    hintCO,
    bigImage,
    bigCO,
    currentBigImageIndex,
    handlePrevImage,
    handleNextImage,
    handleVoteSelect
}) => {
    const [hintCOState, setHintCOState] = useState<GridCellCO | null>(null);
    const [poppingCells, setPoppingCells] = useState<{ [key: string]: boolean }>({});
    const [hiddenCells, setHiddenCells] = useState<{ [key: string]: boolean }>({});
    const prevHintCOState = useRef<GridCellCO | null>(null);

    const hintRowCol = (co: { rowIndex: number, colIndex: number } | null) => {
        // console.log("correctlyGuessedGrid", correctlyGuessedGrid)

        if (co) {
            // const colCount = correctlyGuessedGrid.map(row => row[co.colIndex]).filter(Boolean).length
            // console.log("correctlyGuessedGrid.map(row => row[co.colIndex]).filter(Boolean)", correctlyGuessedGrid.map(row => row[co.colIndex]).filter(Boolean))
            // const rowCount = correctlyGuessedGrid[co.rowIndex].filter(Boolean).length
            // console.log("correctlyGuessedGrid[co.rowIndex].filter(Boolean)", correctlyGuessedGrid[co.rowIndex].filter(Boolean))

            // choose row or col randomly
            let hintCo = co
            if ((co.colIndex * co.rowIndex) % 2 == 0) {
                hintCo = { rowIndex: co.rowIndex, colIndex: -1 }
            } else {
                hintCo = { rowIndex: -1, colIndex: co.colIndex }
            }
            setHintCOState(hintCo)
            return hintCo
        } else {
            setHintCOState(null)
            return null
        }
    }

    useEffect(() => {
        hintRowCol(hintCO)
    }, [hintCO])

    useEffect(() => {
        // When hintCOState changes, trigger pop animation for cells that are being hidden
        if (hintCOState !== prevHintCOState.current) {
            // If we have a new hint, find all cells that should be hidden
            if (hintCOState) {
                // First, clear any existing popping cells
                setPoppingCells({});

                // Then, set up staggered animations
                const cellsToPop: { row: number, col: number }[] = [];

                frontCellContent.forEach((row, rowIndex) => {
                    row.forEach((_, colIndex) => {
                        if (hintCOState.rowIndex !== rowIndex && hintCOState.colIndex !== colIndex && !correctlyGuessedGrid[rowIndex][colIndex]) {
                            cellsToPop.push({ row: rowIndex, col: colIndex });
                        }
                    });
                });

                // Shuffle the cells for a more random popping effect
                const shuffledCells = [...cellsToPop].sort(() => Math.random() - 0.5);

                // Animate cells in groups with staggered delays
                const groupSize = Math.max(1, Math.floor(shuffledCells.length / 5)); // Split into ~5 groups
                const animationDuration = 170; // ms between groups

                // First, clear any previously hidden cells
                setHiddenCells({});

                shuffledCells.forEach((cell, index) => {
                    const delay = Math.floor(index / groupSize) * animationDuration;
                    const cellKey = `${cell.row}-${cell.col}`;

                    setTimeout(() => {
                        // Start the pop animation
                        setPoppingCells(prev => ({
                            ...prev,
                            [cellKey]: true
                        }));

                        // After pop animation completes, hide the cell
                        setTimeout(() => {
                            setHiddenCells(prev => ({
                                ...prev,
                                [cellKey]: true
                            }));

                            // Clear the pop state after a short delay
                            setPoppingCells(prev => {
                                const newState = { ...prev };
                                delete newState[cellKey];
                                return newState;
                            });
                        }, 250); // Slightly before the full animation completes to ensure smooth transition
                    }, delay);
                });
            } else {
                setPoppingCells({});
            }

            prevHintCOState.current = hintCOState;
        }
    }, [hintCOState, frontCellContent]);

    // Helper function to render a single cell
    const renderCell = (
        content: React.ReactNode,
        key: string | number,
        isHeader: boolean = false,
        headerText: string,
        demoMode: boolean,
    ) => {
        const baseClasses = `flip-cross-clues-card 
      aspect-square flex items-center justify-center
      overflow-hidden text-center text-7xl text-gray-100 hover:text-gray-500 border border-gray-100 border-4`; // Added overflow-hidden, padding, text-center

        //   const baseClasses = `flip-cross-clues-card 
        //   aspect-square flex items-center justify-center
        //   overflow-hidden text-center text-7xl text-gray-100 hover:text-gray-500 border border-gray-100 border-4 ${cellSize}`; // Added overflow-hidden, padding, text-center

        const headerClasses = isHeader ? 'bg-gray-100 font-semibold' : 'bg-white';
        // Ensure images within cells are contained and centered
        const contentWrapperClasses = 'max-w-full max-h-full object-contain flex items-center justify-center'; // Added flex centering here too

        // console.log("headerText", headerText)
        return (
            <div key={key}
                className={`${baseClasses} ${headerClasses} ${demoMode ? 'opacity-20' : ''}`}
                style={{ maxWidth: cellSize, maxHeight: cellSize }}
                onClick={() => { handleHeaderClick(content, headerText) }}>
                {/* Wrap content, especially useful if it's an image */}
                <div className={contentWrapperClasses}>{content}</div>
            </div>
        );
    };

    // Generate column letters ('A', 'B', ...)
    const colLetters = Array.from({ length: numCols }, (_, i) =>
        String.fromCharCode(65 + i)
    );

    const popAnimation = `@keyframes pop {
        0% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.1); opacity: 0.9; }
        100% { transform: scale(0.8); opacity: 0; }
    }
    
    .pop-out {
        animation: pop 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        will-change: transform, opacity;
    }`;


    // TODO: SYNC CCCards with gameState for the playerVotes
    return (
        <>
            <style>{popAnimation}</style>
            <div
                className={`grid gap-0 ${className}`}
                style={{
                    width: 'fit-content',
                    gridTemplateColumns: `repeat(${numCols + 1}, 1fr)`,
                    ...style
                }}
            >
                {/* Top-left clue cell */}
                <CCCard
                    frontContent={
                        // clueCellContent
                        { content: " ", color: "white", vote: null, playersVoted: null }
                    }
                    backContent={""}
                    beginsFlipped={false}
                    cellSize={cellSize}
                    frontClassName="text-gray-500 bg-gray"
                    backClassName="text-gray-500"
                    clueCell={true}
                    // onContentEdit={handleClueCellEdit}
                    isFlipped={
                        flippedCard?.rowIndex === 100 && flippedCard?.colIndex === 100
                    }
                    isVoted={
                        false
                    }
                    // thisPlayerVotes={clueCellContent.map(clue => { return { clue: clue, CO: playerVotes[clue].CO[playerOnThisDevice] } })}
                    // otherPlayerVotes={playerVotes.filter((player, index) => index !== playerOnThisDevice).flat()}
                    // openVoteOptions={openVoteOptions}
                    playerVotes={playerVotes}
                    openVoteOptions={() => { }}
                    handleVoteSelect={() => { }}
                    // recentlyVotedCards={recentlyVotedCards}
                    rowIndex={100}
                    colIndex={100}
                    resetFlippedCardState={resetFlippedCardState}
                    setViewingClue={setViewingClue}
                    highlightClass={"border-gray-100"}
                    clueCellContent={clueCellContent}
                    playerOnThisDevice={playerOnThisDevice}
                />

                {/* Column Headers */}
                {colHeaders.map((header, index) => {
                    return renderCell(header, `col-header-${index}`, true, `${String.fromCharCode(65 + index)}`, demoMode && (givenRandomCO?.colIndex !== index || !viewingClue))
                })}
                {/* Rows: Each row contains a Row Header + Data Cells */}
                {bigImage ? (
                    // Big Image Layout
                    <>

                        {/* Row Headers */}
                        {rowHeaders.map((_, idx) => (
                            <React.Fragment key={`row-header-${idx}`}>
                                {renderCell(
                                    rowHeaders[idx],
                                    `row-header-${idx}`,
                                    true,
                                    `${idx + 1}`,
                                    demoMode && (givenRandomCO?.rowIndex !== idx || !viewingClue)
                                )}
                            </React.Fragment>
                        ))}
                        {/* Big Image */}
                        <div
                            key="big-image"
                            className="col-start-2 col-span-5 row-start-2 row-span-5 relative flex items-center justify-center bg-gray-100"
                        >
                            <div className="w-full h-full object-contain p-1">{bigImage}</div>
                            {bigCO && ( // Only render bigCO if it's not an empty string
                                <div className='absolute -top-6 left-1 text-[80px] p-4 text-black tracking-wide font-bold z-10 opacity-60'>
                                    {bigCO}
                                </div>
                            )}
                            {currentBigImageIndex !== null && ( // Only show buttons if an image is displayed
                                <>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation(); // Prevent the parent div's onClick from firing
                                            handlePrevImage();
                                        }}
                                        className="absolute h-full w-12 text-center left-2 top-1/2 transform -translate-y-1/2 bg-none bg-opacity-50 text-black p-2 z-20"
                                    >
                                        &#9664;
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation(); // Prevent the parent div's onClick from firing
                                            handleNextImage();
                                        }}
                                        className="absolute h-full w-12 text-center right-2 top-1/2 transform -translate-y-1/2 bg-none bg-opacity-50 text-black p-2 z-20"
                                    >
                                        &#9654;
                                    </button>
                                </>
                            )}
                        </div>
                    </>
                ) : (
                    // Normal Grid Layout
                    frontCellContent.map((row, rowIndex) => (

                        <React.Fragment key={`row-${rowIndex}`}>
                            {/* Row Header */}
                            {renderCell(
                                rowHeaders[rowIndex],
                                `row-header-${rowIndex}`,
                                true,
                                `${rowIndex + 1}`,
                                demoMode && (givenRandomCO?.rowIndex !== rowIndex || !viewingClue)
                            )}

                            {/* Data Cells for the current row */}
                            {row.map((cellContent, colIndex) => {
                                const cellKey = `${rowIndex}-${colIndex}`;
                                const highlightCard = viewingClue && cellContent.content === `${colLetters[givenRandomCO!.colIndex]}${givenRandomCO!.rowIndex + 1}`;
                                // Check if card has been voted by others - you can initialize a vote which creates the pie slice selection buttons or you can agree with another person's vote clicking the same square
                                // const votedByOthersCards = playerVotes.map((player, index) => player.map((card) => {return  {...card, color: getPlayerColor(index)} })).filter((player, index) => index !== playerOnThisDevice).flat().find((card) => card.CO?.rowIndex === rowIndex && card.CO?.colIndex === colIndex);
                                const votedClues = Object.entries(playerVotes)
                                    .filter(([_, voteData]) =>
                                        voteData.CO?.some(co =>
                                            co?.rowIndex === rowIndex && co?.colIndex === colIndex
                                        )
                                    )
                                    .map(([clue, voteData]) => ({
                                        clue,
                                        // Find which player voted for this cell
                                        playerIndex: voteData.CO?.findIndex(co =>
                                            co?.rowIndex === rowIndex && co?.colIndex === colIndex
                                        ),
                                        co: {rowIndex, colIndex}
                                    }))
                                    .filter(vote => vote.playerIndex !== -1) // Filter out any not found
                                    .map(vote => ({
                                        ...vote,
                                        color: getPlayerColor(vote.playerIndex)
                                    }));

                                // console.log("votedClues", votedClues);
                                // console.log("votedClues", votedClues);

                                let highlightClasses = highlightCard ? "text-gray-500" : frontCellContent[rowIndex][colIndex].vote ? `text-${getPlayerColor(clueCellContent.findIndex((clue) => clue === frontCellContent[rowIndex][colIndex].vote))}` : "text-gray-200";
                                if (correctlyGuessedGrid[rowIndex][colIndex]) {
                                    highlightClasses = `text-gray-800 bg-${cellContent.color}`;
                                } else {

                                    highlightClasses = `${highlightClasses} bg-white`;


                                    // Apply demo mode opacity if needed
                                    if (demoMode && (givenRandomCO?.rowIndex !== rowIndex || givenRandomCO?.colIndex !== colIndex || !viewingClue)) {
                                        highlightClasses = `${highlightClasses} opacity-20`;
                                    }
                                }

                                let borderClasses = "border-gray-100";
                                if (highlightCard) {
                                    borderClasses = "border-gray-500";
                                }

                                const correct_card = otherPlayersRandomCO.some((CO) =>
                                    CO && CO.rowIndex === rowIndex && CO.colIndex === colIndex
                                ) ? 'correct' : 'incorrect';

                                const isPopping = poppingCells[cellKey];
                                const shouldHide = hintCOState !== null &&
                                    hintCOState?.rowIndex !== rowIndex &&
                                    hintCOState?.colIndex !== colIndex &&
                                    hiddenCells[cellKey];

                                return (
                                    <CCCard
                                        key={`cell-${colIndex}-${rowIndex}`}
                                        frontContent={shouldHide ? { content: "", color: "white", vote: "", playersVoted: null } : frontCellContent[rowIndex][colIndex].vote ? { content: frontCellContent[rowIndex][colIndex].vote!, color: "", vote: "", playersVoted: frontCellContent[rowIndex][colIndex].playersVoted } : cellContent}
                                        backContent={correct_card === 'correct' ? '✓' : '✗'}
                                        beginsFlipped={false}
                                        cellSize={cellSize}
                                        frontClassName={`${highlightClasses} ${isPopping ? 'pop-out' : ''} ${demoMode && (!viewingClue || givenRandomCO?.rowIndex !== rowIndex || givenRandomCO?.colIndex !== colIndex) && 'opacity-20'}`}
                                        backClassName={correct_card === 'correct' ? 'text-correct' : 'text-wrong'}
                                        clueCell={false}
                                        correctCard={correct_card}
                                        isFlipped={flippedCard?.rowIndex === rowIndex && flippedCard?.colIndex === colIndex}
                                        openVoteOptions={openVoteOptions}
                                        isVoted={false}
                                        handleVoteSelect={handleVoteSelect}
                                        playerVotes={playerVotes}
                                        rowIndex={rowIndex}
                                        colIndex={colIndex}
                                        resetFlippedCardState={resetFlippedCardState}
                                        setViewingClue={setViewingClue}
                                        highlightClass={`${borderClasses} ${demoMode && (!viewingClue || givenRandomCO?.rowIndex !== rowIndex || givenRandomCO?.colIndex !== colIndex) ? 'opacity-20' : ''}`}
                                        clueCellContent={clueCellContent}
                                        playerOnThisDevice={playerOnThisDevice}
                                    // playerCount={clueCellContent.filter((content) => content !== "?").length}
                                    // playerColors={playerColours.filter((colour, index) => clueCellContent[index] !== "?")}

                                    />
                                );
                            })}
                        </React.Fragment>
                    )))}
            </div>
        </>
    );
};

export default CCGrid;