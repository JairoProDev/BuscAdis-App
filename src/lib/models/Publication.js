import mongoose from "mongoose";

// Unified Publication schema for single global collection `adisos`
// This schema is flexible and scalable for multiple categories and countries.
const UnifiedPublicationSchema = new mongoose.Schema(
  {
    sequentialId: { type: Number, unique: true, index: true },

    // Core content
    title: { type: String, required: true, index: true },
    slug: { type: String, index: true },
    description: { type: String, required: true, index: "text" },

    // Status and lifecycle
    status: { type: String, enum: ["active", "expired", "pending_review", "rejected", "archived"], default: "active", index: true },
    publicationDate: { type: Date, index: true },
    validUntil: { type: Date },

    // Classification
    category: { type: String, required: true, index: true },
    subcategories: [{ type: String, index: true }],

    // Location
    location: {
      countryCode: { type: String, index: true },
      department: { type: String, index: true },
      province: { type: String, index: true },
      district: { type: String, index: true },
      address: { type: String },
      areaPaths: [{ type: String, index: true }],
      geo: {
        type: { type: String, enum: ["Point"], default: "Point" },
        coordinates: { type: [Number], index: "2dsphere" }
      }
    },

    // Advertiser / contact
    advertiserType: { type: String, enum: ["company", "individual"], default: "individual" },
    advertiserId: { type: String, index: true },
    contactInfo: {
      name: { type: String },
      showContactButton: { type: Boolean, default: true },
      phone: { type: String },
      email: { type: String }
    },

    // Pricing
    pricing: {
      amount: { type: Number },
      currency: { type: String, default: "PEN" }
    },

    // Dynamic attributes
    attributes: { type: Map, of: mongoose.Schema.Types.Mixed, default: {} },

    // Media
    media: [
      {
        type: { type: String, enum: ["image", "video", "document"], default: "image" },
        url: { type: String },
        isPrimary: { type: Boolean, default: false }
      }
    ],

    // Search/AI
    search: {
      tags: [{ type: String, index: true }],
      embedding: [{ type: Number }]
    },

    // Metrics
    metrics: {
      impressions: { type: Number, default: 0 },
      cardClicks: { type: Number, default: 0 },
      detailViews: { type: Number, default: 0 },
      shares: { type: Number, default: 0 },
      saves: { type: Number, default: 0 },
      contactClicks: { type: Number, default: 0 },
      chatInteractions: { type: Number, default: 0 }
    },

    // Source/Distribution/Audit/Moderation
    source: {
      type: { type: String, enum: ["web_form", "historical_import", "api", "sales_assisted"], default: "web_form" },
      historicalImportDetails: {
        originalPublicationDate: { type: Date },
        estimatedPaidAmount: { type: Number }
      }
    },
    distribution: [
      { channel: { type: String }, status: { type: String }, refId: { type: String } }
    ],
    audit: {
      createdBy: { type: String },
      history: [
        { changedAt: { type: Date }, changedBy: { type: String }, field: { type: String }, oldValue: { type: mongoose.Schema.Types.Mixed } }
      ]
    },
    moderation: {
      status: { type: String, enum: ["pending", "approved", "rejected"], default: "approved" },
      reviewedBy: { type: String },
      notes: { type: String }
    },
  },
  { timestamps: true }
);

// Compound indexes for high-perf queries
UnifiedPublicationSchema.index({ category: 1, publicationDate: -1 });
UnifiedPublicationSchema.index({ status: 1, category: 1, publicationDate: -1 });
UnifiedPublicationSchema.index({ title: "text", description: "text" });
UnifiedPublicationSchema.index({ sequentialId: 1 });

export const UnifiedPublicationModel =
  mongoose.models.adisos ||
  mongoose.model("adisos", UnifiedPublicationSchema, "adisos");

export default UnifiedPublicationModel;
