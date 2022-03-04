#!/usr/bin/env node

const path = require('path');
const yargs = require('yargs');
const state = require('./state');
const lockConverter = require('./lockConverter');
const cacheMetadata = require('./cacheMetadata');

yargs.option('in', {
  alias: 'i',
  type: 'string',
  description: 'The path to the Yarn v2+ lockfile. Path is relative to the --cwd.',
  nargs: 1,
  require: true,
}).option('out', {
  alias: 'o',
  type: 'string',
  description: 'The output path for the Yarn v1 lockfile. Path is relative to the --cwd.',
  nargs: 1,
  require: true,
}).option('cache', {
  type: 'string',
  description: 'The path to a directory to use as a cache for the npm registry metadata files. If not specified, no cache will be used and files will all be downloaded.',
  nargs: 1,
}).option('cwd', {
  alias: 'c',
  type: 'string',
  description: 'The path to base the other paths from. Default is node process.cwd().',
  nargs: 1,
}).strict();

async function main() {
  const args = yargs.argv;
  state.cwd = path.resolve(process.cwd(), args.cwd || '.');
  state.in = path.resolve(state.cwd, args.in);
  state.out = path.resolve(state.cwd, args.out);
  state.cache = args.cache ? path.resolve(state.cwd, args.cache) : undefined;

  await cacheMetadata.trackUntouched();
  await lockConverter.convert();
  await cacheMetadata.rmUntouched();
}

main().then(() => {
  console.log('Done.');
  process.exit(0);
}).catch(ex => {
  console.error(ex);
  process.exit(1);
});
