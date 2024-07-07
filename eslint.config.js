// @ts-check
const eslint = require("@eslint/js");
const tseslint = require("typescript-eslint");
const angular = require("angular-eslint");
const typescriptEslintParser = require("@typescript-eslint/parser");

module.exports = tseslint.config(
  {
    files: ["**/*.ts"],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.stylistic,
      ...angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      "semi": "error",
      "comma-dangle": "error",
      "no-nested-ternary": "error",
      "prefer-template": "error",
      "object-shorthand": "warn",
      "@angular-eslint/use-injectable-provided-in": "error",
      "@angular-eslint/prefer-standalone-component": "error",
      "@angular-eslint/no-output-on-prefix": "warn",
      "@angular-eslint/no-output-native": "warn",
      "@angular-eslint/directive-selector": [
        "error",
        {
          type: "attribute",
          prefix: "owl",
          style: "camelCase",
        },
      ],
      "@angular-eslint/component-selector": [
        "error",
        {
          type: ["element", "attribute"],
          prefix: "owl",
          style: "kebab-case",
        },
      ],
    },
  },
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: typescriptEslintParser,
      parserOptions: {
        project: true,
        tsconfigRootDir: __dirname
      }
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/prefer-optional-chain": "warn",
      "@typescript-eslint/explicit-function-return-type": [
        "warn",
        {
          "allowExpressions": true
        }
      ],
      "@typescript-eslint/explicit-member-accessibility": [
        "warn",
        {
          "accessibility": "explicit",
          "overrides": {
            "constructors": "no-public"
          }
        }
      ],
      "@typescript-eslint/class-literal-property-style": "off",
      "@typescript-eslint/no-empty-interface": "warn",
      "@typescript-eslint/no-misused-new": "error",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          "argsIgnorePattern": "^_",
          "varsIgnorePattern": "^_"
        }
      ],
      "@typescript-eslint/array-type": [
        "warn",
        {
          "default": "generic"
        }
      ],
    }
  },
  {
    files: ["**/*.html"],
    extends: [
      ...angular.configs.templateRecommended,
      // ...angular.configs.templateAccessibility,
    ],
    rules: {
      "@angular-eslint/template/attributes-order": [
        "warn",
        {
          "alphabetical": true,
          "order": [
            "STRUCTURAL_DIRECTIVE",
            "TEMPLATE_REFERENCE",
            "INPUT_BINDING",
            "TWO_WAY_BINDING",
            "OUTPUT_BINDING",
            "ATTRIBUTE_BINDING"
          ]
        }
      ]
    },
  }
);
