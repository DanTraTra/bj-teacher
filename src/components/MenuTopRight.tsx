// import { IoStatsChart } from "react-icons/io5";
// import { FaCheck, FaDumbbell } from "react-icons/fa6";
// import { PiMathOperationsFill, PiNotepadBold } from "react-icons/pi";
// import React, { forwardRef, useState } from "react";
// import { MdExitToApp } from "react-icons/md";
//
// export interface MenuTopRightProps {
//     isChecked: boolean[];
//     onClickGame_Stats: () => void;
//     onClickTraining_Mode: () => void;
//     onClickCheat_Sheet: () => void;
//     onClickCard_Counting: () => void;
//     onClickCash_Out: () => void;
// }
//
// const MenuTopRight = forwardRef<HTMLDivElement, MenuTopRightProps>((props, ref) => {
//     const { isChecked, ...onClickProps } = props;
//     let buttonLabels = Object.keys(onClickProps).map(label => label.replace('onClick', '').replace("_", " "));
//     const buttonHandlers = Object.values(onClickProps);
//
//     const iconSize = 18;
//     const icon_fill = "gray-800";
//     const [ButtonIconList] = useState<React.ReactElement[]>([
//         <FaDumbbell size={iconSize} fill={icon_fill} />,
//         <PiNotepadBold size={iconSize} fill={icon_fill} />,
//         <PiMathOperationsFill size={iconSize} fill={icon_fill} />,
//         <MdExitToApp size={iconSize} fill={icon_fill} />
//     ]);
//
//     return (
//         <div ref={ref} className="flex font-semibold text-sm justify-center items-center mt-4 -mr-2">
//             <table className="font-tech">
//                 <tbody>
//                     <tr>
//                         <td className="py-0" colSpan={2}>
//                             <button
//                                 onClick={buttonHandlers[0]}
//                                 className="btn btn-md w-52 flex flex-row w-full pl-3 pr-4 space-x-2 rounded-t-lg rounded-b-none"
//                             >
//                                 <div className="flex flex-row w-full justify-between items-center">
//                                     <div className="flex flex-row justify-between items-center space-x-2">
//                                         <IoStatsChart size={iconSize} fill={icon_fill} />
//                                         <div>{buttonLabels[0]}</div>
//                                     </div>
//                                 </div>
//                             </button>
//                         </td>
//                     </tr>
//                     {buttonLabels.slice(1).map((text, index) => (
//                         <tr key={index}>
//                             <td className="py-0" colSpan={2}>
//                                 <button
//                                     className={`btn btn-md flex flex-row w-52 pl-3 pr-4 ${index === buttonLabels.length - 2 ? "rounded-none rounded-b-lg" : "rounded-none"}`}
//                                     onClick={buttonHandlers[index + 1]}
//                                 >
//                                     <div className="flex flex-row w-full justify-between space-x-2 items-center">
//                                         <div className="flex flex-row justify-between items-center space-x-2">
//                                             {ButtonIconList[index]}
//                                             <div>{text}</div>
//                                         </div>
//                                         {isChecked[index] && <FaCheck size={16} fill={icon_fill} />}
//                                     </div>
//                                 </button>
//                             </td>
//                         </tr>
//                     ))}
//                 </tbody>
//             </table>
//         </div>
//     );
// });
//
// export default MenuTopRight;
import React, { forwardRef } from "react";
import { IoStatsChart } from "react-icons/io5";
import { FaCheck } from "react-icons/fa6";

export interface MenuTopRightProps {
    buttons: {
        label: string;
        icon: React.ReactElement;
        onClick: () => void;
        isChecked?: boolean;
    }[];
}

const MenuTopRight = forwardRef<HTMLDivElement, MenuTopRightProps>((props, ref) => {
    const { buttons } = props;
    const iconSize = 18;
    const icon_fill = "gray-800";

    return (
        <div ref={ref} className="flex font-semibold text-sm justify-center items-center mt-4 -mr-2">
            <table className="font-tech">
                <tbody>
                    {buttons.map((button, index) => (
                        <tr key={index}>
                            <td className="py-0" colSpan={2}>
                                <button
                                    className={`btn btn-md flex flex-row w-52 pl-3 pr-4 rounded-none ${index === 0 ? "rounded-t-lg" : ""} ${index === buttons.length - 1 ? "rounded-b-lg" : ""}`}
                                    onClick={button.onClick}
                                >
                                    <div className="flex flex-row w-full justify-between space-x-2 items-center">
                                        <div className="flex flex-row justify-between items-center space-x-2">
                                            {button.icon}
                                            <div>{button.label}</div>
                                        </div>
                                        {button.isChecked && <FaCheck size={16} fill={icon_fill} />}
                                    </div>
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
});

export default MenuTopRight;
