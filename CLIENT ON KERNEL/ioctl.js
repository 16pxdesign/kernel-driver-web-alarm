var fs = require('fs');
var ioctl = require('ioctl');
var ref = require('ref');
var StructType = require('ref-struct');
var ArrayType = require('ref-array');

var path = "/dev/msecure";

function cmd(hex, callback) {

    fs.open(path, 'r+', function (err, fd) {
        if (err)
            throw err;
        var res = ioctl(fd, hex, null);
        if(res<1)
            return

        callback(res);
        fs.close(fd, function () {
            console.log('close ioctl file')
        });

    })

}

function arm_alarm() {
    cmd(0x20, function (res) {
        if(res<1)
            return
        console.log('Alarm armed')
    });
}

function soft_alarm() {
    cmd(0x41, function (res) {
        if(res<1)
            return
        console.log('Alarm soft armed')
    });
}

function un_alarm() {
    cmd(0x10, function (res) {
        if(res<1)
            return
        console.log('Alarm unarmed')
    });
}

function getInfo(value, callback){
    if(value == null || value == undefined) throw new Error("NO VALUE FOR INFO TCTRL");

    var gpiodevice = StructType({
        name: ArrayType(ref.types.uchar, 255),
        val: ref.types.int
    });

    fs.open(path, 'r+', function (err, fd) {
        if (err)
            throw err;

        const hax = 0x30;

        var info = new gpiodevice();
        info.name = Array.from(value);

        //pass struct reference
        var res = ioctl(fd, hax, info.ref());


        console.log(info.val);
        fs.close(fd, function () {
            console.log('close ioctl file')
        });
        callback(info.val);

    })


}

function sendData() {
    var testdata = StructType({
        data: ArrayType(ref.types.uchar, 255),
        val: ref.types.int
    });

    fs.open(path, 'r+', function (err, fd) {
        if (err)
            throw err;

        const hax = 0x54;

        var info = new testdata();
        //info.data = Array.from("ok im here");
        console.log(info.data.buffer.toString());

        //pass struct reference
        var res = ioctl(fd, hax, info.ref());

        //printout
        console.log(info.data.buffer.toString());
        console.log(info.val);


        /*  work with buffer (finding solution)

        const hax = 0x54;
        var buffer = new Buffer(255); //set size for handle all message.
        var res = ioctl(fd, hax, buffer);
        console.log(buffer.toString());
        */

        /* test pipeline

        const hax = 0x54;
        var res = ioctl(fd, hax, null);
        console.log(res.data);
         */
    });

}

module.exports = {
    arm: arm_alarm,
    unarm: un_alarm,
    softarm: soft_alarm,
    info: getInfo
}