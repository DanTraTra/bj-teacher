import React from 'react';
import {useNavigate} from 'react-router-dom';

function Orangagrams() {
    const navigate = useNavigate();

    const handleSinglePlayer = () => {
        navigate('/orangagrams/single-player')
    }
    const handleMultiPlayer = () => {

    }
    return (
        <>
            <h1 className="flex justify-center items-center py-4 text-2xl">Welcome to Orangagrams</h1>
            <div className="flex flex-col items-center justify-center space-y-2">
                <button
                    onClick={handleSinglePlayer}
                    className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-700 transition duration-300"
                >
                    Single Player
                </button>
                <button
                    onClick={handleMultiPlayer}
                    className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-700 transition duration-300"
                >
                    Multiplayer
                </button>
            </div>
        </>
    )
}

export default Orangagrams