import mongoose, { Schema, Document, Model } from "mongoose";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded" | "partially_refunded";
export type FulfillmentStatus = "unfulfilled" | "partial" | "fulfilled" | "shipped" | "delivered" | "returned";
export type PaymentProvider = "stripe" | "paypal" | "cod";

export interface IOrderItem {
  product: mongoose.Types.ObjectId;
  title: string;
  sku: string;
  quantity: number;
  price: number;
  image: string;
}

export interface IOrder extends Document {
  orderNumber: string;
  customer: mongoose.Types.ObjectId;
  items: IOrderItem[];
  shippingAddress: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  paymentProvider: PaymentProvider;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  paypalOrderId?: string;
  subtotal: number;
  tax: number;
  shippingCost: number;
  total: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    title: { type: String, required: true },
    sku: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, required: true },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    customer: { type: Schema.Types.ObjectId, ref: "User", index: true },
    items: { type: [OrderItemSchema], required: true },
    shippingAddress: {
      line1: { type: String, required: true },
      line2: String,
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    paymentProvider: { type: String, enum: ["stripe", "paypal", "cod"], default: "stripe", required: true },
    paymentStatus: { type: String, enum: ["pending", "paid", "failed", "refunded", "partially_refunded"], default: "pending", index: true },
    fulfillmentStatus: { type: String, enum: ["unfulfilled", "partial", "fulfilled", "shipped", "delivered", "returned"], default: "unfulfilled", index: true },
    stripeSessionId: { type: String, unique: true, sparse: true },
    stripePaymentIntentId: { type: String, unique: true, sparse: true },
    paypalOrderId: { type: String, unique: true, sparse: true },
    subtotal: { type: Number, required: true, min: 0 },
    tax: { type: Number, required: true, min: 0, default: 0 },
    shippingCost: { type: Number, required: true, min: 0, default: 0 },
    total: { type: Number, required: true, min: 0 },
    notes: String,
  },
  { timestamps: true }
);

OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ customer: 1, createdAt: -1 });
OrderSchema.index({ orderNumber: 1 });
OrderSchema.index({ stripeSessionId: 1 });

const Order: Model<IOrder> = mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);
export default Order;
