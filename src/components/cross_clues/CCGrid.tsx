import React, { useEffect, useState } from 'react';
import CCCard from './CCCard';

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
    randomCO: string | null;
    numRows: number;
    numCols: number;
}

const CCGrid: React.FC<GridProps> = ({
    rowHeaders,
    colHeaders,
    className = '',
    cellSize = '',
    randomCO,
    numRows,
    numCols,
}) => {

    // Add state for the clue cell content
    const [clueCellContent, setClueCellContent] = useState("?");
    
    // Add state to track the currently flipped card
    const [flippedCard, setFlippedCard] = useState<string | null>(null);

    // Handler for clue cell content updates
    const handleClueCellEdit = (newContent: string) => {
        setClueCellContent(newContent);
    };

    // Handler for card flips
    const handleCardFlip = (cellId: string) => {
        if (clueCellContent === "?" && cellId !== "clue") {
            alert("Your partner needs to give a clue first!");
        } else {
            setFlippedCard(prevFlipped => prevFlipped === cellId ? null : cellId);
        }
    };

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
        isHeader: boolean = false
    ) => {
        const baseClasses = `flip-card 
      aspect-square flex items-center justify-center
      overflow-hidden text-center text-7xl text-gray-100 hover:text-gray-500 border border-gray-100 border-4 ${cellSize} 
    `; // Added overflow-hidden, padding, text-center
        const headerClasses = isHeader ? 'bg-gray-100 font-semibold' : 'bg-white';
        // Ensure images within cells are contained and centered
        const contentWrapperClasses = 'max-w-full max-h-full object-contain flex items-center justify-center'; // Added flex centering here too

        return (
            <div key={key} className={`${baseClasses} ${headerClasses}`}>
                {/* Wrap content, especially useful if it's an image */}
                <div className={contentWrapperClasses}>{content}</div>
            </div>
        );
    };


    // Generate column letters ('A', 'B', ...)
    const colLetters = Array.from({length: numCols}, (_, i) =>
        String.fromCharCode(65 + i)
    );

    return (
        // The main grid container. grid-cols-6 because we have 1 header col + 5 data cols.
        // gap-0 ensures borders touch cleanly.
        <div
            className={`grid grid-cols-6 gap-0 ${className}`}
            style={{width: 'fit-content'}} // Ensure container shrinks to fit content if no specific width/cellSize is given
        >
            {/* Top-left clue cell */}
            <CCCard 
                frontContent={clueCellContent}
                backContent={randomCO}
                beginsFlipped={false}
                cellSize={cellSize}
                frontClassName="text-gray-500"
                backClassName="text-gray-500"
                clueCell={true}
                onContentEdit={handleClueCellEdit}
                isFlipped={flippedCard === 'clue'}
                onFlip={() => handleCardFlip('clue')}
            />

            {/* Column Headers */}
            {colHeaders.map((header, index) =>
                renderCell(header, `col-header-${index}`, true)
            )}

            {/* Rows: Each row contains a Row Header + Data Cells */}
            {Array.from({length: numRows}).map((_, rowIndex) => (
                // Using React.Fragment for key prop on the group of elements per row
                <React.Fragment key={`row-${rowIndex}`}>
                    {/* Row Header */}
                    {renderCell(rowHeaders[rowIndex], `row-header-${rowIndex}`, true)}

                    {/* Data Cells for the current row */}
                    {Array.from({length: numCols}).map((_, colIndex) => {
                        const cellContent = `${colLetters[colIndex]}${rowIndex + 1}`;
                        return (
                            <CCCard 
                                key={`cell-${colIndex}-${rowIndex}`}
                                frontContent={cellContent}
                                backContent={cellContent === randomCO ? '✓' : '✗'}
                                beginsFlipped={false}
                                cellSize={cellSize}
                                frontClassName="text-gray-200 hover:text-gray-500"
                                backClassName={cellContent === randomCO ? 'text-green-500' : 'text-red-500'}
                                clueCell={false}
                                correctCard={cellContent === randomCO ? true : false}
                                isFlipped={flippedCard === cellContent}
                                onFlip={() => handleCardFlip(cellContent)}
                            />
                        )
                    })}
                </React.Fragment>
            ))}
        </div>
    ); // End of the returned JSX element
}; // End of the GridComponent function

export default CCGrid;