import { uploadToCloudinary } from '../config/cloudinary.js';
import { convertToHLS, encryptHLS, generateThumbnail, getVideoMetadata } from './ffmpegTools.js';
import path from 'path';
import fs from 'fs/promises';
import { generateSignedUrl } from './hlsSigner.js';

export const processVideoUpload = async (videoFile, options = {}) => {
  try {
    const {
      generateHLS = true,
      encrypt = true,
      generateThumbnails = true,
      uploadToCloud = true
    } = options;

    const videoPath = videoFile.path;
    const videoId = `video_${Date.now()}`;
    const workDir = path.join(process.cwd(), 'temp', videoId);

    await fs.mkdir(workDir, { recursive: true });

    const metadata = await getVideoMetadata(videoPath);

    let result = {
      success: true,
      videoId,
      metadata: metadata.metadata,
      urls: {}
    };

    if (uploadToCloud) {
      const cloudinaryResult = await uploadToCloudinary(
        await fs.readFile(videoPath),
        {
          folder: 'streamverse/videos',
          resource_type: 'video',
          public_id: videoId
        }
      );

      result.urls.original = cloudinaryResult.secure_url;
      result.urls.cloudinaryId = cloudinaryResult.public_id;
    }

    if (generateThumbnails) {
      const thumbnailPath = path.join(workDir, 'thumbnail.jpg');
      await generateThumbnail(videoPath, thumbnailPath, 10);

      if (uploadToCloud) {
        const thumbResult = await uploadToCloudinary(
          await fs.readFile(thumbnailPath),
          {
            folder: 'streamverse/thumbnails',
            public_id: `${videoId}_thumb`
          }
        );

        result.urls.thumbnail = thumbResult.secure_url;
      } else {
        result.urls.thumbnail = thumbnailPath;
      }
    }

    if (generateHLS) {
      const hlsDir = path.join(workDir, 'hls');
      const hlsResult = await convertToHLS(videoPath, hlsDir);

      if (hlsResult.success) {
        result.hls = {
          masterPlaylist: hlsResult.masterPlaylist,
          qualities: hlsResult.qualities
        };

        if (encrypt) {
          for (const quality of hlsResult.qualities) {
            const qualityDir = path.join(hlsDir, quality.name);
            const playlistPath = path.join(qualityDir, 'playlist.m3u8');

            await encryptHLS(playlistPath, qualityDir);
          }

          result.hls.encrypted = true;
        }

        if (uploadToCloud) {
          const hlsFiles = await fs.readdir(hlsDir, { recursive: true });

          for (const file of hlsFiles) {
            const filePath = path.join(hlsDir, file);
            const stat = await fs.stat(filePath);

            if (stat.isFile()) {
              const fileBuffer = await fs.readFile(filePath);
              const cloudPath = `streamverse/hls/${videoId}/${file}`;

              await uploadToCloudinary(fileBuffer, {
                folder: path.dirname(cloudPath),
                public_id: path.basename(file, path.extname(file)),
                resource_type: 'raw'
              });
            }
          }

          result.urls.hlsMaster = `${process.env.CDN_URL}/hls/${videoId}/master.m3u8`;
        } else {
          result.urls.hlsMaster = hlsResult.masterPlaylist;
        }
      }
    }

    await fs.rm(workDir, { recursive: true, force: true });

    return result;
  } catch (error) {
    console.error('Video processing error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const generateStreamingUrls = (contentId, hlsBaseUrl, options = {}) => {
  const {
    signUrls = true,
    expiresInSeconds = 300,
    includeCDNs = true
  } = options;

  const urls = {
    hls: `${hlsBaseUrl}/${contentId}/master.m3u8`,
    qualities: {
      '1080p': `${hlsBaseUrl}/${contentId}/1080p/playlist.m3u8`,
      '720p': `${hlsBaseUrl}/${contentId}/720p/playlist.m3u8`,
      '480p': `${hlsBaseUrl}/${contentId}/480p/playlist.m3u8`,
      '360p': `${hlsBaseUrl}/${contentId}/360p/playlist.m3u8`
    }
  };

  if (signUrls) {
    urls.hls = generateSignedUrl(urls.hls, expiresInSeconds).signedUrl;

    for (const [quality, url] of Object.entries(urls.qualities)) {
      urls.qualities[quality] = generateSignedUrl(url, expiresInSeconds).signedUrl;
    }
  }

  if (includeCDNs) {
    urls.cdns = [
      {
        provider: 'cloudflare',
        url: urls.hls.replace(hlsBaseUrl, process.env.CLOUDFLARE_CDN_URL || hlsBaseUrl),
        priority: 1
      },
      {
        provider: 'fastly',
        url: urls.hls.replace(hlsBaseUrl, process.env.FASTLY_CDN_URL || hlsBaseUrl),
        priority: 2
      },
      {
        provider: 'origin',
        url: urls.hls,
        priority: 3
      }
    ];
  }

  return urls;
};

export const validateVideoFile = (file) => {
  const allowedMimeTypes = [
    'video/mp4',
    'video/quicktime',
    'video/x-msvideo',
    'video/x-matroska'
  ];

  const maxSize = 5 * 1024 * 1024 * 1024;

  if (!file) {
    return {
      valid: false,
      error: 'No file provided'
    };
  }

  if (!allowedMimeTypes.includes(file.mimetype)) {
    return {
      valid: false,
      error: 'Invalid file type. Allowed: MP4, MOV, AVI, MKV'
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File too large. Maximum size: 5GB'
    };
  }

  return {
    valid: true
  };
};

export default {
  processVideoUpload,
  generateStreamingUrls,
  validateVideoFile
};
