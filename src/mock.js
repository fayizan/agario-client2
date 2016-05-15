'use strict';

const window = {};
const elementMock = {
  getContext: function() {
    return {
      canvas: {},
      clearRect: function() {},
      save: function() {},
      translate: function() {},
      scale: function() {},
      restore: function() {},
      fillRect: function() {},
      measureText: function() {
        return {};
      },
      strokeText: function() {},
      fillText: function() {},
      drawImage: function() {}
    };
  },
  innerText: '',
  div: {
    appendChild: function() {}
  },
  appendChild: function() {},
  style: {}
};
const document = {
  getElementById: function() {
    return elementMock;
  },
  createElement: function(name) {
    return elementMock;
  },
  body: {
    firstChild: {},
    insertBefore: function() {}
  }
};

function WebSocket(url, protocols) {
  this.readyState = 1;
  window.ws = this;
};

WebSocket.prototype.send = function() {};

GLOBAL.WebSocket = WebSocket;
GLOBAL.window = window;
GLOBAL.document = document;
GLOBAL.Image = function() {};

module.exports = {
  WebSocket: WebSocket
};
