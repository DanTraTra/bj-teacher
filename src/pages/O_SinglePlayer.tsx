import React, {useCallback, useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import Tile, {TileProps} from '../components/comp_orangagrams/tile'
import GameBoard from "./Gameboard";
import {IoArrowBackCircleOutline} from "react-icons/io5";
import {
    PiArrowFatLinesDownFill,
    PiArrowFatLinesLeftFill,
    PiArrowFatLinesRightFill, PiArrowFatLinesUpFill,
    PiArrowsClockwiseBold
} from "react-icons/pi";
import {HTML5Backend} from 'react-dnd-html5-backend';
import {
    DndContext,
    DragEndEvent,
    DragStartEvent,
    closestCenter, useDroppable, rectIntersection,
    PointerSensor, TouchSensor, useSensor, useSensors, Collision
} from '@dnd-kit/core';
import {CollisionDescriptor, CollisionDetection, UniqueIdentifier} from '@dnd-kit/core';

import {Simulate} from "react-dom/test-utils";
import dragStart = Simulate.dragStart;

const createEmptyGrid = (rows: number, cols: number) => {
    // Array.from({length: rows}, () => Array(cols).fill(null));
    let result: (TileProps|null)[][] = [];
    let currentNumber = 1;

    for (let i = 0; i < rows; i++) {
        let row: (TileProps|null)[] = [];
        for (let j = 0; j < cols; j++) {

                row.push({
                    id: currentNumber,
                    onGridTile: false,
                    // letter: `${currentNumber}`,
                    letter: null,
                    visible: true,
                    selected: false,
                    pale: false,
                    xState: false,
                    draggable: false,
                    row: i,
                    col: j,
                });
                // row.push(null)

            currentNumber++
        }
        result.push(row);
    }

    return result;
}
// Array.from({length: rows}, () => Array(cols).fill(null));


type dir = 'TOP' | 'RIGHT' | 'BOTTOM' | 'LEFT'
const Directions: dir[] = ['TOP', 'RIGHT', 'BOTTOM', 'LEFT']

export interface DisplayGrid {
    grid: (TileProps | null)[][],
    direction: dir
    nextLoc: {
        row: number,
        col: number
    },
    prevLoc: {
        row: number,
        col: number
    },
}

function SinglePLayer() {
    const navigate = useNavigate();
    const gridSize: number = 10

    interface loc {
        x: number,
        y: number
    }

    const initialStartingLoc = {row: Math.floor(gridSize / 2), col: Math.floor(gridSize / 2)}

    const initialGrid: DisplayGrid = {
        grid: createEmptyGrid(gridSize, gridSize),
        direction: 'RIGHT',
        nextLoc: initialStartingLoc,
        prevLoc: initialStartingLoc,
    }

    const [displayTileGrid, setDisplayTileGrid] = useState<DisplayGrid>(initialGrid)
    const [selectedTileIds, setSelectedTileIds] = useState<Set<number>>(new Set([]))
    const [confirmedTileIds, setConfirmedTileIds] = useState<Set<number>>(new Set([]))
    const [gridTileDragStart, setGridTileDragStart] = useState<boolean>(false)
    const [clicked, setClicked] = useState<boolean>(false)


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

    const allLettersList: string[] = Object.entries(allLettersDict).flatMap(([letter, count], id) => Array(count).fill(letter))
    const [totalLettersPool, setTotalLettersPool] = useState<TileProps[]>(
        allLettersList.map((letter, key) => ({
            id: key,
            onGridTile: false,
            letter: letter,
            visible: true,
            selected: false,
            pale: false,
            xState: false,
            draggable: false,
            row: -1,
            col: -1,
        }))
    )


    const getRandomLetters = (count: number): TileProps[] => {
        let output: TileProps[] = []
        for (let i = 0; i < count; i++) {
            const randomIndex = Math.floor(totalLettersPool.length * Math.random())
            // // console.log("index", randomIndex)
            output.push(totalLettersPool[randomIndex])
            totalLettersPool.splice(randomIndex, 1)
            // // console.log(allLettersList.length)
        }
        return output
    }

    const [lettersList, setLettersList] = useState<TileProps[]>(getRandomLetters(21))


    useEffect(() => {
        displayTileGrid.grid.map(row => row.map(col => {
            if (col?.onGridTile) {
                // // console.log(col)
            }
            return {...col}
        }))
        // // console.log("displayTileGrid.grid.flat()", displayTileGrid.grid.flat().filter(tile => tile))
        // // console.log("displayTileGrid.grid", displayTileGrid.grid)

    }, [displayTileGrid])

    useEffect(() => {
        // // console.log("displayTileGrid.direction", displayTileGrid.direction)
    }, [displayTileGrid.direction])

    useEffect(() => {

        console.log("tileDragStart", gridTileDragStart)

    }, [gridTileDragStart])


    const addTileToGrid = (id: number, toGridPos: { row: number, col: number }, fromLettersList: boolean) => {
        // console.log(`Tile ${id} being placed at row: ${toGridPos.row} col: ${toGridPos.col}`)

        const tile = fromLettersList ? lettersList.find(tile => tile.id == id && !tile.pale) : displayTileGrid.grid.flat().find(tile => tile?.id == id && !tile?.pale)
        if (!tile) {
            return
        }

        const addedTile: TileProps = {
            ...tile,
            onGridTile: true,
            row: toGridPos.row!,
            col: toGridPos.col!
        }

        const tileToReplace = displayTileGrid.grid.flat().find(tile => tile?.row == toGridPos.row && tile?.col == toGridPos.col)
        // console.log("tileToReplace", tileToReplace)
        if (fromLettersList) {
            removeTileFromGrid(tileToReplace ? tileToReplace.id : null) // Add tile to letters list if it's been swapped
            setLettersList(prevState => [...prevState].filter(tile => tile.id != id!))
        }

        setDisplayTileGrid((prevGrid) => {
            let nextPos
            const newGrid = {...prevGrid}
            // console.log("newGrid", newGrid);
            // // console.log("nextTileLoc", x, y);
            newGrid.grid[toGridPos.row!][toGridPos.col!] = addedTile
            if (!fromLettersList) {
                newGrid.grid[tile.row!][tile.col!] = tileToReplace ? {
                    ...tileToReplace,
                    row: tile.row,
                    col: tile.col
                } : {
                    ...tile,
                    letter: null,
                    row: tile.row,
                    col: tile.col,
                }
            }

            switch (newGrid.direction) {
                case "TOP":
                    nextPos = toGridPos.row - 1
                    while (newGrid.grid[nextPos][toGridPos.col]?.letter) {
                        nextPos--
                    }

                    newGrid.nextLoc = {
                        row: (nextPos),
                        col: toGridPos.col,
                    }
                    break;

                case "BOTTOM":
                    nextPos = toGridPos.row + 1
                    while (newGrid.grid[nextPos][toGridPos.col]?.letter) {
                        // console.log("direction bottom", newGrid.grid[nextPos][newGrid.nextLoc.col]?.letter)
                        nextPos++
                    }

                    newGrid.nextLoc = {
                        row: (nextPos),
                        col: toGridPos.col,
                    }
                    break;

                case "LEFT":
                    nextPos = toGridPos.col - 1
                    while (newGrid.grid[toGridPos.row][nextPos]?.letter) {
                        nextPos--
                    }

                    newGrid.nextLoc = {
                        row: toGridPos.row,
                        col: (nextPos)
                    }
                    break;
                default:
                    nextPos = toGridPos.col + 1
                    while (newGrid.grid[toGridPos.row][nextPos]?.letter) {
                        nextPos++
                    }

                    newGrid.nextLoc = {
                        row: toGridPos.row,
                        col: (nextPos)
                    }
                    break;

            }
            return newGrid; // Return the updated grid
        });

        // setSelectedTileIds((prevSet) => new Set([...prevSet, tile!.id]))
        // setConfirmedTileIds((prevSet) => new Set<number>([...prevSet, tile!.id]))

    };


    const handleGridTileClick = useCallback((id: number) => {

        // console.log("Gird Tile Clicked id:", id)
        setDisplayTileGrid((prevGrid) => {
            return {
                ...prevGrid,
                // grid: prevGrid.grid.map(row => row.map(tile => tile?.id == id ? xTileId == id ? null : ({setXTileId(id); return tile}) : tile))
                grid: prevGrid.grid.map(row => row.map(tile => {
                    // tile?.id == id ? null : tile
                    // console.log("tile?.id == id", tile?.id == id)
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

        // console.log("Gird Tile Removed id:", id)
        let newTile: TileProps | null = null
        setDisplayTileGrid((prevGrid) => {
            let colIndex = prevGrid.nextLoc.row
            let rowIndex = prevGrid.nextLoc.col

            const newGrid = prevGrid.grid.map((row, rowI) => row.map((tile, colI) => {
                // tile?.id == id ? null : tile
                if (tile?.id == id) {
                    colIndex = colI
                    rowIndex = rowI
                    if (tile?.xState) {
                        // Remove the tile
                        newTile = {...tile}
                        // // console.log("popping tile", newTile)
                        // setLettersList((prevTiles) => [...prevTiles, {...newTile!, xState: false}])
                        return {...tile, letter: null}
                    } else {
                        // Add X to tile
                        newTile = null
                        return {...tile, xState: true}
                    }
                } else {
                    return tile
                }
            }))

            return {
                ...prevGrid,
                grid: newGrid,
            }
        })
        // console.log("Adding tile", newTile)
        // const newTile = displayTileGrid.grid.flat().find((tile) => tile !== null && tile.id === id)
        // if (newTile) {
        //     setLettersList((prevTiles) => [...prevTiles, {...newTile!, xState: false}])
        // }

        // setConfirmedTileIds((prevTileIds => new Set([...prevTileIds].filter((tileId) => tileId != id))))
    }

    const handleWordConfirm = () => {
        const newGrid = displayTileGrid.grid.map(row => row.map(tile => {
            return tile ? {...tile, pale: false} as TileProps : null
        }))
        // console.log("newGrid", newGrid)

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
        // console.log("newGrid", newGrid)

        setDisplayTileGrid((prev): DisplayGrid => {
            return {...prev, grid: newGrid, nextLoc: {...prev.prevLoc}}
        });

        setSelectedTileIds(new Set<number>)

    }

    const removeTileFromGrid = (id: number | null) => {
        // switch (displayTileGrid.direction) {
        //     case "RIGHT":
        //         xyToRemove = {...displayTileGrid.nextLoc, x: displayTileGrid.nextLoc.x - 1}
        //         break
        // }
        if (id == null) {
            return
        }
        // console.log("displayTileGrid", displayTileGrid)

        setDisplayTileGrid(prev => {
            const newGrid = prev.grid
            let xyToRemove: { row: number, col: number }
            let idToRemove = id

            const tileToRemove = newGrid.flat().find((tile) => tile !== null && tile.id === idToRemove)
            // console.log("newTile", tileToRemove)
            // console.log("idToRemove", idToRemove)

            if (tileToRemove) {
                setLettersList((prevTiles) => [...prevTiles, tileToRemove])
                newGrid[tileToRemove.row][tileToRemove.col] = {...tileToRemove, letter: null}

                return ({...prev, grid: newGrid, nextLoc: {row: tileToRemove.row, col: tileToRemove.col}})
            } else {
                return prev
            }
        })

    }

    const handleBackButtonClick = () => {

        let idToRemove
        switch (displayTileGrid.direction) {
            case "RIGHT":
                idToRemove = displayTileGrid.grid[displayTileGrid.nextLoc.row][displayTileGrid.nextLoc.col - 1]?.id
                break
            case "LEFT":
                idToRemove = displayTileGrid.grid[displayTileGrid.nextLoc.row][displayTileGrid.nextLoc.col + 1]?.id
                break
            case "BOTTOM":
                idToRemove = displayTileGrid.grid[displayTileGrid.nextLoc.row - 1][displayTileGrid.nextLoc.col]?.id
                break
            case "TOP":
                idToRemove = displayTileGrid.grid[displayTileGrid.nextLoc.row + 1][displayTileGrid.nextLoc.col]?.id
                break
        }
        if (idToRemove) {
            removeTileFromGrid(idToRemove)
        }
    }

    const handleDirectionClick = () => {
        // console.log("displayTileGrid.nextLoc", displayTileGrid.nextLoc)
        // console.log("displayTileGrid.prevLoc", displayTileGrid.prevLoc)
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
                            // // console.log("firstTile", firstTile, prevDisplayGrid.grid[row][col]?.letter)
                        } else if (firstTile.row == row && prevDisplayGrid.direction == 'RIGHT') {
                            // // console.log("found word tile", prevDisplayGrid.grid[row][col]?.letter)
                            newGrid[(col - firstTile.col) + firstTile.row][firstTile.col] = prevDisplayGrid.grid[row][col]
                            newGrid[row][col] = null
                        } else if (firstTile.col == col && prevDisplayGrid.direction == 'BOTTOM') {
                            // // console.log("found word tile", prevDisplayGrid.grid[row][col]?.letter)
                            newGrid[firstTile.row][(row - firstTile.row) + firstTile.col] = prevDisplayGrid.grid[row][col]
                            newGrid[row][col] = null
                        }
                    }
                }
            }
            // // console.log("prevDisplayGrid.nextLoc", prevDisplayGrid.nextLoc)

            return ({
                // Set the nextTile placement location
                ...prevDisplayGrid,
                grid: newGrid,
                // prevLoc: prevDisplayGrid.prevLoc,
                nextLoc: firstTile ? prevDisplayGrid.direction == "RIGHT" ? {
                    col: (prevDisplayGrid.nextLoc.row - firstTile.col) + firstTile?.row,
                    row: firstTile?.col
                } : {
                    col: firstTile?.row,
                    row: (prevDisplayGrid.nextLoc.col - firstTile.row) + firstTile?.col
                } : prevDisplayGrid.nextLoc,

                direction: Directions[(Directions.indexOf(prevDisplayGrid.direction) + 1) % 4]
            })
        })

    }

    const handleEmptyTileClick = (row: number, col: number) => {
        // handleWordConfirm()

        if (!displayTileGrid.grid[row][col]?.letter) {
            // console.log("empty tile clicked")
            // handleWordConfirm()
            setDisplayTileGrid((currentGrid) => {
                // // console.log("tileToLeft", currentGrid.grid[row][col - 1]?.id)
                // // console.log("tileAbove", currentGrid.grid[row - 1][col]?.id)
                // // console.log("tileToRight", currentGrid.grid[row][col + 1]?.id)
                // // console.log("tileBelow", currentGrid.grid[row + 1][col]?.id)

                const tileToLeft: boolean = !!currentGrid.grid[row][col - 1]?.id
                const tileAbove: boolean = !!currentGrid.grid[row - 1][col]?.id
                const tileToRight: boolean = !!currentGrid.grid[row][col + 1]?.id
                const tileBelow: boolean = !!currentGrid.grid[row + 1][col]?.id
                let nextDirection: dir
                if (tileToLeft) {
                    nextDirection = 'RIGHT'
                } else if (tileAbove) {
                    nextDirection = 'BOTTOM'
                } else if (tileBelow) {
                    nextDirection = 'TOP'
                } else if (tileToRight) {
                    nextDirection = 'LEFT'
                } else {
                    nextDirection = 'RIGHT'
                }

                return {
                    ...currentGrid,
                    nextLoc: {row: row, col: col},
                    prevLoc: {row: row, col: col},
                    direction: nextDirection
                }
            })
        }
    }

    const [draggedTileID, setDraggedTileID] = useState<number | null>(null)
    const [draggedTile, setDraggedTile] = useState<TileProps | null>(null)

    const handleTileDragStart = (event: DragStartEvent) => {
        console.log("gridTileDragStart", gridTileDragStart)
        setDraggedTileID(Number(event.active.id))
        setGridTileDragStart(true)
    }

    useEffect(() => {
        if (clicked) {
            setTimeout(() => {
                setClicked(false)
            }, 300)
        }
    }, [clicked])

    const handleTileClick = (tile: TileProps | undefined | null, fromLettersList: boolean) => {
        setClicked(true)
        if (!tile) {
            return
        }
        // Not dragging but clicking
        // console.log("Tile Clicked")
        if (!fromLettersList) {
            handleGridTilePop(tile.id)
            if (tile?.xState) {
                setLettersList((prevTiles) => [...prevTiles, {...tile!, xState: false}])
            }
        } else {
            addTileToGrid(tile.id, displayTileGrid.nextLoc, true)
        }

    }

    const handleTileDragEnd = (event: DragEndEvent) => {
        const {active, over} = event
        setGridTileDragStart(false)
        console.log("handleTileDrop draggedTileID", draggedTileID)
        // console.log("handleTileDrop lettersList", lettersList)

        const draggedTileFromLL = lettersList.find((tile) => tile.id == draggedTileID)
        const draggedTileFromGrid = displayTileGrid.grid.flat().find((tile) => tile?.id == draggedTileID)

        if (!draggedTileFromLL && !draggedTileFromGrid) {
            console.log("not found in LL or grid")
            return
        }
        if (!over) {
            // Not dragging but clicking
            // console.log("draggedTileFromLL", draggedTileFromLL)
            // console.log("draggedTileFromGrid", draggedTileFromGrid)
            if (draggedTileFromGrid) {
                // handleTileClick(draggedTileFromGrid, false)
            } else if (draggedTileFromLL) {
                // handleTileClick(draggedTileFromLL, true)
            }
            // console.log("Tile missed drop")
            return
        }

        const overRow: number = Math.floor(Number(over.id) / gridSize)
        const overCol: number = Math.floor(Number(over.id) % gridSize)
        console.log("dropping at", overRow, overCol)
        console.log("over.id", over.id)

        if (over.id >= 10000 || event.collisions?.some(collision => collision.id >= 10000)) {
            // console.log("over.id", over.id)
            console.log("missed empty tile")
            return
        }

        if (draggedTileFromLL) {
            // console.log("letter from list")
            addTileToGrid(draggedTileFromLL.id, {row: overRow, col: overCol}, true)

        } else if (draggedTileFromGrid) {

            addTileToGrid(draggedTileFromGrid.id, {row: overRow, col: overCol}, false)

            // console.log("Rearranging grid")
        }

        console.log(displayTileGrid.grid)

    }

    interface lettersListTileProps {
        id: number;
        t: TileProps | null;
    }

    function LettersListTile({id, t}: lettersListTileProps) {

        const {setNodeRef} = useDroppable({
            id: id,
        });

        return (
            <div
                ref={setNodeRef}
                className="size-10 m-0.5 text-center flex flex-col items-center justify-center"
            >
                {t ?
                    <Tile
                        {...t}
                        // selected={selectedTileIds.has(tile.id)}
                        // pale={confirmedTileIds.has(tile.id)}
                        // handleTileDragStart={handleTileDragStart}
                        // xState={true}
                        onGridTile={false}
                        key={id}
                    /> : null}

            </div>
        )
    }


    interface BottomPanelProps {
        id: number;
    }

    function BottomPanel({id}: BottomPanelProps) {

        const {setNodeRef} = useDroppable({
            id: id,
        });

        return (
            <div className="w-full h-full" id={"bottomPanel"}>
                <div className="flex flex-row h-full p-3 z-50"
                     ref={setNodeRef}>
                    <div className="flex flex-row flex-wrap w-[90%]">
                        {lettersList.map((tile, id_tile) => (
                            <div onClick={() => handleTileClick(tile, true)} key={id_tile}>
                                <LettersListTile
                                    id={(id * id_tile)}
                                    t={tile}
                                    key={id_tile}
                                />
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-col justify-center">
                        <button className="size-9" onClick={handleDirectionClick}>
                            <div
                                className="flex justify-center items-center border-2 border-black rounded-badge size-7 m-auto">
                                <PiArrowsClockwiseBold size={"16px"}/></div>
                        </button>
                        {/*<button onClick={handleDirectionClick}>*/}
                        {/*    <FaArrowRotateLeft size={"24px"}/>*/}
                        {/*</button>*/}
                        <button className="size-9" onClick={handleBackButtonClick}>
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
        )
    }

    //
    // const prioritizeTopLayer: CollisionDetection = ({
    //                                                     droppableContainers,
    //                                                     pointerCoordinates,
    //                                                 }) => {
    //     if (!pointerCoordinates) return [];
    //
    //     // console.log("droppableContainers", droppableContainers[0])
    //
    //
    //     const collisions = droppableContainers
    //         .filter((container) => container.rect.current !== null)
    //         .map((container) => {
    //             const zIndex = parseInt(
    //                 window
    //                     .getComputedStyle(container.node.current!)
    //                     .getPropertyValue('z-index') || '0',
    //                 10);
    //
    //             return {
    //                 id: container.id,
    //                 data: {zIndex}, // Add data property as required
    //             };
    //
    //         })
    //         .sort((a, b) => b.data.zIndex - a.data.zIndex); // Sort by zIndex descending
    //
    //     return collisions;
    // };

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 1, // Minimum distance in pixels to move before drag starts
            },
        })
    );

    return (

        <div className="overflow-hidden">
            <DndContext
                // sensors={sensors}
                onDragStart={handleTileDragStart}
                onDragEnd={handleTileDragEnd}
                // onDragMove={(event) => // console.log('onDragMove:', event)}
                // onDragOver={(event) => setRecentCollisions(event.collisions)}
                collisionDetection={rectIntersection}
            >
                <GameBoard grid={displayTileGrid} onEmptyTileClick={handleEmptyTileClick}
                           tileDragStart={gridTileDragStart}
                           onTileDrop={() => {
                           }}/>

                <BottomPanel id={10000}/>
                <div>{`dragStart: ${dragStart}`}</div>
            </DndContext>
            <div className="font-black">{`${clicked}`}</div>
        </div>
    )
}

export default SinglePLayer