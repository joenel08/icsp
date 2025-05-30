// models/SurveyResponse.js
const mongoose = require("mongoose");

const SurveyResponseSchema = new mongoose.Schema(
  {
    concern_id: {
      type: String,
      required: true,
    },
    email: String,
    responses: [String],
    submitted_at: Date,
  },
  {
    collection: "survey_responses",
  }
);

module.exports = mongoose.model("SurveyResponse", SurveyResponseSchema);
