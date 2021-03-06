'use strict';

const http = require('http');
const fs = require('fs');
const q = require('q');

const WebSocket = require('./mock').WebSocket;
const logger = require('./logger');

let ready = q.defer();
let promises = {};

function downloadCoreScript(callback) {
  let dest = __dirname + '/agario.core.js';
  let file = fs.createWriteStream(dest);

  http.get('http://agar.io/agario.core.js?' + Math.floor(new Date/1E3/60), function(resp) {
    resp.pipe(file);

    file.on('finish', function() {
      file.close(callback);
    });
  }).on('error', function(err) {
    fs.unlink(dest);

    callback(err);
  });
}

WebSocket.prototype.send = function(data) {
  if ([16].indexOf(data[0]) > -1 ) return;

  let code = data[0];
  let promise = promises[code];

  if (promise) {
    promise.resolve(data.slice(0));
    delete promises[code];
  }
};

function getInitData() {
  return ready.promise.then(function() {
    let deferred1 = q.defer();
    let deferred2 = q.defer();

    promises[-1] = deferred1;
    promises[-2] = deferred2;

    window.ws.onopen();
    
    return q.all([deferred2.promise, deferred1.promise]);

  });
}

function getAuthData(packet112) {
  return ready.promise.then(function() {
    let deferred = q.defer();

    promises[113] = deferred;

    window.ws.onmessage({ data: packet112 });

    return deferred.promise;
  });
}


module.exports = function(url) {
  // always download latest version of the core
  downloadCoreScript(function(err) {
    if (err) {
      return logger.error('Error while downloading agario.core.js', err);
    }

    require('./agario.core.js');

    setTimeout(function() {
      window.core.connect(url);
      ready.resolve();
    }, 3000);
  });

  return {
    getInitData: getInitData,
    getAuthData: getAuthData
  };
};
