const mqtt = require('./mqtt');
const driver = require('./read');
var check = require('./empty');
const ioctl = require('./ioctl');


mqtt.connect();

driver.init(function (data) {
    data = data.toString()
    var message = new Object();
    message.timestamp = Date.now();
    console.log(data)
    switch (data) {
        case "SOFT":
            message.type = 'EVENT';
            message.action = "ARM";
            message.value = 2;
            break;
        case "ARM":
            message.type = 'EVENT';
            message.action = "ARM";
            message.value = 1;
            break;
        case "UNARM":
            message.type = 'EVENT';
            message.action = "ARM";
            message.value = 0;
            break;
        case "ALARM":
            message.type = 'EVENT';
            message.action = "ALARM";
            message.value = 1;
            break;
        case "UNALARM":
            message.type = 'EVENT';
            message.action = "ALARM";
            message.value = 0;
            break;
        case 'PIR':
            message.type = 'ACTIVE';
            message.action = 'PIR';
            break;
        case 'BUTTON':
            message.type = 'ACTIVE';
            message.action = 'BUTTON';
            break;
        case 'RESISTOR':
            message.type = 'ACTIVE';
            message.action = 'RESISTOR';
            break;
        case 'DOOR':
            message.type = 'ACTIVE';
            message.action = 'DOOR';
            break;



    }
    try{
        message = JSON.stringify(message);
        mqtt.send(process.env.DEVICE_ID, message);
    }catch (e) {
        console.log('Problem to send message to broker')
    }

})


mqtt.message((topic, message) => {
    console.log(topic)

    try {
        message = JSON.parse(message);
        if (message.type == 'CMD') {
            switch (message.action) {
                case 'ARM':
                    ioctl.arm();
                    break;
                case 'UNARM':
                    ioctl.unarm();
                    break;
                case 'SOFT':
                    ioctl.softarm();
                    break;
                case 'INFO':
                    ioctl.info(message.value, (res) =>{
                        message.type = 'RES'
                        message.timestamp = Date.now();
                        message.result = res;
                        message = JSON.stringify(message);
                        mqtt.send(process.env.DEVICE_ID, message);
                    });
                    break;
            }
        }

    } catch (e) {
        console.log('Mqtt message no json')
    }


});

