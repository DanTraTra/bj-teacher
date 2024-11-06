import React, {useCallback, useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import Tile from '../components/comp_orangagrams/tile'
import GameBoard, {is2DArrayEmpty} from "./Gameboard";
import {TileProps} from "../components/comp_orangagrams/tile";
import {
    IoArrowBackCircleOutline,
    IoArrowDownCircleOutline,
    IoArrowForwardCircleOutline,
    IoCheckmarkCircleOutline,
    IoRefreshCircleOutline
} from "react-icons/io5";
import {FaRegCheckCircle} from "react-icons/fa";
import {IoIosCheckmarkCircleOutline, IoIosCloseCircleOutline} from "react-icons/io";
import {round} from "@tensorflow/tfjs";
import {PiArrowArcLeft, PiArrowArcRight, PiArrowsClockwiseBold} from "react-icons/pi";
import {FaArrowRotateLeft, FaArrowRotateRight} from "react-icons/fa6";

const createEmptyGrid = (rows: number, cols: number) =>
    Array.from({length: rows}, () => Array(cols).fill(null));

type dir = 'TOP' | 'RIGHT' | 'BOTTOM' | 'LEFT'

export interface DisplayGrid {
    grid: (TileProps | null)[][],
    direction: dir
    nextLoc: {
        x: number,
        y: number
    },
    prevLoc: {
        x: number,
        y: number
    },
}

function SinglePLayer() {
    const navigate = useNavigate();
    const gridSize = 19

    interface loc {
        x: number,
        y: number
    }

    const initialStartingLoc = {x: Math.floor(gridSize / 2), y: Math.floor(gridSize / 2)}

    const initialGrid: DisplayGrid = {
        grid: createEmptyGrid(gridSize, gridSize),
        direction: 'RIGHT',
        nextLoc: initialStartingLoc,
        prevLoc: initialStartingLoc,
    }

    const [displayTileGrid, setDisplayTileGrid] = useState<DisplayGrid>(initialGrid)
    const [selectedTileIds, setSelectedTileIds] = useState<Set<number>>(new Set([]))
    const [confirmedTileIds, setConfirmedTileIds] = useState<Set<number>>(new Set([]))
    const [xTileId, setXTileId] = useState<number>(-1)
    const allLettersDict = {
        A: 13,
        B: 3,
        C: 3,
        D: 6,
        E: 18,
        F: 3,
        G: 4,
        H: 3,
        I: 12,
        J: 2,
        K: 2,
        L: 5,
        M: 3,
        N: 8,
        O: 11,
        P: 3,
        Q: 2,
        R: 9,
        S: 6,
        T: 9,
        U: 6,
        V: 3,
        W: 3,
        X: 2,
        Y: 3,
        Z: 2
    }

    const allLettersList: string[] = Object.entries(allLettersDict).flatMap(([letter, amount]) => Array(amount).fill(letter))
    const getRandomLetters = (count: number): string[] => {
        let output: string[] = []
        for (let i = 0; i < count; i++) {
            const randomIndex = Math.floor(allLettersList.length * Math.random())
            // console.log("index", randomIndex)
            output.push(allLettersList[randomIndex])
            allLettersList.splice(randomIndex, 1)
            // console.log(allLettersList.length)
        }
        return output
    }

    const [lettersList, setLettersList] = useState<TileProps[]>((getRandomLetters(21)).map((letter, key) => {
        const tile: TileProps = {
            id: key,
            onGridTile: false,
            letter: letter,
            visible: true,
            selected: false,
            pale: false,
            xState: false,
            draggable:false,
            handleClickLLTile: () => handleLLTileClick(key),
            handleClickGridTile: () => handleGridTileClick(key),
            handleClickGridTilePop: () => handleGridTilePop(key),
            handleMouseDown: () => {
            },
        }
        return tile
    }))

    const [isDraggable, setIsDraggable] = useState<boolean>(false)
    const [holdDownTimer, setHoldDownTimer] = useState <NodeJS.Timeout | null>(null)
    const [draggableTile, setDraggableTile] = useState<{row:number; col: number}| null>(null)

    // useEffect(() => {
    //     console.log("displayTileGrid.nextLoc", displayTileGrid.nextLoc)
    //     setTileGridPosition({
    //         x: gridPos2PixelPos(displayTileGrid.nextLoc.x + 0.5),
    //         y: gridPos2PixelPos(displayTileGrid.nextLoc.y + 0.5)
    //     })
    //
    // }, [displayTileGrid.nextLoc])

    useEffect(() => {
        displayTileGrid.grid.map(row => row.map(col => {
            if (col?.onGridTile) {
                console.log(col)
            }
            return {...col}
        }))
        // console.log("displayTileGrid.grid.flat()", displayTileGrid.grid.flat().filter(tile => tile))
        // console.log("displayTileGrid.grid", displayTileGrid.grid)

    }, [displayTileGrid])

    useEffect(() => {
        // console.log("displayTileGrid.direction", displayTileGrid.direction)
    }, [displayTileGrid.direction])

    useEffect(() => {

        // console.log("lettersList", lettersList)

    }, [lettersList])

    useEffect(() => {

        console.log("confirmedTileIds", confirmedTileIds)

    }, [confirmedTileIds])

    useEffect(() => {

        // console.log("selectedTileIds", selectedTileIds)

    }, [selectedTileIds])


    const handleLLTileClick = useCallback((id: number) => {
        // console.log("confirmedTileIds", confirmedTileIds)
        // console.log("selectedTileIds in handledClick", selectedTileIds)
        // console.log("displayTileGrid.grid.flat()", displayTileGrid.grid.flat().filter(tile=>tile != null))

        const tile = lettersList.find(tile => tile.id == id && !tile.pale)

        const paleTile: TileProps = {...tile!, onGridTile: true}
        setDisplayTileGrid((prevGrid) => {
            let nextPost
            const newGrid = {...prevGrid}
            console.log("newGrid", newGrid);
            // console.log("nextTileLoc", x, y);
            newGrid.grid[newGrid.nextLoc.y!][newGrid.nextLoc.x!] = paleTile
            switch (newGrid.direction) {
                case "TOP":
                    newGrid.nextLoc = {
                        ...prevGrid.nextLoc,
                        y: (prevGrid.nextLoc.y - 1)
                    }
                    break;

                case "BOTTOM":
                    nextPost = newGrid.nextLoc.y + 1
                    while (newGrid.grid[nextPost][newGrid.nextLoc.x]?.letter) {
                        nextPost++
                    }

                    newGrid.nextLoc = {
                        ...prevGrid.nextLoc,
                        y: (nextPost)
                    }
                    break;

                case "LEFT":
                    newGrid.nextLoc = {
                        ...prevGrid.nextLoc,
                        x: (prevGrid.nextLoc.x - 1)
                    }
                    break;

                default:
                    nextPost = newGrid.nextLoc.x + 1
                    while (newGrid.grid[newGrid.nextLoc.y][nextPost]?.letter) {
                        nextPost++
                    }

                    newGrid.nextLoc = {
                        ...prevGrid.nextLoc,
                        x: (nextPost)
                    }
                    break;

            }
            return newGrid; // Return the updated grid
        });

        // setSelectedTileIds((prevSet) => new Set([...prevSet, tile!.id]))
        setConfirmedTileIds((prevSet) => new Set<number>([...prevSet, tile!.id]))

    }, [displayTileGrid.grid]);


    const handleGridTileClick = useCallback((id: number) => {

        console.log("Gird Tile Clicked id:", id)
        setDisplayTileGrid((prevGrid) => {
            return {
                ...prevGrid,
                // grid: prevGrid.grid.map(row => row.map(tile => tile?.id == id ? xTileId == id ? null : ({setXTileId(id); return tile}) : tile))
                grid: prevGrid.grid.map(row => row.map(tile => {
                    // tile?.id == id ? null : tile
                    console.log("tile?.id == id", tile?.id == id)
                    return tile?.id == id ? {...tile, xState: true} : tile
                }))
            }
        })
        // setConfirmedTileIds((prevTileIds => new Set([...prevTileIds].filter((tileId) => tileId != id))))

    }, [displayTileGrid.grid]);

    // const handleTileClickDown = (row: number, col: number) => {
    //     const timeout = setTimeout(() => setIsDraggable(true), 500)
    //     setHoldTimeout(timeout);
    //     setDraggableTile({row, col});
    // }

    const handleGridTilePop = (id: number) => {

        console.log("Gird Tile Removed id:", id)
        setDisplayTileGrid((prevGrid) => {
            let colIndex = prevGrid.nextLoc.x
            let rowIndex = prevGrid.nextLoc.y

            const newGrid = prevGrid.grid.map((row, rowI) => row.map((tile, colI) => {
                // tile?.id == id ? null : tile
                console.log("tile?.id == id", tile?.id == id)
                if (tile?.id == id) {
                    colIndex = colI
                    rowIndex = rowI
                    return null
                } else {
                    return tile
                }
            }))

            return {
                ...prevGrid,
                // grid: prevGrid.grid.map(row => row.map(tile => tile?.id == id ? xTileId == id ? null : ({setXTileId(id); return tile}) : tile))
                grid: newGrid,
                nextLoc: {x: colIndex, y: rowIndex},
                prevLoc: {x: colIndex, y: rowIndex},
            }
        })
        setConfirmedTileIds((prevTileIds => new Set([...prevTileIds].filter((tileId) => tileId != id))))
    }

    const handleWordConfirm = () => {
        const newGrid = displayTileGrid.grid.map(row => row.map(tile => {
            return tile ? {...tile, pale: false} as TileProps : null
        }))
        console.log("newGrid", newGrid)

        setDisplayTileGrid((prev): DisplayGrid => {
            return {...prev, grid: newGrid, prevLoc: prev.nextLoc}
        });

        setConfirmedTileIds((prevSet) => new Set<number>([...prevSet, ...selectedTileIds]))
        setSelectedTileIds(new Set<number>)

    }

    const handleWordCancel = () => {
        const newGrid = displayTileGrid.grid.map(row => row.map(tile => {
            if (tile && selectedTileIds.has(tile.id)) {
                return null
            } else {
                return {...tile} as TileProps
            }
        }))
        console.log("newGrid", newGrid)

        setDisplayTileGrid((prev): DisplayGrid => {
            return {...prev, grid: newGrid, nextLoc: {...prev.prevLoc}}
        });

        setSelectedTileIds(new Set<number>)

    }

    const handleBackSpace = () => {
        // switch (displayTileGrid.direction) {
        //     case "RIGHT":
        //         xyToRemove = {...displayTileGrid.nextLoc, x: displayTileGrid.nextLoc.x - 1}
        //         break
        // }

        console.log("displayTileGrid", displayTileGrid)

        setDisplayTileGrid(prev => {
            const newGrid = prev.grid
            let xyToRemove = displayTileGrid.nextLoc
            let idToRemove = displayTileGrid.grid[xyToRemove.x][xyToRemove.y]?.id

            switch (displayTileGrid.direction) {
                case "RIGHT":
                    xyToRemove = {...displayTileGrid.nextLoc, x: displayTileGrid.nextLoc.x - 1}
                    break
                case "LEFT":
                    xyToRemove = {...displayTileGrid.nextLoc, x: displayTileGrid.nextLoc.x + 1}
                    break
                case "BOTTOM":
                    xyToRemove = {...displayTileGrid.nextLoc, y: displayTileGrid.nextLoc.y - 1}
                    break
                case "TOP":
                    xyToRemove = {...displayTileGrid.nextLoc, y: displayTileGrid.nextLoc.y + 1}
                    break
            }

            idToRemove = newGrid[xyToRemove.y][xyToRemove.x]?.id
            newGrid[xyToRemove.y][xyToRemove.x] = null
            setConfirmedTileIds((prevIds) => {
                const newIds = prevIds
                newIds.delete(idToRemove!)
                return newIds
            })

            return ({...prev, grid: newGrid, nextLoc: {x: xyToRemove.x, y: xyToRemove.y}})
        })

    }

    const handleBackSpaceOld = () => {

        const newSelectedTilesIdsArray = Array.from(selectedTileIds)
        const tileToRemove = newSelectedTilesIdsArray.pop()

        const newGrid = displayTileGrid.grid.map(row => row.map(tile => {
            if (tile && tileToRemove == tile.id) {
                return null
            } else {
                return {...tile} as TileProps
            }
        }))
        console.log("newGrid", newGrid)

        setDisplayTileGrid((prev): DisplayGrid => {
            return {
                ...prev, grid: newGrid,
                nextLoc: prev.direction == 'LEFT' ? {...prev.nextLoc, x: prev.nextLoc.x + 1} :
                    prev.direction == 'BOTTOM' ? {...prev.nextLoc, y: prev.nextLoc.y - 1} :
                        prev.direction == 'TOP' ? {...prev.nextLoc, y: prev.nextLoc.y + 1} :
                            {...prev.nextLoc, x: prev.nextLoc.x - 1}
            }
        });

        setSelectedTileIds(new Set<number>(newSelectedTilesIdsArray))

    }

    const handleDirectionClick = () => {
        console.log("displayTileGrid.nextLoc", displayTileGrid.nextLoc)
        console.log("displayTileGrid.prevLoc", displayTileGrid.prevLoc)
        // Incomplete word
        setDisplayTileGrid((prevDisplayGrid) => {
            const newGrid = prevDisplayGrid.grid
            let firstTile: { row: number, col: number } | undefined = undefined
            // TODO: IMPLEMENT NEW DIRECTION
            for (let row = 0; row < prevDisplayGrid.grid.length; row++) {
                for (let col = 0; col < prevDisplayGrid.grid[row].length; col++) {
                    if (prevDisplayGrid.grid[row][col]?.pale) {
                        if (!firstTile) {
                            firstTile = {row: row, col: col}
                            // console.log("firstTile", firstTile, prevDisplayGrid.grid[row][col]?.letter)
                        } else if (firstTile.row == row && prevDisplayGrid.direction == 'RIGHT') {
                            // console.log("found word tile", prevDisplayGrid.grid[row][col]?.letter)
                            newGrid[(col - firstTile.col) + firstTile.row][firstTile.col] = prevDisplayGrid.grid[row][col]
                            newGrid[row][col] = null
                        } else if (firstTile.col == col && prevDisplayGrid.direction == 'BOTTOM') {
                            // console.log("found word tile", prevDisplayGrid.grid[row][col]?.letter)
                            newGrid[firstTile.row][(row - firstTile.row) + firstTile.col] = prevDisplayGrid.grid[row][col]
                            newGrid[row][col] = null
                        }
                    }
                }
            }
            // console.log("prevDisplayGrid.nextLoc", prevDisplayGrid.nextLoc)

            return ({
                // Set the nextTile placement location
                ...prevDisplayGrid,
                grid: newGrid,
                // prevLoc: prevDisplayGrid.prevLoc,
                nextLoc: firstTile ? prevDisplayGrid.direction == "RIGHT" ? {
                    y: (prevDisplayGrid.nextLoc.x - firstTile.col) + firstTile?.row,
                    x: firstTile?.col
                } : {
                    y: firstTile?.row,
                    x: (prevDisplayGrid.nextLoc.y - firstTile.row) + firstTile?.col
                } : prevDisplayGrid.nextLoc,

                direction: prevDisplayGrid.direction == "RIGHT" ? "BOTTOM" : "RIGHT"
            })
        })

    }

    const handleEmptyTileClick = (row: number, col: number) => {
        // handleWordConfirm()

        if (!displayTileGrid.grid[row][col]?.letter) {
            console.log("empty tile clicked")
            handleWordConfirm()
            setDisplayTileGrid((currentGrid) => {
                // console.log("tileToLeft", currentGrid.grid[row][col - 1]?.id)
                // console.log("tileAbove", currentGrid.grid[row - 1][col]?.id)
                // console.log("tileToRight", currentGrid.grid[row][col + 1]?.id)
                // console.log("tileBelow", currentGrid.grid[row + 1][col]?.id)

                const tileToLeft: boolean = !!currentGrid.grid[row][col - 1]?.id
                const tileAbove: boolean = !!currentGrid.grid[row - 1][col]?.id
                const tileToRight: boolean = !!currentGrid.grid[row][col + 1]?.id
                const tileBelow: boolean = !!currentGrid.grid[row + 1][col]?.id

                return {
                    ...currentGrid,
                    nextLoc: {x: col, y: row},
                    prevLoc: {x: col, y: row},
                    direction: tileAbove ? 'BOTTOM' : 'RIGHT'
                }
            })
        }
    }


    return (

        <>
            <div>
                <GameBoard grid={displayTileGrid} onEmptyTileClick={handleEmptyTileClick}
                           onTileClickDown={()=>{}}
                />
                <div className="flex flex-row p-3">
                    <div className="flex flex-row flex-wrap">
                        {lettersList.map((tile, key) => (
                            <Tile
                                {...tile}
                                selected={selectedTileIds.has(tile.id)}
                                pale={confirmedTileIds.has(tile.id)}
                                onGridTile={false}
                                key={key}
                            />
                        ))}

                    </div>
                    <div className="flex flex-col justify-center">
                        <button className="size-9" onClick={handleDirectionClick}>
                            <div
                                className="flex justify-center items-center border border-2 border-black rounded-badge size-7 m-auto">
                                <PiArrowsClockwiseBold size={"16px"}/></div>
                        </button>
                        {/*<button onClick={handleDirectionClick}>*/}
                        {/*    <FaArrowRotateLeft size={"24px"}/>*/}
                        {/*</button>*/}
                        <button className="size-9" onClick={handleBackSpace}>
                            <IoArrowBackCircleOutline className="m-auto" size={"34px"}/>
                        </button>
                        {/*<button className="size-9" onClick={handleWordCancel}>*/}
                        {/*    <IoIosCloseCircleOutline className="m-auto" size={"34px"}/>*/}
                        {/*</button>*/}
                        {/*<button className="size-9" onClick={handleWordConfirm}>*/}
                        {/*    <IoCheckmarkCircleOutline className="m-auto" size={"34px"}/>*/}
                        {/*</button>*/}
                    </div>
                </div>

            </div>
        </>
    )
}

export default SinglePLayer