import {IoStatsChart} from "react-icons/io5";
import {FaCheck, FaDumbbell} from "react-icons/fa6";
import {PiMathOperationsFill, PiNotepadBold} from "react-icons/pi";
import React, {forwardRef, useState} from "react";
import {MdExitToApp} from "react-icons/md";

interface MenuTopRightProps {

}

const MenuTopRight = forwardRef<HTMLDivElement, MenuTopRightProps>((props, ref) => {

        const [isChecked, setIsChecked] = useState<boolean[]>([true, true, true]);
        const [ButtonList, setButtonList] = useState<string[]>(['Training', 'Cheat Sheet', 'Card Counter']);
        const iconSize = "18"
        const icon_fill = "gray-800"
        const [ButtonIconList, setButtonIconList] = useState<React.ReactElement[]>([
            <FaDumbbell size={iconSize} fill={icon_fill}/>,
            <PiNotepadBold size={iconSize} fill={icon_fill}/>,
            <PiMathOperationsFill size={iconSize} fill={icon_fill}/>,
            // <MdExitToApp size={iconSize} fill={icon_fill}/>
        ]);

        const toggleCheck = (index: number) => {
            setIsChecked(prevState => {
                const newState = [...prevState];
                newState[index] = !newState[index];
                return newState;
            });
        }

        return (
            <div ref={ref}
                 className="flex font-semibold text-sm justify-center items-center mt-4 -mr-2">
                <table className="font-tech">
                    <tr>
                        <button
                            className="btn btn-md w-52 flex flex-row w-full pl-3 pr-4 space-x-2 rounded-t-lg rounded-b-[0] border-b-accent-content/25">
                            <div className="flex flex-row w-full justify-between items-center">
                                <div className="flex flex-row justify-between items-center space-x-2">
                                    <td>
                                        <IoStatsChart size="18" fill="gray-800"/>
                                    </td>
                                    <td className="flex items-center my-auto">
                                        Game Stats
                                    </td>
                                </div>
                                <td>
                                    {/*<FaCheck size="12" fill="gray-800"/>*/}
                                </td>
                            </div>
                        </button>
                    </tr>
                    {ButtonList.map((text, index) =>
                        <tr>
                            <button
                                className={`btn btn-md flex flex-row w-full pl-3 pr-4 space-x-2 rounded-none`}
                                onClick={() => toggleCheck(index)}>
                                <div className="flex flex-row w-full justify-between items-center">
                                    <div className="flex flex-row justify-between items-center space-x-2">
                                        <td>
                                            {ButtonIconList[index]}
                                        </td>
                                        <td className="flex items-center my-auto">
                                            {text}
                                        </td>
                                    </div>
                                    <td>
                                        {isChecked[index] && <FaCheck size="16" fill="gray-800"/>}
                                    </td>
                                </div>
                            </button>
                        </tr>
                    )}
                    <tr>
                        <button
                            className={`btn btn-md flex flex-row w-full pl-3 pr-4 space-x-2 rounded-none rounded-b-lg`}
                        >
                            <div className="flex flex-row w-full justify-between items-center">
                                <div className="flex flex-row justify-between items-center space-x-2">
                                    <td>
                                        <MdExitToApp size={iconSize} fill={icon_fill}/>
                                    </td>
                                    <td className="flex items-center my-auto">
                                        Cash Out
                                    </td>
                                </div>
                                <div>
                                </div>
                            </div>
                        </button>
                    </tr>
                </table>
            </div>
        )
    }
)
export default MenuTopRight