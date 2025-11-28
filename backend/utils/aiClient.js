import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || ''
});

const MODEL = 'claude-3-5-sonnet-20241022';

export const generateMovieDescription = async (title, genre, year, plot = '') => {
  try {
    const prompt = `You are a professional movie copywriter for a Netflix-scale streaming platform.

Generate a compelling, cinematic description (2-3 paragraphs) for this movie:

Title: ${title}
Genre: ${genre}
Year: ${year}
${plot ? `Plot Summary: ${plot}` : ''}

Requirements:
- Make it engaging and atmospheric
- Highlight emotional hooks
- Keep it concise but captivating
- Use vivid, cinematic language
- No spoilers
- 2-3 paragraphs maximum`;

    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 500,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    return {
      success: true,
      description: message.content[0].text
    };
  } catch (error) {
    console.error('AI Description Generation Error:', error);
    return {
      success: false,
      error: error.message,
      description: `${title} is a ${genre} film from ${year}.`
    };
  }
};

export const generateRecommendations = async (profileData, options = {}) => {
  try {
    const {
      watchHistory = [],
      likedGenres = [],
      mood = '',
      limit = 10
    } = options;

    const prompt = `You are an AI recommendation engine for a streaming platform like Netflix.

User Profile Data:
- Watch History: ${JSON.stringify(watchHistory.slice(0, 20))}
- Preferred Genres: ${likedGenres.join(', ')}
- Current Mood: ${mood || 'Not specified'}

Based on this data, recommend ${limit} movies or shows. Return ONLY a JSON array of recommendations with this exact structure:
[
  {
    "title": "Movie Title",
    "reason": "Brief reason for recommendation",
    "score": 0.95,
    "genres": ["genre1", "genre2"]
  }
]

Be specific and personalized. Consider:
1. Genre preferences
2. Watch patterns
3. Mood if specified
4. Diversity in recommendations

Return ONLY valid JSON, no additional text.`;

    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1500,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const responseText = message.content[0].text;
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);

    if (jsonMatch) {
      const recommendations = JSON.parse(jsonMatch[0]);
      return {
        success: true,
        recommendations
      };
    }

    return {
      success: false,
      error: 'Failed to parse recommendations',
      recommendations: []
    };
  } catch (error) {
    console.error('AI Recommendation Error:', error);
    return {
      success: false,
      error: error.message,
      recommendations: []
    };
  }
};

export const generateMoodPlaylist = async (mood, timeOfDay = '') => {
  try {
    const prompt = `You are a content curator for a streaming platform.

Create a mood-based playlist for:
- Mood: ${mood}
- Time of Day: ${timeOfDay || 'Any'}

Generate 8-12 movie/show recommendations that perfectly match this mood and time.

Return ONLY a JSON object with this structure:
{
  "playlistName": "Engaging playlist name",
  "description": "Brief description of the playlist vibe",
  "items": [
    {
      "title": "Content Title",
      "type": "movie or series",
      "reason": "Why it fits the mood",
      "vibe": "one-word vibe descriptor"
    }
  ]
}

Return ONLY valid JSON, no additional text.`;

    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1500,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const responseText = message.content[0].text;
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      const playlist = JSON.parse(jsonMatch[0]);
      return {
        success: true,
        playlist
      };
    }

    return {
      success: false,
      error: 'Failed to parse playlist'
    };
  } catch (error) {
    console.error('AI Mood Playlist Error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const moderateComment = async (comment) => {
  try {
    const prompt = `You are a content moderation AI for a family-friendly streaming platform.

Analyze this comment for:
1. Toxicity
2. Spam
3. Profanity
4. Harassment
5. Overall sentiment

Comment: "${comment}"

Return ONLY a JSON object with this structure:
{
  "safe": true/false,
  "toxicity": 0.0-1.0,
  "spam": 0.0-1.0,
  "profanity": 0.0-1.0,
  "harassment": 0.0-1.0,
  "sentiment": "positive/neutral/negative",
  "flags": ["array of issues found"],
  "reason": "Brief explanation if unsafe"
}

Return ONLY valid JSON, no additional text.`;

    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 400,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const responseText = message.content[0].text;
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      const moderation = JSON.parse(jsonMatch[0]);
      return {
        success: true,
        moderation
      };
    }

    return {
      success: false,
      error: 'Failed to parse moderation result',
      moderation: { safe: true, toxicity: 0, spam: 0, profanity: 0, sentiment: 'neutral' }
    };
  } catch (error) {
    console.error('AI Moderation Error:', error);
    return {
      success: false,
      error: error.message,
      moderation: { safe: true, toxicity: 0, spam: 0, profanity: 0, sentiment: 'neutral' }
    };
  }
};

export const characterChat = async (characterName, characterContext, userMessage, conversationHistory = []) => {
  try {
    const prompt = `You are ${characterName}, a character from a movie/show.

Character Context: ${characterContext}

Previous conversation:
${conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

User: ${userMessage}

Respond as ${characterName} would, staying in character. Be engaging, authentic, and reference your story/background. Keep responses under 150 words.`;

    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 300,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    return {
      success: true,
      response: message.content[0].text
    };
  } catch (error) {
    console.error('Character Chat Error:', error);
    return {
      success: false,
      error: error.message,
      response: `Sorry, ${characterName} is unavailable right now.`
    };
  }
};

export const generateVideoSummary = async (title, duration, scenes = []) => {
  try {
    const prompt = `You are a video content analyzer.

Generate a compelling trailer script/summary for:
Title: ${title}
Duration: ${duration} minutes
${scenes.length ? `Key Scenes: ${JSON.stringify(scenes)}` : ''}

Create a 30-45 second trailer script that:
1. Hooks viewers immediately
2. Builds excitement
3. Highlights key moments
4. Ends with intrigue

Return ONLY a JSON object:
{
  "script": "The trailer narration/script",
  "keyMoments": ["timestamp suggestions for trailer cuts"],
  "musicMood": "suggested music mood",
  "duration": 30-45
}

Return ONLY valid JSON.`;

    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 600,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const responseText = message.content[0].text;
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      const summary = JSON.parse(jsonMatch[0]);
      return {
        success: true,
        summary
      };
    }

    return {
      success: false,
      error: 'Failed to parse summary'
    };
  } catch (error) {
    console.error('AI Video Summary Error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const detectScenes = async (frameDescriptions = []) => {
  try {
    const prompt = `You are a video scene detection AI.

Analyze these video frames and detect scene changes:
${JSON.stringify(frameDescriptions)}

Return ONLY a JSON array of scene markers:
[
  {
    "time": seconds,
    "title": "Scene name",
    "type": "intro/action/dialogue/climax/credits",
    "confidence": 0.0-1.0,
    "description": "Brief scene description"
  }
]

Return ONLY valid JSON.`;

    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const responseText = message.content[0].text;
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);

    if (jsonMatch) {
      const scenes = JSON.parse(jsonMatch[0]);
      return {
        success: true,
        scenes
      };
    }

    return {
      success: false,
      error: 'Failed to parse scenes',
      scenes: []
    };
  } catch (error) {
    console.error('AI Scene Detection Error:', error);
    return {
      success: false,
      error: error.message,
      scenes: []
    };
  }
};

export default {
  generateMovieDescription,
  generateRecommendations,
  generateMoodPlaylist,
  moderateComment,
  characterChat,
  generateVideoSummary,
  detectScenes
};
