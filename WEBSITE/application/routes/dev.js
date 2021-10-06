const express = require('express');
const router = express.Router();
const User = require('../models/User');

const email = 'email';
const password = 'pass';
const name = 'name';

router.get('/',(req, res) => {

    const user = new User({
        email,password,name
    });

    console.log(user);

    user.save()
        .catch(err => console.log(err));

    console.log(User.find());
    res.send('ok');

});

module.exports = router;
