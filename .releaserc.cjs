var branch = process.env.GITHUB_REF_NAME;

// The changelog-preview workflow runs semantic-release in dry-run on pull requests,
// where we only want the commit analysis and release notes - not the npm/git/github
// steps, which need a built library and tokens. Real releases run on `push` instead.
var isPreview = process.env.GITHUB_EVENT_NAME === 'pull_request';

// Assets to update on release
var assetsToUpdate = ['package.json', 'projects/picker/package.json'];

// Add changelog to assets if it's a production release
if (branch === 'master') {
  assetsToUpdate.push('CHANGELOG.md');
}

// Commit analysis and release notes always run - this is all the changelog preview needs.
var plugins = [
  [
    '@semantic-release/commit-analyzer',
    {
      preset: 'angular',
      releaseRules: [
        { type: 'build', scope: 'deps', release: 'patch' },
        { type: 'refactor', release: 'patch' }
      ]
    }
  ],
  '@semantic-release/release-notes-generator'
];

if (!isPreview) {
  plugins.push(
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
  );
}

/** @type {import('semantic-release').Options} */
var config = {
  repositoryUrl: 'git@github.com:netwin/date-time-picker.git',
  branches: ['master', { name: 'release/*', channel: 'next', prerelease: 'rc' }],
  tagFormat: '${version}',
  plugins: plugins
};

module.exports = config;
