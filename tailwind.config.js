const flowbite = require('flowbite-react/tailwind');

module.exports = {
  theme: {},
  content: ['./src/renderer/**/*.{js,jsx,ts,tsx}', flowbite.content()],
  purge: {
    content: ['./src/renderer/**/*.{js,jsx,ts,tsx}', flowbite.content()],
  },
  variants: {},
  plugins: [flowbite.plugin()],
};
