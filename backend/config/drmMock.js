import crypto from 'crypto';

const DRM_TYPES = {
  WIDEVINE: 'widevine',
  FAIRPLAY: 'fairplay',
  PLAYREADY: 'playready'
};

const generateKeyId = () => {
  return crypto.randomBytes(16).toString('hex');
};

const generateContentKey = () => {
  return crypto.randomBytes(16);
};

const generateLicenseChallenge = (keyId, contentId) => {
  const challenge = {
    keyId,
    contentId,
    timestamp: Date.now(),
    nonce: crypto.randomBytes(16).toString('hex')
  };
  return Buffer.from(JSON.stringify(challenge)).toString('base64');
};

const generateLicenseResponse = (challenge, drmType) => {
  try {
    const challengeData = JSON.parse(Buffer.from(challenge, 'base64').toString());

    const license = {
      keyId: challengeData.keyId,
      key: generateContentKey().toString('hex'),
      contentId: challengeData.contentId,
      expirationTime: Date.now() + (24 * 60 * 60 * 1000),
      drmType,
      permissions: {
        canPlay: true,
        canPersist: false,
        rentalDuration: 86400
      }
    };

    const signature = crypto
      .createHmac('sha256', process.env.DRM_SECRET_KEY || 'drm-secret-key-change-in-production')
      .update(JSON.stringify(license))
      .digest('hex');

    return {
      license: Buffer.from(JSON.stringify(license)).toString('base64'),
      signature
    };
  } catch (error) {
    throw new Error('Invalid license challenge');
  }
};

const verifyLicense = (license, signature) => {
  try {
    const expectedSignature = crypto
      .createHmac('sha256', process.env.DRM_SECRET_KEY || 'drm-secret-key-change-in-production')
      .update(license)
      .digest('hex');

    return signature === expectedSignature;
  } catch (error) {
    return false;
  }
};

const generateWidevineChallenge = (contentId) => {
  const keyId = generateKeyId();
  const pssh = {
    version: 0,
    systemId: '1077efec-c0b2-4d02-ace3-3c1e52e2fb4b',
    keyIds: [keyId],
    data: Buffer.from(JSON.stringify({ contentId })).toString('base64')
  };
  return {
    keyId,
    pssh: Buffer.from(JSON.stringify(pssh)).toString('base64')
  };
};

const generateFairPlayCertificate = () => {
  const cert = {
    version: '1.0',
    certificateId: crypto.randomUUID(),
    expirationDate: Date.now() + (365 * 24 * 60 * 60 * 1000),
    publicKey: crypto.randomBytes(256).toString('base64')
  };
  return Buffer.from(JSON.stringify(cert)).toString('base64');
};

const generatePlayReadyHeader = (contentId) => {
  const header = `
    <WRMHEADER xmlns="http://schemas.microsoft.com/DRM/2007/03/PlayReadyHeader" version="4.0.0.0">
      <DATA>
        <PROTECTINFO>
          <KEYLEN>16</KEYLEN>
          <ALGID>AESCTR</ALGID>
        </PROTECTINFO>
        <KID>${generateKeyId()}</KID>
        <CHECKSUM>${crypto.randomBytes(4).toString('hex')}</CHECKSUM>
        <LA_URL>${process.env.BACKEND_URL}/api/drm/playready/license</LA_URL>
      </DATA>
    </WRMHEADER>
  `;
  return Buffer.from(header).toString('base64');
};

const encryptContentKey = (contentKey, publicKey = null) => {
  if (!publicKey) {
    const secret = process.env.DRM_ENCRYPTION_KEY || 'content-key-encryption-secret';
    const cipher = crypto.createCipheriv('aes-256-cbc',
      crypto.scryptSync(secret, 'salt', 32),
      crypto.randomBytes(16)
    );
    let encrypted = cipher.update(contentKey, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  return crypto.publicEncrypt(publicKey, contentKey).toString('base64');
};

const decryptContentKey = (encryptedKey, privateKey = null) => {
  if (!privateKey) {
    const secret = process.env.DRM_ENCRYPTION_KEY || 'content-key-encryption-secret';
    const decipher = crypto.createDecipheriv('aes-256-cbc',
      crypto.scryptSync(secret, 'salt', 32),
      crypto.randomBytes(16)
    );
    let decrypted = decipher.update(encryptedKey, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  return crypto.privateDecrypt(privateKey, Buffer.from(encryptedKey, 'base64'));
};

export {
  DRM_TYPES,
  generateKeyId,
  generateContentKey,
  generateLicenseChallenge,
  generateLicenseResponse,
  verifyLicense,
  generateWidevineChallenge,
  generateFairPlayCertificate,
  generatePlayReadyHeader,
  encryptContentKey,
  decryptContentKey
};
