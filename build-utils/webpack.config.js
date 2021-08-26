const path = require('path')
const { merge } = require('webpack-merge')

const HtmlWebpackPlugin = require('html-webpack-plugin')

const parts = require('./webpack.parts')
const constants = require('./webpack.constants')

const prodBundleConfig = merge([
	{
		mode: 'production',
		devtool: 'source-map',
		entry: {
			vizCharts: constants.PATHS.bundleIndex
		},
		output: {
			path: path.resolve(__dirname, '..', './dist'),
			filename: '[name].min.js',
		},
	},
	parts.babelLoader(),
	parts.cssLoader(),
	parts.externals(),
])

const devConfig = merge([
	{
		mode: 'development',
		devtool: 'eval-source-map',
		entry: constants.DEMOS,
		output: {
			path: path.resolve(__dirname, '..', './demos/build'),
			filename: '[name].js',
		},
		devServer: {
			contentBase: path.resolve(__dirname, '..', './demos/build'),
			port: 8001,
			inline: true,
			hot: true,
			open: true,
		},
		plugins: [
			new HtmlWebpackPlugin({
				title: 'Development',
				template: path.resolve(__dirname, '..', './src/demos/index.html')
			})
		],
	},
	parts.cssLoader(),
	parts.babelLoader(),
])

module.exports = ({env}) => {
	if (env === 'dev') {
		return devConfig
	}

	if (env === 'production') {
		return prodBundleConfig
	}
}
