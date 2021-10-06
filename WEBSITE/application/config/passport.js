const strategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
const User = require('../models/User');

module.exports = function (passport) {

    passport.use(
        new strategy({ usernameField : 'email'}, (email,password,done) => {
            User.findOne({email:email})
                .then(user => {
                    if(!user){
                        console.log('Not registered')
                        return done(null, false, { message:'Not registered'});
                    }

                    bcryptjs.compare(password, user.password, (err, isMatch)=>{
                         if(err) throw err;

                         if(isMatch){
                             return done(null,user);
                         }else {
                             console.log('Wrong password')
                             return done(null, false, {message: 'Wrong password'});
                         }
                    });
                })
                .catch(err => console.log(err.message));
        })
    );

    passport.serializeUser(function (user, done){
        done(null, user.id);
    });

    passport.deserializeUser(function (id,done){
        User.findById(id, function (err,user){
            done(err,user);
        });
    });
}
