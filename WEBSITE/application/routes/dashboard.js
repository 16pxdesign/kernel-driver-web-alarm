const express = require('express');
const router = express.Router();
const { auth } = require('../config/auth');

router.get('/', auth, (req, res) => res.render('dash',{ user: req.user.name }));

module.exports = router;