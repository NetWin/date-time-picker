import { NgDocConfiguration } from '@ng-doc/builder';

const config: NgDocConfiguration = {
  pages: ['projects/picker', 'projects/docs'],
  repoConfig: {
    mainBranch: 'feature/project-revamp',
    releaseBranch: 'feature/project-revamp',
    url: 'https://github.com/netwin/date-time-picker'
  }
};

export default config;
