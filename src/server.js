'use strict';

// Thanks to:
// https://github.com/pulviscriptor/agario-client/blob/master/servers.js

let http = require('http');

let servers = {
  init_key: 154669603, //used in initial packet id 255 and POST requests, hardcoded in client

  postRequest: function(opt, cb) {
    let ret = {
      error: null,
      error_source: null,
      res: null,
      data: null,
      server: null,
      key: null
    };

    let options = {
      host: opt.ip || 'm.agar.io',
      port: 80,
      path: opt.url || '/',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': opt.data.length,
        'Origin': 'http://agar.io',
        'Referer': 'http://agar.io/',
        'Host': 'm.agar.io'
      }
    };
    if(opt.agent) options.agent = opt.agent;
    if(opt.local_address) options.localAddress = opt.local_address;

    let req = http.request(options, function(res) {
      let server = '';

      res.setEncoding('utf8');
      res.on('data', function (chunk) {
        server += chunk;
      });
      res.on('end', function() {
        let data = server.split('\n');

        if(res.statusCode != 200) {
          ret.error = 'WRONG_HTTP_CODE';
          ret.res = res;
          ret.data = server;
        }else if(!data[ opt.res_data_index===undefined?1:opt.res_data_index ]) {
          ret.error = 'WRONG_DATA_FORMAT';
          ret.res = res;
          ret.data = server;
        }else{
          ret.res = res;
          ret.data = server;
          ret.server = data[0];
          ret.key = data[1];
        }

        cb(ret);
      });
    });

    req.on('error', function(e) {
      ret.error = 'REQUEST_ERROR';
      ret.error_source = e;
      return cb(ret);
    });

    req.write(opt.data);
    req.end();
  },

  getFFAServer: function(opt, cb) {
    if(!opt) opt = {};
    let region = opt.region || 'EU-London';
    let post_opt = {
      data: region + '\n' + servers.init_key,
      agent: opt.agent,
      ip: opt.ip,
      resolve: opt.resolve
    };
    servers.postRequest(post_opt, cb);
  },

  getTeamsServer: function(opt, cb) {
    if(!opt) opt = {};
    let region = opt.region || 'EU-London';
    let post_opt = {
      data: region + ':teams\n' + servers.init_key,
      agent: opt.agent,
      ip: opt.ip,
      resolve: opt.resolve
    };
    servers.postRequest(post_opt, cb);
  },

  getExperimentalServer: function(opt, cb) {
    if(!opt) opt = {};
    let region = opt.region || 'EU-London';
    let post_opt = {
      data: region + ':experimental\n' + servers.init_key,
      agent: opt.agent,
      ip: opt.ip,
      resolve: opt.resolve
    };
    servers.postRequest(post_opt, cb);
  },

  createParty: function(opt, cb) {
    if(!opt) opt = {};
    let region = opt.region || 'EU-London';
    let post_opt = {
      data: region + ':party\n' + servers.init_key,
      agent: opt.agent,
      ip: opt.ip,
      resolve: opt.resolve
    };
    servers.postRequest(post_opt, cb);
  },

  getPartyServer: function(opt, cb) {
    if(!opt.party_key) throw new Error('getPartyServer wants opt.party_key');
    let party_key = (opt.party_key.indexOf('#') >= 0) 
      ? opt.party_key.substr(opt.party_key.indexOf('#')+1) 
      : opt.party_key;
    let post_opt = {
      url: '/getToken',
      data: party_key,
      res_data_index: 0,
      agent: opt.agent,
      ip: opt.ip,
      resolve: opt.resolve
    };
    servers.postRequest(post_opt, function(res) {
      if(!res.server) return cb(res);
      res.key = party_key;
      cb(res);
    });
  }
};

module.exports = servers;
