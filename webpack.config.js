'use strict';

var webpack = require('webpack'),
    HtmlWebpackPlugin = require('html-webpack-plugin'),
    autoprefixer = require('autoprefixer'),
    ngAnnotatePlugin = require('ng-annotate-webpack-plugin'),
    StringReplacePlugin = require('string-replace-webpack-plugin'),
    CopyWebpackPlugin = require('copy-webpack-plugin'),
    DashboardPlugin = require('webpack-dashboard/plugin');

// env based config file
var arg = process.argv[2];
var env;
if (arg === '--dev'){
  env = 'dev';
} else if (arg === '--prod'){
  env = 'prod';
} else {
  env = 'local';
}

let configFile = '../config/config.ts';
if (env != 'local') {
  configFile = '../config/config.' + env + '.ts';
}

var webpackConfig = {

  entry: {
    app: './app/core/bootstrap.ts',
    vendor: ['angular', 'angular-route', 'angular-sanitize', 'angular-ui-bootstrap', 'highcharts',
             'highcharts-ng', 'lodash', 'restangular', 'nprogress', 'intro.js', './app/lib/locache.js',
             'bootstrap-loader', './app/lib/lib.scss']
  },

  output: {
    path: __dirname + '/dist',
    filename: 'bundle.js'
  },

  resolve: {
    extensions: ['', '.webpack.js', '.web.js', '.ts', '.js']
  },

  node: {
    fs: "empty"
  },

  module: {

    preloaders: [
      {
        test: /\.ts$/,
        loader: 'tslint'
      }
    ],

    loaders: [
      {
        test: require.resolve("./app/lib/locache.js"),
        loader: "imports?this=>window"
      },
      {
        test: /\.html$/,
        loader: 'html-loader'
      },
      {
        test: /\.ts$/,
        loader: 'ts-loader'
      },
      {
        test: /\.scss$/,
        loader: 'style!css!postcss!sass'
      },
      {
        test: /bootstrap-sass\/assets\/javascripts\//,
        loader: 'imports?jQuery=jquery'
      },
      {
        test: /\.(eot|woff|woff2|ttf|svg|png|jpe?g|gif)(\?\S*)?$/,
        loader: 'file'
      },
      {
        test: require.resolve("./app/common/config.ts"),
        loader: StringReplacePlugin.replace({
          replacements: [
            {
              pattern: /__CONFIG_FILE__/ig,
              replacement: function(){
                return configFile;
              }
            },
            {
              pattern: /__ENV__/ig,
              replacement: function(){
                return env;
              }
            }
          ]
        })
      }
    ]
  },

  tslint: {
    emitErrors: true,
    failOnHint: true
  },

  postcss: function() {
    return [autoprefixer];
  },

  plugins: [
    new webpack.ProvidePlugin({
      jQuery: "jquery"
    }),
    new ngAnnotatePlugin({add: true}),
    new StringReplacePlugin(),
    new webpack.optimize.CommonsChunkPlugin(/* chunkName= */"vendor", /* filename= */"vendor.bundle.js"),
    new HtmlWebpackPlugin({
      filename: './index.html',
      template: './app/index.html',
      inject: true,
      hash: true
    }),
    new CopyWebpackPlugin([
      {
        from: './app/assets',
        to: 'assets'
      }
    ])
  ]
};

if (env == 'local') {
  webpackConfig.plugins = webpackConfig.plugins.concat([new DashboardPlugin()]);
}

if (env == 'prod') {
  webpackConfig.plugins = webpackConfig.plugins.concat([
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }})
  ]);
} else {
  webpackConfig.plugins = webpackConfig.plugins.concat([
    new webpack.SourceMapDevToolPlugin({
      filename: '[file].map',
      exclude: ['vendor.bundle.js']
    }),
  ]);
}


module.exports = webpackConfig;
