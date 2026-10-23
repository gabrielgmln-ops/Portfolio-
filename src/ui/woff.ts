// WOFF 1.0 → TTF/OTF (tabelas com zlib). Usado só no build da imagem OG: o Pango do sharp não lê WOFF.
import { inflateSync } from 'node:zlib';

export function woffParaSfnt(woff: Buffer): Buffer {
  if (woff.readUInt32BE(0) !== 0x774f4646) throw new Error('não é WOFF 1.0');
  const flavor = woff.readUInt32BE(4);
  const n = woff.readUInt16BE(12);
  const tabelas = [];
  for (let i = 0; i < n; i++) {
    const o = 44 + i * 20;
    const tag = woff.readUInt32BE(o);
    const off = woff.readUInt32BE(o + 4);
    const comp = woff.readUInt32BE(o + 8);
    const orig = woff.readUInt32BE(o + 12);
    const soma = woff.readUInt32BE(o + 16);
    const bruto = woff.subarray(off, off + comp);
    tabelas.push({ tag, soma, dados: comp < orig ? inflateSync(bruto) : Buffer.from(bruto) });
  }
  let pot = 1;
  let log = 0;
  while (pot * 2 <= n) {
    pot *= 2;
    log++;
  }
  const cab = Buffer.alloc(12 + n * 16);
  cab.writeUInt32BE(flavor, 0);
  cab.writeUInt16BE(n, 4);
  cab.writeUInt16BE(pot * 16, 6);
  cab.writeUInt16BE(log, 8);
  cab.writeUInt16BE(n * 16 - pot * 16, 10);
  const corpos: Buffer[] = [];
  let pos = cab.length;
  tabelas.forEach((t, i) => {
    const o = 12 + i * 16;
    cab.writeUInt32BE(t.tag, o);
    cab.writeUInt32BE(t.soma, o + 4);
    cab.writeUInt32BE(pos, o + 8);
    cab.writeUInt32BE(t.dados.length, o + 12);
    const pad = (4 - (t.dados.length % 4)) % 4;
    corpos.push(t.dados, Buffer.alloc(pad));
    pos += t.dados.length + pad;
  });
  return Buffer.concat([cab, ...corpos]);
}
