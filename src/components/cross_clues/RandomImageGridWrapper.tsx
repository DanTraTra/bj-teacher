import React, { useEffect, useState } from 'react';
import CCGrid from './CCGrid'; // Adjust the import path based on your structure
import CCRows from './CCRows'; // Adjust the import path based on your structure

const rootPath = 'images/'

// Adjust this to reflect actual image filenames in your public/images directory


// const getRandomImages = (imagePaths: string[], count: number): React.JSX.Element[] => {
//     const shuffled = [...imagePaths].sort(() => 0.5 - Math.random());
//     return shuffled.slice(0, count).map((src, i) => (
//         <img key={i} src={src} alt={`${src}`} className="w-full h-full object-contain"/>
//         // <img key={i} src={src} alt={`header-${i}`} className="w-full h-full object-contain" />
//     ));
//
// };

const RandomImageGridWrapper: React.FC = () => {

    const [inspectView, setInspectView] = useState<boolean>(false);
    const [gridView, setGridView] = useState<boolean>(true)
    const [allImagePaths, setAllImagePaths] = useState<string[]>([]);
    const [rowHeaders, setRowHeaders] = useState<React.JSX.Element[]>([]);
    const [colHeaders, setColHeaders] = useState<React.JSX.Element[]>([]);
    const [rowSlice, setRowSlice] = useState<number>(0);
    const [colSlice, setColSlice] = useState<number>(5);
    const [randomCO, setRandomCO] = useState<{ rowIndex: number, colIndex: number } | null>(null);
    const [frontCellContentState, setFrontCellContentState] = useState<string[][]>([]);
    const [completedCards, setCompletedCards] = useState<string[]>([]);

    const numRows = 5;
    const numCols = 5;

    const colLetters = Array.from({ length: numCols }, (_, i) =>
        String.fromCharCode(65 + i)
    );

    const regenerateImages = () => {
        const shuffled = [...allImagePaths].sort(() => 0.5 - Math.random());

        const rowPaths = shuffled.slice(rowSlice, rowSlice + 5);
        const colPaths = shuffled.slice(colSlice, colSlice + 5);
        console.log("colpaths", colPaths)
        console.log("rowPaths", rowPaths)

        setRowHeaders(
            rowPaths.map((src, i) => (
                <img key={`row-${i}`} src={src} alt={`row-${i}`} className="w-full h-full object-contain" />
            ))
        );

        setColHeaders(
            colPaths.map((src, i) => (
                <img key={`col-${i}`} src={src} alt={`col-${i}`} className="w-full h-full object-contain" />
            ))
        );

    };

    const regenerateRandomCO = () => {
        let tempCO = { rowIndex: Math.floor(Math.random() * numRows), colIndex: Math.floor(Math.random() * numCols) }
        console.log("completedCards", completedCards)
        while (completedCards.includes(`${colLetters[tempCO.rowIndex]}${tempCO.colIndex + 1}`)) {
            tempCO = { rowIndex: Math.floor(Math.random() * numRows), colIndex: Math.floor(Math.random() * numCols) }
        }
        setRandomCO(tempCO);
    }

    // Add state for the clue cell content
    const [clueCellContent, setClueCellContent] = useState("?");

    // Handler for clue cell content updates
    const handleClueCellEdit = (newContent: string) => {
        setClueCellContent(newContent);
    };

    useEffect(() => {
        const temp_list = []
        for (let i = 1; i < 50; i++) {
            temp_list.push(`${rootPath}image_${i}.png`);
            // console.log(`${rootPath}${i}`);
        }
        setAllImagePaths(temp_list)
        setRandomCO(prevCO => prevCO === null ? { rowIndex: Math.floor(Math.random() * numRows), colIndex: Math.floor(Math.random() * numCols) } : prevCO);

        const frontCellContent = Array.from({ length: numRows }, (_, rowIndex) =>
            Array.from({ length: numCols }, (_, colIndex) =>
                `${String.fromCharCode(65 + colIndex)}${rowIndex + 1}`
            )
        );
        setFrontCellContentState(frontCellContent);


    }, []);

    // Generate headers only after images are loaded
    useEffect(() => {
        regenerateImages();

    }, [allImagePaths, rowSlice, colSlice]);


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
            setFlippedCardState(null);
            console.log("setting flippedCardState to null", flippedCardState)
        } else {
            setFlippedCardState({ rowIndex, colIndex });
            console.log("frontCellContentState", frontCellContentState)
            console.log("randomCO", randomCO)


            if (rowIndex === randomCO?.rowIndex && colIndex === randomCO?.colIndex) {
                // Correct card chosen
                setTimeout(() => {
                    console.log("User flipped the correct card")
                    setFlippedCardState(null);
                    setClueCellContent("?");
                    setCompletedCards(prevCompletedCards => [...prevCompletedCards, `${colLetters[colIndex]}${rowIndex + 1}`]);

                }, 1000);

                setTimeout(() => {

                    setFrontCellContentState(prevFrontCellContent => {
                        const newFrontCellContent = [...prevFrontCellContent];
                        newFrontCellContent[rowIndex][colIndex] = clueCellContent;
                        return newFrontCellContent;
                    });
                    regenerateRandomCO();

                }, 1300);
            }
        };
    }

    return (
        <div className="flex flex-row space-y-4">
            {
                gridView ?
                    rowHeaders.length &&
                    <CCGrid
                        rowHeaders={rowHeaders}
                        colHeaders={colHeaders}
                        cellSize="size-[120px]"
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
                    /> :
                    <CCRows
                        rowHeaders={rowHeaders}
                        colHeaders={colHeaders}
                        cellSize="size-[150px]"
                    />
            }
            <div className="relative flex flex-row items-end">
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
                    className="size-16 px-4 py-2 text-black rounded"
                > {
                        gridView ?
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}
                                stroke="currentColor" className="size-6">
                                <path strokeLinecap="round" strokeLinejoin="round"
                                    d="M9 9V4.5M9 9H4.5M9 9 3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5 5.25 5.25" />
                            </svg> :
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}
                                stroke="currentColor" className="size-6">
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
