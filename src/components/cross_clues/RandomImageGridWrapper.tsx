import React, { useEffect, useState, useRef } from 'react';
import supabase from '../../services/supabaseClient'; // Adjust path as needed
import { useParams, useNavigate } from 'react-router-dom';
import GameIdModal from './GameIdModal';
import CCGrid from './CCGrid'; // Adjust the import path based on your structure
import CCRows from './CCRows'; // Adjust the import path based on your structure
import { generateSlug } from "random-word-slugs";
import { createClient } from '@supabase/supabase-js';
import ChoosePlayerModal from './ChoosePlayerModal';

const rootPath = 'images/'

export type GridCellCO = { rowIndex: number; colIndex: number };
export type FrontCellContent = { content: string, color: string };

interface StateType {
    imageUrls: string[];
    randomCO: GridCellCO[] //should only be four;
    availiableRandomCo: GridCellCO[];
    clueCellContent: string[];
    frontCellContent: FrontCellContent[];
    completedCards: string[];
    incorrectGuessCount: number;
    playerCount: number;
    playerNames: (string | null)[];
}


// Utility to fetch all image paths from Supabase Storage bucket 'image-link-images'
const fetchSupabaseImagePaths = async (): Promise<string[]> => {

    // List all files in the bucket
    const { data, error } = await supabase.storage.from('image-link-images').list('', { limit: 1000 });
    if (error) {
        console.error('Error listing images from Supabase:', error.message);
        return [];
    }
    // Build public URLs for each image
    return (data?.map(file =>
        supabase.storage.from('image-link-images').getPublicUrl(file.name).data.publicUrl
    ) || []).filter(Boolean);
};

// Fetch 10 random images from Supabase Storage
const fetchRandomSupabaseImages = async (count: number = 10): Promise<string[]> => {
    const allImages = await fetchSupabaseImagePaths();
    const shuffled = allImages.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
};

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

