const path = require('path');

module.exports = {
  "mode": "production",
  "entry": "./src/typeahead.js",
  "output": {
    "path": path.resolve(__dirname, "dist"),
    "filename": "typeahead.js",
    "library": "typeahead",
    "libraryExport": "default" ,   // to export only the default fn
    "libraryTarget": "umd",
    "globalObject": "this"
  },
  "devtool": "source-map",
  "module": {
    "rules": [
      {
        "enforce": "pre",
        "test": /\.(js|jsx)$/,
        "exclude": /node_modules/,
        "use": "eslint-loader"
      },
      {
        "test": /\.js$/,
        "exclude": /node_modules/,
        "use": {
          "loader": "babel-loader",
          "options": {
            "presets": [
              "@babel/preset-env"
            ],
            plugins: ["@babel/plugin-transform-runtime"],
          }
        }
      },
      {
        "test": /\.less$/,
        "use": [
          "style-loader",
          "css-loader",
          "less-loader"
        ]
      }
    ]
  }
}