module.exports = {
  parserOptions: {
    ecmaVersion: 9,
    sourceType: "module",
    allowImportExportEverywhere: false
  },
  env: {
    browser: false,
    node: true
  },
  extends: ["eslint:recommended"],
  plugins: ["prettier"],
  rules: {
    eqeqeq: ["error", "always"],
    semi: ["error", "always"],
    quotes: ["error", "single", { avoidEscape: true }],
    "no-console": "off",
    "comma-dangle": [
      "error",
      {
        arrays: "always",
        objects: "always",
        imports: "always",
        exports: "always",
        functions: "ignore"
      }
    ],
    "linebreak-style": ["error", "unix"]
  }
};
