'use strict';

const AgarClient = require('../src');
const Client = AgarClient.Client;
const server = AgarClient.server;
const client = new Client('name');

client.on('connected', () => {
  console.log('Connected to server and ready to spawn'); 
  client.spawn('SNSA');
});

client.on('newBall', (data) => {
  console.log('New ball appears');
});

server.getFFAServer({}, (resp) => {
  if (resp.error) {
    return console.log('Error while getting FFA server:', resp.error);
  }
  console.log('Connecting to:', resp.server);

  client.connect('ws://' + resp.server);
});
