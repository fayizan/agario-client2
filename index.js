const WebSocket = require('ws');
const url = 'ws://139.162.57.212:1500';
const core = require('./core')(url);
const client = new WebSocket(url, null, {
  headers: {
    Origin: 'http://agar.io'
  } 
});

client.binaryType = 'arraybuffer';

client.onerror = function() {
  console.log('Connection Error');
};

client.onopen = function() {
  console.log('WebSocket Client Connected');

  setTimeout(auth, 1000);
};

client.onclose = function() {
  console.log('WebSocket Client Closed');
};

client.onmessage = function(e) {
  //console.log("Received: '" + new Uint8Array(e.data) + "'");
  var msg = new Uint8Array(e.data);
  var handler = packetHandlers[msg[0]];

  if (handler) {
    handler(msg);
  } else {
    console.log('Unhanded packet type:', msg);
  }

};

function auth() {
  // client.send(new Uint8Array([-2, 6, 0, 0, 0]));
  // client.send(new Uint8Array([-1, 60, -95, -63, -47]))
  core.getInitData().then(function(data) {
    client.send(data[0]);
    client.send(data[1]);
  });
}

function spawn() {
  var data = new Uint8Array([0, 0]);
  client.send(data);
}

function postAuth(data) {
  core.getAuthData(data).then(function(packet113) {
    console.log('Sending packet113:', packet113);

    client.send(packet113);
    spawn();
  });
}

var packetHandlers = {
  18: function() {
    console.log('Packet 18: reset all cells');
    // auth();
  },
  49: function(data) {
    //console.log('Leaderboard:', data);
  },
  112: function(data) {
    console.log('Packet112: Server is ready or ask for sth?', data);
    postAuth(data);
  },
  128: function() {
    console.log('Server asks for reload client, client is outdated?');
  },
  241: function(data) {
    console.log('Connected to room?:', data);
    spawn();
  },
  255: function(data) {
    //console.log('World update:', data);
  }
};

