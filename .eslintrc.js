// @ts-check

/**
 * @type {import('eslint').ESLint.ConfigData}
 */
const config = {
  extends: [
    "plugin:@trevorblades/node",
    "plugin:@trevorblades/typescript",
    "plugin:@trevorblades/graphql",
    "plugin:prettier/recommended",
  ],
  rules: {
    "@typescript-eslint/consistent-type-imports": "warn",
  },
};

module.exports = config;
