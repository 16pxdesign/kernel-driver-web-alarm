const express = require('express');
const http = require('http');
const https = require('https');
const mqtt = require('mqtt');
const fs = require('fs');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const session = require('express-session');
var bodyParser = require('body-parser')
const socketio = require('socket.io');
const passportSocketIo = require('passport.socketio');
const cookieParser = require('cookie-parser')
const broker = require('./helpers/broker')
const {auth} = require('./config/auth');

//const Log = require('./models/Log');

const passport = require('passport');
require('./config/passport')(passport);


const strings = require('./config/strings');
const MongoStore = require('connect-mongo')(session);

//Database
const optionsdb = {useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true};
mongoose.connect(strings.MongoStringDockerAWS, optionsdb)
    .then(() => console.log('Mongo ready.'))
    .catch(err => console.log('Problem with database connection: ' + err.message));

const monStore = new MongoStore({mongooseConnection: mongoose.connection});


const host = 'uniiotproject.ml';
const app = express();


//create server
const options = {
    key: fs.readFileSync('./certs/live/uniiotproject.ml/privkey.pem'),
    cert: fs.readFileSync('./certs/live/uniiotproject.ml/cert.pem'),
    ca: fs.readFileSync('./certs/live/uniiotproject.ml/fullchain.pem')
};
const server = https.createServer(options, app)
server.listen(443)
http.createServer(app).listen(80);

//SSL Redirect
app.use(function (req, res, next) {
    if (req.secure) {
        next();
    } else {
        res.redirect('https://' + req.headers.host + req.url);
    }
});


//EJS
app.use(expressLayouts);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

//Bodypharser
app.use(cookieParser())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}))


//Session
app.use(session({
    secret: 'secret',
    resave: true,
    key: 'express.sid',
    saveUninitialized: true,
    store: monStore
}));

//Passport

app.use(passport.initialize());
app.use(passport.session())


//MQTT
const optionsmqtt = {

    host: host,
    port: 8883,
    username: 'web',
    password: 'secret',

};
const clientMQTT = mqtt.connect('mqtts://' + optionsmqtt.host, optionsmqtt);
clientMQTT.on('connect', () => {
    console.log('MQTT connect')
    broker.subsribeInitTopic(clientMQTT);

});


//Routes
app.use("/public", express.static(__dirname + '/public'));
app.use('/', require('./routes/dashboard'));
app.use('/user', require('./routes/user'));
app.use('/dashboard', require('./routes/dashboard'));
app.use('/device', require('./routes/device'));
app.use('/dev', require('./routes/dev'));
app.use('/alarm', require('./routes/alarm'));
app.use('/logs', require('./routes/Logs'));
//A litle bit hard coded turning off alamrms
app.post('/off', auth, function (req, res, next) {
    if (req.body.pin == 1234){
        const cmd = new Object();
        cmd.type = "CMD"
        cmd.action = "UNARM"
        const s = JSON.stringify(cmd);
        clientMQTT.publish('call/all',s);
    }
    res.redirect('/dashboard')
});


clientMQTT.on('disconnect', () => {
    console.log('mqtt offline')

});

clientMQTT.on('close', () => {
    console.log('mqtt close')

});

clientMQTT.on('error', function (error) {
    console.error('Connection Error:', error);
});



//Socket IO SSL
const io = socketio(server);
io.use(passportSocketIo.authorize({
    cookieParser: cookieParser,
    key: 'express.sid',
    secret: 'secret',
    store: monStore,
    success: onAuthorizeSuccess,
    fail: onAuthorizeFail,

}));

function onAuthorizeSuccess(data, accept) {
    console.log('Successful connection to socket.io');
    accept();
}


function onAuthorizeFail(data, message, error, accept) {
    if (error)
        throw new Error(message);
    console.log('failed connection to socket.io:', message);
}


io.on('connection', socket => {
    broker.onIoConnection(socket, clientMQTT);
    socket.on('disconnect', () => {
        console.log('io disconnect');
    })
});


//docker run -p 80:80 -p 443:443 -v $(pwd):/app/app -v $(pwd)/certs:/app/certs -e USERPASS="secret" web