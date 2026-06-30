module.exports = {
	extends: [
		"./base.js",
		"plugin:react/recommended",
		"plugin:react-hooks/recommended",
	],
	parserOptions: {
		ecmaVersion: "latest",
		sourceType: "module",
		ecmaFeatures: {
			jsx: true,
		},
	},
	settings: {
		react: {
			version: "detect",
		},
	},
	rules: {
		"react/react-in-jsx-scope": "off",
		"react-hooks/rules-of-hooks": "error",
		"react-hooks/exhaustive-deps": "warn",
	},
};
