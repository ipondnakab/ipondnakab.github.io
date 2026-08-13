// Room codes are read aloud and typed by hand, so the alphabet drops the
// characters people confuse: O/0, I/1, and the letter Z against 2.
const ROOM_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXY3456789";
const ROOM_ID_LENGTH = 6;

export const createMicLinkRoomId = (): string => {
  const bytes = new Uint8Array(ROOM_ID_LENGTH);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((byte) => ROOM_ALPHABET[byte % ROOM_ALPHABET.length])
    .join("");
};
