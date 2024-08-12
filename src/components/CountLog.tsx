import React, {useEffect, useRef, useState} from 'react';
import {CardProps} from "./PlayingCard";
import {GiCardDraw, GiCardJoker, GiCardPick} from "react-icons/gi";
import {CgCardDiamonds, CgCardSpades} from "react-icons/cg";
import {TbCards, TbCardsFilled} from "react-icons/tb";

export interface CountLogEntry {
    value: string;
    change: number;
    countNow: number;
}

interface CountLogProps {
    CountLog: CountLogEntry[];
    deckCount: number;
    expanded: boolean;
}

const CardCountingLog: React.FC<CountLogProps> = ({CountLog, deckCount, expanded}) => {
    const logEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        logEndRef.current?.scrollIntoView({behavior: 'smooth'});
    }, [CountLog, expanded]);

    return (
        <div className="flex flex-col items-end z-10 pl-2 w-auto max-h-[130px] overflow-y-scroll overflow-hidden">
            <table className="w-full">
                <thead className="sticky top-0 bg-gray-200 py-1 h-[32px]">
                <tr>
                    {expanded &&
                    <>
                        <th className="w-2 pr-1 py-1 rounded-l-full pl-3 text-center">
                            {/*<CgCardDiamonds size="20px"/>*/}
                            Card
                        </th>
                        <th className="w-2 px-0.5 py-1 text-center">&#9651;</th>
                    </>
                    }
                    <th className={`w-auto py-1 pr-3 text-left rounded-r-full ${expanded ? "pl-1 " : "pl-3 pr-10 rounded-full"}`}>Count: {CountLog[CountLog.length - 1].countNow / deckCount}</th>
                </tr>
                </thead>
                <tbody>
                {CountLog.map((count, index) =>
                    <tr key={index} className="">
                        {expanded &&
                        <>
                            <td className="px-2 py-1 text-center">{count.value}</td>
                            <td className="px-0.5 py-1 text-center">{count.change > 0 ? `+${count.change}` : count.change}</td>
                            <td className="px-2 py-1 text-left">{count.countNow}</td>
                        </>}
                    </tr>
                )}
                </tbody>
            </table>
            <div ref={logEndRef}/>
        </div>
    );
};

export default CardCountingLog;
