import React, { useEffect, useState, useRef } from 'react';
import supabase from '../../services/supabaseClient'; // Adjust path as needed
import { useParams, useNavigate } from 'react-router-dom';
import GameIdModal from './GameIdModal';
import CCGrid from './CCGrid'; // Adjust the import path based on your structure
import CCRows from './CCRows'; // Adjust the import path based on your structure
import { generateSlug } from "random-word-slugs";
import { createClient } from '@supabase/supabase-js';
import ChoosePlayerModal from './ChoosePlayerModal';
import { BiArrowToRight, BiSkipNext } from 'react-icons/bi';
import { BsArrowRight, BsCheck, BsX } from 'react-icons/bs';

const rootPath = 'images/'

export type GridCellCO = { rowIndex: number; colIndex: number };
export type FrontCellContent = { 
    content: string, 
    color: string, vote: string | null, 
    playersVoted: number[] | null, // the players who have voted on this card
    clue: string // the clue given by player for this card
};
export type GameLog = { player: number, action: string, detail: GridCellCO | string | null | number };

interface StateType {
    imageUrls: string[];
    randomCO: GridCellCO[] //should only be four;
    availiableRandomCo: GridCellCO[]; //remaining COs that haven't been guessed yet
    clueCellContent: string[];
    frontCellContent: FrontCellContent[];
    completedCards: string[];
    incorrectGuessCount: number;
    playerCount: number;
    playerNames: (string | null)[];
    numRows: number;
    numCols: number;
    // playerVotes: { [key: string]: { CO: (GridCellCO | null)[] } }; //each clue has an array of votes. index of each clue is the player number e.g. playerOne -> playerVotes[1]. Each vote has player + 1 co-ordinates and the clue
    playerVotes: { CO: (GridCellCO | null), clue: string }[]; //each clue has an array of votes. index of each clue is the player number e.g. playerOne -> playerVotes[1]. Each vote has player + 1 co-ordinates and the clue

