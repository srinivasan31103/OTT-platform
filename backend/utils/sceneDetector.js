import { detectScenes } from './aiClient.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';

const execAsync = promisify(exec);

export const extractFrames = async (videoPath, outputDir, intervalSeconds = 30) => {
  try {
    await fs.mkdir(outputDir, { recursive: true });

    const { stdout } = await execAsync(
      `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${videoPath}"`
    );
    const duration = parseFloat(stdout);

    const frames = [];
    let currentTime = 0;

    while (currentTime < duration) {
      const outputPath = path.join(outputDir, `frame_${Math.floor(currentTime)}.jpg`);

      await execAsync(
        `ffmpeg -ss ${currentTime} -i "${videoPath}" -vframes 1 -vf scale=640:360 "${outputPath}"`
      );

      frames.push({
        time: currentTime,
        path: outputPath
      });

      currentTime += intervalSeconds;
    }

    return {
      success: true,
      frames
    };
  } catch (error) {
    console.error('Frame extraction error:', error);
    return {
      success: false,
      error: error.message,
      frames: []
    };
  }
};

export const analyzeVideoForScenes = async (videoPath, options = {}) => {
  try {
    const {
      intervalSeconds = 30,
      useAI = true,
      detectIntro = true,
      detectCredits = true
    } = options;

    const tempDir = path.join(process.cwd(), 'temp', `scene_${Date.now()}`);
    const { frames } = await extractFrames(videoPath, tempDir, intervalSeconds);

    let sceneMarkers = [];

    const { stdout: durationOutput } = await execAsync(
      `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${videoPath}"`
    );
    const duration = parseFloat(durationOutput);

    if (detectIntro) {
      sceneMarkers.push({
        time: 0,
        title: 'Opening',
        type: 'intro',
        aiGenerated: false,
        confidence: 1.0
      });
    }

    if (useAI && frames.length > 0) {
      const frameDescriptions = frames.map((frame, index) => ({
        time: frame.time,
        frame: index,
        description: `Frame at ${frame.time}s`
      }));

      const { scenes: aiScenes } = await detectScenes(frameDescriptions);

      if (aiScenes && aiScenes.length > 0) {
        sceneMarkers.push(...aiScenes.map(scene => ({
          ...scene,
          aiGenerated: true
        })));
      }
    } else {
      for (let i = 0; i < frames.length; i++) {
        const frame = frames[i];
        sceneMarkers.push({
          time: frame.time,
          title: `Chapter ${i + 1}`,
          type: 'scene',
          aiGenerated: false,
          confidence: 0.7
        });
      }
    }

    if (detectCredits && duration > 120) {
      const creditsStartTime = Math.max(duration - 120, duration * 0.9);
      sceneMarkers.push({
        time: creditsStartTime,
        title: 'End Credits',
        type: 'credits',
        aiGenerated: false,
        confidence: 0.9
      });
    }

    sceneMarkers.sort((a, b) => a.time - b.time);

    await fs.rm(tempDir, { recursive: true, force: true });

    return {
      success: true,
      sceneMarkers,
      totalDuration: duration
    };
  } catch (error) {
    console.error('Scene analysis error:', error);
    return {
      success: false,
      error: error.message,
      sceneMarkers: []
    };
  }
};

export const detectIntroOutro = async (videoPath) => {
  try {
    const { stdout } = await execAsync(
      `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${videoPath}"`
    );
    const duration = parseFloat(stdout);

    const markers = [];

    markers.push({
      time: 0,
      endTime: Math.min(90, duration * 0.05),
      title: 'Intro',
      type: 'intro',
      skipEnabled: true
    });

    if (duration > 120) {
      const creditsStart = Math.max(duration - 120, duration * 0.9);
      markers.push({
        time: creditsStart,
        endTime: duration,
        title: 'Credits',
        type: 'credits',
        skipEnabled: true
      });
    }

    return {
      success: true,
      markers
    };
  } catch (error) {
    console.error('Intro/Outro detection error:', error);
    return {
      success: false,
      error: error.message,
      markers: []
    };
  }
};

export const generateChapterMarkers = async (videoPath, chapterCount = 8) => {
  try {
    const { stdout } = await execAsync(
      `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${videoPath}"`
    );
    const duration = parseFloat(stdout);

    const interval = duration / chapterCount;
    const chapters = [];

    for (let i = 0; i < chapterCount; i++) {
      const time = i * interval;
      chapters.push({
        time: Math.floor(time),
        title: `Chapter ${i + 1}`,
        type: 'chapter',
        aiGenerated: false,
        confidence: 0.8
      });
    }

    return {
      success: true,
      chapters
    };
  } catch (error) {
    console.error('Chapter generation error:', error);
    return {
      success: false,
      error: error.message,
      chapters: []
    };
  }
};

export const detectActionSequences = async (videoPath) => {
  try {
    const tempDir = path.join(process.cwd(), 'temp', `action_${Date.now()}`);
    await fs.mkdir(tempDir, { recursive: true });

    const sceneFile = path.join(tempDir, 'scenes.txt');

    await execAsync(
      `ffmpeg -i "${videoPath}" -vf "select='gt(scene,0.4)',metadata=print:file=${sceneFile}" -f null -`
    );

    let actionScenes = [];

    try {
      const sceneData = await fs.readFile(sceneFile, 'utf-8');
      const times = sceneData.match(/pts_time:([0-9.]+)/g);

      if (times) {
        actionScenes = times.map((match, index) => {
          const time = parseFloat(match.split(':')[1]);
          return {
            time: Math.floor(time),
            title: `Action Sequence ${index + 1}`,
            type: 'action',
            aiGenerated: false,
            confidence: 0.7
          };
        });
      }
    } catch (readError) {
      console.log('No action sequences detected');
    }

    await fs.rm(tempDir, { recursive: true, force: true });

    return {
      success: true,
      actionScenes
    };
  } catch (error) {
    console.error('Action sequence detection error:', error);
    return {
      success: false,
      error: error.message,
      actionScenes: []
    };
  }
};

export default {
  extractFrames,
  analyzeVideoForScenes,
  detectIntroOutro,
  generateChapterMarkers,
  detectActionSequences
};
