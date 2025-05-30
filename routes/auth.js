// routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/Users');

// Login Page
router.get('/', (req, res) => {
  res.render('login');
});

// Login Handler
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.send('<script>alert("Invalid email!"); window.location.href="/";</script>');
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.send('<script>alert("Incorrect password!"); window.location.href="/";</script>');
    }
    req.session.user = { email: user.email };
    res.redirect('/dashboard');
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

// Profile Page
router.get('/profile', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/');
  }
  res.render('profile', { user: req.session.user });
});

// Logout
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Failed to logout.');
      }
      res.redirect('/');
    });
  });
  
module.exports = router;
