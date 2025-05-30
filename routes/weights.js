// routes/weights.js
const express = require('express');
const router = express.Router();
const WeightHistory = require('../models/PriorityWeights');

// List categories
router.get('/weight-priority', async (req, res) => {
  try {
    if (!req.session.user) return res.redirect('/');
   
    res.render('weight_management', { user: req.session.user});
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});
// Get all weight history
router.get('/get-weights-history', async (req, res) => {
  try {
    const history = await WeightHistory.find().sort({ last_updated: -1 });
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch weights history' });
  }
});

// Get latest weights
router.get('/priority-weights', async (req, res) => {
  try {
    const latest = await WeightHistory.findOne().sort({ last_updated: -1 });
    if (latest) {
      res.json(latest);
    } else {
      res.json({ safetyRisk: 0.33, impactArea: 0.33, reportFrequency: 0.34 });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch current weights' });
  }
});

// Update weights
router.post('/update-weights', async (req, res) => {
    try {
      const { safetyRisk, impactArea, reportFrequency } = req.body;
  
      const newWeight = new WeightHistory({
        safetyRisk: safetyRisk,
        impactArea: impactArea,
        reportFrequency: reportFrequency,
        last_updated: new Date()
      });
  
      await newWeight.save();
  
      res.json({ message: 'Weights updated successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to update weights' });
    }
  });

module.exports = router;
