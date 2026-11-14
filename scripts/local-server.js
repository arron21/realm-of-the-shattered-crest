// ============================================================================
// REALM OF THE SHATTERED CREST — NODE.JS HTTP & WEBSOCKET MMO REALM SERVER
// Zero external dependencies required (uses native http & crypto RFC 6455 WS)
// ============================================================================

const http = require('http');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { buildHtmlBundle } = require('../build.js');
const mmoHandler = require('../api/mmo.js');

const PORT = process.env.PORT || 4000;

// Ensure bundle is fresh on server boot
buildHtmlBundle();

const clients = new Set();

function encodeWsFrame(str) {
  const payload = Buffer.from(str, 'utf8');
  const len = payload.length;
  let header;
  if (len < 126) {
    header = Buffer.alloc(2);
    header[0] = 0x81;
    header[1] = len;
  } else if (len < 65536) {
    header = Buffer.alloc(4);
    header[0] = 0x81;
    header[1] = 126;
    header.writeUInt16BE(len, 2);
  } else {
    header = Buffer.alloc(10);
    header[0] = 0x81;
    header[1] = 127;
    header.writeBigUInt64BE(BigInt(len), 2);
  }
  return Buffer.concat([header, payload]);
}

function decodeWsFrame(buf) {
  if (buf.length < 2) return null;
  const opcode = buf[0] & 0x0f;
  if (opcode === 0x08) return { close: true };
  if (opcode !== 0x01) return null;
  const masked = (buf[1] & 0x80) !== 0;
  let len = buf[1] & 0x7f;
  let offset = 2;
  if (len === 126) {
    if (buf.length < 4) return null;
    len = buf.readUInt16BE(2);
    offset = 4;
  } else if (len === 127) {
    return null;
  }
  let mask = null;
  if (masked) {
    if (buf.length < offset + 4 + len) return null;
    mask = buf.slice(offset, offset + 4);
    offset += 4;
  }
  const data = Buffer.alloc(len);
  for (let i = 0; i < len; i++) {
    data[i] = masked ? buf[offset + i] ^ mask[i % 4] : buf[offset + i];
  }
  return { text: data.toString('utf8') };
}

const server = http.createServer((req, res) => {
  if (req.url && req.url.startsWith('/api/mmo')) {
    mmoHandler(req, res);
    return;
  }

  if (req.url === '/health' || req.url === '/health.json') {
    const state = mmoHandler.getInstanceState();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        status: 'ok',
        instanceId: state.instanceId,
        onlinePlayers: Object.keys(state.players).length
      })
    );
    return;
  }

  const indexPath = path.join(__dirname, '../public/index.html');
  fs.readFile(indexPath, (err, content) => {
    if (err) {
      res.writeHead(500);
      res.end('Error loading game bundle');
      return;
    }
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(content);
  });
});

server.on('upgrade', (req, socket) => {
  if (req.headers['upgrade'] !== 'websocket') {
    socket.destroy();
    return;
  }
  const key = req.headers['sec-websocket-key'];
  const accept = crypto
    .createHash('sha1')
    .update(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11', 'binary')
    .digest('base64');

  socket.write(
    [
      'HTTP/1.1 101 Switching Protocols',
      'Upgrade: websocket',
      'Connection: Upgrade',
      `Sec-WebSocket-Accept: ${accept}`,
      '\r\n'
    ].join('\r\n')
  );

  clients.add(socket);

  socket.on('data', (buf) => {
    try {
      const frame = decodeWsFrame(buf);
      if (!frame) return;
      if (frame.close) {
        clients.delete(socket);
        socket.end();
        return;
      }
      if (frame.text) {
        const out = encodeWsFrame(frame.text);
        for (const c of clients) {
          if (c !== socket && !c.destroyed) {
            c.write(out);
          }
        }
      }
    } catch (e) {}
  });

  socket.on('close', () => clients.delete(socket));
  socket.on('error', () => clients.delete(socket));
});

server.listen(PORT, () => {
  console.log(`Realm of the Shattered Crest MMO Server listening on http://localhost:${PORT}`);
});
