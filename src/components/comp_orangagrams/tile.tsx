import React, {useEffect, useState} from 'react';
import './tile.css';
import {IoCloseCircleSharp} from "react-icons/io5";
import {useDraggable} from '@dnd-kit/core';
import {CSS} from '@dnd-kit/utilities';

export interface TileProps {
    id: number;
    onGridTile: boolean;
    row: number;
    col: number;
    letter: string | null;
    visible: boolean;
    selected: boolean;
    pale: boolean;
    xState: boolean;
    draggable: boolean;
    // handleClickLLTile: () => void;
    // handleClickGridTile: () => void;
    // handleClickGridTilePop: () => void;
    // handleTileDragStart: (id: number) => void;
    // handleTileDrop: ()
    // handleAllowDrop: () => void;
}

const Tile: React.FC<TileProps> = ({
                                       id,
                                       onGridTile,
                                       letter,
                                       row, col,
                                       visible,
                                       selected,
                                       // handleClickGridTile,
                                       // handleClickLLTile,
                                       // handleClickGridTilePop,
                                       // handleTileDragStart,
                                       pale,
                                       xState,
                                       draggable,
                                   }) => {
    const [visibleState, setVisibleState] = useState(visible)
    const [touchStart, setTouchStart] = useState({x: 0, y: 0});
    const [dragging, setDragging] = useState(false);
    const {attributes, listeners, setNodeRef, transform} = useDraggable({id: id});
    // const style = {
    //     transform: CSS.Translate.toString(transform),
    // };
    // const style = transform ? {
    //     transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    //     // touchAction: 'auto', // Disable touch gestures
    // } : undefined;
    const style = {
        transform: transform
            ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
            : undefined,
        touchAction: "none",
    };

    const handleTileClick = () => {
        console.log("TILE CLICKED - onGrid Tile?", onGridTile)
        if (visibleState) {
            // if (onGridTile) {
            //     console.log("Tile on grid")
            //     if (xState) {
            //         handleClickGridTilePop()
            //     } else {
            //         handleClickGridTile()
            //     }
            // } else {
            //     console.log("Tile in list")
            //     handleClickLLTile()
            // }
        } else {
            console.log("Flip tile")
            setVisibleState(true)
        }
        // visibleState ? onGridTile ? handleClickGridTile() : handleClickLLTile() : setVisibleState(true)
    }

    return (
        <>
            {letter &&
                <button
                    ref={setNodeRef} style={style} {...listeners} {...attributes}
                    className="absolute w-10 h-10 text-black flex items-center justify-center rounded shadow-md cursor-pointer"
                    onClick={handleTileClick}
                >
                    <div
                        className={`flex justify-center items-center size-10 rounded-lg hover:text-black
                        ${visibleState ? '' : 'is-flipped'} 
                        ${pale ? 'opacity-50' : 'opacity-100'} 
                        ${selected ? 'outline btn-outline' : ''}`}
                    >

                        <div className="">
                            <div
                                className="relative size-10 bg-white rounded-lg flex items-center justify-center overflow-hidden">
                                {letter}
                            </div>
                            {xState &&
                                <div
                                    className="absolute top-0 right-0 opacity-80">
                                    <IoCloseCircleSharp color="grey" size="24px" className="-m-1.5"/>
                                </div>
                            }
                        </div>
                    </div>
                </button>
            }

        </>
    )
}

export default Tile