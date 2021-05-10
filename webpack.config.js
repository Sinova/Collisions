const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
	entry : './demo/index.mjs',

	plugins : [
		new HtmlWebpackPlugin({
			filename : 'index.html',
			title    : 'Collisions - Collision detection for circles, polygons, and points',
		}),
	],

	output : {
		path     : `${__dirname}/docs/demo/`,
		filename : 'index.js',
	},
};
