import { Buffer } from 'buffer';

type BufferModule = typeof import('buffer') & { SlowBuffer?: typeof Buffer };

const bufferModule = require('buffer') as BufferModule;

if (typeof bufferModule.SlowBuffer === 'undefined') {
  bufferModule.SlowBuffer = Buffer;
}

const globalWithSlowBuffer = globalThis as typeof globalThis & { SlowBuffer?: typeof Buffer };
if (typeof globalWithSlowBuffer.SlowBuffer === 'undefined') {
  globalWithSlowBuffer.SlowBuffer = Buffer;
}
