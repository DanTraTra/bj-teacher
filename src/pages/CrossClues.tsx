import {useNavigate} from "react-router-dom";
import React from "react";
import CCGrid from "../components/cross_clues/CCGrid";
import RandomImageGridWrapper from "../components/cross_clues/RandomImageGridWrapper";

function ImageLink() {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col justify-center items-center h-screen bg-gray-100">
            <RandomImageGridWrapper />
        </div>
    )
}

export default ImageLink;
