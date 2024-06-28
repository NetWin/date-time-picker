import { NgDocConfiguration } from '@ng-doc/builder';

const config: NgDocConfiguration = {
  pages: ['projects/picker', 'projects/docs'],
  repoConfig: {
    mainBranch: 'master',
    releaseBranch: 'master',
    url: 'https://github.com/netwin/date-time-picker'
  }
};

export default config;
