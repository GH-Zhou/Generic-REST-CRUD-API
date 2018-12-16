module.exports = function () {
    const mongoose = require('mongoose');
    let connectionString = 'mongodb://localhost/extra-credit'; // local run

    if (process.env.MLAB_USERNAME) { // remote run
        let username = process.env.MLAB_USERNAME;
        let password = process.env.MLAB_PASSWORD;
        connectionString = 'mongodb://' + username + ':' + password;
        connectionString += "@ds135760.mlab.com:35760/heroku_q62hfgw4";
    }

    mongoose.connect(connectionString);
    console.log("Connected to mongodb...");
};