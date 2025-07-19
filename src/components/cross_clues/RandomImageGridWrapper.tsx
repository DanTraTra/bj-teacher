import React, { useEffect, useState, useRef } from 'react';
import supabase from '../../services/supabaseClient'; // Adjust path as needed
import { useParams, useNavigate } from 'react-router-dom';
import GameIdModal from './GameIdModal';
import CCGrid from './CCGrid'; // Adjust the import path based on your structure
import CCRows from './CCRows'; // Adjust the import path based on your structure
import { generateSlug } from "random-word-slugs";
import { createClient } from '@supabase/supabase-js';

const rootPath = 'images/'


const getRandomImages = (imagePaths: string[], count: number): React.JSX.Element[] => {
    const shuffled = [...imagePaths].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count).map((src, i) => (
        <img key={i} src={src} alt={`${src}`} className="w-full h-full object-contain" />
        // <img key={i} src={src} alt={`header-${i}`} className="w-full h-full object-contain" />
    ));

};
const testGrid = [[1, 2, 3], [1, 23, 4], [2, 412, 2]]
const testArray = [1, 2, 3, 1, 23, 4, 2, 412, 2]
const testArray1 = ['A1', 'B1', 'sadk', 'D1', 'jjejej', 'A2', 'B2', 'sadk', 'D2', 'jjejej']
// TODO Fix the randomCO changing for deployed app

function OneDim2TwoDim<T>(OneDimArray: any[], columns: number): T[][] {
    if (columns <= 0) throw new Error("number od columns must be greater than 0");
    const result: T[][] = [];
    for (let i = 0; i < OneDimArray.length; i += columns) {
        result.push(OneDimArray.slice(i, i + columns))
    }

    return result;
}

function TwoDim2OneDim<T>(TwoDimArray: T[][]): T[] {
    return TwoDimArray.flat();
}

function convertFrontCellContentStateToBool<T>(FCCST: string[] | string[][], columns: number): boolean[][] {
    // Flatten if it's a 2D array
    let flat: string[];
    if (Array.isArray(FCCST[0])) {
        flat = (FCCST as string[][]).flat();
    } else {
        flat = FCCST as string[];
    }
    const result = flat.map(co => typeof co === 'string' && co.match(`[A-${String.fromCharCode(65 + columns - 1)}][1-${columns}]`) ? false : true);
    return OneDim2TwoDim(result, columns);
}


// console.log('testFunc', OneDim2TwoDim(testArray, 3))
// console.log('convertFrontCellContentStateToBool', convertFrontCellContentStateToBool(testArray1, 3))


// --- Supabase integration variables ---
const GAME_TABLE = 'Hyperlink'; // Your table name
// GAME_ID is now sourced from the route param

