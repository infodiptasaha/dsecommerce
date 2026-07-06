import mongoose, { Schema, Document, Model } from "mongoose";

export type UserRole = "customer" | "admin" | "manager" | "support";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  permissions: string[];
  image?: string;
  phone?: string;
  phoneVerified: boolean;
  emailVerified: boolean;
  stripeCustomerId?: string;
  addresses: {
    type: "billing" | "shipping";
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    isDefault: boolean;
  }[];
  notificationPreferences: {
    email: { orderUpdates: boolean; promos: boolean; newsletter: boolean };
    sms: { orderUpdates: boolean; promos: boolean };
  };
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema(
  {
    type: { type: String, enum: ["billing", "shipping"], required: true },
    line1: { type: String, required: true },
    line2: String,
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true, default: "US" },
    isDefault: { type: Boolean, default: false },
  },
  { _id: false }
);

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, select: false },
    role: { type: String, enum: ["customer", "admin", "manager", "support"], default: "customer" },
    permissions: [{ type: String }],
    image: String,
    phone: { type: String, unique: true, sparse: true },
    phoneVerified: { type: Boolean, default: false },
    emailVerified: { type: Boolean, default: false },
    stripeCustomerId: { type: String, unique: true, sparse: true },
    addresses: [AddressSchema],
    notificationPreferences: {
      email: {
        orderUpdates: { type: Boolean, default: true },
        promos: { type: Boolean, default: true },
        newsletter: { type: Boolean, default: true },
      },
      sms: {
        orderUpdates: { type: Boolean, default: true },
        promos: { type: Boolean, default: false },
      },
    },
  },
  { timestamps: true }
);

UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ stripeCustomerId: 1 });
UserSchema.index({ role: 1 });

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
export default User;
