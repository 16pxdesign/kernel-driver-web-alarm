
require('mqtt');
require('socket.io');
const Log = require('../models/Log');


function subsribeInitTopic(client) {
    client.subscribe('call/#')
    client.publish('call/all', 'true');
    //subscribe all devices in network
    client.on('message', function (topic, message) {

        new Log({device: topic, value: message, timestamp: Date.now()}).save().then((result)=>{
            console.log("[save]"+result);
        });
        console.log("mongo save here")
        console.log(topic + ' ' + message)
        if (topic === 'call/back') {
            client.subscribe(message + '/#');
            console.log('Subscribe ' + message);
        }
    });
}


function onIoConnection(socket, mqtt) {

    socket.on('devices/request', (data) => {
        console.log(data)
        switch (data) {
            case 'dashboard':
                mqtt.publish('call/all', '');
                mqtt.on('message', (topic, message) => {
                    console.log('dashboard on all')
                    if (topic === 'call/back')
                        socket.emit('devices/respond', message.toString());
                });
                break
        }
    });

    socket.on('hardware/request', (data) => {
        //TODO: info z bazy danych
        console.log('data form list' + data)
        if (data != null)
            var obj = JSON.parse(data)
        console.log(obj.type)
        Log.findOne({'value.action': obj.type}, (err, result) => {

            console.log(result.value);
            socket.emit('hardware/respond', result.value);
        });

        mqtt.on('message',(topic,message)=>{
           if(topic==(obj.id)){
               try {
                   const formRP = JSON.parse(message);
                   if(formRP.type == "EVENT" || formRP.type =="ACTIVE"){
                       console.log(true);
                       socket.emit('hardware/live', JSON.stringify(formRP));
                   }
               }catch (e) {
                   console.log('cant pharse')

               }
           }
        });



    });




}




module.exports = {subsribeInitTopic, onIoConnection,

}

