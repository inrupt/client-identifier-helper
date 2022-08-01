require("@rushstack/eslint-patch/modern-module-resolution");

module.exports = {
  root: true,

  extends: [
    "@inrupt/eslint-config-react",
    "@inrupt/eslint-config-lib",
    "plugin:import/typescript",
  ],

  parserOptions: {
    project: "./tsconfig.eslint.json",
  },

  // These settings and the `plugin:import/typescript` are required until we add
  // this configuration to our @inrupt/eslint-config-lib base
  settings: {
    "import/parsers": {
      "@typescript-eslint/parser": [".ts", ".tsx"],
    },
    "import/resolver": {
      typescript: {
        alwaysTryTypes: true,
        project: "./tsconfig.eslint.json",
      },
    },
  },

  rules: {
    "react/jsx-filename-extension": [
      "error",
      {
        extensions: [".tsx"],
      },
    ],
    // fix for https://github.com/typescript-eslint/tslint-to-eslint-config/issues/856
    "no-shadow": "off",
    "@typescript-eslint/no-shadow": ["error"]
  },
};
