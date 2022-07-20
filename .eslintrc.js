require("@rushstack/eslint-patch/modern-module-resolution");

module.exports = {
  extends: ["@inrupt/eslint-config-react"],
  parserOptions: {
    project: "./tsconfig.eslint.json",
  },
  rules: {
    "import/prefer-default-export": 0,
    "max-classes-per-file": 0,
    "no-shadow": [1, { allow: ["NotificationOptions"] }],
    // This is required to group methods by event type
    // rather than method name in WebsocketNotification
    "@typescript-eslint/adjacent-overload-signatures": 0
  },
};
