import mongoose from "mongoose";

const analyticsEventSchema = new mongoose.Schema({
  event: {
    type: String,
    enum: ["impression", "click", "add_to_cart", "checkout", "purchase"],
    required: true,
  },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  productTitle: String,
  productSlug: String,
  category: String,
  price: Number,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  sessionId: String,
  metadata: mongoose.Schema.Types.Mixed,
}, { timestamps: true });

analyticsEventSchema.index({ event: 1, createdAt: -1 });
analyticsEventSchema.index({ productId: 1, event: 1 });
analyticsEventSchema.index({ category: 1, event: 1 });
analyticsEventSchema.index({ createdAt: -1 });

const AnalyticsEvent = mongoose.models.AnalyticsEvent || mongoose.model("AnalyticsEvent", analyticsEventSchema);

export default AnalyticsEvent;
