import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import CCGrid from './CCGrid'; // Adjust the import path based on your structure
import CCRows from './CCRows'; // Adjust the import path based on your structure

const rootPath = 'images/'

// Helper functions for URL state management
const encodeState = (state: {
    image_numbers: number[],
    randomCO: { rowIndex: number, colIndex: number } | null,
    clueCellContent: string | null,
    frontCellContent: string[][],
    completedCards: string[]
}) => {
    const { image_numbers, randomCO, clueCellContent, frontCellContent, completedCards } = state;
    return btoa(JSON.stringify({
        in: image_numbers,
        rc: randomCO,
        ccc: clueCellContent,
        fc: frontCellContent,
        cc: completedCards
    }));
};

const decodeState = (encoded: string) => {
    try {
        const decoded = JSON.parse(atob(encoded));
        return {
            image_numbers: decoded.in,
            randomCO: decoded.rc,
            clueCellContent: decoded.ccc,
            frontCellContent: decoded.fc,
            completedCards: decoded.cc
        };
    } catch (e) {
        return null;
    }
};

// const getRandomImages = (imagePaths: string[], count: number): React.JSX.Element[] => {
//     const shuffled = [...imagePaths].sort(() => 0.5 - Math.random());
//     return shuffled.slice(0, count).map((src, i) => (
//         <img key={i} src={src} alt={`${src}`} className="w-full h-full object-contain"/>
//         // <img key={i} src={src} alt={`header-${i}`} className="w-full h-full object-contain" />
//     ));
//
// };

