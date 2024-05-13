import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import svgr from "vite-plugin-svgr";

// https://vitejs.dev/config/
export default defineConfig({

    plugins: [
        react(),
        svgr(),
    ],
    // server: {
    //     proxy: {
    //         // Proxying API requests to the backend
    //         '/api': {
    //             target: 'https://bj-teacher-server-env-1.eba-n9at9mkt.ap-southeast-2.elasticbeanstalk.com',  // Replace with your actual backend URL
    //             changeOrigin: true,  // Needed for virtual hosted sites
    //             secure: true,  // If your backend is not HTTPS, set this to false (only for development)
    //             timeout: 10000, // Timeout in milliseconds
    //             rewrite: (path) => path.replace(/^\/api/, '')
    //         }
    //     }
    // }
})
