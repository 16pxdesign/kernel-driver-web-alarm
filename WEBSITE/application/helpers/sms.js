const request = require('request');

function sendSMS(message) {

    request("https://platform.clickatell.com/messages/http/send?apiKey=p0iUSlJlSASbL025L7XTlQ==&to=447440790384&content=" + message, function (error, response, body) {
        console.error('error:', error);
        console.log('statusCode:', response && response.statusCode);
        console.log('body:', body);
    });

}

module.exports = {
    send : sendSMS,
};