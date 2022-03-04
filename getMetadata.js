const https = require('https');
const cacheMetadata = require('./cacheMetadata');
const state = require('./state');

const NPM_REGISTRY = 'registry.npmjs.org';
const YARN_REGISTRY = 'registry.yarnpkg.com';

async function getFromRegistry(packageName) {
  return new Promise((resolve, reject) => {
    let responseData = '';

    const options = {
      hostname: YARN_REGISTRY,
      port: 443,
      path: `/${packageName}`,
      method: 'GET'
    };
  
    const req = https.request(options, res => {
      res.on('data', d => {
        responseData += d.toString();
      });

      res.on('end', () => {
        resolve(responseData);
      });
    });
  
    req.on('error', error => {
      reject(error);
    });
  
    req.end();
  });
}

module.exports = async function(packageName, version) {
  const cacheKey = `${packageName}@${version}`;
  const cachedMetadata = await cacheMetadata.get(cacheKey);

  if(cachedMetadata) {
    // console.log(`Data for ${cacheKey} found in cache.`);
    return JSON.parse(cachedMetadata.toString());
  } else {
    if(state.cache) {
      console.log(`Data for ${cacheKey} not found in cache. Will download from npm registry.`);
    } else {
      console.log(`Downloading metadata for ${cacheKey} from npm registry.`);
    }
    const response = await getFromRegistry(packageName);
    const metadata = JSON.parse(response.toString());
    const versionMetadata = metadata.versions[version].dist;
    versionMetadata.tarball.replace(NPM_REGISTRY, YARN_REGISTRY);
    await cacheMetadata.put(cacheKey, JSON.stringify(versionMetadata));
    return versionMetadata;
  }
}