import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';

const execAsync = promisify(exec);

export const generateThumbnail = async (videoPath, outputPath, timeInSeconds = 5) => {
  try {
    const command = `ffmpeg -i "${videoPath}" -ss ${timeInSeconds} -vframes 1 -vf scale=1280:720 "${outputPath}"`;

    await execAsync(command);

    return {
      success: true,
      thumbnailPath: outputPath
    };
  } catch (error) {
    console.error('Thumbnail generation error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const generateMultipleThumbnails = async (videoPath, outputDir, count = 5) => {
  try {
    const { stdout } = await execAsync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${videoPath}"`);
    const duration = parseFloat(stdout);

    const thumbnails = [];
    const interval = duration / (count + 1);

    for (let i = 1; i <= count; i++) {
      const time = interval * i;
      const outputPath = path.join(outputDir, `thumb_${i}.jpg`);

      await generateThumbnail(videoPath, outputPath, time);
      thumbnails.push({
        path: outputPath,
        time: time
      });
    }

    return {
      success: true,
      thumbnails
    };
  } catch (error) {
    console.error('Multiple thumbnails generation error:', error);
    return {
      success: false,
      error: error.message,
      thumbnails: []
    };
  }
};

export const convertToHLS = async (videoPath, outputDir) => {
  try {
    await fs.mkdir(outputDir, { recursive: true });

    const qualities = [
      { resolution: '1920x1080', bitrate: '5000k', name: '1080p' },
      { resolution: '1280x720', bitrate: '3000k', name: '720p' },
      { resolution: '854x480', bitrate: '1500k', name: '480p' },
      { resolution: '640x360', bitrate: '800k', name: '360p' }
    ];

    const playlistPath = path.join(outputDir, 'master.m3u8');
    let masterPlaylist = '#EXTM3U\n#EXT-X-VERSION:3\n';

    for (const quality of qualities) {
      const qualityDir = path.join(outputDir, quality.name);
      await fs.mkdir(qualityDir, { recursive: true });

      const outputPlaylist = path.join(qualityDir, 'playlist.m3u8');

      const command = `ffmpeg -i "${videoPath}" \
        -vf scale=${quality.resolution} \
        -c:v libx264 -b:v ${quality.bitrate} \
        -c:a aac -b:a 128k \
        -hls_time 10 \
        -hls_list_size 0 \
        -hls_segment_filename "${path.join(qualityDir, 'segment_%03d.ts')}" \
        "${outputPlaylist}"`;

      await execAsync(command);

      masterPlaylist += `#EXT-X-STREAM-INF:BANDWIDTH=${parseInt(quality.bitrate) * 1000},RESOLUTION=${quality.resolution}\n`;
      masterPlaylist += `${quality.name}/playlist.m3u8\n`;
    }

    await fs.writeFile(playlistPath, masterPlaylist);

    return {
      success: true,
      masterPlaylist: playlistPath,
      qualities
    };
  } catch (error) {
    console.error('HLS conversion error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const encryptHLS = async (playlistPath, outputDir) => {
  try {
    const keyInfoPath = path.join(outputDir, 'key.info');
    const keyPath = path.join(outputDir, 'encryption.key');

    const keyBuffer = Buffer.from(Array.from({ length: 16 }, () => Math.floor(Math.random() * 256)));
    await fs.writeFile(keyPath, keyBuffer);

    const keyUri = `/api/drm/key/${path.basename(outputDir)}`;
    const keyInfoContent = `${keyUri}\n${keyPath}\n${keyBuffer.toString('hex').substring(0, 32)}`;
    await fs.writeFile(keyInfoPath, keyInfoContent);

    const encryptedPlaylist = path.join(outputDir, 'encrypted.m3u8');

    const command = `ffmpeg -i "${playlistPath}" \
      -c copy \
      -hls_key_info_file "${keyInfoPath}" \
      -hls_segment_filename "${path.join(outputDir, 'enc_segment_%03d.ts')}" \
      "${encryptedPlaylist}"`;

    await execAsync(command);

    return {
      success: true,
      encryptedPlaylist,
      keyPath,
      keyUri
    };
  } catch (error) {
    console.error('HLS encryption error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const extractAudio = async (videoPath, outputPath) => {
  try {
    const command = `ffmpeg -i "${videoPath}" -vn -acodec copy "${outputPath}"`;

    await execAsync(command);

    return {
      success: true,
      audioPath: outputPath
    };
  } catch (error) {
    console.error('Audio extraction error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const extractSubtitles = async (videoPath, outputPath) => {
  try {
    const command = `ffmpeg -i "${videoPath}" -map 0:s:0 "${outputPath}"`;

    await execAsync(command);

    return {
      success: true,
      subtitlePath: outputPath
    };
  } catch (error) {
    console.error('Subtitle extraction error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const getVideoMetadata = async (videoPath) => {
  try {
    const command = `ffprobe -v quiet -print_format json -show_format -show_streams "${videoPath}"`;

    const { stdout } = await execAsync(command);
    const metadata = JSON.parse(stdout);

    const videoStream = metadata.streams.find(s => s.codec_type === 'video');
    const audioStreams = metadata.streams.filter(s => s.codec_type === 'audio');
    const subtitleStreams = metadata.streams.filter(s => s.codec_type === 'subtitle');

    return {
      success: true,
      metadata: {
        duration: parseFloat(metadata.format.duration),
        size: parseInt(metadata.format.size),
        bitrate: parseInt(metadata.format.bit_rate),
        video: videoStream ? {
          codec: videoStream.codec_name,
          width: videoStream.width,
          height: videoStream.height,
          fps: eval(videoStream.r_frame_rate),
          bitrate: parseInt(videoStream.bit_rate || 0)
        } : null,
        audio: audioStreams.map(a => ({
          codec: a.codec_name,
          channels: a.channels,
          sampleRate: a.sample_rate,
          language: a.tags?.language || 'unknown'
        })),
        subtitles: subtitleStreams.map(s => ({
          codec: s.codec_name,
          language: s.tags?.language || 'unknown'
        }))
      }
    };
  } catch (error) {
    console.error('Metadata extraction error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const generateTrailerClip = async (videoPath, outputPath, startTime = 0, duration = 30) => {
  try {
    const command = `ffmpeg -i "${videoPath}" -ss ${startTime} -t ${duration} -c:v libx264 -c:a aac -b:v 2000k "${outputPath}"`;

    await execAsync(command);

    return {
      success: true,
      trailerPath: outputPath
    };
  } catch (error) {
    console.error('Trailer generation error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const addWatermark = async (videoPath, watermarkPath, outputPath) => {
  try {
    const command = `ffmpeg -i "${videoPath}" -i "${watermarkPath}" \
      -filter_complex "overlay=W-w-10:H-h-10" \
      -c:a copy "${outputPath}"`;

    await execAsync(command);

    return {
      success: true,
      watermarkedPath: outputPath
    };
  } catch (error) {
    console.error('Watermark error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export default {
  generateThumbnail,
  generateMultipleThumbnails,
  convertToHLS,
  encryptHLS,
  extractAudio,
  extractSubtitles,
  getVideoMetadata,
  generateTrailerClip,
  addWatermark
};
