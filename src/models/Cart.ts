import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICartItem {
  product: mongoose.Types.ObjectId;
  quantity: number;
  addedAt: Date;
}

export interface ICart extends Document {
  user?: mongoose.Types.ObjectId;
  sessionId: string;
  items: ICartItem[];
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CartItemSchema = new Schema<ICartItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true, min: 1 },
    addedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const CartSchema = new Schema<ICart>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", index: true },
    sessionId: { type: String, required: true, index: true },
    items: [CartItemSchema],
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

CartSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
CartSchema.index({ sessionId: 1 });
CartSchema.index({ user: 1 }, { sparse: true });

const Cart: Model<ICart> = mongoose.models.Cart || mongoose.model<ICart>("Cart", CartSchema);
export default Cart;
