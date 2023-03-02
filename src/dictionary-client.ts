import { dictionaryApiJsonResponse } from "./schemas";
import fetch from "node-fetch";

const getParsedData = async (word: string, key: string) => {
    const result = await fetch(
        `https://www.dictionaryapi.com/api/v3/references/thesaurus/json/${encodeURIComponent(
          word
        )}?key=${key}`
      );
      if (result.status === 404) {
        return `Could not find '${word}', did you spell it correctly?`;
      }
      const data = await result.json();
    
      const parsed = dictionaryApiJsonResponse.safeParse(data);
      if (!parsed.success) {
        return "Could not parse response correctly. This is a bug in Thesauraptor!";
      }
  
    return parsed.data[0];
  };

export const getSynonyms = async (word: string, key: string) => {
  const synonyms = await getParsedData(word, key);
  if (typeof synonyms === 'string') {
    return synonyms;
  }

  if (synonyms.meta.syns.length === 0) {
    return [];
  }

  return synonyms.meta.syns[0];
};

export const getAntonyms = async (word: string, key: string) => {
    const antonyms = await getParsedData(word, key);
    if (typeof antonyms === 'string') {
      return antonyms;
    }
  
    if (antonyms.meta.ants.length === 0) {
      return [];
    }
  
    return antonyms.meta.ants[0];
};

export const getDefinitions = async (word: string, key: string) => {
    const definitions = await getParsedData(word, key);
    if (typeof definitions === 'string') {
      return definitions;
    }
  
    return definitions.shortdef;
};
