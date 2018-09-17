const webpack = require('webpack');

/**
 * Start the javascript build
 * @return {[Object]} configuration data for webpack
 */
function webpackConfig() {

	let config = {
		mode: 'development',
		entry: {
			app: './src/js/app.js',
    		vendor: './src/js/vendor.js'
		},
		output: {
			path: __dirname + '/dist/js',
			filename: '[name].js',
			chunkFilename: '[name].js'
		},
		module: {
			rules: [
				{
					test: /\.js$/,
					exclude: /node_modules/,
					use: ['babel-loader', 'eslint-loader']
				},
				{
					test: /\.css$/,
					use: ['style-loader', 'css-loader']
				}
			]
		},
		plugins: [
			new webpack.ProvidePlugin({
				jQuery: 'jquery',
				$: 'jquery',
				'window.jQuery': 'jquery',
				Tether: 'tether',
				'window.Tether': 'tether',
				Popper: ['popper.js', 'default']
			})
		]
	};
	
  	return config;
}

module.exports = webpackConfig;
