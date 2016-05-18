'use strict';

const WebSocket = require('ws');
const EventEmitter = require('events').EventEmitter;

const logger = require('./logger');
const core = require('./core')('ws://fakeserver');
const PacketDecoder = require('./PacketDecoder');
const packetDecoder = new PacketDecoder();

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
        this.emit('newBall', data);
      },
      49: (data) => {
        this.emit('leaderBoard', this._decode(data));
      },
      112: (data) => {
        logger.debug('Packet 112: Post auth');
        this._postAuth(data);
      },
      128: () => {
        logger.debug('Packet 128: Socket closed, client is outdated?');
        this.disconnect();
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
    let data = event.data;
    let opcode = data.readUInt8(0);
    let handler = this.packetHandlers[opcode];

    if (handler) {
      handler(data);
    } else {
      logger.warn('Unhanded packet type:', data);
    }
  }

  _onClose() {
    logger.info('Socket Closed');
    this.emit('disconnected');
  }

  _onError() {
    logger.warn('Socket error');
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

  _decode(data) {
    return packetDecoder.decode(data);
  }

}

module.exports = Client;
