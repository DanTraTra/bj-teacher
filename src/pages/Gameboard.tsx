import React, {useEffect, useRef, useState} from 'react';
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

export const is2DArrayEmpty = <T, >(arr: (T | null)[][]): boolean =>
    arr.length === 0 || arr.every(row => row.length === 0 || row.every(cell => cell == null));


const GameBoard: React.FC<GameBoardProps> = ({
                                                 grid,
                                                 onEmptyTileClick,
                                                 tileDragStart,
                                                 onTileDrop,
                                             }
) => {
    const boardRef = useRef<HTMLDivElement | null>(null);
    const [boardSize, setBoardSize] = useState({width: 0, height: 0});
    const [viewportSize, setViewportSize] = useState({width: 0, height: 0});
    const [draggingPosition, setDraggingPosition] = useState<{ row: number; col: number } | null>(null);

    const gridPos2PixelPos = (gridPos: number): number => {
        return -(gridPos * 16 * 2.75)
    }

    const [tileGridPosition, setTileGridPosition] = useState({
        x: gridPos2PixelPos(grid.grid[0].length / 2),
        y: gridPos2PixelPos(grid.grid.length / 2)
    });

    // React Spring animation state for zooming and panning
    const [{x, y, scale}, api] = useSpring(() => ({
        x: tileGridPosition.x,
        y: tileGridPosition.y,
        scale: 1,
        config: {tension: 500, friction: 30},
    }));

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
                key={`${rowIndex}-${colIndex}`}
                className="size-10 text-center flex flex-col items-center justify-center font-bold rounded-lg cursor-pointer border-gray-300 border-dashed border-2"
                onClick={() => onEmptyTileClick(rowIndex, colIndex)}
                ref={setNodeRef}

                // onDrop={() => onTileDrop(rowIndex, colIndex)}
                // onDragOver={allowDrop}
            >
                {t ?
                    <Tile {...t} key={t.id}
                        // draggable={true}
                        // handleTileDragStart={() => {}}

                    /> : null}

                {
                    (grid.nextLoc.x == colIndex && grid.nextLoc.y == rowIndex) ?
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

    }, []);


    useEffect(() => {
        console.log("tileDragStart", tileDragStart)
        // setTileGridPosition({
        //     x: gridPos2PixelPos(grid.nextLoc.x + 0.5),
        //     y: gridPos2PixelPos(grid.nextLoc.y + 0.5)
        // })

    }, [tileDragStart])

    // Update board position when parent x or y changes
    useEffect(() => {
        if (!is2DArrayEmpty(grid.grid)) {
            api.start({x: gridPos2PixelPos(grid.nextLoc.x), y: gridPos2PixelPos(grid.nextLoc.y)});
        }
    }, [grid.nextLoc.x, grid.nextLoc.y, api]);


    // Gesture handlers, disabled when gridTileDragStart is true
    const gestureHandlers: GestureHandlers = {
        onDrag: !tileDragStart
            ? ({offset: [dx, dy]}) => api.start({x: dx, y: dy, scale: 1}) : ()=> {},
        onPinch: ({offset: [d]}) => api.start({scale: d / 100 + d}),
    };

    // Correct way to apply gestures
    useGesture(gestureHandlers, {
        target: boardRef,
        drag: {from: () => [x.get(), y.get()] as [number, number]},
        pinch: {from: () => [scale.get(), scale.get()] as [number, number]},
    });
    return (
        <div className="w-[100vw] h-[70vh] overflow-hidden relative">
            <animated.div
                ref={boardRef}
                // ref={tileDragStart ? null : boardRef}
                style={{
                    x,
                    y,
                    scale,
                    touchAction: 'none', // Disable default browser touch gestures
                }} className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="grid gap-1 rounded-md"
                     style={{gridTemplateColumns: `repeat(${grid.grid[0].length}, 2.5rem)`}}
                    // onDragOver={allowDrop}
                >
                    {grid.grid.map((row, rowIndex) =>
                        row.map((t, colIndex) => (
                            <EmptyTile key={rowIndex * (row.length) + colIndex} id={rowIndex * (row.length) + colIndex}
                                       t={t} rowIndex={rowIndex} colIndex={colIndex}></EmptyTile>
                        ))
                    )}
                </div>
            </animated.div>
        </div>
    )
        ;
};

export default GameBoard;
