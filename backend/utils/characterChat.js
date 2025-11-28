import { characterChat as aiCharacterChat } from './aiClient.js';

const characterDatabase = {
  'tony-stark': {
    name: 'Tony Stark',
    context: 'Genius, billionaire, playboy, philanthropist. Inventor of the Iron Man suit. Sarcastic wit and technological genius.',
    personality: 'Confident, witty, intelligent, sometimes arrogant but with a good heart',
    background: 'CEO of Stark Industries, superhero, Avenger'
  },
  'darth-vader': {
    name: 'Darth Vader',
    context: 'Former Jedi Knight Anakin Skywalker turned Sith Lord. Dark, powerful, and intimidating.',
    personality: 'Authoritative, powerful, conflicted, deep voice',
    background: 'Dark Lord of the Sith, enforcer of the Galactic Empire'
  },
  'sherlock-holmes': {
    name: 'Sherlock Holmes',
    context: 'World\'s greatest detective. Observant, logical, sometimes socially awkward.',
    personality: 'Brilliant, analytical, eccentric, blunt',
    background: 'Consulting detective at 221B Baker Street'
  }
};

export const getCharacterInfo = (characterSlug) => {
  return characterDatabase[characterSlug] || null;
};

export const chatWithCharacter = async (characterSlug, message, conversationHistory = []) => {
  try {
    const character = getCharacterInfo(characterSlug);

    if (!character) {
      return {
        success: false,
        error: 'Character not found',
        availableCharacters: Object.keys(characterDatabase)
      };
    }

    const fullContext = `${character.context}\nPersonality: ${character.personality}\nBackground: ${character.background}`;

    const aiResponse = await aiCharacterChat(
      character.name,
      fullContext,
      message,
      conversationHistory
    );

    return {
      success: aiResponse.success,
      character: character.name,
      response: aiResponse.response,
      conversationHistory: [
        ...conversationHistory,
        { role: 'user', content: message },
        { role: 'assistant', content: aiResponse.response }
      ]
    };
  } catch (error) {
    console.error('Character chat error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const addCharacter = (slug, characterData) => {
  const { name, context, personality, background } = characterData;

  if (!name || !context || !personality || !background) {
    return {
      success: false,
      error: 'Missing required character data'
    };
  }

  characterDatabase[slug] = {
    name,
    context,
    personality,
    background
  };

  return {
    success: true,
    character: slug
  };
};

export const listCharacters = () => {
  return Object.entries(characterDatabase).map(([slug, data]) => ({
    slug,
    name: data.name,
    background: data.background
  }));
};

export const createCharacterFromContent = (contentData) => {
  const { title, cast, description } = contentData;

  const characters = cast.slice(0, 3).map((actor, index) => {
    const slug = actor.character
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    return {
      slug,
      name: actor.character,
      context: `Character from ${title}. ${description.substring(0, 200)}`,
      personality: 'Engaging and true to the character from the show',
      background: `Main character in ${title}, portrayed by ${actor.name}`
    };
  });

  characters.forEach(char => {
    if (!characterDatabase[char.slug]) {
      characterDatabase[char.slug] = {
        name: char.name,
        context: char.context,
        personality: char.personality,
        background: char.background
      };
    }
  });

  return {
    success: true,
    characters: characters.map(c => ({ slug: c.slug, name: c.name }))
  };
};

export default {
  getCharacterInfo,
  chatWithCharacter,
  addCharacter,
  listCharacters,
  createCharacterFromContent
};
