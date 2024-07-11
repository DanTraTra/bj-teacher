import React, {useState} from 'react';
import {Line} from 'react-chartjs-2';
import {Chart, LineElement, PointElement, LinearScale, Title, CategoryScale, Tooltip, Legend} from 'chart.js';
import {GameLogDataEntries} from './LeaderBoard'
import {GameLog} from "./MainContent";
// Register necessary components
Chart.register(LineElement, PointElement, LinearScale, Title, CategoryScale, Tooltip, Legend);

interface PerformanceGraphProps {
    game_log_data: GameLog[];
}

const PerformanceGraph: React.FC<PerformanceGraphProps> = ({game_log_data}) => {

        const handLabels = game_log_data.map((hand, index) => `${index + 1}`)
        const values = game_log_data.map((hand, index) => hand.EndingBalance)
        handLabels.splice(0, 0, '0')
        values.splice(0, 0, 20)
        console.log("game_log_data", game_log_data)
        console.log("handLabels", handLabels)
        console.log("values", values)

        const data =
            {
                labels: handLabels,
                datasets: [
                    {
                        label: 'Won',
                        data: values,
                        fill: false,
                        borderColor: 'rgba(75,192,192,1)',
                        tension: 0.3,
                    },
                ],
            };

        const options = {
            responsive: true,
            plugins: {
                legend: {
                    display: false,
                },
            },
            scales: {
                x: {
                    grid: {
                        display: false,
                    },
                    title: {
                        display: true,
                        text: 'Hand #',
                    }
                },
                y: {
                    grid: {
                        display: true,
                        color: 'rgba(200, 200, 200, 0.2)',
                    },
                    // beginAtZero: true,
                },
            },
        }

        return (

            <div
                className="flex flex-row justify-center items-center min-w-[80vw] max-w-[90vw] p-4">
                <Line data={data} options={options}/>
            </div>

        )
            ;
    }
;

export default PerformanceGraph;