const RandomImageGridWrapper: React.FC = () => {
    // Get game id from route: /image_link/:id
    const { id: GAME_ID } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(!GAME_ID);
    const [creating, setCreating] = useState(false);

    const numRows = 5;
    const numCols = 5;

    const [playerTurn, setPlayerTurn] = useState<'One' | 'Two'>('One')
    const [playerAction, setPlayerAction] = useState<'View Card & Give Clue' | 'guess the card'>('View Card & Give Clue')

    const [viewingClue, setViewingClue] = useState<boolean>(false);
    const [gridView, setGridView] = useState<boolean>(true)
    const [rowHeaders, setRowHeaders] = useState<React.JSX.Element[]>([]);
    const [colHeaders, setColHeaders] = useState<React.JSX.Element[]>([]);
    const [bigImage, setBigImage] = useState<React.ReactNode | null>(null);
    const [bigCO, setBigCO] = useState<string>('');
    const [currentBigImageIndex, setCurrentBigImageIndex] = useState<number | null>(null); // New state for tracking current big image index
    const [allHeaderImages, setAllHeaderImages] = useState<{ element: React.JSX.Element, co: string }[]>([]); // Store all headers with CO

    const [image_numbers, setImageNumbers] = useState<number[]>([]);
    const [randomCO, setRandomCO] = useState<{ rowIndex: number, colIndex: number } | null>(null);
    const [frontCellContentState, setFrontCellContentState] = useState<string[][]>([]);
    const [correctlyGuessedGrid, setCorrectlyGuessedGrid] = useState<boolean[][]>(Array.from({ length: numCols }, () =>
        Array(numCols).fill(false)
    ));
    const [completedCards, setCompletedCards] = useState<string[]>([]);
    const [incorrectGuessCountP1, setIncorrectGuessCountP1] = useState<number[]>([]);
    const [incorrectGuessCountP2, setIncorrectGuessCountP2] = useState<number[]>([]);
    const [incorrectGuesses, setIncorrectGuesses] = useState<number>(0)
    const [clueCellContent, setClueCellContent] = useState<string>("?");
    const [editValue, setEditValue] = useState<string>("?");
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [buttonState, setButtonState] = useState<'view' | 'give' | 'input' | null>('view');
    const [playerColours, setPlayerColours] = useState<{ player1: string, player2: string }>({ player1: '#F2F6A9', player2: '#D5D1E9' })
    const [playerNames, setPlayerNames] = useState<{ One: string | null, Two: string | null }>({ One: null, Two: null })

    const player1Color = '#E38B83'
    const player2Color = '#9893AC'

    interface StateType {
        image_numbers: number[];
        randomCO: { rowIndex: number, colIndex: number } | null;
        clueCellContent: string;
        frontCellContent: string[];
        completedCards: string[];
        incorrectGuessCountP1: number[];
        incorrectGuessCountP2: number[];
        playerNames: { One: string | null; Two: string | null };
    }

    const handleJoin = async (gameId: string) => {
        if (gameId.trim()) {
            // Fetch game state from Supabase
            const { data, error } = await supabase
                .from(GAME_TABLE)
                .select('state')
                .eq('id', gameId.trim())
                .single();
            if (error || !data || !data.state) {
                alert('Could not find game with that ID.');
                return;
            }
            const s = data.state;
            setImageNumbers(s.image_numbers || []);
            setRandomCO(s.randomCO || null);
            setFrontCellContentState(OneDim2TwoDim(s.frontCellContent || [], numCols));
            setCompletedCards(s.completedCards || []);
            setClueCellContent(s.clueCellContent || '?');
            setCorrectlyGuessedGrid(convertFrontCellContentStateToBool(s.frontCellContent || [], numCols));
            setIncorrectGuessCountP1(s.incorrectGuessCountP1 || [0]);
            setIncorrectGuessCountP2(s.incorrectGuessCountP2 || [0]);
            setPlayerNames(s.playerNames || { One: null, Two: null });
            updateGameState();
            // Now navigate to the game page
            navigate(`/image_link/${gameId.trim()}`);
        }
    };

    const handleCreate = async () => {
        setCreating(true);

        // Only generate new random numbers if there's no URL state
        const randomNumbers: number[] = [];
        for (let i = 0; i < 10; i++) {
            let num;
            do {
                num = Math.floor(Math.random() * 1000) + 1;
            } while (randomNumbers.includes(num));
            randomNumbers.push(num);
        }
        // setImageNumbers(randomNumbers);

        // Initialize randomCO and frontCellContentState for new games
        console.log("setRandomCO(Random1)");
        const random = { rowIndex: Math.floor(Math.random() * numRows), colIndex: Math.floor(Math.random() * numCols) }
        setRandomCO(random);
        const frontCellContent2D = Array.from({ length: numRows }, (_, rowIndex) =>
            Array.from({ length: numCols }, (_, colIndex) =>
                `${String.fromCharCode(65 + colIndex)}${rowIndex + 1}`
            )
        );  
        const frontCellContent = frontCellContent2D.flat(); // 1D array for backend

        // setFrontCellContentState(frontCellContent);

        const boolGrid = Array.from({ length: numRows }, (_, rowIndex) =>
            Array.from({ length: numCols }, (_, colIndex) =>
                false
            )
        )
        // setCorrectlyGuessedGrid(boolGrid);

        const p1 = prompt('Enter your name')
        const p2 = prompt('Enter your partners name')

        const game_code = generateSlug(2)
        console.log("game_code", game_code)

        // Create new game in Supabase
        const { data, error } = await supabase
            .from('Hyperlink')
            .insert([{
                state: {
                    image_numbers: randomNumbers,
                    randomCO: random,
                    clueCellContent: '?',
                    frontCellContent: frontCellContent,
                    completedCards: [],
                    incorrectGuessCountP1: [],
                    incorrectGuessCountP2: [],
                    playerNames: { One: p1, Two: p2 },
                },
                game_code: game_code
            }])
            .select('id')
            .single();
        setCreating(false);

        if (data && data.id) {
            navigate(`/image_link/${data.id}`);
        } else {
            alert('Failed to create game. Please try again.');
        }
    };

    const colLetters = Array.from({ length: numCols }, (_, i) =>
        String.fromCharCode(65 + i)
    );

    // Render modal if no GAME_ID
    const shouldShowModal = !GAME_ID;



    const regenerateImages = () => {
        if (image_numbers.length !== 10) {
            // console.log("No image numbers available yet");
            return;
        }

        // console.log("Regenerating images with numbers:", image_numbers);
        const rowPaths = image_numbers.slice(0, 5).map(num => `/${rootPath}image_${num}.png`);
        const colPaths = image_numbers.slice(5, 10).map(num => `/${rootPath}image_${num}.png`);

        // console.log("correctlyGuessedGrid", correctlyGuessedGrid)

        const generatedRowHeaders = rowPaths.map((src, i) => (
            <img key={`row-${i}`} src={src} alt={`row-${i}`} className={`w-full h-full object-contain ${correctlyGuessedGrid[i].every(card => card) ? '' : 'grayscale'}`} />
        ));
        setRowHeaders(generatedRowHeaders);


        const generatedColHeaders = colPaths.map((src, i) => (
            <img key={`col-${i}`} src={src} alt={`col-${i}`} className={`w-full h-full object-contain ${correctlyGuessedGrid.every(col => col[i]) ? '' : 'grayscale'}`} />
        ));
        setColHeaders(generatedColHeaders);

        // Combine headers and their CO for easier traversal
        const combinedHeaders = [
            ...generatedRowHeaders.map((el, i) => ({ element: el, co: `${i + 1}` })), // Assign a simple CO for rows
            ...generatedColHeaders.map((el, i) => ({ element: el, co: `${String.fromCharCode(65 + i)}` })) // Assign a simple CO for cols
        ];
        setAllHeaderImages(combinedHeaders);
    };

    // Generate headers when image numbers are available or correctlyGuessedGrid changes
    useEffect(() => {
        if (image_numbers.length === 10) {
            regenerateImages();
        }
    }, [image_numbers, correctlyGuessedGrid]); // Added correctlyGuessedGrid as dependency

    const regenerateRandomCO = () => {
        let tempCO = {
            rowIndex: Math.floor(Math.random() * numRows),
            colIndex: Math.floor(Math.random() * numCols)
        };
        // console.log("completedCards", completedCards);

        // Convert to coordinate string (e.g., "A1", "B2", etc.)
        // Check against correctlyGuessedGrid instead of completedCards
        // const coordString = `${colLetters[tempCO.colIndex]}${tempCO.rowIndex + 1}`;
        // Check if all cells are completed
        // console.log("correctlyGuessedGrid", correctlyGuessedGrid)

        const allCompleted = correctlyGuessedGrid.every(row => row.every(cell => cell === true)) && correctlyGuessedGrid.length;

        if (!allCompleted) {
            while (correctlyGuessedGrid[tempCO.rowIndex][tempCO.colIndex]) { // Check correctlyGuessedGrid
                tempCO = {
                    rowIndex: Math.floor(Math.random() * numRows),
                    colIndex: Math.floor(Math.random() * numCols)
                };
                // const newCoordString = `${colLetters[tempCO.colIndex]}${tempCO.rowIndex + 1}`;
                if (!correctlyGuessedGrid[tempCO.rowIndex][tempCO.colIndex]) { // Check correctlyGuessedGrid
                    break;
                }
            }
        } else {
            // Handle case where all cards are completed (e.g., game over)
            console.log("All cards completed. Cannot regenerate random CO.");
            setRandomCO({ rowIndex: 100, colIndex: 100 }); // Or handle game over state appropriately
            updateGameState();
            return; // Exit the function if all completed
        }
        console.log("setRandomCO(tempCO):", `${colLetters[tempCO.colIndex]}${tempCO.rowIndex + 1}`);
        setRandomCO(tempCO);
        updateGameState();
    }

    // Handler for clue cell content updates
    const handleClueCellEdit = (newContent: string) => {
        setClueCellContent(newContent);
    };

    // --- Supabase: Load and subscribe to game state ---
    const initialLoad = useRef(false);
    useEffect(() => {
        if (!GAME_ID) {
            handleCreate();
            return;
        }
        // Define the expected state type for Supabase

        const fetchGameState = async () => {
            const { data, error } = await supabase
                .from(GAME_TABLE)
                .select('state')
                .eq('id', GAME_ID)
                .single<any>(); // Use any for runtime guard
            if (
                data &&
                typeof data === 'object' &&
                Object.keys(data).length > 0 &&
                'state' in data &&
                data.state
            ) {
                console.log("data.state", data.state)
                const s = data.state as StateType;
                setImageNumbers(s.image_numbers);
                setRandomCO(s.randomCO);
                setFrontCellContentState(OneDim2TwoDim(s.frontCellContent, numCols));
                
                setCompletedCards(s.completedCards);
                setClueCellContent(s.clueCellContent);
                setCorrectlyGuessedGrid(convertFrontCellContentStateToBool(s.frontCellContent, numCols));
                setIncorrectGuessCountP1(s.incorrectGuessCountP1);
                setIncorrectGuessCountP2(s.incorrectGuessCountP2);
                setPlayerNames(s.playerNames);
            }
            initialLoad.current = true;
        };
        fetchGameState();

        // Real-time subscription
        const channel = supabase
            .channel('realtime:game_' + GAME_ID)
            .on('postgres_changes', { event: '*', schema: 'public', table: GAME_TABLE, filter: `id=eq.${GAME_ID}` }, payload => {
                if (
                    payload.new &&
                    typeof payload.new === 'object' &&
                    Object.keys(payload.new).length > 0 &&
                    'state' in payload.new &&
                    payload.new.state
                ) {
                    const s = payload.new.state as StateType;
                    setImageNumbers(s.image_numbers);
                    setRandomCO(s.randomCO);
                    setFrontCellContentState(OneDim2TwoDim(s.frontCellContent, numCols) );
                    setCompletedCards(s.completedCards);
                    setClueCellContent(s.clueCellContent ?? '?');
                    setCorrectlyGuessedGrid(convertFrontCellContentStateToBool(s.frontCellContent, numCols));
                    setIncorrectGuessCountP1(s.incorrectGuessCountP1);
                    setIncorrectGuessCountP2(s.incorrectGuessCountP2);
                    setPlayerNames(s.playerNames);
                }
            })
            .subscribe();
        return () => {
            supabase.removeChannel(channel);
        };
    }, [GAME_ID]);

    const updateGameState = async () => {
        const state = {
            image_numbers,
            randomCO,
            clueCellContent,
            frontCellContent: TwoDim2OneDim(frontCellContentState),
            completedCards,
            incorrectGuessCountP1,
            incorrectGuessCountP2,
            playerNames,
        };
        console.log("updateGameState", state);
        await supabase.from(GAME_TABLE).update({ state }).eq('id', GAME_ID);
    };

    // --- Supabase: Push state changes ---
    // useEffect(() => {
    //     if (!initialLoad.current) return;
    //     const updateGameState = async () => {
    //         const state = {
    //             image_numbers,
    //             randomCO,
    //             clueCellContent,
    //             frontCellContent: TwoDim2OneDim(frontCellContentState),
    //             completedCards,
    //             incorrectGuessCountP1,
    //             incorrectGuessCountP2,
    //             playerNames,
    //         };
    //         console.log("updateGameState", state);
    //         await supabase.from(GAME_TABLE).update({ state }).eq('id', GAME_ID);
    //     };
    //     updateGameState();
    // }, [image_numbers, randomCO, frontCellContentState, completedCards, clueCellContent, correctlyGuessedGrid, incorrectGuessCountP1, incorrectGuessCountP2, playerNames]);


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
        // console.log("rowIndex", rowIndex)
        // console.log("colIndex", colIndex)
        if (clueCellContent === "?" && !clueCell) {
            alert(`${playerNames[playerTurn]} needs to give a clue first! Press View Card button`);
        } else if (rowIndex === flippedCardState?.rowIndex && colIndex === flippedCardState?.colIndex) {
            // setFlippedCardState(null);
            // console.log("setting flippedCardState to null", flippedCardState)
        } else {
            // setFlippedCardState({ rowIndex, colIndex });
            // console.log("frontCellContentState", frontCellContentState)
            // console.log("randomCO", randomCO)

            if (rowIndex === 100 && colIndex === 100) {
                console.log("Setting viewingClue to true");
                setViewingClue(true);
                setIsEditing(true);
            } else {
                setFlippedCardState({ rowIndex, colIndex });
                console.log("Setting viewingClue to false");
                setViewingClue(false);
                setIsEditing(false);
            }

            if (rowIndex === randomCO?.rowIndex && colIndex === randomCO?.colIndex) {
                // Correct card chosen
                setClueCellContent("?");
                setEditValue("?");
                updateGameState();
                setPlayerAction("View Card & Give Clue")

                setCorrectlyGuessedGrid(prevCorrectlyGuessedGrid => {
                    const newCorrectlyGuessedGrid = [...prevCorrectlyGuessedGrid];
                    newCorrectlyGuessedGrid[rowIndex][colIndex] = true;
                    return newCorrectlyGuessedGrid;
                });
                setCompletedCards(prevCompletedCards => [...prevCompletedCards, `${colLetters[colIndex]}${rowIndex + 1}`]); // completedCards still updated here

                playerTurn == 'One' ? setIncorrectGuessCountP1(current => [...current, incorrectGuesses]) : setIncorrectGuessCountP2(current => [...current, incorrectGuesses]) // incorrect guess counts still arrays
                setIncorrectGuesses(0)

                setTimeout(() => {
                    console.log("User flipped the correct card")
                    setFlippedCardState(null);
                    setViewingClue(false);


                }, 1000);


                setTimeout(() => {
                    setFrontCellContentState(prevFrontCellContent => {
                        const newFrontCellContent = [...prevFrontCellContent];
                        newFrontCellContent[rowIndex][colIndex] = clueCellContent;
                        return newFrontCellContent;
                    });
                    regenerateRandomCO();
                }, 1500);

            } else if (!clueCell) {
                setIncorrectGuesses(current => current + 1)
            }
        };
    }

    useEffect(() => {
        if (clueCellContent !== "?") {
            setButtonState(null);
            setPlayerAction('guess the card');
            // Player turn changes when clue is given, for the guessing phase
            if (playerTurn === 'One') {
                setPlayerTurn('Two');
            } else {
                setPlayerTurn('One');
            }
        } else {
            setButtonState("view")
        }
    }, [clueCellContent])

    // useEffect(() => {
    //     // setPlayerTurn(current => current=='One' ? 'Two' : 'One')
    // }, [clueCellContent])

    const isViewingClue = (boolean: boolean) => {
        console.log("isViewingClue called with:", boolean);
        setViewingClue(boolean);
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEditValue(e.target.value);
        updateGameState();
    };

    const handleViewCard = () => {
        if (clueCellContent === "?") {
            handleCardFlip(100, 100, true);
            setButtonState('give');
        }
    };

    const handleGiveClue = () => {
        setButtonState('input');
        setViewingClue(false);
        setIsEditing(false);
        setFlippedCardState(null);
        updateGameState();
    };

    const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            if (editValue.split(' ').length >= 2) {
                alert('Please enter a single word');
            }
            else if (editValue !== '') {
                handleClueCellEdit(editValue);
                setEditValue('?');
                updateGameState();
                setButtonState('view');
                setFlippedCardState(null);
                setBigImage(null);
                setPlayerAction('guess the card'); // Player action changes after clue is given
                // Player turn change is now in useEffect based on clueCellContent
            }
        }
    };

    const handleInputBlur = () => {
        if (editValue.split(' ').length >= 2) {
            alert('Please enter a single word');
        }
        else if (editValue !== '') {
            handleClueCellEdit(editValue);
            setEditValue('?');
            updateGameState();
            setButtonState('view');
            setFlippedCardState(null);
            // Player turn change is now in useEffect based on clueCellContent
        }

    };

    const handleInputFocus = () => {
        setButtonState('input')
    }

    const handleHeaderClick = (header: React.ReactNode, CO: string) => {
        setBigImage(header);
        setBigCO(CO);
        // Find the index of the clicked header in the combined list
        const index = allHeaderImages.findIndex(item => item.element === header);
        setCurrentBigImageIndex(index);
    }

    const handlePrevImage = () => {
        if (currentBigImageIndex !== null && allHeaderImages.length > 0) {
            const prevIndex = (currentBigImageIndex - 1 + allHeaderImages.length) % allHeaderImages.length;
            const prevImage = allHeaderImages[prevIndex];
            setBigImage(prevImage.element);
            setBigCO(prevImage.co);
            setCurrentBigImageIndex(prevIndex);
        }
    };

    const handleNextImage = () => {
        if (currentBigImageIndex !== null && allHeaderImages.length > 0) {
            const nextIndex = (currentBigImageIndex + 1) % allHeaderImages.length;
            const nextImage = allHeaderImages[nextIndex];
            setBigImage(nextImage.element);
            setBigCO(nextImage.co);
            setCurrentBigImageIndex(nextIndex);
        }
    };


    const buttonClasses = "text-sm h-8 px-3 py-1 bg-blue-500 text-white rounded-none bg-gray-500"

    return (
        <div className='flex flex-col h-full justify-center items-center pb-4'>
            <div className="relative flex flex-col flex-start max-h-[50vh]" onClick={() => {
                setBigImage(null);
                setBigCO('');
                setCurrentBigImageIndex(null); // Reset index when image is closed
            }}> {/* Added relative positioning here and reset state on click */}
                {bigImage} {/* This will render first and be the base layer */}
                {bigCO && ( // Only render bigCO if it's not an empty string
                    <div className='absolute -bottom-8 left-0 text-[100px] p-4 text-black tracking-wide font-bold z-10 opacity-80'>
                        {/* Added absolute positioning, bottom/left, padding, text color, and z-index */}
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
                            className="absolute h-full w-12 text-center -left-12 top-1/2 transform -translate-y-1/2 bg-none bg-opacity-50 text-black p-2 z-20"
                        >
                            &#9664; {/* Left arrow character */}
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation(); // Prevent the parent div's onClick from firing
                                handleNextImage();
                            }}
                            className="absolute h-full w-12 text-center -right-12 top-1/2 transform -translate-y-1/2 bg-none bg-opacity-50 text-black p-2 z-20"
                        >
                            &#9654; {/* Right arrow character */}
                        </button>
                    </>
                )}
            </div>
            {/* <div className='flex flex-col items-center justify-start pt-5'>
                <span className='text-xs text-gray-400'>
                    Your Clue
                </span>
                <span className='text-2xl text-gray-800'>
                    {clueCellContent}
                </span>
            </div> */}
            <div className="flex flex-row justify-center py-2">
                <span className='text-sm text-gray-800'>{playerNames[playerTurn]}'s turn to {playerAction}</span>
            </div>
            {clueCellContent != '?' && <div className='flex flex-col items-center justify-start'>
                {/* <span className='text-xs text-gray-400'>
                    Your Clue
                </span> */}
                <span className='text-2xl text-gray-800'>
                    {clueCellContent}
                </span>
            </div>}
            <div className="flex flex-col flex-start items-center space-y-1 pt-1 pb-3 overflow-y-auto w-fit">
                <div className="h-full overflow-y-auto">
                    {
                        gridView ?
                            rowHeaders.length &&
                            <CCGrid
                                rowHeaders={rowHeaders}
                                colHeaders={colHeaders}
                                cellSize="size-[calc(100vw/6)] max-w-[90px] max-h-[90px]"
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
                                correctlyGuessedGrid={correctlyGuessedGrid}
                                handleHeaderClick={handleHeaderClick}
                            /> :
                            <CCRows
                                rowHeaders={rowHeaders}
                                colHeaders={colHeaders}
                                cellSize="size-[150px]"
                            />
                    }
                </div>
                <div className={`flex flex-row justify-start pb-1 w-full`}>
                    {Array.from({ length: incorrectGuesses }).map((_, idx) => (
                        <div key={idx} className='h-1.5 w-full my-0.5 mx-1 bg-red-300'></div>))}
                </div>
                <div className='w-full px-1'>
                    <table className="w-full">
                        <tbody>
                            {([
                                { player: "One", data: incorrectGuessCountP1, bg: "bg-playerOne", rounded: "rounded-t" },
                                { player: "Two", data: incorrectGuessCountP2, bg: "bg-playerTwo", rounded: "rounded-b" }
                            ] as const)
                                .map(({ player, data, bg, rounded }) => (

                                    <tr key={player} className={`${bg} ${rounded}`}>
                                        <td className="text-xs text-gray-500 font-bold whitespace-nowrap p-1.5 pl-3 align-center text-right">
                                            {playerNames[player]}:
                                        </td>
                                        <td className="w-full py-1.5">
                                            <div className="flex flex-row flex-nowrap items-center space-x-1">
                                                {data.map((count, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="flex justify-center items-center font-bold text-xs text-wrong size-4 rounded-full"
                                                    >
                                                        {count}
                                                    </div>
                                                ))}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
                <div className="w-full relative flex flex-row justify-end items-center space-x-2 pt-2 px-1">
                    <div className="flex items-center space-x-2">
                        {(buttonState == 'view' || buttonState == 'input') && (
                            <button
                                onClick={handleViewCard}
                                className={buttonClasses}
                            >
                                View Card
                            </button>
                        )}
                        {buttonState == 'give' && (
                            <button
                                onClick={handleGiveClue}
                                className={buttonClasses}
                            >
                                Give Clue
                            </button>
                        )}
                        {buttonState === 'input' && (
                            <input
                                type="text"
                                value={editValue === '?' ? '' : editValue}
                                placeholder="Give a clue for your partner"
                                onChange={handleInputChange}
                                onKeyDown={handleInputKeyDown}
                                onBlur={handleInputBlur}
                                onFocus={handleInputFocus}
                                className="w-52 text-center text-sm px-2 py-1 placeholder:text-gray-300
                            focus:outline-none focus:ring-0 focus:border-gray-500 border-b-2 border-gray-500
                            bg-transparent border-t-0 border-l-0 border-r-0 h-8"
                                autoFocus
                            />
                        )}
                    </div>

                    {/* <button
                        onClick={() => {
                            setGridView(!gridView);
                        }}
                        className="size-10 p-2 text-black rounded"
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
                    </button> */}
                </div>
            </div>
        </div>
    );
};

export default RandomImageGridWrapper;
