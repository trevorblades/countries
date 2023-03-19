module.exports = {
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
