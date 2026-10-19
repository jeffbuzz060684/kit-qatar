var fs = require("fs");
var zlib = require("zlib");

var CRC_TABLE = [];
for (var n = 0; n < 256; n++) {
  var c = n;
  for (var k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  CRC_TABLE[n] = c >>> 0;
}
function crc32(buf) {
  var c = 0xffffffff;
  for (var i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  var len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  var t = Buffer.from(type, "ascii");
  var body = Buffer.concat([t, data]);
  var crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}
function writePNG(path, W, draw) {
  var raw = Buffer.alloc((W * 4 + 1) * W);
  var o = 0;
  for (var y = 0; y < W; y++) {
    raw[o++] = 0;
    for (var x = 0; x < W; x++) {
      var px = draw(x, y);
      raw[o++] = px[0]; raw[o++] = px[1]; raw[o++] = px[2]; raw[o++] = px[3];
    }
  }
  var ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(W, 0);
  ihdr.writeUInt32BE(W, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  var png = Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0))
  ]);
  fs.writeFileSync(path, png);
  console.log(path, png.length, "octets");
}

function hex(h) { return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]; }
var BG = hex("#8A1538");
var FG = hex("#ffffff");

var BUB = { x: 256, y: 228, r: 140 };
var TAIL = { x: 176, y: 380, r: 38 };
var DOTS = [196, 256, 316].map(function (x) { return { x: x, y: 228, r: 23 }; });
var RAD = 104;

function roundedIn(x, y, W) {
  if (x < 0 || y < 0 || x >= W || y >= W) return false;
  var r = RAD * W / 512;
  var x0 = r, y0 = r, x1 = W - r, y1 = W - r;
  if (x >= x0 && x < x1) return true;
  if (y >= y0 && y < y1) return true;
  var cx = x < x0 ? x0 : x1;
  var cy = y < y0 ? y0 : y1;
  var dx = x - cx, dy = y - cy;
  return dx * dx + dy * dy <= r * r;
}
function inCircle(x, y, s, c) {
  var dx = x - c.x * s, dy = y - c.y * s, r = c.r * s;
  return dx * dx + dy * dy <= r * r;
}
function draw(W) {
  var s = W / 512;
  return function (x, y) {
    for (var i = 0; i < DOTS.length; i++) if (inCircle(x, y, s, DOTS[i])) return [BG[0], BG[1], BG[2], 255];
    if (inCircle(x, y, s, BUB) || inCircle(x, y, s, TAIL)) return [FG[0], FG[1], FG[2], 255];
    if (roundedIn(x, y, W)) return [BG[0], BG[1], BG[2], 255];
    return [0, 0, 0, 0];
  };
}
writePNG("icon-512.png", 512, draw(512));
writePNG("icon-192.png", 192, draw(192));
