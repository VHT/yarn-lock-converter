const fs = require('fs');
const yaml = require('js-yaml');
const lockfile = require('@yarnpkg/lockfile');
const getMetadata = require('./getMetadata');
const state = require('./state');

const KEY_REGEX = /^(.[^@]*)@([^:]+:)?(.+)$/;

async function convert() {
  console.log(`Reading yarn v2 lockfile from ${state.in}.`);
  const doc = yaml.load(fs.readFileSync(state.in, 'utf8'));
  const v1lock = {};
  const v2lockEntries = Object.entries(doc);
  
  for(const [key, entry] of v2lockEntries) {
    if(key[0] === '_') {
      continue;
    }
    if(entry.version.indexOf('-use.local') >= 0) {
      continue;
    }

    const v1keys = key.split(', ').reduce((rekey, thiskey) => {
      const match = KEY_REGEX.exec(thiskey);
      if(!match) {
        console.error('Failed regex parse:', thiskey);
        return rekey;
      }
      const [, v1key, protocol, range] = match;
      if (protocol === undefined || protocol === 'npm:') {
        rekey.push(`${v1key}@${range}`);
      }
      return rekey;
    }, []).join(', ');

    if(v1keys.length) {
      let meta;
      const [, packageName] = entry.resolution.match(KEY_REGEX);
      try {
        meta = await getMetadata(packageName, entry.version);
      } catch (ex) {
        console.error('Failed to load registry metadata for ', entry.resolution, ex);
      }

      v1lock[v1keys] = {
        version: entry.version,
        dependencies: entry.dependencies,
        resolved: `${meta.tarball}#${meta.shasum}`,
        integrity: meta.integrity,
      };
    }
  }

  console.log(`Writing yarn v1 lockfile to ${state.out}.`);
  fs.writeFileSync(state.out, lockfile.stringify(v1lock), {
    encoding: 'utf8'
  });
}

module.exports = {
  convert,
};
