const express = require("express");
const router = express.Router();
const User = require("../models/Users");
const Concern_List = require("../models/Concern_list");

// Dashboard route
router.get('/dashboard', async (req, res) => {
  if (!req.session.user) {
    return res.redirect('/');
  }
  
  try {
    const totalUsers = await User.countDocuments({ userType: { $ne: "admin" } });
    const concernsStats = await Concern_List.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ["$concern_status", "completed"] }, 1, 0] } },
          ongoing: { $sum: { $cond: [{ $eq: ["$concern_status", "on-going"] }, 1, 0] } },
          totalSubmission: { $sum: 1 }

        }
      }
    ]);

    const stats = {
      totalUsers: totalUsers,
      totalConcerns: concernsStats[0]?.total || 0,
      totalCompleted: concernsStats[0]?.completed || 0,
      totalOngoing: concernsStats[0]?.ongoing || 0,
      totalSubmitted: concernsStats[0]?.totalSubmission || 0
    };

    res.render('template', { 
      user: req.session.user,
      stats: stats 
    });
  } catch (error) {
    console.error('Error loading dashboard:', error);
    res.status(500).send('Server error');
  }
});

module.exports = router;