import React, { useState } from 'react';

interface ImageLinkGameIdModalProps {
  onJoin: (gameId: string) => void;
  onCreate: (difficulty: 'easy' | 'normal', playerCount: number) => void;
}

const ImageLinkGameIdModal: React.FC<ImageLinkGameIdModalProps> = ({ onJoin, onCreate }) => {
  const [gameIdInput, setGameIdInput] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'normal' >('normal');
  const [playerCount, setPlayerCount] = useState<number>(2);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg px-8 pt-8 pb-6 w-full max-w-md flex flex-col items-center">
        <h2 className="text-2xl font-bold mb-4 text-center">Join or Create a Game</h2>
        <input
          type="text"
          placeholder="Enter Game ID..."
          value={gameIdInput}
          onChange={e => setGameIdInput(e.target.value)}
          className="border border-gray-300 rounded px-4 py-2 mb-2 w-full text-center focus:outline-none focus:ring-2 focus:ring-playerOne"
        />
        <div className="flex flex-col w-full gap-2">
          <button
            onClick={() => onJoin(gameIdInput)}
            className="bg-playerOne hover:bg-playerOne text-gray-800 font-semibold py-2 rounded transition"
            disabled={!gameIdInput.trim()}
          >
            Join Game
          </button>
          <div className="flex items-center justify-center my-4">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-gray-500 text-xs px-3">or</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          <button
            onClick={() => onCreate(difficulty, playerCount)}
            className="bg-playerTwo hover:bg-playerTwo text-gray-800 font-semibold py-2 rounded transition"
          >
            Create New Game
          </button>

          {/* Game Options Dropdowns */}
          <div className="flex gap-3 mb-3">
            <div className="flex-1">
              {/* <label className="block text-xs text-gray-600 mb-1">Difficulty</label> */}
              <select
                value={difficulty}
                onChange={e => setDifficulty(e.target.value as 'easy' | 'normal')}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-playerTwo"
              >
                <option value="easy">Easy</option>
                <option value="normal">Normal</option>
              </select>
            </div>
            <div className="flex-1">
              {/* <label className="block text-xs text-gray-600 mb-1">Players</label> */}
              <select
                value={playerCount}
                onChange={e => setPlayerCount(Number(e.target.value))}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-playerTwo"
              >
                <option value={2}>2 Players</option>
                <option value={3}>3 Players</option>
                <option value={4}>4 Players</option>
                <option value={5}>5 Players</option>
                <option value={6}>6 Players</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageLinkGameIdModal;
