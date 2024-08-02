import {IoStatsChart} from "react-icons/io5";
import {FaCheck, FaDumbbell} from "react-icons/fa6";
import {PiMathOperationsFill, PiNotepadBold} from "react-icons/pi";
import React, {forwardRef, useState} from "react";
import {MdExitToApp} from "react-icons/md";

interface MenuTopRightProps {
    isChecked: boolean[];
    onClickGame_Stats: () => void;
    onClickTraining_Mode: () => void;
    onClickCheat_Sheet: () => void;
    onClickCard_Counting: () => void;
    onClickCash_Out: () => void;
}


const MenuTopRight = forwardRef<HTMLDivElement, MenuTopRightProps>((props, ref) => {
        const {isChecked, ...onClickProps} = props;
        let buttonLabels = Object.keys(onClickProps);
        buttonLabels = buttonLabels.map(label => label.replace('onClick', '').replace("_", " "))
        //console.log("buttonLabels", buttonLabels)
        const buttonHandlers = Object.values(onClickProps);
        //console.log("buttonHandlers", buttonHandlers)

        const iconSize = "18"
        const icon_fill = "gray-800"
        const [ButtonIconList, setButtonIconList] = useState<React.ReactElement[]>([
            <FaDumbbell size={iconSize} fill={icon_fill}/>,
            <PiNotepadBold size={iconSize} fill={icon_fill}/>,
            <PiMathOperationsFill size={iconSize} fill={icon_fill}/>,
            <MdExitToApp size={iconSize} fill={icon_fill}/>
        ]);

        // const toggleCheck = (index: number) => {
        //     setIsChecked(prevState => {
        //         const newState = [...prevState];
        //         newState[index] = !newState[index];
        //         return newState;
        //     });
        // }

        return (
            <div ref={ref}
                 className="flex font-semibold text-sm justify-center items-center mt-4 -mr-2">
                <table className="font-tech">
                    <tbody>
                    <tr>
                        <div className="p-0">
                            <button
                                onClick={buttonHandlers[0]}
                                className="btn btn-md w-52 flex flex-row w-full pl-3 pr-4 space-x-2 rounded-t-lg rounded-b-[0]">
                                <div className="flex flex-row w-full justify-between items-center">
                                    <div className="flex flex-row justify-between items-center space-x-2">
                                        <td>
                                            <IoStatsChart size="18" fill="gray-800"/>
                                        </td>
                                        <td className="flex items-center my-auto">
                                            {buttonLabels[0]}
                                        </td>
                                    </div>
                                    <td>
                                        {/*<FaCheck size="12" fill="gray-800"/>*/}
                                    </td>
                                </div>
                            </button>
                        </div>
                    </tr>
                    {buttonLabels.slice(1).map((text, index) =>
                        <tr key={index}>
                            <div className="p-0">
                                <button
                                    className={`btn btn-md flex flex-row w-52 pl-3 pr-4 ${index == buttonLabels.length - 2 ? "rounded-none rounded-b-lg" : "rounded-none"}`}
                                    onClick={() => {
                                        // toggleCheck(index)
                                        buttonHandlers[index + 1]()
                                    }}>
                                    <tr className="flex flex-row w-full justify-between space-x-2 items-center">
                                        <td className="flex flex-row justify-between items-center space-x-2">
                                            <td>
                                                {ButtonIconList[index]}
                                            </td>
                                            <td className="flex items-center my-auto">
                                                {buttonLabels[index + 1]}
                                            </td>
                                        </td>
                                        <td>
                                            {isChecked[index] && <FaCheck size="16" fill="gray-800"/>}
                                        </td>
                                    </tr>
                                </button>
                            </div>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        )
    }
)
export default MenuTopRight