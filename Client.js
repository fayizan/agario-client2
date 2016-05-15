use strict';

const WebSocket = require('ws');
const EventEmitter = require('events').EventEmitter;

const logger = require('./logger');
const core = require('./core')('ws://139.162.45.173:1500');

class Client extends EventEmitter {

  constructor(clientName) {
    super();

    this.clientName = clientName;
    this.headers = {
      Origin: 'http://agar.io'
    };

    this.packetHandlers = {
      18: () => {
        logger.debug('Packet 18: reset all cells');
        if (!this.authenticated) {
          this._auth();
        }
        this.emit('reset');
      },
      32: (data) => {
        logger.debug('Packet 32: New ball appears');
        this.emit('newBall');
      },
      49: (data) => {
        //logger.debug('Leaderboard:', data);
        this.emit('leaderBoard', data);
      },
      112: (data) => {
        logger.debug('Packet112: Server is ready or ask for sth?');
        this._postAuth(data);
      },
      128: function() {
        logger.debug('Server asks for reload client, client is outdated?');
      },
      241: function(data) {
        logger.debug('Connected to room:', data);
      },
      255: (data) => {
        //logger.debug('World update:', data);
        this.emit('worldUpdate', data);
      }
    };
  }

  connect(server) {
    logger.debug('Connecting to ' + server);
    let options = {
      headers: this.headers
    };

    this.ws = new WebSocket(server, null, options);
    this.ws.binnaryType = 'arraybuffer';
    this.ws.onopen     = this._onOpen.bind(this);
    this.ws.onmessage  = this._onMessage.bind(this);
    this.ws.onclose    = this._onClose.bind(this);
    this.ws.onerror    = this._onError.bind(this);

    this.authenticated = false;

  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
    }
  }

  spawn(name) {
    let buf = new Buffer(2 + 2 * name.length);
    buf.writeUInt8(0, 0);
    for (let i = 0; i < name.length; i++) {
      buf.writeUInt16LE(name.charCodeAt(i), 1 + i * 2);
    }
    buf.writeUInt8(0, 0);
    this._send(buf);
  }

  _onOpen() {
    logger.debug('Socket Connected');
  }

  _onMessage(event) {
    let msg = new Uint8Array(event.data);
    let handler = this.packetHandlers[msg[0]];

    if (handler) {
      handler(msg);
    } else {
      logger.warn('Unhanded packet type:', msg);
    }
  }

  _onClose() {
    logger.debug('Socket Closed');
  }

  _onError() {
    logger.debug('Socket error');
  }

  _send(data) {
    if (!this.ws) {
      return logger.warn('WebSocket is not initialized');
    }
    this.ws.send(data);
  }

  _auth() {
    this.authenticated = true;
    logger.debug('Authenticating...');

    core.getInitData().then((data) => {
      this._send(data[0]);
      this._send(data[1]);
    });
  }

  _postAuth(packet112) {
    core.getAuthData(packet112).then((packet113) => {
      this._send(packet113);
      this.emit('connected');
    });
  }

}

module.exports = Client;
