/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		"./app/**/*.{js,ts,jsx,tsx,mdx}",
		"./components/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		extend: {
		  colors: {
			orangeCustom: '#ff9e38',
			lightBlueCustom: '#5dddff',
		  },
		},
	},
	plugins: [],
};
