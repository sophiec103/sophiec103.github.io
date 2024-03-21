/** @type {import('next').NextConfig} */

import path from 'path';
const __dirname = path.resolve();

const nextConfig = {
    output:'export',
    sassOptions: {
        includePaths: [path.join(__dirname, 'src','css')],
    },
};

export default nextConfig;
