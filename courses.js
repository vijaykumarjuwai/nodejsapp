const mongoose = require('mongoose');

const courseScehma = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: String
});

module.exports = mongoose.model('Course', courseScehma);