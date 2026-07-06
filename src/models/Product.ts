import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProduct extends Document {
  title: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  category: mongoose.Types.ObjectId;
  tags: string[];
  sku: string;
  inventory: number;
  isPublished: boolean;
  averageRating: number;
  numReviews: number;
  weight?: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, min: 0 },
    images: [{ type: String, required: true }],
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true, index: true },
    tags: [{ type: String, index: true }],
    sku: { type: String, required: true, unique: true },
    inventory: { type: Number, required: true, min: 0, default: 0 },
    isPublished: { type: Boolean, default: false, index: true },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    numReviews: { type: Number, default: 0 },
    weight: Number,
  },
  { timestamps: true }
);

ProductSchema.index({ title: "text", description: "text", tags: "text" });
ProductSchema.index({ slug: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ createdAt: -1 });
ProductSchema.index({ isPublished: 1, category: 1, price: 1 });

const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);
export default Product;
