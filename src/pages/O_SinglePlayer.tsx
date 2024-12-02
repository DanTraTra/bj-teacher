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
    const gridSize: number = 20

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
    const [gridTileDragStart, setGridTileDragStart] = useState<boolean>(false)
    const [recentCollisions, setRecentCollisions] = useState<Collision[] | null>([])

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
            handleClickLLTile: () => handleLLTileClick(key),
            handleClickGridTile: () => handleGridTileClick(key),
            handleClickGridTilePop: () => handleGridTilePop(key),
            handleTileDragStart: () => {
            }
        }))
    )


    const getRandomLetters = (count: number): TileProps[] => {
        let output: TileProps[] = []
        for (let i = 0; i < count; i++) {
            const randomIndex = Math.floor(totalLettersPool.length * Math.random())
            // console.log("index", randomIndex)
            output.push(totalLettersPool[randomIndex])
            totalLettersPool.splice(randomIndex, 1)
            // console.log(allLettersList.length)
        }
        return output
    }

    const [lettersList, setLettersList] = useState<TileProps[]>(getRandomLetters(21))


    useEffect(() => {
        displayTileGrid.grid.map(row => row.map(col => {
            if (col?.onGridTile) {
                // console.log(col)
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
        console.log("tile clicked")
        // console.log("confirmedTileIds", confirmedTileIds)
        // console.log("selectedTileIds in handledClick", selectedTileIds)
        // console.log("displayTileGrid.grid.flat()", displayTileGrid.grid.flat().filter(tile=>tile != null))

        const tile = lettersList.find(tile => tile.id == id && !tile.pale)

        const addedTile: TileProps = {
            ...tile!,
            onGridTile: true,
            row: displayTileGrid.nextLoc.y!,
            col: displayTileGrid.nextLoc.x!
        }
        setDisplayTileGrid((prevGrid) => {
            let nextPost
            const newGrid = {...prevGrid}
            console.log("newGrid", newGrid);
            // console.log("nextTileLoc", x, y);
            newGrid.grid[newGrid.nextLoc.y!][newGrid.nextLoc.x!] = addedTile
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
        // setConfirmedTileIds((prevSet) => new Set<number>([...prevSet, tile!.id]))
        setLettersList(prevState => [...prevState].filter(tile => tile.id != id!))

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
        let newTile: TileProps | null = null
        setDisplayTileGrid((prevGrid) => {
            let colIndex = prevGrid.nextLoc.x
            let rowIndex = prevGrid.nextLoc.y

            const newGrid = prevGrid.grid.map((row, rowI) => row.map((tile, colI) => {
                // tile?.id == id ? null : tile
                if (tile?.id == id) {
                    colIndex = colI
                    rowIndex = rowI
                    if (tile?.xState) {
                        // Remove the tile
                        newTile = {...tile}
                        // console.log("popping tile", newTile)
                        // setLettersList((prevTiles) => [...prevTiles, {...newTile!, xState: false}])
                        return null
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
        console.log("Adding tile", newTile)
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
            const newTile = newGrid.flat().find((tile) => tile !== null && tile.id === idToRemove)
            console.log("newTile", newTile)
            console.log("idToRemove", idToRemove)

            if (newTile) {
                setLettersList((prevTiles) => [...prevTiles, newTile])
            }

            newGrid[xyToRemove.y][xyToRemove.x] = null

            return ({...prev, grid: newGrid, nextLoc: {x: xyToRemove.x, y: xyToRemove.y}})
        })

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

    const [draggedTileID, setDraggedTileID] = useState<number | null>(null)
    const [draggedTile, setDraggedTile] = useState<TileProps | null>(null)

    const handleTileDragStart = (event: DragStartEvent) => {
        console.log("handleTileDragStart event", event)
        setDraggedTileID(Number(event.active.id))
        setGridTileDragStart(true)
    }


    const handleTileDragEnd = (event: DragEndEvent) => {
        const {active, over} = event
        setGridTileDragStart(false)
        console.log("handleTileDrop draggedTileID", draggedTileID)
        console.log("handleTileDrop lettersList", lettersList)
        const newGrid = [...displayTileGrid.grid.map(row => [...row])]
        const draggedTileFromLL = lettersList.find((tile) => tile.id == draggedTileID)
        const draggedTileFromGrid = displayTileGrid.grid.flat().find((tile) => tile?.id == draggedTileID)
        if (!over) {
            // Not dragging but clicking
            console.log("missed empty tile")
            console.log("draggedTileFromLL", draggedTileFromLL)
            console.log("draggedTileFromGrid", draggedTileFromGrid)
            if (draggedTileFromGrid) {
                handleGridTilePop(draggedTileFromGrid.id)
                if (draggedTileFromGrid?.xState) {
                    setLettersList((prevTiles) => [...prevTiles, {...draggedTileFromGrid!, xState: false}])
                }
                // setDisplayTileGrid(prevState => {
                //     const nextState = {...prevState}
                //     console.log("prevGrid", prevState.grid[draggedTileFromGrid!.row][draggedTileFromGrid!.col])
                //     console.log("xState", prevState.grid[draggedTileFromGrid!.row][draggedTileFromGrid!.col]?.xState)
                //     //
                //     // if (nextState.grid[draggedTileFromGrid!.row][draggedTileFromGrid!.col]?.xState) {
                //     //     console.log("setting to null")
                //     //     handleGridTilePop(draggedTileFromGrid.id)
                //     //
                //     // } else {
                //     //     nextState.grid[draggedTileFromGrid!.row][draggedTileFromGrid!.col] = {
                //     //         ...prevState.grid[draggedTileFromGrid!.row][draggedTileFromGrid!.col]!,
                //     //         xState: true,
                //     //     }
                //     // }
                //
                //     // return prevState
                // })
            } else if (draggedTileFromLL) {
                handleLLTileClick(draggedTileFromLL.id)
            }
            return
        }

        const row: number = Math.floor(Number(over.id) / gridSize)
        const col: number = Math.floor(Number(over.id) % gridSize)
        console.log("dropping at", row, col)

        console.log("over.id", over.id)

        if (over.id >= 10000 || event.collisions?.some(collision => collision.id >= 10000)) {
            console.log("over.id", over.id)
            console.log("missed empty tile")
            return
        }

        if (draggedTileFromLL) {
            console.log("letter from list")
            console.log(lettersList.find((tile) => tile.id == draggedTileID))
            // console.log("newGrid", newGrid)
            // console.log("newGrid[row][col]", newGrid[row][col])

            newGrid[row][col] = {
                ...draggedTileFromLL,
                row: row,
                col: col,
                onGridTile: true,
            }

            console.log("Removing letter from list")
            setLettersList(prevState => [...prevState].filter(tile => tile.id != draggedTileID!))

        } else if (draggedTileFromGrid) {
            console.log("letter from grid")

            newGrid[row][col] = {
                ...draggedTileFromGrid,
                row: row,
                col: col
            }
            newGrid[draggedTileFromGrid.row][draggedTileFromGrid.col] = null


            console.log("Rearranging grid")

        }

        setDisplayTileGrid(prev => {
            let xyToRemove = displayTileGrid.nextLoc

            switch (displayTileGrid.direction) {
                case "RIGHT":
                    xyToRemove = {y: row, x: col + 1}
                    break
                case "LEFT":
                    xyToRemove = {y: row, x: col - 1}
                    break
                case "BOTTOM":
                    xyToRemove = {x: col, y: row + 1}
                    break
                case "TOP":
                    xyToRemove = {x: col, y: row - 1}
                    break
            }
            return {...prev, grid: newGrid, nextLoc: {x: xyToRemove.x, y: xyToRemove.y}}
        })

        setDraggedTileID(null)

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
                            <LettersListTile
                                id={(id * id_tile)}
                                t={tile}
                                key={id_tile}
                            />
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
        )
    }

    //
    // const prioritizeTopLayer: CollisionDetection = ({
    //                                                     droppableContainers,
    //                                                     pointerCoordinates,
    //                                                 }) => {
    //     if (!pointerCoordinates) return [];
    //
    //     console.log("droppableContainers", droppableContainers[0])
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

    return (

        <div className="overflow-hidden">
            <DndContext
                onDragStart={handleTileDragStart}
                onDragEnd={handleTileDragEnd}
                // onDragMove={(event) => console.log('onDragMove:', event)}
                // onDragOver={(event) => setRecentCollisions(event.collisions)}
                collisionDetection={rectIntersection}
            >
                <GameBoard grid={displayTileGrid} onEmptyTileClick={handleEmptyTileClick}
                           tileDragStart={gridTileDragStart}
                           onTileDrop={() => {
                           }}/>

                <BottomPanel id={10000}/>
            </DndContext>
        </div>
    )
}

export default SinglePLayer