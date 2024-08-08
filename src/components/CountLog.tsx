import React, {useEffect, useRef, useState} from 'react';
import {CardProps} from "./PlayingCard";

export interface CountLogEntry {
    value: string;
    change: number;
    countNow: number;
}

interface CountLogProps {
    CountLog: CountLogEntry[];
    // setRunningCount: (newCount:number)=>{};
    // setCountLog: ()=>{};
}

const CardCountingLog: React.FC<CountLogProps> = ({CountLog}) => {
    const logEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [CountLog]);

    return (
        <div className="absolute flex flex-col items-end top-8 left-4 z-20 pl-2 w-auto max-h-[160px] overflow-y-auto overflow-hidden">
            <table className="w-full text-center">
                <thead className="sticky top-0 bg-gray-200">
                    <tr>
                        <th className="w-2 px-2 py-1 rounded-tl-xl pl-3">Card</th>
                        <th className="w-2 px-2 py-1">&#9651;</th>
                        <th className="w-auto px-2 py-1 rounded-tr-xl pr-3">Count: {CountLog[CountLog.length -1].countNow}</th>
                    </tr>
                </thead>
                <tbody>
                {CountLog.map((count, index) =>
                    <tr key={index} className="hover:bg-gray-100">
                        <td className="px-2 py-1">{count.value}</td>
                        <td className="px-2 py-1">{count.change > 0 ? `+${count.change}` : count.change}</td>
                        <td className="px-2 py-1">{count.countNow}</td>
                    </tr>
                )}
                </tbody>
            </table>
            <div ref={logEndRef} />
        </div>
    );
};

export default CardCountingLog;
