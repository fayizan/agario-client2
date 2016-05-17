'use strict';

const AgarClient = require('../src');
const Client = AgarClient.Client;
const server = AgarClient.server;
const client = new Client('name');

let leaderBoards = [];

function isLeaderBoardChanged(oldData, newData) {
  if (oldData.length !== newData.length) return true;

  for (let i = 0; i < 10; ++i) {
    if (oldData[i][0] !== newData[i][0] ||
        oldData[i][1] !== newData[i][1]) {
      return true;
    }
  }

  return false;
}

function showLeaderBoard() {
  console.log('==============LEADERBOARD=>');
  for (let i = 0; i < 10; ++i) {
    console.log(`${i+1}. ${leaderBoards[i][1]}`);
  }
}

client.on('connected', () => {
  console.log('Connected to server and ready to spawn'); 
});

client.on('leaderBoard', (data) => {
  if (isLeaderBoardChanged(leaderBoards, data)) {
    leaderBoards = data;
    showLeaderBoard();
  }
});

server.getFFAServer({}, (resp) => {
  if (resp.error) {
    return console.log('Error while getting FFA server:', resp.error);
  }
  console.log('Connecting to:', resp.server);

  client.connect('ws://' + resp.server);
});
