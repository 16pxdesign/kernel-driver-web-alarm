module.exports = {
    auth: function(req, res, next) {
        if (req.isAuthenticated()) {
            console.log('Auth ok')
            return next();
        }
        console.log('not auth');
        res.redirect('/user/login');
    }
};