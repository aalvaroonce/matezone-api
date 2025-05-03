module.exports = {
    env: {
      node: true,
      es2021: true
    },
    extends: [
      "eslint:recommended",
      "prettier" // Desactiva reglas de ESLint que chocan con Prettier
    ],
    parserOptions: {
      ecmaVersion: "latest",
      sourceType: "module"
    },
    rules: {
      indent: ["error", 4],
      quotes: ["error", "double"],
      semi: ["error", false],
      "comma-dangle": ["error", "never"],
      "object-curly-spacing": ["error", "always"]
    }
  }
  