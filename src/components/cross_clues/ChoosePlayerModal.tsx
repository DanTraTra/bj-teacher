import React, { useState } from 'react';

interface ChoosePlayerModalProps {
  playerNames: (string | null)[]
  playerColours: string[]
  onSelectPlayer: (player: number) => void;
}

const ChoosePlayerModal: React.FC<ChoosePlayerModalProps> = ({ playerNames, playerColours, onSelectPlayer }) => {

  // console.log("playerNames", playerNames)

  // Map color names to complete Tailwind classes
  const getColorClasses = (colorName: string) => {
    const colorMap: { [key: string]: string } = {
      'playerOne': 'bg-playerOne hover:bg-playerOne',
      'playerTwo': 'bg-playerTwo hover:bg-playerTwo',
      'playerThree': 'bg-playerThree hover:bg-playerThree',
      'playerFour': 'bg-playerFour hover:bg-playerFour',
      'playerFive': 'bg-playerFive hover:bg-playerFive',
      'playerSix': 'bg-playerSix hover:bg-playerSix',
    };
    return colorMap[colorName] || 'bg-gray-200 hover:bg-gray-300';
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md flex flex-col items-center">
        <h2 className="text-2xl font-bold mb-4 text-center">Select your name</h2>
        <div className="flex flex-row w-full gap-2">
          {playerNames.slice(1, playerNames.length).map((name, index) => (
            <button
              key={index}
              onClick={() => onSelectPlayer(index + 1)}
              className={`w-full ${getColorClasses(playerColours[index + 1])} text-gray-500 font-semibold py-2 rounded transition`}
            >
              {name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChoosePlayerModal;
