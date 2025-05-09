import React from 'react';

// Define the types for header content
// React.ReactNode allows strings, numbers, JSX elements (like <img>), etc.
type HeaderContent = React.ReactNode;

// Define the props for the component
interface RowProps {
    /** Array of content for the row headers (e.g., ['1', '2', '3', '4', '5'] or image elements). Expecting 5 elements. */
    rowHeaders: HeaderContent[];
    /** Array of content for the column headers (e.g., ['A', 'B', 'C', 'D', 'E'] or image elements). Expecting 5 elements. */
    colHeaders: HeaderContent[];
    /** Optional: Additional CSS classes for the main grid container */
    className?: string;
    /** Optional: Tailwind size class for cells (e.g., 'w-16', 'h-16'). If not provided, relies purely on aspect-square and grid layout. */
    cellSize?: string; // Changed from 'size' to 'cellSize' for clarity
}

const CCRows: React.FC<RowProps> = ({
                                        rowHeaders,
                                        colHeaders,
                                        className = '',
                                        cellSize = '', // Default to empty, letting aspect-square manage size based on container width
                                    }) => {
    const numRows = 5;
    const numCols = 5;

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
        const baseClasses = `
      aspect-square flex items-center justify-center
      overflow-hidden p-1 text-center ${cellSize}
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

    const renderHeader = (
        content: React.ReactNode,
        key: string | number,
        isTop: boolean = false
    ) => {
        const baseClasses = `flex items-center justify-center
      overflow-hidden p-1 text-center bg-white border border-gray-100 border-4 rounded-2xl font-bold text-gray-500
      ${isTop ? 'rounded-b' : ' rounded-t'}`; // Added overflow-hidden, padding, text-center
        // const headerClasses = isTop ? 'rounded-b' : ' rounded-t';
        // Ensure images within cells are contained and centered
        const contentWrapperClasses = 'max-w-full max-h-full object-contain flex items-center justify-center'; // Added flex centering here too

        return (
            <div key={key} className={`${baseClasses}`}>
                {/* Wrap content, especially useful if it's an image */}
                <div className={contentWrapperClasses}>{content}</div>
            </div>
        );
    };

    // Generate column letters ('A', 'B', ...)
    const colLetters = Array.from({length: numCols}, (_, i) =>
        String.fromCharCode(65 + i)
    );

    // ****** FIX: Added the 'return' keyword here ******
    return (
        // The main grid container. grid-cols-6 because we have 1 header col + 5 data cols.
        // gap-0 ensures borders touch cleanly.
        <div
            className={`grid grid-cols-5 gap-0 border border-gray-100 ${className}`}
            style={{width: 'fit-content'}} // Ensure container shrinks to fit content if no specific width/cellSize is given
        >
            {/* Top-left empty corner cell */}
            {/*{renderCell('', 'corner-cell', true)}*/}

            {/* Column Headers */}
            {colHeaders.map((header, index) =>
                renderHeader(`${colLetters[index]}`, `col-header-${index}`, true)
            )}
            {colHeaders.map((header, index) =>
                renderCell(header, `col-header-${index}`, true)
            )}
            {rowHeaders.map((header, index) =>
                renderCell(header, `col-header-${index}`, true)
            )}
            {/* Column Headers */}
            {colHeaders.map((header, index) =>
                renderHeader(`${index + 1}`, `row-header-${index}`, false)
            )}

            {/*/!* Rows: Each row contains a Row Header + Data Cells *!/*/}
            {/*{Array.from({length: numRows}).map((_, rowIndex) => (*/}
            {/*    // Using React.Fragment for key prop on the group of elements per row*/}
            {/*    <React.Fragment key={`row-${rowIndex}`}>*/}
            {/*        /!* Row Header *!/*/}
            {/*        {renderCell(rowHeaders[rowIndex], `row-header-${rowIndex}`, true)}*/}

            {/*        /!* Data Cells for the current row *!/*/}
            {/*        {Array.from({length: numCols}).map((_, colIndex) => {*/}
            {/*            const cellContent = `${colLetters[colIndex]}${rowIndex + 1}`;*/}
            {/*            return renderCell(*/}
            {/*                cellContent,*/}
            {/*                `cell-${rowIndex}-${colIndex}`,*/}
            {/*                false*/}
            {/*            );*/}
            {/*        })}*/}
            {/*    </React.Fragment>*/}
            {/*))}*/}
        </div>
    ); // End of the returned JSX element
}; // End of the GridComponent function

export default CCRows;