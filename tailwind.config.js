/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme')
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,jsx,ts,tsx}",
        "./components/**/*.{html,js,jsx,ts,tsx}",
        "./node_modules/flowbite/**/*.js"
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter var', ...defaultTheme.fontFamily.sans],
                tech: ['Share Tech Mono', 'monospace'], // Add this line
                main: ['Share Tech Mono'],
                tech_bold: ['Share Tech Mono'],
            },
            fontSize: {
                '2px': '10px',
                '10px': '10px',
                '12px': '12px',
                '22px': '22px',
                '32px': '32px',
            },
            colors: {
                pastelBlue: '#A2C7D3',  // Define your custom color
                grey: '#D9D9D9',
                playerOne: '#E1EDCB',
                playerTwo: '#D6CBE6',
                correct: '#10563F',
                wrong: '#C44104',
                close: '#F37332',
            },
            width: {
                '420px': '420px',
            },
            height: {
                '62px': '220px',
            },
            spacing: {
                '280px': '280px'
            },
            filter: ['hover', 'focus'],

            animation: {
                shake: 'shake 0.82s cubic-bezier(.36,.07,.19,.97) both',
                'arm-wave': 'wave 2s ease-in-out infinite',
            },
            keyframes: {
                shake: {
                    '10%, 90%': {transform: 'translate3d(-1px, 0, 0)'},
                    '20%, 80%': {transform: 'translate3d(2px, 0, 0)'},
                    '30%, 50%, 70%': {transform: 'translate3d(-4px, 0, 0)'},
                    '40%, 60%': {transform: 'translate3d(4px, 0, 0)'}
                },
                wave: {
                    '0%, 100%': {transform: 'rotate(0deg)'},
                    '50%': {transform: 'rotate(10deg)'},
                },

            },
        },
    },
    daisyui: {
        themes: ["pastel"],
    },

    plugins: [require("daisyui"), defaultTheme, require('flowbite/plugin')],
}

