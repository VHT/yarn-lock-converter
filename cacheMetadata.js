const cacache = require('cacache');
const state = require('./state');

let _untouched = {};

async function put(key, contents) {
  if (!state.cache) {
    return;
  }

  await cacache.put(state.cache, key, contents);
}

async function get(key) {
  if (!state.cache) {
    return;
  }

  if(_untouched[key]) {
    delete _untouched[key];
  }

  try {
    const cacheItem = await cacache.get(state.cache, key);
    return cacheItem.data;
  } catch (ex) {
    // cache misses throw an exception
    if (ex.code === 'ENOENT') {
      return undefined;
    }
    throw ex;
  }
}

async function trackUntouched() {
  if (!state.cache) {
    return;
  }

  _untouched = await cacache.ls(state.cache);
}

async function rmUntouched() {
  if (!state.cache) {
    return;
  }

  const keysToRm = Object.keys(_untouched);
  _untouched = {};

  for (const key of keysToRm) {
    console.log(`Cache entry for ${key} appears to be unused. Removing.`);
    await cacache.rm(state.cache, key);
  }
}

module.exports = {
  put,
  get,
  trackUntouched,
  rmUntouched,
};