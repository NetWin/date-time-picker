const js = require('@eslint/js');
const typescriptEslintParser = require('@typescript-eslint/parser');
const ngEslint = require('angular-eslint');
const prettierConfig = require('eslint-config-prettier');
const tsEslint = require('typescript-eslint');
const stylistic = require('@stylistic/eslint-plugin');

module.exports = tsEslint.config(
  {
    files: ['**/*.ts'],
    extends: [
      js.configs.recommended,
      ...tsEslint.configs.recommended,
      ...tsEslint.configs.stylistic,
      ...ngEslint.configs.tsRecommended,
      prettierConfig
    ],
    plugins: {
      '@stylistic': stylistic
    },
    processor: ngEslint.processInlineTemplates,
    languageOptions: {
      parser: typescriptEslintParser,
      parserOptions: {
        project: true,
        tsconfigRootDir: __dirname
      }
    },
    rules: {
      /** #################################################
       *
       * General rules
       *
       * ############################################### */

      // https://eslint.style/rules/js/semi
      // Enforce semicolons at the end of statements
      '@stylistic/semi': 'error',
      // https://eslint.style/rules/js/comma-dangle
      // Prevent trailing commas in object literals
      '@stylistic/comma-dangle': 'error',
      // https://eslint.org/docs/latest/rules/no-nested-ternary
      // Disallow nested ternary expressions
      'no-nested-ternary': 'error',
      // https://eslint.org/docs/latest/rules/prefer-template
      // Enforce template literals instead of string concatenation
      'prefer-template': 'warn',
      // https://eslint.org/docs/latest/rules/object-shorthand
      // Prefer object shorthand syntax `{a,b,c} instead of {a:a, b:b, c:c}`
      'object-shorthand': ['warn', 'properties'],
      // https://eslint.org/docs/latest/rules/no-extra-boolean-cast
      // Warn when using unnecessary double negation
      'no-extra-boolean-cast': 'warn',
      // https://eslint.org/docs/latest/rules/no-prototype-builtins
      // Disallow the use of `Object.prototype` builtins like `hasOwnProperty` directly
      'no-prototype-builtins': 'warn',
      // https://eslint.org/docs/latest/rules/no-case-declarations
      // Allow declarations (`const foo = 1`) in case clauses
      'no-case-declarations': 'off',

      /** #################################################
       *
       * TypeScript specific rules
       *
       * ############################################### */

      // https://typescript-eslint.io/rules/no-explicit-any
      // Disallow usage of the `any` type
      '@typescript-eslint/no-explicit-any': 'warn',
      // https://typescript-eslint.io/rules/prefer-optional-chain
      // Prefer `a?.b?.c` over `a && a.b && a.b.c`
      '@typescript-eslint/prefer-optional-chain': 'warn',
      // https://typescript-eslint.io/rules/consistent-type-definitions
      // Disables the rule that enforces consistent usage of either "type" or "interface" for type definitions
      // TODO: enable again
      '@typescript-eslint/consistent-type-definitions': 'off',
      // https://typescript-eslint.io/rules/explicit-function-return-type
      // Require explicit return types on functions and class methods
      '@typescript-eslint/explicit-function-return-type': ['warn', { 'allowExpressions': true }],
      // https://typescript-eslint.io/rules/explicit-member-accessibility
      // Require explicit accessibility modifiers on class properties and methods
      '@typescript-eslint/explicit-member-accessibility': [
        'warn',
        { 'accessibility': 'explicit', 'overrides': { 'constructors': 'no-public' } }
      ],
      // https://typescript-eslint.io/rules/no-empty-object-type
      // Disallow the `{}` type in object type annotations
      '@typescript-eslint/no-empty-object-type': 'warn',
      // https://typescript-eslint.io/rules/consistent-indexed-object-style
      // Disables the rule that enforces consistent usage of either index signature or record types
      '@typescript-eslint/consistent-indexed-object-style': 'off',
      // https://typescript-eslint.io/rules/no-inferrable-types
      // Allow explicit types where they can be easily inferred
      '@typescript-eslint/no-inferrable-types': 'off',
      // https://typescript-eslint.io/rules/no-misused-promises
      // Checks that promises are awaited when checking for truthiness
      '@typescript-eslint/no-misused-promises': 'error',
      // https://typescript-eslint.io/rules/no-floating-promises
      // Disallow floating (unused / unawaited) promises
      '@typescript-eslint/no-floating-promises': 'warn',
      // https://typescript-eslint.io/rules/no-unused-vars
      // Disallow unused variables
      '@typescript-eslint/no-unused-vars': ['warn', { 'argsIgnorePattern': '^_', 'varsIgnorePattern': '^_' }],
      // https://typescript-eslint.io/rules/array-type
      // Enforce the use of the array type (i.e. prever `Array<T>` over `T[]`)
      '@typescript-eslint/array-type': ['warn', { 'default': 'generic' }],
      // https://typescript-eslint.io/rules/class-literal-property-style
      // Enforce that literals on classes are exposed in a consistent style.
      '@typescript-eslint/class-literal-property-style': 'warn',
      // https://eslint.org/docs/latest/rules/no-self-assign
      // warn about self-assignment for now (this.foo = this.foo)
      'no-self-assign': 'warn',

      /** #################################################
       *
       * Angular specific rules
       *
       * ############################################### */

      // https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/docs/rules/use-component-view-encapsulation.md
      // Disallow the use of the `ViewEncapsulation.None` in Angular components
      '@angular-eslint/use-component-view-encapsulation': 'error',
      // https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/docs/rules/use-injectable-provided-in.md
      // Require the `providedIn` property in Angular injectables
      '@angular-eslint/use-injectable-provided-in': 'warn',
      // https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/docs/rules/prefer-standalone.md
      // Enforce the creation of standalone Angular components
      // TODO: enable again
      '@angular-eslint/prefer-standalone': 'off',
      // https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/docs/rules/no-output-on-prefix.md
      // Disallow the use of the `on` prefix in Angular output bindings
      '@angular-eslint/no-output-on-prefix': 'warn',
      // https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/docs/rules/no-output-native.md
      // Disallow the use of the `native` events in Angular output bindings (like "search" or "click")
      '@angular-eslint/no-output-native': 'warn',
      // https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/docs/rules/directive-class-suffix.md
      // Directive class names should have the suffix "Directive"
      '@angular-eslint/directive-class-suffix': 'error',
      // https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/docs/rules/directive-selector.md
      // Directive selectors should be camelCase prefixed with "owl"
      '@angular-eslint/directive-selector': ['error', { type: 'attribute', prefix: ['owl'], style: 'camelCase' }],
      // https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/docs/rules/component-class-suffix.md
      // Component class names should have the suffix "Component"
      '@angular-eslint/component-class-suffix': ['error'],
      // https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/docs/rules/component-selector.md
      // Component selectors should be kebab-case prefixed with "owl"
      '@angular-eslint/component-selector': [
        'error',
        { type: ['element', 'attribute'], prefix: ['owl'], style: 'kebab-case' }
      ],
      // https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/docs/rules/no-input-rename.md
      // Disallow renaming Angular input properties
      '@angular-eslint/no-input-rename': 'warn'
    }
  },
  {
    files: ['**/*.html'],
    extends: [...ngEslint.configs.templateRecommended],
    rules: {
      // https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin-template/docs/rules/attributes-order.md
      // Enforce a specific order for component attributes in Angular templates
      '@angular-eslint/template/attributes-order': [
        'warn',
        {
          'alphabetical': true,
          'order': [
            'STRUCTURAL_DIRECTIVE',
            'TEMPLATE_REFERENCE',
            'INPUT_BINDING',
            'TWO_WAY_BINDING',
            'OUTPUT_BINDING',
            'ATTRIBUTE_BINDING'
          ]
        }
      ]
    }
  }
);
