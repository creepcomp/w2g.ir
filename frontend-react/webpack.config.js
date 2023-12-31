const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
    mode: "production",
    entry: "./src/App.jsx",
    performance: {
        hints: false,
    },
    module: {
        rules: [
            {
                test: /\.jsx/,
                exclude: /node_modules/,
                loader: "babel-loader",
                options: {
                    presets: ["@babel/preset-env", "@babel/preset-react"],
                },
            },
            {
                test: /\.css/,
                use: ["style-loader", "css-loader"],
            },
            {
                test: /\.(jpg|png)/,
                type: "asset/resource",
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: "./public/index.html",
            favicon: "./public/favicon.ico",
        }),
    ],
    devServer: {
        historyApiFallback: true,
    },
};
