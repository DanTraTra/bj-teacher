import React, {useEffect, useState} from 'react';
import './tile.css';

export interface TileProps {
    id: number;
    onGridTile: boolean;
    letter: string | null;
    visible: boolean;
    selected: boolean;
    pale: boolean;
    handleClickTile: () => void;
    handleTilePop: () => void;
}

const Tile: React.FC<TileProps> = ({onGridTile, letter, visible, selected, handleClickTile, handleTilePop, pale}) => {
    const [visibleState, setVisibleState] = useState(visible)

    const handleTileClick = () => {
        console.log("in TILE onGridTile", onGridTile)
        visibleState ? handleClickTile() : setVisibleState(true)
    }


    return (
        <>
            {letter ?
                <button
                    className="flip-tile m-0.5"
                    onClick={handleTileClick}
                    disabled={selected || pale}
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