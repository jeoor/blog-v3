import zin from '@zinkawaii/stylelint-config'

export default zin({
	// @keep-sorted
	rules: {
		'@stylistic/indentation': 'tab',
		'media-feature-range-notation': 'prefix',
		'selector-class-pattern': '^_*[a-zA-Z][a-zA-Z0-9]*(-[a-zA-Z0-9]+)*(_{2}[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*)?(-{2}[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*)?$',
	},
})
