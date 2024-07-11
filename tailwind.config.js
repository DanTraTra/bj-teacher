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
                main: ['Share Tech Mono']
            },
            fontSize: {
                '2px': '10px',
                '10px': '10px',
                '12px': '12px',
                '22px': '22px',
            },
            colors: {
                pastelBlue: '#A2C7D3',  // Define your custom color
                grey: '#D9D9D9'
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
        },
    },
    daisyui: {
        themes: ["pastel"],
    },

    plugins: [require("daisyui"), defaultTheme, require('flowbite/plugin')],
}

