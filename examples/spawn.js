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

client.connect(server.getFfaServer());
