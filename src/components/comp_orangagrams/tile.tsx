import React, {useEffect, useState} from 'react';
import './tile.css';
import {IoCloseCircleSharp} from "react-icons/io5";

export interface TileProps {
    id: number;
    onGridTile: boolean;
    letter: string | null;
    visible: boolean;
    selected: boolean;
    pale: boolean;
    xState: boolean;
    draggable: boolean;
    handleClickLLTile: () => void;
    handleClickGridTile: () => void;
    handleClickGridTilePop: () => void;
    handleMouseDown: () => void;
}

const Tile: React.FC<TileProps> = ({
                                       onGridTile,
                                       letter,
                                       visible,
                                       selected,
                                       handleClickGridTile,
                                       handleClickLLTile,
                                       handleClickGridTilePop,
                                       handleMouseDown,
                                       pale,
                                       xState,
                                       draggable,
                                   }) => {
    const [visibleState, setVisibleState] = useState(visible)

    const handleTileClick = () => {
        console.log("TILE CLICKED - onGrid Tile?", onGridTile)
        if (visibleState) {
            if (onGridTile) {
                console.log("Tile on grid")
                if (xState) {
                    handleClickGridTilePop()
                } else {
                    handleClickGridTile()
                }
            } else {
                console.log("Tile in list")
                handleClickLLTile()
            }
        } else {
            console.log("Flip tile")
            setVisibleState(true)
        }
        // visibleState ? onGridTile ? handleClickGridTile() : handleClickLLTile() : setVisibleState(true)
    }


    return (
        <>
            {letter ?
                <button
                    className="flip-tile m-0.5"
                    onClick={handleTileClick}
                    onMouseDown={handleMouseDown}
                    disabled={selected || pale}
                    draggable={draggable}
                >
                    <div
                        className={`flex justify-center items-center size-10 rounded-lg flip-tile-inner shadow hover:text-black
                        ${visibleState ? '' : 'is-flipped'} 
                        ${pale ? 'opacity-50' : 'opacity-100'} 
                        ${selected ? 'outline btn-outline' : ''}`}>

                        <div className="flip-tile-front">
                            <div
                                className="relative size-10 bg-white rounded-lg flex items-center justify-center shadow-xl overflow-hidden">
                                {letter}
                            </div>
                            {xState &&
                            <div className="absolute flex justify-end items-start w-full h-full opacity-80">
                                <IoCloseCircleSharp color="grey" size="24px" className="-m-1.5"/>
                            </div>
                            }
                        </div>
                        <div className="flip-tile-back bg-white overflow-hidden rounded-lg shadow-lg"/>
                    </div>
                </button> :
                <></>
            }

        </>
    )
}

export default Tile