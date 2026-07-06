import mongoose, { Schema, Document, Model } from "mongoose";

export interface IReturnItem {
  product: mongoose.Types.ObjectId;
  title: string;
  quantity: number;
  reason: string;
  condition: "unopened" | "opened" | "damaged" | "defective";
}

export interface IReturn extends Document {
  order: mongoose.Types.ObjectId;
  customer: mongoose.Types.ObjectId;
  items: IReturnItem[];
  status: "requested" | "approved" | "rejected" | "received" | "refunded" | "cancelled";
  refundAmount: number;
  restockInventory: boolean;
  adminNotes: string;
  rejectionReason?: string;
  trackingNumber?: string;
  requestedAt: Date;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ReturnItemSchema = new Schema<IReturnItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    title: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    reason: { type: String, required: true, trim: true },
    condition: { type: String, enum: ["unopened", "opened", "damaged", "defective"], default: "unopened" },
  },
  { _id: false }
);

const ReturnSchema = new Schema<IReturn>(
  {
    order: { type: Schema.Types.ObjectId, ref: "Order", required: true, index: true },
    customer: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    items: [ReturnItemSchema],
    status: {
      type: String,
      enum: ["requested", "approved", "rejected", "received", "refunded", "cancelled"],
      default: "requested",
      index: true,
    },
    refundAmount: { type: Number, required: true, min: 0 },
    restockInventory: { type: Boolean, default: true },
    adminNotes: { type: String, default: "" },
    rejectionReason: String,
    trackingNumber: String,
    requestedAt: { type: Date, default: Date.now },
    resolvedAt: Date,
  },
  { timestamps: true }
);

ReturnSchema.index({ createdAt: -1 });
ReturnSchema.index({ status: 1, createdAt: -1 });

const Return: Model<IReturn> =
  mongoose.models.Return || mongoose.model<IReturn>("Return", ReturnSchema);
export default Return;
