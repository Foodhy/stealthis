import type { StyleForgeGeneratedFile } from "@stealthis/schema/styleforge";

function createDosTimestamp(date: Date): { time: number; day: number } {
  const year = Math.max(date.getFullYear() - 1980, 0);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = Math.floor(date.getSeconds() / 2);

  const dosTime = (hours << 11) | (minutes << 5) | seconds;
  const dosDay = (year << 9) | (month << 5) | day;

  return { time: dosTime, day: dosDay };
}

function createCrc32Table(): Uint32Array {
  const table = new Uint32Array(256);

  for (let index = 0; index < 256; index += 1) {
    let value = index;

    for (let bit = 0; bit < 8; bit += 1) {
      if ((value & 1) === 1) {
        value = 0xedb88320 ^ (value >>> 1);
      } else {
        value >>>= 1;
      }
    }

    table[index] = value >>> 0;
  }

  return table;
}

const CRC32_TABLE = createCrc32Table();

function crc32(data: Uint8Array): number {
  let value = 0xffffffff;

  for (const byte of data) {
    value = CRC32_TABLE[(value ^ byte) & 0xff] ^ (value >>> 8);
  }

  return (value ^ 0xffffffff) >>> 0;
}

class ByteWriter {
  private readonly chunks: Uint8Array[] = [];

  private byteLength = 0;

  append(chunk: Uint8Array): void {
    this.chunks.push(chunk);
    this.byteLength += chunk.byteLength;
  }

  appendU16(value: number): void {
    const buffer = new Uint8Array(2);
    new DataView(buffer.buffer).setUint16(0, value, true);
    this.append(buffer);
  }

  appendU32(value: number): void {
    const buffer = new Uint8Array(4);
    new DataView(buffer.buffer).setUint32(0, value >>> 0, true);
    this.append(buffer);
  }

  get size(): number {
    return this.byteLength;
  }

  toUint8Array(): Uint8Array {
    const output = new Uint8Array(this.byteLength);
    let offset = 0;

    for (const chunk of this.chunks) {
      output.set(chunk, offset);
      offset += chunk.byteLength;
    }

    return output;
  }
}

export function createZipBlob(files: StyleForgeGeneratedFile[]): Blob {
  const encoder = new TextEncoder();
  const writer = new ByteWriter();
  const centralRecords: Array<{
    pathBytes: Uint8Array;
    crc: number;
    size: number;
    offset: number;
    dosTime: number;
    dosDay: number;
  }> = [];

  const now = new Date();
  const { time: dosTime, day: dosDay } = createDosTimestamp(now);

  for (const file of files) {
    const pathBytes = encoder.encode(file.path);
    const contentBytes = encoder.encode(file.content);
    const checksum = crc32(contentBytes);
    const offset = writer.size;

    writer.appendU32(0x04034b50);
    writer.appendU16(20);
    writer.appendU16(0);
    writer.appendU16(0);
    writer.appendU16(dosTime);
    writer.appendU16(dosDay);
    writer.appendU32(checksum);
    writer.appendU32(contentBytes.byteLength);
    writer.appendU32(contentBytes.byteLength);
    writer.appendU16(pathBytes.byteLength);
    writer.appendU16(0);
    writer.append(pathBytes);
    writer.append(contentBytes);

    centralRecords.push({
      pathBytes,
      crc: checksum,
      size: contentBytes.byteLength,
      offset,
      dosTime,
      dosDay,
    });
  }

  const centralStart = writer.size;

  for (const record of centralRecords) {
    writer.appendU32(0x02014b50);
    writer.appendU16(20);
    writer.appendU16(20);
    writer.appendU16(0);
    writer.appendU16(0);
    writer.appendU16(record.dosTime);
    writer.appendU16(record.dosDay);
    writer.appendU32(record.crc);
    writer.appendU32(record.size);
    writer.appendU32(record.size);
    writer.appendU16(record.pathBytes.byteLength);
    writer.appendU16(0);
    writer.appendU16(0);
    writer.appendU16(0);
    writer.appendU16(0);
    writer.appendU32(0);
    writer.appendU32(record.offset);
    writer.append(record.pathBytes);
  }

  const centralSize = writer.size - centralStart;

  writer.appendU32(0x06054b50);
  writer.appendU16(0);
  writer.appendU16(0);
  writer.appendU16(centralRecords.length);
  writer.appendU16(centralRecords.length);
  writer.appendU32(centralSize);
  writer.appendU32(centralStart);
  writer.appendU16(0);

  return new Blob([writer.toUint8Array()], { type: "application/zip" });
}

export function downloadZip(files: StyleForgeGeneratedFile[], fileName = "styleforge-kit.zip"): void {
  const blob = createZipBlob(files);
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}
