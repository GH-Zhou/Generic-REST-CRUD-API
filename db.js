module.exports = function () {
    const mongoose = require('mongoose');
    const databaseName = 'extra-credit';
    var connectionString = 'mongodb://localhost/';
    connectionString += databaseName;
    mongoose.connect(connectionString);
    console.log("Connected to mongodb...");
};