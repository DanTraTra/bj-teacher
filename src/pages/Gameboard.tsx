import React, {useEffect, useMemo, useRef, useState} from 'react';
import {DndProvider, useDrag, useDrop} from 'react-dnd';
import {HTML5Backend} from 'react-dnd-html5-backend';
import Tile, {TileProps} from "../components/comp_orangagrams/tile";
import {useSpring, animated} from 'react-spring';
import {GestureHandlers, useGesture} from "@use-gesture/react";
import {DisplayGrid} from "./O_SinglePlayer";
import {IoArrowForward} from "react-icons/io5";
import {
    PiArrowFatLinesDownFill,
    PiArrowFatLinesLeftFill,
    PiArrowFatLinesRightFill,
    PiArrowFatLinesUp, PiArrowFatLinesUpFill
} from "react-icons/pi";
import {useDroppable} from "@dnd-kit/core";


interface GameBoardProps {
    grid: DisplayGrid;
    onEmptyTileClick: (row: number, col: number) => void;
    tileDragStart: boolean;
    onTileDrop: (row: number, col: number) => void;
}

const GameBoard: React.FC<GameBoardProps> = ({
                                                 grid,
                                                 onEmptyTileClick,
                                                 tileDragStart,
                                                 onTileDrop,
                                             }
) => {
    const boardRef = useRef<HTMLDivElement | null>(null);
    const boardBorderRef = useRef<HTMLDivElement | null>(null);
    const [touchOrigin, setTouchOrigin] = useState({x: 0, y: 0});
    const [viewportSize, setViewportSize] = useState({
        width: 0,
        height: 0,
    });
    const [centerCellState, setCenterCellState] = useState({
        row: grid.grid.length / 2,
        col: grid.grid[0].length / 2
    });

    const centerCell = useRef<{ row: number, col: number }>({
        row: grid.grid.length / 2,
        col: grid.grid[0].length / 2
    })

    const [visibleBoardBounds, setVisibleBoardBounds] = useState({
        startRow: 0,
        endRow: 0,
        startCol: 0,
        endCol: 0,
    });

    const [tileSize, setTileSize] = useState(16 * 2.75)

    const [draggingPosition, setDraggingPosition] = useState<{ row: number; col: number } | null>(null);

    const gridPos2PixelPos = (gridPos: number): number => {
        return -(gridPos * 16 * 2.75)
    }
    const pixelPos2GridTile = (pixel: number): number => {
        return Math.ceil(Math.abs(pixel / (16 * 2.75)))
    }


    // const [visibleBoard, setVisibleBoard] = useState<(TileProps | null)[][]>(grid.grid)

    const visibleBoard = useMemo(() => {

        // console.log("centerCellState.row", centerCellState.row, "centerCellState.col", centerCellState.col)
        // console.log("startRow", visibleBoardBounds.startCol, "endRow", visibleBoardBounds.endRow, "startCol", visibleBoardBounds.startCol, "endCol", visibleBoardBounds.endCol)

        return grid.grid
            .slice(visibleBoardBounds.startRow, visibleBoardBounds.endRow)
            .map(row => row.slice(visibleBoardBounds.startCol, visibleBoardBounds.endCol));

    }, [grid, visibleBoardBounds])

    const boardOffset = useMemo(() => {
        const offsetX = visibleBoardBounds.startCol * tileSize;
        const offsetY = visibleBoardBounds.startRow * tileSize;

        // console.log("offsetX", offsetX, "offsetY", offsetY)

        return {x: offsetX, y: offsetY};
    }, [visibleBoardBounds, tileSize]);


    // const visibleBoard = grid.grid.slice(visibleBoardBounds.startCol, visibleBoardBounds.endCol).map(row => row.slice(visibleBoardBounds.startRow, visibleBoardBounds.endRow));

    useEffect(() => {
    }, []);


    useEffect(() => {

        const buffer = 3
        const minGridWith = pixelPos2GridTile((viewportSize.width) / 2)
        const minGridHeight = pixelPos2GridTile((viewportSize.height) / 2)

        // console.log("minGridHeight", minGridHeight, "minGridWith", minGridWith)

        const startRow = Math.max(0, centerCellState.row - minGridHeight - buffer);
        // const startRow = 0
        const endRow = Math.min(grid.grid.length, centerCellState.row + minGridHeight + buffer);

        const startCol = Math.max(0, centerCellState.col - minGridWith - buffer);
        // const startCol = 0
        const endCol = Math.min(grid.grid[0].length, centerCellState.col + minGridWith + buffer);

        // setVisibleBoard(grid.grid.slice(visibleBoardBounds.startCol, visibleBoardBounds.endCol)
        //     .map(row => row.slice(visibleBoardBounds.startRow, visibleBoardBounds.endRow)))

        setVisibleBoardBounds({startRow: startRow, endRow: endRow, startCol: startCol, endCol: endCol})

    }, [centerCellState, viewportSize, grid.grid]);


    useEffect(() => {
        // Adjust values only when viewport changes
        // console.log("viewportSize", viewportSize.width, viewportSize.height)
        // console.log("minGridWith", pixelPos2GridTile(viewportSize.width), "minGridHeight", pixelPos2GridTile(viewportSize.height))

        if (boardBorderRef.current) {
            api.start({
                // x: -(boardBorderRef.current.getBoundingClientRect().width / 2),
                // y: -(boardBorderRef.current.getBoundingClientRect().height / 2)
            })
        }

    }, [viewportSize]);

    // const [tileGridPosition, setTileGridPosition] = useState({
    //     x: gridPos2PixelPos(viewportSize.width / 2),
    //     y: gridPos2PixelPos(viewportSize.height / 2)
    // });


    // useEffect(() => {
    //     setCenterCell({row: x.get() as number, col: y.get() as number})
    //
    // }, [x, y]);

    interface emptyTileProps {
        id: number;
        t: TileProps | null;
        rowIndex: number;
        colIndex: number;
    }

    function EmptyTile({id, t, rowIndex, colIndex}: emptyTileProps) {

        const {setNodeRef} = useDroppable({
            id: id,
        });

        return (
            <div
                key={`emptyTile-${rowIndex}-${colIndex}`}
                className="size-10 text-center flex flex-col items-center justify-center font-bold rounded-lg cursor-pointer border-gray-300 border-dashed border-2 z-20"
                onClick={() => {
                    console.log("clicked empty tile id:", id)
                    console.log("clicked empty tile row, col:", t?.row, t?.col)
                    onEmptyTileClick(rowIndex, colIndex)
                }}
                ref={setNodeRef}

                // onDrop={() => onTileDrop(rowIndex, colIndex)}
                // onDragOver={allowDrop}
            >
                {t ?
                    <Tile {...t} key={t.id}
                        // draggable={true}
                        // handleTileDragStart={() => {}}

                    /> :
                    null
                    // `${rowIndex}-${colIndex}`
                }

                {
                    (grid.nextLoc.row == rowIndex && grid.nextLoc.col == colIndex) ?
                        (grid.direction == 'RIGHT') ?
                            <div><PiArrowFatLinesRightFill className="fill-black opacity-30"/></div> :
                            (grid.direction == 'BOTTOM') ?
                                <div><PiArrowFatLinesDownFill className="fill-black opacity-30"/></div> :
                                (grid.direction == 'LEFT') ?
                                    <div><PiArrowFatLinesLeftFill className="fill-black opacity-30"/>
                                    </div> :
                                    (grid.direction == 'TOP') ?
                                        <div><PiArrowFatLinesUpFill className="fill-black opacity-30"/>
                                        </div> : '' : ''
                }
            </div>
        )
    }


    // Calculate the board size and viewport size when the component mounts
    useEffect(() => {
        const updateViewportSize = () => {
            if (boardBorderRef.current) {
                setViewportSize({
                    width: boardBorderRef.current.getBoundingClientRect().width,
                    height: boardBorderRef.current.getBoundingClientRect().height
                })
            }
        }

        const resizeBoardObserver = new ResizeObserver(updateViewportSize)
        if (boardBorderRef.current) {
            resizeBoardObserver.observe(boardBorderRef.current)
        }


        // Cleanup observer on component unmount
        return () => resizeBoardObserver.disconnect();

    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setCenterCellState(centerCell.current)
        }, 100); // Every 100ms

        return () => clearInterval(interval);
    }, []);


    // React Spring animation state for zooming and panning
    const [{x, y, scale}, api] = useSpring(() => ({
        x: gridPos2PixelPos(grid.grid[0].length / 2),
        y: gridPos2PixelPos(grid.grid.length / 2),
        scale: 1,
        config: {tension: 500, friction: 30},
    }));

    // Gesture handlers, disabled when gridTileDragStart is true
    const gestureHandlers: GestureHandlers = {
        onDrag: !tileDragStart
            ? ({offset: [dx, dy]}) => {
                api.start({x: dx, y: dy, scale: 1});
                centerCell.current = ({row: pixelPos2GridTile(dy), col: pixelPos2GridTile(dx)})

            } : () => {
            },

        // onPinch: ({offset: [d, a], origin}) => {
        //     console.log("pinch distance:", d)
        //     const scale = Math.max(0.5, d)
        //     setTouchOrigin({x: origin[0], y: origin[1]});
        //     console.log("scale:", scale)
        //     console.log("touchOrigin:", origin[0], origin[1])
        //
        //     return api.start({scale: scale})
        // },
    };
    // Apply gestures
    useGesture(gestureHandlers, {
        target: boardRef,
        drag: {
            from: () => {
                console.log(x.get(), y.get())
                return [x.get(), y.get()] as [number, number]
            }
        },
        // pinch: {from: () => [scale.get(), scale.get()] as [number, number]},
    });


    return (
        <div className="w-[100vw] h-[70vh] overflow-hidden relative"
             ref={boardBorderRef}>
            <animated.div
                id="displayboard"
                ref={boardRef}
                // ref={tileDragStart ? null : boardRef}
                style={{
                    x,
                    y,
                    // scale,
                    // transformOrigin: `${touchOrigin.x}px ${touchOrigin.y}px`,
                    touchAction: 'none', // Disable default browser touch gestures

                    // }} className="absolute"
                }} className="absolute w-full h-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                //}} className="absolute"
            >
                {visibleBoard.map((row, rowIndex) =>
                    (
                        row.map((t, colIndex) => (
                            <div className="absolute"
                                 key={`cell-${rowIndex * (row.length) + colIndex}`}
                                 style={{
                                     left: `${t!.col * 2.75}rem`,
                                     top: `${t!.row * 2.75}rem`,
                                     // gridTemplateColumns: `repeat(${visibleBoard[rowIndex].length}, 2.5rem)`
                                 }}>
                                <EmptyTile key={`empty-${t!.row * (grid.grid[0].length) + t!.col}`}
                                    // id={rowIndex * (row.length) + colIndex}
                                           id={t!.row * (grid.grid[0].length) + t!.col}
                                           t={t} rowIndex={rowIndex} colIndex={colIndex}></EmptyTile>
                            </div>
                        ))
                    )
                )}
            </animated.div>


        </div>
    )
        ;
};

export default GameBoard;
