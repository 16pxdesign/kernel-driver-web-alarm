const mqtt = require('mqtt');
require('dotenv/config')

const optionsmqtt = {

    host: process.env.MQTT_HOST,
    port: process.env.MQTT_PORT,
    username: process.env.MQTT_USER,
    password: process.env.MQTT_PASS,

};
const client = mqtt.connect('mqtts://' + optionsmqtt.host, optionsmqtt);

function connect() {

    client.on('connect',()=>{
        console.log('Connected to mqtt')
        client.subscribe('call/#')
        client.publish('call/back',process.env.DEVICE_ID,);
        client.subscribe(process.env.DEVICE_ID + '/#');

    })

    client.on('disconnect', () => {
        console.log('mqtt offline')

    });

    client.on('close', () => {
        console.log('mqtt close')

    });

    client.on('error', function (error) {
        console.error('Connection Error:', error);
    });
}

function message(callback) {

    client.on('message', function (topic, message){

        switch (topic) {
            case 'call/all':
                client.publish('call/back',process.env.DEVICE_ID);
        }

        callback(topic,message)
    })

}

function send(topic,message) {
    client.publish(topic, message);
}


module.exports = {
    connect : connect,
    message : message,
    send : send,
}