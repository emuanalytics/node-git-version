#!/usr/bin/env node

var fs = require('fs');
var exec = require('child_process').exec;
var path = require('path');

var outpath = process.argv[2] || '';

function command(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, { cwd: __dirname },(err, stdout, stderr) => {
      if (err) return reject(err);
      resolve(stdout.split('\n').join(''));
    });
  });
};

function writeFile(file, data, options) {
  return new Promise((resolve, reject) => {
    fs.writeFile(file, data, options, (e) => e ? reject(e) : resolve());
  });
};

async function generateVersionInfo() {
  const hash = await command('git rev-parse --short HEAD');
  const tag = await command('git describe --always --tag --abbrev=0');
  const versionInfo = `
module.exports = {
  tag: '${tag}',
  hash: '${hash}',
  timestamp: ${Math.floor(new Date().getTime()/1000)}
};\n`;

  await writeFile(path.resolve(outpath, 'version.js'), versionInfo);
}

generateVersionInfo()
.then(() => console.log('[OK]'))
.catch((e) => {
  console.error(`[Failed] = ${e.message}`);
  process.exit(1);
});
