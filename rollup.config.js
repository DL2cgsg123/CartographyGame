const eslint = require("@rollup/plugin-eslint");
const resolve = require("@rollup/plugin-node-resolve");
const commonjs = require("@rollup/plugin-commonjs");
const string = require("rollup-plugin-string").string;

module.exports = {
  input: "src/main.js",
  output: {
    dir: "dist",
    format: "iife",
    sourcemap: "inline",
  },
  plugins: [
    string({
      include: "**/*.txt",
    }),
    eslint({
      exclude: ["src/*.txt"],
    }),
    resolve({
      jsnext: true,
      main: true,
      browser: true,
    }),
    commonjs(),
  ],
};