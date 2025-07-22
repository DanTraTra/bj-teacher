import React, { useState } from 'react';

interface ChoosePlayerModalProps {
  playerOneName: string;
  playerTwoName: string;
  onSelectPlayer: (player: 'One' | 'Two') => void;
}

const ChoosePlayerModal: React.FC<ChoosePlayerModalProps> = ({ playerOneName, playerTwoName, onSelectPlayer }) => {

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md flex flex-col items-center">
        <h2 className="text-2xl font-bold mb-4 text-center">Select your name</h2>
        <div className="flex flex-row w-full gap-2">
          <button
            onClick={() => onSelectPlayer('One')}
            className="w-full bg-playerOne hover:bg-playerOne text-gray-500 font-semibold py-2 rounded transition"          >
            {playerOneName}
          </button>
          <button
            onClick={() => onSelectPlayer('Two')}
            className="w-full bg-playerTwo hover:bg-playerTwo text-gray-500 font-semibold py-2 rounded transition"
          >
            {playerTwoName}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChoosePlayerModal;
