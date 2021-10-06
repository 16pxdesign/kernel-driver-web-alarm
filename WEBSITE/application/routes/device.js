const express = require('express');
const router = express.Router();
const { auth } = require('../config/auth');

router.get('/:id', auth, (req, res) => res.render('listdev',{ devid: req.params.id }));

module.exports = router;