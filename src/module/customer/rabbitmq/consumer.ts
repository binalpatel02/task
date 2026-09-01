import { getChannel } from "../../../library/rabbitmq.js";
import Customer from "../model/schema/customer.schema.js";

export async function startCustomerSyncConsumer() {
    const channel = await getChannel();

    await channel.assertQueue("customer_sync_queue", { durable: true });

    await channel.bindQueue( "customer_sync_queue", "user_events", "user.updated" );

    console.log( "Customer sync consumer started - waiting for user.updated" );

    channel.consume(
        "customer_sync_queue",
        async (msg) => {
            if (!msg) return;

            try {
                const data = JSON.parse( msg.content.toString() );

                console.log("Customer received user.updated:", data);

                if (!data.userId) {
                    throw new Error( "userId is missing from user.updated event" );
                }

                const mappedPayload = {
                    user: {
                        id: String(data.userId),
                        first_name: data.first_name,
                        last_name: data.last_name,
                        email_address: data.email_address,
                        mobile_number: data.mobile_number
                    }
                };

                console.log( "Updating Customer records for userId:", data.userId );

                console.log( "Customer update payload:", mappedPayload );

                const result = await Customer.updateMany(
                    {
                        userId: data.userId
                    },
                    {
                        $set: mappedPayload
                    }
                );

                console.log( `Customer sync completed. Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}`);

                if (result.matchedCount === 0) {
                    throw new Error( `No Customer found for userId: ${data.userId}` );
                }

                channel.ack(msg);

            }
            
            catch (error: any) {
                console.error( "Customer sync failed:", error.message );
                
                channel.nack( msg, false, false );
            }
        }
    );
}