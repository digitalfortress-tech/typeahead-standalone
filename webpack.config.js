const path = require('path');

module.exports = {
  "mode": "production",
  "entry": "./src/typeahead-standalone.ts",
  "output": {
    "path": path.resolve(__dirname, "dist"),
    "filename": "typeahead-standalone.js",
    "library": "typeaheadStandalone",
    "libraryExport": "default" ,   // to export only the default fn
    "libraryTarget": "umd",
    "globalObject": "this"
  },
  "devtool": "source-map",
  "module": {
    "rules": [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        "enforce": "pre",
        "test": /\.(js|jsx)$/,
        "exclude": /node_modules/,
        "use": "eslint-loader"
      },
      // {
      //   "test": /\.js$/,
      //   "exclude": /node_modules/,
      //   "use": {
      //     "loader": "babel-loader",
      //     "options": {
      //       "presets": [
      //         "@babel/preset-env"
      //       ],
      //       plugins: ["@babel/plugin-transform-runtime"],
      //     }
      //   }
      // },
      {
        "test": /\.less$/,
        "use": [
          "style-loader",
          "css-loader",
          "less-loader"
        ]
      }
    ]
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ],
  },
}