import crypto from 'crypto';

const SECRET_KEY = process.env.HLS_SIGNING_SECRET || 'your-hls-signing-secret-change-in-production';

export const generateSignedUrl = (baseUrl, expiresInSeconds = 300) => {
  try {
    const expirationTime = Math.floor(Date.now() / 1000) + expiresInSeconds;

    const urlObj = new URL(baseUrl);
    urlObj.searchParams.set('expires', expirationTime.toString());

    const pathWithQuery = urlObj.pathname + urlObj.search;

    const signature = crypto
      .createHmac('sha256', SECRET_KEY)
      .update(pathWithQuery)
      .digest('hex');

    urlObj.searchParams.set('signature', signature);

    return {
      success: true,
      signedUrl: urlObj.toString(),
      expiresAt: expirationTime
    };
  } catch (error) {
    console.error('URL signing error:', error);
    return {
      success: false,
      error: error.message,
      signedUrl: baseUrl
    };
  }
};

// Alias for backward compatibility
export const signHLSUrl = (url, expiresInSeconds = 300) => {
  const result = generateSignedUrl(url, expiresInSeconds);
  return result.signedUrl || url;
};

export const verifySignedUrl = (url) => {
  try {
    const urlObj = new URL(url);

    const expires = urlObj.searchParams.get('expires');
    const signature = urlObj.searchParams.get('signature');

    if (!expires || !signature) {
      return {
        valid: false,
        reason: 'Missing signature or expiration'
      };
    }

    const currentTime = Math.floor(Date.now() / 1000);
    if (parseInt(expires) < currentTime) {
      return {
        valid: false,
        reason: 'URL expired'
      };
    }

    const paramsForSigning = new URLSearchParams(urlObj.search);
    paramsForSigning.delete('signature');

    const pathWithQuery = urlObj.pathname + '?' + paramsForSigning.toString();

    const expectedSignature = crypto
      .createHmac('sha256', SECRET_KEY)
      .update(pathWithQuery)
      .digest('hex');

    if (signature !== expectedSignature) {
      return {
        valid: false,
        reason: 'Invalid signature'
      };
    }

    return {
      valid: true,
      expiresAt: parseInt(expires)
    };
  } catch (error) {
    console.error('URL verification error:', error);
    return {
      valid: false,
      reason: error.message
    };
  }
};

export const generateTokenForContent = (contentId, userId, expiresInSeconds = 300) => {
  try {
    const payload = {
      contentId,
      userId,
      expires: Math.floor(Date.now() / 1000) + expiresInSeconds
    };

    const token = Buffer.from(JSON.stringify(payload)).toString('base64');

    const signature = crypto
      .createHmac('sha256', SECRET_KEY)
      .update(token)
      .digest('hex');

    return {
      success: true,
      token: `${token}.${signature}`,
      expiresAt: payload.expires
    };
  } catch (error) {
    console.error('Token generation error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const verifyContentToken = (token) => {
  try {
    const [payloadB64, signature] = token.split('.');

    if (!payloadB64 || !signature) {
      return {
        valid: false,
        reason: 'Invalid token format'
      };
    }

    const expectedSignature = crypto
      .createHmac('sha256', SECRET_KEY)
      .update(payloadB64)
      .digest('hex');

    if (signature !== expectedSignature) {
      return {
        valid: false,
        reason: 'Invalid signature'
      };
    }

    const payload = JSON.parse(Buffer.from(payloadB64, 'base64').toString());

    const currentTime = Math.floor(Date.now() / 1000);
    if (payload.expires < currentTime) {
      return {
        valid: false,
        reason: 'Token expired'
      };
    }

    return {
      valid: true,
      payload
    };
  } catch (error) {
    console.error('Token verification error:', error);
    return {
      valid: false,
      reason: error.message
    };
  }
};

export const generateCDNSignedUrls = (baseUrls, expiresInSeconds = 300) => {
  try {
    const signedUrls = baseUrls.map(({ provider, url, priority }) => {
      const { signedUrl, expiresAt } = generateSignedUrl(url, expiresInSeconds);

      return {
        provider,
        url: signedUrl,
        priority,
        expiresAt
      };
    });

    signedUrls.sort((a, b) => (b.priority || 0) - (a.priority || 0));

    return {
      success: true,
      urls: signedUrls
    };
  } catch (error) {
    console.error('CDN URL signing error:', error);
    return {
      success: false,
      error: error.message,
      urls: baseUrls
    };
  }
};

export const generatePlaylistWithSignedSegments = (playlistContent, baseUrl, expiresInSeconds = 300) => {
  try {
    const lines = playlistContent.split('\n');
    const signedLines = lines.map(line => {
      if (line.startsWith('#') || line.trim() === '') {
        return line;
      }

      if (line.endsWith('.ts') || line.endsWith('.m3u8') || line.endsWith('.key')) {
        const fullUrl = new URL(line, baseUrl).toString();
        const { signedUrl } = generateSignedUrl(fullUrl, expiresInSeconds);
        return signedUrl;
      }

      return line;
    });

    return {
      success: true,
      signedPlaylist: signedLines.join('\n')
    };
  } catch (error) {
    console.error('Playlist signing error:', error);
    return {
      success: false,
      error: error.message,
      signedPlaylist: playlistContent
    };
  }
};

export default {
  generateSignedUrl,
  verifySignedUrl,
  generateTokenForContent,
  verifyContentToken,
  generateCDNSignedUrls,
  generatePlaylistWithSignedSegments
};
