import mongoose from "mongoose";

// Unified Publication schema for single global collection `adisos`
// This schema is flexible and scalable for multiple categories and countries.
const UnifiedPublicationSchema = new mongoose.Schema(
  {
    sequentialId: { type: Number, unique: true, index: true },

    // Core content
    title: { type: String, required: true, index: true },
    description: { type: String, required: true, index: "text" },
    slug: { type: String, index: true },

    // Classification
    category: { type: String, required: true, index: true },
    subcategory: { type: String, index: true },
    subsubcategory: { type: String, index: true },

    // Location
    location: {
      country: { type: String, index: true },
      region: { type: String, index: true }, // department/province/state
      province: { type: String },
      city: { type: String, index: true },
      district: { type: String },
      address: { type: String },
      coordinates: {
        lat: { type: Number },
        lng: { type: Number },
      },
    },

    // Contact
    contact: {
      name: { type: String },
      phones: [{ type: String }],
      whatsapp: [{ type: String }],
      email: [{ type: String }],
      preferredMethod: { type: String, enum: ["phone", "whatsapp", "email"], default: "phone" },
    },

    // Pricing
    pricing: {
      amount: { type: Number },
      currency: { type: String, default: "PEN" },
      type: { type: String, enum: ["fixed", "negotiable", "free", "range", "hourly", "monthly"], default: "fixed" },
      period: { type: String, enum: ["once", "daily", "monthly"] },
      minAmount: { type: Number },
      maxAmount: { type: Number },
    },

    // Media
    images: [{ type: String }],
    videos: [{ type: String }],

    // Dynamic attributes per category
    attributes: { type: Map, of: mongoose.Schema.Types.Mixed, default: {} },

    // Source metadata
    source: {
      type: { type: String, enum: ["manual", "import", "crawler", "magazine", "api"], default: "manual" },
      label: { type: String },
      externalId: { type: String, index: true },
      originalPublicationDate: { type: Date },
      extraction: {
        method: { type: String, enum: ["ai", "manual", "auto"], default: "auto" },
        confidence: { type: Number },
        processedAt: { type: Date },
      },
    },

    // Status and lifecycle
    status: { type: String, enum: ["active", "expired", "archived", "deleted"], default: "active", index: true },
    premium: { type: Boolean, default: false },
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Compound indexes for high-perf queries
UnifiedPublicationSchema.index({ category: 1, "location.region": 1, createdAt: -1 });
UnifiedPublicationSchema.index({ title: "text", description: "text" });
UnifiedPublicationSchema.index({ sequentialId: 1 });

export const UnifiedPublicationModel =
  mongoose.models.adisos ||
  mongoose.model("adisos", UnifiedPublicationSchema, "adisos");

export default UnifiedPublicationModel;
