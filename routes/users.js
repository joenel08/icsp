// routes/users.js
const express = require('express');
const router = express.Router();
const User = require('../models/Users');

// List users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({ userType: { $ne: "admin" } });
    res.render('users', { user: req.session.user, users });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

// Deactivate user
router.post('/deactivate-user/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send("User not found");
    }
    user.status = user.status === 1 ? 0 : 1;
    await user.save();
    res.json({ success: true, status: user.status });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

module.exports = router;
