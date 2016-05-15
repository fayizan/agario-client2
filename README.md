# agario-client2
Client API for Agar.io v2

# Installation

Sorry, [no NPM package support](https://medium.com/@azerbike/i-ve-just-liberated-my-modules-9045c06be67c), you can install it directly through Github:

`npm install https://github.com/SNSA/agario-client2.git --save`

# Usage

```JavaScript
const AgarClient = require('agario-client2');
const Client = AgarClient.Client;
const server = AgarClient.server;
const client = new Client('clientName');

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
```

# API

## Client

`let client = new AgarClient.Client(clientName)`

### Client methods

- `client.connect(server)`: connect to Agar server
- `client.disconnect()`: disconnect from Agar server
- `client.spawn(nickName)`: spawn a ball

### Client events

In this list `on.eventName(param1, param2)` means you need to do
`client.on('eventName', function(param1, param2) { ... })`

- `on.connected()`: connected to server and ready to spawn
- `on.newBall(data: Uint8Array)`: new ball appears, sent when respawned or split (manually or by hitting a virus)
- `on.reset()`: reset all balls, sent when start a new game
- `on.leaderBoard(data: Uint8Array)`: leaderboard information
- `on.worldUpdate(data: Uint8Array)`: world update, contains all information needed to draw the visible cells

## server

`let server = AgarClient.server`

See [this](https://github.com/pulviscriptor/agario-client#servers).

# License

MIT

