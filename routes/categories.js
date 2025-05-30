// routes/categories.js
const express = require("express");
const router = express.Router();
const Categories = require("../models/Concern_categories");
const PriorityWeights = require("../models/PriorityWeights");

// List categories
router.get("/categories", async (req, res) => {
  try {
    if (!req.session.user) return res.redirect("/");
    const categories = await Categories.find();
    res.render("concern_categories", { user: req.session.user, categories });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

router.get("/get-category/:id", async (req, res) => {
  try {
    const category = await Categories.findById(req.params.id); // Find by ID
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }
    res.json(category);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch category" });
  }
});

// Insert category
router.post("/insert-category", async (req, res) => {
  try {
    const {
      category_name,
      safetyRisk,
      impactArea,
      reportFrequency,
      sub_types,
    } = req.body;

    // Convert safetyRisk, impactArea, reportFrequency to numbers
    const safetyRiskNum = parseInt(safetyRisk);
    const impactAreaNum = parseInt(impactArea);
    const reportFrequencyNum = parseInt(reportFrequency);

    // Calculate the score and determine the priority level
    const weights = (await PriorityWeights.findOne().sort({
      last_updated: -1,
    })) || {
      safety_risk: 0.5,
      impact_area: 0.3,
      report_frequency: 0.2,
    };
    const score =
      safetyRiskNum * weights.safety_risk +
      impactAreaNum * weights.impact_area +
      reportFrequencyNum * weights.report_frequency;
    let priority_level = "low";
    if (score >= 4.0) priority_level = "high";
    else if (score >= 2.0) priority_level = "mid";

    const newCategory = new Categories({
      category_name,
      safety_risk: safetyRiskNum,
      impact_area: impactAreaNum,
      report_frequency: reportFrequencyNum,
      priority_level: priority_level,
      sub_types: sub_types.split(","), // Split the subtypes string into an array
    });

    await newCategory.save();
    res.redirect("/categories");
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

// Update Category
router.post("/update-category/:categoryId", async (req, res) => {
  try {
    const { category_name, safetyRisk, impactArea, reportFrequency,sub_types} = req.body;

    // Convert values to numbers
    const safetyRiskNum = Number(safetyRisk);
    const impactAreaNum = Number(impactArea);
    const reportFrequencyNum = Number(reportFrequency);

    // Check if the values are valid numbers
    if (
      isNaN(safetyRiskNum) ||
      isNaN(impactAreaNum) ||
      isNaN(reportFrequencyNum)
    ) {
      return res.status(400).json({ message: "Invalid input data" });
    }

    // Fetch weights for priority calculation
    const weights = (await PriorityWeights.findOne().sort({
      last_updated: -1,
    })) || {
      safety_risk: 0.5,
      impact_area: 0.3,
      report_frequency: 0.2,
    };

    // Calculate score
    const score =
      safetyRiskNum * weights.safety_risk +
      impactAreaNum * weights.impact_area +
      reportFrequencyNum * weights.report_frequency;
    let priority_level = "low";
    if (score >= 4.0) priority_level = "high";
    else if (score >= 2.0) priority_level = "mid";

    // Update category in the database
    const updatedCategory = await Categories.findByIdAndUpdate(
      req.params.categoryId,
      {
        category_name,
        safety_risk: safetyRiskNum,
        impact_area: impactAreaNum,
        report_frequency: reportFrequencyNum,
        priority_level: priority_level,
        sub_types: sub_types.split(","),
      }
    );

    res.json({ message: "Category updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

// Delete Category
router.delete("/delete-category/:id", async (req, res) => {
  try {
    await Categories.findByIdAndDelete(req.params.id);
    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

module.exports = router;
