import mongoose from "mongoose";

const CounterSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // Nombre del contador, ej: 'publicationId'
  seq: { type: Number, default: 0 }, // Valor secuencial
});

// Ensure model is defined only once
export default mongoose.models.Counter ||
  mongoose.model("Counter", CounterSchema);

// Helper function to get the next sequence value
export async function getNextSequenceValue(sequenceName) {
  try {
    const Counter =
      mongoose.models.Counter || mongoose.model("Counter", CounterSchema);
    const counter = await Counter.findByIdAndUpdate(
      sequenceName,
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    return counter.seq;
  } catch (error) {
    console.error(`Error getting next sequence for ${sequenceName}:`, error);
    // Return a fallback timestamp-based ID in case of error
    return Date.now();
  }
}
