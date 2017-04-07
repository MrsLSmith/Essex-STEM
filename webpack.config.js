var path = require('path');

module.exports = {
  entry: {
                    "greenup": path.resolve(__dirname, 'src')+"/greenup.js",
                    "app": path.resolve(__dirname, 'src')+"/App.js"

                  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    loaders: [
      // required to write "require('./style.css')"
                  {test: /\.css$/, loader: "style-loader!css-loader"},
                  {
                    test: /\.svg$/,
                    loaders: [ 'babel-loader',
                      {
                        loader: 'react-svg',
                        query: {
                          svgo: {
                            plugins: [{removeTitle: false}],
                            floatPrecision: 2
                          }
                        }
                      }
                    ]
                  },      {
         test: /\.jsx?$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            plugins: ['transform-runtime'],
                   presets: ['es2015', 'stage-0', 'react'],          }
        }
      }
    ]
  }
};