const RandomImageGridWrapper: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [viewingClue, setViewingClue] = useState<boolean>(false);
    const [gridView, setGridView] = useState<boolean>(true)
    const [rowHeaders, setRowHeaders] = useState<React.JSX.Element[]>([]);
    const [colHeaders, setColHeaders] = useState<React.JSX.Element[]>([]);
    const [image_numbers, setImageNumbers] = useState<number[]>([]);
    const [randomCO, setRandomCO] = useState<{ rowIndex: number, colIndex: number } | null>(null);
    const [frontCellContentState, setFrontCellContentState] = useState<string[][]>([]);
    const [completedCards, setCompletedCards] = useState<string[]>([]);
    const [clueCellContent, setClueCellContent] = useState<string>("?");
    const numRows = 5;
    const numCols = 5;

    const colLetters = Array.from({ length: numCols }, (_, i) =>
        String.fromCharCode(65 + i)
    );

    // Initialize state from URL on mount
    useEffect(() => {
        const stateParam = searchParams.get('state');
        if (stateParam) {
            const decodedState = decodeState(stateParam);
            if (decodedState) {
                console.log("Loading state from URL:", decodedState);
                setImageNumbers(decodedState.image_numbers);
                setRandomCO(decodedState.randomCO);
                setFrontCellContentState(decodedState.frontCellContent);
                setCompletedCards(decodedState.completedCards);
                setClueCellContent(decodedState.clueCellContent);
            }
        } else {
            // Only generate new random numbers if there's no URL state
            const randomNumbers: number[] = [];
            for (let i = 0; i < 10; i++) {
                let num;
                do {
                    num = Math.floor(Math.random() * 1000) + 1;
                } while (randomNumbers.includes(num));
                randomNumbers.push(num);
            }
            setImageNumbers(randomNumbers);
            
            // Initialize randomCO and frontCellContentState for new games
            setRandomCO({ rowIndex: Math.floor(Math.random() * numRows), colIndex: Math.floor(Math.random() * numCols) });
            const frontCellContent = Array.from({ length: numRows }, (_, rowIndex) =>
                Array.from({ length: numCols }, (_, colIndex) =>
                    `${String.fromCharCode(65 + colIndex)}${rowIndex + 1}`
                )
            );
            setFrontCellContentState(frontCellContent);
        }
    }, []); // Only run on mount

    const regenerateImages = () => {
        if (image_numbers.length !== 10) {
            console.log("No image numbers available yet");
            return;
        }

        console.log("Regenerating images with numbers:", image_numbers);
        const rowPaths = image_numbers.slice(0, 5).map(num => `${rootPath}image_${num}.png`);
        const colPaths = image_numbers.slice(5, 10).map(num => `${rootPath}image_${num}.png`);

        setRowHeaders(
            rowPaths.map((src, i) => (
                <img key={`row-${i}`} src={src} alt={`row-${i}`} className="w-full h-full object-contain grayscale" />
            ))
        );

        setColHeaders(
            colPaths.map((src, i) => (
                <img key={`col-${i}`} src={src} alt={`col-${i}`} className="w-full h-full object-contain grayscale" />
            ))
        );
    };

    // Generate headers when image numbers are available
    useEffect(() => {
        if (image_numbers.length === 10) {
            regenerateImages();
        }
    }, [image_numbers]);

    const regenerateRandomCO = () => {
        let tempCO = { 
            rowIndex: Math.floor(Math.random() * numRows), 
            colIndex: Math.floor(Math.random() * numCols) 
        };
        console.log("completedCards", completedCards);
        
        // Convert to coordinate string (e.g., "A1", "B2", etc.)
        const coordString = `${colLetters[tempCO.colIndex]}${tempCO.rowIndex + 1}`;
        
        while (completedCards.includes(coordString)) {
            tempCO = { 
                rowIndex: Math.floor(Math.random() * numRows), 
                colIndex: Math.floor(Math.random() * numCols) 
            };
            const newCoordString = `${colLetters[tempCO.colIndex]}${tempCO.rowIndex + 1}`;
            if (!completedCards.includes(newCoordString)) {
                break;
            }
        }
        console.log("Generated coordinate:", `${colLetters[tempCO.colIndex]}${tempCO.rowIndex + 1}`);
        setRandomCO(tempCO);
    }

    // Handler for clue cell content updates
    const handleClueCellEdit = (newContent: string) => {
        setClueCellContent(newContent);
    };

    // Update URL when state changes
    useEffect(() => {
        const state = {
            image_numbers: image_numbers,
            randomCO,
            clueCellContent,
            frontCellContent: frontCellContentState,
            completedCards
        };
        setSearchParams({ state: encodeState(state) });
    }, [image_numbers, randomCO, frontCellContentState, completedCards, clueCellContent]);

    // Add state to track the currently flipped card
    const [flippedCardState, setFlippedCardState] = useState<{ rowIndex: number, colIndex: number } | null>(null);

    const changeflippedCardState = (coOrdinate: { rowIndex: number, colIndex: number } | null) => {
        setFlippedCardState(coOrdinate);
    }

    const resetFlippedCardState = () => {
        console.log("resetFlippedCardState", flippedCardState)
        setFlippedCardState(null);
    }
    // Handler for card flips
    const handleCardFlip = (rowIndex: number, colIndex: number, clueCell: boolean) => {
        console.log("rowIndex", rowIndex)
        console.log("colIndex", colIndex)
        if (clueCellContent === "?" && !clueCell) {
            alert("Your partner needs to give a clue first!");
        } else if (rowIndex === flippedCardState?.rowIndex && colIndex === flippedCardState?.colIndex) {
            // setFlippedCardState(null);
            // console.log("setting flippedCardState to null", flippedCardState)
        } else {
            setFlippedCardState({ rowIndex, colIndex });
            console.log("frontCellContentState", frontCellContentState)
            console.log("randomCO", randomCO)

            if (rowIndex === 100 && colIndex === 100) {
                console.log("Setting viewingClue to true");
                setViewingClue(true);
            } else {
                console.log("Setting viewingClue to false");
                setViewingClue(false);
            }

            if (rowIndex === randomCO?.rowIndex && colIndex === randomCO?.colIndex) {
                // Correct card chosen
                setTimeout(() => {
                    console.log("User flipped the correct card")
                    setFlippedCardState(null);
                    setClueCellContent("?");
                    setCompletedCards(prevCompletedCards => [...prevCompletedCards, `${colLetters[colIndex]}${rowIndex + 1}`]);
                    setViewingClue(false);
                }, 1000);

                setTimeout(() => {
                    setFrontCellContentState(prevFrontCellContent => {
                        const newFrontCellContent = [...prevFrontCellContent];
                        newFrontCellContent[rowIndex][colIndex] = clueCellContent;
                        return newFrontCellContent;
                    });
                    regenerateRandomCO();
                }, 100);
            }
        };
    }

    useEffect(() => {
        console.log("viewingClue changed to:", viewingClue)
    }, [viewingClue])

    const isViewingClue = (boolean: boolean) => {
        console.log("isViewingClue called with:", boolean);
        setViewingClue(boolean);
    }

    return (
        <div className="flex flex-col flex-start space-y-0 py-10">
            <div className="h-[90vh] overflow-y-auto">
            {
                gridView ?
                    rowHeaders.length &&
                    <CCGrid
                        rowHeaders={rowHeaders}
                        colHeaders={colHeaders}
                        cellSize="size-[calc(100vw/6)] max-w-[110px] max-h-[110px]"
                        randomCO={randomCO}
                        numRows={numRows}
                        numCols={numCols}
                        frontCellContent={frontCellContentState}
                        handleCardFlip={handleCardFlip}
                        clueCellContent={clueCellContent}
                        handleClueCellEdit={handleClueCellEdit}
                        flippedCard={flippedCardState}
                        resetFlippedCardState={resetFlippedCardState}
                        completedCards={completedCards}
                        setViewingClue={isViewingClue} 
                        viewingClue={viewingClue}
                    /> :
                    <CCRows
                        rowHeaders={rowHeaders}
                        colHeaders={colHeaders}
                        cellSize="size-[150px]"
                    />
            }
            </div>
            <div className="relative flex flex-row justify-end items-end">
                {/*<button*/}
                {/*    onClick={() => {*/}
                {/*        setRowSlice(rowSlice + 10)*/}
                {/*        setColSlice(colSlice + 10)*/}
                {/*    }}*/}
                {/*    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"*/}
                {/*>*/}
                {/*    Regenerate Headers*/}
                {/*</button>*/}
                <button
                    onClick={() => {
                        setGridView(!gridView);
                    }}
                    className=" size-10 p-2 text-black rounded"
                > {
                        gridView ?
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}
                                stroke="currentColor" className="size-full">
                                <path strokeLinecap="round" strokeLinejoin="round"
                                    d="M9 9V4.5M9 9H4.5M9 9 3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5 5.25 5.25" />
                            </svg> :
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}
                                stroke="currentColor" className="size-full">
                                <path strokeLinecap="round" strokeLinejoin="round"
                                    d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                            </svg>
                    }

                </button>
            </div>
        </div>
    );
};

export default RandomImageGridWrapper;
