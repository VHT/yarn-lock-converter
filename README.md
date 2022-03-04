## @vht/yarn-lock-converter

Converts modern Yarn v2+ `yarn.lock` files into a Yarn v1 format.

## Intent

This package was created to deal with security analysis tools (Veracode, Checkmarx, etc) that do not have the ability to scan Yarn v2 lockfiles yet.
This utility was used to convert lockfiles back to v1 format so that those analysis tools could determine what packages were being used.

## Caveots

There are newer protocols (`workspace:`, `patch:`, `portal:`, etc.) that did not exist in Yarn v1.
This utility only brings in lockfile references that refer to packages from the npm registry.

Since the original intent was to perform security composition analysis on these files, non-public packages were not important anyway.

The modern yarn lockfile does not contain the registry metadata needed to fill in hte yarn v1 `resolved` and `integrity` fields, nor does yarn store this in the local cache. To fill in these fields, this package needs to make HTTPS requests to the npm registry. The package metadata files are then cached locally and reused.
If you use this tool in a CI environment, saving the cache directory between CI builds will save a lot of time.

## Installation

```
yarn add @vht/yarn-lock-converter --dev
```

## Use

Typical use:

```
yarn run yarn-lock-converter --in ./yarn.lock --out ./yarn.v1.out --cache ./.cache
```

### Command Line Arguments

* `--help / -h` - Print help.

* `--cwd / -c <path>` - (optional) The path to base the other paths from. Default is node process.cwd().

* `--in / -i <lockfile>` - (required) The path to the Yarn v2+ lockfile. Path is relative to the --cwd.

* `--out / -o <lockfile>` - (required) The output path for the Yarn v1 lockfile. Path is relative to the --cwd.

* `--cache <path>` - (optional) The path to a directory to use as a cache for the npm registry metadata files. If not specified, no cache will be used and files will all be downloaded.
