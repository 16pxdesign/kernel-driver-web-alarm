const mongoose = require('mongoose');

const LogSchema = new mongoose.Schema({
    timestamp: {
        type: String,
        required: true
    },
    device: {
        type: String,
        required: true
    },
    value: {
        type: Object,
        required: true
    }
});

const Log = mongoose.model('Log', LogSchema);
module.exports = Log;
