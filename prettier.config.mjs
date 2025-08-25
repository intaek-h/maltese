/**
 * @see https://prettier.io/docs/configuration
 * @type {import("prettier").Config}
 */
const config = {
  trailingComma: 'es5',
  tabWidth: 2,
  printWidth: 120,
  semi: false,
  singleQuote: true,
  plugins: ['prettier-plugin-tailwindcss'],
}

export default config
