import LRUCache from 'lru-cache';

class Cache {
  cache;

  options = {
    // how long to live in ms
    ttl: 1000 * 60 * 5,
    max: 1000,
  };

  constructor() {
    this.cache = new LRUCache(this.options);
  }

  get(key) {
    return this.cache.get(key);
  }

  set(key, value, ttl = 1000 * 60 * 5) {
    this.cache.set(key, value, ttl);
  }

  has(key) {
    return this.cache.has(key);
  }
}

export const cache = new Cache();
