import React from 'react';
import {useNavigate} from 'react-router-dom';

const Portfolio: React.FC = () => {
    const navigate = useNavigate();

    const handleGoToBlackjack = () => {
        navigate('/blackjack');
    };
    const handleGoToBananagrams = () => {
        navigate('/orangagrams');
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
            <h1 className="text-4xl font-bold mb-8">Welcome</h1>
            <div className="flex flex-col items-center justify-center space-y-2">
                <button
                    onClick={handleGoToBlackjack}
                    className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-700 transition duration-300"
                >
                    Play Blackjack
                </button>
                <button
                    onClick={handleGoToBananagrams}
                    className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-700 transition duration-300"
                >
                    Play Bananagrams
                </button>
            </div>
            {/* Add more profile/menu options here */}
        </div>
    );
};

export default Portfolio;