function convertFrontCellContentStateToBool<T>(FCCST: FrontCellContent[] | FrontCellContent[][], columns: number): boolean[][] {
    // Flatten if it's a 2D array
    let flat: FrontCellContent[];
    if (Array.isArray(FCCST[0])) {
        flat = (FCCST as FrontCellContent[][]).flat();
    } else {
        flat = FCCST as FrontCellContent[];
    }
    const result = flat.map(co => co.content.match(`[A-${String.fromCharCode(65 + columns - 1)}][1-${columns}]`) ? false : true);
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

    const [playerOnThisDevice, setPlayerOnThisDevice] = useState<number>(0)
    const [playerAction, setPlayerAction] = useState<'View Card & Give Clue' | 'guess the card'>('View Card & Give Clue')

    const [viewingClue, setViewingClue] = useState<boolean>(false);
    const [gridView, setGridView] = useState<boolean>(true)
    const [rowHeaders, setRowHeaders] = useState<React.JSX.Element[]>([]);
    const [colHeaders, setColHeaders] = useState<React.JSX.Element[]>([]);
    const [bigImage, setBigImage] = useState<React.ReactNode | null>(null);
    const [bigCO, setBigCO] = useState<string>('');
    const [currentBigImageIndex, setCurrentBigImageIndex] = useState<number | null>(null); // New state for tracking current big image index
    const [allHeaderImages, setAllHeaderImages] = useState<{ element: React.JSX.Element, co: string }[]>([]); // Store all headers with CO

    // const [image_numbers, setImageNumbers] = useState<number[]>([]);
    // const [randomCO, setRandomCO] = useState<{ rowIndex: number, colIndex: number } | null>(null);
    // const [frontCellContentState, setFrontCellContentState] = useState<string[][]>([]);
    const [correctlyGuessedGrid, setCorrectlyGuessedGrid] = useState<boolean[][]>(Array.from({ length: numCols }, () =>
        Array(numCols).fill(false)
    ));
    // const [completedCards, setCompletedCards] = useState<string[]>([]);
    const [incorrectGuessCountP1, setIncorrectGuessCountP1] = useState<number[]>([]);
    const [incorrectGuessCountP2, setIncorrectGuessCountP2] = useState<number[]>([]);
    const [incorrectGuesses, setIncorrectGuesses] = useState<number>(0)
    // const [clueCellContent, setClueCellContent] = useState<string>("?");
    const [editValue, setEditValue] = useState<string>("?");
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [buttonState, setButtonState] = useState<'view' | 'give' | 'input' | null>('view');
    const [playerColours, setPlayerColours] = useState<string[]>(['', 'playerOne', 'playerTwo'])

    const [gameState, setGameState] = useState<StateType>({
        imageUrls: [],
        randomCO: [{ rowIndex: -1, colIndex: -1 }], // player one random CO is at index 1, player two is at index 2 etc.
        availiableRandomCo: [],
        clueCellContent: [],
        frontCellContent: [],
        completedCards: [],
        incorrectGuessCount: 0,
        playerCount: 2,
        playerNames: [null, null],
    });

    // State for storing Cloudinary image URLs
    const [supaBaseImages, setsupaBaseImages] = useState<string[]>([]);
    const [isLoadingImages, setIsLoadingImages] = useState<boolean>(false);


    const fetchImages = async () => {
        setIsLoadingImages(true);
        try {
            const images = await fetchRandomSupabaseImages(1000); // Fetch up to 100 images
            setsupaBaseImages(images);
            console.log(`Fetched ${images.length} Supabase images`);
        } catch (error) {
            console.error('Error fetching Supabase images:', error);
        } finally {
            setIsLoadingImages(false);
        }
    };


    const handleJoin = async (gameId: string) => {
        console.log("handleJoin")

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
            // setImageNumbers(s.image_numbers || []);
            // setRandomCO(s.randomCO || null);
            // setFrontCellContentState(OneDim2TwoDim(s.frontCellContent || [], numCols));
            // setCompletedCards(s.completedCards || []);
            // setClueCellContent(s.clueCellContent || '?');
            setCorrectlyGuessedGrid(convertFrontCellContentStateToBool(s.frontCellContent || [], numCols));
            setIncorrectGuessCountP1(s.incorrectGuessCountP1 || [0]);
            setIncorrectGuessCountP2(s.incorrectGuessCountP2 || [0]);

            console.log("joining game, current state:", s)
            setGameState(s)
            // Now navigate to the game page
            navigate(`/image_link/${gameId.trim()}`);
        }
    };

    const handleCreate = async () => {
        console.log("handleCreate")
        setCreating(true);

        const images = await fetchRandomSupabaseImages(10);
        console.log("images", images)
        // setImageNumbers(randomNumbers);

        // Initialize randomCO and frontCellContentState for new games
        console.log("setRandomCO(Random1)");
        const randomCoOrdinates = [{ rowIndex: -1, colIndex: -1 }]
        const allRandomCo = generateAllRandomCO(numRows, numCols)
        const clueCell = ['?']

        for (let p = 1; p <= 2; p++) {
            const randomIndex = Math.floor(Math.random() * allRandomCo.length)
            randomCoOrdinates.push(allRandomCo[randomIndex])
            allRandomCo.splice(randomIndex, 1)
            clueCell.push('?')

        }

        const frontCellContent2D = Array.from({ length: numRows }, (_, rowIndex) =>
            Array.from({ length: numCols }, (_, colIndex) =>
            ({
                content: `${String.fromCharCode(65 + colIndex)}${rowIndex + 1}`,
                color: ''
            })
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

        const newState = {
            imageUrls: images,
            randomCO: randomCoOrdinates,
            availiableRandomCo: allRandomCo,
            clueCellContent: clueCell,
            frontCellContent: frontCellContent,
            completedCards: [],
            incorrectGuessCount: 0,
            playerNames: [null, p1, p2],
            playerCount: 2,
        }


        setGameState(newState)
        console.log("newState", newState)

        // Create new game in Supabase
        const { data, error } = await supabase
            .from('Hyperlink')
            .insert([{
                state: { ...newState },
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

    function generateAllRandomCO(numRows: number, numCols: number): GridCellCO[] {
        // Generate all possible grid pairs
        const allPairs: GridCellCO[] = [];
        for (let rowIndex = 0; rowIndex < numRows; rowIndex++) {
            for (let colIndex = 0; colIndex < numCols; colIndex++) {
                allPairs.push({ rowIndex, colIndex });
            }
        }
        // Shuffle the pairs randomly
        for (let i = allPairs.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [allPairs[i], allPairs[j]] = [allPairs[j], allPairs[i]];
        }
        return allPairs;
    }

    const colLetters = Array.from({ length: numCols }, (_, i) =>
        String.fromCharCode(65 + i)
    );

    // Render modal if no GAME_ID
    const shouldShowModal = !GAME_ID;



    const regenerateImages = () => {
        if (gameState.imageUrls.length < 10) {
            console.log("No images available yet");
            return;
        }

        // console.log("Regenerating images with numbers:", gameState.image_numbers);
        // Use Cloudinary images instead of local images
        const rowPaths = gameState.imageUrls.slice(0, 5);

        const colPaths = gameState.imageUrls.slice(5, 10);

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

    // Fetch Cloudinary images when component mounts
    useEffect(() => {

        // run handleJoin using the gameId from the URL
        if (GAME_ID) {
            handleJoin(GAME_ID);
            console.log(" joining game", gameState)
        }

    }, []);

    useEffect(() => {
        if (creating) {
            fetchImages();
        }

    }, [creating]);

    useEffect(() => {
        regenerateImages();
    }, [gameState.imageUrls]);

    // Generate headers when image numbers are available or correctlyGuessedGrid changes
    // useEffect(() => {
    //     if (correctlyGuessedGrid.flat().every(card => card)) {
    //         regenerateImages();
    //     }
    // }, [correctlyGuessedGrid]); // Added supaBaseImages as dependency

    const regenerateRandomCO: () => { rowIndex: number, colIndex: number } = () => {
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
            return { rowIndex: 100, colIndex: 100 }; // Exit the function if all completed
        }
        console.log("setRandomCO(tempCO):", `${colLetters[tempCO.colIndex]}${tempCO.rowIndex + 1}`);
        return tempCO;
        // updateGameState({
        //     image_numbers,
        //     randomCO: tempCO,
        //     clueCellContent,
        //     frontCellContent: TwoDim2OneDim(frontCellContentState),
        //     completedCards,
        //     incorrectGuessCountP1,
        //     incorrectGuessCountP2,
        //     playerNames,
        // });
    }

    // Handler for clue cell content updates
    const handleClueCellEdit = (newContent: string) => {
        const newClueCellContent = [...gameState.clueCellContent];
        newClueCellContent[playerOnThisDevice] = newContent;

        setGameState({ ...gameState, clueCellContent: newClueCellContent });
        console.log("handleClueCellEdit", newContent)
        updateGameState({
            ...gameState,
            clueCellContent: newClueCellContent,
        });
    };

    // --- Supabase: Load and subscribe to game state ---
    const initialLoad = useRef(false);
    useEffect(() => {
        if (!GAME_ID) {
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
                // console.log("data.state", data.state)
                const s = data.state as StateType;
                // setImageNumbers(s.image_numbers);
                // setFrontCellContentState(OneDim2TwoDim(s.frontCellContent, numCols));

                // setCompletedCards(s.completedCards);
                // setClueCellContent(s.clueCellContent);
                setCorrectlyGuessedGrid(convertFrontCellContentStateToBool(s.frontCellContent, numCols));
                // setIncorrectGuessCountP1(s.incorrectGuessCountP1);
                // setIncorrectGuessCountP2(s.incorrectGuessCountP2);
                console.log("fetched gamestate. Setting state to", s)
                setGameState(s)
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
                    // setImageNumbers(s.image_numbers);
                    // setFrontCellContentState(OneDim2TwoDim(s.frontCellContent, numCols));
                    // setCompletedCards(s.completedCards);
                    // setClueCellContent(s.clueCellContent ?? '?');
                    setCorrectlyGuessedGrid(convertFrontCellContentStateToBool(s.frontCellContent, numCols));
                    setGameState(s)
                }
            })
            .subscribe();
        return () => {
            supabase.removeChannel(channel);
        };
    }, [GAME_ID]);

    const updateGameState = async (newState: StateType) => {
        const state = { ...newState }
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
        if (gameState.clueCellContent.filter((player, index) => index !== playerOnThisDevice).every((player) => player === "?") && !clueCell) {

            const playersWithNoClues: (string | null)[] = gameState.playerNames.filter((name, index) => index !== playerOnThisDevice && gameState.clueCellContent[index] === "?" && name !== null);

            console.log("playersWithNoClues", playersWithNoClues)
            // console.log("gameState", gameState)
            alert(`${playersWithNoClues.concat().join(", ")} needs to give a clue first! Go tell 'em!`);

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

            console.log("gameState.randomCO", gameState.randomCO.some((co) => co.rowIndex === rowIndex && co.colIndex === colIndex) && (gameState.randomCO[playerOnThisDevice].rowIndex !== rowIndex || gameState.randomCO[playerOnThisDevice].colIndex !== colIndex))
            if (gameState.randomCO.some((co) => co.rowIndex === rowIndex && co.colIndex === colIndex) && (gameState.randomCO[playerOnThisDevice].rowIndex !== rowIndex || gameState.randomCO[playerOnThisDevice].colIndex !== colIndex)) {
                // Correct card chosen - capture the clue content before resetting


                const guessedClueBelongingToPlayer = gameState.randomCO.findIndex((co) => co.rowIndex === rowIndex && co.colIndex === colIndex)
                console.log("guessedClueBelongingToPlayer", guessedClueBelongingToPlayer)

                const currentClueContent = gameState.clueCellContent;

                setPlayerAction("View Card & Give Clue")

                setCorrectlyGuessedGrid(prevCorrectlyGuessedGrid => {
                    const newCorrectlyGuessedGrid = [...prevCorrectlyGuessedGrid];
                    newCorrectlyGuessedGrid[rowIndex][colIndex] = true;
                    return newCorrectlyGuessedGrid;
                });

                setTimeout(() => {
                    console.log("User flipped the correct card")
                    setFlippedCardState(null);
                    setViewingClue(false);

                }, 1000);


                setTimeout(() => {
                    const frontCellContent2D = OneDim2TwoDim<FrontCellContent>(gameState.frontCellContent, numCols);
                    const newFrontCellContent2D = [...frontCellContent2D];
                    newFrontCellContent2D[rowIndex][colIndex] = { content: currentClueContent[guessedClueBelongingToPlayer], color: playerColours[playerOnThisDevice] };
                    const newClues = [...gameState.clueCellContent];
                    newClues[guessedClueBelongingToPlayer] = "?";

                    const randomIndex = Math.floor(Math.random() * gameState.availiableRandomCo.length);

                    const newRandomCO = [...gameState.randomCO];
                    newRandomCO[guessedClueBelongingToPlayer] = gameState.availiableRandomCo[randomIndex];

                    const newAvailiableRandomCo = [...gameState.availiableRandomCo];
                    newAvailiableRandomCo.splice(randomIndex, 1);

                    const updatedGameState = {
                        ...gameState,
                        clueCellContent: newClues,
                        randomCO: newRandomCO,
                        availiableRandomCo: newAvailiableRandomCo,
                        frontCellContent: TwoDim2OneDim<FrontCellContent>(newFrontCellContent2D),
                        completedCards: [...gameState.completedCards, `${colLetters[colIndex]}${rowIndex + 1}`],
                        incorrectGuessCount: gameState.incorrectGuessCount,

                    };

                    updateGameState(updatedGameState);
                    console.log("updatedGameState", updatedGameState)

                    // handleClueCellEdit("?");
                    setEditValue("?");

                }, 1500);

            } else if (!clueCell) {
                setGameState(current => ({ ...current, incorrectGuessCount: current.incorrectGuessCount + 1 }))
            }
        };
    }

    useEffect(() => {

        if (gameState.clueCellContent[playerOnThisDevice] !== "?") {

            setButtonState(null);
            setPlayerAction('guess the card');

        } else {
            setButtonState("view")
        }

    }, [gameState.clueCellContent])

    useEffect(() => {
        // updateGameState();
    }, [correctlyGuessedGrid])

    // useEffect(() => {
    //     // setPlayerTurn(current => current=='One' ? 'Two' : 'One')
    // }, [clueCellContent])

    const isViewingClue = (boolean: boolean) => {
        console.log("isViewingClue called with:", boolean);
        setViewingClue(boolean);
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEditValue(e.target.value);
    };

    const handleViewCard = () => {
        console.log("handleViewCard called", gameState)

        if (gameState.clueCellContent[playerOnThisDevice] === "?") {
            // handleCardFlip(100, 100, true); simply highlights the card
            handleCardFlip(100, 100, true);
            setButtonState('give');
        }
    };

    const handleGiveClue = () => {
        setButtonState('input');
        setViewingClue(false);
        setIsEditing(false);
        setFlippedCardState(null);
    };

    const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            if (editValue.split(' ').length >= 2) {
                alert('Please enter a single word');
            }
            else if (editValue !== '') {
                handleClueCellEdit(editValue);
                setEditValue('?');
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

    const handleSelectPlayerTurn = (player: number) => {
        setPlayerOnThisDevice(player);
        console.log("player on this device", player)
    };

    useEffect(() => {
        console.log("buttonState", buttonState)
    }, [buttonState])

    useEffect(() => {
        // This runs every time gameState changes
        console.log("gameState updated", gameState);
        // You can trigger side effects here
    }, [gameState]);


    const buttonClasses = "text-xs h-8 px-5 py-2 bg-blue-500 text-white rounded-md bg-gray-500 font-bold"

    // Show modal if no GAME_ID
    if (!GAME_ID) {
        return (
            <GameIdModal
                onJoin={handleJoin}
                onCreate={handleCreate}
            />
        );
    }

    if (playerOnThisDevice === 0) {
        return (
            <ChoosePlayerModal
                onSelectPlayer={handleSelectPlayerTurn}
                playerNames={gameState.playerNames || ["Player One", "Player Two"]}
                playerColours={playerColours}
            />
        );
    }

    // console.log("playerOnThisDevice", playerOnThisDevice)
    // console.log("gameState", gameState)

    const playersWithNoClues: (string | null)[] = gameState.playerNames.filter((name, index) => index !== playerOnThisDevice && gameState.clueCellContent[index] === "?" && name !== null);

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
            <div className="flex flex-row h-fit w-full items-center justify-between p-1 mb-3">
                {gameState.clueCellContent.slice(1, gameState.clueCellContent.length).map((clue, index) => (
                    <div key={index} className={`flex flex-col text-xs p-4 h-full w-full justify-center items-center text-gray-800 bg-${playerColours[index + 1]} ${index === 0 ? 'rounded-tl-2xl' : index === gameState.clueCellContent.length - 2 ? 'rounded-tr-2xl' : ''}`}>
                        {
                            <div key={index} className={`flex flex-col text-center text-xs text-gray-800 ${index + 1 === playerOnThisDevice ? 'font-bold' : ''}`}>{
                                (clue != '?' ?
                                    gameState.playerNames[index + 1] + "'s clue: " : index + 1 === playerOnThisDevice ?
                                    "View your card and Give a clue" :
                                    gameState.playerNames[index + 1] + " is thinking of a clue"
                                )}
                                <span className='flex flex-col text-center text-2xl text-gray-800'>
                                    {clue != '?' ? gameState.clueCellContent[index + 1] : ""}
                                </span>
                            </div>
                        }
                    </div>
                ))}
            </div>
            {gameState.clueCellContent[playerOnThisDevice] != '?' && <div className='flex flex-col items-center justify-start'>
                {/* <span className='text-xs text-gray-400'>
                    Your Clue
                </span> */}
                {/* <span className='text-2xl text-gray-800'>
                    {gameState.clueCellContent[playerOnThisDevice]}
                </span> */}
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
                                givenRandomCO={gameState.randomCO[playerOnThisDevice]}
                                otherPlayersRandomCO={gameState.randomCO.filter((CO, index) => index != playerOnThisDevice)}
                                numRows={numRows}
                                numCols={numCols}
                                frontCellContent={OneDim2TwoDim<FrontCellContent>(gameState.frontCellContent, numCols)}
                                handleCardFlip={handleCardFlip}
                                clueCellContent={gameState.clueCellContent[playerOnThisDevice]}
                                handleClueCellEdit={handleClueCellEdit}
                                flippedCard={flippedCardState}
                                resetFlippedCardState={resetFlippedCardState}
                                completedCards={gameState.completedCards}
                                setViewingClue={isViewingClue}
                                viewingClue={viewingClue}
                                correctlyGuessedGrid={correctlyGuessedGrid}
                                handleHeaderClick={handleHeaderClick}
                                cellColour={playerColours[playerOnThisDevice]}
                            /> :
                            <CCRows
                                rowHeaders={rowHeaders}
                                colHeaders={colHeaders}
                                cellSize="size-[150px]"
                            />
                    }
                </div>
                <div className={`flex flex-row justify-start pb-1 w-full`}>
                    {Array.from({ length: gameState.incorrectGuessCount }).map((_, idx) => (
                        <div key={idx} className='h-1.5 w-full my-0.5 mx-1 bg-red-300'></div>))}
                </div>
                <div className="w-full relative flex flex-row justify-end items-center space-x-2 pt-2 px-1">
                    <div className="flex items-center space-x-2">
                        {((buttonState == 'view' || buttonState == 'input') && gameState.clueCellContent[playerOnThisDevice] == '?') && (
                            <button
                                onClick={handleViewCard}
                                className={buttonClasses}
                            >
                                View your card
                            </button>
                        )}
                        {buttonState == 'give' && (
                            <button
                                onClick={handleGiveClue}
                                className={buttonClasses}
                            >
                                Give a clue for this card
                            </button>
                        )}
                        {buttonState === 'input' && (
                            <input
                                type="text"
                                value={editValue === '?' ? '' : editValue}
                                placeholder={`Give a clue for ${String.fromCharCode(65 + gameState.randomCO[playerOnThisDevice].colIndex)}${gameState.randomCO[playerOnThisDevice].rowIndex + 1}`}
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
                        {
                            gameState.clueCellContent[playerOnThisDevice] != '?' && (
                                <span className='text-sm text-gray-800'>Wait for {playersWithNoClues.concat().join(", ")} to give a clue... </span>
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
