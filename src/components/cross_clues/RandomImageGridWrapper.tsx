import React, {useEffect, useState} from 'react';
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
    const [randomCO, setRandomCO] = useState<string | null>(null);

    const numRows = 5;
    const numCols = 5;

    const colLetters = Array.from({length: numCols}, (_, i) =>
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
                <img key={`row-${i}`} src={src} alt={`row-${i}`} className="w-full h-full object-contain"/>
            ))
        );

        setColHeaders(
            colPaths.map((src, i) => (
                <img key={`col-${i}`} src={src} alt={`col-${i}`} className="w-full h-full object-contain"/>
            ))
        );

    };

    useEffect(() => {
        const temp_list = []
        for (let i = 1; i < 50; i++) {
            temp_list.push(`${rootPath}image_${i}.png`);
            // console.log(`${rootPath}${i}`);
        }
        setAllImagePaths(temp_list)
        setRandomCO(prevCO => prevCO === null ? `${colLetters[Math.floor(Math.random() * numCols)]}${Math.round(Math.random() * numRows)}` : prevCO);


    }, []);

    // Generate headers only after images are loaded
    useEffect(() => {
        regenerateImages();
        
    }, [allImagePaths, rowSlice, colSlice]);

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
                                  d="M9 9V4.5M9 9H4.5M9 9 3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5 5.25 5.25"/>
                        </svg> :
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}
                             stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round"
                                  d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"/>
                        </svg>
                }

                </button>
            </div>
        </div>
    );
};

export default RandomImageGridWrapper;
