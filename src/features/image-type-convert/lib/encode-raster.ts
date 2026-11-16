// Small dependency-free encoders. Input pixels are top-down, straight-alpha RGBA.
export const encodeBmp = (
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
): Uint8Array<ArrayBuffer> => {
  const stride = (width * 3 + 3) & ~3;
  const bytes = new Uint8Array(54 + stride * height);
  const view = new DataView(bytes.buffer);
  bytes.set([0x42, 0x4d]);
  view.setUint32(2, bytes.length, true);
  view.setUint32(10, 54, true);
  view.setUint32(14, 40, true);
  view.setInt32(18, width, true);
  view.setInt32(22, height, true);
  view.setUint16(26, 1, true);
  view.setUint16(28, 24, true);
  view.setUint32(34, stride * height, true);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const source = (y * width + x) * 4;
      const target = 54 + (height - y - 1) * stride + x * 3;
      const alpha = pixels[source + 3] / 255;
      for (let channel = 0; channel < 3; channel++) {
        bytes[target + channel] = Math.round(
          pixels[source + 2 - channel] * alpha + 255 * (1 - alpha),
        );
      }
    }
  }
  return bytes;
};

export const encodeTiff = (
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
): Uint8Array<ArrayBuffer> => {
  const tagCount = 12;
  const bitsOffset = 8 + 2 + tagCount * 12 + 4;
  const pixelOffset = bitsOffset + 8;
  const bytes = new Uint8Array(pixelOffset + pixels.length);
  const view = new DataView(bytes.buffer);
  bytes.set([0x49, 0x49, 42, 0]);
  view.setUint32(4, 8, true);
  view.setUint16(8, tagCount, true);
  let offset = 10;
  const tag = (id: number, type: number, count: number, value: number) => {
    view.setUint16(offset, id, true);
    view.setUint16(offset + 2, type, true);
    view.setUint32(offset + 4, count, true);
    view.setUint32(offset + 8, value, true);
    offset += 12;
  };
  tag(256, 4, 1, width);
  tag(257, 4, 1, height);
  tag(258, 3, 4, bitsOffset);
  tag(259, 3, 1, 1); // No compression.
  tag(262, 3, 1, 2); // RGB.
  tag(273, 4, 1, pixelOffset);
  tag(277, 3, 1, 4);
  tag(278, 4, 1, height);
  tag(279, 4, 1, pixels.length);
  tag(284, 3, 1, 1); // Interleaved channels.
  tag(317, 3, 1, 1); // No predictor.
  tag(338, 3, 1, 2); // Unassociated alpha.
  for (let i = 0; i < 4; i++) view.setUint16(bitsOffset + i * 2, 8, true);
  bytes.set(pixels, pixelOffset);
  return bytes;
};

export const encodeIco = (
  png: Uint8Array,
  width: number,
  height: number,
): Uint8Array<ArrayBuffer> => {
  if (width < 1 || height < 1 || width > 256 || height > 256)
    throw new Error("dimensions");
  const bytes = new Uint8Array(22 + png.length);
  const view = new DataView(bytes.buffer);
  view.setUint16(2, 1, true);
  view.setUint16(4, 1, true);
  bytes[6] = width === 256 ? 0 : width;
  bytes[7] = height === 256 ? 0 : height;
  view.setUint16(10, 1, true);
  view.setUint16(12, 32, true);
  view.setUint32(14, png.length, true);
  view.setUint32(18, 22, true);
  bytes.set(png, 22);
  return bytes;
};

export const encodeGif = (
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
): Uint8Array<ArrayBuffer> => {
  const count = width * height;
  // Reset the LZW dictionary every 200 literals so all codes remain 9 bits.
  const codeCount = count + Math.ceil(count / 200) + 1;
  const packed = new Uint8Array(Math.ceil((codeCount * 9) / 8));
  let bit = 0;
  const code = (value: number) => {
    const position = bit >>> 3;
    const shift = bit & 7;
    packed[position] |= (value << shift) & 255;
    if (position + 1 < packed.length)
      packed[position + 1] |= value >>> (8 - shift);
    bit += 9;
  };
  for (let i = 0; i < count; i++) {
    if (i % 200 === 0) code(256);
    const source = i * 4;
    code(
      pixels[source + 3] < 128
        ? 0
        : 1 +
            Math.round((pixels[source] * 5) / 255) * 42 +
            Math.round((pixels[source + 1] * 6) / 255) * 6 +
            Math.round((pixels[source + 2] * 5) / 255),
    );
  }
  code(257);
  const bytes = new Uint8Array(
    800 + packed.length + Math.ceil(packed.length / 255) + 2,
  );
  const view = new DataView(bytes.buffer);
  bytes.set([71, 73, 70, 56, 57, 97]);
  view.setUint16(6, width, true);
  view.setUint16(8, height, true);
  bytes[10] = 0xf7;
  for (let i = 0; i < 252; i++) {
    const position = 13 + (i + 1) * 3;
    bytes[position] = Math.round((Math.floor(i / 42) * 255) / 5);
    bytes[position + 1] = Math.round((Math.floor((i % 42) / 6) * 255) / 6);
    bytes[position + 2] = Math.round(((i % 6) * 255) / 5);
  }
  bytes.set([0x21, 0xf9, 4, 1, 0, 0, 0, 0, 0x2c], 781);
  view.setUint16(794, width, true);
  view.setUint16(796, height, true);
  bytes[799] = 8;
  let offset = 800;
  for (let start = 0; start < packed.length; start += 255) {
    const chunk = packed.subarray(start, start + 255);
    bytes[offset++] = chunk.length;
    bytes.set(chunk, offset);
    offset += chunk.length;
  }
  bytes[offset++] = 0;
  bytes[offset++] = 0x3b;
  return bytes;
};
