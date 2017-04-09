var path = require("path");

module.exports = {
    entry: {
        "greenup": path.resolve(__dirname, "src") + "/greenup.js",
        "login": path.resolve(__dirname, "src") + "/login.js"

    },
    output: {
        filename: "[name].bundle.js",
        path: path.resolve(__dirname, "dist/js")
    },
    module: {
        loaders: [
            // required to write "require("./style.css")"
            {test: /\.css$/, loader: "style-loader!css-loader"},
            {
                test: /\.jsx?$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: "babel-loader",
                    options: {
                        plugins: ["transform-runtime"],
                        presets: ["es2015", "stage-0", "react"]
                    }
                }
            },
            {test: /\.(jpe?g|png|gif|svg)$/i, loader: "file-loader?name=../images/[name].[ext]"}
        ]
    }
};
