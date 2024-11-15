import { Redis } from '@upstash/redis'

if (!process.env.UPSTASH_REDIS_REST_URL) {
    throw new Error("Missing Environment Variable!!!\n- UPSTASH_REDIS_REST_URL")
}

if (!process.env.UPSTASH_REDIS_REST_TOKEN) {
    throw new Error("Missing Environment Variable!!!\n- UPSTASH_REDIS_REST_TOKEN")
}

const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
})

export default redis;