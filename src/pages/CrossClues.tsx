import {useNavigate} from "react-router-dom";
import React from "react";
import CCGrid from "../components/cross_clues/CCGrid";
import RandomImageGridWrapper from "../components/cross_clues/RandomImageGridWrapper";

function CrossClues() {
    const navigate = useNavigate();

    const handleSinglePlayer = () => {
        navigate('/orangagrams/single-player')
    }
    const handleMultiPlayer = () => {

    }
    const rowHeaders = [
        '1',
        '2',
        <img key="img-rh-3" src="https://via.placeholder.com/50/0000FF/FFFFFF?text=R3" alt="Row 3 Icon"/>, // Example image
        '4',
        '5',
    ];

    const colHeaders = [
        'A',
        <img key="img-ch-b" src="https://via.placeholder.com/50/FF0000/FFFFFF?text=CB" alt="Col B Icon"/>, // Example image
        'C',
        'D',
        'E',
    ];
    return (
        <div className="flex flex-col justify-center items-center h-screen bg-gray-100">
            <RandomImageGridWrapper />
        </div>
    )
}

export default CrossClues;
