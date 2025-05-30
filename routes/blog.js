const express = require('express');
// const db = require('../data/database');

const router = express.Router();
const methodOverride = require('method-override');

router.use(methodOverride('_method'));

router.get('/',(req,res)=>{
  res.render('template');
});

module.exports = router;