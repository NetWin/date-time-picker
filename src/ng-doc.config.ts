import { NgDocConfiguration } from '@ng-doc/builder';

const config: NgDocConfiguration = {
  docsPath: 'projects/picker/src',
  cache: true,
  repoConfig: {
    mainBranch: 'master',
    releaseBranch: 'master',
    url: 'https://github.com/NetWin/date-time-picker'
  }
};

export default config;
