import { createClient } from 'redis';

const redisClient = createClient({
    socket: {
        host: 'localhost',
        port: 6379
    }
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));

// Connect to Redis
(async () => {
    if (!redisClient.isOpen) {
        await redisClient.connect();
        console.log('Connected to Redis');
    }
})();

export default redisClient;
