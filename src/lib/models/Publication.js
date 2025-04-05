import mongoose from "mongoose";

const PublicationSchema = new mongoose.Schema({
  counterId: { type: Number, unique: true, index: true }, // ID secuencial simple
  title: { type: String, required: true },
  slug: { type: String, index: true }, // Para la URL amigable
  description: { type: String, required: true },
  categorySlug: { type: String, required: true, index: true },
  subcategorySlug: { type: String, index: true },
  subSubcategorySlug: { type: String, index: true }, // Añadir si tienes 3 niveles
  location: { type: String }, // Simple por ahora
  contactName: { type: String },
  contactPhone: { type: String }, // Número WhatsApp del anunciante
  price: { type: Number },
  currency: { type: String, default: "PEN" },
  images: [{ type: String }], // Array de URLs de imágenes
  status: { type: String, default: "active", index: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  // Campos para compatibilidad con el sistema existente
  id: { type: String },
});

// Exportar el modelo
export const getPublicationModel = (categorySlug) => {
  const collectionName = `publications_${categorySlug}`;

  // Check if model exists first to prevent model recreation error in development
  try {
    return (
      mongoose.models[collectionName] ||
      mongoose.model(collectionName, PublicationSchema, collectionName)
    );
  } catch (error) {
    console.error(`Error creating model for ${collectionName}:`, error);
    // Return existing model if creation fails
    return mongoose.models[collectionName];
  }
};

export default PublicationSchema;
