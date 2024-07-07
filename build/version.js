const fs = require('fs');
const path = require('path');

// Read the root package.json file
const packageJSONPath = path.join(__dirname, '../package.json');
const packageJson = require(packageJSONPath);

// Read the projects/picker/package.json file
const pickerProjectPackageJSONPath = path.join(__dirname, '../projects/picker/package.json');
const pickerProjectPackageJSON = require(pickerProjectPackageJSONPath);

// get version as name from package.json
const version = packageJson.version;

// Update version of projects/picker/package.json
pickerProjectPackageJSON.version = version;

// Save new Projects package.json
fs.writeFileSync(pickerProjectPackageJSONPath, JSON.stringify(pickerProjectPackageJSON, null, 2));

// add the updated config to the commit
// see: https://docs.npmjs.com/cli/v6/commands/npm-version
require('child_process').execSync('git add .');
