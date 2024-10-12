import { RuleConfigSeverity, UserConfig } from '@commitlint/types';

const CommitLintConfiguration: UserConfig = {
  extends: ['@commitlint/config-angular'],

  rules: {
    // Never allow empty scopes
    'scope-empty': [RuleConfigSeverity.Error, 'never'],

    // Set the max length of header (first commit line) to 140
    'header-max-length': [RuleConfigSeverity.Error, 'always', 140]
  }
};

export default CommitLintConfiguration;
