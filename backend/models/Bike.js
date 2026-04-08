const mongoose = require('mongoose');

const bikeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  model: { type: String, required: true }, // e.g. "2024 Special Edition"
  price: { type: Number, required: true }, // In PKR
  fuel_avg: { type: Number, required: true }, // Km per litre
  colors: [{ type: String }], // Array of color variants
  engine_cc: { type: Number, required: true }, // Displacement in CC
  images: [{ type: String }], // Gallery/Slider images (URLs)
  thumbnail: { type: String, required: true }, // Main card image URL
  description: { type: String } // Optional detail
}, { timestamps: true });

module.exports = mongoose.model('Bike', bikeSchema);
