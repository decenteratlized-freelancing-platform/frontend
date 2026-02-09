/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    images: {
        domains: ['images.unsplash.com', 'plus.unsplash.com', 'lh3.googleusercontent.com']
    },
    transpilePackages: ['three', '@react-three/fiber', '@paper-design/shaders-react'],
};

export default nextConfig;
