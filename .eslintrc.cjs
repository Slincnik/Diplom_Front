/* eslint-env node */
require("@rushstack/eslint-patch/modern-module-resolution");

module.exports = {
  root: true,
  env: {
    node: true,
    "vue/setup-compiler-macros": true,
  },
  parser: "vue-eslint-parser",
  parserOptions: {
    parser: "@typescript-eslint/parser",
    ecmaVersion: "latest",
    sourceType: "module",
  },
  plugins: ["prettier", "@typescript-eslint"],
  extends: [
    "plugin:vue/vue3-essential",
    "eslint:recommended",
    "@vue/eslint-config-typescript",
    "@vue/eslint-config-prettier",
  ],
  rules: {
    // "@typescript-eslint/no-unused-vars": "error",
    // "no-console": "error",
    // "no-debugger": "error",
    // "no-extra-semi": "off",
    // "comma-dangle": ["error", "always-multiline"],
    // "arrow-parens": ["error", "as-needed"],
    // "prettier/prettier": "error",
    // "vue/html-self-closing": [
    //   "error",
    //   {
    //     html: {
    //       void: "always",
    //       normal: "always",
    //       component: "always",
    //     },
    //     svg: "always",
    //     math: "always",
    //   },
    // ],
  },
  ignorePatterns: ["dist"],
};
