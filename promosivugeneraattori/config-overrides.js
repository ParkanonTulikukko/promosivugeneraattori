const { override, addLoader } = require('customize-cra');

module.exports = override(
  addLoader({
    test: /\.scss$/,
    use: [
      'style-loader',
      'css-loader',
      'sass-loader',
    ],
  }),
);