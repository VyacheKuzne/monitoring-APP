module.exports = {
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
  plugins: ["@typescript-eslint", "prettier"],
  rules: {
    "prettier/prettier": ["error", { endOfLine: "lf" }],
    "@typescript-eslint/no-unsafe-member-access": "off", // Отключение предупреждения для unsafe member access
    "@typescript-eslint/no-unsafe-assignment": "off", // Отключение предупреждения для unsafe assignment
    "@typescript-eslint/no-unsafe-call": "off", // Отключение предупреждения для unsafe call
    "@typescript-eslint/restrict-template-expressions": "off", // Отключение предупреждений для использования шаблонных строк
  },
};
