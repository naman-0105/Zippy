import amqp from "amqplib";

let channel: amqp.Channel;

export const connectRabbitMQ = async () => {
  const connection = await amqp.connect(process.env.RABBITMQ_URL!);

  channel = await connection.createChannel();

  await channel.assertQueue(process.env.PAYMENT_QUEUE!, {
    durable: true,
  });

  if (process.env.ORDER_READY_QUEUE) {
    await channel.assertQueue(process.env.ORDER_READY_QUEUE, {
      durable: true,
    });
  }

  console.log("Connected To Rabbitmq(restaurant service)");
};

export const getChannel = () => channel;
