const mongoose = require("mongoose");

const PriorityWeightsSchema = new mongoose.Schema({
  _id: {type: Object},
  safetyRisk: { type: Number, min: 1, max: 100, default: 1},
  impactArea: { type: Number, min: 1, max: 100, default: 1 },
  reportFrequency: { type: Number, min: 1, max: 100, default: 1 },
  last_updated: { type: Date, default: Date.now }
}, { 
  collection: 'priority_weights' // Explicit collection name
});

const PriorityWeights = mongoose.model("PriorityWeights", PriorityWeightsSchema);

module.exports = PriorityWeights;