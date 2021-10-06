const mqtt = require('mqtt');

const Log = require('../models/Log');

const host = 'uniiotproject.ml';

const optionsmqtt = {

    host: host,
    port: 8883,
    username: 'web',
    password: 'secret',

};
const client = mqtt.connect('mqtts://' + optionsmqtt.host, optionsmqtt);

function connect(callback) {
    client.on('connect', (err) => {
        console.log('Connected to mqtt')
        client.subscribe('call/#')
        client.publish('call/all', 'true');

    });

    client.on('disconnect', () => {
        console.log('mqtt offline')

    });

    client.on('close', () => {
        console.log('mqtt close')

    });

    client.on('error', function (error) {
        console.error('Connection Error:', error);
    });

    /*client.on('message', function (topic, message){
        console.log(topic + message)
        callback(topic,message);




    })
    */

}

function message(callback) {

    client.on('message', function (topic, message) {
        console.log(topic+ ' ' + message)
        switch (topic) {
            case 'call/all':
                break;
            case 'call/back':
                client.subscribe(message + '/#');
                console.log('Subscribe ' + message);
                break;
            default:
                callback(topic, message);

        }


    })

}

function send(topic, message) {
    client.publish(topic, message);
}



module.exports = {
    connect: connect,
    message: message,
    send: send,
}