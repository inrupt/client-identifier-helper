require("@rushstack/eslint-patch/modern-module-resolution");

module.exports = {
  extends: ["@inrupt/eslint-config-react", "@inrupt/eslint-config-lib"],
  parserOptions: {
    project: "./tsconfig.eslint.json",
  },
  rules: {
    "react/jsx-filename-extension": [
      1,
      {
        extensions: [".tsx"],
      },
    ],
  },
};
