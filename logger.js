var winston = require('winston');
var path    = require('path');

winston.emitErrs = true;

var getLabel = function(callingModule) {
  'use strict';
  var module = process.mainModule.filename.match(/[\w-]+\.js/gi)[0];
  if (!(callingModule && callingModule.filename)) {
    return module + ' NOMOD  ';
  }
  var parts = callingModule.filename.split('/');
  return module + ' ' + (parts[parts.length - 2] + '/' + parts.pop());
};

module.exports = function(callingModule) {
  'use strict';
  var splitM =  callingModule.filename.split('/');
  var modul = splitM[splitM.length - 2];
  return new winston.Logger({
    transports: [
            new winston.transports.File({
              level: 'info',
              filename: path.resolve(__dirname , 'logs/trello-github.log'),
              handleExceptions: true,
              json: true,
              maxsize: 5242880, //5MB
              maxFiles: 5,
              colorize: false,
              label: getLabel(callingModule),
              timestamp: true
            }),
            new winston.transports.Console({
              level: 'info',
              handleExceptions: true,
              json: false,
              colorize: true,
              label: getLabel(callingModule),
              timestamp: true
            })
        ],
    exitOnError: true
  });
}
