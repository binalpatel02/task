import { getChannel } from "../../../../library/rabbitmq.js";
import User from "../../model/schema/user.schema.js";

// topic is the type of exchange
// Exchange decides, Topic matches patterns, Routing Key identifies the message, Binding connects the rule to a Queue, and Consumer processes it.

/* Exchange receives the message → routing key labels the message → binding tells the exchange where that routing key should go → queue stores the message → consumer reads it.
   ⬇️                                    ⬇️                             ⬇️                                                                ⬇️                      ⬇️
user_events                       user1.updated/ user2.updated          user1.* /user2.*                                               user_queue                USER1/ USER2
*/

const QUEUE_NAME = "user_queue";
const EXCHANGE_NAME = "user_events";

export const startUserConsumer = async (): Promise<void> => {
    const channel = await getChannel();

    const instance = process.env.INSTANCE;

    // Validate instance
    if (instance !== "USER1" && instance !== "USER2") {
        throw new Error(`Invalid INSTANCE: ${instance}. Expected USER1 or USER2`);
    }

    // Create queue
    await channel.assertQueue(QUEUE_NAME, { durable: true, });

    // Create topic exchange
    await channel.assertExchange(EXCHANGE_NAME, "topic", {
        durable: true,
    });

    // Routing key
    const routingKey = instance === "USER1" ? "user1.*" : "user2.*";

    // Bind queue
    await channel.bindQueue( QUEUE_NAME, EXCHANGE_NAME, routingKey);

    // Process only one message at a time
    await channel.prefetch(1);
    console.log("----------------------------------------");
    console.log(`${instance} consumer started`);
    console.log(`Queue: ${QUEUE_NAME}`);
    console.log(`Exchange: ${EXCHANGE_NAME}`);
    console.log(`Listening for: ${routingKey}`);
    console.log("----------------------------------------");

    // Consume messages
    await channel.consume( QUEUE_NAME, async (msg) => {
        if (!msg) {
            return;
        }

        const messageRoutingKey = msg.fields.routingKey;

        try {
            // Read message
            const data = JSON.parse( msg.content.toString() );
            console.log(`${instance} received [${messageRoutingKey}]`, data);

            // Check routing key
            const expectedPrefix = instance === "USER1" ? "user1." : "user2.";

            if ( !messageRoutingKey.startsWith( expectedPrefix )) {
                console.log(`${instance} does not own ${messageRoutingKey}`);

                channel.nack( msg, false, false);

                return;
            }

            // Find user
            const user = await User.findById( data.userId );

            if (!user) {
                throw new Error(`${instance}: User ${data.userId} not found`);
            }

           // Update user
            user.first_name = data.first_name;
            user.last_name = data.last_name;
            user.email_address = data.email_address;
            user.mobile_number = data.mobile_number;

            await user.save();

            console.log(`${instance} database updated successfully`);

            console.log(`${instance}: Message is now UNACKNOWLEDGED`);

        }
            
        catch (error: any) {
            console.error(`${instance} sync failed:`, error.message);

            // Reject invalid/failed message
            channel.nack( msg, false, false );
            }
        }
    );
};