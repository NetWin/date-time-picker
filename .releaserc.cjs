// Check if the current branch is a release branch
var branch = process.env.GITHUB_REF_NAME;

// Assets to update on release
var assetsToUpdate = ['package.json', 'package-lock.json', 'projects/picker/package.json'];

// Add changelog to assets if it's a production release
if (branch === 'master') {
  assetsToUpdate.push('CHANGELOG.md');
}

/** @type {import('semantic-release').Options} */
var config = {
  repositoryUrl: 'git@github.com:netwin/date-time-picker.git',
  branches: ['master', { name: 'release/*', channel: 'next', prerelease: 'rc' }],
  tagFormat: '${version}',
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    '@semantic-release/changelog',
    ['@semantic-release/npm', { npmPublish: false }],
    ['@semantic-release/npm', { npmPublish: false, pkgRoot: 'projects/picker' }],
    ['@semantic-release/npm', { npmPublish: true, pkgRoot: 'dist/picker' }],
    [
      '@semantic-release/git',
      {
        assets: assetsToUpdate,
        message: 'build(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}'
      }
    ],
    '@semantic-release/github'
  ]
};

module.exports = config;
