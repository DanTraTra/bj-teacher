import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import Tile from '../components/comp_orangagrams/tile'
import GameBoard, {is2DArrayEmpty} from "./Gameboard";
import {TileProps} from "../components/comp_orangagrams/tile";
import {
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
    const gridSize = 49

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
            handleClickTile: () => handleTileClick(key),
            handleTilePop: () => handleTilePop(key),
        }
        return tile
    }))


    const getTileFromGrid = (id: number) =>
    {
        const tile =  displayTileGrid.grid.map(row => row.filter((tile) => tile?.id == id))
        return tile
    }


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
    }, [displayTileGrid])

    useEffect(() => {
        console.log("displayTileGrid.direction", displayTileGrid.direction)
    }, [displayTileGrid.direction])

    useEffect(() => {

        // console.log("lettersList", lettersList)

    }, [lettersList])

    useEffect(() => {

        // console.log("confirmedTileIds", confirmedTileIds)

    }, [confirmedTileIds])

    useEffect(() => {

        // console.log("selectedTileIds", selectedTileIds)

    }, [selectedTileIds])


    const handleTileClick = (id: number) => {
        // console.log("confirmedTileIds", confirmedTileIds)
        // console.log("selectedTileIds in handledClick", selectedTileIds)
        const tileFromGrid = displayTileGrid.grid.flat().filter(tile=>tile?.id == id)
        const tile = tileFromGrid.length ? tileFromGrid[0] : lettersList.filter(tile => tile.id == id && !tile.pale)[0]

        console.log("tile clicked ", tile)
        console.log("direction?", displayTileGrid.direction)

        if (!tile!.onGridTile) {
            console.log("!tile.onGridTile", !tile!.onGridTile)
            const paleTile = {...tile!, pale: true, onGridTile: true}
            setDisplayTileGrid((prevGrid) => {
                const newGrid = {...prevGrid}
                console.log("newGrid", newGrid);
                // console.log("nextTileLoc", x, y);
                newGrid.grid[newGrid.nextLoc.y!][newGrid.nextLoc.x!] = paleTile
                newGrid.nextLoc = newGrid.direction == "RIGHT" ?
                    {
                        ...prevGrid.nextLoc,
                        x: (prevGrid.nextLoc.x + 1)
                    } : newGrid.direction == "BOTTOM" ?
                        {
                            ...prevGrid.nextLoc,
                            y: (prevGrid.nextLoc.y + 1)
                        } : newGrid.direction == "LEFT" ?
                            {
                                ...prevGrid.nextLoc,
                                x: (prevGrid.nextLoc.x - 1)
                            } : {
                                ...prevGrid.nextLoc,
                                y: (prevGrid.nextLoc.y - 1)
                            }
                // newGrid.nextLoc = nextTileRight ? {...prevGrid.nextLoc, x: (prevGrid.nextLoc.x + 1)} : {...prevGrid.nextLoc, y: (prevGrid.nextLoc.y + 1)}

                return newGrid; // Return the updated grid
            });

            setSelectedTileIds((prevSet) => new Set([...prevSet, tile!.id]))

        } else {
            setDisplayTileGrid((prevGrid) => {
                return {...prevGrid,
                grid: prevGrid.grid.map(row=>row.filter(tile => tile?.id != id))}
            })
        }
    };

    const handleTileX = (tile: TileProps) => {

    }

    const handleTilePop = (id: number) => {

        console.log("in handleTilePop")
        console.log("selectedTileIds", selectedTileIds)
        console.log("confirmedTileIds", confirmedTileIds)
        console.log("oldGrid", displayTileGrid)
        // const newGrid = displayTileGrid.grid.map(row => row.map(currentTile => {
        //     return currentTile?.id == tile.id ? null : currentTile
        // }))
        // console.log("newGrid", newGrid)
        // setDisplayTileGrid((prevGrid) => ({...prevGrid, grid: newGrid}))

        // setConfirmedTileIds(prevIds => {
        //     const newIds = new Set<number>(prevIds)
        //     newIds.delete(tile.id)
        //     return newIds
        // })
        // setSelectedTileIds(prevIds => {
        //     const newIds = new Set<number>(prevIds)
        //     newIds.delete(tile.id)
        //     return newIds
        // })
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

    const handleDirectionClick = () => {
        console.log("displayTileGrid.nextLoc", displayTileGrid.nextLoc)
        console.log("displayTileGrid.prevLoc", displayTileGrid.prevLoc)
        // if (is2DArrayEmpty(displayTileGrid.grid) // No tiles on board
        //     // || (displayTileGrid.nextLoc.x == displayTileGrid.prevLoc.x && displayTileGrid.nextLoc.y == displayTileGrid.prevLoc.y) // At least one word confirmed and no incomplete words
        // ) {
        //     // TODO: IMPLEMENT NEW DIRECTION
        //     setDisplayTileGrid((prevGrid) => (prevGrid.direction == 'RIGHT' ?
        //         {
        //             ...prevGrid,
        //             direction: 'BOTTOM',
        //         } : prevGrid.direction == 'BOTTOM' ?
        //             {
        //                 ...prevGrid,
        //                 direction: 'RIGHT',
        //             } :
        //             {
        //                 ...prevGrid,
        //                 direction: 'RIGHT',
        //             }
        //             )
        //     )
        // }

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
        console.log("empty tile clicked")
        setDisplayTileGrid((currentGrid) => {
            // console.log("tileToLeft", currentGrid.grid[row][col - 1])
            // console.log("tileAbove", currentGrid.grid[row - 1][col])
            // console.log("tileToRight", currentGrid.grid[row][col + 1])
            // console.log("tileBelow", currentGrid.grid[row + 1][col])

            const tileToLeft: boolean = !!currentGrid.grid[row][col - 1]
            const tileAbove: boolean = !!currentGrid.grid[row - 1][col]
            const tileToRight: boolean = !!currentGrid.grid[row][col + 1]
            const tileBelow: boolean = !!currentGrid.grid[row + 1][col]

            return {
                ...currentGrid,
                nextLoc: {x: col, y: row},
                prevLoc: {x: col, y: row},
                direction: tileToLeft ? 'RIGHT' : tileAbove ? 'BOTTOM' : tileToRight ? 'LEFT' : 'TOP'
            }
        })
    }


    return (

        <>
            <div>
                <GameBoard grid={displayTileGrid} onEmptyTileClick={handleEmptyTileClick}/>
                <div className="flex flex-row p-3">
                    <div className="flex flex-row flex-wrap">
                        {lettersList.map((tile, key) => (
                            <Tile
                                {...tile}
                                selected={selectedTileIds.has(tile.id)}
                                pale={confirmedTileIds.has(tile.id)}
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
                        <button className="size-9" onClick={handleWordConfirm}>
                            <IoCheckmarkCircleOutline className="m-auto" size={"34px"}/>
                        </button>
                        <button className="size-9" onClick={handleWordCancel}>
                            <IoIosCloseCircleOutline className="m-auto" size={"34px"}/>
                        </button>
                    </div>
                </div>

            </div>
        </>
    )
}

export default SinglePLayer