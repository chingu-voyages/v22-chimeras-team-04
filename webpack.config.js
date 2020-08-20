const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");


const webpack = require('webpack');
const path = require('path');

module.exports = {
  mode: "development",
  entry: "./src/index.js",
    
  devtool: "source-map",
  devServer: {
    contentBase: path.join(__dirname, "dist"),
    watchContentBase: true,
    hot: true,
    open: true,
    inline: true,
  },

  plugins: [
    new HtmlWebpackPlugin({
      title: "Webpack Email Cleaner starter",
      template: path.resolve("./index.html"),
    }),
    new webpack.HotModuleReplacementPlugin(),
    new MiniCssExtractPlugin({
      filename: "[name].css",
      chunkFilename: "[id].css"
    }),
    // new MinifyPlugin()
  ],

  module: {
    rules: [     
      {
        test: /\.s[ac]ss$/i,
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader",
          "sass-loader",
        ],
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
          },
        },
      },
      {
        test: /\.(jpg|jpeg|gif|png|svg|webp)$/,
        use: [
          {
            loader: "file-loader",
            options: {
              outputPath: "./images",
              name: "[name].[ext]",
            },
          },
        ],
      },
      {
        test: /\.html$/,
        use: {
          loader: "html-loader",
        },
      }
    ],
  },
};