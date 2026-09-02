import { getChannel } from "../../../../library/rabbitmq.js";

const EXCHANGE_NAME = "user_events";

export const publishUserEvent = async ( routingKey: string, user: any ) => {
    const channel = await getChannel();

    await channel.assertExchange( EXCHANGE_NAME, "topic",
        {
            durable: true
        }
    );

    const message = {
        userId: user._id.toString(),
        first_name: user.first_name,
        last_name: user.last_name,
        email_address: user.email_address,
        mobile_number: user.mobile_number
    };

    channel.publish( EXCHANGE_NAME, routingKey, Buffer.from( JSON.stringify(message)),
        {
            persistent: true
        }
    );

    console.log(`Published [${routingKey}]`, message);
};