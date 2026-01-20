import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'fra.cloud.appwrite.io',
				port: '',
				pathname: '/v1/storage/buckets/**/files/**/view',
			},
			{
				protocol: 'https',
				hostname: 'cloud.appwrite.io',
				port: '',
				pathname: '/v1/**',
			},
		],
	},
}

export default nextConfig
