const mongoose = require("mongoose");

const Concern_CategoriesSchema = new mongoose.Schema({
  category_name: {
    type: String,
    required: true,
    unique: true,
  },
  safety_risk: { type: Number, min: 0, max: 5, required: true },
  impact_area: { type: Number, min: 0, max: 5, required: true },
  report_frequency: { type: Number, min: 0, max: 5, required: true },
  priority_level: { type: String, enum: ['high', 'mid', 'low'] },
  sub_types: {
    type: [String], // Array of strings
    required: true,
  },
});

const Categories = mongoose.model("Concern_categories", Concern_CategoriesSchema);

module.exports = Categories;