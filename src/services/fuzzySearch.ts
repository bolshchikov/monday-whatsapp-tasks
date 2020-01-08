import Fuse from 'fuse.js';

const options = {
  id: 'id',
  shouldSort: true,
  tokenize: true,
  threshold: 0.2,
  location: 0,
  distance: 500,
  maxPatternLength: 32,
  minMatchCharLength: 1,
  keys: ['name']
};

export const search = (haystack, needle) => {
  const fuse = new Fuse(haystack, options);
  const results = fuse.search(needle);
  return Number(results[0]);
};
