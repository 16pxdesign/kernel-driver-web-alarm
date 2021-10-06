const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const passport = require('passport');

//router.get('/register', ((req, res) => res.render('register')));

router.get('/login', ((req, res) => {
    console.log(req.session.passport)
    res.render('login')

}));

// Login
router.post('/login', (req, res, next) => {

    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/user/login',
    })(req, res, next);
});

// Logout
router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/user/login');
});


router.get('/add', (async (req, res) => {
    let pass = process.env.USERPASS;
    const email = '1902371@uad.ac.uk';
    const name = 'alex';
    try {
        pass = await bcrypt.hash(pass,10);
    }catch (e){
        res.send('Fail ' + e.message);
    }

    User.findOne({email: email})
        .then(user => {
            if (user) {
                res.send('user exits');
            }else {
                const newUser = new User({
                    name: name, email: email, password: pass
                }).save().then();
                res.send(newUser);
            }



        });

}));



module.exports = router;
