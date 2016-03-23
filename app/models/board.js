var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var BoardSchema   = new Schema({
    title: {type: String, index: {unique: true}},
    description: String,
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    tasks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task'
    }]

});

module.exports = mongoose.model('Board', BoardSchema);