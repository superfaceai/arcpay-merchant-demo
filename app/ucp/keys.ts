import crypto from "crypto";
import { SigningKey } from "./schema";

// Generate a key pair for signing (RSA)
// In production, these should be stored securely and rotated regularly
let cachedKeyPair: { publicKey: string; privateKey: string } | null = null;

export const generateSigningKeyPair = (): {
  publicKey: string;
  privateKey: string;
} => {
  if (cachedKeyPair) {
    return cachedKeyPair;
  }

  const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: "spki",
      format: "pem",
    },
    privateKeyEncoding: {
      type: "pkcs8",
      format: "pem",
    },
  });

  cachedKeyPair = { publicKey, privateKey };
  return cachedKeyPair;
};

export const getSigningKeys = (): SigningKey[] => {
  const { publicKey } = generateSigningKeyPair();
  return [
    {
      key_id: "ucp-signing-key-1",
      public_key: publicKey,
    },
  ];
};

// Sign data with the private key
export const signData = (data: string): string => {
  const { privateKey } = generateSigningKeyPair();
  const sign = crypto.createSign("RSA-SHA256");
  sign.update(data);
  sign.end();
  return sign.sign(privateKey, "base64");
};

// Verify signature with the public key
export const verifySignature = (
  data: string,
  signature: string,
  publicKey: string
): boolean => {
  try {
    const verify = crypto.createVerify("RSA-SHA256");
    verify.update(data);
    verify.end();
    return verify.verify(publicKey, signature, "base64");
  } catch {
    return false;
  }
};

