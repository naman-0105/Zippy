import mongoose, { Schema, Document } from "mongoose";

export interface IPaymentEvent extends Document {
  eventId: string;
  eventType: string;
  provider: "razorpay";
  processedAt: Date;
}

const PaymentEventSchema = new Schema<IPaymentEvent>({
  eventId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  eventType: {
    type: String,
    required: true,
  },
  provider: {
    type: String,
    required: true,
    default: "razorpay",
  },
  processedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model<IPaymentEvent>("PaymentEvent", PaymentEventSchema);
