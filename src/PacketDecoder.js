'use strict';

const StringDecoder = require('string_decoder').StringDecoder;
const decoder = new StringDecoder('utf8');

class PacketDecoder {
  
  constructor() {
    this.decoders = {
      49: this._packet49
    };
  }

  decode(data) {
    let opcode = data.readUInt8(0);
    let decoder = this.decoders[opcode];

    return decoder && decoder(data);
  }

  _packet49(data) {
    let entries = [];
    let offset = 1;
    let count = data.readUInt32LE(offset);

    offset += 4;

    for (let i = 0; i < count; ++i) {
      let highlight = data.readUInt32LE(offset);

      offset += 4;

      let len = 0;

      // looking for the null terminated string
      while(data.readUInt8(offset + len) !== 0) { ++len; }

      let strBuf = data.slice(offset, offset + len);

      entries.push([highlight, decoder.write(strBuf)]);

      offset += len + 1;
    }

    return entries;
  }

}

module.exports = PacketDecoder;
