import crypto from "crypto";
import { SigningKey } from "./schema";

// Generate an EC P-256 key pair for signing
// In production, these should be stored securely and rotated regularly
let cachedKeyPair: {
  publicKey: crypto.KeyObject;
  privateKey: crypto.KeyObject;
  jwk: SigningKey;
} | null = null;

export const generateSigningKeyPair = (): {
  publicKey: crypto.KeyObject;
  privateKey: crypto.KeyObject;
  jwk: SigningKey;
} => {
  if (cachedKeyPair) {
    return cachedKeyPair;
  }

  const { publicKey, privateKey } = crypto.generateKeyPairSync("ec", {
    namedCurve: "P-256",
  });

  // Export public key as JWK
  const jwkPublic = publicKey.export({ format: "jwk" });

  const jwk: SigningKey = {
    kid: "business_2025",
    kty: "EC",
    crv: "P-256",
    x: jwkPublic.x as string,
    y: jwkPublic.y as string,
    use: "sig",
    alg: "ES256",
  };

  cachedKeyPair = { publicKey, privateKey, jwk };
  return cachedKeyPair;
};

export const getSigningKeys = (): SigningKey[] => {
  const { jwk } = generateSigningKeyPair();
  return [jwk];
};

// Sign data with the private key (ES256)
export const signData = (data: string): string => {
  const { privateKey } = generateSigningKeyPair();
  const sign = crypto.createSign("SHA256");
  sign.update(data);
  sign.end();
  return sign.sign(privateKey, "base64");
};

// Verify signature with the public key (ES256)
export const verifySignature = (
  data: string,
  signature: string,
  publicKeyJwk: SigningKey
): boolean => {
  try {
    // Import public key from JWK
    const publicKey = crypto.createPublicKey({
      key: {
        kty: publicKeyJwk.kty,
        crv: publicKeyJwk.crv,
        x: publicKeyJwk.x,
        y: publicKeyJwk.y,
      },
      format: "jwk",
    });

    const verify = crypto.createVerify("SHA256");
    verify.update(data);
    verify.end();
    return verify.verify(publicKey, signature, "base64");
  } catch {
    return false;
  }
};
