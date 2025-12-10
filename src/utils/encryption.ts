import nacl from "tweetnacl";
import { decodeBase64, encodeBase64, decodeUTF8, encodeUTF8 } from "tweetnacl-util";

const fromHexString = (hexString: string): Uint8Array => {
  if (hexString.length % 2 !== 0) {
    throw new Error("Invalid hex string");
  }

  const bytes = new Uint8Array(hexString.length / 2);
  for (let i = 0; i < hexString.length; i += 2) {
    bytes[i / 2] = parseInt(hexString.substring(i, i + 2), 16);
  }
  return bytes;
};

const concatArrays = (...arrays: Uint8Array[]): Uint8Array => {
  const totalLength = arrays.reduce((acc, arr) => acc + arr.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
};

export const encryptFilePath = async (filePathKey: string, publicKey: string): Promise<string> => {
  try {
    const messageUint8 = decodeUTF8(filePathKey);
    const keyUint8 = fromHexString(publicKey);

    const ephemeral = nacl.box.keyPair();
    const nonce = nacl.randomBytes(nacl.box.nonceLength);

    const ciphertext = nacl.box(
      messageUint8,
      nonce,
      keyUint8,
      ephemeral.secretKey
    );

    const payload = concatArrays(ephemeral.publicKey, nonce, ciphertext);

    return encodeBase64(payload);
  } catch (error) {
    console.error("Encryption failed:", error);
    throw new Error("Failed to encrypt file path key");
  }
};

export const decryptFilePath = async (
  ciphertextBase64: string,
  privateKeyHex: string
): Promise<string | null> => {
  try {
    // 1. Decode inputs
    const fullPayload = decodeBase64(ciphertextBase64);
    const receiverSecretKeyUint8 = fromHexString(privateKeyHex);

    // 2. Define lengths based on TweetNaCl constants
    const publicKeyLength = nacl.box.publicKeyLength; // 32 bytes
    const nonceLength = nacl.box.nonceLength;         // 24 bytes

    // 3. Validation: Payload must be at least (Key + Nonce + Overhead) bytes
    if (fullPayload.length < publicKeyLength + nonceLength) {
      throw new Error("Ciphertext too short");
    }

    // 4. Extract parts from the payload
    // Part A: Ephemeral Public Key (First 32 bytes)
    const ephemeralPublicKey = fullPayload.slice(0, publicKeyLength);

    // Part B: Nonce (Next 24 bytes)
    const nonce = fullPayload.slice(
      publicKeyLength,
      publicKeyLength + nonceLength
    );

    // Part C: The Actual Encrypted Message (The rest)
    const ciphertext = fullPayload.slice(publicKeyLength + nonceLength);

    // 5. Decrypt
    // We use the extracted Ephemeral Public Key as the "Sender Public Key"
    const decryptedBytes = nacl.box.open(
      ciphertext,
      nonce,
      ephemeralPublicKey,
      receiverSecretKeyUint8
    );

    if (!decryptedBytes) {
      throw new Error("Decryption failed - Could not authenticate message");
    }

    // 6. Return plain text
    return encodeUTF8(decryptedBytes);

  } catch (error) {
    console.error("Decryption error:", error);
    return null;
  }
};