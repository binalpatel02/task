import amqp, { Channel } from 'amqplib';

let channel: Channel | null = null;

// Helper function to pause execution for a given time
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getChannel(): Promise<Channel> {
    if (channel) {
        return channel;
    }

    const url = process.env.RABBITMQ_URL || 'amqp://rabbitmq-server:5672';
    const maxRetries = 5;
    let attempts = 0;

    while (attempts < maxRetries) {
        try {
            attempts++;
            console.log(`Connecting to RabbitMQ... (Attempt ${attempts}/${maxRetries})`);
            
            const connection = await amqp.connect(url);
            channel = await connection.createChannel();
            await channel.assertExchange('user_events', 'topic', { durable: true });
            
            console.log('RabbitMQ connected and channel established successfully!');
            return channel;
        } 
        
        catch (error) {
            console.error(`RabbitMQ connection attempt ${attempts} failed. Server might still be booting...`);
            
            if (attempts >= maxRetries) {
                throw new Error(`CRITICAL: Could not connect to RabbitMQ after ${maxRetries} attempts.`);
            }
            
            // Wait 5 seconds before trying again to give RabbitMQ time to finish booting
            await delay(5000); 
        }
    }

    throw new Error('RabbitMQ initialization failed unexpectedly');
}

export async function publishEvent(routingKey: string, data: unknown): Promise<void> {
    const ch = await getChannel();
    ch.publish('user_events', routingKey, Buffer.from(JSON.stringify(data)), {
        persistent: true
    });
}
