import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICategory extends Document {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parent?: mongoose.Types.ObjectId;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: String,
    image: String,
    parent: { type: Schema.Types.ObjectId, ref: "Category", default: null },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

CategorySchema.index({ slug: 1 });
CategorySchema.index({ parent: 1 });

const Category: Model<ICategory> =
  mongoose.models.Category || mongoose.model<ICategory>("Category", CategorySchema);
export default Category;
