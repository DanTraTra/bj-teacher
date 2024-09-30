import React, { useState, useRef, useEffect } from 'react';
import {GameOutComeType, animationTime, dealerAnimationTime} from '../components/MainContent'

export const pressButtonAndCheckGameState = async (buttonPress: ()=> void, expectedState: GameOutComeType, checkState: ()=>{}) => {
    await buttonPress(); // Simulate button press
    await new Promise(resolve => setTimeout(resolve, dealerAnimationTime)); // Wait for 500 milliseconds
    const currentState = checkState(); // Check the current state
    if (JSON.stringify(currentState) !== JSON.stringify(expectedState)) {
        alert(`Game State test failed: expected ${JSON.stringify(expectedState)}, got ${JSON.stringify(currentState)}`);
    }
    ////// console.log("Game State test passed");
};

export const pressButtonAndCheckBalanceState = async (buttonPress: ()=> void, expectedState: number, checkState: ()=>{}) => {
    await buttonPress(); // Simulate button press
    await new Promise(resolve => setTimeout(resolve, animationTime)); // Wait for 500 milliseconds
    const currentState = checkState(); // Check the current state
    if (JSON.stringify(currentState) !== JSON.stringify(expectedState)) {
        const message = `Balance State test failed: expected ${JSON.stringify(expectedState)}, got ${JSON.stringify(currentState)}`
        alert(message);
        ////// console.log(message);
        return
    }
    ////// console.log("Balance State test passed");
};

export const checkGameState = async (expectedState: GameOutComeType, checkState: ()=>{}) => {
    const currentState = checkState(); // Check the current state
    if (JSON.stringify(currentState) !== JSON.stringify(expectedState)) {
        const message = `Game State test failed: expected ${JSON.stringify(expectedState)}, got ${JSON.stringify(currentState)}`
        alert(message);
        ////// console.log(message);
        return
    }
    ////// console.log("Balance State test passed");
};


