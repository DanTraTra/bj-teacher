import React, { useState } from 'react';

interface ImageLinkGameIdModalProps {
  onJoin: (gameId: string) => void;
  onCreate: () => void;
}

const ImageLinkGameIdModal: React.FC<ImageLinkGameIdModalProps> = ({ onJoin, onCreate }) => {
  const [gameIdInput, setGameIdInput] = useState('');

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md flex flex-col items-center">
        <h2 className="text-2xl font-bold mb-4 text-center">Join or Create a Game</h2>
        <input
          type="text"
          placeholder="Enter Game ID..."
          value={gameIdInput}
          onChange={e => setGameIdInput(e.target.value)}
          className="border border-gray-300 rounded px-4 py-2 mb-4 w-full text-center focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <div className="flex flex-col w-full gap-2">
          <button
            onClick={() => onJoin(gameIdInput)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition"
            disabled={!gameIdInput.trim()}
          >
            Join Game
          </button>
          <div className="flex items-center justify-center my-2">
            <span className="text-gray-400 text-xs">or</span>
          </div>
          <button
            onClick={onCreate}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded transition"
          >
            Create New Game
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageLinkGameIdModal;
