import antfu from '@antfu/eslint-config'

export default antfu({
	ignores: ['*.yaml'],
	stylistic: {
		indent: 'tab',
	},
	pnpm: true,
	// @keep-sorted
	rules: {
		'@stylistic/linebreaks': 'off',
		'e18e/prefer-static-regex': 'warn',
		'style/linebreaks': 'off',
		'yaml/indent': ['error', 2],
	},
}, {
	files: ['**/*.vue'],
	rules: {
		'vue/block-lang': ['warn', {
			script: { lang: ['ts', 'tsx'] },
			style: { lang: ['scss'] },
		}],
		'vue/enforce-style-attribute': ['warn', {
			allow: ['scoped'],
		}],
		'vue/html-indent': ['error', 'tab', { baseIndent: 0 }],
	},
}, {
	files: ['**/*.json', '**/*.jsonc', '**/*.json5'],
	ignores: ['content/**'],
	rules: {
		'jsonc/indent': ['error', 2],
		'style/eol-last': ['warn', 'never'],
	},
}, {
	files: ['content/**'],
	// @keep-sorted
	rules: {
		'antfu/consistent-list-newline': 'off',
		'eqeqeq': 'off',
		'markdown/no-multiple-h1': 'off',
		'no-irregular-whitespace': 'off',
		'no-sequences': 'off',
		'prefer-arrow-callback': 'off',
		'prefer-template': 'off',
		'style/indent': 'off',
		'style/no-mixed-spaces-and-tabs': 'off',
		'style/quotes': 'off',
		'style/semi': 'off',
		'unicorn/prefer-includes': 'off',
	},

}, {
	files: ['nuxt.config.ts', 'scripts/**/*.ts'],
	rules: {
		'node/prefer-global/buffer': 'off',
		'node/prefer-global/process': 'off',
	},
})
