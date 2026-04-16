import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import svgr from "vite-plugin-svgr";
import fs from 'fs';

// https://vitejs.dev/config/
export default defineConfig({
    base: '/bj-teacher/',
    plugins: [
        react(),
        svgr(),
        {
            name: 'copy-index-to-404',
            closeBundle() {
                fs.copyFileSync('dist/index.html', 'dist/404.html');
            }
        }
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
