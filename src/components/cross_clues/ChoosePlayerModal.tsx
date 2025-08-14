import React, { useState } from 'react';

interface ChoosePlayerModalProps {
  playerNames: (string | null)[]
  playerColours: string[]
  onSelectPlayer: (player: number) => void;
}

const ChoosePlayerModal: React.FC<ChoosePlayerModalProps> = ({ playerNames, playerColours, onSelectPlayer }) => {

  // console.log("playerNames", playerNames)

  const handlePlayerSelect = (player: number) => {
    const selectedName = playerNames[player];

    if (playerNames.find(name => name?.toLowerCase() == 'admin123')) {
      
    } else if (selectedName) {
      localStorage.setItem('crossCluesPlayerName', selectedName);
    }
    onSelectPlayer(player);
  };

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

  // Map column span values to complete Tailwind classes
  const getColSpanClass = (spanValue: number) => {
    const spanMap: { [key: number]: string } = {
      1: 'col-span-1',
      2: 'col-span-2',
      3: 'col-span-3',
      4: 'col-span-4',
      5: 'col-span-5',
      6: 'col-span-6',
    };
    return spanMap[spanValue] || 'col-span-1';
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg px-6 py-6 w-full max-w-md flex flex-col items-center">
        <h2 className="text-2xl font-bold mb-5 text-center">Select your name</h2>
        <div className="w-full gap-2 grid grid-cols-6">
          {playerNames.slice(1, playerNames.length).map((name, index) => {

            let colSpanClass = Math.ceil(playerNames.length / 3);
            if (playerNames.length - 1 == 2 || playerNames.length - 1 == 4) {
              colSpanClass = 3;
            } else if (playerNames.length - 1 == 3 || playerNames.length - 1 == 6) {
              colSpanClass = 2;
            } else if (playerNames.length - 1 == 5) {

              if (index - 1 < 2) {
                colSpanClass = 2;
              } else {
                colSpanClass = 3;
              }
            }

            return (
              <button
                key={index}
                onClick={() => handlePlayerSelect(index + 1)}
                className={`px-3 w-full overflow-hidden ${getColSpanClass(colSpanClass)} ${getColorClasses(playerColours[index + 1])} text-gray-800 font-semibold py-2 rounded transition`}
              >
                {name}
              </button>

            )
          })}
        </div>
      </div>
    </div>
  );
};

export default ChoosePlayerModal;
