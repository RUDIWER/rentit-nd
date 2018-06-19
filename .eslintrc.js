module.exports = {
	extends: 'prettier',
	parserOptions: {
		ecmaVersion: 8
	},
	rules: {
		indent: [ 2, 'tab' ],
		'no-tabs': 0,
		strict: 'off',
		semi: [ 'error', 'never' ],
		'comma-dangle': [ 'error', 'never' ],
		'class-methods-use-this': 'off',
		'object-curly-newline': [ 'error', { multiline: true } ],
		'global-require': 'off',
		'arrow-parens': [ 'error', 'always' ],
		'no-param-reassign': [ 'error', { props: false } ]
	},
	globals: {
		use: true
	}
}
