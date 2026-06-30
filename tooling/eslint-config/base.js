module.exports = {
	extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
	parser: "@typescript-eslint/parser",
	plugins: ["@typescript-eslint"],
	rules: {
		"@typescript-eslint/no-explicit-any": "error",
		"no-console": ["warn", { allow: ["warn", "error"] }],
	},
	ignorePatterns: ["node_modules", "dist", "build", ".next", "coverage"],
};