    gamelog: GameLog[];
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

// Get the color name for a player number
export const getPlayerColor = (playerNumber: number): string => {
    const colors = ['playerOne', 'playerTwo', 'playerThree', 'playerFour', 'playerFive', 'playerSix'];
    return colors[playerNumber - 1] || 'None';
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

// Using the existing FrontCellContent type from the StateType

export function OneDim2TwoDim<T>(oneDimArray: T[], columns: number): T[][] {
    if (columns <= 0) throw new Error("number of columns must be greater than 0");
    const result: T[][] = [];
    for (let i = 0; i < oneDimArray.length; i += columns) {
        result.push(oneDimArray.slice(i, i + columns));
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
    const result = flat.map(co => co.content.match(`[A-${String.fromCharCode(65 + columns - 1)}][1-9]`) ? false : true);
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

    const [numRows, setNumRows] = useState(0);
    const [numCols, setNumCols] = useState(0);

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

    const [voteOptionsClue, setVoteOptionClue] = useState<string>(''); // The text infront of the vote options

    // const [image_numbers, setImageNumbers] = useState<number[]>([]);
    // const [randomCO, setRandomCO] = useState<{ rowIndex: number, colIndex: number } | null>(null);
    // const [frontCellContentState, setFrontCellContentState] = useState<string[][]>([]);
    // const [correctlyGuessedGrid, setCorrectlyGuessedGrid] = useState<boolean[][]>([[]]);
    // const [completedCards, setCompletedCards] = useState<string[]>([]);
    const [incorrectGuessCountP1, setIncorrectGuessCountP1] = useState<number[]>([]);
    const [incorrectGuessCountP2, setIncorrectGuessCountP2] = useState<number[]>([]);
    const [incorrectGuesses, setIncorrectGuesses] = useState<number>(0)
    // const [clueCellContent, setClueCellContent] = useState<string>("?");
    const [editValue, setEditValue] = useState<string>("?");
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [buttonState, setButtonState] = useState<'view' | 'give' | 'input' | null>('view');
    const [playerColours, setPlayerColours] = useState<string[]>(['', 'playerOne', 'playerTwo', 'playerThree', 'playerFour', 'playerFive', 'playerSix'])
    // const [playerVotes, setPlayerVotes] = useState<{ clue: string, CO: GridCellCO | null }[][]>([]);
    // Playervotes is an array of each persons votes. each vote should be the clue, color and co-ordinate. Players can have 
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
        numRows: 0,
        numCols: 0,
        playerVotes: [],
        gamelog: [],
    });
    const [demoState, setDemoState] = useState(0)
    // State for storing Cloudinary image URLs
    const [supaBaseImages, setsupaBaseImages] = useState<string[]>([]);
    const [isLoadingImages, setIsLoadingImages] = useState<boolean>(false);
    const [hintCO, setHintCO] = useState<GridCellCO | null>(null)
    const [screenSize, setScreenSize] = useState<'tall' | 'wide'>('tall')
    const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
    const [demoMode, setDemoMode] = useState(false);


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
            // setCorrectlyGuessedGrid(convertFrontCellContentStateToBool(s.frontCellContent || [], s.numRows));
            setIncorrectGuessCountP1(s.incorrectGuessCountP1 || [0]);
            setIncorrectGuessCountP2(s.incorrectGuessCountP2 || [0]);

            console.log("joining game, current state:", s)
            setGameState(s)
            // Now navigate to the game page
            navigate(`/image_link/${gameId.trim()}`);
        }
    };

    const handleCreate = async (difficulty: 'easy' | 'normal', playerCount: number) => {
        console.log("handleCreate")
        setCreating(true);
        let length = 0;

        if (difficulty === 'easy') {
            length = 3;
        } else if (difficulty === 'normal') {
            length = 5;
        }

        setNumRows(length);
        setNumCols(length);

        const images = await fetchRandomSupabaseImages(length * length);
        console.log("images", images)
        // setImageNumbers(randomNumbers);

        // Initialize randomCO and frontCellContentState for new games
        console.log("setRandomCO(Random1)");
        const randomCoOrdinates = [{ rowIndex: -1, colIndex: -1 }]
        const allRandomCo = generateAllRandomCO(length, length)

        for (let p = 1; p <= playerCount; p++) {
            const randomIndex = Math.floor(Math.random() * allRandomCo.length)
            randomCoOrdinates.push(allRandomCo[randomIndex])
            allRandomCo.splice(randomIndex, 1)

        }

        const frontCellContent2D = Array.from({ length: length }, (_, rowIndex) =>
            Array.from({ length: length }, (_, colIndex) =>
            ({
                content: `${String.fromCharCode(65 + colIndex)}${rowIndex + 1}`,
                color: '',
                vote: null,
                playersVoted: [],
                clue: ''
            })
            )
        );
        const frontCellContent = frontCellContent2D.flat(); // 1D array for backend


        const p1 = prompt('Enter your name')
        const otherPlayers = []
        for (let p = 2; p <= playerCount; p++) {
            const otherPlayer = prompt(`Enter Player ${p}'s name`)
            if (!otherPlayer || otherPlayer.trim() === '') {
                alert('Please enter a name for Player ' + p)
                return
            }
            otherPlayers.push(otherPlayer.trim())
        }

        const game_code = generateSlug(2)
        console.log("game_code", game_code)

        const newState: StateType = {
            imageUrls: images,
            randomCO: randomCoOrdinates,
            availiableRandomCo: allRandomCo,
            clueCellContent: Array.from({ length: playerCount + 1 }, () => '?'),
            frontCellContent: frontCellContent as FrontCellContent[],
            completedCards: [],
            incorrectGuessCount: 0,
            playerNames: [null, p1, ...otherPlayers],
            playerCount: playerCount,
            numRows: length,
            numCols: length,
            playerVotes: Array.from({ length: playerCount + 1 }, () => ({ CO: null, clue: '' })),
            gamelog: [],
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

    // Add responsive cell size calculation
    const getResponsiveCellSize = () => {
        // Detect if device is mobile based on screen width and touch capability
        const isMobile = window.innerWidth <= 768 || ('ontouchstart' in window && window.innerWidth <= 1024);

        if (isMobile) {
            // For mobile: use screen width
            return `${100 / (gameState.numCols + 1.5)}vw`;
        } else {
            // For laptops: use screen height
            return `${100 / (gameState.numCols + 3)}vh`;
        }
    };

    // Add responsive grid container size calculation
    const getResponsiveGridSize = () => {
        // Detect if device is mobile based on screen width and touch capability
        const isMobile = window.innerWidth <= window.innerHeight || ('ontouchstart' in window && window.innerWidth <= window.innerHeight);

        if (isMobile) {
            // For mobile: use screen width (leave some margin)
            // setScreenSize('tall')
            return `${Math.min(100, 100)}vw`;

        } else {
            // For laptops: use screen height (leave some margin) 
            // setScreenSize('wide')
            return `${Math.min(80 - (Math.ceil(gameState.playerCount / 2) * 5), 100)}vh`;
        }
    };


    useEffect(() => {
        if (gameState.gamelog.filter((log) => log.player == playerOnThisDevice).length === 0 && demoState < 2) {
            console.log("demoMode")
            console.log("player", gameState.gamelog.filter((log) => log.player == playerOnThisDevice).length)
            console.log("demoState", demoState)
            setDemoMode(true)
        }
        else {
            console.log("not demoMode")
            setDemoMode(false)
        }
    }, [demoState, gameState, playerOnThisDevice])


    useEffect(() => {
        const isMobile = window.innerWidth <= window.innerHeight || ('ontouchstart' in window && window.innerWidth <= window.innerHeight);

        if (isMobile) {
            // For mobile: use screen width (leave some margin)
            setScreenSize('tall')

        } else {
            // For laptops: use screen height (leave some margin) 
            setScreenSize('wide')
        }

    }, [window.innerWidth, window.innerHeight]);

    useEffect(() => {
        // const handleShow = () => setIsKeyboardVisible(true);
        // const handleHide = () => setIsKeyboardVisible(false);

        // const viewport = window.visualViewport;
        // if (!viewport) return; // Add null check

        // const handleResize = () => {
        //     // If the viewport height changes significantly, assume keyboard is toggled
        //     const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        //     if (!isMobile) return;

        //     const newWindowHeight = viewport.height;
        //     const isVisible = (window.screen.height - newWindowHeight) > 100; // Threshold for keyboard
        //     setIsKeyboardVisible(isVisible);
        // };

        // // Modern iOS and Android browsers
        // viewport.addEventListener('resize', handleResize);

        // // Fallback for older browsers
        // window.addEventListener('keyboardDidShow', handleShow);
        // window.addEventListener('keyboardDidHide', handleHide);

        // return () => {
        //     viewport.removeEventListener('resize', handleResize);
        //     window.removeEventListener('keyboardDidShow', handleShow);
        //     window.removeEventListener('keyboardDidHide', handleHide);
        // };
    }, []);

    const regenerateImages = () => {
        if (gameState.imageUrls.length < gameState.numRows * 2) {
            console.log("No images available yet");
            return;
        }

        // console.log("Regenerating images with numbers:", gameState.image_numbers);
        // Use Cloudinary images instead of local images


        const rowPaths = gameState.imageUrls.slice(0, gameState.numRows);

        const colPaths = gameState.imageUrls.slice(gameState.numRows, gameState.numRows * 2);
        // console.log("rowPaths", rowPaths)
        // console.log("colPaths", colPaths)

        // console.log("correctlyGuessedGrid", correctlyGuessedGrid)

        const generatedRowHeaders = rowPaths.map((src, i) => (
            // <img key={`row-${i}`} src={src} alt={`row-${i}`} className={`w-full h-full object-contain ${correctlyGuessedGrid[i].every(card => card) ? '' : 'grayscale'}`} />
            <img key={`row-${i}`} src={src} alt={`row-${i}`} className={`w-full h-full object-contain grayscale`}
            // onClick={() => handleHeaderClick(src, `${i + 1}`)}
            />

        ));
        setRowHeaders(generatedRowHeaders);


        const generatedColHeaders = colPaths.map((src, i) => (
            // <img key={`col-${i}`} src={src} alt={`col-${i}`} className={`w-full h-full object-contain ${correctlyGuessedGrid.every(col => col[i]) ? '' : 'grayscale'}`} />
            <img key={`col-${i}`} src={src} alt={`col-${i}`} className={`w-full h-full object-contain grayscale`}
            // onClick={() => handleHeaderClick(src, `${String.fromCharCode(65 + i)}`)}
            />
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


    useEffect(() => {
        console.log("voteOptionsClue", voteOptionsClue)
    }, [voteOptionsClue]);

    // Generate headers when image numbers are available or correctlyGuessedGrid changes
    // useEffect(() => {
    //     if (correctlyGuessedGrid.flat().every(card => card)) {
    //         regenerateImages();
    //     }
    // }, [correctlyGuessedGrid]); // Added supaBaseImages as dependency


    // Handler for clue cell content updates
    const handleClueCellEdit = (newContent: string) => {
        const newClueCellContent = [...gameState.clueCellContent];
        newClueCellContent[playerOnThisDevice] = newContent;

        // Update gamestate - frontCellContent with new clue
        const newFrontCellContent = [...OneDim2TwoDim<FrontCellContent>(gameState.frontCellContent, gameState.numCols)];
        const playerCell = {...newFrontCellContent[gameState.randomCO[playerOnThisDevice].rowIndex][gameState.randomCO[playerOnThisDevice].colIndex], clue: newContent};
        newFrontCellContent[gameState.randomCO[playerOnThisDevice].rowIndex][gameState.randomCO[playerOnThisDevice].colIndex] = playerCell;
        
        // const newPlayerVotes = [...gameState.playerVotes];
        // newPlayerVotes[playerOnThisDevice] = { CO: null, clue: newContent };

        setGameState({ ...gameState, clueCellContent: newClueCellContent }); // is this necessary?
        console.log("handleClueCellEdit", newContent)
        updateGameState({
            ...gameState,
            // playerVotes: newPlayerVotes,
            clueCellContent: newClueCellContent,
            gamelog: newContent == '?' ? [...gameState.gamelog] :
                [...gameState.gamelog,
                {
                    player: playerOnThisDevice,
                    action: 'gave clue',
                    detail: newContent,
                }],
            frontCellContent: TwoDim2OneDim(newFrontCellContent),
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
                // setFrontCellContentState(OneDim2TwoDim(s.frontCellContent || [], numCols));

                // setCompletedCards(s.completedCards || []);
                // setClueCellContent(s.clueCellContent || '?');
                // setCorrectlyGuessedGrid(convertFrontCellContentStateToBool(s.frontCellContent || [], s.numRows));
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
                    // setCorrectlyGuessedGrid(convertFrontCellContentStateToBool(s.frontCellContent, s.numCols));
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

    // Add state to track the currently flipped card
    const [flippedCardState, setFlippedCardState] = useState<GridCellCO | null>(null);
    // const [votedCardState, setVotedCardState] = useState<GridCellCO | null>(null);

    const changeflippedCardState = (coOrdinate: GridCellCO | null) => {
        setFlippedCardState(coOrdinate);
    }

    const resetFlippedCardState = () => {
        console.log("resetFlippedCardState", flippedCardState)
        setFlippedCardState(null);
    }

    const openVoteOptions = (rowIndex: number, colIndex: number, clueCell: boolean, clueIndex: number) => {
        
        // opens the clue selection modal to select which clue to vote for - to confirm vote, see handleVoteSelect

        if (gameState.clueCellContent.filter(clue => clue !== "?").length === 0) {
            const playersWithNoClues: (string | null)[] = gameState.playerNames.filter((name, index) => index !== playerOnThisDevice && gameState.clueCellContent[index] === "?" && name !== null);

            console.log("playersWithNoClues", playersWithNoClues)
            // console.log("gameState", gameState)
        }

        const frontCellContent = OneDim2TwoDim<FrontCellContent>(gameState.frontCellContent, gameState.numCols);

        if (gameState.clueCellContent.filter((player, index) => index !== playerOnThisDevice).every((player) => player === "?") && !clueCell) {

            const playersWithNoClues: (string | null)[] = gameState.playerNames.filter((name, index) => index !== playerOnThisDevice && gameState.clueCellContent[index] === "?" && name !== null);

            console.log("playersWithNoClues", playersWithNoClues)
            // console.log("gameState", gameState)
            // alert(`${playersWithNoClues.slice(0, playersWithNoClues.length - 1).concat().join(", ") + (playersWithNoClues.length - 1 >= 1 ? " and " : "") + playersWithNoClues.slice(playersWithNoClues.length - 1)} needs to give a clue first! Go tell 'em!`);

        } else if (frontCellContent[rowIndex][colIndex].vote && frontCellContent[rowIndex][colIndex].playersVoted) {
            setFlippedCardState(null)
            if (gameState.clueCellContent.findIndex((clue) => clue === frontCellContent[rowIndex][colIndex].vote) === playerOnThisDevice) {
                // Player voting for their own clue - do nothing
                console.log("player voting for their own clue")
                return
            }
            // setFlippedCardState(null);
            // console.log("setting flippedCardState to null", flippedCardState)
            const newCell = frontCellContent[rowIndex][colIndex]
            if (newCell.playersVoted?.includes(playerOnThisDevice)) {
                console.log("player opting out of a contributorial vote")
                const remainingVotes = newCell.playersVoted.filter(player => player !== playerOnThisDevice)
                newCell.playersVoted = remainingVotes
                if (remainingVotes.length === 0) {
                    newCell.vote = null
                }

            } else {
                console.log("player making a contributorial vote")
                // newCell.playersVoted!.push(playerOnThisDevice)
                handleVoteSelect(frontCellContent[rowIndex][colIndex].vote!, { rowIndex, colIndex });
            }
            frontCellContent[rowIndex][colIndex] = newCell

            setGameState({
                ...gameState,
                frontCellContent: TwoDim2OneDim(frontCellContent),
            })
            return

        } else {
            setFlippedCardState(null)
            setVoteOptionClue(gameState.clueCellContent[clueIndex]);

            console.log("Player first to open vote", rowIndex, colIndex)
            console.log("gameState.clueCellContent.find((clue) => clue !== '?')", gameState.clueCellContent.find((clue) => clue !== "?")!)
            // handleVoteSelect(gameState.clueCellContent[playerOnThisDevice], { rowIndex, colIndex });
            setViewingClue(false);
            setIsEditing(false);


            const newCardVotes = [...gameState.playerVotes];

            newCardVotes[playerOnThisDevice].CO = { rowIndex, colIndex };
            newCardVotes[playerOnThisDevice].clue = gameState.clueCellContent[clueIndex] == "?" ? gameState.clueCellContent.find((clue) => clue !== "?")! : gameState.clueCellContent[clueIndex];
            console.log(newCardVotes[playerOnThisDevice].clue, "newCardVotes[playerOnThisDevice].clue")

            updateGameState({
                ...gameState,
                playerVotes: newCardVotes,
            })

        }

        setHintCO(null);

    }

    const closeVoteOptions = (rowIndex: number, colIndex: number) => {
        const newCardVotes = [...gameState.playerVotes];

        newCardVotes[playerOnThisDevice].CO = null;
        newCardVotes[playerOnThisDevice].clue = "";
        console.log("close voteOptions")

        updateGameState({
            ...gameState,
            playerVotes: newCardVotes,
        })
    }

    const handleVoteConfirm = (rowIndex: number, colIndex: number, guessedClueBelongingToPlayer: number, correctCard: boolean) => {

        console.log("handleVoteConfirm", rowIndex, colIndex, guessedClueBelongingToPlayer, correctCard)
        const frontCellContent2D = OneDim2TwoDim<FrontCellContent>(gameState.frontCellContent, gameState.numCols);

        // Clear the vote and playersVoted for this cell
        const frontCellContent = gameState.frontCellContent.map((cell, index) => {
            if (cell.vote == frontCellContent2D[rowIndex][colIndex].vote) {
                cell.vote = null;
                cell.playersVoted = null;
            }
            return cell;
        })

        const newFrontCellContent2D = [...OneDim2TwoDim(frontCellContent, gameState.numCols)];


        // Update the cell content and color if it was a correct guess
        newFrontCellContent2D[rowIndex][colIndex] = {
            content: correctCard ? gameState.clueCellContent[guessedClueBelongingToPlayer] : newFrontCellContent2D[rowIndex][colIndex].content,
            color: correctCard ? playerColours[guessedClueBelongingToPlayer] : newFrontCellContent2D[rowIndex][colIndex].color,
            vote: null,
            playersVoted: [],
            clue: newFrontCellContent2D[rowIndex][colIndex].clue
        };

        // Create a copy of the clues array and set the guessed player's clue to "?"
        const newClues = [...gameState.clueCellContent];
        newClues[guessedClueBelongingToPlayer] = "?";

        // Generate a new random CO for the player who was guessed
        const randomIndex = Math.floor(Math.random() * gameState.availiableRandomCo.length);
        const newRandomCO = [...gameState.randomCO];
        newRandomCO[guessedClueBelongingToPlayer] = gameState.availiableRandomCo[randomIndex];

        // Remove the used CO from available ones
        const newAvailiableRandomCo = [...gameState.availiableRandomCo];
        newAvailiableRandomCo.splice(randomIndex, 1);

        // Clean up playerVotes for the guessed clue
        const newPlayerVotes = [...gameState.playerVotes];
        // delete newPlayerVotes[playerOnThisDevice];

        // Add log entry
        const log = gameState.playerCount == 1 ?
            correctCard ?
                [...gameState.gamelog, { player: playerOnThisDevice, action: `guessed ${String.fromCharCode(65 + colIndex)}${rowIndex + 1} ✓`, detail: { rowIndex, colIndex } }] :
                [...gameState.gamelog, { player: playerOnThisDevice, action: `guessed ${String.fromCharCode(65 + colIndex)}${rowIndex + 1} ✗`, detail: { rowIndex, colIndex } }]
            : correctCard ?
                [...gameState.gamelog, { player: guessedClueBelongingToPlayer, action: `${gameState.clueCellContent[guessedClueBelongingToPlayer]} was ${String.fromCharCode(65 + colIndex)}${rowIndex + 1} ✓`, detail: { rowIndex, colIndex } }] :
                [...gameState.gamelog, { player: guessedClueBelongingToPlayer, action: `${gameState.clueCellContent[guessedClueBelongingToPlayer]} wasn't ${String.fromCharCode(65 + colIndex)}${rowIndex + 1} ✗`, detail: { rowIndex, colIndex } }];

        // Update the game state
        const updatedGameState = {
            ...gameState,
            clueCellContent: newClues,
            randomCO: newRandomCO,
            availiableRandomCo: newAvailiableRandomCo,
            frontCellContent: TwoDim2OneDim<FrontCellContent>(newFrontCellContent2D),
            completedCards: [...gameState.completedCards, `${colLetters[colIndex]}${rowIndex + 1}`],
            incorrectGuessCount: correctCard ? gameState.incorrectGuessCount : gameState.incorrectGuessCount + 1,
            playerVotes: newPlayerVotes,
            gamelog: log,
        };

        updateGameState(updatedGameState);
        console.log("updatedGameState", updatedGameState);

        // Reset local state
        setEditValue("?");
        // setHintCO(null);
    }


    // Handler for card flips
    const handleCardFlip = (clue: string, rowIndex: number, colIndex: number, clueCell = false) => {
        // console.log("rowIndex", rowIndex)
        // console.log("colIndex", colIndex)
        if (gameState.clueCellContent.filter((player, index) => index !== playerOnThisDevice).every((player) => player === "?") && !clueCell) {

            const playersWithNoClues: (string | null)[] = gameState.playerNames.filter((name, index) => index !== playerOnThisDevice && gameState.clueCellContent[index] === "?" && name !== null);

            console.log("playersWithNoClues", playersWithNoClues)
            // console.log("gameState", gameState)
        } else if (rowIndex === flippedCardState?.rowIndex && colIndex === flippedCardState?.colIndex) {
            // setFlippedCardState(null);
            // console.log("setting flippedCardState to null", flippedCardState)
        } else {
            // setFlippedCardState({ rowIndex, colIndex });
            // console.log("frontCellContentState", frontCellContentState)
            // console.log("randomCO", randomCO)
            setFlippedCardState({ rowIndex, colIndex });
            console.log("Setting viewingClue to false");
            setViewingClue(false);
            setIsEditing(false);
            const guessedClueBelongingToPlayer = gameState.clueCellContent.findIndex((c) => c === clue)



            setTimeout(() => {
                console.log("User flipped the correct card")
                setFlippedCardState(null);
                setViewingClue(false);

            }, 1000);

            console.log("gameState.randomCO", gameState.randomCO.some((co) => co.rowIndex === rowIndex && co.colIndex === colIndex) && (gameState.randomCO[playerOnThisDevice].rowIndex !== rowIndex || gameState.randomCO[playerOnThisDevice].colIndex !== colIndex))
            if (gameState.randomCO.filter((_, index) => index !== playerOnThisDevice).some((co) => co.rowIndex === rowIndex && co.colIndex === colIndex)) {
                // Correct card chosen - capture the clue content before resetting

                console.log("guessedClueBelongingToPlayer", guessedClueBelongingToPlayer)


                setPlayerAction("View Card & Give Clue")

                // setCorrectlyGuessedGrid(prevCorrectlyGuessedGrid => {
                //     const newCorrectlyGuessedGrid = [...prevCorrectlyGuessedGrid];
                //     newCorrectlyGuessedGrid[rowIndex][colIndex] = true;
                //     return newCorrectlyGuessedGrid;
                // });

                // setTimeout(() => {
                //     console.log("User flipped the correct card")
                //     setFlippedCardState(null);
                //     setViewingClue(false);

                // }, 1000);


                setTimeout(() => {
                    handleVoteConfirm(rowIndex, colIndex, guessedClueBelongingToPlayer, true)
                    // const frontCellContent2D = OneDim2TwoDim<FrontCellContent>(gameState.frontCellContent, gameState.numCols);
                    // const newFrontCellContent2D = [...frontCellContent2D];
                    // newFrontCellContent2D[rowIndex][colIndex] = { content: gameState.clueCellContent[guessedClueBelongingToPlayer], color: playerColours[guessedClueBelongingToPlayer], vote: null, playersVoted: null };
                    // const newClues = [...gameState.clueCellContent];
                    // newClues[guessedClueBelongingToPlayer] = "?";

                    // const randomIndex = Math.floor(Math.random() * gameState.availiableRandomCo.length);

                    // const newRandomCO = [...gameState.randomCO];
                    // newRandomCO[guessedClueBelongingToPlayer] = gameState.availiableRandomCo[randomIndex];

                    // const newAvailiableRandomCo = [...gameState.availiableRandomCo];
                    // newAvailiableRandomCo.splice(randomIndex, 1);

                    // const updatedGameState = {
                    //     ...gameState,
                    //     clueCellContent: newClues,
                    //     randomCO: newRandomCO,
                    //     availiableRandomCo: newAvailiableRandomCo,
                    //     frontCellContent: TwoDim2OneDim<FrontCellContent>(newFrontCellContent2D),
                    //     completedCards: [...gameState.completedCards, `${colLetters[colIndex]}${rowIndex + 1}`],
                    //     incorrectGuessCount: gameState.incorrectGuessCount,
                    //     gamelog: [...gameState.gamelog, { player: playerOnThisDevice, action: `guessed ${String.fromCharCode(65 + colIndex)}${rowIndex + 1} ✓`, detail: { rowIndex, colIndex } }],

                    // };

                    // updateGameState(updatedGameState);
                    // console.log("updatedGameState", updatedGameState)

                    // // handleClueCellEdit("?");
                    // setEditValue("?");
                    // setHintCO(null);

                }, 1000);

            } else if (!clueCell) {

                console.log("Wrong card")
                // Wrong card

                handleVoteConfirm(rowIndex, colIndex, guessedClueBelongingToPlayer, false)
            }
        };
    }

    const handleVoteSelect = (clue: string, CO: GridCellCO) => {
        setHintCO(null)
        const newPlayerVotes = [...gameState.playerVotes];

        newPlayerVotes[playerOnThisDevice].CO = null;
        newPlayerVotes[playerOnThisDevice].clue = '';


        const frontCellContent2D = OneDim2TwoDim<FrontCellContent>(
            // update the front cell content -> remove all matching votes and re-add the player who voted
            gameState.frontCellContent.map((cell, index) => {
                const cellPlayerRemoved = cell.playersVoted?.filter((player) => player !== playerOnThisDevice);
                if (cell.vote) {
                    console.log("cell.vote", cell.vote)
                    console.log("clue", clue)
                }

                if (gameState.playerCount == 2) {
                    console.log("twoplayer game")
                    // handleCardFlip(clue, CO.rowIndex, CO.colIndex)

                    return { ...cell }
                }

                if (cell.vote == clue) {

                    if (cellPlayerRemoved?.length == 0) {
                        console.log("cellPlayerRemoved", cellPlayerRemoved)

                        // If player is last to remove their vote from a cell - remove the vote
                        console.log("remove vote as well")

                        return {
                            ...cell,
                            vote: null,
                            playersVoted: cellPlayerRemoved ?? null
                        }

                    } else {
                        // Simply add player to the vote
                        if (cell.playersVoted?.length == gameState.playerCount - 2) {

                            // If the same vote already exists, remove it, i.e. remove player from that vote

                            return { 
                                ...cell,
                                playersVoted: [...cell.playersVoted].filter((player) => player !== playerOnThisDevice)
                            }
                        }
                        else {
                            console.log("not players last vote")
                            return {
                                ...cell,
                                playersVoted: cellPlayerRemoved ?? null
                            }
                        }
                    }
                } else if (cell.vote == null) {

                    return cell
                } else {
                    return cell
                }
            }),
            gameState.numCols
        );

        // const newPlayerVotes = [...gameState.playerVotes];

        // newPlayerVotes[playerOnThisDevice].CO = null;
        // newPlayerVotes[playerOnThisDevice].clue = '';

        // const newFrontCellContent2D = OneDim2TwoDim<FrontCellContent>(gameState.frontCellContent.map((cell) => cell.vote == clue ? { ...cell, vote: null, playersVoted: cell.playersVoted!.filter((player) => player !== playerOnThisDevice) } : cell), gameState.numCols);

        // const cellPlayerRemoved = newFrontCellContent2D[CO.rowIndex][CO.colIndex].playersVoted?.filter((player) => player !== playerOnThisDevice);

        // let newCell = newFrontCellContent2D[CO.rowIndex][CO.colIndex];

        // if (newCell.vote) {
        //     // console.log("cell.vote", newCell.vote)
        //     // console.log("clue", clue)

        // }

        // console.log("newCell", newCell)
        // console.log("cellPlayerRemoved", cellPlayerRemoved)
        // console.log("cell.vote", newCell.vote)
        // console.log("clue", clue)
        // if (newCell.vote == clue) {
        //     if (cellPlayerRemoved?.length == 0) {
        //         console.log("cellPlayerRemoved", cellPlayerRemoved)
        //         // If player is last to remove their vote from a cell - remove the vote
        //         newCell = {
        //             ...newFrontCellContent2D[CO.rowIndex][CO.colIndex],
        //             vote: null,
        //             playersVoted: cellPlayerRemoved ?? []
        //         }

        //     } else {
        //         // Simply add player to the vote

        //         if (newCell.playersVoted?.length == gameState.playerCount - 2 || (newCell.playersVoted?.length == 1 && gameState.playerCount == 2)) {
        //             console.log("player is last to vode - flip the card - see result")
        //             handleCardFlip(clue, CO.rowIndex, CO.colIndex)

        //         }
        //         else {
        //             console.log("player is last to vode - flip the card - see result")

        //         }
        //     }
        // } else {
        //     console.log("cell is not the one voted on")
        //     // handleCardFlip(clue, CO.rowIndex, CO.colIndex)

        // }

        // // Add new clue to front cell content
        const currentPlayerVoters = [...frontCellContent2D[CO.rowIndex][CO.colIndex].playersVoted ?? []];
        currentPlayerVoters.push(playerOnThisDevice);
        frontCellContent2D[CO.rowIndex][CO.colIndex] = { ...frontCellContent2D[CO.rowIndex][CO.colIndex], vote: clue, playersVoted: currentPlayerVoters };

        updateGameState({
            ...gameState,
            playerVotes: newPlayerVotes,
            frontCellContent: TwoDim2OneDim<FrontCellContent>(frontCellContent2D),
        })
    };

    useEffect(() => {

        if (gameState.frontCellContent.length > 0) {
            const frontCellContent2D = OneDim2TwoDim<FrontCellContent>(gameState.frontCellContent, gameState.numCols);
            for (let rowIndex = 0; rowIndex < frontCellContent2D.length; rowIndex++) {
                for (let colIndex = 0; colIndex < frontCellContent2D[rowIndex].length; colIndex++) {
                    if (frontCellContent2D[rowIndex][colIndex].playersVoted?.length == gameState.playerCount - 1) {
                        handleCardFlip(frontCellContent2D[rowIndex][colIndex].vote!, rowIndex, colIndex)
                    }
                }
            }
        }

    }, [gameState.frontCellContent])

    useEffect(() => {

        if (gameState.clueCellContent[playerOnThisDevice] !== "?") {

            setButtonState(null);
            setPlayerAction('guess the card');

        } else {
            setButtonState("view")
        }

    }, [gameState.clueCellContent])

    useEffect(() => {
        // if (hintCO !== null) {
        //     setHintCO(null);
        // }
    }, [gameState.playerVotes])

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
            setViewingClue(true);
            setIsEditing(true);
            setButtonState('give');
            setHintCO(null);
        }

        if (demoState === 0) {
            setDemoState(1);
        }
    };

    const handleGiveClue = () => {
        setButtonState('input');
        // setViewingClue(false);
        setIsEditing(false);
        setFlippedCardState(null);
        setDemoState(2);
    };

    const enterClue = () => {
        if (editValue.split(' ').length >= 2) {
            alert('Please enter a single word');
        }
        else if (editValue !== '') {
            // confirm clue
            handleClueCellEdit(editValue);
            setEditValue('?');
            setButtonState('view');
            setFlippedCardState(null);
            setBigImage(null);
            setPlayerAction('guess the card'); // Player action changes after clue is given
            // Player turn change is now in useEffect based on clueCellContent
            setViewingClue(false);
        }
    }

    const skipClueGive = () => {
        setButtonState('view');
        setIsEditing(false);
        setFlippedCardState(null);
        setBigImage(null);
        setViewingClue(false);
        setDemoState(2);
    }

    const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            enterClue()
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
            setDemoState(0);
            setViewingClue(false);
        }


    };

    const handleInputFocus = () => {
        setButtonState('input')
    }

    useEffect(() => {
        const isMobile = window.innerWidth <= 768 || ('ontouchstart' in window && window.innerWidth <= 1024);
        if (screenSize == 'tall' && buttonState == 'input' && isMobile) {
            setIsKeyboardVisible(true)
        } else {
            setIsKeyboardVisible(false)
        }
    }, [buttonState])

    const handleHeaderClick = (header?: React.ReactNode, CO?: string) => {
        if (bigImage && CO == bigCO) {
            setBigImage(null);
            setBigCO('');
            setCurrentBigImageIndex(null);
        } else if (header && CO) {
            setBigImage(header);
            setBigCO(CO);
            // Find the index of the clicked header in the combined list
            const index = allHeaderImages.findIndex(item => item.element === header);
            setCurrentBigImageIndex(index);
        }
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

    const handleConfirmGuess = () => {
        const currentVote = gameState.playerVotes[playerOnThisDevice].clue;
        const CO = {...gameState.playerVotes[playerOnThisDevice].CO} as GridCellCO;
    
        handleVoteSelect(currentVote, CO)
    }

    // Load saved player name from localStorage when component mounts and when player names change
    useEffect(() => {
        const savedPlayerName = localStorage.getItem('crossCluesPlayerName');
        if (savedPlayerName && gameState.playerNames.includes(savedPlayerName)) {
            const playerIndex = gameState.playerNames.indexOf(savedPlayerName);
            if (playerIndex !== -1) {
                // Auto-select the player if their name is in the list
                handleSelectPlayerTurn(playerIndex);
            }
        }
    }, [gameState.playerNames]);

    // Component for rendering player badges
    const PlayerBadge = ({ playerName, playerNumber }: { playerName: string | null, playerNumber: number }) => {
        const color = getPlayerColor(playerNumber);
        return (
            <span className={`text-gray-600 bg-${color} px-1.5 rounded-lg whitespace-nowrap`}>
                {playerName || 'Unknown Player'}
            </span>
        );
    };

    // Render a hint log entry
    const renderHintLog = (log: GameLog, index: number, playerColor: string) => {
        const playersClue = log.detail as number;
        const targetPlayerColor = getPlayerColor(playersClue); // +1 because players are 1-indexed
        const [_, hintText] = log.action.split('for ');

        return (
            <span key={index} className='flex flex-row items-center'>
                <PlayerBadge playerName={gameState.playerNames[log.player]} playerNumber={log.player} />
                <span className="mx-1 whitespace-nowrap">got a hint for</span>
                <span className={`bg-${targetPlayerColor} text-gray-600 px-1 rounded-lg whitespace-nowrap`}>
                    {hintText}
                </span>
            </span>
        );
    };

    // Render a regular action log entry
    const renderActionLog = (log: GameLog, index: number, playerColor: string) => {
        const actionClass = log.action.includes('✓') ? 'text-correct' :
            log.action.includes('✗') ? 'text-wrong' : '';


        if (log.action.includes('was')) {

            const [clue, action] = log.action.split(' was');

            return (
                <span key={index} className='flex flex-row items-center gap-1'>
                    <PlayerBadge playerName={clue} playerNumber={log.player} />
                    <span className={'whitespace-nowrap ' + actionClass}>
                        was{action}
                    </span>
                </span>
            );

        } else {

            return (
                <span key={index} className='flex flex-row items-center gap-1'>
                    <PlayerBadge playerName={gameState.playerNames[log.player]} playerNumber={log.player} />
                    <span className={'whitespace-nowrap ' + actionClass}>
                        {log.action}
                    </span>
                </span>
            );
        }
    };

    // Render a clue action log entry
    const renderClueLog = (log: GameLog, index: number, playerColor: string) => {


        return (
            <span key={index} className='flex flex-row items-center gap-1'>
                <PlayerBadge playerName={gameState.playerNames[log.player]} playerNumber={log.player} />
                <span className={'whitespace-nowrap'}>
                    {log.action}:
                </span>
                <span className={'whitespace-nowrap font-semibold'}>
                    {log.detail as string}
                </span>
            </span>
        );
    };

    const parseGameLog = (log: GameLog, index: number) => {
        const color = getPlayerColor(log.player);

        // Skip if detail is not a GridCellCO
        if (log.detail === null) {
            return null
        }

        if (typeof log.detail === 'string') {
            return renderClueLog(log, index, color);
        }

        // Handle hint logs
        if (log.action.includes('hint')) {
            return renderHintLog(log, index, color);
        }

        // Handle regular action logs
        return renderActionLog(log, index, color);
    }

    useEffect(() => {
        console.log("buttonState", buttonState)
    }, [buttonState])

    useEffect(() => {
        // This runs every time gameState changes
        console.log("gameState updated", gameState);
        // You can trigger side effects here
    }, [gameState]);




    const handleHintClick = (CO: GridCellCO) => {
        hintCO == null ? (setHintCO(CO), setButtonState('view')) : setHintCO(null)
        setViewingClue(false)
        setIsEditing(false);
        const playersClue = gameState.randomCO.findIndex((item: GridCellCO) =>
            item.rowIndex === CO.rowIndex && item.colIndex === CO.colIndex
        );
        console.log("playersClue", playersClue);

        updateGameState({
            ...gameState,
            gamelog: [...gameState.gamelog,
            {
                player: playerOnThisDevice,
                action: `got a hint for ${gameState.clueCellContent[playersClue]}`,
                detail: playersClue
            }]
        })
    }

    const gameLogComponent = (hidden: boolean) => {
        return (

            <div className={`h-full overflow-x-scroll w-full bg-white bg-gradient-to-r from-white to-gray-100 via-white via-80%`}
            // style={{ width: getResponsiveGridSize() }}
            >
                <div className={`justify-start w-full h-full flex flex-row py-1.5 px-2 text-left text-sm text-gray-800 ${hidden ? 'hidden' : ''}`}>
                    {gameState.gamelog.slice().reverse().map((log: GameLog, index: number, array: GameLog[]) => (
                        log && (
                            <div key={index} className="flex items-center">
                                <div className="whitespace-nowrap">
                                    {parseGameLog(log, index)}
                                </div>
                                {index !== array.length - 1 && (
                                    <div className="h-5 w-px bg-gray-200 mx-1.5" />
                                )}
                            </div>
                        )
                    ))}
                </div>
            </div>

        )
    }


    const buttonClasses = "text-xs h-8 px-4 py-2 text-white rounded-sm bg-gray-500 font-semibold whitespace-nowrap"

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
                playerNames={gameState.playerNames || ["Player One", "Player Two",]}
                playerColours={playerColours}
            />
        );
    }

    // console.log("playerOnThisDevice", playerOnThisDevice)

    const playersWithNoClues: (string | null)[] = gameState.playerNames.filter((name, index) => index !== playerOnThisDevice && gameState.clueCellContent[index] === "?" && name !== null);
    const playersWithClues: (string | null)[] = gameState.playerNames.filter((name, index) => index !== playerOnThisDevice && gameState.clueCellContent[index] !== "?" && name !== null);

    return (
        <div className='flex flex-row h-full justify-center items-center pb-4 pl'>
            {
                // screenSize == 'wide' && gameLogComponent(true)
            }
            <div className={`flex flex-col gap-2 transition-transform duration-300 transform ${isKeyboardVisible ? '-translate-y-1/2' : ''}`}>
                {/* <div id="bigImageContainer" className={`relative flex flex-col flex-start ${bigImage ? 'h-[25vh]' : ''}`} style={{ width: getResponsiveGridSize() }} onClick={() => {
                    setBigImage(null);
                    setBigCO('');
                    setCurrentBigImageIndex(null); 
                }}>
                    {bigImage}
                    {bigCO && ( // Only render bigCO if it's not an empty string
                        <div className='absolute -bottom-8 left-0 text-[80px] p-4 text-black tracking-wide font-bold z-10 opacity-60'>
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
                </div> */}
                <div
                    className="grid grid-cols-6 h-fit px-1 z-30"
                    style={{ width: getResponsiveGridSize() }}
                    id="playerClues"
                >
                    {gameState.clueCellContent.slice(1, gameState.clueCellContent.length).map((clue, index) => {
                        const totalClues = gameState.clueCellContent.length - 1;
                        let colSpanClass = '';
                        if (totalClues % 2 === 0) {
                            colSpanClass = 'col-span-3';
                        } else {
                            if (index + 1 < totalClues) {
                                colSpanClass = 'col-span-3';
                            } else {
                                colSpanClass = 'col-span-6';
                            }
                        }



                        let roundedClass = '';
                        if (totalClues >= 5 || totalClues === 3) {
                            if (index === 0) {
                                roundedClass = 'rounded-tl-2xl';
                            }
                            if (index === 1) {
                                roundedClass = 'rounded-tr-2xl';
                            }
                        } else {
                            if (index === 0) {
                                roundedClass = 'rounded-tl-2xl';
                            }
                            if (index === 1) {
                                roundedClass = 'rounded-tr-2xl';
                            }
                        }

                        return (
                            <div key={index} className={`flex flex-col text-xs px-2 py-2 h-full justify-center items-center overflow-hidden text-gray-800 bg-${playerColours[index + 1]} ${colSpanClass} ${roundedClass}`}>
                                {/* <div key={index} className={`flex flex-col text-xs p-4 h-full justify-center items-center text-gray-800 bg-${playerColours[index + 1]} ${colSpanClass} ${roundedClass} [calc(100vw/${gameState.clueCellContent.length - 1})]`}>     */}

                                <div key={index} className={`flex flex-col w-full h-full justify-center items-center text-xs text-[#6B7280] ${index + 1 !== playerOnThisDevice ? '' : ''}`}>
                                    {

                                        (clue != '?' ?
                                            index + 1 == playerOnThisDevice ?
                                                <span className='w-full text-left text-xs pl-1.5 -mb-1' >Your clue: </span> :
                                                <span className='w-full text-left text-xs pl-1.5 -mb-1'>{gameState.playerNames[index + 1]}'s: </span>


                                            :
                                            index + 1 === playerOnThisDevice ?
                                                (<div className='flex flex-row justify-center items-center gap-2'><span>View card</span><BsArrowRight /><span>Give clue</span></div>) :
                                                <span>{gameState.playerNames[index + 1]} is thinking of a clue...</span>
                                        )
                                    }
                                    {
                                        clue != '?' ? <span className={`flex flex-col text-center text-${gameState.clueCellContent.length <= 4 ? '2xl py-1' : 'lg py-0'} text-gray-800 font-medium`}>
                                            {gameState.clueCellContent[index + 1]}
                                        </span> : ""
                                    }
                                    {

                                        (
                                            clue != '?' ?
                                                index + 1 != playerOnThisDevice && hintCO == null ?
                                                    <button className={`flex flex-col w-full items-end text-xs text-gray-500 -my-1 h-4 ${gameState.gamelog.length < gameState.playerCount && 'pointer-events-none'}`} onClick={() => handleHintClick(gameState.randomCO[index + 1])}>
                                                        {<span className={`bg-white bg-opacity-30 py-0.5 px-1.5 -mt-1 rounded w-fit`}>Hint</span>}
                                                    </button>
                                                    :
                                                    <button className='flex flex-col w-full items-end text-xs text-gray-500 -my-1 h-4 cursor-default'>
                                                        <span className='bg-white bg-opacity-30 py-0.5 px-1.5 -mt-1 rounded w-fit hidden'>Edit</span>
                                                    </button>
                                                :
                                                <></>
                                        )

                                    }

                                </div>
                            </div>
                        );
                    })}
                </div>
                <div className="flex flex-col flex-start items-center space-y-1 overflow-visible w-fit gap-1"
                    id="gridBoard">
                    <div className="h-full">
                        {gameState.gamelog.filter((log) => log.player == playerOnThisDevice).length === 0 && demoState === 0 && bigImage == null && (
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center z-10 gap-2">
                                <span className='text-xs text-gray-600 font-semibold text-center'>Start by giving <br /> a clue for your card</span>

                                {((buttonState == 'view' || buttonState == 'input') && gameState.clueCellContent[playerOnThisDevice] == '?' && gameState.gamelog.filter((log) => log.player == playerOnThisDevice).length === 0) && (
                                    <button
                                        onClick={handleViewCard}
                                        className={buttonClasses + (demoMode ? ' animate-pulse' : '')}
                                    >
                                        View card
                                    </button>

                                )}
                            </div>
                        )}
                        {
                            gridView ?
                                rowHeaders.length &&
                                <CCGrid
                                    rowHeaders={rowHeaders}
                                    colHeaders={colHeaders}
                                    cellSize="auto"
                                    className="mx-auto overflow-visible"
                                    style={{
                                        width: getResponsiveGridSize(),
                                        height: getResponsiveGridSize(),
                                        aspectRatio: '1'
                                    }}
                                    // cellSize="size-[calc(100vw/6)] max-w-[90px] max-h-[90px]"
                                    playerOnThisDevice={playerOnThisDevice}
                                    givenRandomCO={gameState.randomCO[playerOnThisDevice]}
                                    otherPlayersRandomCO={gameState.randomCO.map((CO, index) => index != playerOnThisDevice && gameState.clueCellContent[index] !== "?" ? CO : null)}
                                    numRows={gameState.numRows}
                                    numCols={gameState.numCols}
                                    frontCellContent={OneDim2TwoDim<FrontCellContent>(gameState.frontCellContent, gameState.numCols)}
                                    openVoteOptions={openVoteOptions}
                                    handleVoteSelect={handleVoteSelect}
                                    clueCellContent={gameState.clueCellContent}
                                    handleClueCellEdit={handleClueCellEdit}
                                    flippedCard={flippedCardState}
                                    playerVotes={gameState.playerVotes}
                                    resetFlippedCardState={resetFlippedCardState}
                                    completedCards={gameState.completedCards}
                                    setViewingClue={isViewingClue}
                                    viewingClue={viewingClue}
                                    closeVoteOptions={closeVoteOptions}
                                    // correctlyGuessedGrid={correctlyGuessedGrid}
                                    handleHeaderClick={(header, CO) => handleHeaderClick(header, CO)}
                                    cellColour={playerColours[playerOnThisDevice]}
                                    playerColours={playerColours}
                                    // recentlyVotedCards={gameState.playerVotes[playerOnThisDevice].map((card) => ({ CO: card.CO, clue: card.clue, colour: playerColours[playerOnThisDevice] }))}
                                    demoMode={demoMode}
                                    hintCO={hintCO}
                                    bigImage={bigImage}
                                    bigCO={bigCO}
                                    currentBigImageIndex={currentBigImageIndex}
                                    handlePrevImage={handlePrevImage}
                                    handleNextImage={handleNextImage}
                                    voteOptionsClue={voteOptionsClue}
                                /> :
                                <CCRows
                                    rowHeaders={rowHeaders}
                                    colHeaders={colHeaders}
                                    cellSize="size-[150px]"
                                />
                        }
                    </div>
                </div>
                <div id="gameLog" className="relative w-full flex flex-col justify-between items-start pt-0 z-30">
                    {OneDim2TwoDim(gameState.gamelog.filter((log) => log.action.includes(`✗`) || log.action.includes(`hint`)), 48).map((log_row, row_idx) => (
                        <div key={row_idx} className={`flex flex-row justify-start gap-1.5 px-1 pb-1 w-full`}>
                            {log_row.map((log, idx) => (
                                <div key={idx} className={`w-full rounded-full h-1.5 ${log.action.includes(`hint`) ? ('bg-' + playerColours[log.player] + 'Dark') : ('bg-red-300')}`}>
                                    {/* {log.action.includes(`✗`) ? (
                                <div className='h-1.5 w-full my-0.5 bg-red-300'></div>
                            ) : log.action.includes(`hint`) ? (
                                <div className={`h-1.5 w-full my-0.5 bg-${playerColours[log.player]}`}></div>
                            ) : ''} */}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
                <div id="playerControls" className={`flex flex-row justify-end items-start pt-0 px-1 gap-2 z-30`} style={{ width: getResponsiveGridSize() }}>
                    {
                        gameState.gamelog.length > 0 && gameLogComponent(false)
                    }
                    <div className="flex flex-row h-8 items-center gap-2 justify-end whitespace-nowrap">

                        {bigImage && (
                            <button
                                onClick={() => handleHeaderClick(bigImage, bigCO)}
                                className={buttonClasses}
                            >
                                Close image
                            </button>
                        )}

                        {gameState.playerVotes[playerOnThisDevice]?.CO != null && (
                            <button
                                onClick={() => handleConfirmGuess()}
                                className={buttonClasses}
                            >
                                Confirm Guess
                            </button>
                        )}

                        {!bigImage && ((buttonState == 'view') && gameState.clueCellContent[playerOnThisDevice] == '?') && !(gameState.playerVotes[playerOnThisDevice]?.CO != null) && !demoMode && (
                            <button
                                onClick={handleViewCard}
                                className={buttonClasses + (demoMode ? 'animate-pulse' : '')}
                            >
                                View card
                            </button>

                        )}

                        {!bigImage && buttonState == 'give' && (
                            <button
                                onClick={handleGiveClue}
                                className={buttonClasses + (demoMode ? ' animate-pulse' : '')}
                            >
                                Give clue for {String.fromCharCode(65 + gameState.randomCO[playerOnThisDevice].colIndex)}{gameState.randomCO[playerOnThisDevice].rowIndex + 1}
                            </button>
                        )}

                        {!bigImage && buttonState == 'give' && (
                            <button
                                onClick={skipClueGive}
                                className={'size-8 p-1 text-2xl text-white rounded-sm bg-gray-400'}
                            >
                                <BsX className='size-full' />
                            </button>
                        )}

                        {!bigImage && buttonState === 'input' && (
                            <input
                                id="clue-input"
                                type="text"
                                value={editValue === '?' ? '' : editValue}
                                placeholder={`Clue for ${String.fromCharCode(65 + gameState.randomCO[playerOnThisDevice].colIndex)}${gameState.randomCO[playerOnThisDevice].rowIndex + 1}`}
                                onChange={handleInputChange}
                                onKeyDown={handleInputKeyDown}
                                onBlur={handleInputBlur}
                                onFocus={handleInputFocus}
                                className="w-fit text-center text-sm py-1 placeholder:text-gray-500
                            focus:outline-none focus:ring-0 focus:border-gray-400 border-b-2 border-gray-400
                            bg-transparent border-t-0 border-l-0 border-r-0 h-8"
                                autoFocus
                            />
                        )}

                        {!bigImage && buttonState == 'input' && (
                            <button
                                onClick={() => {
                                    enterClue()
                                }}
                                className={`text-md size-8 p-1 bg-${playerColours[playerOnThisDevice]} font-bold rounded-sm text-gray-800`}
                            >
                                <BsCheck className='size-full font-bold text-gray-400' />
                            </button>
                        )}

                        {
                            // !gameState.playerVotes.some((vote) => vote.CO != null) && (
                            //     <span className='w-full text-sm text-gray-800 text-right font-semibold'>
                            //         {playersWithNoClues.length >= gameState.playerCount - playersWithNoClues.length ?
                            //             <span className='text-sm pl-2'>
                            //                 Wait for {playersWithNoClues.length == 1 ? playersWithNoClues[0] : "others"} to give a clue...
                            //             </span>
                            //             :
                            //             "Guess " + playersWithClues.slice(0, playersWithClues.length - 1).concat().join("'s, ") + (playersWithClues.length - 1 >= 1 ? "'s and " : "") + playersWithClues.slice(playersWithClues.length - 1) + "'s card" + (playersWithClues.length - 1 > 1 ? "s!" : "!")}
                            //     </span>
                            // )
                        }
                    </div>
                </div>
            </div>
            {
                // screenSize == 'wide' && gameLogComponent(false)
            }
        </div >
    );
};

export default RandomImageGridWrapper;
