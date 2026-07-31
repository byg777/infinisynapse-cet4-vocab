import { cet4Words } from '../server/words.js';

export const fallbackWords = cet4Words;
export const fallbackTags = [...new Set(fallbackWords.map((word) => word.tag))];
