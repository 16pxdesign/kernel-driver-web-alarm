var fs = require('fs');
var path = "/dev/msecure";
var readStream = fs.createReadStream(path);


readStream.on('data', function (data) {
    console.log(data.toString());
});

fs.open(path, 'w', function(err, fd) {
    if (err) {
        throw 'error opening file: ' + err;
    }
    var buffer = new Buffer("some content");

    fs.write(fd, buffer, 0, buffer.length, null, function(err) {
        if (err) throw 'error writing file: ' + err;
        fs.close(fd, function() {
            console.log('file written');
        })
    });
});

