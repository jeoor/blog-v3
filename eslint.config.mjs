import antfu from '@antfu/eslint-config'

export default antfu({
	ignores: [
		'pnpm-lock.yaml',
		'.nuxt/**',
		'.output/**',
		'.edgeone/**',
		'.tef_dist/**',
	],
	stylistic: {
		indent: 'tab',
	},
	pnpm: true,
}, {
	files: ['**/*.json'],
	ignores: ['content/**'],
	rules: {
		'jsonc/indent': ['error', 2],
		'style/eol-last': ['warn', 'always'],
	},
}, {
	files: ['**/*.vue'],
	// @keep-sorted
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
	files: ['**/*.{yaml,yml}'],
	rules: {
		'yaml/indent': ['error', 2],
	},
}, {
	files: ['content/**/*.json'],
	rules: {
		'jsonc/comma-dangle': ['warn', 'always'],
		'jsonc/indent': ['error', 2],
		'style/eol-last': ['warn', 'always'],
	},
}, {
	files: ['content/**/*.{md,mdc}'],
	// @keep-sorted
	rules: {
		'antfu/consistent-list-newline': 'off',
		'eqeqeq': 'off',
		'markdown/heading-increment': 'off',
		'markdown/no-multiple-h1': 'off',
		'no-sequences': 'off',
		'prefer-arrow-callback': 'off',
		'prefer-template': 'off',
		'style/indent': 'off',
		'style/no-mixed-spaces-and-tabs': 'off',
		'style/quotes': 'off',
		'style/semi': 'off',
		'unicorn/prefer-includes': 'off',
	},
})
