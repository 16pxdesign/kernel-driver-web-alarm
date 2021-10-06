var fs = require('fs');
var server = require('net');

var path = "/dev/msecure";

var readStream = fs.createReadStream(path,{autoClose: false});

function init(callback){

    readStream.on('open', function (data){
        console.log("start reading");
    });

    readStream.on('error', function (data){
        console.log(data.message);
    });

    readStream.on('close',function (data){
        console.log("ends reading");
    });

    readStream.on('data', function (data) {
        callback(data);
    });
}


module.exports = {
    init : init
}