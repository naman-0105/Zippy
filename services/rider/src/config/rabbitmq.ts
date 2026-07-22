import amqp from "amqplib";

let channel: amqp.Channel;

export const connectRabbitMQ = async () => {
  const connection = await amqp.connect(process.env.RABBITMQ_URL!);

  channel = await connection.createChannel();
  await channel.prefetch(50);

  await channel.assertQueue(process.env.ORDER_READY_QUEUE!, {
    durable: true,
  });

  console.log("Connected To Rabbitmq(rider service)");
};

export const getChannel = () => channel;
