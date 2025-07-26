import React, { useState } from 'react';

interface ChoosePlayerModalProps {
  playerNames: (string | null)[]
  playerColours: string[]
  onSelectPlayer: (player: number) => void;
}

const ChoosePlayerModal: React.FC<ChoosePlayerModalProps> = ({ playerNames, playerColours, onSelectPlayer }) => {

  // console.log("playerNames", playerNames)

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md flex flex-col items-center">
        <h2 className="text-2xl font-bold mb-4 text-center">Select your name</h2>
        <div className="flex flex-row w-full gap-2">
          {playerNames.slice(1, playerNames.length).map((name, index) => (
            <button
              key={index}
              onClick={() => onSelectPlayer(index + 1)}
              className={`w-full bg-${playerColours[index + 1]} hover:bg-${playerColours[index + 1]} text-gray-500 font-semibold py-2 rounded transition`}
            >
              {name}
            </button>
          ))}
          {/* <button
            onClick={() => onSelectPlayer(1)}
            className="w-full bg-playerOne hover:bg-playerOne text-gray-500 font-semibold py-2 rounded transition"          >
            {playerOneName}
          </button>
          <button
            onClick={() => onSelectPlayer(2)}
            className="w-full bg-playerTwo hover:bg-playerTwo text-gray-500 font-semibold py-2 rounded transition"
          >
            {playerTwoName}
          </button> */}
        </div>
      </div>
    </div>
  );
};

export default ChoosePlayerModal;
