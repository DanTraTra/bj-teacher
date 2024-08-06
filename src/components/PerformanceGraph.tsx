import React, {useState} from 'react';
import {Line} from 'react-chartjs-2';
import {
    Chart,
    LineElement,
    PointElement,
    LinearScale,
    Title,
    CategoryScale,
    Tooltip,
    Legend,
    Tick,
    Filler
} from 'chart.js';
import {GameLogDataEntries} from './LeaderBoard'
import {GameLog} from "./MainContent";
// Register necessary components
import annotationPlugin, {AnnotationOptions} from 'chartjs-plugin-annotation';

Chart.register(LineElement, PointElement, LinearScale, Title, CategoryScale, Tooltip, Legend, annotationPlugin);

interface PerformanceGraphProps {
    game_log_data: GameLog[];
    dark_bg: boolean;
}

const PerformanceGraph: React.FC<PerformanceGraphProps> = ({game_log_data, dark_bg}) => {

        const handLabels = game_log_data.map((hand, index) => `${index + 1}`)
        const values = game_log_data.map((hand, index) => hand.EndingBalance)
        handLabels.splice(0, 0, '0')
        values.splice(0, 0, 20)
        const peakValue = Math.max(...values);
        const maxArray = [...values].map(value => value === peakValue ? value : null)

        ////console.log("game_log_data", game_log_data)
        ////console.log("handLabels", handLabels)
        ////console.log("values", values)
        ////console.log("maxArray", maxArray)

        const data =
            {
                labels: handLabels,
                datasets: [
                    {
                        label: `Max:$${peakValue}`,
                        data: maxArray,
                        fill: false,
                        backgroundColor: 'rgba(255,0,0,0.3)', // Semi-transparent red
                        borderColor: 'rgba(255,0,0,0.8)', // Semi-transparent red
                        pointBackgroundColor: 'rgba(255,0,0,0.3)',
                        pointBorderColor: 'rgba(255,0,0,0.8)',
                        pointRadius: 4,
                        pointHoverRadius: 5,
                        tension: 0.3,
                        showLine: false, // Disable the line for the Max: $ dataset

                    },
                    {
                        label: 'Balance',
                        data: values,
                        fill: false,
                        borderColor: 'rgba(75,192,192,1)',
                        pointBackgroundColor: 'rgba(75,192,192,0.3)',
                        pointBorderColor: 'rgba(75,192,192,0.8)',
                        pointRadius: 4,
                        pointHoverRadius: 5,
                        tension: 0.3,

                    },

                ],
            };

        const options = {
            responsive: true,
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        usePointStyle: true, // Use point style for legend
                        pointStyle: 'circle', // Use circle for the legend point style
                        boxWidth: 5,
                        boxHeight: 4,
                        font: {
                            family: 'Share Tech Mono', // Customize the font family
                        },
                        color: dark_bg ? '#D9D9D9' : '#374151',
                    },
                },
            },
            scales: {
                x: {
                    grid: {
                        display: false,
                        color: dark_bg ? '#969696' : 'rgba(200, 200, 200, 0.2)',
                    },
                    title: {
                        display: true,
                        text: 'Hand #',
                        color: dark_bg ? '#D9D9D9' : '#374151',
                    },
                    ticks: {
                        font: {
                            family: 'Share Tech Mono', // Customize the font family
                            // size: 12, // Customize the font size
                            // weight: 'bold', // Customize the font weight
                        },
                        color: dark_bg ? '#D9D9D9' : '#374151'
                    },

                },
                y: {
                    grid: {
                        display: true,
                        color: dark_bg ? '#969696' : 'rgba(200, 200, 200, 0.2)',
                    },

                    ticks: {
                        color: dark_bg ? '#D9D9D9' : '#374151',
                        callback: function (value: any) {
                            return `$${value}`;
                        },
                        font: {
                            family: 'Share Tech Mono', // Customize the font family
                            // size: 12, // Customize the font size
                            // weight: 'bold', // Customize the font weight
                        },
                    },
                    border: {
                        color: dark_bg ? '#969696' : 'rgba(200, 200, 200, 0.2)'
                    }
                    // beginAtZero: true,
                },
            },
        }

        return (

            <div
                className="flex flex-row justify-center items-center px-4">
                <Line data={data} options={options}/>
            </div>

        )
            ;
    }
;

export default PerformanceGraph;
