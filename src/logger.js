'use strict';

var winston = require('winston');
winston.emitErrs = true;

var logger = new winston.Logger({
  exitOnError: false,
  transports: [
    new winston.transports.Console({
        level: process.env.DEBUG || 'info',
        handleExceptions: true,
        json: false,
        prettyPrint: true,
        colorize: true
    })
  ]
});

module.exports = logger;
