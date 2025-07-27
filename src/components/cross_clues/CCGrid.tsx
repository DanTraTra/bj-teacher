import React, { useEffect, useState } from 'react';
import CCCard from './CCCard';
import { FrontCellContent } from './RandomImageGridWrapper';
// Define the types for header content
// React.ReactNode allows strings, numbers, JSX elements (like <img>), etc.
type HeaderContent = React.ReactNode;

// Define the props for the component
interface GridProps {
    /** Array of content for the row headers (e.g., ['1', '2', '3', '4', '5'] or image elements). Expecting 5 elements. */
    rowHeaders: HeaderContent[];
    /** Array of content for the column headers (e.g., ['A', 'B', 'C', 'D', 'E'] or image elements). Expecting 5 elements. */
    colHeaders: HeaderContent[];
    /** Optional: Additional CSS classes for the main grid container */
    className?: string;
    /** Optional: Tailwind size class for cells (e.g., 'w-16', 'h-16'). If not provided, relies purely on aspect-square and grid layout. */
    cellSize?: string; // Changed from 'size' to 'cellSize' for clarity
    givenRandomCO: { rowIndex: number, colIndex: number } | null;
    otherPlayersRandomCO: { rowIndex: number, colIndex: number }[];
    numRows: number;
    numCols: number;
    clueCellContent: string;
    handleClueCellEdit: (newContent: string) => void;
    flippedCard: { rowIndex: number, colIndex: number } | null;
    resetFlippedCardState: () => void;
    frontCellContent: FrontCellContent[][];
    correctlyGuessedGrid: boolean[][];
    handleCardFlip: (rowIndex: number, colIndex: number, clueCell: boolean) => void;
    completedCards: string[];
    setViewingClue: (boolean: boolean) => void;
    viewingClue: boolean;
    handleHeaderClick: (header: React.ReactNode, CO: string) => void;
    cellColour: string;
}

const CCGrid: React.FC<GridProps> = ({
    rowHeaders,
    colHeaders,
    className = '',
    cellSize = '',
    givenRandomCO,
    otherPlayersRandomCO,
    numRows,
    numCols,
    clueCellContent,
    handleClueCellEdit,
    completedCards = [],
    flippedCard,
    resetFlippedCardState,
    frontCellContent,
    correctlyGuessedGrid,
    handleCardFlip,
    setViewingClue,
    viewingClue,
    handleHeaderClick,
    cellColour,
}) => {

    // TODO: Add the clue to the chosen correct cell

    // Basic validation (optional, but good practice in larger apps)
    if (rowHeaders.length !== numRows || colHeaders.length !== numCols) {
        console.warn(
            `GridComponent mismatch: Expected ${numRows} row headers and ${numCols} column headers, but received ${rowHeaders.length} and ${colHeaders.length}. Rendering truncated/padded grid.`
        );
        // Adjust arrays to prevent runtime errors, though ideally props validation should handle this upstream
        rowHeaders = [...rowHeaders, ...Array(numRows).fill('')].slice(0, numRows);
        colHeaders = [...colHeaders, ...Array(numCols).fill('')].slice(0, numCols);
    }



    // Helper function to render a single cell
    const renderCell = (
        content: React.ReactNode,
        key: string | number,
        isHeader: boolean = false,
        headerText: string,
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
                className={`${baseClasses} ${headerClasses}`}
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

    // console.log('completedCards', completedCards)
    // console.log(completedCards.findIndex(cards => cards == 'B1') % 2 == 0)
    // console.log(completedCards.findIndex(cards => cards == 'D1') % 2 == 0)
    // console.log(completedCards.findIndex(cards => cards == 'D2') % 2 == 0)
    // console.log(completedCards.findIndex(cards => cards == 'B4') % 2 == 0)
    // console.log("completedCards", completedCards)

    return (
        // The main grid container. grid-cols-6 because we have 1 header col + 5 data cols.
        // gap-0 ensures borders touch cleanly.


        <div
            className={`grid gap-0 ${className}`}
            style={{
                width: 'fit-content',
                gridTemplateColumns: `repeat(${numCols + 1}, 1fr)`
            }}
        >
            {/* Top-left clue cell */}
            <CCCard
                frontContent={
                    // clueCellContent
                    { content: " ", color: "white" }
                }
                backContent={""}
                beginsFlipped={false}
                cellSize={cellSize}
                frontClassName="text-gray-500 bg-gray"
                backClassName="text-gray-500 bg-gray"
                clueCell={true}
                // onContentEdit={handleClueCellEdit}
                isFlipped={
                    flippedCard?.rowIndex === 100 && flippedCard?.colIndex === 100
                }
                // handleCardFlip={handleCardFlip}
                handleCardFlip={() => { }}
                rowIndex={100}
                colIndex={100}
                resetFlippedCardState={resetFlippedCardState}
                setViewingClue={setViewingClue}
                highlightClass={"border-gray-100"}
            />

            {/* Column Headers */}
            {colHeaders.map((header, index) =>
                renderCell(header, `col-header-${index}`, true, `${String.fromCharCode(65 + index)}`)
            )}


            {/* Rows: Each row contains a Row Header + Data Cells */}
            {frontCellContent.map((row, rowIndex) => (
                // Using React.Fragment for key prop on the group of elements per row
                <React.Fragment key={`row-${rowIndex}`}>
                    {/* Row Header */}
                    {renderCell(rowHeaders[rowIndex], `row-header-${rowIndex}`, true, `${rowIndex + 1}`)}

                    {/* Data Cells for the current row */}
                    {row.map((cellContent, colIndex) => {
                        const highlightCard = viewingClue && cellContent.content === `${colLetters[givenRandomCO!.colIndex]}${givenRandomCO!.rowIndex + 1}`;
                        let highlightClasses = highlightCard ? "text-gray-500" : "text-gray-200";
                        if (correctlyGuessedGrid[rowIndex][colIndex]) {

                            highlightClasses = `text-gray-800 bg-${cellContent.color}`

                        } else {
                            highlightClasses = `${highlightClasses} bg-white`
                        };

                        // if (correctlyGuessedGrid[rowIndex][colIndex]) {highlightClasses = "text-green-500"};
                        // if (completedCards.includes(`${colLetters[colIndex]}${rowIndex + 1}`)) {highlightClasses = "text-green-500"};
                        // if (!cellContent.match('[A-F][1-5]')) {highlightClasses = "text-green-500"};
                        const correct_card = otherPlayersRandomCO.some((CO) => CO.rowIndex == rowIndex && CO.colIndex == colIndex) ? 'correct' : 'incorrect'
                        return (
                            <CCCard
                                key={`cell-${colIndex}-${rowIndex}`}
                                frontContent={cellContent}
                                backContent={correct_card == 'correct' ? '✓' : '✗'}
                                beginsFlipped={false}
                                cellSize={cellSize}
                                frontClassName={`${highlightClasses}`}
                                backClassName={correct_card == 'correct' ? 'text-correct' : 'text-wrong'}
                                clueCell={false}
                                correctCard={correct_card}
                                isFlipped={flippedCard?.rowIndex === rowIndex && flippedCard?.colIndex === colIndex}
                                handleCardFlip={handleCardFlip}
                                rowIndex={rowIndex}
                                colIndex={colIndex}
                                resetFlippedCardState={resetFlippedCardState}
                                setViewingClue={setViewingClue}
                                highlightClass={highlightCard ? `border-gray-500` : `border-gray-100`}
                            />
                        )
                    })}
                </React.Fragment>
            ))}
        </div>
    ); // End of the returned JSX element
}; // End of the GridComponent function

export default CCGrid;