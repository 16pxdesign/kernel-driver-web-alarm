const express = require('express');
require('mongoose');
const Log = require('../models/Log');

const router = express.Router();
const { auth } = require('../config/auth');



router.get('/all', auth, ((req, res) => {

    var sort = {'timestamp': -1}
     Log.find({}).sort(sort).then((result)=>{
         res.send(result)

     });






}));

module.exports = router;