const express = require('express');
const router = express.Router();
const { auth } = require('../config/auth');



router.get('/pin', auth, ((req, res) => { res.render('pin')}));

module.exports = router;