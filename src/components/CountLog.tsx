import React, {useEffect, useRef, useState} from 'react';
import {CardProps} from "./PlayingCard";
import {GiCardDraw, GiCardJoker, GiCardPick} from "react-icons/gi";
import {CgCardDiamonds, CgCardSpades} from "react-icons/cg";
import {TbCards, TbCardsFilled} from "react-icons/tb";
import {LuHistory} from "react-icons/lu";

export interface CountLogEntry {
    value: string;
    change: number;
    countNow: number;
}

interface CountLogProps {
    CountLog: CountLogEntry[];
    deckCount: number;
    expanded: boolean;
    showCount: boolean;
}

const CardCountingLog: React.FC<CountLogProps> = ({CountLog, deckCount, expanded, showCount}) => {
    const logEndRef = useRef<HTMLDivElement>(null);

    // useEffect(() => {
    //     if (logEndRef.current) {
    //         logEndRef.current.scrollIntoView({behavior: 'smooth'});
    //     }
    // }, [CountLog, expanded]);

    return (
        <div className="relative w-full">
            <div className="flex flex-col-reverse items-end pl-2 w-auto max-h-[130px] overflow-y-auto">
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
                        <th className={`w-auto py-1 pr-2 text-left ${expanded ? "pl-1 pr-3 rounded-r-full" : "pl-4 rounded-l-full"}`}>Count:
                            {showCount || expanded ? ` ${CountLog[CountLog.length - 1].countNow / deckCount}` : " ?"}

                        </th>
                        {!expanded &&
                        <th className={`w-auto py-1 pl-2 pr-2 text-left rounded-r-full border-l border-pastelBlue`}>
                            <LuHistory size="22px"/></th>
                        }
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
                {expanded && <div ref={logEndRef}/>}
            </div>
        </div>
    );
};

export default CardCountingLog;
